## Context

LottoZavis is Node/Express + React. Draw cache lives at `data/lotto-draws.json`. Predictor uses `POST /api/predict` → `predictEngine` weighted-random sampling with profile names that currently look like ML (`random_forest`, `xgboost`, `lstm`) but are not trained. Wiki POLICY and `lotto-predictor` forbid fabricated win metrics and ML win claims.

This change adds a **real** sklearn Random Forest path as a Predictor subsection, trained locally on refresh, with honest R² + hit-count metrics—while renaming weight profiles so naming stays truthful.

## Goals / Non-Goals

**Goals:**

- Per-number appearance-score RF (main-6 only, all rounds) → top-6 candidate.
- Train/cache on ingest & refresh; predict from cache only.
- Expose R² (holdout) and backtest hit-count in UI + API.
- Predictor mode toggle: stats vs ML; save ML results to Firestore history.
- Rename weight-profile `modelType` values to non-ML identifiers.

**Non-Goals:**

- New top-level tab; blog-style flattened 1D number stream.
- Window-specific ML models (30/60/…); bonus-inclusive ML targets.
- Cloud/production Python packaging beyond “local install allowed”.
- Claiming improved win probability; fake precision/recall/F1.
- Training XGBoost/LSTM in this change (UI can reserve future method slots).

## Decisions

### 1. Feature / label formulation (approach A)

For each historical round `t` used as a training row context, build features for each number `n ∈ 1..45` from **prior** draws only (no leakage), **bonus excluded**:

- Rolling frequency over lookback `W=50` (main 6 counts in last W draws before `t`)
- `drawsSince` last main-6 appearance before `t`
- Zone one-hot (1–15 / 16–30 / 31–45)
- Parity (odd/even)
- Optional light context: prior-draw sum and oddCount (from `t-1` main 6)

**Label:** `y = 1` if `n` appears in round `t` main 6, else `0`.

**Inference:** For “next” round after latest cached draw, score all 45 numbers; take top 6 unique sorted ascending.

**Rationale:** Aligns with hit-count evaluation and avoids the blog’s cross-draw stream artifact. Binary labels with RF regressor (predicting continuous score in [0,1]-ish) or `RandomForestClassifier` both work; prefer **Classifier + `predict_proba`** for clearer “appearance score”, with R² reported on holdout predicted probabilities vs labels (or equivalently document `r2` on continuous scores if Regressor is chosen). Default implementation: **`RandomForestClassifier`** with probability scores; metrics JSON still includes a field named `r2` computed as sklearn `r2_score(y_true, y_proba)` on holdout for UI parity with the product request.

**Alternatives considered:** Blog MultiOutputRegressor on 5→6 stream (rejected—misleading). Multi-output regress 6 balls (weaker hit-count story).

### 2. Train / eval split

- Chronological holdout: last **20%** of sample rounds for metrics (no shuffle across time).
- Backtest: for each holdout round, take top-6 from scores → `hit = |pred ∩ actual|`; store `hitMean`, `hitStd`, optional histogram buckets 0–6.
- Full-data refit after metrics for the **serving** model (train on all eligible samples), tagged with `latestRound` from cache.

**Alternatives:** Walk-forward only (heavier); random `train_test_split` (rejected—time leakage).

### 3. Cache layout & Python bridge

```
ml/
  requirements.txt
  train_rf.py          # reads data/lotto-draws.json, writes artifacts
  predict_rf.py        # optional CLI; Node may load metrics + call predict script
data/ml/
  rf_model.joblib      # gitignored
  rf_metrics.json      # r2, hitMean, hitStd, hitHist, trainedAt, latestRound, sampleCount, bonusIncluded:false
```

Express after successful `ensureLottoData` incremental path / `incrementalRefresh` / `POST /api/admin/refresh`:

1. Spawn `python ml/train_rf.py` (or `py` / `python3` resolution).
2. On non-zero exit or missing Python: log warning; **do not fail** draw refresh.
3. APIs:
   - `GET /api/ml/rf/status` → metrics + whether model file exists
   - `POST /api/ml/rf/predict` → `{ numbers, method: "random-forest-ml", metrics snapshot, latestRound, trainedAt }` or 503 if no cache

**Alternatives:** Always-on FastAPI sidecar (deferred). Pure JS RF (rejected—user wants sklearn/local Python).

### 4. Predictor UX

- Mode toggle at top of Predictor: `stats` | `ml-rf`.
- Stats mode: existing weighted-random UI (renamed profiles).
- ML mode: show cache status, R², hitMean (and short hit distribution), disclaimer, generate button → `POST /api/ml/rf/predict`; no odd/even/hot-cold biases on ML path (v1).
- Save: extend `savePrediction` with `method: "random-forest-ml" | "weighted-random"`, store `modelType: "random_forest_ml"` or similar, plus `r2`/`hitMean` optional snapshot fields (not fake confidence %).

### 5. Weight profile rename (**BREAKING** for clients sending old enums)

| Old | New | Behavior (unchanged) |
|-----|-----|----------------------|
| `random_forest` | `mid_range` | slight boost 10–38 |
| `xgboost` | `freq_tilt` | boost above-median freq |
| `lstm` | `absence_tilt` | boost high absence |

Server accepts **only** new names (or temporarily accept old with deprecation map for one release—prefer hard cut in this local app).

Update HowTo / any copy that says Random Forest engine for the stats path.

### 6. `.gitignore`

Ignore `data/ml/*.joblib` (and optionally entire `data/ml/` except `.gitkeep`). Keep regenerating via refresh.

## Risks / Trade-offs

- **[Risk] Users interpret R²/hit as win odds** → Mitigation: fixed disclaimer in ML panel + POLICY-aligned copy; no % “confidence”.
- **[Risk] Python missing on machine** → Mitigation: refresh succeeds; ML status `available: false`; UI explains install `ml/requirements.txt`.
- **[Risk] Train time on full history** → Mitigation: RF with modest `n_estimators` (e.g. 100–150); async spawn after refresh; status endpoint while training optional later.
- **[Risk] Profile rename breaks saved Firestore docs with old `modelType`** → Mitigation: history display maps unknown/legacy labels; new saves use new enums / ML method.
- **[Risk] Leakage if features use current round** → Mitigation: features strictly from draws with `round < t`.

## Migration Plan

1. Ship rename + ML APIs + Python scripts; gitignore model binaries.
2. Run `npm run refresh:lotto` (or admin refresh) once locally to populate `data/ml/`.
3. No DB migration; Firestore schema is additive.
4. Rollback: remove ML mode UI and `/api/ml/*`; restore profile names only if needed (prefer keep new names).

## Open Questions

- Exact `W` lookback (default **50**) — tunable constant in `train_rf.py`.
- Whether to show feature-importance chart in v1 (defer unless time allows).
- Windows Python launcher (`py -3` vs `python`) — resolve at runtime with fallback list.

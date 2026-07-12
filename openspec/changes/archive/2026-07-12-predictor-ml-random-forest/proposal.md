## Why

Predictor today offers only statistical weighted-random recommendations, while `modelType` labels like `random_forest` imply trained ML without any learning. Users want a real Random Forest experiment (honest metrics, cached model) alongside the existing stats path—without claiming improved win probability.

## What Changes

- Add a **Predictor ML subsection** (mode toggle: 통계 가중 추천 | 랜덤포레스트 ML) that loads a cached sklearn Random Forest model and produces a next-draw 6-ball candidate.
- Train on **all historical draws**, **bonus-excluded (main 6 only)**, with per-number appearance scores → top-6 selection (not the blog’s flattened 1D stream).
- On successful `ingest` / `incrementalRefresh` / admin refresh, spawn local Python training and write model + metrics under `data/ml/`.
- Surface **holdout R²** and **backtest hit-count** (predicted 6 ∩ actual 6) in the ML subsection UI.
- **BREAKING (API/UI rename):** Rename Predictor weight-profile `modelType` values from `random_forest` / `xgboost` / `lstm` to non-ML names (e.g. `mid_range` / `freq_tilt` / `absence_tilt`) so they no longer collide with the trained RF path.
- Persist ML recommendations to Firestore prediction history with an explicit method such as `random-forest-ml`.
- Keep wiki POLICY tone: experimental reference only; R² ≠ win probability; no fabricated confidence %.

## Capabilities

### New Capabilities

- `predictor-ml-rf`: Train/cache Random Forest on draw history, serve ML status + predict APIs, expose metrics (R², hit-count), and Predictor ML subsection UX including history save.

### Modified Capabilities

- `lotto-predictor`: Rename weight-profile `modelType` identifiers; clarify coexistence of weighted-random vs cached RF ML; allow history entries with ML method metadata.

## Impact

- **Server:** `ingest`/`refresh` hooks; new `/api/ml/rf/*` endpoints; Python child process; `data/ml/` artifacts (gitignored binary model optional; metrics JSON tracked or ignored per design).
- **Client:** `PredictorTab` mode toggle + ML panel; `ModelType` / Firebase save fields; HowTo/Footer copy cleanup for profile rename.
- **Deps:** Local Python 3 + `scikit-learn`, `numpy`, `joblib` via `ml/requirements.txt` (local-first; skip train with warning if Python missing).
- **Specs:** New `predictor-ml-rf`; delta on `lotto-predictor`.

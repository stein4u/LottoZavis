## Context

Predictor already has three conceptual layers brewing: statistical weighted-random, cached sklearn Random Forest (`predictor-ml-rf`), and now a Keras/TensorFlow LSTM experiment inspired by [tykimos deep-lotto](https://tykimos.github.io/2020/01/25/keras_lstm_lotto_v895/). Draw cache is `data/lotto-draws.json`. RF trains on refresh; LSTM must **not**—manual `npm run train:lstm` only. Wiki POLICY forbids win claims; the source article itself stresses independent trials and immediate overfitting.

## Goals / Non-Goals

**Goals:**

- Three Predictor modes: `stats` | `ml-rf` | `ml-lstm`.
- Sequence-window LSTM on main-6 multi-hot (bonus excluded); cache under `data/ml/`.
- Metrics: hit-count, val-loss/overfit summary, rank/prize simulation.
- Status + predict APIs; Firestore `method: "lstm-ml"`.

**Non-Goals:**

- Train LSTM on ingest/refresh.
- Bonus-inclusive targets; claiming improved win odds.
- Exact reproduction of timestep=1 stateful-only article (we reinforce with a sequence window).
- GPU/cloud TF packaging beyond local install.

## Decisions

### 1. Sequence representation (windowed, not single-step stateful)

Each sample:

- **X:** last `K=10` draws as multi-hot vectors → shape `(K, 45)` (main 6 only).
- **Y:** next draw multi-hot `(45,)` multi-label.

Model sketch:

```
Input (batch, K, 45)
  → LSTM(128, return_sequences=False)   # non-stateful; window carries history
  → Dense(45, sigmoid)
loss = binary_crossentropy
```

**Inference:** score latest window ending at cached last draw → 45 probabilities → **top-6 sorted** for deterministic API (UI may note article used weighted sampling; v1 prefers reproducible top-6). Optional seedable weighted sampling deferred.

**Rationale:** Windowed non-stateful LSTM is easier to serve from Node (no batch=1 state dance) while keeping the article’s multi-hot + sigmoid multi-label idea. Alternatives: exact stateful timestep=1 (rejected for ops complexity); RF-style tabular features (out of scope—this is the LSTM path).

### 2. Manual train only

```
npm run train:lstm  →  node/tsx or python entry → ml/train_lstm.py
writes:
  data/ml/lstm_model.keras (or SavedModel dir)   # gitignored
  data/ml/lstm_metrics.json
```

Do **not** call train from `ingest`/`incrementalRefresh` (RF may keep its own hook). Predict APIs read cache only; 503 if missing with message to run `npm run train:lstm`.

**Rationale:** TF training is minutes+; coupling to refresh would stall admin refresh.

### 3. Metrics (all three)

Chronological split (e.g. train 70% / val 15% / test 15% of windows, or fixed index bands scaled to current round count):

1. **hitMean / hitStd / hitHist** on holdout/test: top-6 vs actual main 6.
2. **valLoss curve summary:** `bestValLoss`, `finalValLoss`, `overfitNote` (e.g. whether val loss rises early)—store last-N epoch losses optionally truncated.
3. **prizeSim:** mean rank bucket + mean simulated prize using simplified prize table (article-style averages or fixed table from recent history); document assumptions in metrics JSON (`prizeAssumptions`).

No fabricated precision/recall/F1 %. Accuracy alone is discouraged in UI (class imbalance); prefer hit + loss + prize.

### 4. Server / client surface

- `GET /api/ml/lstm/status` → `{ available, metrics }`
- `POST /api/ml/lstm/predict` → `{ numbers, method: "lstm-ml", ...metric snapshot, latestRound, trainedAt }`
- Python predict script spawned like RF, or load metrics in Node and spawn predict only.
- PredictorTab: three buttons; LSTM panel shows the three metric families + disclaimer + generate.
- `SavedPrediction.method`: `"weighted-random" | "random-forest-ml" | "lstm-ml"`.

### 5. Dependencies

- Extend `ml/requirements.txt` or add `ml/requirements-lstm.txt` (tensorflow, numpy) so RF-only installs stay lighter if desired.
- Default: separate `requirements-lstm.txt` + docs in HowTo / script README comment.

### 6. Defaults (tunable constants)

| Constant | Default |
|----------|---------|
| `K` (window) | 10 |
| LSTM units | 128 |
| epochs | 40 (early stop on val loss patience 5) |
| batch size | 32 |

## Risks / Trade-offs

- **[Risk] Heavy TF install / slow train** → Mitigation: manual script; separate requirements file; clear UI when cache cold.
- **[Risk] Users treat LSTM as “smarter than RF”** → Mitigation: show overfit note + independent-trial disclaimer; compare metrics side by side without ranking “best for winning”.
- **[Risk] Prize simulation misleading** → Mitigation: label as simplified historical averages, not real payout guarantee.
- **[Risk] Top-6 vs article sampling differs** → Mitigation: document in design/HowTo; optional later toggle.

## Migration Plan

1. Ship scripts + APIs + third mode; gitignore model binaries.
2. Operators run `pip install -r ml/requirements-lstm.txt` then `npm run train:lstm` once.
3. Rollback: hide LSTM mode / remove routes; RF and stats unchanged.

## Open Questions

- Exact prize table source (static constants vs compute from `lotto-draws` prize fields if absent—draws JSON has no prize today → **use documented static mean-prize constants** inspired by the article).
- Whether to store full loss arrays or summary scalars only (prefer **summary + short array ≤ 40**).

## Why

Predictor already offers statistical weighted-random and a cached Random Forest experiment, but users also want a deep-learning path aligned with public Keras LSTM lotto tutorials—framed honestly as an independent-trial experiment, not a win system. Adding LSTM completes a clear three-mode Predictor story (stats / RF / LSTM) after RF shipped.

## What Changes

- Add a third Predictor mode: **LSTM ML**, alongside stats and Random Forest.
- Train a sequence-window LSTM (multi-hot main-6, **bonus excluded**) offline via `npm run train:lstm`; serve only from cache (no train-on-refresh).
- Expose `GET /api/ml/lstm/status` and `POST /api/ml/lstm/predict` with metrics: **hit-count**, **val loss / overfitting summary**, and **rank/prize simulation**.
- Persist LSTM recommendations to Firestore with `method: "lstm-ml"`.
- Keep POLICY tone: experimental; metrics ≠ win probability; document that lottery draws are independent trials.

## Capabilities

### New Capabilities

- `predictor-ml-lstm`: Manual LSTM train script, cached model artifacts, status/predict APIs, Predictor LSTM mode UX, and history save with `lstm-ml` method.

### Modified Capabilities

- `lotto-predictor`: Extend Predictor modes from stats|RF to include LSTM; allow history method `lstm-ml` alongside existing methods.

## Impact

- **Python/ML:** TensorFlow/Keras (+ numpy) under `ml/`; artifacts in `data/ml/` (model weights gitignored); new npm script `train:lstm`.
- **Server:** LSTM status/predict routes (spawn or load cached metrics; predict via Python); no automatic train hook on ingest/refresh.
- **Client:** `PredictorTab` three-mode toggle; Firebase `method` / history labels; HowTo copy for LSTM experiment path.
- **Specs:** New `predictor-ml-lstm`; delta on `lotto-predictor`.

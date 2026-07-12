## 1. Python LSTM pipeline

- [x] 1.1 Add `ml/requirements-lstm.txt` (tensorflow, numpy) and gitignore LSTM model artifacts under `data/ml/`
- [x] 1.2 Implement `ml/train_lstm.py`: K=10 multi-hot windows, bonus excluded, chronological split, LSTM+sigmoid, metrics (hitMean/hist, valLoss/overfit, prizeSim), write model + `lstm_metrics.json`
- [x] 1.3 Implement `ml/predict_lstm.py`: load cache, score latest window, emit JSON of six numbers + metric snapshot
- [x] 1.4 Wire `npm run train:lstm` in `package.json` to the train entry (no ingest/refresh hook)

## 2. Server APIs

- [x] 2.1 Add `server/lotto/mlLstm.ts` (status read + spawn predict; reuse Python resolver pattern from RF)
- [x] 2.2 Add `GET /api/ml/lstm/status` and `POST /api/ml/lstm/predict` (503 if cold cache)
- [x] 2.3 Confirm refresh/ingest paths do not call LSTM train

## 3. Predictor UX + history

- [x] 3.1 Extend `PredictorMode` / UI to three modes: stats | ml-rf | ml-lstm; LSTM panel shows hit, val-loss/overfit, prize metrics + disclaimer
- [x] 3.2 Generate via `/api/ml/lstm/predict`; extend Firebase `method: "lstm-ml"` and history labels
- [x] 3.3 Update HowTo (and light Footer/copy if needed) for LSTM manual train + experimental tone

## 4. Verification

- [x] 4.1 Run `npm run train:lstm` once locally and confirm status + predict APIs
- [x] 4.2 Run `npm run lint` and smoke all three Predictor modes (incl. LSTM save when logged in)

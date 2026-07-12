## 1. Python LSTM pipeline

- [ ] 1.1 Add `ml/requirements-lstm.txt` (tensorflow, numpy) and gitignore LSTM model artifacts under `data/ml/`
- [ ] 1.2 Implement `ml/train_lstm.py`: K=10 multi-hot windows, bonus excluded, chronological split, LSTM+sigmoid, metrics (hitMean/hist, valLoss/overfit, prizeSim), write model + `lstm_metrics.json`
- [ ] 1.3 Implement `ml/predict_lstm.py`: load cache, score latest window, emit JSON of six numbers + metric snapshot
- [ ] 1.4 Wire `npm run train:lstm` in `package.json` to the train entry (no ingest/refresh hook)

## 2. Server APIs

- [ ] 2.1 Add `server/lotto/mlLstm.ts` (status read + spawn predict; reuse Python resolver pattern from RF)
- [ ] 2.2 Add `GET /api/ml/lstm/status` and `POST /api/ml/lstm/predict` (503 if cold cache)
- [ ] 2.3 Confirm refresh/ingest paths do not call LSTM train

## 3. Predictor UX + history

- [ ] 3.1 Extend `PredictorMode` / UI to three modes: stats | ml-rf | ml-lstm; LSTM panel shows hit, val-loss/overfit, prize metrics + disclaimer
- [ ] 3.2 Generate via `/api/ml/lstm/predict`; extend Firebase `method: "lstm-ml"` and history labels
- [ ] 3.3 Update HowTo (and light Footer/copy if needed) for LSTM manual train + experimental tone

## 4. Verification

- [ ] 4.1 Run `npm run train:lstm` once locally and confirm status + predict APIs
- [ ] 4.2 Run `npm run lint` and smoke all three Predictor modes (incl. LSTM save when logged in)

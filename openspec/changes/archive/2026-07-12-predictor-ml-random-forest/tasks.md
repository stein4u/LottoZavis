## 1. Python ML pipeline

- [x] 1.1 Add `ml/requirements.txt` (numpy, scikit-learn, joblib) and `data/ml/.gitkeep`; gitignore `data/ml/*.joblib`
- [x] 1.2 Implement `ml/train_rf.py`: load draws, build per-number features (W=50, bonus excluded, no leakage), chronological holdout, RF classifier + r2/hitMean/hitHist, refit all, write `rf_model.joblib` + `rf_metrics.json`
- [x] 1.3 Implement `ml/predict_rf.py` (or train module predict entry): load model, score next round, print JSON of six numbers

## 2. Server integration

- [x] 2.1 Add Node helper to resolve Python (`py`/`python`/`python3`), spawn train after successful refresh/ingest without failing draw update
- [x] 2.2 Wire train hook into `incrementalRefresh` / admin refresh / post-ensure path as designed
- [x] 2.3 Add `GET /api/ml/rf/status` and `POST /api/ml/rf/predict` reading `data/ml/` cache (503 if missing)

## 3. Weight profile rename

- [x] 3.1 Rename `ModelType` to `mid_range` | `freq_tilt` | `absence_tilt` in server `predictEngine` + types; reject legacy ML names on `/api/predict`
- [x] 3.2 Update PredictorTab stats-mode UI labels and defaults for renamed profiles
- [x] 3.3 Update HowTo (and any Footer/copy) that still calls stats profiles Random Forest / XGBoost / LSTM

## 4. Predictor ML UX + history

- [x] 4.1 Add Predictor mode toggle (stats | ml-rf); ML panel shows status metrics, disclaimer, generate via `/api/ml/rf/predict`
- [x] 4.2 Extend Firebase `SavedPrediction` / `savePrediction` with `method` (`weighted-random` | `random-forest-ml`) and optional `r2`/`hitMean`; save ML results from UI
- [x] 4.3 Show method label in prediction history list for stats vs ML entries

## 5. Verification

- [x] 5.1 Run local train once (`python ml/train_rf.py` or via refresh) and confirm metrics + predict APIs
- [x] 5.2 Run `npm run lint` and smoke both Predictor modes (stats + ML save when logged in)

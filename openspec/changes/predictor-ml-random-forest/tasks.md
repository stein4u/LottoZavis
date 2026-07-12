## 1. Python ML pipeline

- [ ] 1.1 Add `ml/requirements.txt` (numpy, scikit-learn, joblib) and `data/ml/.gitkeep`; gitignore `data/ml/*.joblib`
- [ ] 1.2 Implement `ml/train_rf.py`: load draws, build per-number features (W=50, bonus excluded, no leakage), chronological holdout, RF classifier + r2/hitMean/hitHist, refit all, write `rf_model.joblib` + `rf_metrics.json`
- [ ] 1.3 Implement `ml/predict_rf.py` (or train module predict entry): load model, score next round, print JSON of six numbers

## 2. Server integration

- [ ] 2.1 Add Node helper to resolve Python (`py`/`python`/`python3`), spawn train after successful refresh/ingest without failing draw update
- [ ] 2.2 Wire train hook into `incrementalRefresh` / admin refresh / post-ensure path as designed
- [ ] 2.3 Add `GET /api/ml/rf/status` and `POST /api/ml/rf/predict` reading `data/ml/` cache (503 if missing)

## 3. Weight profile rename

- [ ] 3.1 Rename `ModelType` to `mid_range` | `freq_tilt` | `absence_tilt` in server `predictEngine` + types; reject legacy ML names on `/api/predict`
- [ ] 3.2 Update PredictorTab stats-mode UI labels and defaults for renamed profiles
- [ ] 3.3 Update HowTo (and any Footer/copy) that still calls stats profiles Random Forest / XGBoost / LSTM

## 4. Predictor ML UX + history

- [ ] 4.1 Add Predictor mode toggle (stats | ml-rf); ML panel shows status metrics, disclaimer, generate via `/api/ml/rf/predict`
- [ ] 4.2 Extend Firebase `SavedPrediction` / `savePrediction` with `method` (`weighted-random` | `random-forest-ml`) and optional `r2`/`hitMean`; save ML results from UI
- [ ] 4.3 Show method label in prediction history list for stats vs ML entries

## 5. Verification

- [ ] 5.1 Run local train once (`python ml/train_rf.py` or via refresh) and confirm metrics + predict APIs
- [ ] 5.2 Run `npm run lint` and smoke both Predictor modes (stats + ML save when logged in)

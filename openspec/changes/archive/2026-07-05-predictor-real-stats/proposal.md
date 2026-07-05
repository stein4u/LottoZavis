## Why

The Analysis tab now uses real 동행복권 draw data, but the Predictor tab still relies on hardcoded hot/cold lists, simulated ML metrics (confidence, precision, F1), and misleading UX copy ("역전파", "Neural Network"). This inconsistency undermines trust and misrepresents the product. After completing real-data analysis, the next step is to align Predictor with the same statistics engine as an honest **statistical weighted recommendation** tool—not a machine-learning prediction system.

## What Changes

- Refactor `POST /api/predict` to derive hot/cold weights from `statsEngine` frequencies (bonus-inclusive, same rules as Analysis).
- Accept optional `window` query/body parameter (`all`, `50`, `100`, `200`) consistent with `GET /api/lotto-stats`.
- Remove fabricated `confidence` and `metrics` (precision/recall/F1) from API response; replace with transparent metadata (e.g. `statsWindow`, `latestRound`, `method: "weighted-random"`).
- Rename/reframe model presets (Random Forest / XGBoost / LSTM) as **weight profiles** or simplify to statistical presets—no claim of trained models.
- Update `PredictorTab` copy, loading steps, and result UI to reflect statistical recommendation; remove client-side random fallback with fake metrics.
- Update Analysis/Footer disclaimers to note Predictor uses the same real stats (no longer "simulation").
- Persist optional metadata on saved predictions (`statsWindow`, `latestRound`).

## Capabilities

### New Capabilities

- `lotto-predictor`: Statistical number recommendation API and Predictor tab UX backed by real draw statistics.

### Modified Capabilities

<!-- No changes to existing main spec requirements; predict is a new capability -->

## Impact

- **Backend**: `server.ts` `/api/predict`, new helper in `server/lotto/` (e.g. `predictEngine.ts`).
- **Frontend**: `PredictorTab.tsx`, `src/types.ts` (`PredictionResult` shape **BREAKING**), optional `Footer.tsx` / `AnalysisTab` disclaimer tweak.
- **Firebase**: `SavedPrediction` may gain optional fields; backward compatible.
- **Non-goals**: Training ML models, claiming improved win probability, co-occurrence analytics (separate change).

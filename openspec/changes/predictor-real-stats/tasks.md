## 1. Backend predict engine

- [x] 1.1 Create `server/lotto/predictEngine.ts` with weighted selection using `LottoStats.frequencies`
- [x] 1.2 Derive hot/cold tiers from frequency rank (top 6 / bottom 6) matching Analysis
- [x] 1.3 Apply `hotColdBias`, `oddEvenBias`, `excludeNumbers`, and model weight profiles
- [x] 1.4 Export typed `PredictionResponse` without confidence/metrics

## 2. API integration

- [x] 2.1 Refactor `POST /api/predict` to accept `window`, load cache, call `computeStats` + `predictEngine`
- [x] 2.2 Return 503 when cache empty; 400 on invalid window
- [x] 2.3 Remove hardcoded hot/cold arrays and fake metric generation from `server.ts`

## 3. Frontend types and API client

- [x] 3.1 Update `PredictionResult` / response types in `src/types.ts` (remove metrics/confidence, add metadata)
- [x] 3.2 Update `PredictorTab` fetch body to include `window`
- [x] 3.3 Remove client-side random fallback with fabricated metrics

## 4. PredictorTab UX

- [x] 4.1 Add stats window selector (전체 / 50 / 100 / 200)
- [x] 4.2 Replace hero badge, title, subtitle, and loading steps with honest statistical copy
- [x] 4.3 Replace result panel: show method, statsWindow, latestRound, sum/odd; remove F1/confidence UI
- [x] 4.4 Add error state with retry (no silent fallback)
- [x] 4.5 Optionally relabel model presets as weight profiles (not trained ML)

## 5. Disclaimers and persistence

- [x] 5.1 Update AnalysisTab disclaimer (Predictor uses same real stats; no win guarantee)
- [x] 5.2 Update Footer product description
- [x] 5.3 Extend `SavedPrediction` and `savePrediction` with `statsWindow` and `latestRound`

## 6. Verification

- [x] 6.1 Verify hot_heavy favors high-frequency numbers for a fixed window (manual spot-check)
- [x] 6.2 Verify window=100 vs all produces different weight pools
- [x] 6.3 Run `npm run lint`
- [x] 6.4 Run `openspec validate predictor-real-stats`

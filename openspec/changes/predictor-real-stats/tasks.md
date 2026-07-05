## 1. Backend predict engine

- [ ] 1.1 Create `server/lotto/predictEngine.ts` with weighted selection using `LottoStats.frequencies`
- [ ] 1.2 Derive hot/cold tiers from frequency rank (top 6 / bottom 6) matching Analysis
- [ ] 1.3 Apply `hotColdBias`, `oddEvenBias`, `excludeNumbers`, and model weight profiles
- [ ] 1.4 Export typed `PredictionResponse` without confidence/metrics

## 2. API integration

- [ ] 2.1 Refactor `POST /api/predict` to accept `window`, load cache, call `computeStats` + `predictEngine`
- [ ] 2.2 Return 503 when cache empty; 400 on invalid window
- [ ] 2.3 Remove hardcoded hot/cold arrays and fake metric generation from `server.ts`

## 3. Frontend types and API client

- [ ] 3.1 Update `PredictionResult` / response types in `src/types.ts` (remove metrics/confidence, add metadata)
- [ ] 3.2 Update `PredictorTab` fetch body to include `window`
- [ ] 3.3 Remove client-side random fallback with fabricated metrics

## 4. PredictorTab UX

- [ ] 4.1 Add stats window selector (전체 / 50 / 100 / 200)
- [ ] 4.2 Replace hero badge, title, subtitle, and loading steps with honest statistical copy
- [ ] 4.3 Replace result panel: show method, statsWindow, latestRound, sum/odd; remove F1/confidence UI
- [ ] 4.4 Add error state with retry (no silent fallback)
- [ ] 4.5 Optionally relabel model presets as weight profiles (not trained ML)

## 5. Disclaimers and persistence

- [ ] 5.1 Update AnalysisTab disclaimer (Predictor uses same real stats; no win guarantee)
- [ ] 5.2 Update Footer product description
- [ ] 5.3 Extend `SavedPrediction` and `savePrediction` with `statsWindow` and `latestRound`

## 6. Verification

- [ ] 6.1 Verify hot_heavy favors high-frequency numbers for a fixed window (manual spot-check)
- [ ] 6.2 Verify window=100 vs all produces different weight pools
- [ ] 6.3 Run `npm run lint`
- [ ] 6.4 Run `openspec validate predictor-real-stats`

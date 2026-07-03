## 1. Spike and module setup

- [x] 1.1 Verify 동행복권 API response for one known round (primary + legacy fallback) with required headers
- [x] 1.2 Create `server/lotto/` module structure (`types.ts`, `fetchDraw.ts`, `cache.ts`, `ingest.ts`, `statsEngine.ts`)
- [x] 1.3 Define shared types in `src/types.ts` mirroring server draw and stats shapes

## 2. Data ingest (Phase 1)

- [x] 2.1 Implement `fetchDraw(round)` with field normalization and legacy fallback
- [x] 2.2 Implement cache read/write for `data/lotto-draws.json`
- [x] 2.3 Implement bulk ingest (rounds 1 → latest) with request throttling
- [x] 2.4 Implement incremental refresh from `latestRound + 1`
- [x] 2.5 Load cache on server startup; trigger bulk ingest if cache missing
- [x] 2.6 Add `POST /api/admin/refresh` route returning `addedCount` and `latestRound`
- [x] 2.7 Seed or generate initial `data/lotto-draws.json` for demo use

## 3. Statistics engine (Phase 1)

- [x] 3.1 Implement bonus-inclusive `frequencies`, `absence`, and `zoneStats`
- [x] 3.2 Implement main-six-only `oddEvenRatio`, `sumRangeStats`, and `consecutivePairsCount`
- [x] 3.3 Implement window slicing (`all`, `50`, `100`, `200`)
- [x] 3.4 Replace hardcoded `lottoStats` in `server.ts` with `GET /api/lotto-stats` backed by `statsEngine`
- [x] 3.5 Add response metadata: `lastUpdated`, `latestRound`, `dataSource`, `window`, `frequencyIncludesBonus`

## 4. Draw API (Phase 2 backend)

- [x] 4.1 Implement `GET /api/draws` with `from`, `to`, `limit`, descending order
- [x] 4.2 Implement `GET /api/draws/latest` with empty-cache error handling
- [x] 4.3 Enrich draw records with computed `sum` and `oddCount` (main six)

## 5. Analysis tab — Phase 1 UI

- [x] 5.1 Update `AnalysisTab` to display provenance (`latestRound`, `lastUpdated`, data source)
- [x] 5.2 Add "보너스 포함" label on frequency chart
- [x] 5.3 Remove simulated stats fallback; add error state with retry
- [x] 5.4 Update footer/static copy from "시뮬레이션" to real-data wording where applicable

## 6. Analysis tab — Phase 2 UI

- [x] 6.1 Add window filter controls (전체 / 50 / 100 / 200) wired to `?window=`
- [x] 6.2 Add latest-draw banner via `GET /api/draws/latest`
- [x] 6.3 Add absence insight card (top 6 by `drawsSince`)
- [x] 6.4 Add zone distribution card (1–15, 16–30, 31–45)
- [x] 6.5 Add draw history table with round, date, numbers, bonus, sum, odd/even
- [x] 6.6 Add round search and load-more pagination
- [x] 6.7 Add Predictor simulation disclaimer on Analysis tab or footer

## 7. Verification

- [x] 7.1 Manually verify frequency counts for 2–3 numbers against raw draw data
- [x] 7.2 Verify window=100 changes hot/cold vs window=all
- [x] 7.3 Verify draw search returns correct single round
- [x] 7.4 Run `npm run lint` and fix any type errors
- [x] 7.5 Run `openspec validate real-lotto-data-analysis`

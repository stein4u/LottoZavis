## 1. Backend co-occurrence engine

- [x] 1.1 Create `server/lotto/coOccurrence.ts` with bonus-inclusive pair counting (21 pairs/draw)
- [x] 1.2 Export `computePairCounts(draws)` and helpers for top global pairs and partners for a number
- [x] 1.3 Integrate pair computation into `computeStats()`; add `coOccurrenceIncludesBonus`, `topPairs` to `LottoStats`
- [x] 1.4 Create `server/lotto/numberProfile.ts` with `buildNumberProfile(draws, window, n)`

## 2. API routes

- [x] 2.1 Add `GET /api/lotto-stats/number/:n` with window validation and 400/503 handling
- [x] 2.2 Extend `queryDraws()` with optional `contains` filter (main or bonus)
- [x] 2.3 Wire `contains` in `GET /api/draws` route with 400 on invalid number
- [x] 2.4 Update `server/lotto/types.ts` and `src/types.ts` with new response shapes

## 3. CSV utility

- [x] 3.1 Create `src/lib/csvExport.ts` with `downloadCsv(filename, headers, rows)` and UTF-8 BOM support
- [x] 3.2 Add helpers to serialize stats snapshot and loaded draw rows to CSV rows

## 4. Number drill-down panel

- [x] 4.1 Create `NumberDrillPanel.tsx` (right slide overlay, close on backdrop/X)
- [x] 4.2 Fetch number profile and `GET /api/draws?contains={n}&limit=10` when panel opens
- [x] 4.3 Show count, absence, zone, top partners, recent draws, and co-occurrence disclaimer

## 5. AnalysisTab integration

- [x] 5.1 Add co-occurrence card rendering `stats.topPairs` with bonus-inclusive label
- [x] 5.2 Wire bar chart, Hot/Cold chips, and absence rows to open drill-down panel
- [x] 5.3 Respect active window filter for profile and co-occurrence data
- [x] 5.4 Add "통계 내보내기" and "표시된 이력 내보내기" CSV buttons
- [x] 5.5 Update Analysis disclaimer text per modified spec (real Predictor + co-occurrence exploratory)

## 6. Verification

- [x] 6.1 Spot-check pair (3,7) increments for a draw with main including 3 and bonus 7
- [x] 6.2 Verify `contains=23` returns only draws with 23 in main or bonus
- [x] 6.3 Verify drill-down panel opens from frequency bar and Hot/Cold/absence clicks
- [x] 6.4 Verify CSV downloads contain expected columns for stats and loaded draws
- [x] 6.5 Run `npm run lint`
- [x] 6.6 Run `openspec validate analysis-advanced-metrics`

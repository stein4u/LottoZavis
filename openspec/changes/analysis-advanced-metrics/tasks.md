## 1. Backend co-occurrence engine

- [ ] 1.1 Create `server/lotto/coOccurrence.ts` with bonus-inclusive pair counting (21 pairs/draw)
- [ ] 1.2 Export `computePairCounts(draws)` and helpers for top global pairs and partners for a number
- [ ] 1.3 Integrate pair computation into `computeStats()`; add `coOccurrenceIncludesBonus`, `topPairs` to `LottoStats`
- [ ] 1.4 Create `server/lotto/numberProfile.ts` with `buildNumberProfile(draws, window, n)`

## 2. API routes

- [ ] 2.1 Add `GET /api/lotto-stats/number/:n` with window validation and 400/503 handling
- [ ] 2.2 Extend `queryDraws()` with optional `contains` filter (main or bonus)
- [ ] 2.3 Wire `contains` in `GET /api/draws` route with 400 on invalid number
- [ ] 2.4 Update `server/lotto/types.ts` and `src/types.ts` with new response shapes

## 3. CSV utility

- [ ] 3.1 Create `src/lib/csvExport.ts` with `downloadCsv(filename, headers, rows)` and UTF-8 BOM support
- [ ] 3.2 Add helpers to serialize stats snapshot and loaded draw rows to CSV rows

## 4. Number drill-down panel

- [ ] 4.1 Create `NumberDrillPanel.tsx` (right slide overlay, close on backdrop/X)
- [ ] 4.2 Fetch number profile and `GET /api/draws?contains={n}&limit=10` when panel opens
- [ ] 4.3 Show count, absence, zone, top partners, recent draws, and co-occurrence disclaimer

## 5. AnalysisTab integration

- [ ] 5.1 Add co-occurrence card rendering `stats.topPairs` with bonus-inclusive label
- [ ] 5.2 Wire bar chart, Hot/Cold chips, and absence rows to open drill-down panel
- [ ] 5.3 Respect active window filter for profile and co-occurrence data
- [ ] 5.4 Add "통계 내보내기" and "표시된 이력 내보내기" CSV buttons
- [ ] 5.5 Update Analysis disclaimer text per modified spec (real Predictor + co-occurrence exploratory)

## 6. Verification

- [ ] 6.1 Spot-check pair (3,7) increments for a draw with main including 3 and bonus 7
- [ ] 6.2 Verify `contains=23` returns only draws with 23 in main or bonus
- [ ] 6.3 Verify drill-down panel opens from frequency bar and Hot/Cold/absence clicks
- [ ] 6.4 Verify CSV downloads contain expected columns for stats and loaded draws
- [ ] 6.5 Run `npm run lint`
- [ ] 6.6 Run `openspec validate analysis-advanced-metrics`

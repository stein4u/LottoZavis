## 1. Types and stats engine

- [x] 1.1 Update `StatsWindow` to `"all" | 30 | 60 | 90 | 120 | 150` in `src/types.ts` and `server/lotto/types.ts`
- [x] 1.2 Update `parseStatsWindow` to accept new values and reject legacy `50|100|200`
- [x] 1.3 Extend `computeStats` with `includeBonus` option (default true) for frequency/absence/zone only
- [x] 1.4 Keep co-occurrence / `topPairs` always bonus-inclusive; set `frequencyIncludesBonus` from option

## 2. API wiring

- [x] 2.1 Parse `includeBonus` on `GET /api/lotto-stats`; update window error message
- [x] 2.2 Pass `window` + `includeBonus` through `GET /api/lotto-stats/number/:n` / `buildNumberProfile`
- [x] 2.3 Update `POST /api/predict` window validation to new set; always use `includeBonus: true`

## 3. Analysis UI

- [x] 3.1 Replace Analysis window chips with 30 / 60 / 90 / 120 / 150 / 전체
- [x] 3.2 Add 보너스 포함/미포함 toggle (default 포함); re-fetch on change with current window
- [x] 3.3 Drive frequency chart, Hot/Cold, absence, zone labels from `frequencyIncludesBonus`
- [x] 3.4 Keep co-occurrence card labeled bonus-inclusive; pass `includeBonus` into number drill fetch

## 4. Predictor UI

- [x] 4.1 Replace Predictor window options with the same 30–150 / 전체 set
- [x] 4.2 Confirm predict request body sends new window values only (no bonus toggle)

## 5. Verification

- [x] 5.1 Manual: window=90 updates 45-number frequency vs 전체
- [x] 5.2 Manual: includeBonus=false lowers total frequency sum (×6 vs ×7) and updates labels
- [x] 5.3 Manual: includeBonus=false leaves topPairs unchanged vs include for same window
- [x] 5.4 Manual: Predictor window 90 produces weights; invalid window 100 returns 400
- [x] 5.5 Run `npm run lint`
- [x] 5.6 Run `openspec validate analysis-window-bonus-toggle`

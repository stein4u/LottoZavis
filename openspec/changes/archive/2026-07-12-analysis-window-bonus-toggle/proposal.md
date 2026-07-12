## Why

Analysis and Predictor still expose window options of 전체 / 50 / 100 / 200, while users want finer recent-window control (30–150) that actually drives the 45-number frequency chart. Frequency is also locked to bonus-inclusive (Tier A) with no UI way to compare main-six-only (Tier B) counts.

## What Changes

- Replace shared stats window options with **30 / 60 / 90 / 120 / 150 / 전체** on Analysis and Predictor.
- Keep window changes re-fetching `/api/lotto-stats` so the frequency bar chart, Hot/Cold, and related windowed stats update together.
- Add an Analysis-only **보너스 포함 / 미포함** toggle (default: 포함).
- When 미포함: recompute **frequency-family** metrics only (frequencies, absence, zoneStats) over main six; leave co-occurrence (`topPairs`), number-profile partners, and Predictor weights on bonus-inclusive policy.
- Extend `GET /api/lotto-stats` (and number profile where frequency fields apply) with `includeBonus` query; default `true`.
- Update OpenSpec requirements for supported windows and optional bonus policy.

## Capabilities

### New Capabilities

<!-- None — extends existing analysis/stats/predictor surfaces -->

### Modified Capabilities

- `lotto-stats`: Supported `window` values become `all|30|60|90|120|150`; optional `includeBonus` affects frequency/absence/zone only; response `frequencyIncludesBonus` reflects request.
- `analysis-dashboard`: Window control labels/values; bonus include/exclude control; frequency chart labels follow toggle.
- `lotto-predictor`: Stats window selector matches Analysis (30–150 / 전체); Predictor does not expose bonus toggle (always bonus-inclusive weights).

## Impact

- Types: `StatsWindow` in `src/types.ts` and `server/lotto/types.ts`
- Server: `parseStatsWindow`, `computeStats`, `/api/lotto-stats`, `/api/lotto-stats/number/:n`, `/api/predict` window validation
- UI: `AnalysisTab.tsx` (window + bonus toggle), `PredictorTab.tsx` (window only), drill panel if it displays frequency labels
- Specs: `openspec/specs/lotto-stats`, `analysis-dashboard`, `lotto-predictor`

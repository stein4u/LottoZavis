## Why

LottoZavis currently serves simulated lotto statistics (sin/cos-generated frequencies and hardcoded hot/cold numbers) while the UI presents them as real big-data analysis. This undermines trust and limits the app to a demo. Replacing simulated data with official draw history from 동행복권 and expanding the Analysis tab into a genuine exploration tool aligns the product with its stated purpose and the decisions made in planning: bonus-inclusive frequency, Phase 1 (real stats) through Phase 2 (filters, draw history, insight cards).

## What Changes

- Add a server-side lotto data ingest pipeline that fetches draw results from 동행복권 JSON API and caches them locally.
- Replace hardcoded `lottoStats` in `server.ts` with computed statistics from cached draw data.
- Extend `GET /api/lotto-stats` with metadata (`lastUpdated`, `latestRound`, `window`) and Phase 2 metrics (`absence`, `zoneStats`).
- Add `GET /api/draws` and `GET /api/draws/latest` for draw history and latest-round display.
- Upgrade `AnalysisTab` with data-source badges, window filters (all / 50 / 100 / 200 draws), latest-draw banner, absence and zone cards, and a searchable draw history table.
- Document bonus-number policy: frequencies, absence, and zone stats include bonus; odd/even, sum ranges, and consecutive pairs use main 6 numbers only.
- Add a disclaimer that the Predictor tab remains simulation until a follow-up change; Analysis tab reflects real data.

## Capabilities

### New Capabilities

- `lotto-data-ingest`: Fetch, normalize, cache, and incrementally refresh Korean Lotto draw records from 동행복권.
- `lotto-stats`: Compute and expose aggregated statistics with configurable draw window and bonus-inclusive frequency rules.
- `lotto-draws-api`: Expose paginated draw history and latest-draw endpoints for the analysis UI.
- `analysis-dashboard`: Analysis tab UI consuming real stats and draw APIs with Phase 2 exploration features.

### Modified Capabilities

<!-- No existing specs in openspec/specs/ -->

## Impact

- **Backend**: `server.ts` refactored to delegate to new `server/lotto/` modules; new `data/lotto-draws.json` cache file.
- **API**: `GET /api/lotto-stats` response shape extended (**BREAKING** for clients expecting only the old fields without metadata); new draw endpoints.
- **Frontend**: `src/types.ts`, `src/components/AnalysisTab.tsx`; optional small disclaimer in `Footer.tsx` or `PredictorTab.tsx`.
- **Dependencies**: No new npm packages required; uses native `fetch` on Node 18+.
- **Operations**: Initial bulk ingest on first run; optional manual refresh endpoint for dev/demo.
- **Out of scope**: ML model training, Predictor algorithm rewrite, Firebase security hardening, automated cron scheduling.

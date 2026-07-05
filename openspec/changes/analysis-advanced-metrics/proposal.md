## Why

The Analysis tab now surfaces real draw statistics (frequency, absence, zones, draw history), but users cannot explore **relationships between numbers** or **drill into a single number's history**. Co-occurrence is referenced in the Wiki as a core analytic feature yet is missing from the product. Adding bonus-inclusive pair analytics, per-number drill-down, draw filtering by number, and CSV export deepens exploration without changing the honest statistical stance of Predictor.

## What Changes

- Extend `statsEngine` to compute **bonus-inclusive co-occurrence pairs** (main six + bonus, C(7,2) per draw) and expose **global top 20 pairs** on `GET /api/lotto-stats`.
- Add `GET /api/lotto-stats/number/:n` returning a number profile: frequency, absence, zone, **top 10 co-occurring partners**, and metadata for the active window.
- Extend `GET /api/draws` with optional `contains={number}` filter (main or bonus appearance).
- Upgrade `AnalysisTab` with a **co-occurrence card**, **clickable numbers** (frequency bar, Hot/Cold, absence list) opening a **right slide panel** drill-down, and **1–2 client-side CSV export buttons** for current on-screen data.
- Update outdated Analysis disclaimer spec (Predictor no longer described as simulation).
- **Non-breaking** for existing stats fields; new response fields and endpoints only.

## Capabilities

### New Capabilities

<!-- None — all changes extend existing capabilities -->

### Modified Capabilities

- `lotto-stats`: Bonus-inclusive co-occurrence aggregation; top pairs on stats response; per-number profile endpoint.
- `lotto-draws-api`: Optional `contains` query parameter to filter draws by number appearance.
- `analysis-dashboard`: Co-occurrence UI, number drill-down slide panel, CSV export, disclaimer requirement update.

## Impact

- **Backend**: `server/lotto/statsEngine.ts`, new helpers (e.g. `coOccurrence.ts`, `numberProfile.ts`), `server/lotto/drawsApi.ts`, `server.ts` routes.
- **Frontend**: `AnalysisTab.tsx`, new slide-panel component, `src/types.ts` (new interfaces), CSV utility (client-side Blob).
- **API**: Extended `GET /api/lotto-stats` response; new `GET /api/lotto-stats/number/:n`; extended `GET /api/draws?contains=`.
- **Non-goals (MVP)**: Triplet co-occurrence, full 45×45 heatmap, Predictor deep links, server-side CSV endpoints, timeline sparklines.

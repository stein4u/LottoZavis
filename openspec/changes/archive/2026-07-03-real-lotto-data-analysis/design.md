## Context

LottoZavis is a React + Express app generated from Google AI Studio. The backend (`server.ts`) currently returns simulated lotto statistics and a weighted-random "prediction" endpoint. The Analysis tab (`AnalysisTab.tsx`) renders charts from `/api/lotto-stats` but falls back to local fake data on error. There is no persisted draw history.

Planning decisions (locked):
- **Bonus policy**: frequency, absence, and zone stats include bonus; odd/even, sum ranges, and consecutive pairs use main 6 only.
- **Scope**: Phase 1 (real data + stats API) and Phase 2 (window filters, draw table, insight cards). Predictor rewrite is out of scope.

Tech stack stays unchanged: Express in `server.ts`, Vite dev middleware, TypeScript, no new npm dependencies.

## Goals / Non-Goals

**Goals:**

- Ingest and cache all Korean Lotto draws from 동행복권 JSON API.
- Compute accurate statistics with documented bonus/main-six rules.
- Expose stats and draw REST APIs consumed by an upgraded Analysis tab.
- Ship Phase 2 exploration UX: window filters, latest banner, absence/zone cards, draw history table with search.

**Non-Goals:**

- Training or deploying real ML models (Random Forest, XGBoost, LSTM).
- Rewiring Predictor hot/cold to real stats (follow-up change).
- Firebase security rule hardening.
- Production cron / scheduled refresh (manual refresh endpoint is sufficient for MVP).
- Claiming improved winning probability.

## Decisions

### 1. Data source: 동행복권 internal JSON API

**Choice:** `https://www.dhlottery.co.kr/lt645/selectPstLt645Info.do?srchLtEpsd={round}` with required headers.

**Alternatives:**
- Legacy `getLottoNumber&drwNo=` — simpler but more likely to be deprecated.
- Third-party proxy (e.g. daytive-lotto-api) — avoids header issues but adds external dependency.

**Rationale:** Direct upstream access with server-side fetch avoids CORS; internal JSON API is stable against HTML layout changes. Implement a thin adapter so URL/field changes are isolated in `fetchDraw.ts`.

**Field mapping:**

| Upstream | Internal |
|----------|----------|
| `ltEpsd` | `round` |
| `ltRflYmd` | `date` (normalize to YYYY-MM-DD) |
| `tm1WnNo` … `tm6WnNo` | `numbers[]` (sort ascending) |
| `bnsWnNo` | `bonus` |

Fallback: if primary API fails for a round, retry legacy `getLottoNumber` endpoint once before marking round as failed.

### 2. Cache: JSON file on disk

**Choice:** `data/lotto-draws.json` with shape `{ latestRound, lastUpdated, draws: LottoDraw[] }`.

**Alternatives:** SQLite, Firestore, in-memory only.

**Rationale:** Minimal dependency; draws are read-heavy and fit in memory (~1200 records × ~100 bytes). Commit an initial seeded cache for demo reliability; document `data/lotto-draws.json` in `.gitignore` as optional for dev-only refresh.

**Refresh strategy:**
- On server start: load cache; if missing or empty, bulk fetch rounds 1 → latest (with ~100ms delay between requests to avoid rate limits).
- Incremental: fetch from `latestRound + 1` until upstream returns no data.
- Manual: `POST /api/admin/refresh`.

### 3. Module layout under `server/lotto/`

```
server/lotto/
  types.ts          # LottoDraw, LottoDrawsCache, LottoStats
  fetchDraw.ts      # HTTP + parse + fallback
  ingest.ts         # bulk / incremental → write cache
  statsEngine.ts    # all aggregations + window slice
  cache.ts          # read/write data/lotto-draws.json
```

`server.ts` retains Express setup and route wiring only. Stats computed on read (not pre-materialized) — acceptable at ~1200 draws; revisit if performance becomes an issue.

### 4. Bonus-inclusive frequency rules

Per draw, increment frequency for each main number and bonus (7 events max). `absence` and `zoneStats` use the same appearance definition (main or bonus counts as "appeared"). `oddEvenRatio`, `sumRangeStats`, and `consecutivePairsCount` iterate main six only.

Document in API via `frequencyIncludesBonus: true` and in UI chart subtitle.

### 5. Window parameter

Supported values: `all` (default), `50`, `100`, `200`. Implementation: slice `draws` to last N before passing to `statsEngine`. Invalid values return 400.

### 6. AnalysisTab structure

Extend existing `AnalysisTab.tsx` in place for Phase 1. For Phase 2, optionally extract subcomponents under `src/components/analysis/` (`WindowFilter.tsx`, `LatestDrawBanner.tsx`, `DrawsTable.tsx`, `InsightCards.tsx`) if file grows beyond ~400 lines — not mandatory for MVP.

Remove simulated fallback in `fetchStats`; show error UI with retry instead.

### 7. Predictor disclaimer placement

Add a short notice in `AnalysisTab` header area and one line in `Footer.tsx`. No Predictor code changes in this change.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| 동행복권 API URL or field rename | Isolate in `fetchDraw.ts`; add legacy fallback; log parse failures |
| Rate limiting during bulk ingest | 100–200ms delay between requests; cache after first run |
| Long first startup | Ship pre-built `data/lotto-draws.json` in repo for demos |
| **BREAKING** stats API shape change | Frontend updated in same change; document new fields |
| Bonus in frequency skews hot/cold vs main-only intuition | UI label "보너스 포함"; wiki can explain policy |
| Unofficial API / no SLA | Disclaimer: non-affiliated with 동행복권; data for reference only |
| Predictor vs Analysis inconsistency | Explicit disclaimer until follow-up change |

## Migration Plan

1. Add `server/lotto/` modules and cache file without removing old endpoints.
2. Wire `GET /api/lotto-stats` to `statsEngine`; verify Analysis charts match manual spot-check for 2–3 numbers.
3. Add draw endpoints and Phase 2 Analysis UI sections.
4. Remove hardcoded `lottoStats` object from `server.ts`.
5. Run `npm run dev`; trigger `POST /api/admin/refresh` once to validate incremental path.
6. Rollback: revert to previous `server.ts` hardcoded stats (git revert); cache file is additive.

## Open Questions

- **Cache in git**: commit initial JSON for assignment demo vs gitignore + ingest on install? *Recommendation: commit for reliability.*
- **Admin refresh auth**: leave unauthenticated for local dev or gate with env flag? *Recommendation: no auth for MVP; note in README dev-only.*
- **Legacy API field names**: confirm `selectPstLt645Info` response shape in a spike before bulk ingest (first task in implementation).

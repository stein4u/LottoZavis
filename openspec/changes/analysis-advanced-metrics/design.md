## Context

LottoZavis P1 delivered real stats (`statsEngine`, `GET /api/lotto-stats`, draw APIs) and P1.5 aligned Predictor with the same data. Analysis shows aggregate charts but numbers are not interactive. Wiki articles mention co-occurrence matrices as analytic features. ~1230 cached draws make pair aggregation lightweight.

**User decisions for P2:**

- Co-occurrence: **bonus-inclusive** (7 numbers per draw → 21 pairs/draw)
- Drill-down entry: frequency bar **and** Hot/Cold/absence lists
- Export: **required** in P2 (client-side CSV of current screen data)
- UI: **right slide panel**

## Goals / Non-Goals

**Goals:**

- Single-pass co-occurrence computation alongside existing stats aggregation.
- Option A + B API: global top pairs on stats + per-number profile endpoint.
- `contains` filter on draws API for number appearance history.
- Interactive Analysis with slide-panel drill-down and CSV export buttons.
- Clear policy labels (bonus-inclusive co-occurrence vs main-six odd/even/sum).

**Non-Goals (MVP):**

- Triplet or higher-order co-occurrence.
- Full 45×45 heatmap or chord diagram.
- Server CSV endpoints or full-matrix download.
- Predictor `excludeNumbers` deep link from drill-down.
- Sparkline timelines or ML feature export.

## Decisions

### 1. Co-occurrence policy: bonus-inclusive pairs

**Choice:** Count pairs among `{main six + bonus}` per draw (21 pairs/draw).

**Rationale:** Aligns with frequency/absence bonus-inclusive policy; user explicitly chose bonus inclusion.

**Implementation:**

```typescript
function pairKeys(draw: LottoDraw): [number, number][] {
  const nums = [...draw.numbers, draw.bonus].sort((a, b) => a - b);
  const pairs: [number, number][] = [];
  for (let i = 0; i < nums.length; i++)
    for (let j = i + 1; j < nums.length; j++)
      pairs.push([nums[i], nums[j]]);
  return pairs;
}
```

Store counts in `Map<string, number>` keyed `"a-b"` with `a < b`. Symmetric matrix; 990 unique pairs max.

**Response field:** `coOccurrenceIncludesBonus: true` alongside `topPairs`.

### 2. Top pairs on stats API (Option A)

**Choice:** Add to `LottoStats`:

```typescript
coOccurrenceIncludesBonus: true;
topPairs: { a: number; b: number; count: number; rate: number }[]; // top 20, rate = count/drawCount
```

Computed in same `computeStats()` pass after slicing by window. Sort pairs by count desc, take 20.

**Alternative rejected:** Full 990-pair payload — too heavy for default stats load.

### 3. Number profile endpoint (Option B)

**Choice:** `GET /api/lotto-stats/number/:n?window=all|50|100|200`

**Response:**

```typescript
interface NumberProfile {
  number: number;
  window: StatsWindow;
  drawCount: number;
  latestRound: number;
  frequencyIncludesBonus: true;
  coOccurrenceIncludesBonus: true;
  count: number;           // frequency count (bonus-inclusive)
  drawsSince: number;      // absence
  zone: "1-15" | "16-30" | "31-45";
  topPartners: { number: number; count: number; rate: number }[]; // top 10
}
```

Derive partners from pair map: for selected `n`, collect all pairs involving `n`, sort by count, take 10. Reuse pair counts from stats pass or compute on demand (same O(draws×21)).

**Recent appearances:** UI fetches `GET /api/draws?contains={n}&limit=10` separately (keeps profile payload small).

### 4. Draws API `contains` filter

**Choice:** Add optional `contains` query param (integer 1–45).

**Behavior:** Filter draws where `numbers.includes(n) || bonus === n`, then apply existing from/to/limit/offset/range logic. Invalid number → 400.

**Module:** Extend `queryDraws()` in `drawsApi.ts`.

### 5. Analysis UI: right slide panel

**Choice:** New `NumberDrillPanel.tsx` — fixed right overlay, ~360px wide, closes on backdrop click or X.

**Triggers (all set `selectedNumber` state):**

- Frequency bar chart bar click (Recharts `onClick` on Bar)
- Hot/Cold number chips
- Absence list rows

**Panel content:**

- Header: number badge + zone
- Stats: count, drawsSince, window label
- Top partners list (from profile API)
- Recent draws mini-table (from `contains` API, limit 10)
- Footer note: co-occurrence is historical reference, not prediction

**Co-occurrence card:** Separate section below insight cards showing `stats.topPairs` table with policy badge.

### 6. CSV export (client-side, P2 required)

**Choice:** Two buttons, no new server endpoints.

| Button | Location | Contents |
|--------|----------|----------|
| **통계 내보내기** | Stats header | frequencies, absence, zoneStats, topPairs, window metadata |
| **이력 내보내기** | Draw table header | currently loaded draw rows (columns: round, date, numbers, bonus, sum, oddCount) |

Utility: `src/lib/csvExport.ts` — `downloadCsv(filename, rows)` using Blob + temporary `<a>` click. UTF-8 BOM for Excel Korean support optional.

### 7. File layout

```
server/lotto/
  coOccurrence.ts    # pair counting, topPairs, partnersForNumber
  numberProfile.ts   # buildNumberProfile(stats, pairMap, n)
  statsEngine.ts     # integrate pair pass
  drawsApi.ts        # contains filter
src/components/
  NumberDrillPanel.tsx
  AnalysisTab.tsx    # wire clicks, co-occurrence card, export buttons
src/lib/csvExport.ts
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Users misread co-occurrence as predictive | Disclaimer in panel + co-occurrence card; same honest tone as Predictor |
| Bonus-inclusive pairs confuse vs main-six metrics | Explicit badges on co-occurrence sections |
| Bar chart click targets small on mobile | Also enable Hot/Cold/absence taps; panel scrollable |
| Double API call on drill-down (profile + draws) | Acceptable for MVP; both are small payloads |
| CSV only exports loaded draws, not full history | Label button "표시된 이력 내보내기"; document in UI |

## Migration Plan

1. Deploy backend first (new fields/endpoints backward-compatible).
2. Deploy frontend with co-occurrence card and panel.
3. No cache migration; recomputed on each request from existing JSON.

## Open Questions

- None — user resolved co-occurrence policy, entry points, export scope, and panel UX.

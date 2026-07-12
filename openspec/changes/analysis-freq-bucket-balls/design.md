## Context

Analysis already loads `LottoStats` via `GET /api/lotto-stats` with shared `window` (`30|60|90|120|150|all`) and `includeBonus`. The main chart is a Recharts bar: X = number 1–45, Y = count. Users want a complementary **frequency → numbers** view with 동행복권-style balls, placed under that chart, driven by the same `stats.frequencies`.

## Goals / Non-Goals

**Goals:**

- Client-side bucket grouping of `stats.frequencies` into X-axis columns.
- Per-count buckets for `30|60|90`; bin size 5 for `120|150|all`.
- Stack lotto balls per bucket with decade colors and light 3D styling.
- Click ball → existing `openDrillDown(number)`.
- Show active `freqLabel` / `frequencyIncludesBonus` on the section.

**Non-Goals:**

- New API fields or server-side bucketing.
- Replacing the existing frequency bar chart.
- Changing Predictor or co-occurrence charts.
- Exact pixel-perfect official DHLottery assets (CSS approximation is enough).

## Decisions

### 1. Data transform only (no API)

**Choice:** Derive buckets in the client from `stats.frequencies`.

```ts
type FreqBucket = { key: string; label: string; min: number; max: number; numbers: number[] };
```

**Rationale:** Counts already respect window/bonus; avoids backend churn.

### 2. Binning rules

| Active window | Bucket size |
|---------------|-------------|
| 30, 60, 90 | 1 (exact count) |
| 120, 150, `all` | 5 |

For bin 5: number with count `c` goes to bucket `floor(c/5)*5` … `floor(c/5)*5+4`, label e.g. `180-184`. Empty buckets between min and max observed counts MAY be omitted to reduce width (prefer omit empties).

**Rationale:** User-locked rules; omit empty columns keeps “전체” usable.

### 3. Layout: CSS columns, not Recharts

**Choice:** Horizontal scrollable row of columns; each column = label + flex-col-reverse stack of balls. Do **not** force this into Recharts bars (labels/balls are awkward there).

**Rationale:** “차곡차곡” ball stacks need DOM control; Recharts stays for the original chart.

### 4. Ball component + decade colors

**Choice:** Small reusable `LottoBall` (or local helper) with:

| Range | Color |
|-------|--------|
| 1–10 | yellow |
| 11–20 | blue |
| 21–30 | red |
| 31–40 | gray |
| 41–45 | green |

Styling: radial gradient, top-left highlight, bold number, circular shadow. Size ~24–28px in stacks.

**Rationale:** Matches familiar 동행복권 ball coloring users expect.

### 5. Placement

**Choice:** Full-width card directly under the current charts row (`lg:grid` frequency + odd/even).

**Rationale:** Wide X-axis needs width; pairs visually with the bar chart above.

### 6. Sort within bucket

**Choice:** Ascending number order bottom→top (or top→bottom consistently). Prefer ascending so stacks are stable.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Many columns on window=90 | Horizontal scroll; compact balls |
| Bin merges obscure exact counts | Tooltip/title on ball: `N번 · c회` |
| Color contrast on yellow | Dark text on yellow/light balls |
| Duplicate logic if balls reused elsewhere | Extract `LottoBall` + `lottoBallColor(n)` to `src/lib` or `src/components` |

## Migration Plan

1. Add grouping helper + ball UI.
2. Wire section in AnalysisTab under charts.
3. Manual check windows 90 vs 120 vs all + bonus toggle.
4. Archive → sync `analysis-dashboard` spec.

## Open Questions

None — product decisions locked.

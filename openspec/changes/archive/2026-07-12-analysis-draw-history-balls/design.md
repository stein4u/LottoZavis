## Context

`LottoBall` exists from `analysis-freq-bucket-balls` with decade colors and optional `onClick`. Analysis draw history still uses `numbers.join(", ")` and text bonus; latest banner uses flat `bg-blue-600` / `bg-rose-500` circles. `fetchDraws` uses `limit: "20"`.

## Goals / Non-Goals

**Goals:**

- Reuse `LottoBall` in history table (main 6 + bonus) and latest-draw banner.
- Display-only: no `openDrillDown` from these balls.
- Initial load and “더 보기” use page size 30.

**Non-Goals:**

- Changing drill-down panel recent-draw text formatting.
- Server default limit changes or new endpoints.
- CSV export format changes (numbers stay numeric columns).

## Decisions

### 1. Reuse `LottoBall` with no onClick

**Choice:** Render `<LottoBall number={n} size={…} />` without `onClick`. If the button semantics feel wrong for display-only, add optional `interactive={false}` that renders a `span` instead of `button` (preferred for a11y).

**Rationale:** User: display only; avoid accidental drill-down.

### 2. Bonus distinction

**Choice:** Same decade coloring as main numbers; keep separate bonus column / `+` separator; slightly smaller size or subtle ring optional. Do **not** force all bonuses to rose.

**Rationale:** Consistency with official decade colors; column/`+` already marks bonus role.

### 3. Sizing

| Surface | Suggested size |
|---------|----------------|
| Latest banner | ~28–32px |
| History table | ~22–24px (row density) |

### 4. Page size 30

**Choice:** Constant `DRAWS_PAGE_SIZE = 30` for list fetches; round search stays `limit=1`.

**Rationale:** Matches user request; within API max 100.

### 5. Spec updates

**Choice:** MODIFY draw-history / latest-banner requirements to mention lotto-ball presentation and page size 30; ADDED scenarios as needed.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Table width / wrapping | flex-wrap balls; keep overflow-x on table |
| Button-in-table noise | `interactive={false}` → non-button element |
| Dense rows | Smaller ball size in table |

## Migration Plan

1. Optionally harden `LottoBall` for display-only.
2. Update AnalysisTab banner + history + limit.
3. Manual check + lint; archive sync.

## Open Questions

None — decisions locked.

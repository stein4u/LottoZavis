## Why

Draw history and the latest-draw banner still show winning numbers as plain text or solid-color circles, while the Analysis frequency-bucket chart already uses decade-colored `LottoBall` components. Unifying those surfaces improves scanability and visual consistency. Page size for “더 보기” is still 20; users want batches of 30.

## What Changes

- Render main six and bonus numbers in the **당첨번호 이력** table with the shared `LottoBall` styling (decade colors, ball look).
- Apply the same balls to the **최신 당첨번호** banner (replace flat blue/rose circles).
- Balls are **display-only** (no drill-down on click).
- Change draw history fetch / load-more `limit` from **20 to 30**.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `analysis-dashboard`: Draw history presentation (lotto balls) and pagination page size 30; latest-draw banner ball styling.

## Impact

- UI: `AnalysisTab.tsx` (history table, latest banner, `fetchDraws` limit); reuse `LottoBall`
- Possibly extend `LottoBall` with a non-interactive/display mode (or omit `onClick`)
- API: none (client `limit` query only; server already allows up to 100)
- Specs: `openspec/specs/analysis-dashboard`

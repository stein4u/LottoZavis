## 1. LottoBall display mode

- [x] 1.1 Add display-only mode to `LottoBall` (non-button / no drill-down) suitable for tables and banner

## 2. Analysis UI

- [x] 2.1 Replace latest-draw banner circles with `LottoBall` (main + bonus)
- [x] 2.2 Replace history table number/bonus text with `LottoBall` stacks
- [x] 2.3 Change `fetchDraws` list page size from 20 to 30 (search stays limit 1)

## 3. Verification

- [x] 3.1 Manual: banner and history balls match decade colors; clicking does not open drill-down
- [x] 3.2 Manual: initial load and 더 보기 append 30 rows each
- [x] 3.3 Run `npm run lint`
- [x] 3.4 Run `openspec validate analysis-draw-history-balls`

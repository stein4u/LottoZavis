## 1. LottoBall display mode

- [ ] 1.1 Add display-only mode to `LottoBall` (non-button / no drill-down) suitable for tables and banner

## 2. Analysis UI

- [ ] 2.1 Replace latest-draw banner circles with `LottoBall` (main + bonus)
- [ ] 2.2 Replace history table number/bonus text with `LottoBall` stacks
- [ ] 2.3 Change `fetchDraws` list page size from 20 to 30 (search stays limit 1)

## 3. Verification

- [ ] 3.1 Manual: banner and history balls match decade colors; clicking does not open drill-down
- [ ] 3.2 Manual: initial load and 더 보기 append 30 rows each
- [ ] 3.3 Run `npm run lint`
- [ ] 3.4 Run `openspec validate analysis-draw-history-balls`

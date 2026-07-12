## 1. Helpers and ball UI

- [x] 1.1 Add `buildFrequencyBuckets(frequencies, window)` helper (per-count for 30/60/90; bin 5 for 120/150/all; omit empty bins)
- [x] 1.2 Add decade color helper + `LottoBall` component (gradient, highlight, number label)

## 2. Analysis dashboard

- [x] 2.1 Render full-width frequency-bucket stack section under the existing charts row
- [x] 2.2 Wire balls to `openDrillDown`; show `freqLabel` / bonus policy on the section
- [x] 2.3 Ensure section re-derives when `stats` changes from window or includeBonus

## 3. Verification

- [x] 3.1 Manual: window 90 → exact-count buckets; window 120 and 전체 → bin-5 labels
- [x] 3.2 Manual: toggle 보너스 미포함 reshapes stacks; ball colors match decades; click opens drill-down
- [x] 3.3 Run `npm run lint`
- [x] 3.4 Run `openspec validate analysis-freq-bucket-balls`

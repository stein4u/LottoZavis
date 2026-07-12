## 1. Helpers and ball UI

- [ ] 1.1 Add `buildFrequencyBuckets(frequencies, window)` helper (per-count for 30/60/90; bin 5 for 120/150/all; omit empty bins)
- [ ] 1.2 Add decade color helper + `LottoBall` component (gradient, highlight, number label)

## 2. Analysis dashboard

- [ ] 2.1 Render full-width frequency-bucket stack section under the existing charts row
- [ ] 2.2 Wire balls to `openDrillDown`; show `freqLabel` / bonus policy on the section
- [ ] 2.3 Ensure section re-derives when `stats` changes from window or includeBonus

## 3. Verification

- [ ] 3.1 Manual: window 90 → exact-count buckets; window 120 and 전체 → bin-5 labels
- [ ] 3.2 Manual: toggle 보너스 미포함 reshapes stacks; ball colors match decades; click opens drill-down
- [ ] 3.3 Run `npm run lint`
- [ ] 3.4 Run `openspec validate analysis-freq-bucket-balls`

## Why

The Analysis dashboard already shows per-number frequency bars (X = number, Y = count), but users also want the inverted view: group numbers by how often they appeared, stacked as familiar lotto balls. That makes frequency clusters and decade-color patterns easier to scan, and it should stay wired to the existing window and bonus-include controls.

## What Changes

- Add a **frequency-bucket ball stack** chart below the existing 45-number frequency bar chart.
- X-axis = appearance count buckets; each bucket stacks lotto-number balls for numbers with that count (or within that bin).
- Bucket mode: **per-count** for windows `30|60|90`; **bin size 5** for windows `120|150|all`.
- Balls use 동행복권-style decade colors (1–10 yellow, 11–20 blue, 21–30 red, 31–40 gray, 41–45 green) with light 3D styling; click opens the existing number drill-down.
- Chart respects the same `window` + `includeBonus` stats already loaded (no new stats API required).
- Label chart with the active frequency policy (`frequencyIncludesBonus`).

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `analysis-dashboard`: Add frequency-bucket ball-stack visualization requirements (binning rules, ball colors, window/bonus linkage, placement).

## Impact

- UI: `AnalysisTab.tsx` (new section + derived bucket data); likely small helpers/components for ball styling and bucket grouping
- Data: client-side transform of `stats.frequencies` only
- API/server: none
- Specs: `openspec/specs/analysis-dashboard`

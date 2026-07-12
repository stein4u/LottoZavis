## Context

Analysis and Predictor share `StatsWindow` (`all|50|100|200`) via `parseStatsWindow` / `computeStats`. Frequency, absence, and zone metrics always count `main six + bonus` (`frequencyIncludesBonus: true`). Co-occurrence is separately bonus-inclusive. Users want finer recent windows and a way to compare Tier A (bonus-in) vs Tier B (main-six) **frequency-family** charts without changing pair analytics or Predictor policy.

## Goals / Non-Goals

**Goals:**

- Shared window set: `30 | 60 | 90 | 120 | 150 | all` on Analysis and Predictor.
- Analysis `includeBonus` toggle (default true) that drives frequency, absence, and zoneStats only.
- Co-occurrence (`topPairs`) and Predictor weights remain bonus-inclusive.
- UI labels reflect the active bonus policy on frequency-family widgets.

**Non-Goals:**

- Changing odd/even, sum ranges, or consecutive (already main-six).
- Bonus toggle on Predictor.
- Recomputing co-occurrence as main-six pairs when toggle is off.
- Vector/RAG or wiki Tier A page regeneration.
- Changing draw ingest or cache format.

## Decisions

### 1. Shared window enum

**Choice:** `StatsWindow = "all" | 30 | 60 | 90 | 120 | 150` in client and server types; remove `50|100|200`.

**Rationale:** User requested identical Analysis/Predictor selectors; old values were arbitrary decades.

**Alternatives:** Keep old values as aliases — rejected to avoid dual UX.

### 2. `includeBonus` query (Analysis stats API)

**Choice:** `GET /api/lotto-stats?window=90&includeBonus=false`  
- Omit or `true` → current Tier A behavior.  
- `false` → frequency / absence / zoneStats use main six only; `frequencyIncludesBonus: false`.  
- `topPairs` / `coOccurrenceIncludesBonus` always computed bonus-inclusive (unchanged).

**Rationale:** Matches “빈도 계열만” decision; avoids surprising pair chart changes.

**Alternatives:** Separate endpoints — unnecessary for one boolean.

### 3. `computeStats` signature

**Choice:** `computeStats(draws, window, lastUpdated, { includeBonus?: boolean })` with default `true`.  
Internal `appearances(draw)` becomes conditional; pair counting always uses bonus-inclusive helper.

**Rationale:** Single pass, clear flag on response metadata.

### 4. Number profile endpoint

**Choice:** Accept same `window` values; accept `includeBonus` for `count` / `drawsSince` / `zone` fields. Partner lists stay bonus-inclusive (derived from co-occurrence).

**Rationale:** Drill panel frequency counts should match the chart when user toggled 미포함.

### 5. Predictor

**Choice:** Only update allowed `window` values; always call `computeStats(..., { includeBonus: true })`.

**Rationale:** User: Predictor shares windows, no bonus toggle.

### 6. UI layout

**Choice:** Analysis header keeps window chips; add adjacent segmented control **보너스 포함 | 미포함**. Frequency chart / HotCold / absence / zone labels read `stats.frequencyIncludesBonus`. Co-occurrence card keeps fixed “보너스 포함” copy.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Users confuse why pairs ignore the toggle | Keep explicit co-occurrence “보너스 포함” label; optional helper text near toggle |
| Zone sum scenario: draws×7 vs draws×6 | Spec scenarios branch on `includeBonus` |
| Stale clients sending `window=100` | Return 400 with message listing allowed values |
| Drill panel mismatch if profile ignores toggle | Pass `includeBonus` from Analysis state into profile fetch |

## Migration Plan

1. Update types + `parseStatsWindow` + `computeStats`.
2. Wire API query params and error messages.
3. Update Analysis + Predictor window UIs; Analysis bonus toggle.
4. Sync delta specs on archive.
5. No data migration — cache unchanged.

## Open Questions

None — product decisions locked: shared windows, frequency-family-only toggle, default include bonus.

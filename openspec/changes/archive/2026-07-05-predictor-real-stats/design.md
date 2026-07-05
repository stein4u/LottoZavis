## Context

LottoZavis completed `real-lotto-data-analysis`: Analysis and `/api/lotto-stats` use `server/lotto/statsEngine.ts` with bonus-inclusive frequencies. `POST /api/predict` in `server.ts` still uses hardcoded hot/cold arrays and returns fake ML metrics. `PredictorTab.tsx` displays neural-network marketing copy, ML step animations, confidence/F1, and a client-side random fallback.

Planning decision: Predictor is a **humble statistical recommendation** tool sharing Analysis data—not a trained ML system.

## Goals / Non-Goals

**Goals:**

- Single source of truth: hot/cold from `computeStats()` frequencies.
- Shared `window` parameter with Analysis.
- Honest API response and UI; remove misleading ML theater.
- Optional stats metadata on Firestore saves.

**Non-Goals:**

- Real Random Forest / XGBoost / LSTM training or inference.
- Co-occurrence or advanced analytics (separate `analysis-advanced-metrics` change).
- Changing odd/even bias logic beyond using real stats for hot/cold.
- Firebase security rule changes.

## Decisions

### 1. Extract `predictEngine.ts`

**Choice:** New module `server/lotto/predictEngine.ts` with `generatePrediction(options, stats: LottoStats)`.

**Rationale:** Keeps `server.ts` thin; reuses `computeStats` output; testable in isolation.

**Hot/cold from frequencies:**

```typescript
// Sort frequencies ascending
const sorted = [...stats.frequencies].sort((a, b) => a.count - b.count);
const coldSet = new Set(sorted.slice(0, 6).map(x => x.number));
const hotSet = new Set(sorted.slice(-6).map(x => x.number));

// Base weight = frequency count (or normalized)
// hot_heavy: boost if in top tier by count rank
// cold_heavy: boost if in bottom tier
```

Using **rank tiers (top/bottom 6)** matches Analysis hot/cold display. Alternative: continuous weight = `count` — rank tiers are simpler and consistent with UI labels.

### 2. Model types become weight profiles

Keep existing `modelType` enum for minimal frontend churn. Profiles apply small additive tweaks on top of frequency-based weights (similar to current modulo tweaks but secondary to real freq):

| Profile | Tweak idea |
|---------|------------|
| `random_forest` | Slight boost to mid-range numbers (10–38) |
| `xgboost` | Slight boost when count above window median |
| `lstm` | Slight boost to numbers with high `absence` (optional use of stats.absence) |

Profiles must not dominate frequency signal.

### 3. API response shape (**BREAKING**)

**Remove:** `confidence`, `metrics`

**Add:**

```typescript
interface PredictionResponse {
  success: true;
  numbers: number[];
  method: "weighted-random";
  statsWindow: StatsWindow;
  latestRound: number;
  frequencyIncludesBonus: true;
  timestamp: string;
}
```

Update `PredictionResult` in `src/types.ts` accordingly.

### 4. Request accepts `window`

Body: `{ modelType, oddEvenBias, hotColdBias, excludeNumbers, window?: "all"|50|100|200 }`

Server: `parseStatsWindow(window ?? "all")`, load cache, `computeStats(draws, window)`, pass to predictEngine.

### 5. PredictorTab UX changes

| Area | Change |
|------|--------|
| Hero badge | "STATISTICAL RECOMMENDATION" |
| Hero title/subtitle | Remove "Neural Network", ML model claims |
| Loading steps | "당첨 통계 로딩", "빈도 기반 가중치 적용", "홀짝 필터", "조합 생성" |
| Result panel | Show `statsWindow`, `latestRound`, sum/odd breakdown; no F1 bar |
| Window toggle | Same 4 buttons as Analysis |
| Error | Retry button, no fallback random |
| Save | Pass `statsWindow`, `latestRound` to Firestore |

### 6. Disclaimer updates

- **AnalysisTab:** Change amber banner from "Predictor is simulation" to "Recommendations do not guarantee wins; same stats source."
- **Footer:** Align with statistical recommendation framing.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Users expect ML after UI rename | Clear copy + wiki link; profile names kept as flavor only |
| **BREAKING** API clients expecting metrics | Only internal frontend consumer; update types together |
| Saved predictions missing new fields | Optional fields; old records still render |
| Weight profiles still feel arbitrary | Document as tuning presets, not models |

## Migration Plan

1. Add `predictEngine.ts` and unit-test mentally against known stats.
2. Swap `/api/predict` implementation.
3. Update types + PredictorTab in same commit.
4. Update disclaimers.
5. Manual test: same window → hot numbers in Analysis match hot bias tendency.

## Open Questions

- Keep confetti on success? *Recommendation: yes, lightweight delight is fine.*
- Rename model dropdown labels to Korean presets (e.g. "빈도 균형", "미출현 선호")? *Optional polish in tasks.*

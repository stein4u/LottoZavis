import type { StatsWindow } from "../types";

export interface FrequencyEntry {
  number: number;
  count: number;
}

export interface FreqBucket {
  key: string;
  label: string;
  min: number;
  max: number;
  numbers: number[];
}

function binSizeForWindow(window: StatsWindow): 1 | 5 {
  if (window === 30 || window === 60 || window === 90) return 1;
  return 5;
}

/** Group frequencies into X-axis buckets (exact count or bin-5). Omits empty bins. */
export function buildFrequencyBuckets(
  frequencies: FrequencyEntry[],
  window: StatsWindow
): FreqBucket[] {
  const binSize = binSizeForWindow(window);
  const map = new Map<number, number[]>();

  for (const { number, count } of frequencies) {
    const min = binSize === 1 ? count : Math.floor(count / binSize) * binSize;
    const list = map.get(min) ?? [];
    list.push(number);
    map.set(min, list);
  }

  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([min, numbers]) => {
      const max = binSize === 1 ? min : min + binSize - 1;
      const label = binSize === 1 ? String(min) : `${min}-${max}`;
      return {
        key: `${min}-${max}`,
        label,
        min,
        max,
        numbers: [...numbers].sort((a, b) => a - b),
      };
    });
}

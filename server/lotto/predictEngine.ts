import type { LottoStats, StatsWindow } from "./types.js";

export type ModelType = "random_forest" | "xgboost" | "lstm";

export interface PredictOptions {
  modelType: ModelType;
  oddEvenBias: "balanced" | "odd_heavy" | "even_heavy";
  hotColdBias: "balanced" | "hot_heavy" | "cold_heavy";
  excludeNumbers?: number[];
}

export interface PredictionResponse {
  success: true;
  numbers: number[];
  method: "weighted-random";
  statsWindow: StatsWindow;
  latestRound: number;
  frequencyIncludesBonus: true;
  timestamp: string;
}

function getHotColdSets(stats: LottoStats): { hot: Set<number>; cold: Set<number> } {
  const sorted = [...stats.frequencies].sort((a, b) => a.count - b.count);
  return {
    cold: new Set(sorted.slice(0, 6).map((x) => x.number)),
    hot: new Set(sorted.slice(-6).map((x) => x.number)),
  };
}

function buildWeights(stats: LottoStats, options: PredictOptions): { number: number; weight: number }[] {
  const { hot, cold } = getHotColdSets(stats);
  const exclude = new Set(options.excludeNumbers ?? []);
  const medianCount =
    [...stats.frequencies].sort((a, b) => a.count - b.count)[Math.floor(stats.frequencies.length / 2)]
      ?.count ?? 0;
  const absenceMap = new Map(stats.absence.map((a) => [a.number, a.drawsSince]));

  const pool: { number: number; weight: number }[] = [];

  for (let i = 1; i <= 45; i++) {
    if (exclude.has(i)) continue;

    const freq = stats.frequencies.find((f) => f.number === i)?.count ?? 0;
    let weight = Math.max(10, freq);

    if (options.hotColdBias === "hot_heavy") {
      if (hot.has(i)) weight += 50;
      if (cold.has(i)) weight -= 30;
    } else if (options.hotColdBias === "cold_heavy") {
      if (cold.has(i)) weight += 50;
      if (hot.has(i)) weight -= 30;
    }

    const isOdd = i % 2 !== 0;
    if (options.oddEvenBias === "odd_heavy") {
      if (isOdd) weight += 40;
      else weight -= 20;
    } else if (options.oddEvenBias === "even_heavy") {
      if (!isOdd) weight += 40;
      else weight -= 20;
    }

    if (options.modelType === "random_forest") {
      if (i >= 10 && i <= 38) weight += 10;
    } else if (options.modelType === "xgboost") {
      if (freq >= medianCount) weight += 15;
    } else if (options.modelType === "lstm") {
      const absence = absenceMap.get(i) ?? 0;
      if (absence >= 5) weight += 20;
    }

    weight = Math.max(10, weight);
    pool.push({ number: i, weight });
  }

  return pool;
}

function weightedSelect(pool: { number: number; weight: number }[], count: number): number[] {
  const selected: number[] = [];
  const tempPool = [...pool];

  for (let s = 0; s < count; s++) {
    if (tempPool.length === 0) break;

    const totalWeight = tempPool.reduce((acc, item) => acc + item.weight, 0);
    let rand = Math.random() * totalWeight;
    let selectedIdx = 0;

    for (let idx = 0; idx < tempPool.length; idx++) {
      rand -= tempPool[idx].weight;
      if (rand <= 0) {
        selectedIdx = idx;
        break;
      }
    }

    selected.push(tempPool[selectedIdx].number);
    tempPool.splice(selectedIdx, 1);
  }

  return selected.sort((a, b) => a - b);
}

export function generatePrediction(stats: LottoStats, options: PredictOptions): PredictionResponse {
  const pool = buildWeights(stats, options);
  const numbers = weightedSelect(pool, 6);

  return {
    success: true,
    numbers,
    method: "weighted-random",
    statsWindow: (stats.window === "all" ||
    stats.window === 30 ||
    stats.window === 60 ||
    stats.window === 90 ||
    stats.window === 120 ||
    stats.window === 150
      ? stats.window
      : "all") as StatsWindow,
    latestRound: stats.latestRound,
    frequencyIncludesBonus: true,
    timestamp: new Date().toISOString(),
  };
}

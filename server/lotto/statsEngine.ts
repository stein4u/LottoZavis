import { computePairCounts, topGlobalPairs } from "./coOccurrence.js";
import type { LottoDraw, LottoStats, StatsWindow } from "./types.js";

const SUM_RANGES = [
  { label: "50-100", min: 50, max: 100 },
  { label: "101-140", min: 101, max: 140 },
  { label: "141-180", min: 141, max: 180 },
  { label: "181-220", min: 181, max: 220 },
];

function appearances(draw: LottoDraw): number[] {
  return [...draw.numbers, draw.bonus];
}

export function sliceDraws(draws: LottoDraw[], window: StatsWindow): LottoDraw[] {
  const sorted = [...draws].sort((a, b) => a.round - b.round);
  if (window === "all") return sorted;
  return sorted.slice(Math.max(0, sorted.length - window));
}

export function parseStatsWindow(value: unknown): StatsWindow | null {
  if (value === undefined || value === "all") return "all";
  const n = Number(value);
  if ([50, 100, 200].includes(n)) return n as StatsWindow;
  return null;
}

export function computeStats(
  allDraws: LottoDraw[],
  window: StatsWindow,
  lastUpdated: string
): LottoStats {
  const draws = sliceDraws(allDraws, window);
  const drawCount = draws.length;
  const latestRound = draws.length > 0 ? draws[draws.length - 1].round : 0;

  const freqMap = new Map<number, number>();
  for (let i = 1; i <= 45; i++) freqMap.set(i, 0);

  let oddTotal = 0;
  let evenTotal = 0;
  let consecutiveDraws = 0;
  const sumBucketCounts = new Map(SUM_RANGES.map((r) => [r.label, 0]));
  const zoneCounts = { "1-15": 0, "16-30": 0, "31-45": 0 };
  const lastSeenIndex = new Map<number, number>();

  draws.forEach((draw, index) => {
    for (const num of appearances(draw)) {
      freqMap.set(num, (freqMap.get(num) ?? 0) + 1);
      lastSeenIndex.set(num, index);

      if (num <= 15) zoneCounts["1-15"]++;
      else if (num <= 30) zoneCounts["16-30"]++;
      else zoneCounts["31-45"]++;
    }

    for (const num of draw.numbers) {
      if (num % 2 === 0) evenTotal++;
      else oddTotal++;
    }

    const sorted = [...draw.numbers].sort((a, b) => a - b);
    let hasConsecutive = false;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === sorted[i - 1] + 1) {
        hasConsecutive = true;
        break;
      }
    }
    if (hasConsecutive) consecutiveDraws++;

    const sum = draw.numbers.reduce((acc, n) => acc + n, 0);
    const bucket = SUM_RANGES.find((r) => sum >= r.min && sum <= r.max);
    if (bucket) {
      sumBucketCounts.set(bucket.label, (sumBucketCounts.get(bucket.label) ?? 0) + 1);
    }
  });

  const totalOddEven = oddTotal + evenTotal;
  const zoneTotal = zoneCounts["1-15"] + zoneCounts["16-30"] + zoneCounts["31-45"];

  const frequencies = Array.from({ length: 45 }, (_, i) => ({
    number: i + 1,
    count: freqMap.get(i + 1) ?? 0,
  }));

  const absence = Array.from({ length: 45 }, (_, i) => {
    const num = i + 1;
    const lastIndex = lastSeenIndex.get(num);
    const drawsSince =
      lastIndex === undefined ? drawCount : drawCount - 1 - lastIndex;
    return { number: num, drawsSince };
  });

  const pairCounts = computePairCounts(draws);
  const topPairs = topGlobalPairs(pairCounts, drawCount, 20);

  return {
    drawCount,
    latestRound,
    window,
    lastUpdated,
    dataSource: "dhlottery",
    frequencyIncludesBonus: true,
    coOccurrenceIncludesBonus: true,
    frequencies,
    topPairs,
    oddEvenRatio: {
      odd: totalOddEven > 0 ? Math.round((oddTotal / totalOddEven) * 1000) / 10 : 0,
      even: totalOddEven > 0 ? Math.round((evenTotal / totalOddEven) * 1000) / 10 : 0,
    },
    consecutivePairsCount: consecutiveDraws,
    sumRangeStats: SUM_RANGES.map((r) => ({
      range: r.label,
      percentage:
        drawCount > 0
          ? Math.round(((sumBucketCounts.get(r.label) ?? 0) / drawCount) * 1000) / 10
          : 0,
    })),
    absence,
    zoneStats: (["1-15", "16-30", "31-45"] as const).map((zone) => ({
      zone,
      count: zoneCounts[zone],
      percentage:
        zoneTotal > 0
          ? Math.round((zoneCounts[zone] / zoneTotal) * 1000) / 10
          : 0,
    })),
  };
}

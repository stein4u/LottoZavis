import type { LottoDraw } from "./types.js";

export interface CoOccurrencePair {
  a: number;
  b: number;
  count: number;
  rate: number;
}

export interface PartnerCount {
  number: number;
  count: number;
  rate: number;
}

function pairKey(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

function parsePairKey(key: string): [number, number] {
  const [a, b] = key.split("-").map(Number);
  return [a, b];
}

function drawPairs(draw: LottoDraw): [number, number][] {
  const nums = [...draw.numbers, draw.bonus].sort((a, b) => a - b);
  const pairs: [number, number][] = [];
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      pairs.push([nums[i], nums[j]]);
    }
  }
  return pairs;
}

export function computePairCounts(draws: LottoDraw[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const draw of draws) {
    for (const [a, b] of drawPairs(draw)) {
      const key = pairKey(a, b);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return counts;
}

function rateForCount(count: number, drawCount: number): number {
  return drawCount > 0 ? Math.round((count / drawCount) * 1000) / 10 : 0;
}

export function topGlobalPairs(
  pairCounts: Map<string, number>,
  drawCount: number,
  limit = 20
): CoOccurrencePair[] {
  const pairs: CoOccurrencePair[] = [];
  for (const [key, count] of pairCounts.entries()) {
    const [a, b] = parsePairKey(key);
    pairs.push({ a, b, count, rate: rateForCount(count, drawCount) });
  }
  return pairs.sort((x, y) => y.count - x.count || x.a - y.a || x.b - y.b).slice(0, limit);
}

export function partnersForNumber(
  pairCounts: Map<string, number>,
  number: number,
  drawCount: number,
  limit = 10
): PartnerCount[] {
  const partners: PartnerCount[] = [];
  for (let n = 1; n <= 45; n++) {
    if (n === number) continue;
    const count = pairCounts.get(pairKey(number, n)) ?? 0;
    if (count > 0) {
      partners.push({ number: n, count, rate: rateForCount(count, drawCount) });
    }
  }
  return partners.sort((a, b) => b.count - a.count || a.number - b.number).slice(0, limit);
}

export function pairCountFor(pairCounts: Map<string, number>, a: number, b: number): number {
  return pairCounts.get(pairKey(a, b)) ?? 0;
}

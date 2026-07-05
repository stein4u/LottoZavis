import { computePairCounts, partnersForNumber } from "./coOccurrence.js";
import { sliceDraws } from "./statsEngine.js";
import type { LottoDraw, NumberProfile, StatsWindow } from "./types.js";

function zoneFor(n: number): "1-15" | "16-30" | "31-45" {
  if (n <= 15) return "1-15";
  if (n <= 30) return "16-30";
  return "31-45";
}

export function buildNumberProfile(
  allDraws: LottoDraw[],
  window: StatsWindow,
  number: number
): NumberProfile {
  const draws = sliceDraws(allDraws, window);
  const drawCount = draws.length;
  const latestRound = draws.length > 0 ? draws[draws.length - 1].round : 0;

  let count = 0;
  let lastSeenIndex: number | undefined;
  draws.forEach((draw, index) => {
    if (draw.numbers.includes(number) || draw.bonus === number) {
      count++;
      lastSeenIndex = index;
    }
  });

  const drawsSince = lastSeenIndex === undefined ? drawCount : drawCount - 1 - lastSeenIndex;
  const pairCounts = computePairCounts(draws);

  return {
    number,
    window,
    drawCount,
    latestRound,
    frequencyIncludesBonus: true,
    coOccurrenceIncludesBonus: true,
    count,
    drawsSince,
    zone: zoneFor(number),
    topPartners: partnersForNumber(pairCounts, number, drawCount, 10),
  };
}

import { computePairCounts, pairCountFor } from "../server/lotto/coOccurrence.js";
import { drawContainsNumber, queryDraws } from "../server/lotto/drawsApi.js";
import type { LottoDraw } from "../server/lotto/types.js";

const draw: LottoDraw = {
  round: 1,
  date: "2024-01-01",
  numbers: [3, 12, 19, 27, 33, 41],
  bonus: 7,
};
const pairs = computePairCounts([draw]);
const pair37 = pairCountFor(pairs, 3, 7);
console.log("6.1 pair (3,7):", pair37 === 1 ? "PASS" : "FAIL", pair37);

const draws: LottoDraw[] = [
  { round: 10, date: "d", numbers: [1, 2, 3, 4, 5, 6], bonus: 7 },
  { round: 9, date: "d", numbers: [23, 24, 25, 26, 27, 28], bonus: 29 },
  { round: 8, date: "d", numbers: [10, 11, 12, 13, 14, 15], bonus: 23 },
];
const filtered = queryDraws(draws, { contains: 23, limit: 10, offset: 0 });
const allContain23 = filtered.draws.every((d) => drawContainsNumber(d, 23));
console.log(
  "6.2 contains=23:",
  allContain23 && filtered.total === 2 ? "PASS" : "FAIL",
  "total=",
  filtered.total
);

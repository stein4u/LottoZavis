import { bulkIngest } from "../server/lotto/ingest.js";

console.log("Seeding lotto draw cache...");
const cache = await bulkIngest((round) => {
  if (round % 50 === 0) process.stdout.write(`\rRound ${round}...`);
});
console.log(`\nDone: ${cache.draws.length} draws, latest round ${cache.latestRound}`);

import { readCache, writeCache } from "./cache.js";
import { delay, fetchDraw, findLatestRound } from "./fetchDraw.js";
import type { LottoDraw, LottoDrawsCache } from "./types.js";

const THROTTLE_MS = 120;

export function getCacheSnapshot(): LottoDrawsCache | null {
  return readCache();
}

export async function bulkIngest(onProgress?: (round: number) => void): Promise<LottoDrawsCache> {
  const latestRound = await findLatestRound();
  const draws: LottoDraw[] = [];

  for (let round = 1; round <= latestRound; round++) {
    const draw = await fetchDraw(round);
    if (draw) draws.push(draw);
    onProgress?.(round);
    await delay(THROTTLE_MS);
  }

  const cache: LottoDrawsCache = {
    latestRound,
    lastUpdated: new Date().toISOString(),
    draws: draws.sort((a, b) => a.round - b.round),
  };

  writeCache(cache);
  return cache;
}

export async function incrementalRefresh(): Promise<{ addedCount: number; latestRound: number }> {
  const existing = readCache();
  const startRound = existing?.latestRound ? existing.latestRound + 1 : 1;
  const upstreamLatest = await findLatestRound();

  if (existing && startRound > upstreamLatest) {
    const updated: LottoDrawsCache = {
      ...existing,
      lastUpdated: new Date().toISOString(),
    };
    writeCache(updated);
    return { addedCount: 0, latestRound: existing.latestRound };
  }

  const draws = existing ? [...existing.draws] : [];
  let addedCount = 0;

  for (let round = startRound; round <= upstreamLatest; round++) {
    const draw = await fetchDraw(round);
    if (draw) {
      draws.push(draw);
      addedCount++;
    }
    await delay(THROTTLE_MS);
  }

  const cache: LottoDrawsCache = {
    latestRound: upstreamLatest,
    lastUpdated: new Date().toISOString(),
    draws: draws.sort((a, b) => a.round - b.round),
  };

  writeCache(cache);
  return { addedCount, latestRound: upstreamLatest };
}

export async function ensureLottoData(): Promise<LottoDrawsCache> {
  const existing = readCache();
  if (existing && existing.draws.length > 0) {
    console.log(`Lotto cache loaded: ${existing.draws.length} draws (latest ${existing.latestRound})`);
    return existing;
  }

  console.log("Lotto cache missing — starting bulk ingest (this may take a few minutes)...");
  const cache = await bulkIngest((round) => {
    if (round % 100 === 0) console.log(`Ingested through round ${round}...`);
  });
  console.log(`Bulk ingest complete: ${cache.draws.length} draws`);
  return cache;
}

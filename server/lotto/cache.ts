import fs from "fs";
import path from "path";
import type { LottoDrawsCache } from "./types.js";

const CACHE_PATH = path.join(process.cwd(), "data", "lotto-draws.json");

export function getCachePath(): string {
  return CACHE_PATH;
}

export function readCache(): LottoDrawsCache | null {
  try {
    if (!fs.existsSync(CACHE_PATH)) return null;
    const raw = fs.readFileSync(CACHE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as LottoDrawsCache;
    if (!parsed.draws || !Array.isArray(parsed.draws)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeCache(cache: LottoDrawsCache): void {
  const dir = path.dirname(CACHE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), "utf-8");
}

export function isCacheEmpty(): boolean {
  const cache = readCache();
  return !cache || cache.draws.length === 0;
}

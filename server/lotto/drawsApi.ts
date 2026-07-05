import type { LottoDraw, LottoDrawResponse, DrawsListResponse } from "./types.js";

export function enrichDraw(draw: LottoDraw): LottoDrawResponse {
  const sum = draw.numbers.reduce((acc, n) => acc + n, 0);
  const oddCount = draw.numbers.filter((n) => n % 2 !== 0).length;
  return { ...draw, sum, oddCount };
}

export function drawContainsNumber(draw: LottoDraw, number: number): boolean {
  return draw.numbers.includes(number) || draw.bonus === number;
}

export function parseContainsNumber(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 45) return null;
  return n;
}

export function queryDraws(
  draws: LottoDraw[],
  options: {
    from?: number;
    to?: number;
    limit?: number;
    offset?: number;
    contains?: number;
  }
): DrawsListResponse {
  const { from, to, limit = 20, offset = 0, contains } = options;

  let filtered = [...draws].sort((a, b) => b.round - a.round);

  if (contains !== undefined) {
    filtered = filtered.filter((d) => drawContainsNumber(d, contains));
  }

  if (from !== undefined) {
    filtered = filtered.filter((d) => d.round >= from);
  }
  if (to !== undefined) {
    filtered = filtered.filter((d) => d.round <= to);
  }

  const total = filtered.length;
  const page = filtered.slice(offset, offset + limit).map(enrichDraw);

  return { total, draws: page };
}

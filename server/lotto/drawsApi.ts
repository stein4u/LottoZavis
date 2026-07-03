import type { LottoDraw, LottoDrawResponse, DrawsListResponse } from "./types.js";

export function enrichDraw(draw: LottoDraw): LottoDrawResponse {
  const sum = draw.numbers.reduce((acc, n) => acc + n, 0);
  const oddCount = draw.numbers.filter((n) => n % 2 !== 0).length;
  return { ...draw, sum, oddCount };
}

export function queryDraws(
  draws: LottoDraw[],
  options: {
    from?: number;
    to?: number;
    limit?: number;
    offset?: number;
  }
): DrawsListResponse {
  const { from, to, limit = 20, offset = 0 } = options;

  let filtered = [...draws].sort((a, b) => b.round - a.round);

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

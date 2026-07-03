export interface LottoDraw {
  round: number;
  date: string;
  numbers: number[];
  bonus: number;
}

export interface LottoDrawsCache {
  latestRound: number;
  lastUpdated: string;
  draws: LottoDraw[];
}

export type StatsWindow = "all" | 50 | 100 | 200;

export interface LottoStats {
  drawCount: number;
  latestRound: number;
  window: StatsWindow | number;
  lastUpdated: string;
  dataSource: "dhlottery";
  frequencyIncludesBonus: true;
  frequencies: { number: number; count: number }[];
  oddEvenRatio: { odd: number; even: number };
  consecutivePairsCount: number;
  sumRangeStats: { range: string; percentage: number }[];
  absence: { number: number; drawsSince: number }[];
  zoneStats: {
    zone: "1-15" | "16-30" | "31-45";
    count: number;
    percentage: number;
  }[];
}

export interface LottoDrawResponse extends LottoDraw {
  sum: number;
  oddCount: number;
}

export interface DrawsListResponse {
  total: number;
  draws: LottoDrawResponse[];
}

export enum TabId {
  Predictor = "predictor",
  Analysis = "analysis",
  Wiki = "wiki",
  HowTo = "howto",
  Contact = "contact"
}

export type ModelType = "random_forest" | "xgboost" | "lstm";

export type StatsWindow = "all" | 30 | 60 | 90 | 120 | 150;

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

export interface NumberProfile {
  number: number;
  window: StatsWindow | number | string;
  drawCount: number;
  latestRound: number;
  frequencyIncludesBonus: boolean;
  coOccurrenceIncludesBonus: boolean;
  count: number;
  drawsSince: number;
  zone: "1-15" | "16-30" | "31-45";
  topPartners: PartnerCount[];
}

export interface PredictionResult {
  numbers: number[];
  method: "weighted-random";
  statsWindow: StatsWindow | number | string;
  latestRound: number;
  frequencyIncludesBonus: boolean;
  timestamp: string;
}

export interface LottoDraw {
  round: number;
  date: string;
  numbers: number[];
  bonus: number;
  sum?: number;
  oddCount?: number;
}

export interface DrawsListResponse {
  total: number;
  draws: LottoDraw[];
}

export interface LottoStats {
  drawCount: number;
  latestRound: number;
  window: StatsWindow | number | string;
  lastUpdated: string;
  dataSource: string;
  frequencyIncludesBonus: boolean;
  coOccurrenceIncludesBonus: boolean;
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
  topPairs: CoOccurrencePair[];
}

export interface WikiArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  codeSnippet?: string;
}

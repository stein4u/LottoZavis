export enum TabId {
  Predictor = "predictor",
  Analysis = "analysis",
  Wiki = "wiki",
  HowTo = "howto",
  Contact = "contact"
}

export type ModelType = "random_forest" | "xgboost" | "lstm";

export interface PredictionResult {
  numbers: number[];
  confidence: number;
  metrics: {
    precision: string;
    recall: string;
    f1: string;
  };
  timestamp: string;
}

export interface LottoStats {
  drawCount: number;
  frequencies: { number: number; count: number }[];
  oddEvenRatio: { odd: number; even: number };
  consecutivePairsCount: number;
  sumRangeStats: { range: string; percentage: number }[];
}

export interface WikiArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  codeSnippet?: string;
}

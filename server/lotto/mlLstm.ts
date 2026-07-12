import fs from "fs";
import path from "path";
import { runPythonScript } from "./mlRf.js";

const ROOT = process.cwd();
const ML_DIR = path.join(ROOT, "data", "ml");
const MODEL_PATH_KERAS = path.join(ML_DIR, "lstm_model.keras");
const MODEL_PATH_H5 = path.join(ML_DIR, "lstm_model.h5");
const METRICS_PATH = path.join(ML_DIR, "lstm_metrics.json");
const PREDICT_SCRIPT = path.join(ROOT, "ml", "predict_lstm.py");

export interface LstmMetrics {
  hitMean: number;
  hitStd: number;
  hitHist: number[];
  bestValLoss: number;
  finalValLoss: number;
  valLossCurve?: number[];
  trainLossCurve?: number[];
  overfitNote: string;
  prizeMean: number;
  rankHist: number[];
  prizeAssumptions?: Record<string, unknown>;
  trainedAt: string;
  latestRound: number;
  sampleCount: number;
  bonusIncluded: boolean;
  windowK?: number;
  modelPath?: string;
}

export interface LstmStatus {
  available: boolean;
  metrics: LstmMetrics | null;
  modelExists: boolean;
  metricsExists: boolean;
}

export function readLstmMetrics(): LstmMetrics | null {
  try {
    if (!fs.existsSync(METRICS_PATH)) return null;
    return JSON.parse(fs.readFileSync(METRICS_PATH, "utf-8")) as LstmMetrics;
  } catch {
    return null;
  }
}

export function getLstmStatus(): LstmStatus {
  const modelExists = fs.existsSync(MODEL_PATH_KERAS) || fs.existsSync(MODEL_PATH_H5);
  const metrics = readLstmMetrics();
  const metricsExists = metrics !== null;
  return {
    available: modelExists && metricsExists,
    metrics,
    modelExists,
    metricsExists,
  };
}

export async function runLstmPredict(): Promise<
  | {
      success: true;
      numbers: number[];
      method: "lstm-ml";
      latestRound: number;
      trainedAt?: string;
      hitMean?: number;
      hitStd?: number;
      hitHist?: number[];
      bestValLoss?: number;
      finalValLoss?: number;
      overfitNote?: string;
      prizeMean?: number;
      rankHist?: number[];
      bonusIncluded: false;
      timestamp: string;
    }
  | { success: false; error: string }
> {
  const status = getLstmStatus();
  if (!status.available) {
    return {
      success: false,
      error:
        "LSTM model cache is missing. Run: pip install -r ml/requirements-lstm.txt && npm run train:lstm",
    };
  }

  const result = await runPythonScript(PREDICT_SCRIPT, 180_000);
  if (result.code !== 0) {
    return { success: false, error: result.stderr || result.stdout || "predict failed" };
  }

  try {
    const parsed = JSON.parse(result.stdout.trim().split("\n").pop() || "{}");
    if (!parsed.success || !Array.isArray(parsed.numbers) || parsed.numbers.length !== 6) {
      return { success: false, error: parsed.error || "Invalid predict output" };
    }
    return {
      success: true,
      numbers: parsed.numbers.map((n: number) => Number(n)).sort((a: number, b: number) => a - b),
      method: "lstm-ml",
      latestRound: Number(parsed.latestRound),
      trainedAt: parsed.trainedAt,
      hitMean: parsed.hitMean,
      hitStd: parsed.hitStd,
      hitHist: parsed.hitHist,
      bestValLoss: parsed.bestValLoss,
      finalValLoss: parsed.finalValLoss,
      overfitNote: parsed.overfitNote,
      prizeMean: parsed.prizeMean,
      rankHist: parsed.rankHist,
      bonusIncluded: false,
      timestamp: new Date().toISOString(),
    };
  } catch (e: any) {
    return { success: false, error: e?.message || "Failed to parse predict output" };
  }
}

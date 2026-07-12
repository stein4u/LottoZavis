import { spawn, execFileSync } from "child_process";
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const ML_DIR = path.join(ROOT, "data", "ml");
const MODEL_PATH = path.join(ML_DIR, "rf_model.joblib");
const METRICS_PATH = path.join(ML_DIR, "rf_metrics.json");
const TRAIN_SCRIPT = path.join(ROOT, "ml", "train_rf.py");
const PREDICT_SCRIPT = path.join(ROOT, "ml", "predict_rf.py");

export interface RfMetrics {
  r2: number;
  hitMean: number;
  hitStd: number;
  hitHist: number[];
  trainedAt: string;
  latestRound: number;
  sampleCount: number;
  roundSampleCount?: number;
  bonusIncluded: boolean;
  lookbackW?: number;
  holdoutFrac?: number;
  nEstimators?: number;
  modelPath?: string;
}

export interface RfStatus {
  available: boolean;
  metrics: RfMetrics | null;
  modelExists: boolean;
  metricsExists: boolean;
}

function candidates(): string[] {
  if (process.platform === "win32") {
    return ["py", "python", "python3"];
  }
  return ["python3", "python"];
}

export function resolvePython(): string | null {
  // Prefer env override
  if (process.env.PYTHON && process.env.PYTHON.trim()) {
    return process.env.PYTHON.trim();
  }

  for (const cmd of candidates()) {
    try {
      if (cmd === "py") {
        execFileSync(cmd, ["-3", "--version"], { stdio: "ignore" });
      } else {
        execFileSync(cmd, ["--version"], { stdio: "ignore" });
      }
      return cmd;
    } catch {
      // try next
    }
  }
  return null;
}

function pythonArgs(script: string, extra: string[] = []): { cmd: string; args: string[] } | null {
  const cmd = resolvePython();
  if (!cmd) return null;
  if (cmd === "py") {
    return { cmd, args: ["-3", script, ...extra] };
  }
  return { cmd, args: [script, ...extra] };
}

function runPythonScript(script: string, timeoutMs = 600_000): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const resolved = pythonArgs(script);
    if (!resolved) {
      resolve({ code: 127, stdout: "", stderr: "Python interpreter not found (tried py/python/python3)." });
      return;
    }

    const child = spawn(resolved.cmd, resolved.args, {
      cwd: ROOT,
      env: process.env,
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill();
      resolve({ code: 124, stdout, stderr: stderr + "\nTimed out." });
    }, timeoutMs);

    child.stdout.on("data", (d) => {
      stdout += d.toString();
    });
    child.stderr.on("data", (d) => {
      stderr += d.toString();
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({ code: 1, stdout, stderr: stderr + "\n" + err.message });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code: code ?? 1, stdout, stderr });
    });
  });
}

/** Fire-and-forget safe train after draw refresh. Never throws. */
export async function trainRfModelSafe(): Promise<{ ok: boolean; error?: string }> {
  if (!fs.existsSync(TRAIN_SCRIPT)) {
    console.warn("[ml-rf] train script missing:", TRAIN_SCRIPT);
    return { ok: false, error: "train script missing" };
  }

  console.log("[ml-rf] Starting Random Forest training...");
  const result = await runPythonScript(TRAIN_SCRIPT);
  if (result.code !== 0) {
    console.warn("[ml-rf] Training failed:", result.stderr || result.stdout);
    return { ok: false, error: result.stderr || result.stdout || `exit ${result.code}` };
  }
  console.log("[ml-rf] Training complete.");
  return { ok: true };
}

export function readRfMetrics(): RfMetrics | null {
  try {
    if (!fs.existsSync(METRICS_PATH)) return null;
    return JSON.parse(fs.readFileSync(METRICS_PATH, "utf-8")) as RfMetrics;
  } catch {
    return null;
  }
}

export function getRfStatus(): RfStatus {
  const modelExists = fs.existsSync(MODEL_PATH);
  const metrics = readRfMetrics();
  const metricsExists = metrics !== null;
  return {
    available: modelExists && metricsExists,
    metrics,
    modelExists,
    metricsExists,
  };
}

export async function runRfPredict(): Promise<
  | {
      success: true;
      numbers: number[];
      method: "random-forest-ml";
      latestRound: number;
      trainedAt?: string;
      r2?: number;
      hitMean?: number;
      hitStd?: number;
      hitHist?: number[];
      bonusIncluded: false;
      timestamp: string;
    }
  | { success: false; error: string }
> {
  const status = getRfStatus();
  if (!status.available) {
    return {
      success: false,
      error: "Random Forest model cache is missing. Run lotto refresh or python ml/train_rf.py after installing ml/requirements.txt.",
    };
  }

  const result = await runPythonScript(PREDICT_SCRIPT, 120_000);
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
      method: "random-forest-ml",
      latestRound: Number(parsed.latestRound),
      trainedAt: parsed.trainedAt,
      r2: parsed.r2,
      hitMean: parsed.hitMean,
      hitStd: parsed.hitStd,
      hitHist: parsed.hitHist,
      bonusIncluded: false,
      timestamp: new Date().toISOString(),
    };
  } catch (e: any) {
    return { success: false, error: e?.message || "Failed to parse predict output" };
  }
}

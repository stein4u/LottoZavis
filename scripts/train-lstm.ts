import { spawn } from "child_process";
import path from "path";
import { resolvePython } from "../server/lotto/mlRf.js";

const ROOT = process.cwd();
const SCRIPT = path.join(ROOT, "ml", "train_lstm.py");

const py = resolvePython();
if (!py) {
  console.error("Python not found. Install Python 3 and: pip install -r ml/requirements-lstm.txt");
  process.exit(127);
}

const args = py === "py" ? ["-3", SCRIPT] : [SCRIPT];
const child = spawn(py, args, { cwd: ROOT, stdio: "inherit", windowsHide: true, env: process.env });
child.on("exit", (code) => process.exit(code ?? 1));

#!/usr/bin/env python3
"""Score next-draw top-6 numbers from cached Random Forest model."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import joblib

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))

from train_rf import (  # noqa: E402
    DRAWS_PATH,
    METRICS_PATH,
    MODEL_PATH,
    load_draws,
    score_next_numbers,
)


def predict() -> dict:
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

    bundle = joblib.load(MODEL_PATH)
    model = bundle["model"] if isinstance(bundle, dict) else bundle
    W = bundle.get("W", 50) if isinstance(bundle, dict) else 50

    draws = load_draws(DRAWS_PATH)
    numbers = score_next_numbers(draws, model, W=W)

    metrics = {}
    if METRICS_PATH.exists():
        metrics = json.loads(METRICS_PATH.read_text(encoding="utf-8"))

    return {
        "success": True,
        "numbers": numbers,
        "method": "random-forest-ml",
        "latestRound": metrics.get("latestRound", draws[-1]["round"] if draws else None),
        "trainedAt": metrics.get("trainedAt"),
        "r2": metrics.get("r2"),
        "hitMean": metrics.get("hitMean"),
        "hitStd": metrics.get("hitStd"),
        "hitHist": metrics.get("hitHist"),
        "bonusIncluded": False,
    }


def main() -> int:
    try:
        result = predict()
        print(json.dumps(result, ensure_ascii=False))
        return 0
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}, ensure_ascii=False), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""Score next-draw top-6 from cached LSTM model."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))

from train_lstm import (  # noqa: E402
    DRAWS_PATH,
    K,
    METRICS_PATH,
    MODEL_PATH,
    MODEL_PATH_H5,
    load_draws,
    score_next,
)


def resolve_model_path() -> Path:
    if MODEL_PATH.exists():
        return MODEL_PATH
    if MODEL_PATH_H5.exists():
        return MODEL_PATH_H5
    raise FileNotFoundError(f"Model not found: {MODEL_PATH} or {MODEL_PATH_H5}. Run npm run train:lstm")


def predict() -> dict:
    model_path = resolve_model_path()

    from tensorflow import keras

    model = keras.models.load_model(model_path)
    draws = load_draws(DRAWS_PATH)
    numbers = score_next(draws, model, K=K)

    metrics = {}
    if METRICS_PATH.exists():
        metrics = json.loads(METRICS_PATH.read_text(encoding="utf-8"))

    return {
        "success": True,
        "numbers": numbers,
        "method": "lstm-ml",
        "latestRound": metrics.get("latestRound", draws[-1]["round"] if draws else None),
        "trainedAt": metrics.get("trainedAt"),
        "hitMean": metrics.get("hitMean"),
        "hitStd": metrics.get("hitStd"),
        "hitHist": metrics.get("hitHist"),
        "bestValLoss": metrics.get("bestValLoss"),
        "finalValLoss": metrics.get("finalValLoss"),
        "overfitNote": metrics.get("overfitNote"),
        "prizeMean": metrics.get("prizeMean"),
        "rankHist": metrics.get("rankHist"),
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

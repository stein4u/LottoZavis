#!/usr/bin/env python3
"""Train Random Forest appearance-score model on lotto draws (main-6 only)."""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import r2_score

ROOT = Path(__file__).resolve().parents[1]
DRAWS_PATH = ROOT / "data" / "lotto-draws.json"
OUT_DIR = ROOT / "data" / "ml"
MODEL_PATH = OUT_DIR / "rf_model.joblib"
METRICS_PATH = OUT_DIR / "rf_metrics.json"

W = 50
N_ESTIMATORS = 120
RANDOM_STATE = 42
HOLDOUT_FRAC = 0.2


def load_draws(path: Path = DRAWS_PATH) -> list[dict]:
    with path.open(encoding="utf-8") as f:
        cache = json.load(f)
    draws = sorted(cache["draws"], key=lambda d: d["round"])
    return draws


def _zone_one_hot(n: int) -> tuple[float, float, float]:
    if n <= 15:
        return 1.0, 0.0, 0.0
    if n <= 30:
        return 0.0, 1.0, 0.0
    return 0.0, 0.0, 1.0


def features_for_round(
    draws: list[dict],
    target_index: int,
    W: int = W,
) -> np.ndarray:
    """Feature matrix shape (45, F) for predicting draw at target_index from prior draws only."""
    prior = draws[:target_index]
    if not prior:
        raise ValueError("Need at least one prior draw")

    window = prior[-W:] if len(prior) >= W else prior
    last = prior[-1]
    prior_sum = float(sum(last["numbers"]))
    prior_odd = float(sum(1 for x in last["numbers"] if x % 2 == 1))

    freq = {n: 0 for n in range(1, 46)}
    for d in window:
        for n in d["numbers"]:
            freq[n] += 1

    last_seen_idx = {n: -1 for n in range(1, 46)}
    for i, d in enumerate(prior):
        for n in d["numbers"]:
            last_seen_idx[n] = i

    rows = []
    for n in range(1, 46):
        z1, z2, z3 = _zone_one_hot(n)
        if last_seen_idx[n] < 0:
            draws_since = float(len(prior))
        else:
            draws_since = float(len(prior) - 1 - last_seen_idx[n])
        rows.append(
            [
                float(freq[n]),
                draws_since,
                z1,
                z2,
                z3,
                1.0 if n % 2 == 1 else 0.0,
                prior_sum,
                prior_odd,
            ]
        )
    return np.asarray(rows, dtype=np.float64)


def labels_for_round(draw: dict) -> np.ndarray:
    present = set(draw["numbers"])
    return np.asarray([1 if n in present else 0 for n in range(1, 46)], dtype=np.int32)


def build_Xy(draws: list[dict], W: int = W) -> tuple[np.ndarray, np.ndarray, list[int]]:
    """Return X, y, and target round indices (into draws) for each 45-row block."""
    X_blocks: list[np.ndarray] = []
    y_blocks: list[np.ndarray] = []
    round_indices: list[int] = []

    # Need index >= 1 so prior exists
    for ti in range(1, len(draws)):
        X_blocks.append(features_for_round(draws, ti, W=W))
        y_blocks.append(labels_for_round(draws[ti]))
        round_indices.append(ti)

    X = np.vstack(X_blocks)
    y = np.concatenate(y_blocks)
    return X, y, round_indices


def chronological_holdout_mask(round_indices: list[int], holdout_frac: float = HOLDOUT_FRAC) -> np.ndarray:
    """Mask over sample rows (45 per round): True = holdout."""
    unique_rounds = sorted(set(round_indices))
    cut = max(1, int(len(unique_rounds) * (1.0 - holdout_frac)))
    holdout_rounds = set(unique_rounds[cut:])
    mask = []
    for ri in round_indices:
        mask.extend([ri in holdout_rounds] * 45)
    return np.asarray(mask, dtype=bool)


def top6_from_proba(proba_45: np.ndarray) -> list[int]:
    order = np.argsort(-proba_45)
    nums = (order[:6] + 1).tolist()
    return sorted(int(x) for x in nums)


def evaluate_holdout(
    model: RandomForestClassifier,
    X: np.ndarray,
    y: np.ndarray,
    round_indices: list[int],
    holdout_mask: np.ndarray,
    draws: list[dict],
) -> dict:
    X_h = X[holdout_mask]
    y_h = y[holdout_mask]
    if len(y_h) == 0:
        return {"r2": 0.0, "hitMean": 0.0, "hitStd": 0.0, "hitHist": [0] * 7}

    proba = model.predict_proba(X_h)[:, 1]
    r2 = float(r2_score(y_h, proba))

    # Reconstruct per-round blocks in holdout order
    holdout_round_idxs = []
    seen = set()
    for ri, is_h in zip(round_indices, holdout_mask[::45]):
        if is_h and ri not in seen:
            holdout_round_idxs.append(ri)
            seen.add(ri)

    hits: list[int] = []
    hist = [0] * 7
    # Map round index -> proba slice
    # Build index of first row for each round in X
    row_start = 0
    round_to_start: dict[int, int] = {}
    for ri in round_indices:
        if ri not in round_to_start:
            round_to_start[ri] = row_start
        row_start += 45

    for ri in holdout_round_idxs:
        start = round_to_start[ri]
        block = X[start : start + 45]
        p = model.predict_proba(block)[:, 1]
        pred = set(top6_from_proba(p))
        actual = set(draws[ri]["numbers"])
        hit = len(pred & actual)
        hits.append(hit)
        hist[hit] += 1

    hit_arr = np.asarray(hits, dtype=np.float64) if hits else np.array([0.0])
    return {
        "r2": r2,
        "hitMean": float(hit_arr.mean()),
        "hitStd": float(hit_arr.std(ddof=0)),
        "hitHist": hist,
    }


def score_next_numbers(draws: list[dict], model: RandomForestClassifier, W: int = W) -> list[int]:
    X = features_for_round(draws, len(draws), W=W)
    proba = model.predict_proba(X)[:, 1]
    return top6_from_proba(proba)


def train_and_save(
    draws_path: Path = DRAWS_PATH,
    out_dir: Path = OUT_DIR,
) -> dict:
    draws = load_draws(draws_path)
    if len(draws) < 10:
        raise RuntimeError(f"Need more draws to train (got {len(draws)})")

    X, y, round_indices = build_Xy(draws, W=W)
    holdout_mask = chronological_holdout_mask(round_indices)
    train_mask = ~holdout_mask

    model_eval = RandomForestClassifier(
        n_estimators=N_ESTIMATORS,
        random_state=RANDOM_STATE,
        n_jobs=-1,
        class_weight="balanced_subsample",
    )
    model_eval.fit(X[train_mask], y[train_mask])
    metrics_core = evaluate_holdout(model_eval, X, y, round_indices, holdout_mask, draws)

    model = RandomForestClassifier(
        n_estimators=N_ESTIMATORS,
        random_state=RANDOM_STATE,
        n_jobs=-1,
        class_weight="balanced_subsample",
    )
    model.fit(X, y)

    out_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": model, "W": W, "featureNames": [
        "freq_W", "drawsSince", "zone_1_15", "zone_16_30", "zone_31_45", "is_odd", "prior_sum", "prior_odd"
    ]}, MODEL_PATH)

    latest_round = int(draws[-1]["round"])
    metrics = {
        **metrics_core,
        "trainedAt": datetime.now(timezone.utc).isoformat(),
        "latestRound": latest_round,
        "sampleCount": int(len(y)),
        "roundSampleCount": int(len(round_indices)),
        "bonusIncluded": False,
        "lookbackW": W,
        "holdoutFrac": HOLDOUT_FRAC,
        "nEstimators": N_ESTIMATORS,
        "modelPath": str(MODEL_PATH.relative_to(ROOT)).replace("\\", "/"),
    }
    METRICS_PATH.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    return metrics


def main() -> int:
    try:
        metrics = train_and_save()
        print(json.dumps({"success": True, "metrics": metrics}, ensure_ascii=False))
        return 0
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}, ensure_ascii=False), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

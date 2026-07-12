#!/usr/bin/env python3
"""Train windowed LSTM multi-label model on lotto draws (main-6 only)."""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
DRAWS_PATH = ROOT / "data" / "lotto-draws.json"
OUT_DIR = ROOT / "data" / "ml"
MODEL_PATH = OUT_DIR / "lstm_model.keras"
MODEL_PATH_H5 = OUT_DIR / "lstm_model.h5"
METRICS_PATH = OUT_DIR / "lstm_metrics.json"

K = 10
LSTM_UNITS = 128
EPOCHS = 40
BATCH_SIZE = 32
PATIENCE = 5
RANDOM_SEED = 42

# Simplified mean prizes (KRW) inspired by tykimos article averages — not live payouts.
MEAN_PRIZE = [
    2_434_854_568.0,  # 1등
    57_192_272.0,  # 2등
    1_451_891.0,  # 3등
    53_061.0,  # 4등
    5_000.0,  # 5등
]


def load_draws(path: Path = DRAWS_PATH) -> list[dict]:
    with path.open(encoding="utf-8") as f:
        cache = json.load(f)
    return sorted(cache["draws"], key=lambda d: d["round"])


def numbers2ohbin(numbers: list[int]) -> np.ndarray:
    oh = np.zeros(45, dtype=np.float32)
    for n in numbers:
        oh[int(n) - 1] = 1.0
    return oh


def top6_from_proba(proba: np.ndarray) -> list[int]:
    order = np.argsort(-proba)
    return sorted(int(x) + 1 for x in order[:6])


def calc_rank_prize(true_numbers: list[int], true_bonus: int, pred_numbers: list[int]) -> tuple[int, float]:
    """Return (rank_code, prize). rank_code: 0=1등 .. 4=5등, 5=낙첨."""
    count = sum(1 for p in pred_numbers if p in true_numbers)
    if count == 6:
        return 0, MEAN_PRIZE[0]
    if count == 5 and true_bonus in pred_numbers:
        return 1, MEAN_PRIZE[1]
    if count == 5:
        return 2, MEAN_PRIZE[2]
    if count == 4:
        return 3, MEAN_PRIZE[3]
    if count == 3:
        return 4, MEAN_PRIZE[4]
    return 5, 0.0


def build_windows(draws: list[dict], K: int = K) -> tuple[np.ndarray, np.ndarray, list[int]]:
    """X (N,K,45), y (N,45), target_indices into draws for each sample."""
    ohbins = [numbers2ohbin(d["numbers"]) for d in draws]
    xs: list[np.ndarray] = []
    ys: list[np.ndarray] = []
    targets: list[int] = []
    for t in range(K, len(draws)):
        window = np.stack(ohbins[t - K : t], axis=0)
        xs.append(window)
        ys.append(ohbins[t])
        targets.append(t)
    return np.asarray(xs, dtype=np.float32), np.asarray(ys, dtype=np.float32), targets


def chronological_splits(n: int) -> tuple[slice, slice, slice]:
    train_end = int(n * 0.70)
    val_end = int(n * 0.85)
    train_end = max(1, train_end)
    val_end = max(train_end + 1, val_end)
    if val_end >= n:
        val_end = n - 1
    return slice(0, train_end), slice(train_end, val_end), slice(val_end, n)


def evaluate_hits_and_prizes(
    model,
    X: np.ndarray,
    draws: list[dict],
    target_indices: list[int],
) -> dict:
    if len(X) == 0:
        return {
            "hitMean": 0.0,
            "hitStd": 0.0,
            "hitHist": [0] * 7,
            "prizeMean": 0.0,
            "rankHist": [0] * 6,
        }

    proba = model.predict(X, verbose=0)
    hits: list[int] = []
    hit_hist = [0] * 7
    prizes: list[float] = []
    rank_hist = [0] * 6

    for i, ti in enumerate(target_indices):
        pred = top6_from_proba(proba[i])
        actual = draws[ti]["numbers"]
        bonus = int(draws[ti].get("bonus", 0))
        hit = len(set(pred) & set(actual))
        hits.append(hit)
        hit_hist[hit] += 1
        rank, prize = calc_rank_prize(actual, bonus, pred)
        prizes.append(prize)
        rank_hist[rank] += 1

    hit_arr = np.asarray(hits, dtype=np.float64)
    return {
        "hitMean": float(hit_arr.mean()),
        "hitStd": float(hit_arr.std(ddof=0)),
        "hitHist": hit_hist,
        "prizeMean": float(np.mean(prizes)) if prizes else 0.0,
        "rankHist": rank_hist,
    }


def train_and_save() -> dict:
    import tensorflow as tf
    from tensorflow import keras

    tf.random.set_seed(RANDOM_SEED)
    np.random.seed(RANDOM_SEED)

    draws = load_draws()
    if len(draws) < K + 20:
        raise RuntimeError(f"Need more draws (got {len(draws)}, need > {K + 20})")

    X, y, targets = build_windows(draws, K=K)
    n = len(X)
    train_sl, val_sl, test_sl = chronological_splits(n)

    X_train, y_train = X[train_sl], y[train_sl]
    X_val, y_val = X[val_sl], y[val_sl]
    X_test = X[test_sl]
    test_targets = targets[test_sl]

    model = keras.Sequential(
        [
            keras.layers.Input(shape=(K, 45)),
            keras.layers.LSTM(LSTM_UNITS, return_sequences=False),
            keras.layers.Dense(45, activation="sigmoid"),
        ]
    )
    model.compile(loss="binary_crossentropy", optimizer="adam")

    history = model.fit(
        X_train,
        y_train,
        validation_data=(X_val, y_val) if len(X_val) else None,
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        verbose=0,
        callbacks=[
            keras.callbacks.EarlyStopping(
                monitor="val_loss" if len(X_val) else "loss",
                patience=PATIENCE,
                restore_best_weights=True,
            )
        ],
    )

    train_losses = [float(x) for x in history.history.get("loss", [])]
    val_losses = [float(x) for x in history.history.get("val_loss", [])]
    best_val = float(min(val_losses)) if val_losses else float(min(train_losses) if train_losses else 0.0)
    final_val = float(val_losses[-1]) if val_losses else float(train_losses[-1] if train_losses else 0.0)
    overfit_note = "val_loss_rose_or_flat_early"
    if val_losses and len(val_losses) >= 2:
        if val_losses[-1] > val_losses[0] * 1.02:
            overfit_note = "val_loss_increased_vs_start (likely overfit; lottery is independent trials)"
        elif best_val < final_val * 0.98:
            overfit_note = "best_val_earlier_than_final (mild overfit signal)"
        else:
            overfit_note = "val_loss_stable_or_improved"

    hit_prize = evaluate_hits_and_prizes(model, X_test, draws, test_targets)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    # TF 2.12: prefer HDF5; also try .keras when available
    try:
        model.save(MODEL_PATH)
        saved_rel = str(MODEL_PATH.relative_to(ROOT)).replace("\\", "/")
    except Exception:
        model.save(MODEL_PATH_H5)
        saved_rel = str(MODEL_PATH_H5.relative_to(ROOT)).replace("\\", "/")

    # Refit note: serving model is the early-stopped best weights from train/val (already restored).
    latest_round = int(draws[-1]["round"])
    metrics = {
        "hitMean": hit_prize["hitMean"],
        "hitStd": hit_prize["hitStd"],
        "hitHist": hit_prize["hitHist"],
        "bestValLoss": best_val,
        "finalValLoss": final_val,
        "valLossCurve": val_losses[-40:],
        "trainLossCurve": train_losses[-40:],
        "overfitNote": overfit_note,
        "prizeMean": hit_prize["prizeMean"],
        "rankHist": hit_prize["rankHist"],
        "prizeAssumptions": {
            "currency": "KRW",
            "source": "static means inspired by tykimos deep-lotto article; not live 동행복권 payouts",
            "meanPrizeByRank": MEAN_PRIZE,
            "ticketCostAssumed": 1000,
        },
        "trainedAt": datetime.now(timezone.utc).isoformat(),
        "latestRound": latest_round,
        "sampleCount": int(n),
        "trainCount": int(len(X_train)),
        "valCount": int(len(X_val)),
        "testCount": int(len(X_test)),
        "bonusIncluded": False,
        "windowK": K,
        "lstmUnits": LSTM_UNITS,
        "epochsRequested": EPOCHS,
        "epochsRan": len(train_losses),
        "modelPath": saved_rel,
    }
    METRICS_PATH.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    return metrics


def score_next(draws: list[dict], model, K: int = K) -> list[int]:
    if len(draws) < K:
        raise RuntimeError(f"Need at least {K} draws to build window")
    ohbins = [numbers2ohbin(d["numbers"]) for d in draws[-K:]]
    X = np.stack(ohbins, axis=0)[None, :, :]
    proba = model.predict(X, verbose=0)[0]
    return top6_from_proba(proba)


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

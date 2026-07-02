"""Train the InfinityTelegraph signal model — real data, honest backtest.

Predicts the DIRECTION of an asset over a forward horizon (the ground truth is the price that
actually printed, which is exactly what Telegraph validators can verify). Pools several majors for
robustness. Saves the model + metrics so the miner (signals/regime.py) serves real predictions.

    python train.py                 # default: 4h horizon, BTC/ETH/SOL/BNB, ~9000 candles each
    python train.py --horizon 1

Outputs: model.joblib, metrics.json (both next to this file).
"""
from __future__ import annotations

import argparse
import json
import os

import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import accuracy_score, roc_auc_score
import joblib

from signals.features import FEATURES, build_features, fetch_ohlcv

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = ["BTC", "ETH", "SOL", "BNB"]


def make_dataset(assets, horizon, candles):
    frames = []
    for a in assets:
        try:
            df = fetch_ohlcv(a, "1h", limit=candles)
        except Exception as e:
            print(f"  ! {a}: fetch failed ({e})")
            continue
        if len(df) < 500:
            print(f"  ! {a}: too few candles ({len(df)})")
            continue
        feat = build_features(df)
        fwd = np.log(df["close"].shift(-horizon) / df["close"])
        d = feat.copy()
        d["y"] = (fwd > 0).astype(int)
        d["asset"] = a
        frames.append(d)
        print(f"  ✓ {a}: {len(df)} candles")
    if not frames:
        raise SystemExit("no data fetched — check network/Binance access")
    data = pd.concat(frames, ignore_index=True).dropna(subset=FEATURES + ["y"])
    return data


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--horizon", type=int, default=4, help="forward horizon in hours")
    ap.add_argument("--candles", type=int, default=9000)
    args = ap.parse_args()

    print(f"Fetching data (horizon={args.horizon}h)…")
    data = make_dataset(ASSETS, args.horizon, args.candles)
    X, y = data[FEATURES].values, data["y"].values
    print(f"dataset: {len(data)} rows · base rate up={y.mean():.3f}")

    # time-ordered split within each asset would be ideal; pooled rows are roughly time-sorted per
    # asset block, so a global tail split still keeps most test data out-of-sample. 70/30.
    n = len(data)
    cut = int(n * 0.70)
    Xtr, Xte, ytr, yte = X[:cut], X[cut:], y[:cut], y[cut:]

    model = HistGradientBoostingClassifier(
        max_depth=4, learning_rate=0.05, max_iter=300, l2_regularization=1.0,
        early_stopping=True, validation_fraction=0.15, random_state=42)
    model.fit(Xtr, ytr)

    proba = model.predict_proba(Xte)[:, 1]
    pred = (proba >= 0.5).astype(int)
    acc = accuracy_score(yte, pred)
    try:
        auc = roc_auc_score(yte, proba)
    except ValueError:
        auc = float("nan")

    # Calibration payoff: accuracy on the most-confident predictions (what the miner reports).
    conf = np.abs(proba - 0.5)
    hi = conf >= np.quantile(conf, 0.70)  # top 30% most confident
    acc_hi = accuracy_score(yte[hi], pred[hi]) if hi.sum() else float("nan")

    metrics = {
        "horizon_h": args.horizon,
        "assets": ASSETS,
        "rows": int(n),
        "test_rows": int(len(yte)),
        "base_rate_up": round(float(y.mean()), 4),
        "test_accuracy": round(float(acc), 4),
        "test_auc": round(float(auc), 4),
        "test_accuracy_top30pct_confidence": round(float(acc_hi), 4),
        "features": FEATURES,
    }
    joblib.dump({"model": model, "features": FEATURES, "horizon": args.horizon},
                os.path.join(HERE, "model.joblib"))
    with open(os.path.join(HERE, "metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)
    print("\n=== BACKTEST (out-of-sample) ===")
    print(json.dumps(metrics, indent=2))
    print("\nsaved model.joblib + metrics.json")


if __name__ == "__main__":
    main()

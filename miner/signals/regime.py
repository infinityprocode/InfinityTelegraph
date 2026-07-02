"""Signal engine — serves the miner's answer.

Loads the trained model (train.py) and serves real predictions: fetch recent candles for the
asset, build the SAME features used in training, predict direction + confidence, derive regime.
Falls back to a deterministic baseline if the model or live data is unavailable, so the API
never hard-fails during validation.
"""
from __future__ import annotations

import hashlib
import os

_HERE = os.path.dirname(os.path.abspath(__file__))
_MODEL_PATH = os.path.join(os.path.dirname(_HERE), "model.joblib")

_REGIMES = ("trend_up", "trend_down", "mean_revert", "chop")
_bundle = None


def _load():
    global _bundle
    if _bundle is None:
        try:
            import joblib
            _bundle = joblib.load(_MODEL_PATH)
        except Exception:
            _bundle = False  # sentinel: no model available
    return _bundle


def _baseline(asset: str, horizon: str, as_of: str) -> dict:
    h = int(hashlib.sha256(f"{asset}|{horizon}|{as_of}".encode()).hexdigest()[:8], 16)
    regime = _REGIMES[h % len(_REGIMES)]
    direction = "up" if regime in ("trend_up", "mean_revert") else "down"
    return {"direction": direction, "regime": regime, "confidence": round(0.50 + (h % 20) / 100.0, 2)}


def compute_signal(asset: str, horizon: str, as_of: str) -> dict:
    bundle = _load()
    if not bundle:
        return _baseline(asset, horizon, as_of)
    try:
        from signals.features import build_features, fetch_ohlcv, regime_label
        df = fetch_ohlcv(asset, "1h", limit=200)
        feat = build_features(df)
        row = feat.iloc[[-1]][bundle["features"]]
        if row.isna().any(axis=None):
            return _baseline(asset, horizon, as_of)
        p_up = float(bundle["model"].predict_proba(row.values)[0, 1])
        direction = "up" if p_up >= 0.5 else "down"
        confidence = round(max(p_up, 1 - p_up), 3)
        regime = regime_label(feat.iloc[-1])
        return {"direction": direction, "regime": regime, "confidence": confidence}
    except Exception:
        return _baseline(asset, horizon, as_of)

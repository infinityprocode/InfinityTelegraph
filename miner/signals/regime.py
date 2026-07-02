"""Signal engine (baseline).

`compute_signal` returns the fields the miner serves. This baseline is a transparent,
deterministic momentum/regime heuristic so the API is fully runnable today. It is the seam
where the trained quant model plugs in — same input/output contract, better predictions.

Design constraints that matter for Telegraph scoring:
- Deterministic for a given (asset, horizon, as_of) so validator scoring is reproducible.
- Output must map to an objectively verifiable ground truth (realized price direction).
"""
from __future__ import annotations

import hashlib

_REGIMES = ("trend_up", "trend_down", "mean_revert", "chop")


def _seed(asset: str, horizon: str, as_of: str) -> int:
    h = hashlib.sha256(f"{asset}|{horizon}|{as_of}".encode()).hexdigest()
    return int(h[:8], 16)


def compute_signal(asset: str, horizon: str, as_of: str) -> dict:
    """Baseline placeholder. Replace body with the trained model's inference.

    Returns dict with keys: direction, regime, confidence.
    """
    # TODO(model): fetch recent OHLCV for `asset`, run the trained regime/direction model,
    # and return calibrated probabilities. Until then, a deterministic stand-in keeps the
    # service honest and testable end-to-end without pretending to have skill.
    s = _seed(asset, horizon, as_of)
    regime = _REGIMES[s % len(_REGIMES)]
    direction = "up" if regime in ("trend_up", "mean_revert") else "down"
    # confidence intentionally modest for the baseline; the model will calibrate this.
    confidence = round(0.50 + (s % 20) / 100.0, 2)  # 0.50..0.69
    return {"direction": direction, "regime": regime, "confidence": confidence}

"""InfinityTelegraph miner — signal API.

Serves the market-intelligence signal Telegraph routes to (see ../docs/MINER.md).
This is the upstream API the Telegraph YAML points at (`external_path: /v1/signal`).

Runnable skeleton: the HTTP contract, auth and response shape are real; the signal
itself is a transparent baseline (momentum/regime) that we swap for the trained
quant model. Kept deterministic per `as_of` so validator scoring is reproducible.

    uvicorn app:app --host 0.0.0.0 --port 8080
"""
from __future__ import annotations

import os
from datetime import datetime, timezone

from fastapi import FastAPI, Header, HTTPException, Query
from pydantic import BaseModel

from signals.regime import compute_signal

API_KEY = os.environ.get("INFINITY_MINER_API_KEY", "")
MODEL_VERSION = "infinity-regime-v1"

app = FastAPI(title="InfinityTelegraph Miner", version=MODEL_VERSION)


class SignalResponse(BaseModel):
    asset: str
    horizon: str
    direction: str      # "up" | "down"
    regime: str         # "trend_up" | "trend_down" | "mean_revert" | "chop"
    confidence: float   # 0..1
    as_of: str
    model: str


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "model": MODEL_VERSION}


@app.get("/paper/stats")
def paper_stats() -> dict:
    # Paper-engine aggregate (win rate / PnL / asymmetry). Read-only; the timer writes.
    try:
        import paper
        return paper.stats()
    except Exception as e:
        return {"settled": 0, "note": f"paper indisponível: {e}"}


@app.get("/paper/report")
def paper_report() -> dict:
    # Relatório de validação (janelas + veredito + texto pt-BR pro Telegram).
    try:
        import paper
        return paper.report()
    except Exception as e:
        return {"veredito": f"indisponível: {e}", "texto": f"relatório indisponível: {e}"}


@app.get("/setups")
def setups() -> dict:
    # Fade setups (news + momentum, local LLM). Read-only; the scanner timer writes setups.json.
    import json as _j
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "setups.json")
    try:
        return _j.load(open(p, encoding="utf-8"))
    except Exception:
        return {"setups": [], "nota": "scanner ainda não rodou"}


@app.get("/v1/signal", response_model=SignalResponse)
def signal(
    symbol: str = Query(..., description="asset, e.g. BTC"),
    horizon: str = Query("1h", description="prediction horizon, e.g. 1h/4h/1d"),
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
) -> SignalResponse:
    # Auth: the Telegraph node injects X-API-Key from its env (see telegraph-miner.yaml).
    # If a key is configured, require it; if not (local dev), allow.
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="invalid api key")

    as_of = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    sig = compute_signal(symbol.upper(), horizon, as_of)
    return SignalResponse(asset=symbol.upper(), horizon=horizon, model=MODEL_VERSION, as_of=as_of, **sig)

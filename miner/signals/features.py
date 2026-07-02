"""Feature engineering + data fetch — shared by training and serving.

Keeping features in one place guarantees train/serve parity (a classic source of silent bugs).
Data source: Binance public klines (no API key). Swappable behind `fetch_ohlcv`.
"""
from __future__ import annotations

import time
from typing import Optional

import numpy as np
import pandas as pd
import httpx

BINANCE = "https://api.binance.com/api/v3/klines"


def _symbol(asset: str) -> str:
    a = asset.upper().replace("USDT", "").replace("USD", "")
    return f"{a}USDT"


def fetch_ohlcv(asset: str, interval: str = "1h", limit: int = 1000,
                end_ms: Optional[int] = None) -> pd.DataFrame:
    """Fetch OHLCV candles. Paginates backward if limit > 1000."""
    out: list[list] = []
    remaining = limit
    params_end = end_ms
    with httpx.Client(timeout=20) as c:
        while remaining > 0:
            batch = min(1000, remaining)
            params = {"symbol": _symbol(asset), "interval": interval, "limit": batch}
            if params_end:
                params["endTime"] = params_end
            r = c.get(BINANCE, params=params)
            r.raise_for_status()
            rows = r.json()
            if not rows:
                break
            out = rows + out
            params_end = rows[0][0] - 1
            remaining -= len(rows)
            if len(rows) < batch:
                break
    df = pd.DataFrame(out, columns=[
        "open_time", "open", "high", "low", "close", "volume",
        "close_time", "qav", "trades", "tbav", "tqav", "ignore"])
    for col in ("open", "high", "low", "close", "volume"):
        df[col] = df[col].astype(float)
    df["ts"] = pd.to_datetime(df["open_time"], unit="ms", utc=True)
    return df.drop_duplicates("open_time").reset_index(drop=True)


def _rsi(close: pd.Series, n: int = 14) -> pd.Series:
    d = close.diff()
    up = d.clip(lower=0).ewm(alpha=1 / n, adjust=False).mean()
    dn = (-d.clip(upper=0)).ewm(alpha=1 / n, adjust=False).mean()
    rs = up / dn.replace(0, np.nan)
    return (100 - 100 / (1 + rs)).fillna(50)


FEATURES = [
    "ret1", "ret4", "ret12", "ret24",
    "vol12", "vol24", "mom_ratio", "rsi14", "ma_fast_slow", "range_pos",
]


def build_features(df: pd.DataFrame) -> pd.DataFrame:
    """Compute the model feature matrix. Deterministic; no look-ahead (all backward-looking)."""
    c = df["close"]
    f = pd.DataFrame(index=df.index)
    logret = np.log(c / c.shift(1))
    f["ret1"] = logret
    f["ret4"] = np.log(c / c.shift(4))
    f["ret12"] = np.log(c / c.shift(12))
    f["ret24"] = np.log(c / c.shift(24))
    f["vol12"] = logret.rolling(12).std()
    f["vol24"] = logret.rolling(24).std()
    ma_f, ma_s = c.rolling(12).mean(), c.rolling(48).mean()
    f["mom_ratio"] = (ma_f / ma_s) - 1
    f["rsi14"] = _rsi(c) / 100.0
    f["ma_fast_slow"] = (c / ma_s) - 1
    rng = (df["high"] - df["low"]).replace(0, np.nan)
    f["range_pos"] = ((c - df["low"]) / rng).fillna(0.5)
    return f


def regime_label(feat_row: pd.Series) -> str:
    """Rule-based regime from features (deterministic). trend_up/trend_down/mean_revert/chop."""
    mom = feat_row.get("mom_ratio", 0.0)
    vol = feat_row.get("vol24", 0.0)
    hi_vol = vol > 0.02  # ~2% hourly stdev is elevated for majors
    if mom > 0.005:
        return "trend_up"
    if mom < -0.005:
        return "trend_down"
    return "chop" if hi_vol else "mean_revert"

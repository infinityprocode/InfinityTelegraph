"""Paper engine — prove the signal before any real money.

For each asset it records the model's direction call, then settles it against REAL price action
by simulating the CEO's target scalp: fixed TP/SL (default ±0.5% of price = ~$5 on $100 @ 10x),
whichever is hit first within the horizon; if neither, close at horizon price. This directly tests
the question that matters: is the model's direction good enough to make the small-fixed-target
scalp profitable AFTER the asymmetry?

    python -m paper run        # snapshot new predictions + settle matured ones (called by timer)
    python -m paper stats      # print aggregate stats

Stores to miner/paper.db (SQLite). Read by the /paper/stats endpoint → dashboard.
"""
from __future__ import annotations

import os
import sqlite3
import sys
import time

from signals.features import fetch_ohlcv
from signals.regime import compute_signal

HERE = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(HERE, "paper.db")
ASSETS = ["BTC", "ETH", "SOL", "BNB"]
HORIZON_H = 4
TP = 0.005   # +0.5% target  (~$5 on $100 @ 10x)
SL = 0.005   # -0.5% stop     (keeps loss <= win: the asymmetry that makes it work)


def _db() -> sqlite3.Connection:
    c = sqlite3.connect(DB)
    c.execute("""create table if not exists preds(
        id integer primary key, asset text, direction text, confidence real,
        entry_price real, entry_ts integer, horizon_h int,
        exit_price real, exit_ts integer, outcome text, pnl_usd real, settled int default 0)""")
    return c


def _now() -> int:
    return int(time.time())


def snapshot() -> int:
    """Record one prediction per asset at the current price."""
    c = _db(); n = 0
    for a in ASSETS:
        try:
            df = fetch_ohlcv(a, "1h", limit=60)
            price = float(df["close"].iloc[-1])
            iso = df["ts"].iloc[-1].strftime("%Y-%m-%dT%H:%M:%SZ")
            sig = compute_signal(a, f"{HORIZON_H}h", iso)
            c.execute("insert into preds(asset,direction,confidence,entry_price,entry_ts,horizon_h) values(?,?,?,?,?,?)",
                      (a, sig["direction"], sig["confidence"], price, _now(), HORIZON_H))
            n += 1
        except Exception as e:
            print(f"snapshot {a} failed: {e}")
    c.commit(); c.close()
    return n


def settle() -> int:
    """Settle predictions whose horizon has elapsed, simulating fixed TP/SL scalp on real candles."""
    c = _db(); n = 0
    cutoff = _now() - HORIZON_H * 3600
    rows = c.execute("select id,asset,direction,entry_price,entry_ts,horizon_h from preds where settled=0 and entry_ts<=?", (cutoff,)).fetchall()
    for pid, asset, direction, entry, ets, hz in rows:
        try:
            df = fetch_ohlcv(asset, "1h", limit=48)
            window = df[(df["ts"].astype("int64") // 10**9) > ets]
            if window.empty:
                continue
            long = direction == "up"
            tp_px = entry * (1 + TP) if long else entry * (1 - TP)
            sl_px = entry * (1 - SL) if long else entry * (1 + SL)
            outcome, exit_px = None, None
            for _, k in window.head(hz).iterrows():
                hi, lo = float(k["high"]), float(k["low"])
                hit_tp = hi >= tp_px if long else lo <= tp_px
                hit_sl = lo <= sl_px if long else hi >= sl_px
                if hit_sl:  # conservative: if both in same candle, assume stop first
                    outcome, exit_px = "loss", sl_px; break
                if hit_tp:
                    outcome, exit_px = "win", tp_px; break
            if outcome is None:  # neither hit: close at last price in window
                exit_px = float(window.head(hz)["close"].iloc[-1])
                move = (exit_px - entry) / entry * (1 if long else -1)
                outcome = "win" if move > 0 else "loss"
            move = (exit_px - entry) / entry * (1 if long else -1)
            pnl = round(move * 1000, 2)  # $100 @ 10x = $1000 notional
            c.execute("update preds set exit_price=?,exit_ts=?,outcome=?,pnl_usd=?,settled=1 where id=?",
                      (exit_px, _now(), outcome, pnl, pid))
            n += 1
        except Exception as e:
            print(f"settle {pid} {asset} failed: {e}")
    c.commit(); c.close()
    return n


def stats() -> dict:
    c = _db()
    rows = c.execute("select outcome,pnl_usd,asset from preds where settled=1").fetchall()
    openn = c.execute("select count(*) from preds where settled=0").fetchone()[0]
    c.close()
    n = len(rows)
    if not n:
        return {"settled": 0, "open": openn, "note": "coletando: cada trade leva 4h pra liquidar"}
    wins = [r[1] for r in rows if r[0] == "win"]
    losses = [r[1] for r in rows if r[0] == "loss"]
    total = sum(r[1] for r in rows)
    return {
        "settled": n, "open": openn,
        "win_rate": round(100 * len(wins) / n, 1),
        "pnl_total": round(total, 2),
        "avg_win": round(sum(wins) / len(wins), 2) if wins else 0.0,
        "avg_loss": round(sum(losses) / len(losses), 2) if losses else 0.0,
        "tp_sl_pct": TP * 100,
    }


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "run"
    if cmd == "run":
        s = snapshot(); st = settle()
        print(f"snapshot={s} settled={st}")
    elif cmd == "stats":
        import json
        print(json.dumps(stats(), indent=2, ensure_ascii=False))

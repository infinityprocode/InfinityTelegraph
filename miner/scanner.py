"""Fade-setup scanner — strategy 1 (news + momentum), local LLM.

The CEO's manual edge, automated: detect an EXPLOSIVE move, read the news catalyst with a LOCAL LLM
(Ollama on the workstation, free per call), and emit a FADE setup (up move → short, down → long)
with a short pt-BR rationale. Heuristic + monitoring only, never advice. Writes setups.json,
served by /setups → the panel's "Setups de fade" section.

    python -m scanner run     # scan all assets, write setups.json (called by timer)
"""
from __future__ import annotations

import json
import os
import re
import time

import httpx

from signals.features import fetch_ohlcv

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "setups.json")
OLLAMA = os.environ.get("OLLAMA_URL", "http://100.86.212.52:11434")
MODEL = os.environ.get("SCANNER_MODEL", "gemma4:12b")

ASSETS = {
    "BTC": ("bitcoin", "btc"), "ETH": ("ethereum", "ether", "eth"),
    "SOL": ("solana", "sol"), "BNB": ("bnb", "binance coin"),
}
RSS = ["https://cointelegraph.com/rss", "https://www.coindesk.com/arc/outboundfeeds/rss/"]
MOVE_1H = 2.5   # % em 1h = explosivo
MOVE_3H = 4.0   # % em 3h = explosivo


def _headlines() -> list[str]:
    out = []
    with httpx.Client(timeout=12, headers={"User-Agent": "Mozilla/5.0"}) as c:
        for url in RSS:
            try:
                xml = c.get(url).text
                out += re.findall(r"<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</title>", xml)[1:26]
            except Exception:
                continue
    return [h.strip() for h in out if h.strip()]


def _move(asset: str) -> dict | None:
    try:
        df = fetch_ohlcv(asset, "1h", limit=6)
        c = df["close"].astype(float).tolist()
        m1 = (c[-1] / c[-2] - 1) * 100
        m3 = (c[-1] / c[-4] - 1) * 100
        if abs(m1) >= MOVE_1H or abs(m3) >= MOVE_3H:
            return {"m1": round(m1, 2), "m3": round(m3, 2), "price": c[-1]}
    except Exception:
        pass
    return None


def _llm(asset: str, mv: dict, heads: list[str]) -> dict:
    pat = re.compile(r"\b(" + "|".join(re.escape(k) for k in ASSETS[asset]) + r")\b", re.I)
    rel = [h for h in heads if pat.search(h)][:5]
    prompt = (
        f"Ativo: {asset}. Movimento recente: {mv['m3']}% em 3h ({mv['m1']}% na última hora).\n"
        f"Manchetes recentes:\n" + ("\n".join(f"- {h}" for h in rel) if rel else "- (nenhuma manchete específica)") +
        "\n\nO movimento parece um exagero (overreaction) que tende a reverter? Responda SÓ JSON: "
        '{"catalisador": true/false, "sentimento": "alta/baixa/neutro", "fade_ok": true/false, '
        '"nota": "uma frase curta em português, sem travessão, sobre o porquê"}'
    )
    try:
        r = httpx.post(f"{OLLAMA}/api/chat", timeout=90, json={
            "model": MODEL, "format": "json", "stream": False,
            "messages": [{"role": "user", "content": prompt}],
            "options": {"temperature": 0.3},
        })
        data = json.loads(r.json()["message"]["content"])
        note = re.sub(r"[—–]", ",", str(data.get("nota", "")).strip())[:180]
        sent = data.get("sentimento", "neutro")
        cat = bool(data.get("catalisador"))
        if not note:
            note = (f"movimento com catalisador de notícia ({sent}); "
                    + ("evitar fade" if not data.get("fade_ok", True) else "possível exagero, fade")) if cat \
                   else "movimento sem catalisador claro, tende a reverter"
        return {"catalisador": cat, "sentimento": sent,
                "fade_ok": bool(data.get("fade_ok", True)), "nota": note, "headlines": rel}
    except Exception as e:
        return {"catalisador": False, "sentimento": "neutro", "fade_ok": True,
                "nota": "sem leitura de notícia agora", "headlines": rel, "_err": str(e)[:80]}


def run() -> dict:
    heads = _headlines()
    setups = []
    for asset in ASSETS:
        mv = _move(asset)
        if not mv:
            continue
        up = mv["m3"] > 0
        llm = _llm(asset, mv, heads)
        setups.append({
            "asset": asset, "move_3h": mv["m3"], "move_1h": mv["m1"],
            "fade_dir": "short" if up else "long",       # desmaiar o movimento
            "explosao": "alta" if up else "baixa",
            "catalisador": llm["catalisador"], "sentimento": llm["sentimento"],
            "nota": llm["nota"], "headlines": llm["headlines"],
        })
    doc = {"gerado_em": int(time.time()), "modelo": MODEL, "setups": setups,
           "nota": "" if setups else "nenhum movimento explosivo agora, monitorando"}
    tmp = OUT + ".tmp"  # escrita atômica: leitura concorrente nunca pega JSON parcial
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, indent=2)
    os.replace(tmp, OUT)
    return doc


if __name__ == "__main__":
    print(json.dumps(run(), ensure_ascii=False, indent=2))

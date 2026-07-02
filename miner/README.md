# Miner

The signal API Telegraph routes to, plus its YAML descriptor. Spec: [`../docs/MINER.md`](../docs/MINER.md).

## Run locally

```bash
cd miner
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env         # leave INFINITY_MINER_API_KEY blank for local dev
uvicorn app:app --host 0.0.0.0 --port 8080
```

Test:

```bash
curl "http://localhost:8080/health"
curl "http://localhost:8080/v1/signal?symbol=BTC&horizon=1h"
```

## Files

| File | What |
|---|---|
| `app.py` | FastAPI service — `/health`, `/v1/signal` (the contract Telegraph reads) |
| `signals/regime.py` | Signal engine. Baseline now; **the trained quant model plugs in here** |
| `telegraph-miner.yaml` | Public Telegraph descriptor (routing, auth, intents). No secrets |
| `.env.example` | Local config template (real `.env` is gitignored) |

## Status
- ✅ HTTP contract, auth, response shape, YAML — real and runnable.
- 🔧 `signals/regime.py` is a deterministic baseline; swap in the trained model.
- ⏳ On-chain registration (Base Sepolia) — see [`../scripts`](../scripts) once the wallet is set up.

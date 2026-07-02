# The Miner

Our miner supplies a **verifiable market-intelligence signal** to Telegraph. This doc is the spec:
what it answers, the API contract, the Telegraph YAML, and how it registers.

> Naming note: Telegraph's YAML/API still uses `subnet` in some fields for historical reasons
> (it started by wrapping Bittensor subnets). Today a "miner" is *any* provider integrated via YAML —
> a hosted model, a private API, whatever. Ours is `protocol: generic`.

## What it answers

| Intent (target) | Input | Output | Ground truth (how validators score us) |
|---|---|---|---|
| `PRICE_DIRECTION` | `asset`, `horizon` | `direction` ∈ {up, down}, `confidence` 0–1 | The realized price move over the horizon, scraped from a whitelisted market data URL |
| `MARKET_REGIME` | `asset`, `horizon` | `regime` ∈ {trend_up, trend_down, mean_revert, chop} | Realized path stats over the horizon |

The winning property: **the answer is checkable against what actually happened.** We only serve
intents whose ground truth is objective and scrapable — that's where a real quant model beats guesses,
and where the leaderboard rewards genuine skill.

> The exact Intent set + scoring script for H1 comes from the hackathon task specs (early-access,
> before Aug 17). This spec is our target; we adapt the label/params to match the published Intent.

## API contract (what the miner serves)

`GET /v1/signal?symbol={asset}&horizon={horizon}` → `200`

```json
{
  "asset": "BTC",
  "horizon": "1h",
  "direction": "up",
  "regime": "trend_up",
  "confidence": 0.71,
  "as_of": "2026-08-17T12:00:00Z",
  "model": "infinity-regime-v1"
}
```

- Stateless, low-latency, deterministic for a given `as_of` (so scoring is reproducible).
- Auth via `X-API-Key` header (the dispatcher injects it; the raw key never lives in the YAML).

## Telegraph YAML descriptor

The network reads a public YAML to route to us. See [`../miner/telegraph-miner.yaml`](../miner/telegraph-miner.yaml).
Key fields (per Telegraph's YAML standard):

- `version: "1"`, `kind: miner`, `protocol: generic`
- `id` — numeric miner ID (assigned at registration; placeholder until then)
- `slug` — unique kebab-case id (`infinity-market-regime`)
- `base_url` — our HTTPS miner endpoint
- `auth` — `header` / `X-API-Key` / env var (never the raw key)
- `endpoints[].param_map` — maps Telegraph's request params to our API's params
- `semantics.signal_mapping` + `supported_intents` — how validators interpret our output

## Registration (Base Sepolia, testnet)

Permissionless. Prereqs (all testnet, all free via faucets):

1. **Host the YAML** at a stable public URL (IPFS recommended, HTTPS ok).
2. **Compute its SHA-256** — the on-chain registry pins this so nodes verify the hosted YAML matches:
   ```bash
   sha256sum miner/telegraph-miner.yaml | awk '{print "0x"$1}'
   ```
3. **Bond 100 MACHINA** (testnet) + a little **Base Sepolia ETH** for gas.
4. A **fee address** (EVM wallet) for MACHINA payouts.
5. Register via `cast` (Foundry) — see [`../scripts`](../scripts).

After registration the nodes auto-detect and validate the YAML and add us to the routing pool at the
next epoch. New miners get a **7-day grace period** with 5% of routed traffic to build a track record —
we use that window to prove accuracy fast and let our own app pour demand in.

## How we earn (and why the app matters)

Miners earn **only from demand**: an agent pays USDC → 2% treasury, 98% is TWAP-swapped to MACHINA over
24h and sent to our fee address. No emissions to miners. So: more real usage of our signal = higher
rank + more rewards. Our consumer app is the demand engine — see [ARCHITECTURE.md](./ARCHITECTURE.md).

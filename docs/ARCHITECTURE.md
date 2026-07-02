# Architecture

InfinityTelegraph has two halves that reinforce each other on the Telegraph network:

```
                       ┌─────────────────────────────────────────┐
                       │            TELEGRAPH (Base)              │
                       │                                          │
   agent / app  ──x402/ERC-8183──►  miner dispatcher  ──►  OUR MINER (signal API)
        ▲              │                    │                     │
        │              │                    ▼                     ▼
        │              │            validators score      returns scored signal
        │              │          vs canonical ground-truth  (regime/direction)
        │              │            (zkTLS scrape)                │
        └──────────────┴───── verified answer + on-chain settlement ◄──┘
```

## 1. The miner (supply side) — `miner/`

A **Telegraph miner** is not custom protocol code: it's an HTTP API plus a declarative **YAML
descriptor** that tells the network how to route to us and how to read our answers
(see [MINER.md](./MINER.md)). Our miner exposes a **market-intelligence signal**:

- **Input:** an asset + horizon (e.g. `BTC`, `1h`).
- **Output:** a scored signal — `regime` (trend/mean-revert/chop), `direction` (up/down),
  and a calibrated `confidence`.
- **Why it can win:** validators verify answers against a **canonical, scrapable ground truth**.
  A directional/price signal is objectively checkable after the horizon elapses (the price that
  actually printed), so our score reflects real predictive skill — not vibes.

The signal engine reuses the quant methodology from our production trading stack (regime detection,
momentum/mean-reversion, anomaly flags), adapted to emit a single verifiable label per request.

## 2. The app / agent (demand side) — `app/`

On Telegraph, a miner's rank and rewards come **100% from demand** — how much its inference is
actually consumed (see [ROADMAP.md](./ROADMAP.md) and the tokenomics notes). So we ship a real
consumer:

- A dashboard/agent that **hires our own miner** (via x402 for off-chain calls, ERC-8183 for
  on-chain jobs) and turns the signal into something a person or a bot uses.
- Every call the app makes is demand routed to our miner → drives our leaderboard score, our
  "apps built on your miner" count, and the app track's "usage/adoption" metric at the same time.

## 3. How a request flows

1. The app requests an **Intent** (e.g. `PRICE_DIRECTION`) for an asset via the miner dispatcher.
2. x402 issues a `402`, the client signs a micro-payment in **USDC (Base Sepolia / Solana devnet)**,
   and retries.
3. The dispatcher routes to our miner based on leaderboard score (new miners get a 7-day grace
   window with 5% of traffic to build a record).
4. Our miner returns the scored signal.
5. Validators scrape the canonical ground truth (zkTLS), score the answer, reach consensus.
6. Settlement: 98% of the USDC is TWAP-swapped to MACHINA and sent to our fee address; 2% to treasury.

## 4. Chains & endpoints (testnet)

| Thing | Value |
|---|---|
| Chain | Base Sepolia (also Solana devnet for x402) |
| USDC (Base Sepolia) | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |
| ERC-8183 Diamond (Base Sepolia) | `0x45b0A6e07E2e15D203f3B5285945c549221f5b0a` |
| Live testnet dispatcher | `http://13.237.89.59:7044/miner-dispatcher` |
| Discover live miners | `GET /miner-dispatcher/integrations` |

All addresses above are **testnet**. See [SECURITY.md](./SECURITY.md) for the funds/keys policy.

## 5. Tech stack

- **Miner:** Python · FastAPI · pandas/numpy · PyTorch (for the model) — served over HTTPS.
- **App:** Next.js · TypeScript · an x402 client + viem for the Base Sepolia / ERC-8183 path.
- **Infra:** the model trains/serves on our local workstation (2× RTX 5060 Ti); miner behind HTTPS.

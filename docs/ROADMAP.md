# Roadmap

Mapped to the Telegraph Hackathon Season I structure and its judging criteria.

## The prize structure

| Round | Prize | Window |
|---|---|---|
| **H1** | $5,000 USDC | Aug 17 – Sep 7, 2026 (21 days) |
| **H2** | $10,000 USDC | ~mid-October 2026 |
| **H3** (mainnet) | MACHINA rewards | December 2026 onwards |

We target **H1 first** (real USDC, our combo plays perfectly), carry momentum into H2, and treat
H3/MACHINA as upside — not the thesis.

## What the judges actually reward

Every track scores on two axes: a **technical** axis and a **traction/build-in-public** axis.

- **Miner track:** Telegraph ranking & performance · # apps built on your miner · total inference
  consumed · progress posts on X · engagement.
- **App track:** users acquired & activity · usage/adoption · creativity/usefulness · must use
  Telegraph miners · engagement on showcase posts.

Our plan is engineered so one effort scores on both tracks at once: **the app drives demand into our
own miner.**

## Phases

### Phase 0 — Prep (now → Aug 17)
- ✅ Register; repo + docs live; protocol/mechanics mapped.
- Secure testnet environment on the workstation (devnet/Base-Sepolia burner wallet, faucets).
- Run the official example miners end-to-end to master x402 + the dispatcher.
- Build the signal engine v1 (offline-validated on historical data before it ever serves).
- Stand up the miner API behind HTTPS; draft + hash the YAML.
- Open the X presence and start build-in-public (early engagement compounds).
- Pull the H1 task specs from Discord early-access and adapt the target Intent.

### Phase 1 — Build & register (Aug 17 → Aug 31)
- Register the miner on Base Sepolia; pass validation; survive the 7-day grace window with strong
  accuracy on the canonical ground truth.
- Ship the consumer app/agent that hires our miner; start pouring real demand.
- Post progress with **numbers** (accuracy, requests served, uptime) — proof, not hype.

### Phase 2 — Adoption push (Aug 31 → Sep 7)
- Drive real users to the app; maximize inference consumed through our miner.
- Harden accuracy + latency; publish a short results thread; final engagement push.
- Submit.

## Definition of "winning"
Top placement in H1 on the miner and/or app track, driven by: (1) measurably accurate signal on the
canonical ground truth, (2) real consumption of our miner via our own app, (3) a credible
build-in-public trail. Everything reusable in the Infinity ecosystem even if we don't place.

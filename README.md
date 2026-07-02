# InfinityTelegraph

**A verifiable financial-signal layer for autonomous agents — built on [Telegraph](https://telegraphprotocol.com) (Base).**

Autonomous agents can't act on raw model outputs. InfinityTelegraph turns raw market and
on-chain data into **scored, ground-truth-checkable signals** — market regime, price direction
and anomaly — that trading agents and smart contracts can consume and *trust*, paying per query
via the [x402](https://x402.org) payment standard and hiring on-chain via ERC-8183.

> Telegraph Hackathon · Season I (2026). Two tracks: a **miner** that supplies the signal, and an
> **app/agent** that consumes it — so quality is proven by real demand, not benchmarks alone.

## Why a signal miner is different

Telegraph validators score a miner by scraping the **canonical ground truth** for its Intent and
comparing. That rewards signals whose truth is *objectively verifiable after the fact*. A directional
market signal is exactly that: the ground truth is the price that actually happened. We compete where
correctness is measurable, not opinion — which is our quant edge.

## Repository layout

| Path | What |
|---|---|
| [`docs/`](./docs) | Architecture, miner spec, roadmap, security |
| [`miner/`](./miner) | The signal miner — API + Telegraph YAML descriptor |
| [`app/`](./app) | The consumer app/agent that hires our miner |
| [`scripts/`](./scripts) | Registration / deployment helpers |

Start with [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

## Status

🚧 In active development for Telegraph Hackathon Season I (starts **Aug 17, 2026**). Everything runs
on **testnet** (Base Sepolia / Solana devnet). No mainnet funds are used.

---

Built by [Infinity Pro Code](https://infinityprocode.com.br) — bringing a production quant/trading
stack to the intelligence layer machines will trade on.

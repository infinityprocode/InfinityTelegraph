# App / Agent (demand side)

The consumer that **hires our own miner** — turning the signal into something a person or a bot uses,
and driving the demand that scores our miner (see [`../docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md)).

## Plan (Next.js + TypeScript)
- A live dashboard/agent that queries the `PRICE_DIRECTION` / `MARKET_REGIME` intent through Telegraph.
- **Off-chain path:** x402 client signs USDC micro-payments (Base Sepolia / Solana devnet) per request.
- **On-chain path:** an ERC-8183 job (escrow → route → validate → callback) for the trustless demo.
- Every call routes demand to our miner → scores the miner track *and* the app track at once.

## Status
⏳ To scaffold next, after the miner runs end-to-end on testnet and the burner wallet is set up.
Kept as a placeholder so the repo structure and intent are clear from day one.

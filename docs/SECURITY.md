# Security & funds policy

Non-negotiable rules for this project. The point of a hackathon is to build — not to put money at risk.

## Wallets & funds
- **Testnet only.** Everything runs on Base Sepolia / Solana devnet. Faucet funds, never real money.
- **Burner wallets only.** The keys used here are dedicated, disposable wallets created for this
  project. **Never** the CEO's main wallet, and never a wallet that holds real assets.
- **No token purchases.** We do not buy MACHINA. Miner bonding uses **testnet** MACHINA from the
  faucet/hackathon allocation. If anything ever asks for real funds, stop and review.
- **Never sign an unexpected transaction** and never paste a seed phrase anywhere.

## Keys & secrets
- Private keys live only in a local `.env` (gitignored) or a secrets manager — **never** committed,
  never in the YAML, never in logs. The Telegraph YAML references an *env var name*, not the key.
- The public miner YAML and repo contain **no secrets**.

## Running third-party code
- The Telegraph example repo was reviewed before use (clean: no install hooks, no exfiltration,
  keys used only locally to sign x402). We still run it in an **isolated dir + venv** on the
  workstation, with a burner key.
- We do not run untrusted contracts or scripts against any wallet with real value.

## Repo hygiene
- `INTERNAL/` (competitive strategy) is gitignored and never pushed while the hackathon is live.
- `.env*` (except `.env.example`) is gitignored.

## Project-legitimacy note
Telegraph looks like a plausibly-legit early project: clean example code, testnet payments,
**fair-launch tokenomics (21M cap, no pre-mine, no team/VC allocation)**, and real USDC prizes.
That's *why participating as a builder is low-risk* — but the rules above hold regardless, because
"looks legit" is never a reason to expose real funds.

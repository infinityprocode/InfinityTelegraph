# Scripts

Helpers for testnet setup, miner registration, and demand generation. All **testnet only**
(Base Sepolia / Solana devnet) — see [`../docs/SECURITY.md`](../docs/SECURITY.md).

## Planned
| Script | What |
|---|---|
| `setup-wallet.sh` | Create a **burner** EVM keypair + fund via Base Sepolia faucet (gas) |
| `hash-yaml.sh` | `sha256sum telegraph-miner.yaml` → the on-chain hash |
| `register-miner.sh` | `cast` (Foundry) tx: bond testnet MACHINA + register the YAML |
| `discover.sh` | `GET /miner-dispatcher/integrations` — list live miners/intents/prices |
| `demand.sh` | Fire x402 requests at our miner (drives leaderboard demand from the app) |

## Status
⏳ To be written after the miner runs locally and the burner wallet exists. Registration needs
`cast` from [Foundry](https://getfoundry.sh).

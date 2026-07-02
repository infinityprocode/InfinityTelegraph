#!/usr/bin/env bash
# Register our miner on Base Sepolia (TESTNET ONLY). TEMPLATE — the exact registry contract call
# is finalized from the hackathon task specs / on-chain registry docs before first use.
#
# Prereqs (all testnet):
#   - cast (Foundry): https://getfoundry.sh
#   - a BURNER wallet funded with Base Sepolia ETH (gas) + 100 testnet MACHINA (bond). Never a real wallet.
#   - the YAML hosted at a stable public URL (IPFS or HTTPS).
#
# Env:
#   BURNER_PRIVATE_KEY   testnet burner key (never a real one)
#   YAML_URL             public URL of miner/telegraph-miner.yaml
#   BASE_SEPOLIA_RPC     e.g. https://base-sepolia.g.alchemy.com/v2/<key>
set -euo pipefail

: "${BURNER_PRIVATE_KEY:?set BURNER_PRIVATE_KEY (testnet burner only)}"
: "${YAML_URL:?set YAML_URL (public URL of telegraph-miner.yaml)}"
: "${BASE_SEPOLIA_RPC:?set BASE_SEPOLIA_RPC}"

HASH=$(bash "$(dirname "$0")/hash-yaml.sh")
echo "YAML URL : $YAML_URL"
echo "YAML hash: $HASH"
echo
echo "TODO (from task specs / registry docs): bond 100 MACHINA + register."
echo "  cast send <MINER_REGISTRY> \"register(string,bytes32)\" \"$YAML_URL\" \"$HASH\" \\"
echo "    --rpc-url \"$BASE_SEPOLIA_RPC\" --private-key \"\$BURNER_PRIVATE_KEY\""
echo
echo "Not executing automatically — confirm the contract address + method signature first."

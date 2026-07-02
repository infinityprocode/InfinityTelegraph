#!/usr/bin/env bash
# List live miners on the Telegraph testnet dispatcher (free, no wallet needed).
# Shows ids, slugs, intents, min prices — the authoritative live set to build against.
set -euo pipefail
URL="${TELEGRAPH_DISPATCHER_URL:-http://13.237.89.59:7044/miner-dispatcher}"
curl -s -m20 "$URL/integrations" | python3 -m json.tool

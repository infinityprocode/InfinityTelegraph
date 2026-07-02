#!/usr/bin/env bash
# SHA-256 of the miner YAML — the value pinned on-chain at registration so nodes verify the
# hosted YAML matches what we committed to. Re-run whenever the YAML changes.
set -euo pipefail
f="${1:-$(dirname "$0")/../miner/telegraph-miner.yaml}"
sha256sum "$f" | awk '{print "0x"$1}'

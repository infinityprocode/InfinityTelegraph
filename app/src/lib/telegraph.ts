// Telegraph client — where the demand for our miner is generated.
//
// Two paths:
//   1) DIRECT (local dev): call our miner API directly (no payment). Bootstrap only.
//   2) DISPATCHER + x402 (real): request the Intent via the Telegraph dispatcher, sign the
//      USDC micro-payment on Base Sepolia, retry. This is the path that routes DEMAND to our
//      miner (which is what scores us). Wired once the burner wallet + miner id exist.

export type Signal = {
  asset: string;
  horizon: string;
  direction: "up" | "down";
  regime: string;
  confidence: number;
  as_of: string;
  model: string;
};

const DISPATCHER = process.env.TELEGRAPH_DISPATCHER_URL || "";
const MINER_ID = process.env.INFINITY_MINER_ID || "";
const DIRECT = process.env.MINER_DIRECT_URL || "http://127.0.0.1:8080";

// DIRECT path — used until the miner is registered and x402 is wired.
export async function getSignalDirect(symbol: string, horizon = "1h"): Promise<Signal> {
  const url = `${DIRECT}/v1/signal?symbol=${encodeURIComponent(symbol)}&horizon=${encodeURIComponent(horizon)}`;
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`miner ${r.status}`);
  return (await r.json()) as Signal;
}

// DISPATCHER + x402 path — TODO: sign USDC payment (Base Sepolia) on the 402 challenge and retry.
// This is the call that generates real demand for our miner. Implement after wallet + miner id.
export async function getSignalViaTelegraph(symbol: string, horizon = "1h"): Promise<Signal> {
  if (!DISPATCHER || !MINER_ID) return getSignalDirect(symbol, horizon);
  // const url = `${DISPATCHER}/v1/${MINER_ID}/signal?symbol=${symbol}&horizon=${horizon}`;
  // 1) fetch -> expect 402  2) sign USDC payment w/ x402 client  3) retry with payment header
  throw new Error("x402 path not wired yet — see docs/ARCHITECTURE.md");
}

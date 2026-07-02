import { NextResponse } from "next/server";

// Proxies the miner's paper-engine stats (win rate / PnL / asymmetry) to the dashboard.
const MINER = process.env.MINER_DIRECT_URL || "http://127.0.0.1:8080";

export async function GET() {
  try {
    const r = await fetch(`${MINER}/paper/stats`, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!r.ok) return NextResponse.json({ settled: 0, note: "sem dados ainda" });
    return NextResponse.json(await r.json());
  } catch {
    return NextResponse.json({ settled: 0, note: "motor de paper indisponível" });
  }
}

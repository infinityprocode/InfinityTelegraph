import { NextRequest, NextResponse } from "next/server";
import { getSignals } from "@/lib/telegraph";

// Watchlist endpoint for the dashboard. Each symbol served = demand routed to our miner.
const DEFAULT = ["BTC", "ETH", "SOL", "BNB"];

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("symbols");
  const horizon = req.nextUrl.searchParams.get("horizon") || "4h";
  const symbols = raw ? raw.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean) : DEFAULT;
  const sigs = await getSignals(symbols, horizon);
  const out = symbols.map((s, i) => ({ symbol: s, signal: sigs[i] }));
  return NextResponse.json({ horizon, at: Date.now(), items: out });
}

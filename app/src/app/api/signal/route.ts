import { NextRequest, NextResponse } from "next/server";
import { getSignalViaTelegraph } from "@/lib/telegraph";

// Server route: turns a UI request into DEMAND for our miner (via Telegraph + x402 once wired).
// Keeping it server-side keeps any payment key off the client.
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const symbol = sp.get("symbol") || "BTC";
  const horizon = sp.get("horizon") || "1h";
  try {
    const sig = await getSignalViaTelegraph(symbol, horizon);
    return NextResponse.json(sig);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "failed" }, { status: 502 });
  }
}

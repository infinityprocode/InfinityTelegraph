import { NextResponse } from "next/server";

// Proxies the miner's fade-setup scanner (news + momentum, local LLM) to the dashboard.
const MINER = process.env.MINER_DIRECT_URL || "http://127.0.0.1:8080";

export async function GET() {
  try {
    const r = await fetch(`${MINER}/setups`, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!r.ok) return NextResponse.json({ setups: [], nota: "indisponível" });
    return NextResponse.json(await r.json());
  } catch {
    return NextResponse.json({ setups: [], nota: "scanner indisponível" });
  }
}

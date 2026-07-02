"use client";

import { useState } from "react";

type Signal = {
  asset: string;
  horizon: string;
  direction: "up" | "down";
  regime: string;
  confidence: number;
  as_of: string;
  model: string;
};

export default function Home() {
  const [symbol, setSymbol] = useState("BTC");
  const [sig, setSig] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`/api/signal?symbol=${encodeURIComponent(symbol)}&horizon=1h`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || `error ${r.status}`);
      setSig(d);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "failed");
    } finally {
      setLoading(false);
    }
  };

  const up = sig?.direction === "up";

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 4 }}>InfinityTelegraph</h1>
      <p style={{ color: "#a6afca", marginTop: 0 }}>
        Verifiable market signals for autonomous agents — served by our miner on Telegraph.
      </p>

      <div style={{ display: "flex", gap: 8, margin: "24px 0" }}>
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="asset, e.g. BTC"
          style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid #2a3050", background: "#11162a", color: "#eef1f9" }}
        />
        <button
          onClick={load}
          disabled={loading}
          style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "#4f8fff", color: "#fff", cursor: "pointer" }}
        >
          {loading ? "…" : "Get signal"}
        </button>
      </div>

      {err && <p style={{ color: "#ff5d57" }}>{err}</p>}

      {sig && (
        <div style={{ border: "1px solid #2a3050", borderRadius: 14, padding: 20, background: "#11162a" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ fontSize: 22, fontWeight: 700 }}>{sig.asset}</span>
            <span style={{ color: up ? "#37d08a" : "#ff5d57", fontWeight: 700 }}>
              {up ? "▲ UP" : "▼ DOWN"}
            </span>
            <span style={{ marginLeft: "auto", color: "#a6afca" }}>{sig.horizon}</span>
          </div>
          <div style={{ marginTop: 10, color: "#a6afca", fontSize: 14 }}>
            regime <b style={{ color: "#eef1f9" }}>{sig.regime}</b> · confidence{" "}
            <b style={{ color: "#eef1f9" }}>{(sig.confidence * 100).toFixed(0)}%</b>
          </div>
          <div style={{ marginTop: 6, color: "#727b99", fontSize: 12 }}>
            {sig.model} · {sig.as_of}
          </div>
        </div>
      )}
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";

type Signal = {
  asset: string; horizon: string; direction: "up" | "down";
  regime: string; confidence: number; as_of: string; model: string;
};
type Item = { symbol: string; signal: Signal | null };

const C = {
  bg: "#0b0d16", panel: "#11162a", border: "#222a45", text: "#eef1f9",
  muted: "#a6afca", faint: "#727b99", up: "#37d08a", down: "#ff5d57",
  accent: "#4f8fff", amber: "#f5b13c",
};

const REGIME_PT: Record<string, string> = {
  trend_up: "tendência de alta", trend_down: "tendência de baixa",
  mean_revert: "reversão", chop: "lateral/ruído",
};

export default function Dashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [at, setAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const r = await fetch("/api/signals?horizon=4h", { cache: "no-store" });
      const d = await r.json();
      setItems(d.items || []);
      setAt(d.at || Date.now());
    } catch { /* keep last good */ } finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    const t = setInterval(() => { if (document.visibilityState === "visible") load(); }, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* header */}
        <header style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: -0.3 }}>
            Infinity<span style={{ color: C.accent }}>Telegraph</span>
          </h1>
          <span style={{ color: C.muted, fontSize: 14 }}>sinais de mercado verificáveis · horizonte 4h</span>
          <span style={{ marginLeft: "auto", color: C.faint, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: C.up, boxShadow: `0 0 8px ${C.up}` }} />
            {at ? `atualizado ${new Date(at).toLocaleTimeString("pt-BR")}` : "…"} · auto 30s
          </span>
        </header>

        {/* live signals */}
        <section style={{ marginTop: 28 }}>
          <SectionTitle>Sinais ao vivo</SectionTitle>
          {loading && !items.length ? (
            <p style={{ color: C.muted }}>carregando…</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
              {items.map((it) => <SignalCard key={it.symbol} item={it} />)}
            </div>
          )}
        </section>

        {/* coming: fade setups (strategy 1) */}
        <section style={{ marginTop: 34 }}>
          <SectionTitle>Setups de fade <Soon /></SectionTitle>
          <Placeholder text="Detecção de movimento explosivo (X% em Y min) + filtro de notícia → alerta de fade com trailing curto. Esta é a estratégia 1 (seu edge provado)." />
        </section>

        {/* coming: paper performance */}
        <section style={{ marginTop: 34 }}>
          <SectionTitle>Desempenho (paper) <Soon /></SectionTitle>
          <Placeholder text="Win rate, PnL e assimetria (ganho médio vs perda média) da estratégia em paper — pra provar o sinal antes de qualquer dinheiro real." />
        </section>
      </div>
    </main>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.4, color: C.muted, fontWeight: 700, marginBottom: 14 }}>
      {children}
    </h2>
  );
}

function Soon() {
  return <span style={{ marginLeft: 8, fontSize: 10, color: C.amber, background: "rgba(245,177,60,.12)", padding: "2px 7px", borderRadius: 99, letterSpacing: 0.5 }}>em breve</span>;
}

function Placeholder({ text }: { text: string }) {
  return (
    <div style={{ border: `1px dashed ${C.border}`, borderRadius: 14, padding: 20, color: C.faint, fontSize: 13, lineHeight: 1.6, background: "rgba(255,255,255,.01)" }}>
      {text}
    </div>
  );
}

function SignalCard({ item }: { item: Item }) {
  const s = item.signal;
  if (!s) {
    return (
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, background: C.panel }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>{item.symbol}</div>
        <div style={{ color: C.faint, fontSize: 12, marginTop: 8 }}>sem dado</div>
      </div>
    );
  }
  const up = s.direction === "up";
  const col = up ? C.up : C.down;
  const pct = Math.round(s.confidence * 100);
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, background: C.panel, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: col }} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 18 }}>{s.asset}</span>
        <span style={{ marginLeft: "auto", color: col, fontWeight: 800, fontSize: 15, fontVariantNumeric: "tabular-nums" }}>
          {up ? "▲" : "▼"} {up ? "LONG" : "SHORT"}
        </span>
      </div>
      <div style={{ marginTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted, marginBottom: 4 }}>
          <span>confiança</span><span style={{ color: C.text, fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
        </div>
        <div style={{ height: 6, background: "#0b0f1e", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: col, borderRadius: 99 }} />
        </div>
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: C.muted }}>
        regime <b style={{ color: C.text }}>{REGIME_PT[s.regime] || s.regime}</b>
      </div>
      <div style={{ marginTop: 4, fontSize: 10, color: C.faint }}>{s.model}</div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

type Signal = { asset: string; horizon: string; direction: "up" | "down"; regime: string; confidence: number; as_of: string; model: string };
type Item = { symbol: string; signal: Signal | null };
type Paper = { settled: number; open?: number; win_rate?: number; pnl_total?: number; avg_win?: number; avg_loss?: number; tp_sl_pct?: number; note?: string };

const REGIME_PT: Record<string, string> = {
  trend_up: "tendência de alta", trend_down: "tendência de baixa", mean_revert: "reversão", chop: "lateral",
};

export default function Page() {
  const [items, setItems] = useState<Item[]>([]);
  const [paper, setPaper] = useState<Paper | null>(null);
  const [at, setAt] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  const load = async () => {
    try {
      const r = await fetch("/api/signals?horizon=4h", { cache: "no-store" });
      const d = await r.json(); setItems(d.items || []); setAt(d.at || Date.now());
    } catch { /* keep */ }
    try { const p = await fetch("/api/paper", { cache: "no-store" }); if (p.ok) setPaper(await p.json()); } catch { /* keep */ }
  };

  useEffect(() => {
    setMounted(true); load();
    const t = setInterval(() => { if (document.visibilityState === "visible") load(); }, 30000);
    return () => clearInterval(t);
  }, []);

  const sorted = [...items].sort((a, b) => (b.signal?.confidence || 0) - (a.signal?.confidence || 0));

  return (
    <main className="shell">
      <header className="rise">
        <div className="ey"><span className="livedot" /><span className="eyebrow">Telegraph · Base · x402 · testnet</span></div>
        <h1 className="hero">Sinais de mercado<br /><span className="grad">verificáveis</span> para máquinas.</h1>
        <p className="sub">
          Direção, confiança e regime por ativo, checáveis contra o preço que realmente aconteceu. Servidos por um
          miner na rede Telegraph. Sinal, não conselho: aqui a gente <span className="serif">prova</span> antes de confiar.
        </p>
        <p className="eyebrow" style={{ marginTop: 18, opacity: .6 }}>
          {mounted && at ? `atualizado ${new Date(at).toLocaleTimeString("pt-BR")} · auto 30s · horizonte 4h` : "conectando…"}
        </p>
      </header>

      <section style={{ marginTop: 44 }} className="rise" aria-label="Sinais ao vivo">
        <h2 className="sectitle">Sinais ao vivo</h2>
        {!items.length ? (
          <p style={{ color: "var(--mut)" }}>carregando sinais…</p>
        ) : (
          <div className="grid signals">
            {sorted.map((it, i) => <SignalCard key={it.symbol} item={it} featured={i === 0} />)}
          </div>
        )}
      </section>

      <section style={{ marginTop: 48 }} className="rise" aria-label="Setups de fade">
        <h2 className="sectitle">Setups de fade <span className="soon">em breve</span></h2>
        <div className="empty">
          <p style={{ color: "var(--ink)", fontWeight: 600, fontSize: 15 }}>Desmaiar o exagero, com disciplina.</p>
          <p style={{ color: "var(--mut)", fontSize: 13.5, lineHeight: 1.6, marginTop: 8, maxWidth: 640 }}>
            Movimento explosivo (X% em Y minutos) mais um catalisador de notícia lido por IA local viram um alerta de
            fade com trailing curto. É a estratégia que já funciona no manual, virando gatilho automático.
          </p>
        </div>
      </section>

      <section style={{ marginTop: 48 }} className="rise" aria-label="Desempenho em paper">
        <h2 className="sectitle">Desempenho (paper) <span className="soon">coletando</span></h2>
        <PaperPanel paper={paper} />
      </section>

      <footer className="footer">
        <span>InfinityTelegraph</span>
        <span>·</span>
        <a href="https://infinityprocode.com.br" target="_blank" rel="noopener">Infinity Pro Code</a>
        <a href="https://x.com/InfinityProCode" target="_blank" rel="noopener">@InfinityProCode</a>
        <span style={{ marginLeft: "auto", color: "var(--faint)" }}>construído na Base · testnet · sinal, não conselho financeiro</span>
      </footer>
    </main>
  );
}

function SignalCard({ item, featured }: { item: Item; featured: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const s = item.signal;
  const up = s?.direction === "up";
  const col = up ? "var(--up)" : "var(--down)";
  const pct = Math.round((s?.confidence || 0) * 100);

  const move = (e: React.PointerEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);
  };

  return (
    <div ref={ref} onPointerMove={move} className={`card${featured ? " feat" : ""}`} style={{ ["--accent" as string]: col }}>
      <span className="edge" style={{ background: col, boxShadow: `0 0 22px ${col}` }} />
      <div className="tick">
        <span className="sym">{item.symbol}</span>
        <span className="dir" style={{ color: col }}>{up ? "▲" : "▼"} {up ? "LONG" : "SHORT"}</span>
      </div>
      {s ? (
        <>
          {featured && (
            <div className="big" style={{ marginTop: 14, color: col }}>
              {pct}<span style={{ fontSize: 18, color: "var(--mut)" }}>% confiança</span>
            </div>
          )}
          <div style={{ marginTop: featured ? 16 : 14 }}>
            {!featured && <div className="lab"><span>confiança</span><span className="mono" style={{ color: "var(--ink)" }}>{pct}%</span></div>}
            <div className="meter" style={{ marginTop: 5 }}>
              <i style={{ width: `${pct}%`, background: `linear-gradient(90deg,${col},color-mix(in srgb,${col} 55%,#fff))`, boxShadow: `0 0 12px ${col}` }} />
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: 12.5, color: "var(--mut)" }}>
            regime <b style={{ color: "var(--ink)" }}>{REGIME_PT[s.regime] || s.regime}</b>
            {up && s.regime.startsWith("trend_up") && <span style={{ color: "var(--faint)" }}> · fade da alta</span>}
          </div>
          <div className="mono" style={{ marginTop: 6, fontSize: 10, color: "var(--faint)" }}>{s.model}</div>
        </>
      ) : (
        <div style={{ color: "var(--faint)", fontSize: 12, marginTop: 12 }}>sem dado</div>
      )}
    </div>
  );
}

function PaperPanel({ paper }: { paper: Paper | null }) {
  const has = paper && paper.settled > 0;
  const wr = paper?.win_rate || 0;
  const pnl = paper?.pnl_total || 0;
  if (!has) {
    return (
      <div className="empty">
        <p style={{ color: "var(--ink)", fontWeight: 600, fontSize: 15 }}>Provando o sinal antes de qualquer dinheiro.</p>
        <p style={{ color: "var(--mut)", fontSize: 13.5, lineHeight: 1.6, marginTop: 8, maxWidth: 640 }}>
          Cada sinal vira um scalp simulado (alvo e stop fixos, tipo os 5 dólares), liquidado contra o preço real depois
          de 4h. Win rate, resultado e assimetria aparecem aqui conforme os trades maturam. {paper?.note ? paper.note : ""}
        </p>
        {paper && typeof paper.open === "number" && (
          <p className="mono" style={{ color: "var(--faint)", fontSize: 12, marginTop: 12 }}>{paper.open} em aberto · {paper.settled} liquidados</p>
        )}
      </div>
    );
  }
  const p = paper!;
  const Tile = ({ k, v, c }: { k: string; v: string; c?: string }) => (
    <div className="card stat" style={{ padding: 18 }}>
      <span className="k">{k}</span>
      <span className="big" style={{ fontSize: 30, color: c || "var(--ink)" }}>{v}</span>
    </div>
  );
  return (
    <div className="grid signals">
      <Tile k="win rate" v={`${wr.toFixed(0)}%`} c="var(--up)" />
      <Tile k="resultado" v={`${pnl >= 0 ? "+" : ""}$${pnl.toFixed(0)}`} c={pnl >= 0 ? "var(--up)" : "var(--down)"} />
      <Tile k="ganho médio" v={`+$${(p.avg_win || 0).toFixed(2)}`} />
      <Tile k="perda média" v={`$${(p.avg_loss || 0).toFixed(2)}`} />
      <div className="card stat" style={{ padding: 18 }}>
        <span className="k">trades</span>
        <span className="big" style={{ fontSize: 30 }}>{p.settled}<span style={{ fontSize: 14, color: "var(--faint)" }}> liq.</span></span>
        <span className="mono" style={{ fontSize: 11, color: "var(--faint)" }}>{p.open || 0} em aberto · alvo/stop ±{p.tp_sl_pct || 0.5}%</span>
      </div>
    </div>
  );
}

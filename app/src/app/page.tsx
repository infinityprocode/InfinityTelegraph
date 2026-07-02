"use client";

import { useEffect, useState } from "react";

type Signal = { asset: string; horizon: string; direction: "up" | "down"; regime: string; confidence: number; as_of: string; model: string; source?: "model" | "baseline" };
type Item = { symbol: string; signal: Signal | null };
type Paper = { settled: number; open?: number; win_rate?: number; pnl_total?: number; avg_win?: number; avg_loss?: number; tp_sl_pct?: number; note?: string };
type Setup = { asset: string; move_3h: number; move_1h: number; fade_dir: "short" | "long"; explosao: string; catalisador: boolean; sentimento: string; nota: string };
type Setups = { setups: Setup[]; nota?: string; gerado_em?: number };

const REGIME_PT: Record<string, string> = { trend_up: "UPTREND", trend_down: "DOWNTREND", mean_revert: "MEAN-REVERT", chop: "CHOP" };
const dirWord = (d?: string) => (d === "up" ? "LONG" : "SHORT");
const dirCol = (d?: string) => (d === "up" ? "var(--up)" : "var(--down)");
const arrow = (d?: string) => (d === "up" ? "▲" : "▼");
const pct = (s?: Signal | null) => Math.round((s?.confidence || 0) * 100);

export default function Page() {
  const [items, setItems] = useState<Item[]>([]);
  const [paper, setPaper] = useState<Paper | null>(null);
  const [setups, setSetups] = useState<Setups | null>(null);
  const [at, setAt] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  const load = async () => {
    const t = () => ({ cache: "no-store" as const, signal: AbortSignal.timeout(6000) });
    try { const r = await fetch("/api/signals?horizon=4h", t()); const d = await r.json(); setItems(d.items || []); setAt(d.at || Date.now()); } catch { /* keep */ }
    try { const p = await fetch("/api/paper", t()); if (p.ok) setPaper(await p.json()); } catch { /* keep */ }
    try { const s = await fetch("/api/setups", t()); if (s.ok) setSetups(await s.json()); } catch { /* keep */ }
  };
  useEffect(() => { setMounted(true); load(); const t = setInterval(() => { if (document.visibilityState === "visible") load(); }, 30000); return () => clearInterval(t); }, []);

  const sorted = [...items].filter((i) => i.signal).sort((a, b) => (b.signal!.confidence) - (a.signal!.confidence));
  const top = sorted[0]?.signal || null;
  const rest = sorted.slice(1);
  const clock = mounted && at ? new Date(at).toLocaleTimeString("pt-BR") : "--:--:--";
  const degraded = sorted.some((i) => i.signal?.source === "baseline");

  const mkTape = () => (
    <>
      {sorted.map((it) => (
        <span key={it.symbol}>&nbsp;[{it.symbol} <span className={it.signal!.direction === "up" ? "up" : "dn"}>{arrow(it.signal!.direction)} {dirWord(it.signal!.direction)} {pct(it.signal)}</span>]&nbsp;</span>
      ))}
      <b>&nbsp;VALIDADO_VS_PRECO_REAL&nbsp;</b>x402:EM_BREVE<b>&nbsp;SINAL_NAO_CONSELHO&nbsp;&nbsp;</b>
    </>
  );

  return (
    <main className="wrap">
      <div className="sweep" aria-hidden="true" />
      {/* barra superior */}
      <div className="bar">
        <div className="c brand"><b>INFINITY_TELEGRAPH</b></div>
        <div className="c hidem">SIGNAL_ENGINE / v1</div>
        <div className="c hidem">NET=BASE_SEPOLIA</div>
        <div className="c grow" />
        <div className="c hidem">HORIZON=4H</div>
        <div className="c live"><span className="livedot" />LIVE {clock}</div>
      </div>

      {/* marquee (ticker que rola) */}
      <div className="marq">
        <span className="marq-inner">
          <span>{mkTape()}</span>
          <span aria-hidden="true">{mkTape()}</span>
        </span>
      </div>

      {/* hero statement */}
      <div className="htop">
        <div className="l">// TOP CONVICTION</div>
        <div className="l">MODEL=<b>{top?.model || "infinity-regime-v1"}</b></div>
        <div className="l">REGIME=<b>{top ? REGIME_PT[top.regime] || top.regime : "—"}</b></div>
      </div>
      <div className="statement">
        {top ? (
          <>
            <div className="stk"><b>{sorted[0].symbol}</b><br />/ 4H</div>
            <div className="huge" style={{ color: dirCol(top.direction) }}>{dirWord(top.direction)}</div>
            <div className="hconf"><b>{pct(top)}%</b><small>CONVICÇÃO</small></div>
          </>
        ) : <div className="stk">carregando sinais…</div>}
      </div>
      <div className="hnote">
        // {top ? sorted[0].symbol : "—"}: modelo aponta {top ? (top.direction === "up" ? "ALTA (long)" : "BAIXA (short)") : "—"} · regime {top ? REGIME_PT[top.regime] || top.regime : "—"} · horizonte 4h. <span className="verified">✓ validado vs preço real (paper engine)</span>
        {degraded && <span style={{ color: "var(--amber)" }}> · ⚠ modelo degradado (baseline, sem dados)</span>}
      </div>

      {/* grid dos demais */}
      <div className="sgrid">
        {rest.map((it) => {
          const s = it.signal!; const col = dirCol(s.direction); const p = pct(s);
          return (
            <div className="g" key={it.symbol}>
              <div className="gh"><div className="gsym">{it.symbol}</div><div className="gdir" style={{ color: col }}>{arrow(s.direction)} {dirWord(s.direction)}</div></div>
              <div className="gnum">{p}<span>%</span></div>
              <div className="gline"><i style={{ width: `${p}%`, color: col }} /></div>
              <div className="grg">REGIME={REGIME_PT[s.regime] || s.regime} · FADE · 4H</div>
            </div>
          );
        })}
        {!rest.length && <div className="g" style={{ gridColumn: "1/-1", color: "var(--faint)" }}>—</div>}
      </div>

      {/* setups de fade */}
      <div className="sec">
        <div className="slab">SETUPS_DE_FADE <span className="badge">{setups && setups.setups && setups.setups.length ? "AO VIVO" : "MONITORANDO"}</span></div>
        <SetupsPanel data={setups} />
      </div>

      {/* paper */}
      <div className="sec">
        <div className="slab">DESEMPENHO_PAPER <span className="badge">{paper && paper.settled > 0 ? "AO VIVO" : "COLETANDO"}</span></div>
        <PaperPanel paper={paper} />
      </div>

      <div className="foot">
        <div className="c"><a href="https://infinityprocode.com.br" target="_blank" rel="noopener">INFINITY_PRO_CODE</a></div>
        <div className="c"><a href="https://x.com/InfinityProCode" target="_blank" rel="noopener">@INFINITYPROCODE</a></div>
        <div className="c grow" style={{ borderRight: 0 }} />
        <div className="c" style={{ borderRight: 0 }}>BUILT_ON_BASE · TESTNET</div>
      </div>
    </main>
  );
}

function SetupsPanel({ data }: { data: Setups | null }) {
  const list = data?.setups || [];
  if (!list.length) {
    return (
      <div className="sectxt">
        Monitorando movimento explosivo (≥2,5% em 1h ou ≥4% em 3h) + catalisador de notícia lido por IA local na ryzen. Quando um ativo exagerar, aparece aqui um alerta de fade com o motivo. {data?.nota || ""}
      </div>
    );
  }
  return (
    <div className="paper" style={{ gridTemplateColumns: "1fr" }}>
      {list.map((s) => {
        const short = s.fade_dir === "short";
        const col = short ? "var(--down)" : "var(--up)";
        return (
          <div className="pcell" key={s.asset} style={{ borderRight: 0, borderBottom: "1px solid var(--line)" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <b style={{ fontFamily: "var(--font-mono)", fontSize: 16 }}>{s.asset}</b>
              <span className="mono" style={{ color: col, fontWeight: 700, fontSize: 13 }}>FADE → {s.fade_dir.toUpperCase()}</span>
              <span className="mono" style={{ color: "var(--mut)", fontSize: 12 }}>explodiu {s.explosao} {s.move_3h > 0 ? "+" : ""}{s.move_3h}% (3h)</span>
              {s.catalisador && <span className="badge" style={{ color: "var(--mint)", borderColor: "var(--mintdim)" }}>CATALISADOR</span>}
            </div>
            <div style={{ color: "var(--mut)", fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>{s.nota}</div>
          </div>
        );
      })}
    </div>
  );
}

function PaperPanel({ paper }: { paper: Paper | null }) {
  if (!paper || paper.settled === 0) {
    return (
      <>
        <div className="sectxt">Cada sinal vira um scalp simulado (alvo/stop fixos, tipo os 5 dólares), liquidado contra o preço real depois de 4h. Win rate, resultado e assimetria aparecem aqui conforme os trades maturam. {paper?.note || ""}</div>
        {paper && typeof paper.open === "number" && (
          <div className="mono" style={{ color: "var(--faint)", fontSize: 12, marginTop: 12 }}>{paper.open} EM ABERTO · {paper.settled} LIQUIDADOS</div>
        )}
      </>
    );
  }
  const p = paper;
  const T = ({ k, v, c }: { k: string; v: string; c?: string }) => (
    <div className="pcell"><div className="k">{k}</div><div className="v" style={{ color: c || "var(--ink)" }}>{v}</div></div>
  );
  return (
    <div className="paper">
      <T k="win rate" v={`${(p.win_rate || 0).toFixed(0)}%`} c="var(--mint)" />
      <T k="resultado" v={`${(p.pnl_total || 0) >= 0 ? "+" : ""}$${(p.pnl_total || 0).toFixed(0)}`} c={(p.pnl_total || 0) >= 0 ? "var(--mint)" : "var(--down)"} />
      <T k="ganho médio" v={`+$${(p.avg_win || 0).toFixed(2)}`} />
      <T k="perda média" v={`-$${Math.abs(p.avg_loss || 0).toFixed(2)}`} c="var(--down)" />
      <T k="trades" v={`${p.settled}`} />
    </div>
  );
}

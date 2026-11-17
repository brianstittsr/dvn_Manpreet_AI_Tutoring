"use client";

import { useMemo, useRef } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ChartWorkspace, type ChartWorkspaceHandle } from "@/components/mechanix/chart/chart-workspace";
import { copySize, useMechanix, type Follower, type Position } from "@/components/mechanix/workspace/store";
import { PROP_RULES, formatPrice, symbolInfo } from "@/components/mechanix/workspace/mock-data";
import { useSimFeed } from "@/components/mechanix/workspace/use-sim-feed";

export function TradeView() {
  const wsRef = useRef<ChartWorkspaceHandle>(null);
  const positions = useMechanix((s) => s.positions);
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-3" data-testid="view-trade">
      <div className="min-h-0 flex-1"><ChartWorkspace ref={wsRef} /></div>
      <div className="shrink-0 overflow-x-auto rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)]">
        <table className="w-full text-[12px]">
          <thead><tr className="border-b border-[var(--mx-border)] text-left text-[10px] uppercase tracking-wide text-[var(--mx-faint)]">
            <th className="px-3 py-2">Symbol</th><th className="px-3 py-2">Side</th><th className="px-3 py-2 text-right">Entry</th><th className="px-3 py-2 text-right">SL</th><th className="px-3 py-2 text-right">TP</th><th className="px-3 py-2 text-right">Vol</th><th className="px-3 py-2 text-right">P&L</th><th className="px-3 py-2 text-right">Status</th><th className="px-3 py-2 text-right" />
          </tr></thead>
          <tbody>
            {positions.length === 0 && (
              <tr><td colSpan={9} className="px-3 py-4 text-center text-[var(--mx-faint)]">No open simulated positions — place one from the order ticket.</td></tr>
            )}
            {positions.map((p) => (
              <PositionRow key={p.id} p={p} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PositionRow({ p }: { p: Position }) {
  const closePosition = useMechanix((s) => s.closePosition);
  const feed = useSimFeed(p.symbol, "1m");
  const last = feed.last?.close ?? p.entry;
  const info = symbolInfo(p.symbol);
  const dir = p.side === "buy" ? 1 : -1;
  const upnl = Math.round(((last - p.entry) / info.pip) * 10 * p.volume * dir);
  const close = () => {
    closePosition(p.id, last);
    toast.success(`Closed ${p.side.toUpperCase()} ${p.volume} ${p.symbol} @ ${formatPrice(last, p.symbol)}`, {
      description: `${upnl >= 0 ? "+" : "-"}$${Math.abs(upnl)} — moved to Journal. Concept only.`,
    });
  };
  return (
    <tr className="border-b border-[var(--mx-bg)]">
      <td className="px-3 py-2 font-bold text-[var(--mx-text)]">{p.symbol}</td>
      <td className={cn("px-3 py-2 font-semibold capitalize", p.side === "buy" ? "text-[var(--mx-up)]" : "text-[var(--mx-down)]")}>{p.side}</td>
      <td className="px-3 py-2 text-right tabular-nums">{formatPrice(p.entry, p.symbol)}</td>
      <td className="px-3 py-2 text-right tabular-nums text-[var(--mx-down)]">{formatPrice(p.sl, p.symbol)}</td>
      <td className="px-3 py-2 text-right tabular-nums text-[var(--mx-up)]">{formatPrice(p.tp, p.symbol)}</td>
      <td className="px-3 py-2 text-right tabular-nums">{p.volume.toFixed(2)}</td>
      <td className={cn("px-3 py-2 text-right tabular-nums font-semibold", upnl >= 0 ? "text-[var(--mx-up)]" : "text-[var(--mx-down)]")}>
        {upnl >= 0 ? "+" : "-"}${Math.abs(upnl)}
      </td>
      <td className="px-3 py-2 text-right"><span className="rounded-full bg-[var(--mx-active-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--mx-primary)]">Open · Sim</span></td>
      <td className="px-3 py-2 text-right">
        <button
          onClick={close}
          aria-label={`Close ${p.symbol} position`}
          className="rounded-md border border-[var(--mx-border)] px-2 py-0.5 text-[10px] font-bold text-[var(--mx-muted)] transition-colors hover:bg-[var(--mx-hover)] hover:text-[var(--mx-text)]"
        >
          Close
        </button>
      </td>
    </tr>
  );
}

export function PropView() {
  return (
    <div className="grid gap-3 p-4" data-testid="view-prop">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[var(--mx-text)]">Prop Challenge — Phase 1 · Day 9</h1>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">Concept • Illustrative data</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PROP_RULES.map((r) => {
          const pct = Math.min((r.value / r.target) * 100, 100);
          const danger = !r.ok || pct > 80;
          return (
            <div key={r.name} className="rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] p-3">
              <div className="flex items-center justify-between text-[12px]">
                <b className="text-[var(--mx-text)]">{r.name}</b>
                <span className="tabular-nums text-[var(--mx-muted)]">{r.value}{r.unit} / {r.target}{r.unit}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-[var(--mx-bg)]">
                <div className={cn("h-full rounded-full", danger ? "bg-amber-400" : "bg-[var(--mx-accent)]")} style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-1 text-[10px] text-[var(--mx-faint)]">{danger ? "Needs attention" : "Within limits"}</p>
            </div>
          );
        })}
        <div className="rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] p-3 sm:col-span-2 lg:col-span-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Equity curve (simulated)</p>
          <svg viewBox="0 0 400 80" className="mt-2 h-20 w-full" aria-label="Simulated equity curve" role="img">
            <path d="M0 60 L40 55 L80 62 L120 48 L160 52 L200 40 L240 44 L280 30 L320 34 L360 22 L400 18" fill="none" stroke="#16A34A" strokeWidth={2} />
            <path d="M0 60 L40 55 L80 62 L120 48 L160 52 L200 40 L240 44 L280 30 L320 34 L360 22 L400 18 L400 80 L0 80 Z" fill="#16A34A" opacity={0.08} />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function CopierView() {
  const enabled = useMechanix((s) => s.copierEnabled);
  const leadAccount = useMechanix((s) => s.leadAccount);
  const followers = useMechanix((s) => s.followers);
  return (
    <div className="grid gap-3 p-4" data-testid="view-copier">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-bold text-[var(--mx-text)]">Trade Copier — lead → followers</h1>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-[var(--mx-border)] bg-[var(--mx-bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--mx-muted)]">
            Lead: {leadAccount}
          </span>
          <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", enabled ? "bg-[var(--mx-active-bg)] text-[var(--mx-primary)]" : "bg-[var(--mx-hover)] text-[var(--mx-muted)]")}>
            {enabled ? "Copying" : "Paused"}
          </span>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {followers.map((f) => (
          <FollowerCard key={f.id} f={f} masterOn={enabled} />
        ))}
      </div>
      <p className="text-[11px] text-[var(--mx-faint)]">Master switch, pause-all and the execution log are on the right rail. Concept — no real copying occurs.</p>
    </div>
  );
}

function FollowerCard({ f, masterOn }: { f: Follower; masterOn: boolean }) {
  const setMultiplier = useMechanix((s) => s.setMultiplier);
  const setSizeLimit = useMechanix((s) => s.setSizeLimit);
  const toggleFollower = useMechanix((s) => s.toggleFollower);
  const copying = masterOn && !f.paused;
  return (
    <div className="rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] p-3" data-testid={`follower-${f.id}`}>
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-bold text-[var(--mx-text)]">{f.name}</p>
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", copying ? "bg-[var(--mx-active-bg)] text-[var(--mx-primary)]" : "bg-[var(--mx-hover)] text-[var(--mx-muted)]")}>
          {copying ? "Copying" : "Paused"}
        </span>
      </div>
      <p className="mt-0.5 text-[10px] text-[var(--mx-faint)]">Balance ${f.balance.toLocaleString()} · sim</p>
      <div className="mt-3 space-y-2.5 text-[12px]">
        <div>
          <div className="flex justify-between text-[var(--mx-muted)]">
            <span>Multiplier</span>
            <b className="tabular-nums text-[var(--mx-text)]">{f.multiplier.toFixed(2)}×</b>
          </div>
          <input
            type="range" min={0.25} max={2} step={0.05} value={f.multiplier}
            onChange={(e) => setMultiplier(f.id, Number(e.target.value))}
            aria-label={`${f.name} multiplier`}
            className="mt-1 w-full accent-[var(--mx-accent)]"
          />
        </div>
        <div>
          <div className="flex justify-between text-[var(--mx-muted)]">
            <span>Size limit</span>
            <b className="tabular-nums text-[var(--mx-text)]">{f.sizeLimit.toFixed(2)} lot max</b>
          </div>
          <input
            type="range" min={0.1} max={1} step={0.05} value={Math.min(f.sizeLimit, 1)}
            onChange={(e) => setSizeLimit(f.id, Number(e.target.value))}
            aria-label={`${f.name} size limit`}
            className="mt-1 w-full accent-[var(--mx-accent)]"
          />
        </div>
      </div>
      <p className="mt-2 rounded-lg bg-[var(--mx-bg)] px-2 py-1.5 text-[11px] text-[var(--mx-muted)]">
        Copy preview — next 1.00 lot lead trade → <b className="tabular-nums text-[var(--mx-text)]">{copySize(1, f).toFixed(2)} lot</b>
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] font-medium text-[var(--mx-muted)]">{f.paused ? "Follower paused" : "Follower active"}</span>
        <button
          role="switch" aria-checked={!f.paused} aria-label={`${f.name} copy toggle`}
          onClick={() => toggleFollower(f.id)}
          className={cn("h-5 w-9 rounded-full transition-colors", !f.paused ? "bg-[var(--mx-accent)]" : "bg-slate-300")}
        >
          <span className={cn("block h-4 w-4 translate-x-0.5 rounded-full bg-[var(--mx-card)] transition-transform", !f.paused && "translate-x-[18px]")} />
        </button>
      </div>
    </div>
  );
}

export function JournalView() {
  const closedTrades = useMechanix((s) => s.closedTrades);
  const journalDay = useMechanix((s) => s.journalDay);
  const setJournalDay = useMechanix((s) => s.setJournalDay);

  const month = useMemo(() => {
    const now = new Date();
    return {
      now,
      daysInMonth: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(),
      offset: new Date(now.getFullYear(), now.getMonth(), 1).getDay(),
      label: now.toLocaleString("en-US", { month: "long", year: "numeric" }),
    };
  }, []);

  const { days, monthTrades } = useMemo(() => {
    const days = new Map<number, { pnl: number; trades: number }>();
    const monthTrades = closedTrades.filter((t) => {
      const d = new Date(t.timeClose);
      return d.getFullYear() === month.now.getFullYear() && d.getMonth() === month.now.getMonth();
    });
    for (const t of monthTrades) {
      const day = new Date(t.timeClose).getDate();
      const cur = days.get(day) ?? { pnl: 0, trades: 0 };
      cur.pnl += t.pnl;
      cur.trades += 1;
      days.set(day, cur);
    }
    return { days, monthTrades };
  }, [closedTrades, month]);

  const net = monthTrades.reduce((a, t) => a + t.pnl, 0);
  const wins = [...days.values()].filter((d) => d.pnl > 0).length;
  const losses = [...days.values()].filter((d) => d.pnl < 0).length;
  const avgR = monthTrades.length ? monthTrades.reduce((a, t) => a + t.rMultiple, 0) / monthTrades.length : 0;
  const maxAbs = Math.max(1, ...[...days.values()].map((d) => Math.abs(d.pnl)));

  // Per-trade stats for §3.6 metrics.
  const tradeWins = monthTrades.filter((t) => t.pnl > 0);
  const winRate = monthTrades.length ? (tradeWins.length / monthTrades.length) * 100 : 0;
  const grossWin = tradeWins.reduce((a, t) => a + t.pnl, 0);
  const grossLoss = Math.abs(monthTrades.filter((t) => t.pnl < 0).reduce((a, t) => a + t.pnl, 0));
  const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? Infinity : 0;
  // Cumulative P&L by close date → equity trend + max peak-to-trough drawdown.
  const equity = useMemo(() => {
    const sorted = [...monthTrades].sort((a, b) => a.timeClose.localeCompare(b.timeClose));
    const pts: { cum: number }[] = [];
    let cum = 0;
    for (const t of sorted) {
      cum += t.pnl;
      pts.push({ cum });
    }
    let peak = 0;
    let maxDD = 0;
    for (const p of pts) {
      peak = Math.max(peak, p.cum);
      maxDD = Math.max(maxDD, peak - p.cum);
    }
    return { pts, maxDD };
  }, [monthTrades]);

  const kpis: [string, string, boolean][] = [
    ["Net P&L", `${net >= 0 ? "+" : "-"}$${Math.abs(net)}`, net >= 0],
    ["Win days", `${wins}`, true],
    ["Loss days", `${losses}`, losses === 0],
    ["Avg R", `${avgR >= 0 ? "+" : ""}${avgR.toFixed(1)}R`, avgR >= 0],
    ["Win rate", `${winRate.toFixed(0)}%`, winRate >= 50],
    ["Profit factor", profitFactor === Infinity ? "∞" : profitFactor.toFixed(2), profitFactor >= 1],
    ["Max drawdown", `-$${Math.round(equity.maxDD)}`, equity.maxDD === 0],
  ];

  const spark = (() => {
    if (equity.pts.length === 0) return "";
    const cums = equity.pts.map((p) => p.cum);
    const min = Math.min(0, ...cums);
    const max = Math.max(0, ...cums);
    const span = Math.max(1, max - min);
    const w = 160;
    const h = 36;
    return cums
      .map((c, i) => `${(i / Math.max(1, cums.length - 1)) * w},${h - ((c - min) / span) * h}`)
      .join(" ");
  })();

  return (
    <div className="grid gap-3 p-4" data-testid="view-journal">
      <div className="grid gap-3 sm:grid-cols-4">
        {kpis.map(([l, v, ok]) => (
          <div key={l} className="rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] p-3">
            <p className="text-[11px] text-[var(--mx-muted)]">{l}</p>
            <p className={cn("text-xl font-bold tabular-nums", ok ? "text-[var(--mx-primary)]" : "text-[var(--mx-down)]")}>{v}</p>
          </div>
        ))}
        <div className="rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] p-3" data-testid="equity-sparkline">
          <p className="text-[11px] text-[var(--mx-muted)]">Equity trend</p>
          {spark ? (
            <svg viewBox="0 0 160 36" className="mt-1 h-9 w-full" role="img" aria-label="Cumulative P&L trend">
              <polyline points={spark} fill="none" stroke="var(--mx-accent)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          ) : (
            <p className="mt-1 text-[11px] text-[var(--mx-faint)]">No trades yet</p>
          )}
        </div>
      </div>
      <div className="rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] p-4">
        <p className="mb-2 text-[13px] font-bold text-[var(--mx-text)]">{month.label} — win/loss calendar</p>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: month.offset }, (_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {Array.from({ length: month.daysInMonth }, (_, i) => i + 1).map((day) => {
            const cell = days.get(day);
            const pnl = cell?.pnl ?? 0;
            const hasTrades = (cell?.trades ?? 0) > 0;
            const pct = hasTrades && pnl !== 0 ? 14 + Math.round((Math.abs(pnl) / maxAbs) * 42) : 0;
            return (
              <button
                key={day}
                onClick={() => setJournalDay(day)}
                aria-label={`Day ${day}: ${!hasTrades ? "no trades" : `${pnl > 0 ? "+" : "-"}$${Math.abs(pnl)} across ${cell?.trades} trade${cell?.trades === 1 ? "" : "s"}`}`}
                aria-pressed={journalDay === day}
                style={hasTrades && pnl !== 0
                  ? { backgroundColor: `color-mix(in srgb, var(${pnl > 0 ? "--mx-up" : "--mx-down"}) ${pct}%, transparent)` }
                  : undefined}
                className={cn(
                  "flex h-12 flex-col items-center justify-center rounded-lg border text-[11px] font-semibold transition-colors",
                  journalDay === day ? "border-[var(--mx-accent)] ring-2 ring-[var(--mx-accent)]/30" : "border-transparent",
                  !hasTrades || pnl === 0 ? "bg-[var(--mx-bg)] text-[var(--mx-faint)]" : pnl > 0 ? "text-[var(--mx-primary)]" : "text-[var(--mx-down)]"
                )}
              >
                <span>{day}</span>
                <span className="text-[9px] tabular-nums">
                  {!hasTrades ? "—" : `${pnl > 0 ? "+" : "-"}$${Math.abs(pnl)}`}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] text-[var(--mx-faint)]">Select a day for trade detail and notes on the right rail. Closing a position in Trade adds it here. Concept — simulated data.</p>
      </div>
    </div>
  );
}

"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Rewind, X } from "lucide-react";
import { toast } from "sonner";
import { useMechanix } from "@/components/mechanix/workspace/store";
import { chartFullscreen } from "@/components/mechanix/workspace/chart-fs";
import { useSimFeed } from "@/components/mechanix/workspace/use-sim-feed";
import { formatPrice } from "@/components/mechanix/workspace/mock-data";
import { ChartWatchlist } from "./chart-watchlist";
import { TradeToolbar } from "./trade-toolbar";
import { cn } from "@/lib/utils";
import { PriceChart } from "./price-chart";
import { ChartToolbar } from "./chart-toolbar";
import { DrawingRail } from "./drawing-rail";
import { OrderTicket } from "@/components/mechanix/panels/order-ticket";

export interface ChartWorkspaceHandle {
  toggleFullscreen: () => void;
}

const PANE_SPECS: Record<number, { symbol: string; tf: string }[]> = {
  2: [{ symbol: "EURUSD", tf: "15m" }, { symbol: "EURUSD", tf: "1H" }],
  4: [
    { symbol: "EURUSD", tf: "15m" },
    { symbol: "EURUSD", tf: "1H" },
    { symbol: "GBPUSD", tf: "1H" },
    { symbol: "NQ", tf: "15m" },
  ],
};

export const ChartWorkspace = forwardRef<ChartWorkspaceHandle, { showToolbar?: boolean }>(
  function ChartWorkspace({ showToolbar = true }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const setFullscreen = useMechanix((s) => s.setFullscreen);
    const isFullscreen = useMechanix((s) => s.isFullscreen);
    const layout = useMechanix((s) => s.chartLayout);
    const symbol = useMechanix((s) => s.symbol);
    const timeframe = useMechanix((s) => s.timeframe);
    const [syncTf, setSyncTf] = useState(false);
    const replayIndex = useMechanix((s) => s.replayIndex);
    const setReplayIndex = useMechanix((s) => s.setReplayIndex);
    const watchlistOpen = useMechanix((s) => s.watchlistOpen);
    const showQuickTrade = useMechanix((s) => s.showQuickTrade);
    const addPosition = useMechanix((s) => s.addPosition);
    const ticket = useMechanix((s) => s.ticket);

    const toggleFullscreen = useCallback(() => {
      const el = containerRef.current;
      if (!el) return;
      if (document.fullscreenElement) {
        void document.exitFullscreen();
      } else {
        void el.requestFullscreen().catch(() => setFullscreen(false));
      }
    }, [setFullscreen]);

    useImperativeHandle(ref, () => ({ toggleFullscreen }), [toggleFullscreen]);

    useEffect(() => {
      chartFullscreen.toggle = toggleFullscreen;
      return () => {
        chartFullscreen.toggle = () => {};
      };
    }, [toggleFullscreen]);

    const onFsChange = useCallback(() => setFullscreen(Boolean(document.fullscreenElement)), [setFullscreen]);
    const attachRef = useCallback(
      (el: HTMLDivElement | null) => {
        containerRef.current = el;
        el?.addEventListener("fullscreenchange", onFsChange);
      },
      [onFsChange]
    );

    const panes = layout === 1 ? [{ symbol, tf: timeframe }] : PANE_SPECS[layout];
    const feed = useSimFeed(symbol, timeframe);
    const last = feed.last;
    const change = last && feed.candles.length > 1 ? last.close - feed.candles[0].open : 0;
    const pct = last ? (change / feed.candles[0].open) * 100 : 0;

    return (
      <div ref={attachRef} className={cn("flex h-full flex-col overflow-hidden rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] shadow-[0_1px_2px_rgba(15,61,46,0.05)]", isFullscreen && "rounded-none border-0")}>
        {showToolbar && <ChartToolbar onFullscreen={toggleFullscreen} />}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 border-b border-[var(--mx-border)] px-3 py-1.5 text-[11px] tabular-nums" aria-live="polite">
          <span className="font-semibold text-[var(--mx-text)]">{symbol}</span>
          <span className="text-[var(--mx-faint)]">{timeframe}</span>
          {last && (
            <>
              <span className="text-[var(--mx-muted)]">O <b className="text-[var(--mx-text)]">{formatPrice(last.open, symbol)}</b></span>
              <span className="text-[var(--mx-muted)]">H <b className="text-[var(--mx-text)]">{formatPrice(last.high, symbol)}</b></span>
              <span className="text-[var(--mx-muted)]">L <b className="text-[var(--mx-text)]">{formatPrice(last.low, symbol)}</b></span>
              <span className="text-[var(--mx-muted)]">C <b className="text-[var(--mx-text)]">{formatPrice(last.close, symbol)}</b></span>
              <span className={cn("font-semibold", change >= 0 ? "text-[var(--mx-up)]" : "text-[var(--mx-down)]")}>
                {change >= 0 ? "+" : ""}{formatPrice(Math.abs(change), symbol).replace(/^/, change >= 0 ? "" : "-")} ({pct >= 0 ? "+" : ""}{pct.toFixed(2)}%)
              </span>
            </>
          )}
          {layout > 1 && (
            <label className="ml-auto flex items-center gap-1.5 text-[11px] font-medium text-[var(--mx-muted)]">
              <input type="checkbox" checked={syncTf} onChange={(e) => setSyncTf(e.target.checked)} className="accent-[var(--mx-accent)]" />
              Sync timeframe
            </label>
          )}
        </div>
        {replayIndex != null && (
          <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px]" data-testid="replay-bar">
            <Rewind className="h-3.5 w-3.5 text-amber-700" />
            <span className="font-semibold text-amber-800">Bar Replay</span>
            <button aria-label="Step back one bar" onClick={() => setReplayIndex(Math.max(1, replayIndex - 1))}
              className="rounded p-0.5 text-amber-800 hover:bg-amber-100"><ChevronLeft className="h-3.5 w-3.5" /></button>
            <input
              type="range" min={2} max={feed.candles.length} value={replayIndex}
              onChange={(e) => setReplayIndex(Number(e.target.value))}
              aria-label="Replay position"
              className="w-40 accent-amber-600"
            />
            <button aria-label="Step forward one bar" onClick={() => setReplayIndex(Math.min(feed.candles.length, replayIndex + 1))}
              className="rounded p-0.5 text-amber-800 hover:bg-amber-100"><ChevronRight className="h-3.5 w-3.5" /></button>
            <span className="tabular-nums text-amber-700">{replayIndex} / {feed.candles.length}</span>
            <button aria-label="Exit replay" onClick={() => setReplayIndex(null)}
              className="ml-auto rounded p-0.5 text-amber-800 hover:bg-amber-100"><X className="h-3.5 w-3.5" /></button>
          </div>
        )}
        <div className="relative flex min-h-0 flex-1">
          <DrawingRail />
          <div className={cn("grid min-h-0 flex-1", layout === 4 ? "grid-cols-2 grid-rows-2" : layout === 2 ? "grid-cols-2" : "grid-cols-1")} data-testid="chart-panes">
            {panes.map((p, i) => (
              <Pane key={`${p.symbol}-${p.tf}-${i}`} symbol={p.symbol} tf={p.tf} syncTf={syncTf ? timeframe : undefined} />
            ))}
          </div>
          {showQuickTrade && layout === 1 && last && (
            <div className="absolute left-12 top-2 z-20 flex gap-1.5" data-testid="quick-trade">
              {(["sell", "buy"] as const).map((side) => (
                <button
                  key={side}
                  onClick={() => {
                    const entry = last.close;
                    const dir = side === "buy" ? 1 : -1;
                    addPosition({
                      id: `pos-${Date.now()}-${side}`, symbol, side, entry,
                      volume: ticket.volume,
                      sl: entry - dir * entry * 0.0025,
                      tp: entry + dir * entry * 0.005,
                      entryTime: last.time,
                    });
                    toast.success(`Quick ${side.toUpperCase()} ${ticket.volume} ${symbol} @ ${formatPrice(entry, symbol)}`, {
                      description: "Simulated market order — concept only.",
                    });
                  }}
                  className={cn(
                    "rounded-md px-3 py-1 text-[11px] font-bold text-white shadow-sm transition-transform hover:scale-[1.03]",
                    side === "buy" ? "bg-[var(--mx-accent)] hover:bg-[var(--mx-primary)]" : "bg-[var(--mx-down)] hover:bg-[#B91C1C]"
                  )}
                >
                  {side === "buy" ? `Buy ${formatPrice(last.close, symbol)}` : `Sell ${formatPrice(last.close, symbol)}`}
                </button>
              ))}
            </div>
          )}
          {watchlistOpen && <ChartWatchlist />}
          {isFullscreen && (
            <div className="absolute bottom-3 right-3 top-12 z-30 w-[280px] overflow-y-auto rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] shadow-xl" data-testid="mini-ticket">
              <OrderTicket />
            </div>
          )}
        </div>
        <TradeToolbar />
      </div>
    );
  }
);

function Pane({ symbol, tf, syncTf }: { symbol: string; tf: string; syncTf?: string }) {
  const effective = syncTf ?? tf;
  const feed = useSimFeed(symbol, effective);
  return (
    <div className="relative min-h-[220px] border-[var(--mx-border)] [&:nth-child(even)]:border-l [&:nth-child(n+3)]:border-t">
      <div className="absolute left-2 top-1.5 z-20 rounded bg-white/85 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--mx-muted)]">
        {symbol} · {effective}
      </div>
      <PriceChart feed={feed} symbol={symbol} />
    </div>
  );
}

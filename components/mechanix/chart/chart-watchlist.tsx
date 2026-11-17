"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMechanix } from "@/components/mechanix/workspace/store";
import { SYMBOLS, formatPrice } from "@/components/mechanix/workspace/mock-data";
import { useSimFeed } from "@/components/mechanix/workspace/use-sim-feed";

const GROUPS = ["Forex", "Futures", "Crypto", "Stocks"] as const;

export function ChartWatchlist() {
  const symbol = useMechanix((s) => s.symbol);
  const setSymbol = useMechanix((s) => s.setSymbol);
  const setWatchlistOpen = useMechanix((s) => s.setWatchlistOpen);

  return (
    <div className="flex w-[216px] shrink-0 flex-col border-l border-[var(--mx-border)] bg-[var(--mx-card)]" data-testid="chart-watchlist">
      <div className="flex items-center justify-between border-b border-[var(--mx-border)] px-2.5 py-1.5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--mx-muted)]">Watchlist</p>
        <button aria-label="Close watchlist" onClick={() => setWatchlistOpen(false)}
          className="rounded p-0.5 text-[var(--mx-faint)] hover:bg-[var(--mx-hover)] hover:text-[var(--mx-muted)]">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-2 border-b border-[var(--mx-border)] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-[var(--mx-faint)]">
        <span>Sym</span><span className="text-right">Last</span><span className="text-right">Chg</span><span className="text-right">Chg%</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {GROUPS.map((g) => (
          <div key={g}>
            <p className="border-b border-[var(--mx-bg)] bg-[var(--mx-bg)]/60 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[var(--mx-faint)]">{g}</p>
            {SYMBOLS.filter((s) => s.group === g).map((s) => (
              <WlRow key={s.symbol} symbol={s.symbol} active={s.symbol === symbol} onPick={() => setSymbol(s.symbol)} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function WlRow({ symbol, active, onPick }: { symbol: string; active: boolean; onPick: () => void }) {
  const feed = useSimFeed(symbol, "1m");
  const first = feed.candles[0];
  const last = feed.last;
  const chg = last && first ? last.close - first.open : 0;
  const pct = first ? (chg / first.open) * 100 : 0;
  const up = chg >= 0;
  return (
    <button
      onClick={onPick}
      aria-pressed={active}
      className={cn(
        "grid w-full grid-cols-[1fr_auto_auto_auto] items-center gap-x-2 px-2.5 py-1 text-left text-[11px] tabular-nums transition-colors hover:bg-[var(--mx-bg)]",
        active && "bg-[var(--mx-active-bg)]"
      )}
    >
      <span className="truncate font-semibold text-[var(--mx-text)]">{symbol}</span>
      <span className="text-right text-[var(--mx-muted)]">{last ? formatPrice(last.close, symbol) : "—"}</span>
      <span className={cn("text-right", up ? "text-[var(--mx-up)]" : "text-[var(--mx-down)]")}>{up ? "+" : ""}{chg.toFixed(chg > -1 && chg < 1 ? 4 : 2)}</span>
      <span className={cn("w-12 text-right font-medium", up ? "text-[var(--mx-up)]" : "text-[var(--mx-down)]")}>{up ? "+" : ""}{pct.toFixed(2)}%</span>
    </button>
  );
}

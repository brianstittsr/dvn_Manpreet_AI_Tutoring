"use client";

import { useRef, useState } from "react";
import { Bookmark } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ChartWorkspace, type ChartWorkspaceHandle } from "@/components/mechanix/chart/chart-workspace";
import { HeatmapCanvas } from "@/components/mechanix/chart/orderflow";
import { PriceChart } from "@/components/mechanix/chart/price-chart";
import { useSimFeed } from "@/components/mechanix/workspace/use-sim-feed";
import { SCAN_RESULTS, SYMBOLS, formatPrice } from "@/components/mechanix/workspace/mock-data";

export function PracticeView() {
  const wsRef = useRef<ChartWorkspaceHandle>(null);
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-3" data-testid="view-practice">
      <div className="min-h-0 flex-1">
        <ChartWorkspace ref={wsRef} />
      </div>
      <UnderChartTabs />
    </div>
  );
}

function UnderChartTabs() {
  return (
    <div className="shrink-0 rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] shadow-[0_1px_2px_rgba(15,61,46,0.05)]">
      <Tabs defaultValue="analysis">
        <TabsList className="h-9 w-full justify-start rounded-none border-b border-[var(--mx-border)] bg-transparent px-2">
          {["Analysis", "Trade Ideas", "Notes", "Lessons in Focus"].map((t) => (
            <TabsTrigger key={t} value={t.toLowerCase().replace(/ /g, "-")}
              className="h-9 rounded-none border-b-2 border-transparent px-3 text-[12px] data-[state=active]:border-[var(--mx-accent)] data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-[var(--mx-primary)] data-[state=active]:shadow-none">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
        {["analysis", "trade-ideas", "notes", "lessons-in-focus"].map((v) => (
          <TabsContent key={v} value={v} className="m-0">
            <div className="flex items-start gap-2 p-3">
              <Bookmark className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mx-accent)]" />
              <p className="text-[12px] leading-snug text-[var(--mx-muted)]">
                <b className="text-[var(--mx-text)]">Chart Note:</b> Price is testing the demand zone (1.0840 – 1.0865).
                Look for a clear reaction, such as a bullish candle pattern or a break of a nearby swing, before considering a long setup in simulation.
              </p>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export function MarketsView() {
  const [sortAsc, setSortAsc] = useState(true);
  const rows = [...SYMBOLS].sort((a, b) => (sortAsc ? a.base - b.base : b.base - a.base));
  return (
    <div className="grid gap-3 p-4" data-testid="view-markets">
      <div className="grid gap-3 sm:grid-cols-4">
        {SYMBOLS.slice(0, 4).map((s) => (
          <div key={s.symbol} className="rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] p-3">
            <p className="text-[11px] font-semibold text-[var(--mx-muted)]">{s.symbol}</p>
            <p className="text-lg font-bold tabular-nums text-[var(--mx-text)]">{formatPrice(s.base, s.symbol)}</p>
            <p className="text-[11px] font-medium text-[var(--mx-up)]">+0.42% today</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)]">
        <div className="flex items-center justify-between border-b border-[var(--mx-border)] px-3 py-2">
          <p className="text-[13px] font-bold text-[var(--mx-text)]">All instruments</p>
          <button onClick={() => setSortAsc(!sortAsc)} className="text-[11px] font-semibold text-[var(--mx-primary)] hover:underline">
            Sort by price {sortAsc ? "↓" : "↑"}
          </button>
        </div>
        <table className="w-full text-[12px]">
          <thead><tr className="border-b border-[var(--mx-border)] text-left text-[10px] uppercase tracking-wide text-[var(--mx-faint)]">
            <th className="px-3 py-2">Symbol</th><th className="px-3 py-2">Name</th><th className="px-3 py-2">Group</th><th className="px-3 py-2 text-right">Ref price</th><th className="px-3 py-2 text-right">Zone</th>
          </tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.symbol} className={cn("border-b border-[var(--mx-bg)] hover:bg-[var(--mx-bg)]/60", i % 2 === 1 && "bg-[var(--mx-bg)]/40")}>
                <td className="px-3 py-2 font-bold text-[var(--mx-text)]">{r.symbol}</td>
                <td className="px-3 py-2 text-[var(--mx-muted)]">{r.name}</td>
                <td className="px-3 py-2"><span className="rounded-full bg-[var(--mx-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--mx-muted)]">{r.group}</span></td>
                <td className="px-3 py-2 text-right tabular-nums text-[var(--mx-text)]">{formatPrice(r.base, r.symbol)}</td>
                <td className="px-3 py-2 text-right"><span className={cn("text-[10px] font-bold", i % 3 === 0 ? "text-[var(--mx-up)]" : "text-[var(--mx-faint)]")}>{i % 3 === 0 ? "Near zone" : "—"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ScannerView() {
  const [selected, setSelected] = useState(0);
  const feed = useSimFeed(SCAN_RESULTS[selected].symbol, "1H");
  const r = SCAN_RESULTS[selected];
  return (
    <div className="grid gap-3 p-4 lg:grid-cols-[1fr_280px]" data-testid="view-scanner">
      <div className="rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)]">
        <div className="flex items-center justify-between border-b border-[var(--mx-border)] px-3 py-2">
          <p className="text-[13px] font-bold text-[var(--mx-text)]">Four Filter results</p>
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Educational, not advice</span>
        </div>
        <table className="w-full text-[12px]">
          <thead><tr className="border-b border-[var(--mx-border)] text-left text-[10px] uppercase tracking-wide text-[var(--mx-faint)]">
            <th className="px-3 py-2">Symbol</th><th className="px-3 py-2">Zone</th><th className="px-3 py-2">Freshness</th><th className="px-3 py-2">Trapped</th><th className="px-3 py-2">Math</th><th className="px-3 py-2 text-right">Score</th>
          </tr></thead>
          <tbody>
            {SCAN_RESULTS.map((row, i) => (
              <tr key={row.symbol} onClick={() => setSelected(i)} aria-selected={selected === i}
                className={cn("cursor-pointer border-b border-[var(--mx-bg)] hover:bg-[var(--mx-bg)]/60", selected === i && "bg-[var(--mx-active-bg)]")}>
                <td className="px-3 py-2 font-bold text-[var(--mx-text)]">{row.symbol}</td>
                <td className="px-3 py-2 text-[var(--mx-muted)]">{row.zone}</td>
                <td className="px-3 py-2"><span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", row.freshness === "Fresh" ? "bg-[var(--mx-active-bg)] text-[var(--mx-primary)]" : "bg-[var(--mx-hover)] text-[var(--mx-muted)]")}>{row.freshness}</span></td>
                <td className="px-3 py-2 text-[var(--mx-muted)]">{row.trapped}</td>
                <td className="px-3 py-2 font-semibold tabular-nums text-[var(--mx-text)]">{row.math}</td>
                <td className="px-3 py-2 text-right"><span className="rounded-full bg-[var(--mx-primary)] px-2 py-0.5 text-[10px] font-bold text-white">{row.score}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">{r.symbol} — {r.zone}</p>
        <div className="h-48"><PriceChart feed={feed} symbol={r.symbol} interactive={false} compact /></div>
        <p className="mt-2 text-[11px] text-[var(--mx-muted)]">Score {r.score}/100 — {r.freshness.toLowerCase()} zone, trapped participants {r.trapped.toLowerCase()}, R:R {row2(r.math)}.</p>
      </div>
    </div>
  );
}
function row2(m: string) { return m; }

export function OrderflowView() {
  return (
    <div className="flex h-full flex-col gap-3 p-4" data-testid="view-orderflow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-[var(--mx-text)]">Bookmap / Order Flow — simulated liquidity</h1>
          <span className="rounded-full bg-[var(--mx-active-bg)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--mx-primary)]">Bookmap</span>
        </div>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">Concept • Illustrative data</span>
      </div>
      <div className="min-h-0 flex-1 rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] p-2">
        <HeatmapCanvas symbol="EURUSD" />
      </div>
      <p className="text-[11px] text-[var(--mx-faint)]">Green = bid liquidity, red = ask liquidity. Bubbles = simulated prints. The DOM ladder is on the right rail.</p>
    </div>
  );
}

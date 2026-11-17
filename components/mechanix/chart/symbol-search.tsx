"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useMechanix } from "@/components/mechanix/workspace/store";
import { SYMBOLS, type SymbolInfo } from "@/components/mechanix/workspace/mock-data";

const TABS = ["All", "Stocks", "Futures", "Forex", "Crypto"] as const;

const GROUP_STYLE: Record<SymbolInfo["group"], { chip: string; tag: string; venue: string }> = {
  Forex: { chip: "bg-[#2563EB]", tag: "FOREX", venue: "FX_IDC" },
  Futures: { chip: "bg-[var(--mx-down)]", tag: "FUTURES", venue: "CME" },
  Crypto: { chip: "bg-[#F59E0B]", tag: "CRYPTO", venue: "CRYPTO" },
  Stocks: { chip: "bg-[var(--mx-deep)]", tag: "STOCK", venue: "NASDAQ" },
};

export function SymbolSearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const setSymbol = useMechanix((s) => s.setSymbol);
  const current = useMechanix((s) => s.symbol);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return SYMBOLS.filter((s) =>
      (tab === "All" || s.group === tab) &&
      (!needle || s.symbol.toLowerCase().includes(needle) || s.name.toLowerCase().includes(needle))
    );
  }, [q, tab]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0" data-testid="symbol-search">
        <DialogTitle className="sr-only">Symbol search</DialogTitle>
        <div className="flex items-center gap-2 border-b border-[var(--mx-border)] px-3 py-2.5">
          <Search className="h-4 w-4 text-[var(--mx-faint)]" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Symbol, ISIN, or CUSIP"
            className="flex-1 bg-transparent text-sm text-[var(--mx-text)] outline-none placeholder:text-[var(--mx-faint)]"
          />
        </div>
        <div className="flex gap-1 border-b border-[var(--mx-border)] px-3 py-2" role="tablist" aria-label="Market">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                tab === t ? "bg-[var(--mx-primary)] text-white" : "text-[var(--mx-muted)] hover:bg-[var(--mx-hover)]"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="max-h-[46vh] overflow-y-auto py-1">
          {results.length === 0 && <p className="px-4 py-6 text-center text-xs text-[var(--mx-faint)]">No symbols match “{q}”.</p>}
          {results.map((s) => {
            const g = GROUP_STYLE[s.group];
            return (
              <button
                key={s.symbol}
                onClick={() => { setSymbol(s.symbol); onOpenChange(false); setQ(""); }}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-[var(--mx-bg)]",
                  s.symbol === current && "bg-[var(--mx-active-bg)]"
                )}
              >
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white", g.chip)}>
                  {s.symbol.slice(0, 3)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-[13px] font-bold text-[var(--mx-text)]">
                    {s.symbol}
                    <span className="rounded bg-[var(--mx-hover)] px-1 py-0.5 text-[9px] font-semibold tracking-wide text-[var(--mx-muted)]">{g.tag}</span>
                  </span>
                  <span className="block truncate text-[11px] uppercase tracking-wide text-[var(--mx-faint)]">{s.name}</span>
                </span>
                <span className="text-[10px] font-semibold text-[var(--mx-faint)]">{g.venue}</span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

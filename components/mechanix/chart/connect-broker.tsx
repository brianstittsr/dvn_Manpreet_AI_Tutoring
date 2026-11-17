"use client";

import { Lock, Rewind, Star, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useMechanix } from "@/components/mechanix/workspace/store";
import { useSimFeed } from "@/components/mechanix/workspace/use-sim-feed";

interface Broker { name: string; rating: number; color: string; mark: string; featured?: boolean }
const BROKERS: Broker[] = [
  { name: "TradeStation", rating: 4.3, color: "#0EA5E9", mark: "T", featured: true },
  { name: "Webull", rating: 4.3, color: "#6D28D9", mark: "W" },
  { name: "FOREX.com", rating: 4.5, color: "#16A34A", mark: "F" },
  { name: "Tradovate", rating: 4.5, color: "#2563EB", mark: "T" },
  { name: "Alpaca", rating: 3.9, color: "#F59E0B", mark: "a" },
  { name: "Tradier", rating: 3.6, color: "#DC2626", mark: "T" },
  { name: "Interactive Brokers", rating: 4.1, color: "#B91C1C", mark: "IB" },
  { name: "moomoo", rating: 4.6, color: "#F97316", mark: "m" },
  { name: "OANDA", rating: 4.5, color: "#1E3A8A", mark: "O" },
  { name: "NinjaTrader", rating: 4.5, color: "#EA580C", mark: "NT" },
  { name: "AMP", rating: 4.4, color: "#38BDF8", mark: "A" },
  { name: "OKX", rating: 4.4, color: "#111827", mark: "OK" },
];

export function ConnectBrokerDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const symbol = useMechanix((s) => s.symbol);
  const timeframe = useMechanix((s) => s.timeframe);
  const setReplayIndex = useMechanix((s) => s.setReplayIndex);
  const setAccountMode = useMechanix((s) => s.setAccountMode);
  const setLiveGateOpen = useMechanix((s) => s.setLiveGateOpen);
  const feed = useSimFeed(symbol, timeframe);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0" data-testid="broker-dialog">
        <DialogTitle className="sr-only">Trading panel — choose a connection</DialogTitle>
        <div className="max-h-[70vh] overflow-y-auto p-4">
          <p className="pb-2 text-[13px] font-bold text-[var(--mx-text)]">Practice risk-free</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              onClick={() => { setAccountMode("simulation"); onOpenChange(false); toast.success("Paper Trading active — simulation mode."); }}
              className="flex items-center gap-3 rounded-xl border border-[var(--mx-border)] p-3 text-left transition-colors hover:border-[var(--mx-active-border)] hover:bg-[var(--mx-bg)]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--mx-primary)] text-white"><Wallet className="h-4 w-4" /></span>
              <span>
                <span className="block text-[13px] font-bold text-[var(--mx-text)]">Paper Trading</span>
                <span className="block text-[11px] text-[var(--mx-faint)]">Brokerage simulator — no real money</span>
              </span>
            </button>
            <button
              onClick={() => {
                setReplayIndex(Math.max(10, feed.candles.length - 40));
                onOpenChange(false);
                toast("Replay started — scrub or step through bars on the replay strip.");
              }}
              className="flex items-center gap-3 rounded-xl border border-[var(--mx-border)] p-3 text-left transition-colors hover:border-[var(--mx-active-border)] hover:bg-[var(--mx-bg)]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-700 text-white"><Rewind className="h-4 w-4" /></span>
              <span>
                <span className="block text-[13px] font-bold text-[var(--mx-text)]">Replay Trading</span>
                <span className="block text-[11px] text-[var(--mx-faint)]">Simulator on historical data</span>
              </span>
            </button>
          </div>

          <p className="pb-2 pt-4 text-[13px] font-bold text-[var(--mx-text)]">Trade with your broker</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {BROKERS.map((b) => (
              <button
                key={b.name}
                onClick={() => { onOpenChange(false); setLiveGateOpen(true); }}
                className="relative flex flex-col items-center gap-1.5 rounded-xl border border-[var(--mx-border)] p-3 transition-colors hover:border-[var(--mx-active-border)] hover:bg-[var(--mx-bg)]"
              >
                {b.featured && <span className="absolute left-2 top-2 rounded bg-amber-100 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wide text-amber-700">Featured</span>}
                <Lock className="absolute right-2 top-2 h-3 w-3 text-[var(--mx-faint)]" />
                <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-[11px] font-bold text-white")} style={{ backgroundColor: b.color }}>
                  {b.mark}
                </span>
                <span className="text-[12px] font-semibold text-[var(--mx-text)]">{b.name}</span>
                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-[var(--mx-muted)]">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {b.rating.toFixed(1)}
                </span>
              </button>
            ))}
          </div>
          <p className="pt-3 text-center text-[10px] text-[var(--mx-faint)]">Concept — broker connections stay locked until the live-readiness checklist is complete.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

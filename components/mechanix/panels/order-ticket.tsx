"use client";

import { useState } from "react";
import { Minus, Plus, Info, Lock, CheckCircle2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useMechanix } from "@/components/mechanix/workspace/store";
import { symbolInfo } from "@/components/mechanix/workspace/mock-data";
import { useSimFeed } from "@/components/mechanix/workspace/use-sim-feed";
import { ChartSettingsDialog } from "@/components/mechanix/chart/chart-settings";

const GATE_ITEMS = [
  { label: "Readiness score ≥ threshold", done: false },
  { label: "Partner approval", done: false },
  { label: "Account ownership verified", done: false },
  { label: "Entitlement check passed", done: false },
  { label: "Risk disclosures acknowledged", done: false },
  { label: "Final acknowledgment signed", done: false },
];

export function OrderTicket() {
  const symbol = useMechanix((s) => s.symbol);
  const info = symbolInfo(symbol);
  const feed = useSimFeed(symbol, "1m");
  const last = feed.last?.close ?? info.base;
  const ticket = useMechanix((s) => s.ticket);
  const setTicket = useMechanix((s) => s.setTicket);
  const accountMode = useMechanix((s) => s.accountMode);
  const setAccountMode = useMechanix((s) => s.setAccountMode);
  const liveUnlocked = useMechanix((s) => s.liveUnlocked);
  const liveGateOpen = useMechanix((s) => s.liveGateOpen);
  const setLiveGateOpen = useMechanix((s) => s.setLiveGateOpen);
  const addPosition = useMechanix((s) => s.addPosition);
  const paperBalance = useMechanix((s) => s.paperBalance);
  const [paperOpen, setPaperOpen] = useState(false);
  const [gateChecks, setGateChecks] = useState<boolean[]>(() => GATE_ITEMS.map((g) => g.done));

  const step = info.pip;
  const price = ticket.type === "market" ? last : ticket.price;
  const riskPips = Math.abs(price - ticket.sl) / info.pip;
  const rewardPips = Math.abs(ticket.tp - price) / info.pip;
  const riskUsd = riskPips * 10 * ticket.volume;
  const rewardUsd = rewardPips * 10 * ticket.volume;
  const rr = riskPips > 0 ? rewardPips / riskPips : 0;

  const bump = (key: "price" | "volume" | "sl" | "tp", dir: 1 | -1, inc?: number) => {
    const i = inc ?? step;
    setTicket({ [key]: Math.round((ticket[key] + dir * i) / step) * step } as never);
  };

  const place = () => {
    addPosition({
      id: `pos-${Date.now()}`, symbol, side: ticket.side,
      entry: price, volume: ticket.volume, sl: ticket.sl, tp: ticket.tp,
      entryTime: feed.last?.time,
    });
    toast.success(`Simulated ${ticket.side.toUpperCase()} ${ticket.volume} ${symbol} @ ${price.toFixed(info.decimals)}`, {
      description: "Entry, SL and TP lines drawn on chart. Concept only — no real order sent.",
    });
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto" data-testid="order-ticket">
      <div className="grid grid-cols-2 gap-1 p-3 pb-0">
        <button
          onClick={() => setAccountMode("simulation")}
          className={cn("rounded-lg border py-1.5 text-xs font-bold transition-colors", accountMode === "simulation" ? "border-[var(--mx-primary)] bg-[var(--mx-primary)] text-white" : "border-[var(--mx-border)] text-[var(--mx-muted)] hover:bg-[var(--mx-hover)]")}
        >Simulation</button>
        <button
          onClick={() => (liveUnlocked ? setAccountMode("live") : setLiveGateOpen(true))}
          className={cn("flex items-center justify-center gap-1 rounded-lg border py-1.5 text-xs font-bold transition-colors", accountMode === "live" ? "border-[var(--mx-primary)] bg-[var(--mx-primary)] text-white" : "border-[var(--mx-border)] text-[var(--mx-faint)] hover:bg-[var(--mx-hover)]")}
        >{!liveUnlocked && <Lock className="h-3 w-3" />}Live</button>
      </div>

      <div className="p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[13px] font-bold text-[var(--mx-text)]">Order Ticket ({symbol})</p>
          <button
            aria-label="Paper trading settings"
            onClick={() => setPaperOpen(true)}
            className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-semibold text-[var(--mx-muted)] hover:bg-[var(--mx-hover)]"
          >
            <Wallet className="h-3.5 w-3.5" /> ${(paperBalance / 1000).toFixed(0)}k
          </button>
        </div>
        <ChartSettingsDialog open={paperOpen} onOpenChange={setPaperOpen} initialSection="Paper Trading" />
        <div className="grid grid-cols-2 gap-1">
          {(["buy", "sell"] as const).map((side) => (
            <button
              key={side}
              onClick={() => setTicket({ side })}
              className={cn(
                "rounded-lg border py-2 text-sm font-bold capitalize transition-colors",
                ticket.side === side
                  ? side === "buy" ? "border-[var(--mx-primary)] bg-[var(--mx-primary)] text-white" : "border-[var(--mx-down)] bg-[var(--mx-down)] text-white"
                  : "border-[var(--mx-border)] text-[var(--mx-muted)] hover:bg-[var(--mx-hover)]"
              )}
            >{side}</button>
          ))}
        </div>

        <div className="mt-3 space-y-2 text-[12px]">
          <div className="flex items-center justify-between">
            <span className="text-[var(--mx-muted)]">Order Type</span>
            <select
              aria-label="Order type"
              value={ticket.type}
              onChange={(e) => setTicket({ type: e.target.value as "market" | "limit" | "stop" })}
              className="rounded-md border border-[var(--mx-border)] bg-[var(--mx-card)] px-2 py-1 font-medium capitalize text-[var(--mx-text)] focus:outline-none focus:ring-2 focus:ring-[var(--mx-accent)]/40"
            >
              <option value="market">Market</option><option value="limit">Limit</option><option value="stop">Stop</option>
            </select>
          </div>
          <Stepper id="mx-ticket-price" label="Price" value={ticket.type === "market" ? last : ticket.price} decimals={info.decimals}
            onMinus={() => bump("price", -1)} onPlus={() => bump("price", 1)} disabled={ticket.type === "market"} />
          <Stepper label="Volume (Lots)" value={ticket.volume} decimals={2}
            onMinus={() => bump("volume", -1, 0.1)} onPlus={() => bump("volume", 1, 0.1)} />
          <Stepper label="Stop Loss" value={ticket.sl} decimals={info.decimals}
            onMinus={() => bump("sl", -1)} onPlus={() => bump("sl", 1)} />
          <Stepper label="Take Profit" value={ticket.tp} decimals={info.decimals}
            onMinus={() => bump("tp", -1)} onPlus={() => bump("tp", 1)} />
        </div>

        <div className="mt-3 space-y-1 rounded-lg bg-[var(--mx-bg)] p-2.5 text-[12px]" aria-live="polite">
          <div className="flex justify-between"><span className="flex items-center gap-1 text-[var(--mx-muted)]">Trade Risk (approx.) <Info className="h-3 w-3" /></span><b className="tabular-nums text-[var(--mx-text)]">{riskPips.toFixed(1)} pips · ${riskUsd.toFixed(0)}</b></div>
          <div className="flex justify-between"><span className="flex items-center gap-1 text-[var(--mx-muted)]">Reward (approx.) <Info className="h-3 w-3" /></span><b className="tabular-nums text-[var(--mx-text)]">{rewardPips.toFixed(1)} pips · ${rewardUsd.toFixed(0)}</b></div>
          <div className="flex justify-between"><span className="text-[var(--mx-muted)]">R : R</span>
            <b className={cn("tabular-nums", rr >= 2 ? "text-[var(--mx-accent)]" : "text-[var(--mx-down)]")}>1 : {rr.toFixed(2)}</b></div>
        </div>

        <Button onClick={place} className="mt-3 w-full bg-[var(--mx-primary)] font-bold text-white hover:bg-[var(--mx-deep)]">
          Place Simulated Order
        </Button>
        <p className="mt-2 text-center text-[10px] text-[var(--mx-faint)]">Concept • Illustrative data — nothing is executed.</p>
      </div>

      <Dialog open={liveGateOpen} onOpenChange={setLiveGateOpen}>
        <DialogContent className="max-w-sm" data-testid="live-gate-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Lock className="h-4 w-4 text-[var(--mx-primary)]" /> Live trading stays locked</DialogTitle>
            <DialogDescription>
              Live execution unlocks only after the full readiness checklist is complete. This keeps practice honest.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2">
            {GATE_ITEMS.map((g, i) => (
              <li key={g.label} className="flex items-center gap-2 text-[13px]">
                <input
                  type="checkbox"
                  checked={gateChecks[i]}
                  onChange={() => setGateChecks(gateChecks.map((v, j) => (j === i ? !v : v)))}
                  aria-label={g.label}
                  className="h-4 w-4 shrink-0 accent-[var(--mx-accent)]"
                />
                <CheckCircle2 className={cn("h-4 w-4 shrink-0", gateChecks[i] ? "text-[var(--mx-accent)]" : "text-[var(--mx-faint)]")} />
                <span className={gateChecks[i] ? "text-[var(--mx-text)]" : "text-[var(--mx-faint)]"}>{g.label}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-lg bg-amber-50 px-2 py-1.5 text-center text-[10px] font-semibold text-amber-700">
            Illustrative — no live execution. Checking these steps does not unlock live trading.
          </p>
          <Button onClick={() => setLiveGateOpen(false)} className="w-full bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]">Back to Simulation</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stepper({ label, value, decimals, onMinus, onPlus, disabled, id }: {
  label: string; value: number; decimals: number; onMinus: () => void; onPlus: () => void; disabled?: boolean; id?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--mx-muted)]">{label}</span>
      <div className="flex items-center gap-1">
        <button aria-label={`Decrease ${label}`} disabled={disabled} onClick={onMinus}
          className="flex h-6 w-6 items-center justify-center rounded border border-[var(--mx-border)] text-[var(--mx-muted)] hover:bg-[var(--mx-hover)] disabled:opacity-30"><Minus className="h-3 w-3" /></button>
        <input
          id={id}
          aria-label={label}
          value={value.toFixed(decimals)}
          readOnly
          className="w-20 rounded-md border border-[var(--mx-border)] bg-[var(--mx-card)] py-1 text-center font-semibold tabular-nums text-[var(--mx-text)] focus:outline-none focus:ring-2 focus:ring-[var(--mx-accent)]/40"
        />
        <button aria-label={`Increase ${label}`} disabled={disabled} onClick={onPlus}
          className="flex h-6 w-6 items-center justify-center rounded border border-[var(--mx-border)] text-[var(--mx-muted)] hover:bg-[var(--mx-hover)] disabled:opacity-30"><Plus className="h-3 w-3" /></button>
      </div>
    </div>
  );
}

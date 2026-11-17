"use client";

import { useState } from "react";
import { CandlestickChart, ListChecks, RotateCcw, Wallet } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMechanix } from "@/components/mechanix/workspace/store";

export const CANDLE_PALETTE = ["#22A06B", "#16A34A", "#0EA5E9", "#2563EB", "#7C3AED", "#F59E0B", "#64748B", "#E5484D"];

export type SettingsSection = "Symbol" | "Trading" | "Paper Trading" | "Alerts";

const SECTION_META: { id: SettingsSection; icon: typeof Wallet }[] = [
  { id: "Symbol", icon: CandlestickChart },
  { id: "Trading", icon: ListChecks },
  { id: "Paper Trading", icon: Wallet },
  { id: "Alerts", icon: ListChecks },
];

export function ChartSettingsDialog({ open, onOpenChange, initialSection = "Symbol" }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialSection?: SettingsSection;
}) {
  const [section, setSection] = useState<SettingsSection>(initialSection);
  const [lastInit, setLastInit] = useState(initialSection);
  if (initialSection !== lastInit) {
    setLastInit(initialSection);
    setSection(initialSection);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0" data-testid="chart-settings">
        <DialogHeader className="border-b border-[var(--mx-border)] px-4 py-3">
          <DialogTitle className="text-[15px]">Chart settings</DialogTitle>
        </DialogHeader>
        <div className="grid sm:grid-cols-[150px_1fr]">
          <nav className="flex gap-1 border-b border-[var(--mx-border)] p-2 sm:flex-col sm:border-b-0 sm:border-r" aria-label="Settings sections">
            {SECTION_META.map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSection(id)}
                aria-current={section === id}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-[12px] font-semibold",
                  section === id ? "bg-[var(--mx-active-bg)] text-[var(--mx-primary)]" : "text-[var(--mx-muted)] hover:bg-[var(--mx-hover)]"
                )}
              >
                <Icon className="h-3.5 w-3.5" /> {id}
              </button>
            ))}
          </nav>
          <div className="max-h-[60vh] min-h-[280px] overflow-y-auto p-4">
            {section === "Symbol" && <SymbolSection />}
            {section === "Trading" && <TradingSection />}
            {section === "Paper Trading" && <PaperSection />}
            {section === "Alerts" && <AlertsSection />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-[12px]">
      <span className="text-[var(--mx-muted)]">{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function Swatches({ value, onPick, label }: { value: string; onPick: (c: string) => void; label: string }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label={label}>
      {CANDLE_PALETTE.map((c) => (
        <button
          key={c} aria-label={`${label} ${c}`} aria-pressed={value === c}
          onClick={() => onPick(c)}
          className={cn("h-5 w-5 rounded-md border", value === c && "ring-2 ring-slate-500 ring-offset-1")}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}

function Check({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 py-1.5 text-[12px]">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 accent-[var(--mx-accent)]" />
      <span>
        <span className="block font-medium text-[var(--mx-text)]">{label}</span>
        {hint && <span className="block text-[11px] text-[var(--mx-faint)]">{hint}</span>}
      </span>
    </label>
  );
}

function SymbolSection() {
  const up = useMechanix((s) => s.candleUp);
  const down = useMechanix((s) => s.candleDown);
  const wUp = useMechanix((s) => s.wickUp);
  const wDown = useMechanix((s) => s.wickDown);
  const borders = useMechanix((s) => s.candleBorders);
  const prev = useMechanix((s) => s.colorPrevClose);
  const st = useMechanix();
  return (
    <div>
      <p className="pb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Candles</p>
      <Check checked={prev} onChange={st.setColorPrevClose} label="Color bars based on previous close" hint="Each candle is colored by whether it closed above or below the prior close." />
      <Row label="Body — up"><Swatches label="Up body" value={up} onPick={(c) => st.setCandleColors(c, down)} /></Row>
      <Row label="Body — down"><Swatches label="Down body" value={down} onPick={(c) => st.setCandleColors(up, c)} /></Row>
      <Row label="Wick — up"><Swatches label="Up wick" value={wUp} onPick={(c) => st.setWickColors(c, wDown)} /></Row>
      <Row label="Wick — down"><Swatches label="Down wick" value={wDown} onPick={(c) => st.setWickColors(wUp, c)} /></Row>
      <Check checked={borders} onChange={st.setCandleBorders} label="Borders" hint="Draw an outline around each candle body." />
      <button onClick={() => { st.setCandleColors("#22A06B", "#E5484D"); st.setWickColors("#22A06B", "#E5484D"); st.setCandleBorders(false); st.setColorPrevClose(false); }}
        className="mt-2 text-[11px] font-semibold text-[var(--mx-primary)] hover:underline">
        Reset to MechaniX defaults
      </button>
    </div>
  );
}

function TradingSection() {
  const quick = useMechanix((s) => s.showQuickTrade);
  const lines = useMechanix((s) => s.showPosLines);
  const st = useMechanix();
  return (
    <div>
      <p className="pb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Trading</p>
      <Check checked={quick} onChange={st.setShowQuickTrade} label="Buy/sell buttons" hint="Shows quick order buttons directly on the chart." />
      <Check checked={lines} onChange={st.setShowPosLines} label="Positions and orders" hint="Draws entry, stop-loss and take-profit lines for open simulated positions." />
      <Check checked={false} onChange={() => {}} label="One-click trading" hint="Coming soon — concept only." />
      <Check checked={false} onChange={() => {}} label="Execution sound" hint="Coming soon — concept only." />
    </div>
  );
}

function PaperSection() {
  const balance = useMechanix((s) => s.paperBalance);
  const setBalance = useMechanix((s) => s.setPaperBalance);
  const reset = useMechanix((s) => s.resetPaperTrading);
  const positions = useMechanix((s) => s.positions);
  return (
    <div>
      <p className="pb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Paper trading account (simulated)</p>
      <Row label="Account balance">
        <span className="tabular-nums font-bold text-[var(--mx-text)]">${balance.toLocaleString()}</span>
      </Row>
      <Row label="Starting balance">
        <select
          aria-label="Starting balance"
          value={balance}
          onChange={(e) => { setBalance(Number(e.target.value)); }}
          className="rounded-md border border-[var(--mx-border)] bg-[var(--mx-card)] px-2 py-1 text-[12px] text-[var(--mx-text)] focus:outline-none focus:ring-2 focus:ring-[var(--mx-accent)]/40"
        >
          {[25000, 50000, 100000, 250000].map((v) => <option key={v} value={v}>${v.toLocaleString()}</option>)}
          {![25000, 50000, 100000, 250000].includes(balance) && <option value={balance}>${balance.toLocaleString()}</option>}
        </select>
      </Row>
      <Row label="Open positions"><span className="tabular-nums font-semibold text-[var(--mx-text)]">{positions.length}</span></Row>
      <Button
        variant="outline" size="sm"
        onClick={() => reset()}
        className="mt-3 gap-1.5 text-[12px]"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Reset paper account
      </Button>
      <p className="mt-2 text-[11px] text-[var(--mx-faint)]">Resetting clears all open simulated positions and restores the balance. Concept — no real funds involved.</p>
    </div>
  );
}

function AlertsSection() {
  const symbol = useMechanix((s) => s.symbol);
  const count = useMechanix((s) => (s.drawings[s.symbol] ?? []).filter((d) => d.type === "alert").length);
  return (
    <div className="text-[12px] text-[var(--mx-muted)]">
      <p className="pb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Alerts</p>
      <p>You have <b className="tabular-nums">{count}</b> simulated price alert{count === 1 ? "" : "s"} on {symbol}.</p>
      <p className="mt-2 text-[var(--mx-muted)]">Manage alerts from the bell button in the chart toolbar, or place one directly on the chart with the bell drawing tool. Concept — alerts never fire.</p>
    </div>
  );
}

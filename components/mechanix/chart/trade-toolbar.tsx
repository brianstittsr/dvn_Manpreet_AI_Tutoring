"use client";

import { useState } from "react";
import { Camera, ChevronDown, LayoutTemplate, Lock, Settings, Wallet, Zap } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useMechanix } from "@/components/mechanix/workspace/store";
import { useSimFeed } from "@/components/mechanix/workspace/use-sim-feed";
import { ConnectBrokerDialog } from "./connect-broker";
import { ChartSettingsDialog } from "./chart-settings";

export function TradeToolbar() {
  const symbol = useMechanix((s) => s.symbol);
  const timeframe = useMechanix((s) => s.timeframe);
  const quick = useMechanix((s) => s.showQuickTrade);
  const setQuick = useMechanix((s) => s.setShowQuickTrade);
  const setReplayIndex = useMechanix((s) => s.setReplayIndex);
  const setAccountMode = useMechanix((s) => s.setAccountMode);
  const setLiveGateOpen = useMechanix((s) => s.setLiveGateOpen);
  const accountMode = useMechanix((s) => s.accountMode);
  const layouts = useMechanix((s) => s.layouts);
  const saveLayout = useMechanix((s) => s.saveLayout);
  const applyLayout = useMechanix((s) => s.applyLayout);
  const deleteLayout = useMechanix((s) => s.deleteLayout);
  const feed = useSimFeed(symbol, timeframe);
  const [brokerOpen, setBrokerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [layoutName, setLayoutName] = useState("Untitled");

  const apply = (name: string) => {
    applyLayout(name);
    setLayoutName(name);
    toast.success(`Layout "${name}" applied`, { description: "Symbol and timeframe restored — concept only." });
  };

  const save = () => {
    saveLayout(layoutName);
    toast.success(`Layout "${layoutName}" saved — ${symbol} · ${timeframe}`, { description: "Concept only." });
  };

  const saveAsNew = () => {
    const name = `Layout ${layouts.length + 1}`;
    saveLayout(name);
    setLayoutName(name);
    toast.success(`Layout "${name}" saved — ${symbol} · ${timeframe}`, { description: "Concept only." });
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-1 border-t border-[var(--mx-border)] bg-[var(--mx-card)] px-2 py-1" data-testid="trade-toolbar">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Layouts"
              data-testid="layout-menu"
              className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[11px] font-semibold text-[var(--mx-muted)] hover:bg-[var(--mx-hover)]"
            >
              <LayoutTemplate className="h-3.5 w-3.5" /> {layoutName} <ChevronDown className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-60">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-[var(--mx-faint)]">Saved layouts</DropdownMenuLabel>
            {layouts.length === 0 && (
              <DropdownMenuItem disabled className="text-[var(--mx-faint)]">No saved layouts yet</DropdownMenuItem>
            )}
            {layouts.map((l) => (
              <DropdownMenuItem key={l.name} onSelect={() => apply(l.name)} className="group">
                <span className="flex-1 truncate">{l.name}</span>
                <span className="ml-2 text-[10px] tabular-nums text-[var(--mx-faint)]">{l.symbol} · {l.timeframe}</span>
                {l.name === layoutName && <span className="ml-1 text-[var(--mx-accent)]">✓</span>}
                <button
                  aria-label={`Delete layout ${l.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteLayout(l.name);
                    if (l.name === layoutName) setLayoutName("Untitled");
                    toast.success(`Layout "${l.name}" deleted`, { description: "Concept only." });
                  }}
                  className="ml-1 hidden rounded px-1 text-[var(--mx-faint)] hover:bg-[var(--mx-hover)] hover:text-[var(--mx-down)] group-hover:block"
                >
                  ×
                </button>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={saveAsNew} data-testid="layout-save-as">
              Save as new… ({symbol} · {timeframe})
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button
          onClick={save}
          data-testid="layout-save"
          className="rounded px-1.5 py-1 text-[11px] font-semibold text-[var(--mx-primary)] hover:bg-[var(--mx-active-bg)]"
        >
          Save
        </button>

        <div className="mx-1 h-4 w-px bg-[var(--mx-border)]" />

        <Tip label="Buy/sell buttons on chart" pressed={quick} onClick={() => setQuick(!quick)} icon={Zap} />
        <Tip label="Trade settings" onClick={() => setSettingsOpen(true)} icon={Settings} />
        <Tip label="Snapshot" onClick={() => toast.success("Snapshot copied — concept only.")} icon={Camera} />

        <div className="flex-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 rounded-md bg-[var(--mx-primary)] px-3 py-1 text-[11px] font-bold text-white hover:bg-[var(--mx-deep)]" data-testid="trade-menu">
              Trade <ChevronDown className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-[var(--mx-faint)]">Practice risk-free</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => { setAccountMode("simulation"); toast.success("Paper Trading active — simulation mode."); }}>
              <Wallet className="mr-2 h-3.5 w-3.5" /> Paper Trading
              {accountMode === "simulation" && <span className="ml-auto text-[var(--mx-accent)]">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setReplayIndex(Math.max(10, feed.candles.length - 40))}>
              <Zap className="mr-2 h-3.5 w-3.5" /> Replay Trading
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-[var(--mx-faint)]">Brokers</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => setBrokerOpen(true)}>
              Connect to another broker…
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setLiveGateOpen(true)}>
              <Lock className="mr-2 h-3.5 w-3.5 text-[var(--mx-faint)]" /> Live trading (locked)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ConnectBrokerDialog open={brokerOpen} onOpenChange={setBrokerOpen} />
      <ChartSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} initialSection="Trading" />
    </TooltipProvider>
  );
}

function Tip({ label, icon: Icon, onClick, pressed }: { label: string; icon: typeof Zap; onClick?: () => void; pressed?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          aria-label={label}
          aria-pressed={pressed}
          onClick={onClick}
          className={cn("rounded-md p-1.5 text-[var(--mx-muted)] hover:bg-[var(--mx-hover)]", pressed && "bg-[var(--mx-active-bg)] text-[var(--mx-primary)]")}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">{label}</TooltipContent>
    </Tooltip>
  );
}

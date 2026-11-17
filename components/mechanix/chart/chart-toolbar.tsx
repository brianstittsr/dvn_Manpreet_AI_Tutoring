"use client";

import { useState } from "react";
import {
  BarChart3, Bell, ChevronDown, History, Magnet, Maximize2, Minimize2, MoreHorizontal,
  PanelRightClose, PanelRightOpen, Search, SlidersHorizontal, LayoutGrid, Focus, Settings, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SymbolSearchDialog } from "./symbol-search";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useMechanix, type ChartLayout, type Drawing } from "@/components/mechanix/workspace/store";
import { TIMEFRAMES, formatPrice } from "@/components/mechanix/workspace/mock-data";
import { useSimFeed } from "@/components/mechanix/workspace/use-sim-feed";
import { ChartSettingsDialog } from "./chart-settings";

const NO_DRAWINGS: Drawing[] = [];
let alertSeq = 0;

interface ChartToolbarProps {
  onFullscreen: () => void;
  title?: string;
}

export function ChartToolbar({ onFullscreen, title }: ChartToolbarProps) {
  const symbol = useMechanix((s) => s.symbol);
  const timeframe = useMechanix((s) => s.timeframe);
  const setTimeframe = useMechanix((s) => s.setTimeframe);
  const layout = useMechanix((s) => s.chartLayout);
  const setLayout = useMechanix((s) => s.setChartLayout);
  const focusMode = useMechanix((s) => s.focusMode);
  const setFocusMode = useMechanix((s) => s.setFocusMode);
  const isFullscreen = useMechanix((s) => s.isFullscreen);
  const [symOpen, setSymOpen] = useState(false);
  const [indOpen, setIndOpen] = useState(false);
  const inds = useMechanix((s) => s.indicators);
  const toggleIndicator = useMechanix((s) => s.toggleIndicator);
  const magnet = useMechanix((s) => s.magnet);
  const setMagnet = useMechanix((s) => s.setMagnet);
  const watchlistOpen = useMechanix((s) => s.watchlistOpen);
  const setWatchlistOpen = useMechanix((s) => s.setWatchlistOpen);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const addDrawing = useMechanix((s) => s.addDrawing);
  const removeDrawing = useMechanix((s) => s.removeDrawing);
  const symbolDrawings = useMechanix((s) => s.drawings[s.symbol] ?? NO_DRAWINGS);
  const alerts = symbolDrawings.filter((d) => d.type === "alert");
  const replayIndex = useMechanix((s) => s.replayIndex);
  const setReplayIndex = useMechanix((s) => s.setReplayIndex);
  const feed = useSimFeed(symbol, timeframe);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-wrap items-center gap-1 border-b border-[var(--mx-border)] px-3 py-2">
        <button
          onClick={() => setSymOpen(true)}
          aria-label="Symbol search"
          className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[15px] font-bold text-[var(--mx-text)] hover:bg-[var(--mx-hover)] focus-visible:ring-2 focus:ring-[var(--mx-accent)]/40"
        >
          {title ?? `Practice Chart — ${symbol}`} <ChevronDown className="h-3.5 w-3.5 text-[var(--mx-muted)]" />
        </button>
        <SymbolSearchDialog open={symOpen} onOpenChange={setSymOpen} />

        <div className="mx-1 h-4 w-px bg-[var(--mx-border)]" />

        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={cn(
              "rounded px-1.5 py-0.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus:ring-[var(--mx-accent)]/40",
              timeframe === tf ? "bg-[var(--mx-primary)] text-white" : "text-[var(--mx-muted)] hover:bg-[var(--mx-hover)]"
            )}
          >
            {tf}
          </button>
        ))}

        <div className="mx-1 h-4 w-px bg-[var(--mx-border)]" />

        <Tool icon={BarChart3} label="Chart type: candles" />
        <Popover open={indOpen} onOpenChange={setIndOpen}>
          <PopoverTrigger asChild>
            <button aria-label="Indicators" className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-[var(--mx-muted)] hover:bg-[var(--mx-hover)] focus-visible:ring-2 focus:ring-[var(--mx-accent)]/40">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Indicators
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-2" align="start">
            {["S&D Zones", "Small Body Candles", "VWAP", "EMA 20", "Session highs/lows"].map((i) => (
              <label key={i} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-[var(--mx-hover)]">
                <input
                  type="checkbox"
                  checked={inds.includes(i)}
                  onChange={() => toggleIndicator(i)}
                  className="accent-[var(--mx-accent)]"
                />
                {i}
              </label>
            ))}
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <button aria-label="Alerts" className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-[var(--mx-muted)] hover:bg-[var(--mx-hover)] focus-visible:ring-2 focus:ring-[var(--mx-accent)]/40">
              <Bell className="h-3.5 w-3.5" />
              {alerts.length > 0 && <span className="rounded-full bg-amber-100 px-1 text-[10px] font-bold text-amber-700">{alerts.length}</span>}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-2" align="start">
            <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Price alerts — {symbol}</p>
            {alerts.length === 0 && <p className="px-2 py-1.5 text-xs text-[var(--mx-faint)]">No alerts. Click the chart with the bell tool, or:</p>}
            {alerts.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded px-2 py-1 text-xs hover:bg-[var(--mx-hover)]">
                <span className="tabular-nums font-semibold text-[var(--mx-text)]">⏰ {formatPrice(a.p1.price, symbol)}</span>
                <button aria-label="Delete alert" onClick={() => removeDrawing(a.id)} className="rounded p-0.5 text-[var(--mx-faint)] hover:bg-red-50 hover:text-[var(--mx-down)]">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                if (!feed.last) return;
                addDrawing({ id: `a${++alertSeq}`, type: "alert", p1: { time: feed.last.time, price: feed.last.close * 1.002 } });
              }}
              className="mt-1 w-full rounded-md bg-[var(--mx-primary)] px-2 py-1.5 text-xs font-semibold text-white hover:bg-[var(--mx-deep)]"
            >
              + Alert above last price
            </button>
            <p className="px-2 pt-1 text-[10px] text-[var(--mx-faint)]">Concept — simulated alerts only, nothing fires.</p>
          </PopoverContent>
        </Popover>

        <ToolBtn
          label={replayIndex != null ? "Exit bar replay" : "Bar replay"}
          pressed={replayIndex != null}
          onClick={() => setReplayIndex(replayIndex != null ? null : Math.max(10, feed.candles.length - 40))}
          icon={History}
        />

        <ToolBtn
          label={magnet ? "Magnet mode — on (drawing snaps to OHLC)" : "Magnet mode — off"}
          pressed={magnet}
          onClick={() => setMagnet(!magnet)}
          icon={Magnet}
        />

        <ToolBtn
          label="Chart settings (candles, trading, paper account)"
          onClick={() => setSettingsOpen(true)}
          icon={Settings}
        />
        <ChartSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

        <Popover>
          <PopoverTrigger asChild>
            <button aria-label="Chart layout" className="rounded-md p-1.5 text-[var(--mx-muted)] hover:bg-[var(--mx-hover)] focus-visible:ring-2 focus:ring-[var(--mx-accent)]/40">
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-1" align="start">
            {([1, 2, 4] as ChartLayout[]).map((l) => (
              <button
                key={l}
                onClick={() => setLayout(l)}
                className={cn(
                  "flex w-full items-center justify-between rounded px-2 py-1.5 text-xs hover:bg-[var(--mx-hover)]",
                  layout === l && "bg-[var(--mx-active-bg)] font-semibold text-[var(--mx-primary)]"
                )}
              >
                {l} chart{l > 1 ? "s" : ""} {layout === l && "✓"}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        <div className="flex-1" />

        <ToolBtn
          label={watchlistOpen ? "Hide watchlist" : "Show watchlist"}
          pressed={watchlistOpen}
          onClick={() => setWatchlistOpen(!watchlistOpen)}
          icon={watchlistOpen ? PanelRightClose : PanelRightOpen}
        />
        <ToolBtn label="Toggle focus mode (Shift+F)" pressed={focusMode} onClick={() => setFocusMode(!focusMode)} icon={Focus} />
        <ToolBtn label="Toggle fullscreen (F)" pressed={isFullscreen} onClick={onFullscreen} icon={isFullscreen ? Minimize2 : Maximize2} />
        <ToolBtn label="More options" icon={MoreHorizontal} />
        <ToolBtn label="Symbol search (/)" onClick={() => setSymOpen(true)} icon={Search} />
      </div>
    </TooltipProvider>
  );
}

function Tool({ icon: Icon, label }: { icon: typeof Search; label: string }) {
  return <ToolBtn label={label} icon={Icon} />;
}

function ToolBtn({ label, icon: Icon, onClick, pressed }: { label: string; icon: typeof Search; onClick?: () => void; pressed?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost" size="icon" aria-label={label} aria-pressed={pressed}
          onClick={onClick}
          className={cn("h-7 w-7 text-[var(--mx-muted)] hover:bg-[var(--mx-hover)]", pressed && "bg-[var(--mx-active-bg)] text-[var(--mx-primary)]")}
        >
          <Icon className="h-3.5 w-3.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">{label}</TooltipContent>
    </Tooltip>
  );
}

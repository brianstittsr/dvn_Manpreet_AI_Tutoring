"use client";

import { useRef, useState } from "react";
import {
  ArrowRight, Bell, BarChartHorizontal, Brush, GripVertical, Highlighter,
  Minus, MousePointer2, PenLine, Percent, Pin, Square, SquareDashed,
  TrendingDown, TrendingUp, Type, Trash2, Undo2,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useMechanix, type Tool } from "@/components/mechanix/workspace/store";

const TOOLS: { id: Tool; icon: typeof Minus; label: string }[] = [
  { id: "cursor", icon: MousePointer2, label: "Cursor" },
  { id: "trendline", icon: PenLine, label: "Trend line (2 clicks)" },
  { id: "fib", icon: Percent, label: "Fibonacci levels (2 clicks)" },
  { id: "hline", icon: Minus, label: "Horizontal line (1 click)" },
  { id: "hray", icon: ArrowRight, label: "Horizontal ray (1 click)" },
  { id: "zone", icon: SquareDashed, label: "Zone (2 clicks)" },
  { id: "rect", icon: Square, label: "Rectangle — colored (2 clicks)" },
  { id: "long", icon: TrendingUp, label: "Long position (2 clicks: entry → target)" },
  { id: "short", icon: TrendingDown, label: "Short position (2 clicks: entry → target)" },
  { id: "vr", icon: BarChartHorizontal, label: "Fixed volume range profile (2 clicks)" },
  { id: "text", icon: Type, label: "Text note" },
  { id: "alert", icon: Bell, label: "Price alert (1 click)" },
  { id: "brush", icon: Brush, label: "Brush — freehand draw (drag)" },
  { id: "highlighter", icon: Highlighter, label: "Highlighter — freehand draw (drag)" },
];

const RECT_COLORS = ["#F59E0B", "#2563EB", "#16A34A", "#E5484D", "#7C3AED", "#64748B"];

export function DrawingRail() {
  const activeTool = useMechanix((s) => s.activeTool);
  const setTool = useMechanix((s) => s.setTool);
  const undo = useMechanix((s) => s.undoDrawing);
  const clear = useMechanix((s) => s.clearDrawings);
  const count = useMechanix((s) => (s.drawings[s.symbol] ?? []).length);
  const rectColor = useMechanix((s) => s.rectColor);
  const setRectColor = useMechanix((s) => s.setRectColor);

  const railRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const startFloatDrag = (e: React.PointerEvent<HTMLElement>) => {
    const el = railRef.current;
    if (!el) return;
    const ox = pos?.x ?? el.offsetLeft;
    const oy = pos?.y ?? el.offsetTop;
    drag.current = { px: e.clientX, py: e.clientY, ox, oy };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic event */ }
  };
  const onFloatMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!drag.current) return;
    const parent = railRef.current?.parentElement;
    const pw = parent?.clientWidth ?? 400;
    const ph = parent?.clientHeight ?? 300;
    setPos({
      x: Math.max(0, Math.min(pw - 36, drag.current.ox + e.clientX - drag.current.px)),
      y: Math.max(0, Math.min(ph - 80, drag.current.oy + e.clientY - drag.current.py)),
    });
  };
  const endFloatDrag = () => { drag.current = null; };

  return (
    <TooltipProvider delayDuration={150}>
      <div
        ref={railRef}
        className={cn(
          "flex w-9 flex-col items-center gap-0.5 border-[var(--mx-border)] bg-[var(--mx-card)] py-1",
          pos ? "absolute z-30 rounded-lg border shadow-lg" : "h-full border-r"
        )}
        style={pos ? { left: pos.x, top: pos.y } : undefined}
        role="toolbar"
        aria-label="Drawing tools"
        aria-orientation="vertical"
      >
        <button
          aria-label={pos ? "Drag toolbar (floating)" : "Drag to float toolbar"}
          onPointerDown={startFloatDrag}
          onPointerMove={onFloatMove}
          onPointerUp={endFloatDrag}
          onPointerCancel={endFloatDrag}
          className="cursor-grab touch-none rounded-md p-1 text-[var(--mx-faint)] hover:bg-[var(--mx-hover)] hover:text-[var(--mx-muted)] active:cursor-grabbing"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        {pos && (
          <button
            aria-label="Dock toolbar"
            onClick={() => setPos(null)}
            className="rounded-md p-1 text-[var(--mx-faint)] hover:bg-[var(--mx-hover)] hover:text-[var(--mx-primary)]"
          >
            <Pin className="h-3.5 w-3.5" />
          </button>
        )}
        <div className="my-0.5 h-px w-5 bg-[var(--mx-border)]" />
        <div className="flex max-h-[420px] flex-col items-center gap-0.5 overflow-y-auto">
          {TOOLS.map(({ id, icon: Icon, label }) => (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <button
                  aria-label={label}
                  aria-pressed={activeTool === id}
                  onClick={() => setTool(id)}
                  className={cn(
                    "rounded-md p-1.5 text-[var(--mx-muted)] transition-colors hover:bg-[var(--mx-hover)] hover:text-[var(--mx-text)] focus-visible:ring-2 focus:ring-[var(--mx-accent)]/40",
                    activeTool === id && "bg-[var(--mx-active-bg)] text-[var(--mx-primary)]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">{label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
        {activeTool === "rect" && (
          <div className="grid w-7 grid-cols-2 gap-1 py-1" aria-label="Rectangle color">
            {RECT_COLORS.map((c) => (
              <button
                key={c}
                aria-label={`Rectangle color ${c}`}
                aria-pressed={rectColor === c}
                onClick={() => setRectColor(c)}
                className={cn("h-3 w-3 rounded-full border", rectColor === c && "ring-2 ring-offset-1 ring-slate-400")}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        )}
        <div className="my-1 h-px w-5 bg-[var(--mx-border)]" />
        <Tooltip>
          <TooltipTrigger asChild>
            <button aria-label="Undo last drawing" disabled={count === 0} onClick={undo}
              className="rounded-md p-1.5 text-[var(--mx-muted)] hover:bg-[var(--mx-hover)] disabled:opacity-30 focus-visible:ring-2 focus:ring-[var(--mx-accent)]/40">
              <Undo2 className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">Undo drawing</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button aria-label="Clear all drawings" disabled={count === 0} onClick={clear}
              className="rounded-md p-1.5 text-[var(--mx-muted)] hover:bg-red-50 hover:text-[var(--mx-down)] disabled:opacity-30 focus-visible:ring-2 focus:ring-[var(--mx-accent)]/40">
              <Trash2 className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">Clear all drawings</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

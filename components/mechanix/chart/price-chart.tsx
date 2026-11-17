"use client";

import { useEffect, useRef, useState } from "react";
import type { IChartApi, IPriceLine, ISeriesApi, ISeriesMarkersPluginApi, MouseEventParams, Time, UTCTimestamp } from "lightweight-charts";
import { toast } from "sonner";
import { useMechanix, type Drawing } from "@/components/mechanix/workspace/store";
import type { Candle } from "@/components/mechanix/workspace/mock-data";
import type { SimFeed } from "@/components/mechanix/workspace/use-sim-feed";
import { ChartOverlays } from "./chart-overlays";

interface PriceChartProps {
  feed: SimFeed;
  symbol: string;
  interactive?: boolean;
  compact?: boolean;
}

let idSeq = 0;
const newDrawingId = (): string =>
  `d-${Date.now().toString(36)}-${(++idSeq).toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export function PriceChart({ feed, symbol, interactive = true, compact = false }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const markersRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);
  const loadedRef = useRef<Candle[] | null>(null);
  const lastLineRef = useRef<IPriceLine | null>(null);
  const [pending, setPending] = useState<Drawing | null>(null);
  const [textInput, setTextInput] = useState<{ id: string; x: number; y: number } | null>(null);

  const activeTool = useMechanix((s) => s.activeTool);
  const addDrawing = useMechanix((s) => s.addDrawing);
  const updateDrawing = useMechanix((s) => s.updateDrawing);
  const positions = useMechanix((s) => s.positions);
  const updatePosition = useMechanix((s) => s.updatePosition);
  const candleUp = useMechanix((s) => s.candleUp);
  const candleDown = useMechanix((s) => s.candleDown);
  const wickUp = useMechanix((s) => s.wickUp);
  const wickDown = useMechanix((s) => s.wickDown);
  const candleBorders = useMechanix((s) => s.candleBorders);
  const colorPrevClose = useMechanix((s) => s.colorPrevClose);
  const magnet = useMechanix((s) => s.magnet);
  const showPosLines = useMechanix((s) => s.showPosLines);
  const rectColor = useMechanix((s) => s.rectColor);
  const replayIndex = useMechanix((s) => s.replayIndex);
  const theme = useMechanix((s) => s.theme);
  const posLinesRef = useRef<{ posId: string; kind: "entry" | "sl" | "tp"; line: IPriceLine }[]>([]);
  const dragLineRef = useRef<{ posId: string; kind: "sl" | "tp" } | null>(null);
  const replayRef = useRef<number | null>(null);
  const styleRef = useRef<string>("");
  const brushRef = useRef<{ pts: Drawing["pts"] & object } | null>(null);
  const [brushPreview, setBrushPreview] = useState<{ time: number; price: number }[] | null>(null);

  useEffect(() => {
    let disposed = false;
    let ch: IChartApi | null = null;
    let ro: ResizeObserver | null = null;
    async function init() {
      const lc = await import("lightweight-charts");
      if (disposed || !containerRef.current) return;
      ch = lc.createChart(containerRef.current, {
        autoSize: false,
        layout: { background: { color: "#ffffff" }, textColor: "#6B7280", fontSize: 11, fontFamily: "inherit", attributionLogo: false },
        grid: { vertLines: { color: "#EEF2F0" }, horzLines: { color: "#EEF2F0" } },
        rightPriceScale: { borderColor: "#E4E9E6" },
        timeScale: { borderColor: "#E4E9E6", timeVisible: true, secondsVisible: false },
        crosshair: { mode: lc.CrosshairMode.Normal },
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
      const candles = ch.addSeries(lc.CandlestickSeries, {
        upColor: "#22A06B", downColor: "#E5484D",
        wickUpColor: "#22A06B", wickDownColor: "#E5484D",
        borderVisible: false,
      });
      const vol = ch.addSeries(lc.HistogramSeries, {
        priceScaleId: "vol", priceFormat: { type: "volume" }, color: "#D7E4DC",
      });
      ch.priceScale("vol").applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });
      seriesRef.current = candles;
      volRef.current = vol;
      markersRef.current = lc.createSeriesMarkers(candles);
      loadedRef.current = null;
      lastLineRef.current = null;
      setChart(ch);
      ro = new ResizeObserver(() => {
        if (containerRef.current && ch) {
          ch.applyOptions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
        }
      });
      ro.observe(containerRef.current);
    }
    init();
    return () => {
      disposed = true;
      ro?.disconnect();
      ch?.remove();
      seriesRef.current = null;
      volRef.current = null;
      markersRef.current = null;
      setChart(null);
    };
  }, []);

  // Re-theme chart surfaces from the active .mx-* palette (lightweight-charts
  // needs literal colors, so we resolve the CSS vars on the container).
  useEffect(() => {
    if (!chart || !containerRef.current) return;
    const cs = getComputedStyle(containerRef.current);
    const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
    chart.applyOptions({
      layout: { background: { color: v("--mx-card", "#ffffff") }, textColor: v("--mx-muted", "#6B7280") },
      grid: {
        vertLines: { color: v("--mx-grid", "#EEF2F0") },
        horzLines: { color: v("--mx-grid", "#EEF2F0") },
      },
      rightPriceScale: { borderColor: v("--mx-border", "#E4E9E6") },
      timeScale: { borderColor: v("--mx-border", "#E4E9E6") },
    });
  }, [chart, theme]);

  // Apply user-picked candle/wick/border colors.
  useEffect(() => {
    seriesRef.current?.applyOptions({
      upColor: candleUp, downColor: candleDown,
      wickUpColor: wickUp, wickDownColor: wickDown,
      borderVisible: candleBorders,
      borderUpColor: candleUp, borderDownColor: candleDown,
    });
  }, [candleUp, candleDown, wickUp, wickDown, candleBorders]);

  // Load the full series once per feed, then stream the last bar via update() per tick.
  // In bar-replay mode only candles up to replayIndex are shown.
  useEffect(() => {
    const s = seriesRef.current;
    const v = volRef.current;
    const visible = replayIndex != null
      ? feed.candles.slice(0, Math.max(1, Math.min(replayIndex, feed.candles.length)))
      : feed.candles;
    const last = visible[visible.length - 1] ?? null;
    if (!s || !v || !last) return;
    const styleKey = [candleUp, candleDown, wickUp, wickDown, colorPrevClose].join();
    const toBar = (c: Candle, i: number, arr: Candle[]) => {
      const base = { time: c.time as UTCTimestamp, open: c.open, high: c.high, low: c.low, close: c.close };
      if (!colorPrevClose || i === 0) return base;
      const up = c.close >= arr[i - 1].close;
      return { ...base, color: up ? candleUp : candleDown, wickColor: up ? wickUp : wickDown, borderColor: up ? candleUp : candleDown };
    };
    const toVol = (c: Candle) => ({ time: c.time as UTCTimestamp, value: c.volume, color: c.close >= c.open ? "#CDEBDB" : "#F6D4D5" });
    if (loadedRef.current !== feed.candles || replayRef.current !== replayIndex || styleRef.current !== styleKey) {
      loadedRef.current = feed.candles;
      replayRef.current = replayIndex;
      styleRef.current = styleKey;
      s.setData(visible.map(toBar));
      v.setData(visible.map(toVol));
      if (lastLineRef.current) {
        try { s.removePriceLine(lastLineRef.current); } catch { /* already gone */ }
      }
      lastLineRef.current = s.createPriceLine({
        price: last.close, color: "#16A34A", lineWidth: 1, lineStyle: 2,
        axisLabelVisible: true, title: "",
      });
    } else {
      s.update(toBar(last, visible.length - 1, visible));
      v.update(toVol(last));
      lastLineRef.current?.applyOptions({ price: last.close });
    }
  }, [feed.candles, feed.last, feed.version, symbol, replayIndex, candleUp, candleDown, wickUp, wickDown, colorPrevClose]);

  useEffect(() => {
    if (!chart) return;
    const onClick = (param: MouseEventParams) => {
      if (!interactive || activeTool === "cursor" || !param.point || !seriesRef.current) return;
      const price = seriesRef.current.coordinateToPrice(param.point.y);
      const clickedTime = typeof param.time === "number" ? param.time : undefined;
      const time = clickedTime ?? feed.last?.time;
      if (price == null || time == null) return;
      let snapPrice = Number(price);
      if (magnet) {
        const bar = feed.candles.find((c) => c.time === Number(time));
        if (bar) snapPrice = [bar.open, bar.high, bar.low, bar.close]
          .reduce((a, b) => (Math.abs(b - snapPrice) < Math.abs(a - snapPrice) ? b : a));
      }
      const pt = { time: Number(time), price: snapPrice };
      if (activeTool === "hline" || activeTool === "hray" || activeTool === "alert") {
        addDrawing({ id: newDrawingId(), type: activeTool, p1: pt });
      } else if (["zone", "trendline", "fib", "rect", "long", "short", "vr"].includes(activeTool)) {
        if (pending) {
          updateDrawing(pending.id, { p2: pt });
          setPending(null);
        } else {
          const d: Drawing = {
            id: newDrawingId(), type: activeTool as Drawing["type"], p1: pt, p2: pt,
            ...(activeTool === "rect" ? { color: rectColor } : {}),
          };
          addDrawing(d);
          setPending(d);
        }
      } else if (activeTool === "text") {
        const d: Drawing = { id: newDrawingId(), type: "text", p1: pt, text: "" };
        addDrawing(d);
        setTextInput({ id: d.id, x: param.point.x, y: param.point.y });
      }
    };
    chart.subscribeClick(onClick);
    return () => chart.unsubscribeClick(onClick);
  }, [chart, activeTool, interactive, pending, addDrawing, updateDrawing, feed.last, feed.candles, rectColor, magnet]);

  // Entry markers: small arrows on the bar where each open position was taken.
  useEffect(() => {
    const api = markersRef.current;
    if (!api) return;
    const times = new Set(feed.candles.map((c) => c.time));
    const lastTime = feed.candles.length ? feed.candles[feed.candles.length - 1].time : 0;
    api.setMarkers(
      positions
        .filter((p) => p.symbol === symbol)
        .map((p) => ({
          time: (p.entryTime != null && times.has(p.entryTime) ? p.entryTime : lastTime) as UTCTimestamp,
          position: p.side === "buy" ? ("belowBar" as const) : ("aboveBar" as const),
          shape: p.side === "buy" ? ("arrowUp" as const) : ("arrowDown" as const),
          color: p.side === "buy" ? "#22A06B" : "#E5484D",
          id: p.id,
          size: 1,
        }))
    );
  }, [positions, symbol, chart, feed.candles, feed.version]);

  useEffect(() => {
    if (!seriesRef.current) return;
    posLinesRef.current.forEach((r) => {
      try { seriesRef.current?.removePriceLine(r.line); } catch { /* removed */ }
    });
    posLinesRef.current = [];
    if (!showPosLines) return;
    positions.filter((p) => p.symbol === symbol).forEach((p) => {
      const s = seriesRef.current;
      if (!s) return;
      posLinesRef.current.push(
        { posId: p.id, kind: "entry", line: s.createPriceLine({ price: p.entry, color: "#2563EB", lineWidth: 1, lineStyle: 0, axisLabelVisible: true, title: "Entry" }) },
        { posId: p.id, kind: "sl", line: s.createPriceLine({ price: p.sl, color: "#E5484D", lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: "SL" }) },
        { posId: p.id, kind: "tp", line: s.createPriceLine({ price: p.tp, color: "#22A06B", lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: "TP" }) }
      );
    });
  }, [positions, symbol, chart, showPosLines]);

  // Hit-test: is the pointer within ~6px of a draggable SL/TP price line?
  const hitPosLine = (e: React.PointerEvent<HTMLElement>): { posId: string; kind: "sl" | "tp" } | null => {
    const s = seriesRef.current;
    if (!s || !showPosLines) return null;
    const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
    for (const p of positions) {
      if (p.symbol !== symbol) continue;
      const slY = s.priceToCoordinate(p.sl);
      const tpY = s.priceToCoordinate(p.tp);
      if (slY != null && Math.abs(slY - y) <= 6) return { posId: p.id, kind: "sl" };
      if (tpY != null && Math.abs(tpY - y) <= 6) return { posId: p.id, kind: "tp" };
    }
    return null;
  };

  // Freehand brush / highlighter: convert pointer coords to (time, price) points.
  const snapPt = (e: React.PointerEvent<HTMLElement>) => {
    const s = seriesRef.current;
    if (!chart || !s) return null;
    const rect = e.currentTarget.getBoundingClientRect();
    const t = chart.timeScale().coordinateToTime(e.clientX - rect.left);
    const p = s.coordinateToPrice(e.clientY - rect.top);
    if (t == null || p == null || typeof t !== "number") return null;
    let price = Number(p); const time = Number(t);
    if (magnet) {
      const bar = feed.candles.find((c) => c.time === time);
      if (bar) price = [bar.open, bar.high, bar.low, bar.close]
        .reduce((a, b) => (Math.abs(b - price) < Math.abs(a - price) ? b : a));
    }
    return { time, price };
  };

  return (
    <div
      className="relative h-full w-full"
      data-testid="price-chart"
      onPointerDownCapture={(e) => {
        if (!interactive) return;
        // Grab a stop-loss / take-profit line to drag it (cursor tool only).
        if (activeTool === "cursor") {
          const hit = hitPosLine(e);
          if (hit) {
            dragLineRef.current = hit;
            e.stopPropagation();
            e.preventDefault();
            try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic event */ }
            return;
          }
        }
        if (activeTool !== "brush" && activeTool !== "highlighter") return;
        const pt = snapPt(e);
        if (!pt) return;
        e.stopPropagation();
        e.preventDefault();
        brushRef.current = { pts: [pt] };
        setBrushPreview([pt]);
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic event */ }
      }}
      onPointerMove={(e) => {
        // Live-drag an SL/TP line — positions rebuild the lines on each update.
        if (dragLineRef.current) {
          const pt = snapPt(e);
          if (pt) updatePosition(dragLineRef.current.posId, { [dragLineRef.current.kind]: pt.price });
          return;
        }
        // Affordance: ns-resize cursor when hovering a draggable line.
        if (interactive && activeTool === "cursor") {
          e.currentTarget.style.cursor = hitPosLine(e) ? "ns-resize" : "";
        }
        if (!brushRef.current) return;
        const pt = snapPt(e);
        if (!pt) return;
        const pts = brushRef.current.pts;
        const last = pts[pts.length - 1];
        if (last && last.time === pt.time && Math.abs(last.price - pt.price) < 1e-9) return;
        pts.push(pt);
        setBrushPreview([...pts]);
      }}
      onPointerUp={() => {
        const drag = dragLineRef.current;
        if (drag) {
          dragLineRef.current = null;
          const pos = positions.find((x) => x.id === drag.posId);
          if (pos) {
            const v = drag.kind === "sl" ? pos.sl : pos.tp;
            toast.success(
              `${drag.kind === "sl" ? "Stop loss" : "Take profit"} → ${v < 10 ? v.toFixed(5) : v.toFixed(2)}`,
              { description: "Simulated order updated." }
            );
          }
        }
        const b = brushRef.current;
        brushRef.current = null;
        setBrushPreview(null);
        if (b && b.pts.length > 1) {
          addDrawing({ id: newDrawingId(), type: activeTool as "brush" | "highlighter", p1: b.pts[0], pts: b.pts });
        }
      }}
      onPointerCancel={() => { dragLineRef.current = null; brushRef.current = null; setBrushPreview(null); }}
    >
      <div ref={containerRef} className="absolute inset-0" />
      {brushPreview && chart && seriesRef.current && brushPreview.length > 1 && (
        <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full" aria-hidden>
          <polyline
            points={brushPreview.map((p) => {
              const x = chart.timeScale().timeToCoordinate(p.time as UTCTimestamp);
              const y = seriesRef.current?.priceToCoordinate(p.price);
              return x != null && y != null ? `${x},${y}` : null;
            }).filter(Boolean).join(" ")}
            fill="none"
            stroke={activeTool === "highlighter" ? "#FACC15" : "#334155"}
            strokeWidth={activeTool === "highlighter" ? 10 : 1.75}
            strokeOpacity={activeTool === "highlighter" ? 0.35 : 1}
            strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      )}
      {chart && seriesRef.current && (
        <ChartOverlays
          chart={chart}
          series={seriesRef.current}
          symbol={symbol}
          compact={compact}
        />
      )}
      {textInput && (
        <input
          autoFocus
          aria-label="Drawing note text"
          className="absolute z-20 rounded border border-[var(--mx-active-border)] bg-[var(--mx-card)] px-1.5 py-0.5 text-[11px] shadow-sm outline-none focus:ring-2 focus:ring-[var(--mx-accent)]/30"
          style={{ left: textInput.x, top: textInput.y }}
          placeholder="Note…"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateDrawing(textInput.id, { text: e.currentTarget.value || "Note" });
              setTextInput(null);
            }
            if (e.key === "Escape") setTextInput(null);
          }}
          onBlur={(e) => {
            updateDrawing(textInput.id, { text: e.currentTarget.value || "Note" });
            setTextInput(null);
          }}
        />
      )}
    </div>
  );
}

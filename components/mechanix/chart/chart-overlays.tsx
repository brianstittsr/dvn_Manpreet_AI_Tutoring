"use client";

import { useEffect, useState } from "react";
import type { IChartApi, ISeriesApi, UTCTimestamp } from "lightweight-charts";
import { useMechanix, type Drawing } from "@/components/mechanix/workspace/store";
import { symbolInfo } from "@/components/mechanix/workspace/mock-data";

interface OverlayProps {
  chart: IChartApi;
  series: ISeriesApi<"Candlestick">;
  symbol: string;
  compact?: boolean;
}

function useRangeVersion(chart: IChartApi) {
  const [, setV] = useState(0);
  useEffect(() => {
    const bump = () => setV((v) => v + 1);
    chart.timeScale().subscribeVisibleLogicalRangeChange(bump);
    const ro = new ResizeObserver(bump);
    const el = chart.chartElement();
    if (el) {
      ro.observe(el);
      if (el.parentElement) ro.observe(el.parentElement);
    }
    return () => {
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(bump);
      ro.disconnect();
    };
  }, [chart]);
}

const NO_DRAWINGS: Drawing[] = [];

interface VolBar { time: UTCTimestamp; high: number; low: number; volume: number }

export function ChartOverlays({ chart, series, symbol, compact }: OverlayProps) {
  useRangeVersion(chart);
  const drawings = useMechanix((s) => s.drawings[symbol] ?? NO_DRAWINGS);
  const indicators = useMechanix((s) => s.indicators);
  const info = symbolInfo(symbol);

  const toX = (t: number) => chart.timeScale().timeToCoordinate(t as UTCTimestamp);
  const toY = (p: number) => series.priceToCoordinate(p);
  const W = chart.timeScale().width();

  const zone = (t1: number, t2: number, p1: number, p2: number, color: string, label: string, sub: string) => {
    const x1 = toX(t1); const x2 = t2 === Infinity ? W : toX(t2);
    const y1 = toY(Math.max(p1, p2)); const y2 = toY(Math.min(p1, p2));
    if (x1 == null || y1 == null || y2 == null) return null;
    const xa = Math.min(x1, x2 ?? W); const xb = Math.min(Math.max(x1, x2 ?? W), W);
    return (
      <g key={`${label}${t1}`}>
        <rect x={xa} y={y1} width={Math.max(xb - xa, 4)} height={Math.max(y2 - y1, 4)} fill={color} fillOpacity={0.14} />
        {!compact && (
          <text x={xb - 8} y={y1 + 14} textAnchor="end" fontSize={10} fill={color} fontWeight={700}>
            {label}
            <tspan x={xb - 8} dy={11} fontSize={9} fontWeight={500}>{sub}</tspan>
          </text>
        )}
      </g>
    );
  };

  const renderDrawing = (d: Drawing) => {
    const x1 = toX(d.p1.time); const y1 = toY(d.p1.price);
    if (x1 == null || y1 == null) return null;
    if (d.type === "hline") {
      return (
        <g key={d.id}>
          <line x1={0} x2={W} y1={y1} y2={y1} stroke="#7C3AED" strokeWidth={1.5} strokeDasharray="4 3" />
          <text x={6} y={y1 - 4} fontSize={10} fill="#7C3AED">{d.p1.price.toFixed(info.decimals)}</text>
        </g>
      );
    }
    if (d.type === "hray") {
      return (
        <g key={d.id}>
          <line x1={x1} x2={W} y1={y1} y2={y1} stroke="#2563EB" strokeWidth={1.5} />
          <circle cx={x1} cy={y1} r={2.5} fill="#2563EB" />
          <text x={x1 + 4} y={y1 - 4} fontSize={10} fill="#2563EB">{d.p1.price.toFixed(info.decimals)}</text>
        </g>
      );
    }
    if (d.type === "alert") {
      return (
        <g key={d.id}>
          <line x1={0} x2={W} y1={y1} y2={y1} stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="6 4" />
          <text x={8} y={y1 - 5} fontSize={11} fontWeight={700} fill="#B45309">⏰ {d.p1.price.toFixed(info.decimals)}</text>
        </g>
      );
    }
    if (d.type === "rect" && d.p2) {
      const x2 = toX(d.p2.time) ?? x1; const y2 = toY(d.p2.price) ?? y1;
      const c = d.color ?? "#F59E0B";
      return <rect key={d.id} x={Math.min(x1, x2)} y={Math.min(y1, y2)} width={Math.abs(x2 - x1)} height={Math.max(Math.abs(y2 - y1), 3)} fill={c} fillOpacity={0.16} stroke={c} strokeWidth={1.25} />;
    }
    if (d.type === "fib" && d.p2) {
      const x2 = toX(d.p2.time) ?? x1;
      const xa = Math.min(x1, x2); const xb = Math.max(x1, x2);
      const hi = Math.max(d.p1.price, d.p2.price); const lo = Math.min(d.p1.price, d.p2.price);
      const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
      const colors = ["#94A3B8", "#F59E0B", "#38BDF8", "#94A3B8", "#22A06B", "#A78BFA", "#94A3B8"];
      return (
        <g key={d.id}>
          {levels.map((lv, i) => {
            const p = hi - (hi - lo) * lv;
            const y = toY(p);
            if (y == null) return null;
            return (
              <g key={lv}>
                <line x1={xa} x2={Math.max(xb, xa + 60)} y1={y} y2={y} stroke={colors[i]} strokeWidth={1} />
                <text x={Math.max(xb, xa + 60) + 3} y={y + 3} fontSize={9} fill={colors[i]} fontWeight={600}>
                  {lv} · {p.toFixed(info.decimals)}
                </text>
              </g>
            );
          })}
        </g>
      );
    }
    if ((d.type === "long" || d.type === "short") && d.p2) {
      const entry = d.p1.price;
      const tp = d.p2.price;
      const dir = d.type === "long" ? 1 : -1;
      const sl = entry - dir * Math.abs(tp - entry) / 2;
      const xEnd = Math.min(x1 + 150, W - 40);
      const yEntry = y1; const yTp = toY(tp) ?? y1; const ySl = toY(sl) ?? y1;
      const rr = Math.abs((tp - entry) / (entry - sl)).toFixed(1);
      return (
        <g key={d.id}>
          <rect x={x1} y={Math.min(yEntry, yTp)} width={xEnd - x1} height={Math.abs(yEntry - yTp)} fill="#22A06B" fillOpacity={0.14} stroke="#22A06B" strokeWidth={1} />
          <rect x={x1} y={Math.min(yEntry, ySl)} width={xEnd - x1} height={Math.max(Math.abs(yEntry - ySl), 2)} fill="#E5484D" fillOpacity={0.14} stroke="#E5484D" strokeWidth={1} />
          <line x1={x1} x2={xEnd} y1={yEntry} y2={yEntry} stroke="#334155" strokeWidth={1} strokeDasharray="4 3" />
          <text x={x1 + 4} y={yTp + (dir === 1 ? -4 : 10)} fontSize={9} fontWeight={700} fill="#14532D">
            {d.type === "long" ? "LONG" : "SHORT"} · TP {tp.toFixed(info.decimals)} · RR {rr}
          </text>
          <text x={x1 + 4} y={ySl + (dir === 1 ? 10 : -4)} fontSize={9} fontWeight={600} fill="#B91C1C">SL {sl.toFixed(info.decimals)}</text>
        </g>
      );
    }
    if (d.type === "vr" && d.p2) {
      const x2 = toX(d.p2.time) ?? x1;
      const xa = Math.min(x1, x2); const xb = Math.max(x1, x2);
      if (xb - xa < 8) return null;
      const t1 = Math.min(d.p1.time, d.p2.time); const t2 = Math.max(d.p1.time, d.p2.time);
      const bars = (series.data() as VolBar[]).filter((b) => Number(b.time) >= t1 && Number(b.time) <= t2);
      if (bars.length === 0) return null;
      const hi = Math.max(...bars.map((b) => b.high)); const lo = Math.min(...bars.map((b) => b.low));
      const rows = 14; const bucket = (hi - lo) / rows || 1;
      const vols = Array.from({ length: rows }, () => 0);
      bars.forEach((b) => {
        const mid = (b.high + b.low) / 2;
        const i = Math.min(rows - 1, Math.max(0, Math.floor((hi - mid) / bucket)));
        vols[i] += b.volume;
      });
      const vMax = Math.max(...vols, 1);
      const yTop = toY(hi); const yBot = toY(lo);
      if (yTop == null || yBot == null) return null;
      const rowH = Math.abs(yBot - yTop) / rows;
      return (
        <g key={d.id}>
          <rect x={xa} y={yTop} width={xb - xa} height={Math.abs(yBot - yTop)} fill="#64748B" fillOpacity={0.05} stroke="#64748B" strokeWidth={0.75} strokeDasharray="3 3" />
          {vols.map((v, i) => (
            <rect key={i} x={xa} y={yTop + i * rowH} width={(v / vMax) * (xb - xa) * 0.9} height={Math.max(rowH - 1, 1)} fill="#16A34A" fillOpacity={0.45} />
          ))}
          {!compact && <text x={xa + 4} y={yTop + 11} fontSize={9} fontWeight={700} fill="#475569">VOL PROFILE</text>}
        </g>
      );
    }
    if (d.type === "zone" && d.p2) {
      const x2 = toX(d.p2.time) ?? x1; const y2 = toY(d.p2.price) ?? y1;
      return <rect key={d.id} x={Math.min(x1, x2)} y={Math.min(y1, y2)} width={Math.abs(x2 - x1)} height={Math.max(Math.abs(y2 - y1), 3)} fill="#F59E0B" fillOpacity={0.18} stroke="#F59E0B" strokeWidth={1} />;
    }
    if (d.type === "trendline" && d.p2) {
      const x2 = toX(d.p2.time) ?? x1; const y2 = toY(d.p2.price) ?? y1;
      return <line key={d.id} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2563EB" strokeWidth={1.5} />;
    }
    if (d.type === "text") {
      return <text key={d.id} x={x1} y={y1} fontSize={11} fill="#334155" fontWeight={600}>{d.text || "…"}</text>;
    }
    if ((d.type === "brush" || d.type === "highlighter") && d.pts && d.pts.length > 1) {
      const points = d.pts.map((p) => {
        const x = toX(p.time); const y = toY(p.price);
        return x != null && y != null ? `${x},${y}` : null;
      }).filter(Boolean).join(" ");
      const hl = d.type === "highlighter";
      return <polyline key={d.id} points={points} fill="none" stroke={hl ? "#FACC15" : "#334155"} strokeWidth={hl ? 10 : 1.75} strokeOpacity={hl ? 0.35 : 1} strokeLinecap="round" strokeLinejoin="round" />;
    }
    return null;
  };

  const data = series.data();
  const lastBarTime = Number((data[data.length - 1] as { time?: UTCTimestamp } | undefined)?.time ?? 0);
  const lastTime = (chart.timeScale().getVisibleRange()?.to as number | undefined) ?? lastBarTime;
  const endT = lastTime + 3600 * 6;

  return (
    <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full" aria-hidden>
      {indicators.includes("S&D Zones") && zone((lastTime ?? 0) - 3600 * 96, endT, info.base * 1.0035, info.base * 1.0058, "#E5484D", `Supply Zone`, `(${formatZ(info.base * 1.0035, info)} – ${formatZ(info.base * 1.0058, info)})`)}
      {indicators.includes("S&D Zones") && zone((lastTime ?? 0) - 3600 * 72, endT, info.base * 0.9948, info.base * 0.9968, "#22A06B", `Demand Zone`, `(${formatZ(info.base * 0.9948, info)} – ${formatZ(info.base * 0.9968, info)})`)}
      {!compact && <ProjectedArrow chart={chart} series={series} />}
      {drawings.map(renderDrawing)}
    </svg>
  );
}

function formatZ(v: number, info: { decimals: number }) {
  return v.toFixed(info.decimals);
}

function ProjectedArrow({ chart, series }: { chart: IChartApi; series: ISeriesApi<"Candlestick"> }) {
  const range = chart.timeScale().getVisibleLogicalRange();
  if (!range) return null;
  const data = series.data();
  const last = data[data.length - 1] as { time?: UTCTimestamp; close?: number } | undefined;
  if (!last?.time || last.close == null) return null;
  const x1 = chart.timeScale().timeToCoordinate(last.time);
  const y1 = series.priceToCoordinate(last.close);
  const x2 = chart.timeScale().timeToCoordinate((Number(last.time) + 3600 * 20) as UTCTimestamp) ?? chart.timeScale().width() - 30;
  const y2 = series.priceToCoordinate(last.close * 1.004);
  if (x1 == null || y1 == null || y2 == null) return null;
  const mx = (x1 + x2) / 2;
  return (
    <g>
      <defs>
        <marker id="mx-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill="none" stroke="#16A34A" strokeWidth={1.5} />
        </marker>
      </defs>
      <path
        d={`M ${x1 + 6} ${y1} C ${mx} ${y1 + 26}, ${mx} ${y2 + 20}, ${x2 - 6} ${y2}`}
        fill="none" stroke="#16A34A" strokeWidth={1.75} markerEnd="url(#mx-arrow)"
      />
    </g>
  );
}

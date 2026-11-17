"use client";

import { useEffect, useRef } from "react";
import { useSimFeed } from "@/components/mechanix/workspace/use-sim-feed";
import { symbolInfo } from "@/components/mechanix/workspace/mock-data";

export function HeatmapCanvas({ symbol }: { symbol: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const feed = useSimFeed(symbol, "1m");
  const lastPrice = feed.last?.close ?? symbolInfo(symbol).base;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth; const h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    const rows = 24; const cols = Math.floor(w / 34);
    const rh = h / rows;
    let seed = 7;
    const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const grid: number[][] = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => {
        const centerBias = 1 - Math.abs(r - rows / 2) / (rows / 2);
        return rand() * centerBias * (0.4 + 0.6 * Math.sin(c * 0.3 + r));
      })
    );
    grid.forEach((row, r) => row.forEach((v, c) => {
      if (v < 0.15) return;
      const isBid = r > rows / 2;
      ctx.fillStyle = isBid ? `rgba(34,160,107,${v * 0.7})` : `rgba(229,72,77,${v * 0.7})`;
      ctx.fillRect(c * 34, r * rh, 32, rh - 1);
    }));

    const midY = h / 2;
    ctx.strokeStyle = "#0F3D2E"; ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(w, midY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#0F3D2E";
    ctx.font = "11px Manrope, sans-serif";
    ctx.fillText(`Last ${lastPrice.toFixed(symbolInfo(symbol).decimals)}`, 8, midY - 5);

    // trade bubbles
    for (let i = 0; i < 10; i++) {
      const bx = rand() * w; const by = midY + (rand() - 0.5) * h * 0.5;
      const r = 3 + rand() * 9;
      ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2);
      ctx.fillStyle = by > midY ? "rgba(34,160,107,0.55)" : "rgba(229,72,77,0.55)";
      ctx.fill();
    }
  }, [lastPrice, symbol]);

  return <canvas ref={ref} className="h-full w-full" aria-label="Simulated liquidity heatmap" />;
}

export function DomLadder({ symbol }: { symbol: string }) {
  const feed = useSimFeed(symbol, "1m");
  const info = symbolInfo(symbol);
  const last = feed.last?.close ?? info.base;
  const rows = Array.from({ length: 15 }, (_, i) => {
    const offset = (7 - i) * info.pip * 5;
    const price = last + offset;
    const size = Math.round(20 + ((i * 37) % 180));
    return { price, bid: i > 7 ? size : 0, ask: i < 7 ? size : 0 };
  });
  return (
    <div className="flex h-full flex-col text-[11px] tabular-nums">
      <div className="grid grid-cols-3 border-b border-[var(--mx-border)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--mx-faint)]">
        <span>Bid</span><span className="text-center">Price</span><span className="text-right">Ask</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {rows.map((r, i) => (
          <div key={i} className="relative grid grid-cols-3 px-3 py-[3px]">
            <span className="relative text-[var(--mx-up)]">
              {r.bid > 0 && <span className="absolute inset-y-0 right-0 -z-0 bg-[var(--mx-up)]/10" style={{ width: `${Math.min(r.bid / 2, 100)}%` }} />}
              {r.bid || ""}
            </span>
            <span className={`text-center font-semibold ${i === 7 ? "rounded bg-[var(--mx-deep)] text-white" : "text-[var(--mx-muted)]"}`}>
              {r.price.toFixed(info.decimals)}
            </span>
            <span className="relative text-right text-[var(--mx-down)]">
              {r.ask > 0 && <span className="absolute inset-y-0 left-0 bg-[var(--mx-down)]/10" style={{ width: `${Math.min(r.ask / 2, 100)}%` }} />}
              {r.ask || ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

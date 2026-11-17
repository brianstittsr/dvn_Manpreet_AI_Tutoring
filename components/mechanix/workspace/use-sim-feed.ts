"use client";

import { useEffect, useState } from "react";
import { generateCandles, symbolInfo, TIMEFRAME_SECONDS, type Candle } from "./mock-data";

export interface SimFeed {
  candles: Candle[];
  last: Candle | null;
  /** Bumps on every simulated tick so effects can react to in-place candle mutations. */
  version: number;
}

const feeds = new Map<string, { candles: Candle[]; timer: ReturnType<typeof setInterval> | null; subs: Set<() => void> }>();

function getFeed(symbol: string, timeframe: string) {
  const key = `${symbol}:${timeframe}`;
  let f = feeds.get(key);
  if (!f) {
    f = { candles: generateCandles(symbol, timeframe), timer: null, subs: new Set() };
    feeds.set(key, f);
  }
  return f;
}

function tick(key: string) {
  const f = feeds.get(key);
  if (!f) return;
  const [symbol, timeframe] = key.split(":");
  const info = symbolInfo(symbol);
  const step = TIMEFRAME_SECONDS[timeframe] ?? 3600;
  const now = Math.floor(Date.now() / 1000 / step) * step;
  const vol = info.base * 0.0006;
  const last = f.candles[f.candles.length - 1];
  const move = (Math.random() - 0.48) * vol;
  if (last.time < now) {
    f.candles.push({ time: now, open: last.close, high: last.close, low: last.close, close: last.close + move, volume: 60 });
    if (f.candles.length > 400) f.candles.shift();
  } else {
    last.close = last.close + move;
    last.high = Math.max(last.high, last.close);
    last.low = Math.min(last.low, last.close);
    last.volume += Math.round(Math.random() * 25);
  }
  f.subs.forEach((fn) => fn());
}

export function useSimFeed(symbol: string, timeframe: string): SimFeed {
  const key = `${symbol}:${timeframe}`;
  const [version, bump] = useState(0);

  useEffect(() => {
    const f = getFeed(symbol, timeframe);
    const rerender = () => bump((n) => n + 1);
    f.subs.add(rerender);
    if (!f.timer) {
      f.timer = setInterval(() => tick(key), 800);
    }
    return () => {
      f.subs.delete(rerender);
      if (f.subs.size === 0 && f.timer) {
        clearInterval(f.timer);
        f.timer = null;
      }
    };
  }, [symbol, timeframe, key]);

  const f = getFeed(symbol, timeframe);
  return { candles: f.candles, last: f.candles[f.candles.length - 1] ?? null, version };
}

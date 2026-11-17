export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SymbolInfo {
  symbol: string;
  name: string;
  group: "Forex" | "Futures" | "Crypto" | "Stocks";
  base: number;
  pip: number;
  decimals: number;
}

export const SYMBOLS: SymbolInfo[] = [
  { symbol: "EURUSD", name: "Euro / US Dollar", group: "Forex", base: 1.0892, pip: 0.0001, decimals: 5 },
  { symbol: "GBPUSD", name: "Pound / US Dollar", group: "Forex", base: 1.2718, pip: 0.0001, decimals: 5 },
  { symbol: "USDJPY", name: "Dollar / Yen", group: "Forex", base: 151.42, pip: 0.01, decimals: 3 },
  { symbol: "AUDUSD", name: "Aussie / US Dollar", group: "Forex", base: 0.6591, pip: 0.0001, decimals: 5 },
  { symbol: "USDCAD", name: "Dollar / Canadian Dollar", group: "Forex", base: 1.3612, pip: 0.0001, decimals: 5 },
  { symbol: "EURGBP", name: "Euro / Pound", group: "Forex", base: 0.8564, pip: 0.0001, decimals: 5 },
  { symbol: "NQ", name: "Nasdaq 100 E-mini", group: "Futures", base: 18240, pip: 1, decimals: 0 },
  { symbol: "ES", name: "S&P 500 E-mini", group: "Futures", base: 5210, pip: 0.25, decimals: 2 },
  { symbol: "CL", name: "Crude Oil WTI", group: "Futures", base: 78.4, pip: 0.01, decimals: 2 },
  { symbol: "GC", name: "Gold Futures", group: "Futures", base: 2385.5, pip: 0.1, decimals: 1 },
  { symbol: "RTY", name: "Russell 2000 E-mini", group: "Futures", base: 2098.4, pip: 0.1, decimals: 1 },
  { symbol: "BTCUSD", name: "Bitcoin / US Dollar", group: "Crypto", base: 67200, pip: 1, decimals: 0 },
  { symbol: "ETHUSD", name: "Ethereum / US Dollar", group: "Crypto", base: 3480, pip: 0.1, decimals: 1 },
  { symbol: "AAPL", name: "Apple Inc.", group: "Stocks", base: 189.6, pip: 0.01, decimals: 2 },
  { symbol: "MSFT", name: "Microsoft Corp.", group: "Stocks", base: 418.2, pip: 0.01, decimals: 2 },
];

export const TIMEFRAMES = ["1m", "5m", "15m", "1H", "4H", "8h", "12h", "16h", "1D", "1W", "1M"] as const;
export const TIMEFRAME_SECONDS: Record<string, number> = {
  "1m": 60, "5m": 300, "15m": 900, "1H": 3600, "4H": 14400,
  "8h": 28800, "12h": 43200, "16h": 57600, "1D": 86400, "1W": 604800, "1M": 2592000,
  D: 86400,
};

export function symbolInfo(symbol: string): SymbolInfo {
  return SYMBOLS.find((s) => s.symbol === symbol) ?? SYMBOLS[0];
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateCandles(symbol: string, timeframe: string, count = 180): Candle[] {
  const info = symbolInfo(symbol);
  const rand = mulberry32(hash(`${symbol}:${timeframe}`));
  const step = TIMEFRAME_SECONDS[timeframe] ?? 3600;
  const now = Math.floor(Date.now() / 1000 / step) * step;
  const vol = info.base * 0.0012;
  const candles: Candle[] = [];
  let price = info.base * (1 - vol * 18);
  for (let i = count - 1; i >= 0; i--) {
    const drift = (rand() - 0.48) * vol * 2.2;
    const open = price;
    const close = price + drift;
    const high = Math.max(open, close) + rand() * vol;
    const low = Math.min(open, close) - rand() * vol;
    candles.push({ time: now - i * step, open, high, low, close, volume: Math.round(400 + rand() * 2200) });
    price = close;
  }
  const scale = info.base / candles[candles.length - 1].close;
  return candles.map((c) => ({
    ...c,
    open: c.open * scale, high: c.high * scale, low: c.low * scale, close: c.close * scale,
  }));
}

export interface LessonStep { n: number; title: string; done: number; total: number }
export const CHECKLIST: LessonStep[] = [
  { n: 1, title: "Trading Mindset", done: 3, total: 3 },
  { n: 2, title: "Market Structure", done: 4, total: 4 },
  { n: 3, title: "Supply & Demand", done: 2, total: 4 },
  { n: 4, title: "Trade Planning", done: 0, total: 3 },
  { n: 5, title: "Risk Management", done: 0, total: 3 },
  { n: 6, title: "Execution & Review", done: 0, total: 2 },
];

export interface Post {
  id: string; author: string; initials: string; time: string; tag: string;
  title: string; excerpt: string; likes: number; replies: number; chart?: boolean;
  /** Mock view counter shown in the feed row stats. */
  views: number;
  /** Unix ms — basis for the "Newest" feed sort. */
  createdAt: number;
  /** Authored by the current user. */
  mine?: boolean;
  /** Full body paragraphs rendered in the thread view. */
  body: string[];
}
const POST_NOW = Date.now();
export const POSTS: Post[] = [
  {
    id: "p1", author: "Alex R.", initials: "AR", time: "2h ago", tag: "Chart Analysis",
    title: "EURUSD at demand — looking for confirmation",
    excerpt: "Price is in the 1.0840–1.0865 zone I marked last week. I'm watching for a bullish reaction on the 1H. How are you guys managing risk on this?",
    likes: 12, replies: 24, chart: true, views: 248, createdAt: POST_NOW - 2 * 3600e3,
    body: [
      "Price is in the 1.0840–1.0865 demand zone I marked last week. It formed off the last strong move up, and this is the first touch since — so it should still be fresh.",
      "I'm watching the 1H for a bullish reaction: a clean engulfing or a rejection wick off the lower boundary. No trigger, no trade — if it slices through the zone I'll stand aside and reassess the next level.",
      "Risk-wise I'm thinking stop below 1.0835, which gives roughly 25–30 pips of risk. To the opposing supply near 1.0940 that works out to about 1:2.6 — clears the Math filter. How are you guys managing risk on this one? Scaling in or waiting for the full reaction?",
    ],
  },
  {
    id: "p2", author: "Maya P.", initials: "MP", time: "4h ago", tag: "Learning Question",
    title: "Best way to define supply and demand zones?",
    excerpt: "I'm still in the Foundations module and want to make sure I'm marking zones consistently. Any tips or examples that helped you?",
    likes: 9, replies: 15, views: 183, createdAt: POST_NOW - 4 * 3600e3,
    body: [
      "I'm still in the Foundations module and I keep second-guessing my zone boundaries. Sometimes I mark the whole consolidation, other times just the last opposite candle before the move — and they come out different every time.",
      "I want to make sure I'm marking zones consistently before I move on to the Trade Planning lessons. Any tips, rules of thumb, or examples that helped it click for you?",
    ],
  },
  {
    id: "p3", author: "Dre W.", initials: "DW", time: "6h ago", tag: "Trade Planning",
    title: "My pre-session checklist (template inside)",
    excerpt: "Sharing the 7-step checklist I run before every simulated session. Keeps me honest on the Math filter.",
    likes: 31, replies: 19, chart: true, views: 412, createdAt: POST_NOW - 6 * 3600e3,
    body: [
      "Sharing the 7-step checklist I run before every simulated session: (1) mark HTF bias, (2) mark fresh zones, (3) note trapped-participant cues, (4) define the trigger, (5) run the Math filter, (6) set alerts instead of staring, (7) journal the plan before entry.",
      "The step that keeps me honest is the Math filter — if the reward-to-risk isn't at least 1:2 to the opposing zone, the plan dies right there. Screenshot attached of today's marked-up plan.",
      "Steal it, tweak it, tell me what's missing.",
    ],
  },
  {
    id: "p4", author: "Coach Dev", initials: "CD", time: "1d ago", tag: "Chart Analysis",
    title: "Review: trapped participants on NQ",
    excerpt: "Nice examples this week. Notice how the failed breakout created the fuel for the reversal — classic trapped-longs signature.",
    likes: 44, replies: 32, chart: true, views: 538, createdAt: POST_NOW - 26 * 3600e3,
    body: [
      "Nice examples this week, everyone. This NQ review ties together the last three lessons: notice how the failed breakout above the prior high created the fuel for the reversal — classic trapped-longs signature.",
      "The breakout traders who chased the high are now underwater. Their exits — sell stops — are exactly what accelerated the move back down into demand. That's why we treat trapped participants as confluence, not a signal on its own.",
      "For your markups this week: circle where the trap formed, then mark the zone you'd actually trade. Process over prediction.",
    ],
  },
];

/** One-level-deep forum comment. replyToId nests it under a parent comment. */
export interface DiscussionComment {
  id: string;
  author: string;
  time: string;
  body: string;
  votes: number;
  /** Role badge rendered next to the author, e.g. "COACH". */
  role?: string;
  mine?: boolean;
  replyToId?: string;
}

/** Seeded thread comments, keyed by post id — 3+ per seeded post. */
export const POST_COMMENTS: Record<string, DiscussionComment[]> = {
  p1: [
    { id: "c-p1-1", author: "Coach Dev", role: "COACH", time: "1h ago", body: "Good zone boundaries. What's your trigger inside the zone — engulfing or wick rejection? Define it before the level trades.", votes: 8 },
    { id: "c-p1-2", author: "Andre K.", time: "1h ago", body: "I marked the same 1.0840–1.0865 zone. Waiting for the 15m reaction before I even think about entry — no trigger, no trade.", votes: 5 },
    { id: "c-p1-3", author: "Priya S.", time: "58m ago", body: "How wide is your stop on this? Below 1.0835 puts the risk around 30 pips, right?", votes: 2 },
    { id: "c-p1-4", author: "Maya R.", time: "40m ago", body: "Same zone as me. The risk is cleaner if you wait for the second touch — less chance of getting caught in the first flush.", votes: 3, replyToId: "c-p1-2" },
  ],
  p2: [
    { id: "c-p2-1", author: "Coach Lena", role: "COACH", time: "3h ago", body: "Check lesson 4.2 — the rubric has two screenshots showing fresh vs. tested zones. Mark the origin of the strong move, not the whole consolidation.", votes: 11 },
    { id: "c-p2-2", author: "Leo M.", time: "2h ago", body: "What helped me: the zone is the last opposite-colored candle before the impulsive move, plus the base it left from. Consistent every time once I stopped eyeballing it.", votes: 6 },
    { id: "c-p2-3", author: "Maya P.", time: "1h ago", body: "This is exactly what I needed — the \"last opposite candle\" rule clears up most of my confusion. Retaking the quiz now.", votes: 1, replyToId: "c-p2-1" },
  ],
  p3: [
    { id: "c-p3-1", author: "Coach Dev", role: "COACH", time: "5h ago", body: "Solid checklist. Add a \"no trigger, no trade\" line after step 4 — it forces the pause before the Math filter even runs.", votes: 14 },
    { id: "c-p3-2", author: "Maya R.", time: "4h ago", body: "Using this tomorrow. Step 5 is the one I always skip — journaling the plan before entry feels like overkill until you see it catch a bad idea.", votes: 4 },
    { id: "c-p3-3", author: "Dre W.", time: "3h ago", body: "Good call — added as step 4b. The pause is the point.", votes: 2, replyToId: "c-p3-1" },
    { id: "c-p3-4", author: "Sam T.", time: "2h ago", body: "Do you run the checklist on weekends for planning, or only pre-session?", votes: 1 },
  ],
  p4: [
    { id: "c-p4-1", author: "Andre K.", time: "20h ago", body: "The NQ example made it click — failed breakout = trapped longs, and their exits fuel the move back. Seeing it on a real markup helped more than the slides.", votes: 7 },
    { id: "c-p4-2", author: "Priya S.", time: "18h ago", body: "Can we get a markup of the supply side too? I see the trap on the longs but I'm less sure where the reversal should stall.", votes: 3 },
    { id: "c-p4-3", author: "Coach Dev", role: "COACH", time: "16h ago", body: "Good question — the opposing supply is marked on the attached chart, near the breakdown origin. That's your first stall point and your Math-filter reference.", votes: 9, replyToId: "c-p4-2" },
  ],
};

/** Trending rail row — opens the linked post thread or applies a tag filter. */
export interface TrendingItem {
  title: string;
  count: number;
  postId?: string;
  filterTag?: string;
}
export const TRENDING: TrendingItem[] = [
  { title: "EURUSD demand zone discussion", count: 24, postId: "p1" },
  { title: "Supply & demand marking examples", count: 19, postId: "p2" },
  { title: "Trade planning checklist", count: 15, postId: "p3" },
  { title: "Learning path: what to do next?", count: 12, filterTag: "Learning Question" },
];

/** Discord-style community channels (concept data). */
export interface ChatChannel { id: string; topic: string }
export const CHAT_CHANNELS: ChatChannel[] = [
  { id: "chart-analysis", topic: "Post your zone markups — coaches give feedback" },
  { id: "learning-questions", topic: "Ask anything about lessons, quizzes, and concepts" },
  { id: "trade-planning", topic: "Share the plan before the entry — the Math first" },
  { id: "wins-and-lessons", topic: "Celebrate wins, dissect lessons — no signal calls" },
];

export interface ScanResult { symbol: string; zone: string; freshness: string; trapped: string; math: string; score: number }
export const SCAN_RESULTS: ScanResult[] = [
  { symbol: "EURUSD", zone: "Demand 1H", freshness: "Fresh", trapped: "Yes", math: "1:2.4", score: 94 },
  { symbol: "GBPUSD", zone: "Supply 4H", freshness: "Tested", trapped: "Yes", math: "1:2.1", score: 86 },
  { symbol: "NQ", zone: "Demand 15m", freshness: "Fresh", trapped: "No", math: "1:1.8", score: 72 },
  { symbol: "USDJPY", zone: "Supply D", freshness: "Fresh", trapped: "Yes", math: "1:3.0", score: 91 },
  { symbol: "CL", zone: "Demand 1H", freshness: "Tested", trapped: "No", math: "1:2.2", score: 68 },
];

/** Provenance of a journaled record. */
export type TradeSource = "simulated" | "imported" | "manual" | "verified";

export interface ClosedTrade {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  entry: number;
  exit: number;
  qty: number;
  pnl: number;
  rMultiple: number;
  /** ISO timestamp of when the simulated position was closed. */
  timeClose: string;
  /** Where this record came from — simulated closes, imports, manual entries, or verified syncs. */
  source: TradeSource;
  notes?: string;
}

/** Day key (YYYY-MM-DD) used to key journal notes and chart attachments. */
export function journalDayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Day key for a calendar day number within the current month. */
export function journalKeyForDay(day: number, now = new Date()): string {
  return journalDayKey(new Date(now.getFullYear(), now.getMonth(), day));
}

/** Day key for the close date of a trade. */
export function tradeDayKey(t: ClosedTrade): string {
  return journalDayKey(new Date(t.timeClose));
}

/** Trades closed on a given day number within the current month. */
export function tradesOnDay(trades: ClosedTrade[], day: number, now = new Date()): ClosedTrade[] {
  return trades.filter((t) => {
    const d = new Date(t.timeClose);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === day;
  });
}

/** Deterministic simulated closed trades spread across ~15 days of the current month. */
export function seedClosedTrades(now = new Date()): ClosedTrade[] {
  const rand = mulberry32(20240517);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayPool = [2, 3, 4, 6, 7, 9, 10, 11, 13, 14, 16, 17, 18, 20, 21, 23, 24, 25, 27];
  const symbols = ["EURUSD", "GBPUSD", "NQ", "USDJPY"];
  const qtyPool = [0.1, 0.2, 0.5, 1];
  // Seeded provenance mix — mostly simulated, some imported/manual/verified.
  const sourcePool: TradeSource[] = ["simulated", "simulated", "simulated", "verified", "imported", "manual"];
  const trades: ClosedTrade[] = [];
  let n = 0;
  for (const day of dayPool) {
    if (day > daysInMonth) continue;
    const count = 1 + Math.floor(rand() * 2.4); // 1–3 trades per day
    for (let i = 0; i < count; i++) {
      const symbol = symbols[Math.floor(rand() * symbols.length)];
      const info = symbolInfo(symbol);
      const side = rand() > 0.4 ? "buy" : "sell";
      const qty = qtyPool[Math.floor(rand() * qtyPool.length)];
      const pnl = Math.round((rand() - 0.42) * 520);
      const entry = info.base;
      const dir = side === "buy" ? 1 : -1;
      // Exit is derived so the pips-based P&L math stays consistent.
      const exit = entry + dir * (pnl / (10 * qty)) * info.pip;
      const rMultiple = Math.round((pnl / 240) * 10) / 10;
      const close = new Date(now.getFullYear(), now.getMonth(), day, 8 + Math.floor(rand() * 11), Math.floor(rand() * 60));
      trades.push({
        id: `jt-${++n}`, symbol, side, entry, exit, qty, pnl, rMultiple,
        timeClose: close.toISOString(),
        source: sourcePool[Math.floor(rand() * sourcePool.length)],
      });
    }
  }
  return trades.sort((a, b) => a.timeClose.localeCompare(b.timeClose));
}

export const QUIZ_QUESTIONS = [
  { q: "Price returns to a fresh 1H demand zone with trapped shorts below. What's the highest-quality plan?", choices: ["Buy immediately at market", "Wait for a bullish reaction inside the zone, then enter with SL below", "Sell the zone — zones always break", "Wait for price to break above the supply zone"], correct: 1, why: "A zone alone isn't an entry. Confirmation plus defined risk gives you the Math filter." },
  { q: "Your stop would be 40 pips and the target only 50. What does the Math filter say?", choices: ["Take it — a win is a win", "Skip it — R:R below 1:2 fails the Math filter", "Double the size to compensate", "Move the stop closer after entry"], correct: 1, why: "MechaniX requires ≥1:2 reward-to-risk before entry." },
  { q: "What signals 'trapped participants' on the chart?", choices: ["A doji at the top", "A failed breakout that reverses sharply", "High volume on a weekend", "A gap on the open"], correct: 1, why: "A failed breakout traps breakout traders, whose exits fuel the reversal." },
];

export const PROP_RULES = [
  { name: "Profit target", value: 6.4, target: 8, unit: "%", ok: true },
  { name: "Daily loss", value: 1.2, target: 4, unit: "%", ok: true },
  { name: "Max drawdown", value: 2.1, target: 8, unit: "%", ok: true },
  { name: "Consistency", value: 22, target: 45, unit: "%", ok: true },
  { name: "Trading days", value: 9, target: 10, unit: "d", ok: false },
];


export function formatPrice(v: number, symbol = "EURUSD"): string {
  return v.toFixed(symbolInfo(symbol).decimals);
}

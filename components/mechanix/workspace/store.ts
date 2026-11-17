"use client";

import { create } from "zustand";
import {
  POSTS, POST_COMMENTS, seedClosedTrades, symbolInfo,
  type ClosedTrade, type DiscussionComment, type Post,
} from "./mock-data";

export type ChartLayout = 1 | 2 | 4;
export type MxTheme = "green" | "ocean" | "ember" | "violet" | "midnight";
export type AccountMode = "simulation" | "live";
export type DrawingType = "hline" | "hray" | "zone" | "rect" | "trendline" | "fib" | "long" | "short" | "vr" | "text" | "alert" | "brush" | "highlighter";
export type Tool = "cursor" | DrawingType;
export type TicketSide = "buy" | "sell";

export interface DrawingPoint {
  time: number;
  price: number;
}
export interface Drawing {
  id: string;
  type: DrawingType;
  p1: DrawingPoint;
  p2?: DrawingPoint;
  text?: string;
  color?: string;
  /** Freehand stroke points for brush/highlighter tools. */
  pts?: DrawingPoint[];
}
export interface Ticket {
  side: TicketSide;
  type: "market" | "limit" | "stop";
  price: number;
  volume: number;
  sl: number;
  tp: number;
}
export interface Position {
  id: string;
  symbol: string;
  side: TicketSide;
  entry: number;
  volume: number;
  sl: number;
  tp: number;
  /** Candle time (unix seconds) the position was opened on — used for entry markers. */
  entryTime?: number;
}
export interface QuizState {
  index: number;
  score: number;
  attempts: number;
  finished: boolean;
  passed: boolean;
}
export interface ChatReaction {
  emoji: string;
  count: number;
  /** Whether the current user has added this reaction. */
  mine?: boolean;
}
export interface ChatReplyRef {
  author: string;
  text: string;
}
export interface ChatMessage {
  id: string;
  author: string;
  text: string;
  mine?: boolean;
  likes?: number;
  /** Display timestamp, e.g. "09:42". */
  time?: string;
  /** Day bucket used for separator pills, e.g. "Today" | "Yesterday". */
  day?: string;
  /** Role badge label rendered next to the author name, e.g. "COACH". */
  role?: string;
  /** Render a chart snapshot attachment card under the text. */
  chart?: boolean;
  replyTo?: ChatReplyRef;
  pinned?: boolean;
  reactions?: ChatReaction[];
}
export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}
export interface Follower {
  id: string;
  name: string;
  balance: number;
  /** Copy size multiplier applied to the lead order volume. */
  multiplier: number;
  /** Max lots this follower will take per copied trade. */
  sizeLimit: number;
  paused: boolean;
}
export interface CopierLogEntry {
  time: string;
  msg: string;
}
/** Level-acceptance readiness criteria for §3.1 gating. */
export interface Readiness {
  coursePct: number;
  quizPassed: boolean;
  chartEvidence: boolean;
  routineStreak: number;
}
export interface SavedLayout {
  name: string;
  symbol: string;
  timeframe: string;
  savedAt: string;
}
export interface CoachGrant {
  coach: string;
  granted: boolean;
  since: string;
}
export interface CoachSubmission {
  id: string;
  text: string;
  time: string;
}
/** Input for addPost — the store fills in author/id/timestamps. */
export interface NewPostInput {
  title: string;
  tag: string;
  body: string;
  chart?: boolean;
}

/** Copied lot size for a follower: base volume × multiplier, clamped by size limit. */
export function copySize(baseVolume: number, f: Follower): number {
  return Math.min(baseVolume * f.multiplier, f.sizeLimit);
}

function nowTime(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function prependLog(log: CopierLogEntry[], entries: CopierLogEntry[]): CopierLogEntry[] {
  return [...entries, ...log].slice(0, 50);
}

interface MechanixState {
  symbol: string;
  timeframe: string;
  chartLayout: ChartLayout;
  focusMode: boolean;
  isFullscreen: boolean;
  activeTool: Tool;
  drawings: Record<string, Drawing[]>;
  indicators: string[];
  candleUp: string;
  candleDown: string;
  wickUp: string;
  wickDown: string;
  candleBorders: boolean;
  colorPrevClose: boolean;
  magnet: boolean;
  watchlistOpen: boolean;
  showQuickTrade: boolean;
  showPosLines: boolean;
  paperBalance: number;
  rectColor: string;
  replayIndex: number | null;
  accountMode: AccountMode;
  liveUnlocked: boolean;
  liveGateOpen: boolean;
  ticket: Ticket;
  positions: Position[];
  closedTrades: ClosedTrade[];
  copierEnabled: boolean;
  leadAccount: string;
  followers: Follower[];
  copierLog: CopierLogEntry[];
  journalNotes: Record<string, string>;
  journalCharts: Record<string, boolean>;
  communityFilter: string;
  /** Discussions feed — seeded from POSTS, new posts prepend. */
  posts: Post[];
  /** Per-post vote score (seeded from Post.likes). */
  postVotes: Record<string, number>;
  /** Thread comments keyed by post id — one-level replies via replyToId. */
  discussionComments: Record<string, DiscussionComment[]>;
  /** Post id open in the thread view, or null when showing the feed. */
  openPostId: string | null;
  theme: MxTheme;
  cart: CartItem[];
  dockOpen: boolean;
  journalDay: number;
  setJournalDay: (d: number) => void;
  quiz: QuizState;
  /** Community chat, keyed by channel id (see CHAT_CHANNELS). */
  chat: Record<string, ChatMessage[]>;
  /** Active community channel id. */
  chatChannel: string;
  readiness: Readiness;
  levelUnlocked: boolean;
  onboarding: { step: number; answers: (string | null)[]; done: boolean };
  layouts: SavedLayout[];
  coachGrants: CoachGrant[];
  grantLog: CopierLogEntry[];
  coachSubmissions: CoachSubmission[];
  setSymbol: (s: string) => void;
  setTimeframe: (t: string) => void;
  setChartLayout: (l: ChartLayout) => void;
  setFocusMode: (v: boolean) => void;
  setFullscreen: (v: boolean) => void;
  setTool: (t: Tool) => void;
  toggleIndicator: (name: string) => void;
  setCandleColors: (up: string, down: string) => void;
  setWickColors: (up: string, down: string) => void;
  setCandleBorders: (v: boolean) => void;
  setColorPrevClose: (v: boolean) => void;
  setMagnet: (v: boolean) => void;
  setWatchlistOpen: (v: boolean) => void;
  setShowQuickTrade: (v: boolean) => void;
  setShowPosLines: (v: boolean) => void;
  setPaperBalance: (v: number) => void;
  resetPaperTrading: () => void;
  setRectColor: (c: string) => void;
  setReplayIndex: (i: number | null) => void;
  removeDrawing: (id: string) => void;
  addDrawing: (d: Drawing) => void;
  updateDrawing: (id: string, patch: Partial<Drawing>) => void;
  undoDrawing: () => void;
  clearDrawings: () => void;
  setAccountMode: (m: AccountMode) => void;
  setLiveGateOpen: (v: boolean) => void;
  setTicket: (patch: Partial<Ticket>) => void;
  addPosition: (p: Position) => void;
  updatePosition: (id: string, patch: Partial<Pick<Position, "sl" | "tp" | "entry">>) => void;
  closePosition: (id: string, exitPrice: number) => void;
  setCopierEnabled: (v: boolean) => void;
  setMultiplier: (id: string, x: number) => void;
  setSizeLimit: (id: string, x: number) => void;
  toggleFollower: (id: string) => void;
  pauseAllCopying: () => void;
  resumeAllCopying: () => void;
  logCopy: (msg: string) => void;
  setJournalNote: (dayKey: string, text: string) => void;
  attachChart: (dayKey: string) => void;
  setCommunityFilter: (f: string) => void;
  setOpenPost: (id: string | null) => void;
  votePost: (id: string, dir: 1 | -1) => void;
  voteComment: (postId: string, commentId: string, dir: 1 | -1) => void;
  addComment: (postId: string, text: string, replyToId?: string) => void;
  addPost: (input: NewPostInput) => void;
  setTheme: (t: MxTheme) => void;
  addToCart: (item: Omit<CartItem, "qty">) => void;
  removeFromCart: (id: string) => void;
  setCartQty: (id: string, qty: number) => void;
  clearCart: () => void;
  setDockOpen: (v: boolean) => void;
  setQuiz: (patch: Partial<QuizState>) => void;
  addChat: (channel: string, m: ChatMessage) => void;
  likeMessage: (channel: string, id: string) => void;
  toggleReaction: (channel: string, id: string, emoji: string) => void;
  pinMessage: (channel: string, id: string) => void;
  setChatChannel: (channel: string) => void;
  setReadiness: (patch: Partial<Readiness>) => void;
  unlockLevel: () => void;
  setOnboardingStep: (step: number) => void;
  setOnboardingAnswer: (index: number, value: string) => void;
  completeOnboarding: () => void;
  saveLayout: (name: string) => void;
  applyLayout: (name: string) => void;
  deleteLayout: (name: string) => void;
  grantAccess: (coach: string) => void;
  revokeAccess: (coach: string) => void;
  submitToCoach: (text: string) => void;
}

export const useMechanix = create<MechanixState>((set) => ({
  symbol: "EURUSD",
  timeframe: "1H",
  chartLayout: 1,
  focusMode: false,
  isFullscreen: false,
  activeTool: "cursor",
  drawings: {},
  indicators: ["S&D Zones", "Small Body Candles"],
  candleUp: "#22A06B",
  candleDown: "#E5484D",
  wickUp: "#22A06B",
  wickDown: "#E5484D",
  candleBorders: false,
  colorPrevClose: false,
  magnet: false,
  watchlistOpen: false,
  showQuickTrade: true,
  showPosLines: true,
  paperBalance: 100000,
  rectColor: "#F59E0B",
  replayIndex: null,
  accountMode: "simulation",
  liveUnlocked: false,
  liveGateOpen: false,
  ticket: { side: "buy", type: "limit", price: 1.0865, volume: 0.5, sl: 1.0835, tp: 1.0925 },
  positions: [],
  closedTrades: seedClosedTrades(),
  copierEnabled: true,
  leadAccount: "Practice Account",
  followers: [
    { id: "f1", name: "Prop Challenge A", balance: 50000, multiplier: 1.0, sizeLimit: 0.5, paused: false },
    { id: "f2", name: "Practice Account B", balance: 25000, multiplier: 0.5, sizeLimit: 0.2, paused: false },
    { id: "f3", name: "Challenge C", balance: 10000, multiplier: 0.25, sizeLimit: 0.1, paused: true },
  ],
  copierLog: [
    { time: "10:04", msg: "BUY 0.5 EURUSD → copied ×2" },
    { time: "09:52", msg: "TP hit +1.8R → copied ×2" },
    { time: "09:31", msg: "SELL 0.2 GBPUSD → copied ×2" },
    { time: "08:15", msg: "BUY 0.1 NQ → skipped (limit)" },
  ],
  journalNotes: {},
  journalCharts: {},
  communityFilter: "All",
  posts: POSTS,
  postVotes: Object.fromEntries(POSTS.map((p) => [p.id, p.likes])),
  discussionComments: POST_COMMENTS,
  openPostId: null,
  theme: "green",
  cart: [],
  dockOpen: true,
  journalDay: 12,
  setJournalDay: (journalDay) => set({ journalDay }),
  quiz: { index: 0, score: 0, attempts: 1, finished: false, passed: false },
  chatChannel: "chart-analysis",
  chat: {
    "chart-analysis": [
      { id: "ca1", author: "Maya R.", text: "Anyone else watching the EURUSD demand zone on the 1H?", day: "Yesterday", time: "16:42", likes: 4, reactions: [{ emoji: "\u{1F44D}", count: 4 }, { emoji: "\u{1F525}", count: 2 }] },
      { id: "ca2", author: "Coach Dev", role: "COACH", text: "Weekly zone-marking thread is open \u2014 post fresh 1H markups only.", day: "Yesterday", time: "16:55", pinned: true, likes: 9 },
      { id: "ca3", author: "Andre K.", text: "Marked it 1.0840\u20131.0865. Waiting for a bullish engulfing.", day: "Yesterday", time: "17:03", likes: 2, replyTo: { author: "Maya R.", text: "Anyone else watching the EURUSD demand zone on the 1H?" } },
      { id: "ca4", author: "You", text: "Posted my markup in the thread \u2014 feedback welcome.", day: "Today", time: "09:05", mine: true, reactions: [{ emoji: "\u{1F44D}", count: 1 }] },
      { id: "ca5", author: "Maya R.", text: "Same zone as mine \u2014 here's my markup.", day: "Today", time: "09:12", chart: true },
      { id: "ca6", author: "Coach Dev", role: "COACH", text: "Mark the zone first, then wait for the reaction. Process over prediction.", day: "Today", time: "09:20", pinned: true, reactions: [{ emoji: "\u{1F4A1}", count: 6, mine: true }] },
      { id: "ca7", author: "Priya S.", text: "Does the zone still count if wicks pierce it twice?", day: "Today", time: "09:31" },
    ],
    "learning-questions": [
      { id: "lq1", author: "Priya S.", text: "Stuck on lesson 4 \u2014 how do I tell a fresh zone from a tested one?", day: "Yesterday", time: "15:10" },
      { id: "lq2", author: "Coach Lena", role: "COACH", text: "Fresh = untouched since formation. Check the rubric in lesson 4.2 \u2014 two screenshots show the difference.", day: "Yesterday", time: "15:26", pinned: true },
      { id: "lq3", author: "Coach Lena", role: "COACH", text: "Search this channel first \u2014 most quiz questions are already answered here.", day: "Yesterday", time: "15:28", pinned: true },
      { id: "lq4", author: "Leo M.", text: "That clicked \u2014 thanks! Retaking the quiz now.", day: "Today", time: "08:44", replyTo: { author: "Coach Lena", text: "Fresh = untouched since formation." }, reactions: [{ emoji: "\u{1F44D}", count: 2 }] },
      { id: "lq5", author: "Andre K.", text: "Does the scenario quiz count the Math section separately?", day: "Today", time: "10:02" },
    ],
    "trade-planning": [
      { id: "tp1", author: "Sam T.", text: "Plan for London open: GBPUSD long off 4H demand, 1:2.5 RR. Thoughts?", day: "Yesterday", time: "18:05" },
      { id: "tp2", author: "Coach Dev", role: "COACH", text: "Post the zone screenshot with the plan \u2014 process over prediction.", day: "Yesterday", time: "18:20", pinned: true },
      { id: "tp3", author: "Dre W.", text: "Template pinned: bias, zone, trigger, risk, review. Use it for every plan.", day: "Yesterday", time: "18:31", pinned: true },
      { id: "tp4", author: "Maya R.", text: "I'd wait for the retest \u2014 entry trigger is missing otherwise.", day: "Today", time: "07:52", reactions: [{ emoji: "\u{1F525}", count: 1 }] },
      { id: "tp5", author: "Sam T.", text: "Good call \u2014 adding the markup.", day: "Today", time: "08:11", chart: true },
    ],
    "wins-and-lessons": [
      { id: "wl1", author: "Priya S.", text: "Lost -1R on a forced entry \u2014 lesson: no trigger, no trade.", day: "Yesterday", time: "19:14" },
      { id: "wl2", author: "Coach Dev", role: "COACH", text: "That's exactly the review habit we want. Log it in the journal.", day: "Yesterday", time: "19:22", pinned: true },
      { id: "wl3", author: "Maya R.", text: "Monthly review thread goes here \u2014 post one win and one lesson.", day: "Yesterday", time: "19:30", pinned: true },
      { id: "wl4", author: "Leo M.", text: "First +2R week following the checklist. Journaling everything helped.", day: "Today", time: "11:20", reactions: [{ emoji: "\u{1F525}", count: 3 }, { emoji: "\u{1F44D}", count: 5 }] },
      { id: "wl5", author: "Dre W.", text: "Same mistake last week. The retest filter fixed it for me.", day: "Today", time: "12:03", replyTo: { author: "Priya S.", text: "Lost -1R on a forced entry" } },
    ],
  },
  readiness: { coursePct: 72, quizPassed: false, chartEvidence: false, routineStreak: 4 },
  levelUnlocked: false,
  onboarding: { step: 0, answers: [null, null, null, null], done: false },
  layouts: [
    { name: "EURUSD 1H zones", symbol: "EURUSD", timeframe: "1H", savedAt: "09:12" },
    { name: "NQ scalp 15m", symbol: "NQ", timeframe: "15m", savedAt: "08:40" },
  ],
  coachGrants: [
    { coach: "Coach Dev", granted: true, since: "2 weeks ago" },
    { coach: "Maya R.", granted: false, since: "—" },
  ],
  grantLog: [
    { time: "09:58", msg: "Granted access to Coach Dev — audit id #1" },
  ],
  coachSubmissions: [],
  setSymbol: (symbol) =>
    set((s) => {
      const base = symbolInfo(symbol).base;
      return {
        symbol,
        ticket: { ...s.ticket, price: base, sl: base * 0.9975, tp: base * 1.005 },
      };
    }),
  setTimeframe: (timeframe) => set({ timeframe }),
  setChartLayout: (chartLayout) => set({ chartLayout }),
  setFocusMode: (focusMode) => set({ focusMode }),
  setFullscreen: (isFullscreen) => set({ isFullscreen }),
  setTool: (activeTool) => set({ activeTool }),
  toggleIndicator: (name) =>
    set((s) => ({
      indicators: s.indicators.includes(name)
        ? s.indicators.filter((i) => i !== name)
        : [...s.indicators, name],
    })),
  setCandleColors: (candleUp, candleDown) => set({ candleUp, candleDown }),
  setWickColors: (wickUp, wickDown) => set({ wickUp, wickDown }),
  setCandleBorders: (candleBorders) => set({ candleBorders }),
  setColorPrevClose: (colorPrevClose) => set({ colorPrevClose }),
  setMagnet: (magnet) => set({ magnet }),
  setWatchlistOpen: (watchlistOpen) => set({ watchlistOpen }),
  setShowQuickTrade: (showQuickTrade) => set({ showQuickTrade }),
  setShowPosLines: (showPosLines) => set({ showPosLines }),
  setPaperBalance: (paperBalance) => set({ paperBalance }),
  resetPaperTrading: () => set({ positions: [], paperBalance: 100000 }),
  setRectColor: (rectColor) => set({ rectColor }),
  setReplayIndex: (replayIndex) => set({ replayIndex }),
  removeDrawing: (id) =>
    set((s) => ({
      drawings: { ...s.drawings, [s.symbol]: (s.drawings[s.symbol] ?? []).filter((d) => d.id !== id) },
    })),
  addDrawing: (d) =>
    set((s) => ({ drawings: { ...s.drawings, [s.symbol]: [...(s.drawings[s.symbol] ?? []), d] } })),
  updateDrawing: (id, patch) =>
    set((s) => ({
      drawings: {
        ...s.drawings,
        [s.symbol]: (s.drawings[s.symbol] ?? []).map((d) => (d.id === id ? { ...d, ...patch } : d)),
      },
    })),
  undoDrawing: () =>
    set((s) => ({
      drawings: { ...s.drawings, [s.symbol]: (s.drawings[s.symbol] ?? []).slice(0, -1) },
    })),
  clearDrawings: () => set((s) => ({ drawings: { ...s.drawings, [s.symbol]: [] } })),
  setAccountMode: (accountMode) => set({ accountMode }),
  setLiveGateOpen: (liveGateOpen) => set({ liveGateOpen }),
  setTicket: (patch) => set((s) => ({ ticket: { ...s.ticket, ...patch } })),
  updatePosition: (id, patch) =>
    set((s) => ({ positions: s.positions.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
  addPosition: (p) =>
    set((s) => ({
      positions: [...s.positions, p],
      // Simulated copier: unpaused followers receive the order at their own
      // clamped size; paused followers and clamped fills log as discrepancies.
      copierLog: s.copierEnabled
        ? prependLog(
            s.copierLog,
            s.followers.map((f) => {
              if (f.paused) {
                return { time: nowTime(), msg: `${p.side.toUpperCase()} ${p.volume} ${p.symbol} → ${f.name} skipped (paused)` };
              }
              const size = copySize(p.volume, f);
              const clamped = size < p.volume * f.multiplier - 1e-9;
              return {
                time: nowTime(),
                msg: `${p.side.toUpperCase()} ${p.volume} ${p.symbol} → ${f.name} ${size.toFixed(2)} lot${clamped ? ` — clamped by ${f.sizeLimit.toFixed(2)} lot limit` : ""}`,
              };
            })
          )
        : s.copierLog,
    })),
  closePosition: (id, exitPrice) =>
    set((s) => {
      const p = s.positions.find((x) => x.id === id);
      if (!p) return {};
      const info = symbolInfo(p.symbol);
      const dir = p.side === "buy" ? 1 : -1;
      const pnl = Math.round(((exitPrice - p.entry) / info.pip) * 10 * p.volume * dir);
      const riskPips = Math.abs(p.entry - p.sl) / info.pip;
      const riskUsd = riskPips * 10 * p.volume;
      const rMultiple = riskUsd > 0 ? Math.round((pnl / riskUsd) * 10) / 10 : 0;
      const trade: ClosedTrade = {
        id: `ct-${Date.now()}`, symbol: p.symbol, side: p.side,
        entry: p.entry, exit: exitPrice, qty: p.volume, pnl, rMultiple,
        timeClose: new Date().toISOString(),
        source: "simulated",
      };
      const head = `${p.side.toUpperCase()} ${p.volume} ${p.symbol} closed ${pnl >= 0 ? "+" : ""}$${pnl}`;
      return {
        positions: s.positions.filter((x) => x.id !== id),
        closedTrades: [...s.closedTrades, trade],
        paperBalance: s.paperBalance + pnl,
        copierLog: prependLog(
          s.copierLog,
          s.copierEnabled
            ? [
                { time: nowTime(), msg: `${head} → journaled` },
                ...s.followers.map((f) =>
                  f.paused
                    ? { time: nowTime(), msg: `${head} → ${f.name} skipped (paused)` }
                    : { time: nowTime(), msg: `${head} → ${f.name} closed ${copySize(p.volume, f).toFixed(2)} lot` }
                ),
              ]
            : [{ time: nowTime(), msg: `${head} → journaled` }]
        ),
      };
    }),
  setCopierEnabled: (v) =>
    set((s) => ({
      copierEnabled: v,
      copierLog: prependLog(s.copierLog, [
        { time: nowTime(), msg: v ? "Copying resumed (master)" : "Copying paused (master)" },
      ]),
    })),
  setMultiplier: (id, x) =>
    set((s) => {
      const f = s.followers.find((y) => y.id === id);
      if (!f) return {};
      const multiplier = Math.min(5, Math.max(0.1, x));
      return {
        followers: s.followers.map((y) => (y.id === id ? { ...y, multiplier } : y)),
        copierLog: prependLog(s.copierLog, [
          { time: nowTime(), msg: `${f.name} multiplier → ${multiplier.toFixed(2)}x` },
        ]),
      };
    }),
  setSizeLimit: (id, x) =>
    set((s) => {
      const f = s.followers.find((y) => y.id === id);
      if (!f) return {};
      const sizeLimit = Math.min(5, Math.max(0.05, x));
      return {
        followers: s.followers.map((y) => (y.id === id ? { ...y, sizeLimit } : y)),
        copierLog: prependLog(s.copierLog, [
          { time: nowTime(), msg: `${f.name} size limit → ${sizeLimit.toFixed(2)} lot max` },
        ]),
      };
    }),
  toggleFollower: (id) =>
    set((s) => {
      const f = s.followers.find((y) => y.id === id);
      if (!f) return {};
      return {
        followers: s.followers.map((y) => (y.id === id ? { ...y, paused: !y.paused } : y)),
        copierLog: prependLog(s.copierLog, [
          { time: nowTime(), msg: `${f.name} ${f.paused ? "resumed" : "paused"}` },
        ]),
      };
    }),
  pauseAllCopying: () =>
    set((s) => ({
      followers: s.followers.map((f) => ({ ...f, paused: true })),
      copierLog: prependLog(s.copierLog, [{ time: nowTime(), msg: "All followers paused" }]),
    })),
  resumeAllCopying: () =>
    set((s) => ({
      copierEnabled: true,
      followers: s.followers.map((f) => ({ ...f, paused: false })),
      copierLog: prependLog(s.copierLog, [{ time: nowTime(), msg: "All followers resumed" }]),
    })),
  logCopy: (msg) =>
    set((s) => ({ copierLog: prependLog(s.copierLog, [{ time: nowTime(), msg }]) })),
  setJournalNote: (dayKey, text) =>
    set((s) => ({ journalNotes: { ...s.journalNotes, [dayKey]: text } })),
  attachChart: (dayKey) =>
    set((s) => ({ journalCharts: { ...s.journalCharts, [dayKey]: true } })),
  setCommunityFilter: (communityFilter) => set({ communityFilter }),
  setOpenPost: (openPostId) => set({ openPostId }),
  votePost: (id, dir) =>
    set((s) => ({ postVotes: { ...s.postVotes, [id]: (s.postVotes[id] ?? 0) + dir } })),
  voteComment: (postId, commentId, dir) =>
    set((s) => ({
      discussionComments: {
        ...s.discussionComments,
        [postId]: (s.discussionComments[postId] ?? []).map((c) =>
          c.id === commentId ? { ...c, votes: c.votes + dir } : c
        ),
      },
    })),
  addComment: (postId, text, replyToId) =>
    set((s) => ({
      discussionComments: {
        ...s.discussionComments,
        [postId]: [
          ...(s.discussionComments[postId] ?? []),
          {
            id: `c-${Date.now()}`,
            author: "You",
            time: nowTime(),
            body: text,
            votes: 0,
            mine: true,
            replyToId,
          },
        ],
      },
      posts: s.posts.map((p) => (p.id === postId ? { ...p, replies: p.replies + 1 } : p)),
    })),
  addPost: (input) =>
    set((s) => ({
      posts: [
        {
          id: `p-${Date.now()}`,
          author: "You",
          initials: "YO",
          time: "just now",
          tag: input.tag,
          title: input.title,
          excerpt: input.body.length > 160 ? `${input.body.slice(0, 157)}…` : input.body,
          likes: 0,
          replies: 0,
          views: 1,
          createdAt: Date.now(),
          chart: input.chart,
          mine: true,
          body: input.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
        },
        ...s.posts,
      ],
    })),
  setTheme: (theme) => set({ theme }),
  addToCart: (item) =>
    set((s) => {
      const existing = s.cart.find((c) => c.id === item.id);
      if (existing) {
        return { cart: s.cart.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c)) };
      }
      return { cart: [...s.cart, { ...item, qty: 1 }] };
    }),
  removeFromCart: (id) => set((s) => ({ cart: s.cart.filter((c) => c.id !== id) })),
  setCartQty: (id, qty) =>
    set((s) => ({
      cart:
        qty <= 0
          ? s.cart.filter((c) => c.id !== id)
          : s.cart.map((c) => (c.id === id ? { ...c, qty } : c)),
    })),
  clearCart: () => set({ cart: [] }),
  setDockOpen: (dockOpen) => set({ dockOpen }),
  setQuiz: (patch) =>
    set((s) => ({
      quiz: { ...s.quiz, ...patch },
      // Passing the scenario quiz satisfies one Level-acceptance criterion.
      readiness: patch.passed ? { ...s.readiness, quizPassed: true } : s.readiness,
    })),
  addChat: (channel, m) =>
    set((s) => ({
      chat: {
        ...s.chat,
        [channel]: [...(s.chat[channel] ?? []), { ...m, likes: m.likes ?? 0 }],
      },
    })),
  likeMessage: (channel, id) =>
    set((s) => ({
      chat: {
        ...s.chat,
        [channel]: (s.chat[channel] ?? []).map((m) =>
          m.id === id ? { ...m, likes: (m.likes ?? 0) + 1 } : m
        ),
      },
    })),
  toggleReaction: (channel, id, emoji) =>
    set((s) => ({
      chat: {
        ...s.chat,
        [channel]: (s.chat[channel] ?? []).map((m) => {
          if (m.id !== id) return m;
          const reactions = [...(m.reactions ?? [])];
          const idx = reactions.findIndex((r) => r.emoji === emoji);
          if (idx === -1) {
            reactions.push({ emoji, count: 1, mine: true });
          } else {
            const r = reactions[idx];
            const next = r.mine ? r.count - 1 : r.count + 1;
            if (next <= 0) reactions.splice(idx, 1);
            else reactions[idx] = { ...r, count: next, mine: !r.mine };
          }
          return { ...m, reactions };
        }),
      },
    })),
  pinMessage: (channel, id) =>
    set((s) => ({
      chat: {
        ...s.chat,
        [channel]: (s.chat[channel] ?? []).map((m) =>
          m.id === id ? { ...m, pinned: !m.pinned } : m
        ),
      },
    })),
  setChatChannel: (chatChannel) => set({ chatChannel }),
  setReadiness: (patch) => set((s) => ({ readiness: { ...s.readiness, ...patch } })),
  unlockLevel: () => set({ levelUnlocked: true }),
  setOnboardingStep: (step) => set((s) => ({ onboarding: { ...s.onboarding, step } })),
  setOnboardingAnswer: (index, value) =>
    set((s) => ({
      onboarding: { ...s.onboarding, answers: s.onboarding.answers.map((a, i) => (i === index ? value : a)) },
    })),
  completeOnboarding: () => set((s) => ({ onboarding: { ...s.onboarding, done: true } })),
  saveLayout: (name) =>
    set((s) => ({
      layouts: [
        { name, symbol: s.symbol, timeframe: s.timeframe, savedAt: nowTime() },
        ...s.layouts.filter((l) => l.name !== name),
      ],
    })),
  applyLayout: (name) =>
    set((s) => {
      const l = s.layouts.find((x) => x.name === name);
      if (!l) return {};
      const base = symbolInfo(l.symbol).base;
      return {
        symbol: l.symbol,
        timeframe: l.timeframe,
        ticket: { ...s.ticket, price: base, sl: base * 0.9975, tp: base * 1.005 },
      };
    }),
  deleteLayout: (name) => set((s) => ({ layouts: s.layouts.filter((l) => l.name !== name) })),
  grantAccess: (coach) =>
    set((s) => ({
      coachGrants: s.coachGrants.map((g) =>
        g.coach === coach ? { ...g, granted: true, since: "just now" } : g
      ),
      grantLog: prependLog(s.grantLog, [
        { time: nowTime(), msg: `Granted access to ${coach} — audit id #${s.grantLog.length + 1}` },
      ]),
    })),
  revokeAccess: (coach) =>
    set((s) => ({
      coachGrants: s.coachGrants.map((g) =>
        g.coach === coach ? { ...g, granted: false, since: "—" } : g
      ),
      grantLog: prependLog(s.grantLog, [
        { time: nowTime(), msg: `Revoked access for ${coach} — audit id #${s.grantLog.length + 1}` },
      ]),
    })),
  submitToCoach: (text) =>
    set((s) => ({
      coachSubmissions: [
        { id: `sub-${Date.now()}`, text, time: nowTime() },
        ...s.coachSubmissions,
      ],
    })),
}));

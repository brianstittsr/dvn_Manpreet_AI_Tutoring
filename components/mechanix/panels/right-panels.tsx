"use client";

import { useState } from "react";
import { Bell, Send, Star, TrendingUp, CheckCircle2, AlertTriangle, ImageIcon, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TRENDING, journalKeyForDay, tradesOnDay, type TradeSource } from "@/components/mechanix/workspace/mock-data";
import { useMechanix } from "@/components/mechanix/workspace/store";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] p-3 shadow-[0_1px_2px_rgba(15,61,46,0.05)]">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">{title}</p>
      {children}
    </div>
  );
}

export function DashboardSide() {
  return (
    <div className="space-y-3 p-3">
      <Card title="Upcoming session">
        <p className="text-[13px] font-semibold text-[var(--mx-text)]">Live chart lab — Supply & Demand</p>
        <p className="text-[11px] text-[var(--mx-muted)]">Today · 17:00 UTC · with Coach Dev</p>
        <Button size="sm" className="mt-2 w-full bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]">Join waiting room</Button>
      </Card>
      <Card title="Coach feedback">
        <p className="text-[12px] italic text-[var(--mx-muted)]">“Your zone marking on EURUSD was clean. Next: wait for the reaction instead of anticipating it.”</p>
        <p className="mt-1 text-[11px] font-semibold text-[var(--mx-muted)]">— Coach Dev</p>
      </Card>
      <Card title="Alerts">
        {["EURUSD approaching marked demand", "Quiz deadline: Friday", "New review feedback"].map((a) => (
          <p key={a} className="flex items-center gap-1.5 py-1 text-[12px] text-[var(--mx-muted)]"><Bell className="h-3 w-3 text-amber-500" />{a}</p>
        ))}
      </Card>
    </div>
  );
}

export function ProfileSummary() {
  const rows = [["Goal", "Funded within 6 months"], ["Markets", "FX Majors + NQ"], ["Schedule", "Weekdays 19:00–20:30"], ["Risk", "0.5% per trade"]];
  return (
    <div className="space-y-3 p-3">
      <Card title="Your profile so far">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between py-1 text-[12px]"><span className="text-[var(--mx-muted)]">{k}</span><b className="text-[var(--mx-text)]">{v}</b></div>
        ))}
      </Card>
      <Card title="Why this matters">
        <p className="text-[12px] text-[var(--mx-muted)]">These answers tune your lesson order, watchlist defaults, and risk prompts across the workspace.</p>
      </Card>
    </div>
  );
}

const AI_REPLIES = [
  "Good eye. Now mark the boundaries of that demand zone — where did the last strong move up begin?",
  "Exactly. Zone first, then confirmation. What would a valid reaction look like on the 1H?",
  "Right — a bullish engulfing or a strong rejection wick. And where would the stop go?",
  "Below the zone, yes. Now check the Math: is reward-to-risk at least 1:2 to the next supply?",
];

export function AiGuideChat() {
  const [messages, setMessages] = useState([
    { me: false, text: "I'm your AI Guide. Look at the embedded chart — what's the nearest significant zone?" },
  ]);
  const [input, setInput] = useState("");
  const send = () => {
    const t = input.trim();
    if (!t) return;
    setMessages((m) => [...m, { me: true, text: t }, { me: false, text: AI_REPLIES[Math.min(m.filter((x) => !x.me).length - 1, AI_REPLIES.length - 1)] }]);
    setInput("");
  };
  return (
    <div className="flex h-full flex-col">
      <p className="border-b border-[var(--mx-border)] p-3 text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">AI Guide</p>
      <div className="flex-1 space-y-2 overflow-y-auto p-3" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={cn("max-w-[85%] rounded-xl px-3 py-2 text-[12px]", m.me ? "ml-auto bg-[var(--mx-primary)] text-white" : "bg-[var(--mx-bg)] text-[var(--mx-text)]")}>{m.text}</div>
        ))}
      </div>
      <div className="flex gap-1.5 border-t border-[var(--mx-border)] p-2">
        <input
          aria-label="Message the AI Guide"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask or answer…"
          className="flex-1 rounded-lg border border-[var(--mx-border)] px-2.5 py-1.5 text-[12px] outline-none focus:ring-2 focus:ring-[var(--mx-accent)]/40"
        />
        <Button size="icon" aria-label="Send" onClick={send} className="h-8 w-8 bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]"><Send className="h-3.5 w-3.5" /></Button>
      </div>
    </div>
  );
}

export function QuizSide() {
  const quiz = useMechanix((s) => s.quiz);
  return (
    <div className="space-y-3 p-3">
      <Card title="Score">
        <p className="text-2xl font-bold tabular-nums text-[var(--mx-primary)]">{quiz.score}<span className="text-sm text-[var(--mx-faint)]"> / 3</span></p>
        <p className="text-[11px] text-[var(--mx-muted)]">Attempt {quiz.attempts} · Passing ≥ 2</p>
      </Card>
      <Card title="Coach note">
        <p className="text-[12px] text-[var(--mx-muted)]">“Pass this and Level 2 — Supply & Demand in practice — unlocks in your checklist.”</p>
      </Card>
    </div>
  );
}

export function PublishSettings() {
  return (
    <div className="space-y-3 p-3">
      <Card title="Publish settings">
        {["Passing score: 70%", "Attempts allowed: 3", "Randomize choice order", "Show feedback after each answer"].map((s, i) => (
          <label key={s} className="flex items-center gap-2 py-1 text-[12px] text-[var(--mx-muted)]">
            <input type="checkbox" defaultChecked={i !== 1} className="accent-[var(--mx-accent)]" />{s}
          </label>
        ))}
        <Button size="sm" className="mt-2 w-full bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]">Publish to track</Button>
      </Card>
      <Card title="Group quiz">
        <p className="text-[12px] text-[var(--mx-muted)]">Launch this as a live team challenge in Community.</p>
        <Button size="sm" variant="outline" className="mt-2 w-full">Launch group quiz</Button>
      </Card>
    </div>
  );
}

export function InstrumentDetails({ symbol }: { symbol: string }) {
  return (
    <div className="space-y-3 p-3">
      <Card title={symbol}>
        {[["Session", "London / NY overlap"], ["Spread (sim)", "0.6 pips"], ["Zone status", "Near 1H demand"], ["Trend", "Bullish, HTF aligned"]].map(([k, v]) => (
          <div key={k} className="flex justify-between py-1 text-[12px]"><span className="text-[var(--mx-muted)]">{k}</span><b className="text-[var(--mx-text)]">{v}</b></div>
        ))}
        <Button size="sm" className="mt-2 w-full bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]">Open chart</Button>
      </Card>
    </div>
  );
}

export function SetupExplainer() {
  return (
    <div className="space-y-3 p-3">
      <Card title="Why this setup scored 94">
        {["Fresh 1H demand zone, first touch", "Trapped shorts below the zone", "R:R to opposing supply = 1:2.4", "HTF trend aligned"].map((r) => (
          <p key={r} className="flex items-center gap-1.5 py-1 text-[12px] text-[var(--mx-muted)]"><CheckCircle2 className="h-3.5 w-3.5 text-[var(--mx-accent)]" />{r}</p>
        ))}
      </Card>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
        <p className="flex items-center gap-1.5 text-[12px] font-semibold text-amber-800"><AlertTriangle className="h-3.5 w-3.5" /> Educational, not advice</p>
        <p className="mt-1 text-[11px] text-amber-700">Scanner output is a teaching aid for the Four Filters, not a trade signal.</p>
      </div>
    </div>
  );
}

export function PropStatus() {
  return (
    <div className="space-y-3 p-3">
      <Card title="Status">
        <p className="text-[13px] font-bold text-[var(--mx-accent)]">On track — 80% to target</p>
        <p className="mt-1 text-[11px] text-[var(--mx-muted)]">1 more trading day required for consistency.</p>
      </Card>
      <Card title="Warnings">
        <p className="flex items-center gap-1.5 py-1 text-[12px] text-amber-700"><AlertTriangle className="h-3.5 w-3.5" /> Friday news: reduced size advised</p>
        <p className="flex items-center gap-1.5 py-1 text-[12px] text-[var(--mx-muted)]"><CheckCircle2 className="h-3.5 w-3.5 text-[var(--mx-accent)]" /> No rule breaches this week</p>
      </Card>
    </div>
  );
}

export function CopierControls() {
  const enabled = useMechanix((s) => s.copierEnabled);
  const setEnabled = useMechanix((s) => s.setCopierEnabled);
  const followers = useMechanix((s) => s.followers);
  const pauseAllCopying = useMechanix((s) => s.pauseAllCopying);
  const resumeAllCopying = useMechanix((s) => s.resumeAllCopying);
  const copierLog = useMechanix((s) => s.copierLog);
  const allPaused = followers.length > 0 && followers.every((f) => f.paused);
  const [discOnly, setDiscOnly] = useState(false);
  const discCount = copierLog.filter((l) => /skipped|clamped|mismatch/i.test(l.msg)).length;
  const shownLog = discOnly ? copierLog.filter((l) => /skipped|clamped|mismatch/i.test(l.msg)) : copierLog;
  return (
    <div className="space-y-3 p-3">
      <Card title="Copier controls">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-[var(--mx-text)]">Copying {enabled ? "enabled" : "paused"}</span>
          <button
            role="switch" aria-checked={enabled} aria-label="Master copier switch"
            onClick={() => setEnabled(!enabled)}
            className={cn("h-5 w-9 rounded-full transition-colors", enabled ? "bg-[var(--mx-accent)]" : "bg-slate-300")}
          >
            <span className={cn("block h-4 w-4 translate-x-0.5 rounded-full bg-[var(--mx-card)] transition-transform", enabled && "translate-x-[18px]")} />
          </button>
        </div>
        <Button
          size="sm" variant="outline" className="mt-2 w-full"
          onClick={() => (allPaused ? resumeAllCopying() : pauseAllCopying())}
        >
          {allPaused ? "Resume all" : "Pause all followers"}
        </Button>
        <p className="mt-1.5 text-[10px] text-[var(--mx-faint)]">
          {followers.filter((f) => !f.paused).length} of {followers.length} followers active
        </p>
      </Card>
      <Card title="Execution log">
        <div className="mb-1.5 flex items-center gap-1.5">
          <button
            aria-pressed={discOnly}
            data-testid="disc-filter"
            onClick={() => setDiscOnly(!discOnly)}
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition-colors",
              discOnly ? "bg-[var(--mx-primary)] text-white" : "bg-[var(--mx-bg)] text-[var(--mx-muted)] hover:bg-[var(--mx-hover)]"
            )}
          >
            <AlertTriangle className="h-3 w-3" /> Discrepancies
            <span className="rounded-full bg-black/10 px-1 tabular-nums">{discCount}</span>
          </button>
          {discOnly && <span className="text-[9px] text-[var(--mx-faint)]">skipped · clamped · mismatch</span>}
        </div>
        {shownLog.length === 0 && (
          <p className="py-1 text-[11px] text-[var(--mx-faint)]">
            {discOnly ? "No discrepancies — every copy matched." : "No copy events yet — fill a simulated order in Trade."}
          </p>
        )}
        {shownLog.map((l, i) => (
          <p key={`${l.time}-${i}`} className="border-b border-[var(--mx-bg)] py-1 font-mono text-[10px] text-[var(--mx-muted)] last:border-0">
            <span className="text-[var(--mx-faint)]">{l.time}</span> {l.msg}
          </p>
        ))}
      </Card>
    </div>
  );
}

const SOURCE_BADGE: Record<TradeSource, string> = {
  simulated: "bg-[var(--mx-active-bg)] text-[var(--mx-primary)]",
  verified: "bg-[var(--mx-active-bg)] text-[var(--mx-accent)]",
  imported: "bg-[var(--mx-hover)] text-[var(--mx-muted)]",
  manual: "bg-amber-50 text-amber-700",
};

export function JournalDayDetail({ day }: { day: number }) {
  const closedTrades = useMechanix((s) => s.closedTrades);
  const journalNotes = useMechanix((s) => s.journalNotes);
  const journalCharts = useMechanix((s) => s.journalCharts);
  const setJournalNote = useMechanix((s) => s.setJournalNote);
  const attachChart = useMechanix((s) => s.attachChart);
  const symbol = useMechanix((s) => s.symbol);
  const timeframe = useMechanix((s) => s.timeframe);
  const dayKey = journalKeyForDay(day);
  const trades = tradesOnDay(closedTrades, day);
  const net = trades.reduce((a, t) => a + t.pnl, 0);
  const best = trades.length ? Math.max(...trades.map((t) => t.rMultiple)) : null;
  const worst = trades.length ? Math.min(...trades.map((t) => t.rMultiple)) : null;
  const attached = Boolean(journalCharts[dayKey]);
  const attach = () => {
    attachChart(dayKey);
    toast.success("Chart snapshot attached (simulated)");
  };
  return (
    <div className="space-y-3 p-3">
      <Card title={`Day ${day} detail`}>
        <div className="flex justify-between py-1 text-[12px]"><span className="text-[var(--mx-muted)]">Net P&L</span><b className={cn("tabular-nums", net >= 0 ? "text-[var(--mx-accent)]" : "text-[var(--mx-down)]")}>{net >= 0 ? "+" : "-"}${Math.abs(net)}</b></div>
        <div className="flex justify-between py-1 text-[12px]"><span className="text-[var(--mx-muted)]">Trades</span><b className="text-[var(--mx-text)]">{trades.length}</b></div>
        <div className="flex justify-between py-1 text-[12px]"><span className="text-[var(--mx-muted)]">Best / worst</span>
          <b className="tabular-nums text-[var(--mx-text)]">{best === null || worst === null ? "—" : `${best >= 0 ? "+" : ""}${best.toFixed(1)}R / ${worst >= 0 ? "+" : ""}${worst.toFixed(1)}R`}</b>
        </div>
        <div className="mt-2 space-y-1">
          {trades.length === 0 && <p className="py-1 text-[11px] text-[var(--mx-faint)]">No simulated trades on this day.</p>}
          {trades.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-1 rounded-lg bg-[var(--mx-bg)] px-2 py-1.5 text-[11px]">
              <span className="font-semibold text-[var(--mx-text)]">
                {t.symbol} <span className={cn("capitalize", t.side === "buy" ? "text-[var(--mx-up)]" : "text-[var(--mx-down)]")}>{t.side}</span>
                <span className={cn("ml-1 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide", SOURCE_BADGE[t.source])}>{t.source}</span>
              </span>
              <span className="tabular-nums text-[var(--mx-muted)]">
                <b className={t.pnl >= 0 ? "text-[var(--mx-up)]" : "text-[var(--mx-down)]"}>{t.pnl >= 0 ? "+" : "-"}${Math.abs(t.pnl)}</b>
                {" · "}{t.rMultiple >= 0 ? "+" : ""}{t.rMultiple.toFixed(1)}R
              </span>
            </div>
          ))}
        </div>
        <textarea
          aria-label={`Notes for day ${day}`}
          value={journalNotes[dayKey] ?? ""}
          onChange={(e) => setJournalNote(dayKey, e.target.value)}
          rows={3}
          placeholder="Process notes for this day…"
          className="mt-2 w-full rounded-lg border border-[var(--mx-border)] p-2 text-[12px] outline-none focus:ring-2 focus:ring-[var(--mx-accent)]/40"
        />
        <Button size="sm" variant="outline" className="mt-2 w-full" onClick={attach} disabled={attached}>
          <ImageIcon className="mr-1 h-3.5 w-3.5" />{attached ? "Chart attached" : "Attach chart"}
        </Button>
      </Card>
      <Card title="Chart attachment">
        {attached ? (
          <div className="flex h-20 flex-col items-center justify-center gap-1 rounded-lg border border-[var(--mx-active-border)] bg-[var(--mx-active-bg)] text-[var(--mx-primary)]" data-testid="chart-attached">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-[10px] font-semibold">{symbol} · {timeframe} snapshot attached</span>
          </div>
        ) : (
          <div className="flex h-20 items-center justify-center rounded-lg bg-[var(--mx-bg)] text-[var(--mx-faint)]" data-testid="chart-empty">
            <ImageIcon className="h-5 w-5" />
          </div>
        )}
      </Card>
    </div>
  );
}

export function TrendingRail() {
  const setOpenPost = useMechanix((s) => s.setOpenPost);
  const setCommunityFilter = useMechanix((s) => s.setCommunityFilter);
  const open = (t: (typeof TRENDING)[number]) => {
    if (t.postId) {
      setOpenPost(t.postId);
    } else if (t.filterTag) {
      setOpenPost(null);
      setCommunityFilter(t.filterTag);
    }
    // Same pushState mechanism as the workspace navigate() helper.
    window.history.pushState(null, "", "/mechanix-design/discussions");
  };
  return (
    <div className="space-y-3 p-3">
      <Card title="Trending in Community">
        {TRENDING.map((t) => (
          <button
            key={t.title}
            onClick={() => open(t)}
            className="flex w-full items-center justify-between rounded-md px-1 py-1.5 text-left text-[12px] transition-colors hover:bg-[var(--mx-hover)]"
          >
            <span className="flex items-center gap-1.5 font-medium text-[var(--mx-text)]"><TrendingUp className="h-3 w-3 shrink-0 text-[var(--mx-accent)]" />{t.title}</span>
            <span className="rounded-full bg-[var(--mx-bg)] px-1.5 text-[10px] font-bold text-[var(--mx-muted)]">{t.count}</span>
          </button>
        ))}
      </Card>
      <Card title="Guidelines">
        <p className="text-[11px] leading-snug text-[var(--mx-muted)]">Mark your zones, show your reasoning, keep it educational. No signals, no financial advice.</p>
      </Card>
    </div>
  );
}

export function FeedbackComposer() {
  const [text, setText] = useState("");
  return (
    <div className="space-y-3 p-3">
      <Card title="Feedback composer">
        <textarea
          aria-label="Coach feedback"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="Write rubric-based feedback…"
          className="w-full rounded-lg border border-[var(--mx-border)] p-2 text-[12px] outline-none focus:ring-2 focus:ring-[var(--mx-accent)]/40"
        />
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <Button size="sm" className="bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]"><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Approve</Button>
          <Button size="sm" variant="outline">Request revision</Button>
        </div>
      </Card>
      <Card title="Access scope">
        <p className="flex items-center gap-1.5 text-[12px] text-[var(--mx-muted)]"><Star className="h-3.5 w-3.5 text-amber-500" /> Assigned learners only · read-only accounts</p>
      </Card>
    </div>
  );
}

export function CoachAccess() {
  const coachGrants = useMechanix((s) => s.coachGrants);
  const grantLog = useMechanix((s) => s.grantLog);
  const grantAccess = useMechanix((s) => s.grantAccess);
  const revokeAccess = useMechanix((s) => s.revokeAccess);
  const toggle = (coach: string, granted: boolean) => {
    if (granted) {
      revokeAccess(coach);
      toast.success(`Access revoked for ${coach}`, { description: "Logged to the audit trail — concept only." });
    } else {
      grantAccess(coach);
      toast.success(`Performance access granted to ${coach}`, { description: "Logged to the audit trail — concept only." });
    }
  };
  return (
    <div className="space-y-3 p-3" data-testid="coach-access">
      <Card title="Performance access">
        {coachGrants.map((g) => (
          <div key={g.coach} className="flex items-center justify-between border-b border-[var(--mx-bg)] py-1.5 last:border-0">
            <div>
              <p className="text-[12px] font-semibold text-[var(--mx-text)]">{g.coach}</p>
              <p className="text-[10px] text-[var(--mx-faint)]">{g.granted ? `Granted · ${g.since}` : "No access"}</p>
            </div>
            <button
              role="switch"
              aria-checked={g.granted}
              aria-label={`${g.coach} performance access`}
              data-testid={`grant-${g.coach.replace(/\W+/g, "-").toLowerCase()}`}
              onClick={() => toggle(g.coach, g.granted)}
              className={cn("h-5 w-9 rounded-full transition-colors", g.granted ? "bg-[var(--mx-accent)]" : "bg-slate-300")}
            >
              <span className={cn("block h-4 w-4 translate-x-0.5 rounded-full bg-[var(--mx-card)] transition-transform", g.granted && "translate-x-[18px]")} />
            </button>
          </div>
        ))}
        <p className="mt-1.5 text-[10px] text-[var(--mx-faint)]">Revoking takes effect immediately and is audit-logged.</p>
      </Card>
      <Card title="Access audit log">
        {grantLog.map((l, i) => (
          <p key={`${l.time}-${i}`} className="border-b border-[var(--mx-bg)] py-1 font-mono text-[10px] text-[var(--mx-muted)] last:border-0" data-testid="grant-log-entry">
            <span className="text-[var(--mx-faint)]">{l.time}</span> {l.msg}
          </p>
        ))}
      </Card>
    </div>
  );
}

export function SyncLogRail() {
  const entries = [
    "10:42 — Canvas: 12 assignments synced",
    "09:12 — Moodle: roster updated",
    "Yesterday — LearnDash: course map refreshed",
    "Yesterday — Google Classroom: skipped (not connected)",
    "Mon — Canvas: grades pushed for Quiz 3",
  ];
  return (
    <div className="space-y-3 p-3">
      <Card title="Sync log">
        {entries.map((e) => (
          <p key={e} className="border-b border-[var(--mx-bg)] py-1 font-mono text-[10px] text-[var(--mx-muted)] last:border-0">{e}</p>
        ))}
      </Card>
      <Card title="Sync scope">
        <p className="text-[11px] leading-snug text-[var(--mx-muted)]">Rosters, assignments, and quiz results. Chart tasks stay inside MechaniX. Concept only.</p>
      </Card>
    </div>
  );
}

export function CartRail() {
  const cart = useMechanix((s) => s.cart);
  const setCartQty = useMechanix((s) => s.setCartQty);
  const removeFromCart = useMechanix((s) => s.removeFromCart);
  const clearCart = useMechanix((s) => s.clearCart);
  const subtotal = cart.reduce((t, c) => t + c.price * c.qty, 0);
  return (
    <div className="space-y-3 p-3">
      <Card title="Cart">
        {cart.length === 0 ? (
          <p className="text-[12px] text-[var(--mx-muted)]">Your cart is empty — add something from the Shop.</p>
        ) : (
          <>
            {cart.map((c) => (
              <div key={c.id} className="flex items-center gap-2 border-b border-[var(--mx-bg)] py-1.5 text-[12px] last:border-0">
                <span className="min-w-0 flex-1 truncate font-medium text-[var(--mx-text)]">{c.name}</span>
                <span className="flex items-center gap-1">
                  <button aria-label={`Decrease ${c.name}`} onClick={() => setCartQty(c.id, c.qty - 1)}
                    className="rounded p-0.5 text-[var(--mx-faint)] hover:bg-[var(--mx-hover)]"><Minus className="h-3 w-3" /></button>
                  <span className="w-4 text-center tabular-nums text-[var(--mx-text)]">{c.qty}</span>
                  <button aria-label={`Increase ${c.name}`} onClick={() => setCartQty(c.id, c.qty + 1)}
                    className="rounded p-0.5 text-[var(--mx-faint)] hover:bg-[var(--mx-hover)]"><Plus className="h-3 w-3" /></button>
                </span>
                <span className="w-12 text-right tabular-nums font-semibold text-[var(--mx-text)]">${c.price * c.qty}</span>
                <button aria-label={`Remove ${c.name}`} onClick={() => removeFromCart(c.id)}
                  className="rounded p-0.5 text-[var(--mx-faint)] hover:text-[var(--mx-down)]"><Trash2 className="h-3 w-3" /></button>
              </div>
            ))}
            <div className="mt-2 flex justify-between text-[13px] font-bold">
              <span className="text-[var(--mx-muted)]">Subtotal</span>
              <span className="tabular-nums text-[var(--mx-primary)]">${subtotal}</span>
            </div>
            <Button size="sm" className="mt-2 w-full bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]"
              onClick={() => { clearCart(); toast.success("Checkout complete — simulated, nothing charged."); }}>
              Checkout (simulated)
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}

export function Leaderboard() {
  const teams = [
    { name: "Zone Hunters", pts: 820 }, { name: "Candle Crew", pts: 760 },
    { name: "Risk Rangers", pts: 640 }, { name: "Pip Scholars", pts: 590 },
  ];
  return (
    <div className="p-3">
      <Card title="Live leaderboard">
        {teams.map((t, i) => (
          <div key={t.name} className="mb-2">
            <div className="flex justify-between text-[12px]"><b className="text-[var(--mx-text)]">{i + 1}. {t.name}</b><span className="tabular-nums text-[var(--mx-muted)]">{t.pts}</span></div>
            <div className="mt-0.5 h-1.5 rounded-full bg-[var(--mx-bg)]">
              <div className={cn("h-full rounded-full transition-all duration-700", i === 0 ? "bg-[var(--mx-accent)]" : "bg-[#86C9A5]")} style={{ width: `${(t.pts / 820) * 100}%` }} />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

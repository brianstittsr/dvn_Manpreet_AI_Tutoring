"use client";

import {
  BookOpen, LayoutDashboard, GraduationCap, LineChart, Radar, CandlestickChart,
  Wallet, Trophy, Copy, NotebookPen, MessagesSquare, Users, ClipboardCheck, CheckCircle2, Circle,
  Lock, Hash, UserCheck, ListChecks, Filter, Plug, ShoppingBag, ShieldCheck, BookOpenText, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CHAT_CHANNELS, CHECKLIST, SYMBOLS } from "@/components/mechanix/workspace/mock-data";
import { useMechanix } from "@/components/mechanix/workspace/store";
import { useSimFeed } from "@/components/mechanix/workspace/use-sim-feed";
import type { MechanixSection } from "@/app/mechanix-design/views";

export interface NavItem { slug: string; label: string; icon: typeof BookOpen; locked?: boolean }

export const SECTION_NAV: Record<MechanixSection, NavItem[]> = {
  Learn: [
    { slug: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { slug: "onboarding", label: "Onboarding", icon: UserCheck },
    { slug: "lesson", label: "Lessons", icon: BookOpen },
    { slug: "quiz", label: "Scenario Quiz", icon: GraduationCap },
    { slug: "quiz-builder", label: "Quiz Builder", icon: ClipboardCheck },
    { slug: "integrations", label: "Integrations", icon: Plug },
  ],
  Practice: [
    { slug: "practice", label: "Practice Chart", icon: LineChart },
    { slug: "markets", label: "Markets", icon: CandlestickChart },
    { slug: "scanner", label: "Scanner", icon: Radar },
    { slug: "orderflow", label: "Bookmap", icon: ListChecks },
  ],
  Trade: [
    { slug: "trade", label: "Trade", icon: LineChart },
    { slug: "prop", label: "Prop Challenge", icon: Trophy },
    { slug: "copier", label: "Trade Copier", icon: Copy },
    { slug: "journal", label: "Journal", icon: NotebookPen },
  ],
  Community: [
    { slug: "community", label: "Chat", icon: MessagesSquare },
    { slug: "discussions", label: "Discussions", icon: Hash },
    { slug: "coach", label: "Coach Review", icon: ClipboardCheck },
    { slug: "group-quiz", label: "Group Quiz", icon: Users },
    { slug: "shop", label: "Shop", icon: ShoppingBag },
  ],
  Admin: [
    { slug: "admin-login", label: "Staff sign-in", icon: ShieldCheck },
    { slug: "admin-students", label: "Students", icon: Users },
    { slug: "admin-course", label: "Course builder", icon: BookOpenText },
    { slug: "admin-review", label: "Review queue", icon: ClipboardCheck },
    { slug: "admin-connectors", label: "Connectors", icon: Plug },
    { slug: "admin-architecture", label: "Architecture", icon: FileText },
  ],
};

interface RailProps {
  items: NavItem[];
  active: string;
  onNavigate: (slug: string) => void;
  showProgress?: boolean;
}

export function SectionRail({ items, active, onNavigate, showProgress = true }: RailProps) {
  return (
    <nav className="flex h-full flex-col gap-4 overflow-y-auto p-3" aria-label="Section navigation">
      <ul className="space-y-0.5">
        {items.map(({ slug, label, icon: Icon, locked }) => (
          <li key={slug}>
            <button
              onClick={() => onNavigate(slug)}
              aria-current={active === slug ? "page" : undefined}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                "text-[var(--mx-muted)] hover:bg-[var(--mx-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mx-accent)]/40",
                active === slug && "bg-[var(--mx-active-bg)] font-semibold text-[var(--mx-primary)]"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {locked && <Lock className="ml-auto h-3 w-3 text-[var(--mx-faint)]" />}
            </button>
          </li>
        ))}
      </ul>
      {showProgress && (
        <>
          <ProgressCard />
          <FoundationsCard />
          <ChecklistCard />
        </>
      )}
    </nav>
  );
}

export function ProgressCard() {
  const pct = 72;
  const r = 26; const c = 2 * Math.PI * r;
  return (
    <div className="rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] p-3 shadow-[0_1px_2px_rgba(15,61,46,0.05)]">
      <p className="text-xs font-semibold text-[var(--mx-text)]">Your Learning Progress</p>
      <div className="mt-2 flex items-center gap-3">
        <svg width={64} height={64} viewBox="0 0 64 64" aria-label={`${pct}% complete`} role="img">
          <circle cx={32} cy={32} r={r} fill="none" stroke="#E4E9E6" strokeWidth={7} />
          <circle cx={32} cy={32} r={r} fill="none" stroke="#16A34A" strokeWidth={7}
            strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} strokeLinecap="round" transform="rotate(-90 32 32)" />
          <text x={32} y={36} textAnchor="middle" fontSize={14} fontWeight={800} fill="#14532D">{pct}%</text>
        </svg>
        <div>
          <p className="text-[13px] font-bold text-[var(--mx-text)]">Foundations Track</p>
          <p className="text-[11px] text-[var(--mx-muted)]">13 of 18 lessons</p>
        </div>
      </div>
    </div>
  );
}

export function FoundationsCard() {
  return (
    <div className="rounded-xl bg-[var(--mx-deep)] p-3 text-white">
      <p className="text-[13px] font-bold">MechaniX Foundations</p>
      <p className="mt-1 text-[11px] leading-snug text-white/70">
        A structured program to build core trading skills, from market structure to trade execution.
      </p>
      <div className="mt-2 flex h-8 items-end gap-1" aria-hidden>
        {[6, 10, 8, 14, 12, 18, 16, 22].map((h, i) => (
          <div key={i} className={cn("w-2.5 rounded-sm", i > 5 ? "bg-[var(--mx-up)]" : "bg-white/25")} style={{ height: h }} />
        ))}
      </div>
    </div>
  );
}

export function ChecklistCard() {
  return (
    <div className="rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] p-3 shadow-[0_1px_2px_rgba(15,61,46,0.05)]">
      <ul className="space-y-1.5">
        {CHECKLIST.map((s) => {
          const done = s.done === s.total;
          const current = s.n === 3;
          return (
            <li key={s.n} className={cn("flex items-center gap-2 rounded-md px-1.5 py-1 text-[12px]", current && "bg-[var(--mx-active-bg)]")}>
              {done ? <CheckCircle2 className="h-3.5 w-3.5 text-[var(--mx-accent)]" /> : <Circle className={cn("h-3.5 w-3.5", current ? "text-[var(--mx-accent)]" : "text-[var(--mx-faint)]")} />}
              <span className={cn("font-medium", done ? "text-[var(--mx-muted)]" : "text-[var(--mx-text)]")}>{s.n}. {s.title}</span>
              <span className={cn("ml-auto text-[10px] font-bold tabular-nums", done ? "text-[var(--mx-accent)]" : "text-[var(--mx-faint)]")}>{s.done}/{s.total}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function StepListRail({ steps, active }: { steps: string[]; active: number }) {
  return (
    <div className="p-3">
      <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Setup steps</p>
      <ul className="space-y-1">
        {steps.map((s, i) => (
          <li key={s} className={cn("flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px]", i === active ? "bg-[var(--mx-active-bg)] font-semibold text-[var(--mx-primary)]" : "text-[var(--mx-muted)]")}>
            <span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold", i < active ? "bg-[var(--mx-accent)] text-white" : i === active ? "bg-[var(--mx-primary)] text-white" : "bg-[var(--mx-hover)] text-[var(--mx-muted)]")}>
              {i + 1}
            </span>
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WatchlistRail() {
  const groups = ["Forex", "Futures", "Crypto", "Stocks"] as const;
  return (
    <div className="h-full overflow-y-auto p-3">
      <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Watchlist</p>
      {groups.map((g) => (
        <div key={g} className="mb-3">
          <p className="px-1 pb-1 text-[11px] font-bold text-[var(--mx-muted)]">{g}</p>
          {SYMBOLS.filter((s) => s.group === g).map((s) => <WatchRow key={s.symbol} symbol={s.symbol} />)}
        </div>
      ))}
    </div>
  );
}

function WatchRow({ symbol }: { symbol: string }) {
  const feed = useSimFeed(symbol, "1m");
  const last = feed.last;
  const c = feed.candles;
  const up = c.length > 1 ? (last?.close ?? 0) >= c[c.length - 2].close : true;
  return (
    <div className="flex items-center justify-between rounded-md px-2 py-1 text-[12px] hover:bg-[var(--mx-hover)]" aria-live="off">
      <span className="font-semibold text-[var(--mx-text)]">{symbol}</span>
      <span className={cn("tabular-nums font-medium", up ? "text-[var(--mx-up)]" : "text-[var(--mx-down)]")}>
        {last ? last.close.toFixed(symbol === "USDJPY" ? 3 : symbol === "EURUSD" || symbol === "GBPUSD" || symbol === "AUDUSD" ? 5 : 2) : "—"}
      </span>
    </div>
  );
}

export function AccountsRail({ onNavigate, active }: { onNavigate: (s: string) => void; active: string }) {
  const accounts = [
    { name: "Practice Account", bal: "$25,000", status: "Simulation", locked: false },
    { name: "Prop Challenge", bal: "$50,000", status: "Phase 1 · Day 9", locked: false },
    { name: "Live Account", bal: "—", status: "Locked", locked: true },
  ];
  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-3">
      <p className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Accounts</p>
      {accounts.map((a) => (
        <div key={a.name} className={cn("rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] p-3", a.locked && "opacity-70")}>
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold text-[var(--mx-text)]">{a.name}</p>
            {a.locked ? <Lock className="h-3.5 w-3.5 text-[var(--mx-faint)]" /> : <Wallet className="h-3.5 w-3.5 text-[var(--mx-accent)]" />}
          </div>
          <p className="mt-0.5 text-lg font-bold tabular-nums text-[var(--mx-text)]">{a.bal}</p>
          <p className="text-[11px] text-[var(--mx-muted)]">{a.status}</p>
        </div>
      ))}
      <div className="mt-1 border-t border-[var(--mx-border)] pt-2">
        {SECTION_NAV.Trade.map(({ slug, label, icon: Icon }) => (
          <button key={slug} onClick={() => onNavigate(slug)}
            className={cn("flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-[var(--mx-muted)] hover:bg-[var(--mx-hover)]", active === slug && "bg-[var(--mx-active-bg)] font-semibold text-[var(--mx-primary)]")}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ScannerFiltersRail() {
  const filters = [
    { name: "Zone", desc: "Fresh S&D zone nearby", on: true },
    { name: "Freshness", desc: "First or second touch", on: true },
    { name: "Trapped", desc: "Failed breakout signature", on: false },
    { name: "The Math", desc: "Reward : Risk ≥ 1:2", on: true },
  ];
  return (
    <div className="p-3">
      <p className="flex items-center gap-1.5 px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]"><Filter className="h-3 w-3" /> Scanner filters</p>
      {filters.map((f) => (
        <label key={f.name} className="mb-1.5 flex cursor-pointer items-start gap-2 rounded-lg border border-[var(--mx-border)] bg-[var(--mx-card)] p-2.5 hover:border-[var(--mx-active-border)]">
          <input type="checkbox" defaultChecked={f.on} className="mt-0.5 accent-[var(--mx-accent)]" />
          <span><span className="block text-[13px] font-semibold text-[var(--mx-text)]">{f.name}</span>
          <span className="block text-[11px] text-[var(--mx-muted)]">{f.desc}</span></span>
        </label>
      ))}
    </div>
  );
}

export function ChannelsRail({ onNavigate, active }: { onNavigate: (s: string) => void; active: string }) {
  const chatChannel = useMechanix((s) => s.chatChannel);
  const setChatChannel = useMechanix((s) => s.setChatChannel);
  const online = ["Coach Dev", "Maya R.", "Andre K.", "Priya S.", "Leo M."];
  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-3">
      <p className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Channels</p>
      {CHAT_CHANNELS.map((c) => (
        <button
          key={c.id}
          onClick={() => {
            setChatChannel(c.id);
            if (active !== "community") onNavigate("community");
          }}
          aria-pressed={chatChannel === c.id}
          className={cn("rounded-lg px-3 py-1.5 text-left text-[13px] font-medium hover:bg-[var(--mx-hover)]", chatChannel === c.id ? "bg-[var(--mx-active-bg)] text-[var(--mx-primary)]" : "text-[var(--mx-muted)]")}
        ># {c.id}</button>
      ))}
      <p className="mt-2 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Online — {online.length}</p>
      {online.map((m) => (
        <div key={m} className="flex items-center gap-2 px-2 py-1 text-[12px] text-[var(--mx-muted)]">
          <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-[var(--mx-active-bg)] text-[9px] font-bold text-[var(--mx-primary)]">
            {m.split(" ").map((w) => w[0]).join("")}
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white bg-[var(--mx-up)]" />
          </span>
          {m}
        </div>
      ))}
      <div className="mt-auto border-t border-[var(--mx-border)] pt-2">
        {SECTION_NAV.Community.map(({ slug, label, icon: Icon }) => (
          <button key={slug} onClick={() => onNavigate(slug)}
            className={cn("flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-[var(--mx-muted)] hover:bg-[var(--mx-hover)]", active === slug && "bg-[var(--mx-active-bg)] font-semibold text-[var(--mx-primary)]")}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SimpleListRail({ title, items, activeIdx = 0 }: { title: string; items: string[]; activeIdx?: number }) {
  return (
    <div className="p-3">
      <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">{title}</p>
      {items.map((it, i) => (
        <div key={it} className={cn("mb-1 rounded-lg border px-3 py-2 text-[13px] font-medium", i === activeIdx ? "border-[var(--mx-active-border)] bg-[var(--mx-active-bg)] text-[var(--mx-primary)]" : "border-[var(--mx-border)] bg-[var(--mx-card)] text-[var(--mx-muted)]")}>
          {it}
        </div>
      ))}
    </div>
  );
}

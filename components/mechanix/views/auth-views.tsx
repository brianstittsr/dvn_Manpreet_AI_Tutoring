"use client";

import { useState } from "react";
import { Apple, Bell, Chrome, Globe, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMechanix, type MxTheme } from "@/components/mechanix/workspace/store";

const inputCls =
  "w-full rounded-lg border border-[var(--mx-border)] bg-[var(--mx-card)] px-3 py-2 text-[13px] text-[var(--mx-text)] outline-none placeholder:text-[var(--mx-faint)] focus:ring-2 focus:ring-[var(--mx-accent)]/40";

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] p-4 shadow-[0_1px_2px_rgba(15,61,46,0.05)]", className)}>
      {children}
    </div>
  );
}

function MiniCandles() {
  const bars = [
    { y: 46, h: 22, up: true }, { y: 38, h: 30, up: true }, { y: 44, h: 18, up: false },
    { y: 30, h: 26, up: true }, { y: 34, h: 16, up: false }, { y: 24, h: 28, up: true },
    { y: 18, h: 22, up: true }, { y: 26, h: 14, up: false }, { y: 14, h: 24, up: true },
    { y: 10, h: 18, up: true }, { y: 20, h: 12, up: false }, { y: 8, h: 20, up: true },
  ];
  return (
    <svg viewBox="0 0 240 80" className="h-20 w-full" aria-hidden>
      {bars.map((b, i) => (
        <g key={i}>
          <line x1={14 + i * 19} y1={b.y - 6} x2={14 + i * 19} y2={b.y + b.h + 6}
            stroke={b.up ? "#34D399" : "#F87171"} strokeWidth={1.5} />
          <rect x={9 + i * 19} y={b.y} width={10} height={b.h} rx={1.5}
            fill={b.up ? "#34D399" : "#F87171"} />
        </g>
      ))}
    </svg>
  );
}

export function LoginView({ onNavigate }: { onNavigate: (slug: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="grid h-full lg:grid-cols-2" data-testid="view-login">
      {/* Left — sign-in card */}
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <p className="select-none text-xl font-extrabold tracking-tight text-[var(--mx-deep)]">
            Mechani<span className="text-[var(--mx-accent)]">X</span>
          </p>
          <h1 className="mt-3 text-lg font-bold text-[var(--mx-text)]">Welcome back</h1>
          <p className="mt-0.5 text-[12px] text-[var(--mx-muted)]">
            Sign in to continue to your practice workspace. Concept — simulated auth.
          </p>
          <div className="mt-4 space-y-2.5">
            <label className="block">
              <span className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--mx-faint)]"><Mail className="h-3 w-3" /> Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--mx-faint)]"><Lock className="h-3 w-3" /> Password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" className={inputCls} />
            </label>
          </div>
          <Button
            className="mt-4 w-full bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]"
            onClick={() => onNavigate("practice")}
          >
            Sign in
          </Button>
          <div className="my-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--mx-faint)]">
            <span className="h-px flex-1 bg-[var(--mx-border)]" /> or continue with <span className="h-px flex-1 bg-[var(--mx-border)]" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="border-[var(--mx-border)] text-[var(--mx-text)] hover:bg-[var(--mx-hover)]"
              onClick={() => onNavigate("practice")}>
              <Chrome className="mr-1.5 h-4 w-4" /> Google
            </Button>
            <Button variant="outline" className="border-[var(--mx-border)] text-[var(--mx-text)] hover:bg-[var(--mx-hover)]"
              onClick={() => onNavigate("practice")}>
              <Apple className="mr-1.5 h-4 w-4" /> Apple
            </Button>
          </div>
          <p className="mt-4 text-center text-[12px] text-[var(--mx-muted)]">
            New to MechaniX?{" "}
            <button onClick={() => onNavigate("onboarding")} className="font-semibold text-[var(--mx-primary)] hover:underline">
              Create account
            </button>
          </p>
        </Card>
      </div>
      {/* Right — branded panel */}
      <div className="hidden flex-col justify-between bg-[var(--mx-deep)] p-8 text-white lg:flex">
        <p className="flex items-center gap-1.5 self-start rounded-full border border-white/20 px-2.5 py-1 text-[11px] font-semibold text-white/80">
          <Bell className="h-3 w-3" /> Concept • Illustrative data
        </p>
        <div>
          <h2 className="text-2xl font-extrabold leading-tight">
            Mark the zone.<br />Wait for the reaction.
          </h2>
          <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-white/70">
            One workspace for learning Supply &amp; Demand, practicing on live-feeling charts,
            and getting coach feedback — all in simulation.
          </p>
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-white/50">EURUSD · 1H · simulated</p>
            <MiniCandles />
          </div>
        </div>
        <p className="text-[11px] text-white/50">Foundations Track — 18 lessons, chart tasks, and a simulated prop challenge.</p>
      </div>
    </div>
  );
}

const TIMEZONES = ["UTC", "Europe/London", "Europe/Berlin", "America/New_York", "America/Chicago", "Asia/Dubai", "Asia/Singapore", "Australia/Sydney"];
const CURRENCIES = ["USD", "EUR", "GBP", "AUD", "JPY"];
const THEME_OPTS: { id: MxTheme; label: string }[] = [
  { id: "green", label: "Green (default)" },
  { id: "ocean", label: "Ocean" },
  { id: "ember", label: "Ember" },
  { id: "violet", label: "Violet" },
  { id: "midnight", label: "Midnight" },
];

export function AccountSetupView({ onNavigate }: { onNavigate: (slug: string) => void }) {
  const theme = useMechanix((s) => s.theme);
  const setTheme = useMechanix((s) => s.setTheme);
  const [notifs, setNotifs] = useState({ lessons: true, coach: true, community: false, product: false });
  return (
    <div className="mx-auto max-w-2xl space-y-3 p-6" data-testid="view-account-setup">
      <div>
        <h1 className="text-xl font-bold text-[var(--mx-text)]">Account setup</h1>
        <p className="mt-0.5 text-[13px] text-[var(--mx-muted)]">Profile and workspace defaults. Concept — nothing is persisted.</p>
      </div>
      <Card>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Profile</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-[11px] font-semibold text-[var(--mx-muted)]">Display name</span>
            <input defaultValue="Alex B." className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-[var(--mx-muted)]"><Globe className="h-3 w-3" /> Timezone</span>
            <select defaultValue="Europe/London" className={inputCls}>
              {TIMEZONES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold text-[var(--mx-muted)]">Base currency</span>
            <select defaultValue="USD" className={inputCls}>
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
        </div>
      </Card>
      <Card>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Workspace defaults</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold text-[var(--mx-muted)]">Default chart theme</span>
            <select value={theme} onChange={(e) => setTheme(e.target.value as MxTheme)} className={inputCls}>
              {THEME_OPTS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold text-[var(--mx-muted)]">Risk per trade</span>
            <select defaultValue="0.5%" className={inputCls}>
              {["0.25%", "0.5%", "1%"].map((r) => <option key={r}>{r}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold text-[var(--mx-muted)]">Max daily loss (sim)</span>
            <select defaultValue="2%" className={inputCls}>
              {["1%", "2%", "3%"].map((r) => <option key={r}>{r}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold text-[var(--mx-muted)]">Default account</span>
            <select defaultValue="Practice — $25,000" className={inputCls}>
              {["Practice — $25,000", "Prop Challenge — $50,000"].map((r) => <option key={r}>{r}</option>)}
            </select>
          </label>
        </div>
      </Card>
      <Card>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Notifications</p>
        {(
          [
            ["lessons", "Lesson reminders"],
            ["coach", "Coach feedback"],
            ["community", "Community mentions"],
            ["product", "Product updates"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 py-1 text-[13px] text-[var(--mx-muted)]">
            <input
              type="checkbox"
              checked={notifs[key]}
              onChange={(e) => setNotifs((n) => ({ ...n, [key]: e.target.checked }))}
              className="accent-[var(--mx-accent)]"
            />
            {label}
          </label>
        ))}
      </Card>
      <div className="flex justify-end gap-2">
        <Button variant="outline" className="border-[var(--mx-border)] text-[var(--mx-text)] hover:bg-[var(--mx-hover)]" onClick={() => onNavigate("practice")}>Cancel</Button>
        <Button
          className="bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]"
          onClick={() => {
            toast.success("Profile saved — concept only, nothing persisted.");
            onNavigate("dashboard");
          }}
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}

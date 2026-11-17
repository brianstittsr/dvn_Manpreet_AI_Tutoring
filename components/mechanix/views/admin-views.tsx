"use client";

import { useState } from "react";
import {
  Chrome, KeyRound, Lock, Mail, Plug, RefreshCw, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SYMBOLS } from "@/components/mechanix/workspace/mock-data";

export const inputCls =
  "w-full rounded-lg border border-[var(--mx-border)] bg-[var(--mx-card)] px-3 py-2 text-[13px] text-[var(--mx-text)] outline-none placeholder:text-[var(--mx-faint)] focus:ring-2 focus:ring-[var(--mx-accent)]/40";

export function Card({ className, children, ...rest }: { className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={cn("rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] p-4 shadow-[0_1px_2px_rgba(15,61,46,0.05)]", className)}>{children}</div>;
}

/** Small uppercase section-label used across admin views. */
export function CardLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">{children}</p>;
}

/* ----------------------------- admin-login ----------------------------- */

export function AdminLoginView({ onNavigate }: { onNavigate: (slug: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signIn = () => {
    toast.success("Signed in as staff — simulated auth.", { description: "Concept only — no credentials checked." });
    onNavigate("admin-students");
  };
  return (
    <div className="grid h-full lg:grid-cols-2" data-testid="view-admin-login">
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <p className="select-none text-xl font-extrabold tracking-tight text-[var(--mx-deep)]">
            Mechani<span className="text-[var(--mx-accent)]">X</span>
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--mx-active-border)] bg-[var(--mx-active-bg)] px-2.5 py-1 text-[11px] font-bold text-[var(--mx-primary)]" data-testid="staff-badge">
            <ShieldCheck className="h-3.5 w-3.5" /> Staff access — coaches &amp; admins
          </span>
          <h1 className="mt-3 text-lg font-bold text-[var(--mx-text)]">Staff sign in</h1>
          <p className="mt-0.5 text-[12px] text-[var(--mx-muted)]">
            Review queues, learner gating, and course tools. Concept — simulated auth.
          </p>
          <div className="mt-4 space-y-2.5">
            <label className="block">
              <span className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--mx-faint)]"><Mail className="h-3 w-3" /> Work email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="coach@mechanix.example" className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--mx-faint)]"><Lock className="h-3 w-3" /> Password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" className={inputCls} />
            </label>
          </div>
          <Button className="mt-4 w-full bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]" onClick={signIn} data-testid="staff-signin">
            Sign in to staff area
          </Button>
          <div className="my-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--mx-faint)]">
            <span className="h-px flex-1 bg-[var(--mx-border)]" /> or continue with <span className="h-px flex-1 bg-[var(--mx-border)]" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="border-[var(--mx-border)] text-[var(--mx-text)] hover:bg-[var(--mx-hover)]" onClick={signIn}>
              <Chrome className="mr-1.5 h-4 w-4" /> Google SSO
            </Button>
            <Button variant="outline" className="border-[var(--mx-border)] text-[var(--mx-text)] hover:bg-[var(--mx-hover)]" onClick={signIn}>
              <KeyRound className="mr-1.5 h-4 w-4" /> SAML SSO
            </Button>
          </div>
          <p className="mt-4 text-center text-[11px] text-[var(--mx-faint)]">
            Staff roles: coach · admin · read-only analyst. Concept — roles are illustrative.
          </p>
        </Card>
      </div>
      <div className="hidden flex-col justify-between bg-[var(--mx-deep)] p-8 text-white lg:flex">
        <p className="flex items-center gap-1.5 self-start rounded-full border border-white/20 px-2.5 py-1 text-[11px] font-semibold text-white/80">
          <ShieldCheck className="h-3 w-3" /> Concept • Staff prototype
        </p>
        <div>
          <h2 className="text-2xl font-extrabold leading-tight">
            Coach the process.<br />Gate the progression.
          </h2>
          <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-white/70">
            Review chart evidence, manage level acceptance, build lessons and quizzes,
            and keep every record tenant-scoped — all simulated.
          </p>
          <ul className="mt-6 space-y-2">
            {["Learner roster & readiness gating", "Course builder with chat-mode quizzes", "Review queue with follow-up templates"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-[13px] text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--mx-accent)]" />{f}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[11px] text-white/50">Single identity — tenant, role, and ownership boundaries on every record.</p>
      </div>
    </div>
  );
}

/* --------------------------- admin-connectors --------------------------- */

interface Connector {
  market: string;
  provider: string;
  status: "Connected" | "Simulated";
  group: "Forex" | "Futures" | "Crypto" | "Stocks";
  mapping: [string, string][];
  latency: string;
}

const CONNECTORS: Connector[] = [
  { market: "Forex", provider: "FX_IDC", status: "Connected", group: "Forex", mapping: [["FX:EURUSD", "EURUSD"], ["FX:GBPJPY", "GBPJPY → USDJPY×GBPUSD (synthetic)"]], latency: "42 ms" },
  { market: "Futures", provider: "CME", status: "Connected", group: "Futures", mapping: [["CME:NQ", "NQ"], ["CME:ES", "ES"]], latency: "18 ms" },
  { market: "Crypto", provider: "Binance-sim", status: "Simulated", group: "Crypto", mapping: [["BINANCE:BTCUSDT", "BTCUSD"], ["BINANCE:ETHUSDT", "ETHUSD"]], latency: "65 ms" },
  { market: "Stocks", provider: "NASDAQ-sim", status: "Simulated", group: "Stocks", mapping: [["NASDAQ:AAPL", "AAPL"], ["NASDAQ:MSFT", "MSFT"]], latency: "— (sim)" },
];

export function AdminConnectorsView() {
  return (
    <div className="grid gap-3 p-4 lg:grid-cols-2" data-testid="view-admin-connectors">
      <Card className="lg:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <CardLabel>Market connectors</CardLabel>
            <h1 className="mt-1 text-lg font-bold text-[var(--mx-text)]">Providers → canonical instruments</h1>
          </div>
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">Concept • Simulated feeds</span>
        </div>
      </Card>
      {CONNECTORS.map((c) => {
        const count = SYMBOLS.filter((s) => s.group === c.group).length;
        return (
          <Card key={c.market} data-testid={`connector-${c.group.toLowerCase()}`}>
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-[14px] font-bold text-[var(--mx-text)]">
                <Plug className="h-4 w-4 text-[var(--mx-accent)]" />{c.market}
                <span className="text-[11px] font-medium text-[var(--mx-faint)]">{c.provider}</span>
              </p>
              <span className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold",
                c.status === "Connected" ? "bg-[var(--mx-active-bg)] text-[var(--mx-primary)]" : "bg-amber-50 text-amber-700"
              )}>{c.status}</span>
            </div>
            <div className="mt-2 flex justify-between text-[12px]">
              <span className="text-[var(--mx-muted)]">Instruments</span>
              <b className="tabular-nums text-[var(--mx-text)]">{count} mapped</b>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-[var(--mx-muted)]">Latency (mock)</span>
              <b className="tabular-nums text-[var(--mx-text)]">{c.latency}</b>
            </div>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Identifier mapping — sample</p>
            <div className="mt-1 space-y-1">
              {c.mapping.map(([from, to]) => (
                <p key={from} className="rounded-md bg-[var(--mx-bg)] px-2 py-1 font-mono text-[11px] text-[var(--mx-muted)]">
                  {from} <span className="text-[var(--mx-faint)]">→</span> <span className="font-semibold text-[var(--mx-text)]">{to}</span>
                </p>
              ))}
            </div>
            <Button size="sm" variant="outline" className="mt-3 w-full border-[var(--mx-border)] text-[var(--mx-text)] hover:bg-[var(--mx-hover)]"
              onClick={() => toast.success(`${c.provider} sync complete — ${count} instruments re-mapped.`, { description: "Concept only — no live feed touched." })}>
              <RefreshCw className="mr-1 h-3.5 w-3.5" /> Sync now
            </Button>
          </Card>
        );
      })}
      <p className="lg:col-span-2 text-[11px] text-[var(--mx-faint)]">
        Providers normalized to canonical instruments — mapping kept server-side (concept).
      </p>
    </div>
  );
}

/* -------------------------- admin-architecture -------------------------- */

const PRINCIPLES: { title: string; text: string; model: string }[] = [
  {
    title: "Single identity with tenant, role & ownership boundaries",
    text: "One identity model across the platform; every record knows its tenant, the actor's role, and who owns it.",
    model: "users.tenantId + role: learner | coach | admin on every record",
  },
  {
    title: "Instruments normalized; provider ids mapped server-side",
    text: "Learners and records reference canonical instruments only — provider symbols never leak into the domain.",
    model: "see Market connectors: provider id → canonical symbol map held server-side",
  },
  {
    title: "Simulated / manual / imported / verified / live records separated & labeled",
    text: "Record provenance is explicit — simulated practice can never masquerade as verified performance.",
    model: "journal TradeSource badges: simulated · imported · manual · verified",
  },
  {
    title: "Financial mutations as server workflows with idempotency & immutable audit",
    text: "Anything that moves value runs as a server-side workflow — idempotent, retriable, and written to an append-only audit log.",
    model: "copier execution log + coach-grant audit trail (grant/revoke ids)",
  },
  {
    title: "Secrets only via approved secret handling",
    text: "API keys, broker credentials, and tokens live in managed secret storage — never in code, records, or the client.",
    model: "no credentials in client or records — connectors carry ids, not secrets",
  },
  {
    title: "Versioned rules, disclosures & content",
    text: "Every rule set, disclosure, and lesson ships with a version tag so outcomes stay explainable after changes.",
    model: "scanner rules, prop rules, lessons carry version tags",
  },
  {
    title: "Market data separated from account & journal records",
    text: "Price feeds and user/account data live in different stores with different lifecycles.",
    model: "independent retention and performance profiles per store",
  },
];

export function AdminArchitectureView() {
  return (
    <div className="mx-auto max-w-3xl space-y-3 p-6" data-testid="view-admin-architecture">
      <div>
        <CardLabel>Platform requirements</CardLabel>
        <h1 className="mt-1 text-xl font-bold text-[var(--mx-text)]">Seven architecture principles</h1>
        <p className="mt-0.5 text-[13px] text-[var(--mx-muted)]">
          How the MechaniX concept models each principle today. Concept — illustrative.
        </p>
      </div>
      {PRINCIPLES.map((p, i) => (
        <Card key={p.title} data-testid={`principle-${i + 1}`}>
          <div className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--mx-deep)] text-[12px] font-bold text-white">{i + 1}</span>
            <div className="min-w-0">
              <h2 className="text-[14px] font-bold text-[var(--mx-text)]">{p.title}</h2>
              <p className="mt-1 text-[12px] leading-relaxed text-[var(--mx-muted)]">{p.text}</p>
              <p className="mt-2 rounded-lg bg-[var(--mx-bg)] px-2.5 py-1.5 text-[11px] text-[var(--mx-text)]">
                <span className="font-semibold text-[var(--mx-primary)]">How MechaniX models it — </span>{p.model}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

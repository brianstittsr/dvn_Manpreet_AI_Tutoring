"use client";

import { useState } from "react";
import { Cable, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PROVIDERS = [
  { id: "canvas", name: "Canvas", initial: "C", desc: "Sync assignments and rubric feedback with your Canvas courses." },
  { id: "moodle", name: "Moodle", initial: "M", desc: "Import course rosters and push quiz results back to Moodle." },
  { id: "learndash", name: "LearnDash", initial: "L", desc: "Map MechaniX lessons to LearnDash topics and track completion." },
  { id: "google-classroom", name: "Google Classroom", initial: "G", desc: "Attach chart tasks to Classroom assignments for your cohort." },
];

export function IntegrationsView() {
  const [connected, setConnected] = useState<Record<string, boolean>>({ canvas: true });
  const [lastSync, setLastSync] = useState("Today · 09:12 UTC");

  const toggle = (id: string, name: string) => {
    const next = !connected[id];
    setConnected((c) => ({ ...c, [id]: next }));
    toast.success(`${name} ${next ? "connected" : "disconnected"} — concept only.`);
  };

  const syncNow = () => {
    const now = new Date();
    setLastSync(`Just now · ${now.toUTCString().slice(17, 22)} UTC`);
    toast.success("Course sync complete — 12 assignments updated (simulated).");
  };

  return (
    <div className="space-y-3 p-4" data-testid="view-integrations">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[var(--mx-text)]">LMS Integrations</h1>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">Concept • Illustrative data</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {PROVIDERS.map((p) => {
          const on = !!connected[p.id];
          return (
            <div key={p.id} className="rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] p-4 shadow-[0_1px_2px_rgba(15,61,46,0.05)]">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--mx-active-bg)] text-sm font-extrabold text-[var(--mx-primary)]">
                  {p.initial}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold text-[var(--mx-text)]">{p.name}</p>
                  <p className={cn("text-[11px] font-semibold", on ? "text-[var(--mx-accent)]" : "text-[var(--mx-faint)]")}>
                    {on ? "Connected" : "Not connected"}
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={on}
                  aria-label={`Toggle ${p.name}`}
                  onClick={() => toggle(p.id, p.name)}
                  className={cn("h-5 w-9 shrink-0 rounded-full transition-colors", on ? "bg-[var(--mx-accent)]" : "bg-slate-300")}
                >
                  <span className={cn("block h-4 w-4 translate-x-0.5 rounded-full bg-[var(--mx-card)] transition-transform", on && "translate-x-[18px]")} />
                </button>
              </div>
              <p className="mt-2.5 text-[12px] leading-snug text-[var(--mx-muted)]">{p.desc}</p>
            </div>
          );
        })}
      </div>
      <div className="rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] p-4 shadow-[0_1px_2px_rgba(15,61,46,0.05)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--mx-active-bg)] text-[var(--mx-primary)]">
              <Cable className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[14px] font-bold text-[var(--mx-text)]">Course sync</p>
              <p className="text-[11px] text-[var(--mx-muted)]">Last sync: {lastSync}</p>
            </div>
          </div>
          <Button size="sm" className="bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]" onClick={syncNow}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Sync now
          </Button>
        </div>
      </div>
    </div>
  );
}

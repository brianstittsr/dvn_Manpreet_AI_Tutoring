"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Circle, MessageSquare, Send, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMechanix } from "@/components/mechanix/workspace/store";
import { Card, CardLabel, inputCls } from "./admin-views";

type Level = "L1" | "L2" | "Prop";

interface Student {
  id: string;
  name: string;
  cohort: string;
  level: Level;
  coursePct: number;
  quizPassed: boolean;
  chartEvidence: boolean;
  routineStreak: number;
  lastActive: string;
  riskFlag: boolean;
  netR: number;
  winRate: number;
  coachAccess: boolean;
}

const STUDENTS: Student[] = [
  { id: "st1", name: "Alex R.", cohort: "Foundations L1", level: "L1", coursePct: 72, quizPassed: true, chartEvidence: true, routineStreak: 4, lastActive: "12m ago", riskFlag: false, netR: 4.2, winRate: 54, coachAccess: true },
  { id: "st2", name: "Maya P.", cohort: "S&D L2", level: "L2", coursePct: 88, quizPassed: true, chartEvidence: true, routineStreak: 6, lastActive: "1h ago", riskFlag: false, netR: 6.8, winRate: 58, coachAccess: true },
  { id: "st3", name: "Dre W.", cohort: "Prop-track", level: "Prop", coursePct: 100, quizPassed: true, chartEvidence: true, routineStreak: 12, lastActive: "3h ago", riskFlag: false, netR: 9.1, winRate: 61, coachAccess: false },
  { id: "st4", name: "Priya S.", cohort: "Foundations L1", level: "L1", coursePct: 64, quizPassed: false, chartEvidence: false, routineStreak: 1, lastActive: "2d ago", riskFlag: false, netR: -0.6, winRate: 44, coachAccess: true },
  { id: "st5", name: "Leo M.", cohort: "Foundations L1", level: "L1", coursePct: 58, quizPassed: false, chartEvidence: false, routineStreak: 0, lastActive: "5d ago", riskFlag: true, netR: -2.4, winRate: 38, coachAccess: false },
  { id: "st6", name: "Andre K.", cohort: "S&D L2", level: "L2", coursePct: 81, quizPassed: true, chartEvidence: true, routineStreak: 3, lastActive: "26m ago", riskFlag: false, netR: 3.7, winRate: 52, coachAccess: true },
  { id: "st7", name: "Sam T.", cohort: "S&D L2", level: "L2", coursePct: 77, quizPassed: false, chartEvidence: true, routineStreak: 2, lastActive: "1d ago", riskFlag: true, netR: 1.2, winRate: 49, coachAccess: true },
  { id: "st8", name: "Nora H.", cohort: "Prop-track", level: "Prop", coursePct: 95, quizPassed: true, chartEvidence: true, routineStreak: 9, lastActive: "44m ago", riskFlag: false, netR: 7.5, winRate: 57, coachAccess: true },
];

const LEVEL_STYLE: Record<Level, string> = {
  L1: "bg-[var(--mx-bg)] text-[var(--mx-muted)]",
  L2: "bg-[var(--mx-active-bg)] text-[var(--mx-primary)]",
  Prop: "bg-[var(--mx-deep)] text-white",
};

const ASSIGN_TASKS = [
  "Zone marking review — EURUSD 1H",
  "Trade plan review — next session",
  "Quiz remediation — the Math",
];

const FILTERS: ("All" | Level)[] = ["All", "L1", "L2", "Prop"];

function ready(s: Student): boolean {
  return s.coursePct >= 70 && s.quizPassed && s.chartEvidence && s.routineStreak >= 3;
}

export function AdminStudentsView() {
  const submitToCoach = useMechanix((s) => s.submitToCoach);
  const [filter, setFilter] = useState<"All" | Level>("All");
  const [selected, setSelected] = useState<Student | null>(null);
  const [task, setTask] = useState(ASSIGN_TASKS[0]);

  const shown = filter === "All" ? STUDENTS : STUDENTS.filter((s) => s.level === filter);

  const criteria = (s: Student) => [
    { label: "Course progress", detail: `${s.coursePct}% (≥ 70%)`, pass: s.coursePct >= 70 },
    { label: "Scenario quiz passed", detail: "Level scenario check", pass: s.quizPassed },
    { label: "Chart evidence", detail: "Zone marked on chart", pass: s.chartEvidence },
    { label: "Routine streak", detail: `${s.routineStreak} days (≥ 3)`, pass: s.routineStreak >= 3 },
  ];

  const assign = () => {
    if (!selected) return;
    submitToCoach(`${selected.name} — ${task}`);
    toast.success(`Review assigned to ${selected.name}`, { description: "Added to the coach review queue — concept only." });
  };

  return (
    <div className="grid gap-3 p-4 lg:grid-cols-[1fr_320px]" data-testid="view-admin-students">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardLabel>Student manager</CardLabel>
            <h1 className="mt-1 text-lg font-bold text-[var(--mx-text)]">Learner roster — {shown.length} of {STUDENTS.length}</h1>
          </div>
          <div className="flex gap-1.5" role="tablist" aria-label="Filter by level">
            {FILTERS.map((f) => (
              <button key={f} role="tab" aria-selected={filter === f} data-testid={`filter-${f.toLowerCase()}`}
                onClick={() => setFilter(f)}
                className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors",
                  filter === f ? "bg-[var(--mx-primary)] text-white" : "bg-[var(--mx-bg)] text-[var(--mx-muted)] hover:bg-[var(--mx-hover)]")}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 overflow-x-auto" data-testid="student-table">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[var(--mx-border)] text-left text-[10px] uppercase tracking-wide text-[var(--mx-faint)]">
                <th className="py-1.5 pr-3">Learner</th>
                <th className="px-2 py-1.5">Level</th>
                <th className="px-2 py-1.5">Course</th>
                <th className="px-2 py-1.5">Quiz</th>
                <th className="px-2 py-1.5" title="Chart evidence">Chart</th>
                <th className="px-2 py-1.5">Readiness</th>
                <th className="px-2 py-1.5">Last active</th>
                <th className="py-1.5 pl-2 text-right">Risk</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((s) => (
                <tr key={s.id} data-testid={`student-row-${s.id}`}
                  onClick={() => setSelected(s)}
                  aria-selected={selected?.id === s.id}
                  className={cn("cursor-pointer border-b border-[var(--mx-bg)] last:border-0",
                    selected?.id === s.id ? "bg-[var(--mx-active-bg)]" : "hover:bg-[var(--mx-hover)]")}>
                  <td className="py-2 pr-3">
                    <p className="font-semibold text-[var(--mx-text)]">{s.name}</p>
                    <p className="text-[10px] text-[var(--mx-faint)]">{s.cohort}</p>
                  </td>
                  <td className="px-2 py-2"><span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", LEVEL_STYLE[s.level])}>{s.level}</span></td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-12 rounded-full bg-[var(--mx-bg)]"><div className="h-full rounded-full bg-[var(--mx-accent)]" style={{ width: `${s.coursePct}%` }} /></div>
                      <span className="tabular-nums text-[var(--mx-muted)]">{s.coursePct}%</span>
                    </div>
                  </td>
                  <td className="px-2 py-2">{s.quizPassed
                    ? <span className="font-semibold text-[var(--mx-up)]">Passed</span>
                    : <span className="text-[var(--mx-muted)]">Not yet</span>}</td>
                  <td className="px-2 py-2">{s.chartEvidence
                    ? <CheckCircle2 className="h-4 w-4 text-[var(--mx-accent)]" aria-label="Chart evidence submitted" />
                    : <span className="text-[var(--mx-faint)]">—</span>}</td>
                  <td className="px-2 py-2"><span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold",
                    ready(s) ? "bg-[var(--mx-active-bg)] text-[var(--mx-primary)]" : "bg-amber-50 text-amber-700")}>
                    {ready(s) ? "Ready" : "Gated"}</span></td>
                  <td className="px-2 py-2 text-[var(--mx-muted)]">{s.lastActive}</td>
                  <td className="py-2 pl-2 text-right">{s.riskFlag
                    ? <AlertTriangle className="ml-auto h-4 w-4 text-amber-500" aria-label="Risk flag" />
                    : <span className="text-[var(--mx-faint)]">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Learner detail — in-view drawer column */}
      <Card data-testid="student-detail">
        {!selected ? (
          <div className="flex h-full min-h-40 flex-col items-center justify-center gap-2 text-center">
            <UserPlus className="h-6 w-6 text-[var(--mx-faint)]" />
            <p className="text-[12px] text-[var(--mx-muted)]">Select a learner to see gating detail and coach actions.</p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[15px] font-bold text-[var(--mx-text)]">{selected.name}</p>
                <p className="text-[11px] text-[var(--mx-muted)]">{selected.cohort} · {selected.level} · last active {selected.lastActive}</p>
              </div>
              <button aria-label="Close learner detail" onClick={() => setSelected(null)}
                className="rounded-md p-1 text-[var(--mx-faint)] hover:bg-[var(--mx-hover)]"><X className="h-4 w-4" /></button>
            </div>

            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Level acceptance — gated criteria</p>
            <div className="mt-1.5 space-y-1.5">
              {criteria(selected).map((c) => (
                <div key={c.label} className="flex items-start gap-2 rounded-lg border border-[var(--mx-border)] px-2.5 py-1.5">
                  {c.pass
                    ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--mx-accent)]" />
                    : <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--mx-faint)]" />}
                  <div className="min-w-0">
                    <p className={cn("text-[12px] font-semibold", c.pass ? "text-[var(--mx-text)]" : "text-[var(--mx-muted)]")}>{c.label}</p>
                    <p className="text-[10px] text-[var(--mx-faint)]">{c.pass ? "Met" : "Pending"} — {c.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Journal summary (sim)</p>
            <div className="mt-1.5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-[var(--mx-bg)] py-2">
                <p className={cn("text-[14px] font-bold tabular-nums", selected.netR >= 0 ? "text-[var(--mx-up)]" : "text-[var(--mx-down)]")}>{selected.netR >= 0 ? "+" : ""}{selected.netR}R</p>
                <p className="text-[9px] text-[var(--mx-faint)]">Net R · 30d</p>
              </div>
              <div className="rounded-lg bg-[var(--mx-bg)] py-2">
                <p className="text-[14px] font-bold tabular-nums text-[var(--mx-text)]">{selected.winRate}%</p>
                <p className="text-[9px] text-[var(--mx-faint)]">Win rate</p>
              </div>
              <div className="rounded-lg bg-[var(--mx-bg)] py-2">
                <p className="text-[14px] font-bold tabular-nums text-[var(--mx-text)]">{selected.routineStreak}d</p>
                <p className="text-[9px] text-[var(--mx-faint)]">Streak</p>
              </div>
            </div>

            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Coach access</p>
            <p className={cn("mt-1 flex items-center gap-1.5 text-[12px] font-semibold", selected.coachAccess ? "text-[var(--mx-primary)]" : "text-[var(--mx-muted)]")}>
              {selected.coachAccess ? <CheckCircle2 className="h-3.5 w-3.5 text-[var(--mx-accent)]" /> : <Circle className="h-3.5 w-3.5" />}
              {selected.coachAccess ? "Performance access granted" : "No coach access granted"}
            </p>

            <div className="mt-3 border-t border-[var(--mx-border)] pt-3">
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Assign review task</span>
                <select value={task} onChange={(e) => setTask(e.target.value)} className={inputCls} aria-label="Review task">
                  {ASSIGN_TASKS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <Button size="sm" variant="outline" className="border-[var(--mx-border)] text-[var(--mx-text)] hover:bg-[var(--mx-hover)]"
                  onClick={() => toast.success(`Message sent to ${selected.name} — simulated.`, { description: "Concept only — no message stored." })}>
                  <MessageSquare className="mr-1 h-3.5 w-3.5" /> Message
                </Button>
                <Button size="sm" className="bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]" onClick={assign} data-testid="assign-review-btn">
                  <Send className="mr-1 h-3.5 w-3.5" /> Assign review
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

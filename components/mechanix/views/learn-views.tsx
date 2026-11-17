"use client";

import { useState } from "react";
import {
  Play, CheckCircle2, Circle, PartyPopper, Plus, Unlock,
  FileText, Download, ClipboardList, Radio, Sparkles, Mic, LineChart, BellRing,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QUIZ_QUESTIONS } from "@/components/mechanix/workspace/mock-data";
import { useMechanix } from "@/components/mechanix/workspace/store";
import { useSimFeed } from "@/components/mechanix/workspace/use-sim-feed";
import { PriceChart } from "@/components/mechanix/chart/price-chart";

function Card({ className, children, ...rest }: { className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={cn("rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] p-4 shadow-[0_1px_2px_rgba(15,61,46,0.05)]", className)}>{children}</div>;
}

export function DashboardView() {
  const feed = useSimFeed("EURUSD", "1H");
  const readiness = useMechanix((s) => s.readiness);
  const levelUnlocked = useMechanix((s) => s.levelUnlocked);
  const unlockLevel = useMechanix((s) => s.unlockLevel);
  const symbol = useMechanix((s) => s.symbol);
  const hasZone = useMechanix((s) =>
    (s.drawings[s.symbol] ?? []).some((d) => d.type === "zone" || d.type === "rect")
  );
  const chartEvidence = readiness.chartEvidence || hasZone;

  const criteria: { label: string; detail: string; pass: boolean }[] = [
    { label: "Course progress", detail: `${readiness.coursePct}% of Foundations (≥ 70%)`, pass: readiness.coursePct >= 70 },
    { label: "Scenario quiz passed", detail: "Level 1 scenario check", pass: readiness.quizPassed },
    { label: "Chart evidence", detail: `Zone marked on ${symbol}`, pass: chartEvidence },
    { label: "Routine streak", detail: `${readiness.routineStreak} day${readiness.routineStreak === 1 ? "" : "s"} (≥ 3)`, pass: readiness.routineStreak >= 3 },
  ];
  const eligible = criteria.every((c) => c.pass);

  const unlock = () => {
    unlockLevel();
    toast.success("Level 2 unlocked — Supply & Demand in practice", {
      description: "Concept only — simulated progression.",
    });
  };

  return (
    <div className="grid gap-3 p-4 lg:grid-cols-2" data-testid="view-dashboard">
      <Card className="lg:col-span-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Today</p>
        <h1 className="mt-1 text-xl font-bold text-[var(--mx-text)]">Welcome back — next up: Supply & Demand, lesson 3 of 4</h1>
        <p className="mt-1 text-[13px] text-[var(--mx-muted)]">15 min lesson + one chart task. Then 20 minutes of guided practice on EURUSD.</p>
        <div className="mt-3 flex gap-2">
          <Button className="bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]">Resume lesson</Button>
          <Button variant="outline">Open practice chart</Button>
        </div>
      </Card>
      <Card className="lg:col-span-2" data-testid="level-checklist">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Level acceptance checklist</p>
          {levelUnlocked ? (
            <span className="flex items-center gap-1 rounded-full bg-[var(--mx-active-bg)] px-2.5 py-1 text-[11px] font-bold text-[var(--mx-primary)]" data-testid="level-unlocked">
              <CheckCircle2 className="h-3.5 w-3.5" /> Level 2 unlocked
            </span>
          ) : (
            <Button
              size="sm"
              disabled={!eligible}
              onClick={unlock}
              data-testid="level-unlock-btn"
              className="bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)] disabled:opacity-40"
            >
              <Unlock className="mr-1 h-3.5 w-3.5" />
              {eligible ? "Eligible — Level 2 unlock" : "Level 2 locked"}
            </Button>
          )}
        </div>
        <div className="mt-2 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
          {criteria.map((c) => (
            <div key={c.label} className="flex items-start gap-2 rounded-lg border border-[var(--mx-border)] px-2.5 py-2">
              {c.pass
                ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mx-accent)]" />
                : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mx-faint)]" />}
              <div className="min-w-0">
                <p className={cn("text-[12px] font-semibold", c.pass ? "text-[var(--mx-text)]" : "text-[var(--mx-muted)]")}>{c.label}</p>
                <p className="truncate text-[10px] text-[var(--mx-faint)]">{c.pass ? "Met" : "Pending"} — {c.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Chart preview — EURUSD 1H</p>
        <div className="h-52"><PriceChart feed={feed} symbol="EURUSD" interactive={false} compact /></div>
      </Card>
      <div className="grid gap-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Daily routine</p>
          {["Review yesterday's journal", "Mark zones before price arrives", "2 practice setups, then stop"].map((r, i) => (
            <p key={r} className="flex items-center gap-2 py-1.5 text-[13px] text-[var(--mx-muted)]">
              <CheckCircle2 className={cn("h-4 w-4", i === 0 ? "text-[var(--mx-accent)]" : "text-[var(--mx-faint)]")} />{r}
            </p>
          ))}
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">KPIs</p>
          <div className="mt-1 grid grid-cols-3 gap-2 text-center">
            {[["72%", "Track done"], ["+4.2R", "This week"], ["1:2.3", "Avg R:R"]].map(([v, l]) => (
              <div key={l}><p className="text-lg font-bold tabular-nums text-[var(--mx-primary)]">{v}</p><p className="text-[10px] text-[var(--mx-muted)]">{l}</p></div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

const OB_STEPS = [
  { title: "Your goals", desc: "What does success look like in 6 months?", opts: ["Get funded", "Consistent process", "Learn foundations"] },
  { title: "Your markets", desc: "Pick the instruments you want to focus on.", opts: ["FX Majors", "Index futures", "Crypto", "Stocks"] },
  { title: "Your schedule", desc: "When can you practice, realistically?", opts: ["Mornings", "Evenings", "Weekends"] },
  { title: "Your risk", desc: "Set your per-trade risk cap.", opts: ["0.25%", "0.5%", "1%"] },
];

export function OnboardingView({ onNavigate }: { onNavigate: (slug: string) => void }) {
  const onboarding = useMechanix((s) => s.onboarding);
  const setObStep = useMechanix((s) => s.setOnboardingStep);
  const setAnswer = useMechanix((s) => s.setOnboardingAnswer);
  const complete = useMechanix((s) => s.completeOnboarding);
  const step = onboarding.step;
  const s = OB_STEPS[step];
  const last = step === OB_STEPS.length - 1;
  const finish = () => {
    complete();
    toast.success("Onboarding complete — profile saved.", { description: "Next: confirm your account setup." });
    onNavigate("account-setup");
  };
  return (
    <div className="mx-auto max-w-lg p-6" data-testid="view-onboarding">
      {onboarding.done && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-[var(--mx-active-border)] bg-[var(--mx-active-bg)] px-3 py-2 text-[12px] font-semibold text-[var(--mx-primary)]">
          <CheckCircle2 className="h-4 w-4" /> Onboarding complete — update any answer and Finish to re-save.
        </div>
      )}
      <div className="mb-4 flex gap-1">
        {OB_STEPS.map((o, i) => (
          <div key={o.title} className={cn("h-1 flex-1 rounded-full transition-colors", i <= step ? "bg-[var(--mx-accent)]" : "bg-[var(--mx-border)]")} />
        ))}
      </div>
      <div key={step} className="animate-in fade-in slide-in-from-right-2 duration-200">
        <Card>
          <h1 className="text-lg font-bold text-[var(--mx-text)]">{s.title}</h1>
          <p className="mt-1 text-[13px] text-[var(--mx-muted)]">{s.desc}</p>
          <div className="mt-3 space-y-2">
            {s.opts.map((o) => (
              <label key={o} className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--mx-border)] p-2.5 text-[13px] font-medium text-[var(--mx-text)] hover:border-[var(--mx-active-border)] has-checked:border-[var(--mx-accent)] has-checked:bg-[var(--mx-active-bg)]">
                <input
                  type="radio"
                  name={s.title}
                  checked={onboarding.answers[step] === o}
                  onChange={() => setAnswer(step, o)}
                  className="accent-[var(--mx-accent)]"
                />{o}
              </label>
            ))}
          </div>
          <div className="mt-4 flex justify-between">
            <Button variant="outline" disabled={step === 0} onClick={() => setObStep(step - 1)}>Back</Button>
            <Button
              className="bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)] disabled:opacity-40"
              disabled={!onboarding.answers[step]}
              onClick={() => (last ? finish() : setObStep(step + 1))}
            >
              {last ? "Finish" : "Continue"}
            </Button>
          </div>
        </Card>
      </div>
      {onboarding.done && (
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onNavigate("account-setup")}>Account setup</Button>
          <Button size="sm" className="bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]" onClick={() => onNavigate("dashboard")}>
            Go to dashboard
          </Button>
        </div>
      )}
    </div>
  );
}

const LESSON_FORMATS = [
  { id: "video", label: "Video", icon: Play },
  { id: "written", label: "Written", icon: FileText },
  { id: "downloads", label: "Downloads", icon: Download },
  { id: "assignment", label: "Assignment", icon: ClipboardList },
  { id: "live", label: "Live session", icon: Radio },
  { id: "ai", label: "AI-guided", icon: Sparkles },
  { id: "interview", label: "Interview", icon: Mic },
  { id: "chart", label: "Chart task", icon: LineChart },
] as const;
type LessonFormat = (typeof LESSON_FORMATS)[number]["id"];

export function LessonView() {
  const feed = useSimFeed("EURUSD", "1H");
  const [done, setDone] = useState(false);
  const [format, setFormat] = useState<LessonFormat>("chart");
  const [assignChecks, setAssignChecks] = useState([true, false, false]);
  return (
    <div className="grid gap-3 p-4" data-testid="view-lesson">
      <Card>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--mx-deep)]"><Play className="h-5 w-5 text-white" /></span>
          <div>
            <h1 className="text-lg font-bold text-[var(--mx-text)]">Lesson 3.3 — Marking Fresh Demand Zones</h1>
            <p className="text-[12px] text-[var(--mx-muted)]">Supply & Demand · 14 min · Foundations Track</p>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-[var(--mx-muted)]">
          A fresh demand zone forms where price left quickly — an imbalance. Mark the base, note the departure,
          and rank zones by freshness and the strength of the move away.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Lesson formats">
          {LESSON_FORMATS.map((f) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={format === f.id}
              onClick={() => setFormat(f.id)}
              data-testid={`format-${f.id}`}
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
                format === f.id
                  ? "bg-[var(--mx-primary)] text-white"
                  : "bg-[var(--mx-bg)] text-[var(--mx-muted)] hover:bg-[var(--mx-hover)]"
              )}
            >
              <f.icon className="h-3 w-3" />{f.label}
            </button>
          ))}
        </div>
      </Card>

      {format === "chart" && (
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Chart task — mark the demand zone on EURUSD</p>
            <Button size="sm" variant={done ? "outline" : "default"} className={cn(!done && "bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]")} onClick={() => setDone(!done)}>
              {done ? "Marked ✓" : "Submit task"}
            </Button>
          </div>
          <div className="h-56"><PriceChart feed={feed} symbol="EURUSD" /></div>
          <p className="mt-2 text-[11px] text-[var(--mx-faint)]">Use the drawing rail on the left: select the zone tool, then click two corners. Concept • Illustrative data.</p>
        </Card>
      )}

      {format === "video" && (
        <Card>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Video lesson</p>
          <div className="relative flex h-56 items-center justify-center rounded-xl bg-[var(--mx-deep)]" data-testid="lesson-video">
            <button aria-label="Play lesson video" className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25">
              <Play className="h-6 w-6" />
            </button>
            <span className="absolute bottom-2 right-2 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white">14:32</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-[var(--mx-bg)]"><div className="h-full w-1/3 rounded-full bg-[var(--mx-accent)]" /></div>
          <p className="mt-1 text-[10px] text-[var(--mx-faint)]">Concept player — no real media. 1.25× speed available in full course.</p>
        </Card>
      )}

      {format === "written" && (
        <Card>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Written lesson</p>
          <div className="space-y-2 text-[13px] leading-relaxed text-[var(--mx-muted)]" data-testid="lesson-written">
            <p><b className="text-[var(--mx-text)]">1. Find the base.</b> A demand zone is the last consolidation before a strong move up. Mark the highest and lowest candles of that base.</p>
            <p><b className="text-[var(--mx-text)]">2. Note the departure.</b> The faster price left, the more unfilled interest may remain. Look for large-bodied candles leaving the zone.</p>
            <p><b className="text-[var(--mx-text)]">3. Rank by freshness.</b> First touches carry the most weight. Each retest consumes part of the remaining interest.</p>
          </div>
        </Card>
      )}

      {format === "downloads" && (
        <Card>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Downloads</p>
          <div data-testid="lesson-downloads">
            {[
              ["Zone-marking worksheet (PDF)", "1.2 MB"],
              ["Fresh vs tested checklist (PDF)", "0.4 MB"],
              ["EURUSD markup examples (ZIP)", "6.8 MB"],
            ].map(([name, size]) => (
              <button
                key={name}
                onClick={() => toast.success(`Downloading ${name} — simulated file.`, { description: "Concept only." })}
                className="flex w-full items-center gap-2 rounded-lg border border-[var(--mx-border)] px-3 py-2 text-left text-[12px] font-medium text-[var(--mx-text)] hover:bg-[var(--mx-hover)]"
              >
                <Download className="h-3.5 w-3.5 text-[var(--mx-accent)]" />
                <span className="flex-1">{name}</span>
                <span className="text-[10px] text-[var(--mx-faint)]">{size}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {format === "assignment" && (
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Assignment — mark 3 zones</p>
            <Button size="sm" className="bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]"
              onClick={() => toast.success("Assignment submitted for review.", { description: "Concept only — coach queue." })}>
              Submit assignment
            </Button>
          </div>
          <div data-testid="lesson-assignment">
            {["Mark the EURUSD 1H demand zone from this week's rally", "Label whether each zone is fresh or tested", "Write one line on where the stop belongs and why"].map((t, i) => (
              <label key={t} className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--mx-border)] px-3 py-2 text-[12px] font-medium text-[var(--mx-text)] has-checked:bg-[var(--mx-active-bg)]">
                <input
                  type="checkbox"
                  checked={assignChecks[i]}
                  onChange={() => setAssignChecks(assignChecks.map((v, j) => (j === i ? !v : v)))}
                  className="accent-[var(--mx-accent)]"
                />
                {t}
              </label>
            ))}
          </div>
        </Card>
      )}

      {format === "live" && (
        <Card>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Live session</p>
          <div className="rounded-xl border border-[var(--mx-active-border)] bg-[var(--mx-active-bg)] p-3" data-testid="lesson-live">
            <p className="text-[13px] font-bold text-[var(--mx-primary)]">Chart lab — Supply & Demand Q&A</p>
            <p className="mt-0.5 text-[11px] text-[var(--mx-muted)]">Next session: Friday 17:00 UTC · with Coach Dev · ~45 min</p>
            <Button size="sm" variant="outline" className="mt-2"
              onClick={() => toast.success("Reminder set — we'll ping you 15 minutes before.", { description: "Concept only." })}>
              <BellRing className="mr-1 h-3.5 w-3.5" /> Set reminder
            </Button>
          </div>
        </Card>
      )}

      {format === "ai" && (
        <Card>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">AI-guided walkthrough</p>
          <div className="rounded-xl border border-[var(--mx-border)] p-3" data-testid="lesson-ai">
            <p className="flex items-center gap-1.5 text-[13px] font-bold text-[var(--mx-text)]"><Sparkles className="h-4 w-4 text-[var(--mx-accent)]" /> Guided: mark your first demand zone</p>
            <p className="mt-1 text-[12px] text-[var(--mx-muted)]">The AI Guide walks you through the Four Filter on the practice chart, one prompt at a time.</p>
            <p className="mt-2 text-[11px] font-semibold text-[var(--mx-primary)]">→ Open the AI Guide in the Practice view right rail to begin.</p>
            <p className="mt-1 text-[10px] text-[var(--mx-faint)]">Educational guidance — not financial advice.</p>
          </div>
        </Card>
      )}

      {format === "interview" && (
        <Card>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Student interview</p>
          <div className="flex gap-3 rounded-xl border border-[var(--mx-border)] p-3" data-testid="lesson-interview">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--mx-active-bg)] text-[11px] font-bold text-[var(--mx-primary)]">JR</span>
            <div>
              <p className="text-[13px] font-bold text-[var(--mx-text)]">“How the Math filter changed my trading” — Jordan R., funded student</p>
              <p className="mt-0.5 text-[11px] text-[var(--mx-muted)]">12 min interview · on skipping B-grade setups and surviving drawdown.</p>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => toast.success("Interview queued — simulated media.", { description: "Concept only." })}>
                <Play className="mr-1 h-3.5 w-3.5" /> Watch interview
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export function QuizView() {
  const quiz = useMechanix((s) => s.quiz);
  const setQuiz = useMechanix((s) => s.setQuiz);
  const [picked, setPicked] = useState<number | null>(null);
  const q = QUIZ_QUESTIONS[quiz.index];

  if (quiz.finished) {
    return (
      <div className="flex h-full items-center justify-center p-6" data-testid="level-accepted">
        <Card className="max-w-md text-center">
          <PartyPopper className="mx-auto h-10 w-10 text-[var(--mx-accent)]" />
          <h1 className="mt-2 text-2xl font-bold text-[var(--mx-primary)]">Level Accepted!</h1>
          <p className="mt-2 text-[13px] text-[var(--mx-muted)]">
            You scored {quiz.score}/3. <b>Level 2 — Supply & Demand in practice</b> is now unlocked in your checklist.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button className="bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]" onClick={() => { setQuiz({ index: 0, score: 0, attempts: quiz.attempts + 1, finished: false, passed: false }); setPicked(null); }}>
              Retake quiz
            </Button>
            <Button variant="outline">Continue to Level 2</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl p-6" data-testid="view-quiz">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Scenario {quiz.index + 1} of {QUIZ_QUESTIONS.length}</p>
        <h1 className="mt-2 text-lg font-bold text-[var(--mx-text)]">{q.q}</h1>
        <div className="mt-3 space-y-2">
          {q.choices.map((c, i) => {
            const isPicked = picked === i;
            const show = picked !== null;
            return (
              <button
                key={c}
                onClick={() => picked === null && setPicked(i)}
                className={cn(
                  "w-full rounded-lg border p-2.5 text-left text-[13px] font-medium transition-colors",
                  show && i === q.correct ? "border-[var(--mx-accent)] bg-[var(--mx-active-bg)] text-[var(--mx-primary)]"
                  : show && isPicked ? "border-[var(--mx-down)] bg-red-50 text-[var(--mx-down)]"
                  : "border-[var(--mx-border)] text-[var(--mx-text)] hover:border-[var(--mx-active-border)]"
                )}
              >{c}</button>
            );
          })}
        </div>
        {picked !== null && (
          <div className="mt-3 animate-in fade-in slide-in-from-bottom-1 duration-200">
            <p className="rounded-lg bg-[var(--mx-bg)] p-2.5 text-[12px] text-[var(--mx-muted)]">{q.why}</p>
            <Button
              className="mt-3 w-full bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]"
              onClick={() => {
                const score = quiz.score + (picked === q.correct ? 1 : 0);
                const last = quiz.index === QUIZ_QUESTIONS.length - 1;
                setQuiz({ score, index: last ? quiz.index : quiz.index + 1, finished: last, passed: last ? score >= 2 : quiz.passed });
                setPicked(null);
              }}
            >{quiz.index === QUIZ_QUESTIONS.length - 1 ? "See result" : "Next scenario"}</Button>
          </div>
        )}
      </Card>
    </div>
  );
}

interface BankQuestion {
  id: string;
  text: string;
  tag: string;
  difficulty: "Easy" | "Med" | "Hard";
  hasExplanation: boolean;
  published: boolean;
}

const QUESTION_BANK: BankQuestion[] = [
  { id: "q1", text: "Price returns to a fresh 1H demand zone with trapped shorts. Highest-quality plan?", tag: "supply-demand", difficulty: "Med", hasExplanation: true, published: true },
  { id: "q2", text: "Your stop is 40 pips and the target only 50. What does the Math filter say?", tag: "risk", difficulty: "Easy", hasExplanation: true, published: true },
  { id: "q3", text: "What signals 'trapped participants' on the chart?", tag: "order-flow", difficulty: "Easy", hasExplanation: true, published: true },
  { id: "q4", text: "A tested zone prints a weak reaction. Do you downgrade it?", tag: "supply-demand", difficulty: "Med", hasExplanation: false, published: true },
  { id: "q5", text: "HTF supply sits directly above your demand entry. Re-score the setup.", tag: "scenarios", difficulty: "Hard", hasExplanation: true, published: false },
  { id: "q6", text: "When is a 'second-chance' entry still valid under the Four Filter?", tag: "scenarios", difficulty: "Hard", hasExplanation: false, published: false },
];

const DIFF_STYLE: Record<BankQuestion["difficulty"], string> = {
  Easy: "bg-[var(--mx-active-bg)] text-[var(--mx-primary)]",
  Med: "bg-amber-50 text-amber-700",
  Hard: "bg-red-50 text-[var(--mx-down)]",
};

export function QuizBuilderView() {
  const [choices, setChoices] = useState(["Wait for confirmation in the zone", "Enter immediately at market", "Short the zone", "Skip all zone trades"]);
  const [published, setPublished] = useState<Record<string, boolean>>(
    () => Object.fromEntries(QUESTION_BANK.map((q) => [q.id, q.published]))
  );
  return (
    <div className="grid gap-3 p-4 lg:grid-cols-[1fr_300px]" data-testid="view-quiz-builder">
      <Card className="lg:col-span-2">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Question bank — {QUESTION_BANK.length} questions</p>
        <div className="overflow-x-auto" data-testid="question-bank">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[var(--mx-border)] text-left text-[10px] uppercase tracking-wide text-[var(--mx-faint)]">
                <th className="py-1.5 pr-3">Question</th>
                <th className="px-2 py-1.5">Tag</th>
                <th className="px-2 py-1.5">Difficulty</th>
                <th className="px-2 py-1.5 text-center" title="Has explanation">Expl.</th>
                <th className="py-1.5 pl-2 text-right">Published</th>
              </tr>
            </thead>
            <tbody>
              {QUESTION_BANK.map((q) => (
                <tr key={q.id} className="border-b border-[var(--mx-bg)] last:border-0">
                  <td className="max-w-[380px] truncate py-2 pr-3 font-medium text-[var(--mx-text)]">{q.text}</td>
                  <td className="px-2 py-2"><span className="rounded-full bg-[var(--mx-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--mx-muted)]">#{q.tag}</span></td>
                  <td className="px-2 py-2"><span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", DIFF_STYLE[q.difficulty])}>{q.difficulty}</span></td>
                  <td className="px-2 py-2 text-center">
                    {q.hasExplanation
                      ? <FileText className="mx-auto h-3.5 w-3.5 text-[var(--mx-accent)]" aria-label="Has explanation" />
                      : <span className="text-[var(--mx-faint)]">—</span>}
                  </td>
                  <td className="py-2 pl-2 text-right">
                    <button
                      role="switch"
                      aria-checked={published[q.id]}
                      aria-label={`Publish ${q.id}`}
                      onClick={() => setPublished({ ...published, [q.id]: !published[q.id] })}
                      className={cn("h-5 w-9 rounded-full transition-colors", published[q.id] ? "bg-[var(--mx-accent)]" : "bg-[var(--mx-border)]")}
                    >
                      <span className={cn("block h-4 w-4 translate-x-0.5 rounded-full bg-[var(--mx-card)] transition-transform", published[q.id] && "translate-x-[18px]")} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Question editor</p>
        <input aria-label="Question" defaultValue="Price taps a fresh demand zone with trapped shorts below. Best action?"
          className="mt-2 w-full rounded-lg border border-[var(--mx-border)] px-3 py-2 text-[14px] font-semibold outline-none focus:ring-2 focus:ring-[var(--mx-accent)]/40" />
        <p className="mt-3 text-[11px] font-semibold uppercase text-[var(--mx-faint)]">Choices (mark the correct one)</p>
        {choices.map((c, i) => (
          <div key={i} className="mt-1.5 flex items-center gap-2">
            <input type="radio" name="correct" defaultChecked={i === 0} aria-label={`Choice ${i + 1} correct`} className="accent-[var(--mx-accent)]" />
            <input value={c} onChange={(e) => setChoices(choices.map((x, j) => (j === i ? e.target.value : x)))}
              aria-label={`Choice ${i + 1}`}
              className="flex-1 rounded-lg border border-[var(--mx-border)] px-3 py-1.5 text-[13px] outline-none focus:ring-2 focus:ring-[var(--mx-accent)]/40" />
          </div>
        ))}
        <Button size="sm" variant="outline" className="mt-2" onClick={() => setChoices([...choices, "New choice"])}><Plus className="mr-1 h-3.5 w-3.5" />Add choice</Button>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["supply-demand", "scenarios", "level-2"].map((t) => (
            <span key={t} className="rounded-full bg-[var(--mx-active-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--mx-primary)]">#{t}</span>
          ))}
        </div>
      </Card>
      <Card>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Learner preview</p>
        <div className="mt-2 rounded-lg border border-[var(--mx-border)] p-3">
          <p className="text-[13px] font-semibold text-[var(--mx-text)]">Price taps a fresh demand zone with trapped shorts below. Best action?</p>
          {choices.slice(0, 4).map((c, i) => (
            <p key={i} className="mt-1.5 rounded-md border border-[var(--mx-border)] px-2 py-1.5 text-[12px] text-[var(--mx-muted)]">{c}</p>
          ))}
        </div>
      </Card>
    </div>
  );
}

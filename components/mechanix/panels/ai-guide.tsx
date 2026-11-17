"use client";

import { useState } from "react";
import { CheckCircle2, Circle, ChevronDown, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMechanix } from "@/components/mechanix/workspace/store";

interface GuideStep {
  title: string;
  pass: boolean;
  detail: string;
  hint: string;
  why: string;
}

const RUBRIC: { match: RegExp; strength: string; followUp: string }[] = [
  { match: /zone|supply|demand/i, strength: "You anchored the idea to a zone.", followUp: "Which zone are you trading, and on which timeframe?" },
  { match: /fresh|first touch|tested/i, strength: "You considered zone freshness.", followUp: "Is the zone fresh or already tested? First touches carry more weight." },
  { match: /trap|failed breakout|fuel/i, strength: "You identified trapped participants.", followUp: "Who is trapped and where do their exits push price?" },
  { match: /risk|stop|\bsl\b|invalid|wrong/i, strength: "Risk and invalidation are defined.", followUp: "Where does the idea fail — what is your invalidation?" },
  { match: /r:?r|risk.?reward|target|\btp\b|1\s*:\s*2|2\s*:\s*1/i, strength: "The Math is quantified.", followUp: "What is the reward-to-risk to the opposing zone? (≥ 1:2 required.)" },
];

/**
 * AI Guide — a Four Filter stepper that reads live chart state (drawings,
 * positions) and produces rubric-style feedback on a written trade rationale.
 * Educational guidance only — not financial advice.
 */
export function AiGuidePanel() {
  const symbol = useMechanix((s) => s.symbol);
  const hasZone = useMechanix(
    (s) => (s.drawings[s.symbol] ?? []).some((d) => d.type === "zone" || d.type === "rect")
  );
  const hasPosDrawing = useMechanix(
    (s) => (s.drawings[s.symbol] ?? []).some((d) => d.type === "long" || d.type === "short")
  );
  const rrOk = useMechanix((s) =>
    s.positions.some(
      (p) =>
        p.symbol === s.symbol &&
        Math.abs(p.entry - p.sl) > 0 &&
        Math.abs(p.tp - p.entry) / Math.abs(p.entry - p.sl) >= 2
    )
  );
  const submitToCoach = useMechanix((s) => s.submitToCoach);
  const [explain, setExplain] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "strength" | "followup"; text: string }[] | null>(null);
  const [sent, setSent] = useState(false);

  const mathOk = hasPosDrawing || rrOk;

  const steps: GuideStep[] = [
    {
      title: "1 · Zone marked?",
      pass: hasZone,
      detail: hasZone ? `Zone/rectangle detected on ${symbol}` : `Mark a zone on ${symbol} first`,
      hint: "Select the zone tool on the drawing rail and click two corners over the base before the strong move.",
      why: "The zone is the location — everything else is judged relative to it.",
    },
    {
      title: "2 · Freshness",
      pass: hasZone,
      detail: hasZone ? "Check: is this the first touch since the move away?" : "Pending — needs a marked zone",
      hint: "Fresh = first return since departure. Each retest consumes unfilled interest; downgrade tested zones.",
      why: "Fresh zones carry the most residual interest — quality drops with every retest.",
    },
    {
      title: "3 · Trapped participants",
      pass: hasZone,
      detail: hasZone ? "Look for a failed breakout near the zone" : "Pending — needs a marked zone",
      hint: "A failed breakout that snaps back leaves breakout traders on the wrong side — their exits fuel your move.",
      why: "Trapped traders are the fuel. No fuel, no move.",
    },
    {
      title: "4 · The Math — RR ≥ 1:2",
      pass: mathOk,
      detail: mathOk
        ? hasPosDrawing
          ? "Long/short position drawing on chart"
          : "Open position RR ≥ 1:2"
        : "Draw a long/short tool or open a sim position with RR ≥ 1:2",
      hint: "Measure to the opposing zone. If reward is under twice the risk, the trade fails the Math filter — skip it.",
      why: "MechaniX requires at least 1:2 reward-to-risk before entry. It is what makes small wins survivable.",
    },
  ];

  const getFeedback = () => {
    const text = explain.trim();
    if (!text) {
      toast.error("Write a sentence or two about the trade first.");
      return;
    }
    setSent(false);
    setFeedback(
      RUBRIC.map((r) =>
        r.match.test(text)
          ? { kind: "strength" as const, text: `✓ ${r.strength}` }
          : { kind: "followup" as const, text: `? ${r.followUp}` }
      )
    );
  };

  const sendToCoach = () => {
    submitToCoach(explain.trim());
    setSent(true);
    toast.success("Sent to coach review queue.", { description: "Concept only — simulated submission." });
  };

  return (
    <div className="border-t border-[var(--mx-border)]" data-testid="ai-guide">
      <div className="flex items-center gap-1.5 border-b border-[var(--mx-border)] px-3 py-2">
        <Sparkles className="h-3.5 w-3.5 text-[var(--mx-primary)]" />
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--mx-faint)]">AI Guide — Four Filter</p>
      </div>
      <div className="space-y-2 p-3">
        {steps.map((s) => (
          <div key={s.title} className="rounded-lg border border-[var(--mx-border)] p-2">
            <div className="flex items-center gap-2 text-[12px] font-semibold">
              {s.pass
                ? <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--mx-accent)]" data-testid="guide-step-pass" />
                : <Circle className="h-4 w-4 shrink-0 text-[var(--mx-faint)]" />}
              <span className={s.pass ? "text-[var(--mx-text)]" : "text-[var(--mx-muted)]"}>{s.title}</span>
            </div>
            <p className="mt-0.5 pl-6 text-[10px] text-[var(--mx-faint)]">{s.detail}</p>
            <details className="mt-1 pl-6">
              <summary className="flex cursor-pointer items-center gap-1 text-[10px] font-semibold text-[var(--mx-primary)]">
                <ChevronDown className="h-3 w-3" /> Hint
              </summary>
              <p className="mt-1 text-[11px] leading-snug text-[var(--mx-muted)]">{s.hint}</p>
            </details>
            <p className="mt-1 pl-6 text-[10px] italic text-[var(--mx-faint)]">Why it matters: {s.why}</p>
          </div>
        ))}

        <div className="rounded-lg border border-[var(--mx-border)] p-2">
          <p className="text-[12px] font-semibold text-[var(--mx-text)]">Explain your trade</p>
          <textarea
            aria-label="Explain your trade"
            value={explain}
            onChange={(e) => { setExplain(e.target.value); setSent(false); }}
            rows={3}
            placeholder="e.g. Long from the fresh EURUSD demand zone; SL below the zone low, TP at the supply above — RR 1:2.4. Invalidated on a 1H close below…"
            className="mt-1 w-full rounded-lg border border-[var(--mx-border)] p-2 text-[12px] outline-none focus:ring-2 focus:ring-[var(--mx-accent)]/40"
          />
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            <Button size="sm" variant="outline" onClick={getFeedback}>Get feedback</Button>
            <Button
              size="sm"
              onClick={sendToCoach}
              disabled={!feedback || sent || !explain.trim()}
              className="bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]"
            >
              <Send className="mr-1 h-3.5 w-3.5" /> {sent ? "Sent" : "Send to coach"}
            </Button>
          </div>
          {feedback && (
            <div className="mt-2 space-y-1" data-testid="guide-feedback" aria-live="polite">
              {feedback.map((f) => (
                <p
                  key={f.text}
                  className={cn(
                    "rounded-md px-2 py-1 text-[11px] leading-snug",
                    f.kind === "strength" ? "bg-[var(--mx-active-bg)] text-[var(--mx-primary)]" : "bg-[var(--mx-bg)] text-[var(--mx-muted)]"
                  )}
                >
                  {f.text}
                </p>
              ))}
            </div>
          )}
        </div>

        <p className="rounded-lg bg-amber-50 px-2 py-1.5 text-center text-[10px] font-semibold text-amber-700">
          Educational guidance — not financial advice. Concept • simulated checks.
        </p>
      </div>
    </div>
  );
}

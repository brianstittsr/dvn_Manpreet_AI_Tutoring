"use client";

import { useState } from "react";
import { CheckCircle2, ClipboardCheck, MessageSquareReply, Send, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMechanix } from "@/components/mechanix/workspace/store";
import { Card, CardLabel, inputCls } from "./admin-views";

type ReviewStatus = "pending" | "approved" | "changes-requested";

interface ReviewRow {
  id: string;
  student: string;
  type: string;
  submitted: string;
  status: ReviewStatus;
}

const SEEDED_ROWS: ReviewRow[] = [
  { id: "rq1", student: "Alex R.", type: "Zone marking — EURUSD 1H", submitted: "2h ago", status: "pending" },
  { id: "rq2", student: "Dre W.", type: "Trade plan review — GBPUSD", submitted: "5h ago", status: "pending" },
  { id: "rq3", student: "Priya S.", type: "Quiz remediation — the Math", submitted: "1d ago", status: "changes-requested" },
  { id: "rq4", student: "Maya P.", type: "Zone marking — NQ 15m", submitted: "1d ago", status: "approved" },
];

const STATUS_STYLE: Record<ReviewStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-[var(--mx-active-bg)] text-[var(--mx-primary)]",
  "changes-requested": "bg-red-50 text-[var(--mx-down)]",
};

const STATUS_LABEL: Record<ReviewStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  "changes-requested": "Changes req.",
};

const FOLLOW_UP_TEMPLATES = [
  "Great zone marking — tighten your invalidation",
  "Re-do the RR math — see lesson 3.2",
  "Schedule a 1:1",
];

function nowTime(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function AdminReviewView() {
  const coachSubmissions = useMechanix((s) => s.coachSubmissions);
  const [overrides, setOverrides] = useState<Record<string, ReviewStatus>>({});
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [followUp, setFollowUp] = useState<ReviewRow | null>(null);
  const [fuNote, setFuNote] = useState("");
  const [fuLog, setFuLog] = useState<{ time: string; msg: string }[]>([
    { time: "09:31", msg: "Follow-up sent to Priya S. — re-do RR math" },
  ]);

  // Store submissions (assigned reviews / learner submits) precede seeded rows.
  const queue: ReviewRow[] = [
    ...coachSubmissions.map((s) => {
      const [student, ...rest] = s.text.split(" — ");
      return { id: s.id, student: student || "You", type: rest.join(" — ") || "Submission", submitted: s.time, status: "pending" as ReviewStatus };
    }),
    ...SEEDED_ROWS,
  ];
  const statusOf = (r: ReviewRow): ReviewStatus => overrides[r.id] ?? r.status;
  const pendingCount = queue.filter((r) => statusOf(r) === "pending").length;

  const approve = (r: ReviewRow) => {
    setOverrides((o) => ({ ...o, [r.id]: "approved" }));
    toast.success(`Approved — ${r.student}: ${r.type}`, { description: "Logged to review audit — concept only." });
  };
  const requestChanges = (r: ReviewRow) => {
    setOverrides((o) => ({ ...o, [r.id]: "changes-requested" }));
    setNoteFor(null);
    setNote("");
    toast.success(`Changes requested — ${r.student}`, { description: note.trim() ? `Note: ${note.trim()}` : "No note attached — concept only." });
  };
  const sendFollowUp = () => {
    if (!followUp) return;
    const msg = `Follow-up sent to ${followUp.student}${fuNote.trim() ? ` — ${fuNote.trim()}` : ""}`;
    setFuLog((l) => [{ time: nowTime(), msg }, ...l].slice(0, 12));
    toast.success(`Follow-up sent to ${followUp.student}`, { description: "Queued as a coach message — concept only." });
    setFollowUp(null);
    setFuNote("");
  };

  return (
    <div className="grid gap-3 p-4 lg:grid-cols-[1fr_300px]" data-testid="view-admin-review">
      <div className="space-y-3">
        {/* Class pulse */}
        <Card>
          <CardLabel>Class pulse — this week</CardLabel>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            {[
              [String(queue.length), "Submissions"],
              ["4.2h", "Avg turnaround"],
              [String(pendingCount + 1), "Need follow-up"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-lg bg-[var(--mx-bg)] py-2.5">
                <p className="text-lg font-bold tabular-nums text-[var(--mx-primary)]">{v}</p>
                <p className="text-[10px] text-[var(--mx-muted)]">{l}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Review queue */}
        <Card>
          <div className="flex items-center justify-between">
            <CardLabel>Review queue — {pendingCount} pending</CardLabel>
            <ClipboardCheck className="h-4 w-4 text-[var(--mx-faint)]" />
          </div>
          <div className="mt-2 overflow-x-auto" data-testid="review-queue">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[var(--mx-border)] text-left text-[10px] uppercase tracking-wide text-[var(--mx-faint)]">
                  <th className="py-1.5 pr-3">Student</th>
                  <th className="px-2 py-1.5">Type</th>
                  <th className="px-2 py-1.5">Submitted</th>
                  <th className="px-2 py-1.5">Status</th>
                  <th className="py-1.5 pl-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((r) => {
                  const st = statusOf(r);
                  return (
                    <tr key={r.id} data-testid={`review-row-${r.id}`} className="border-b border-[var(--mx-bg)] align-top last:border-0">
                      <td className="py-2 pr-3 font-semibold text-[var(--mx-text)]">{r.student}</td>
                      <td className="max-w-[240px] px-2 py-2 text-[var(--mx-muted)]">{r.type}</td>
                      <td className="px-2 py-2 text-[var(--mx-faint)]">{r.submitted}</td>
                      <td className="px-2 py-2"><span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", STATUS_STYLE[st])} data-testid={`status-${r.id}`}>{STATUS_LABEL[st]}</span></td>
                      <td className="py-2 pl-2">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="outline" disabled={st === "approved"} aria-label={`Approve ${r.student}`}
                            className="h-7 border-[var(--mx-border)] px-2 text-[11px] text-[var(--mx-primary)] hover:bg-[var(--mx-active-bg)] disabled:opacity-40"
                            onClick={() => approve(r)}>
                            <CheckCircle2 className="mr-1 h-3 w-3" />Approve
                          </Button>
                          <Button size="sm" variant="outline" disabled={st === "changes-requested"} aria-label={`Request changes ${r.student}`}
                            className="h-7 border-[var(--mx-border)] px-2 text-[11px] text-[var(--mx-text)] hover:bg-[var(--mx-hover)] disabled:opacity-40"
                            onClick={() => { setNoteFor(noteFor === r.id ? null : r.id); setNote(""); }}>
                            Changes
                          </Button>
                          <Button size="sm" variant="outline" aria-label={`Follow up ${r.student}`} data-testid={`followup-${r.id}`}
                            className="h-7 border-[var(--mx-border)] px-2 text-[11px] text-[var(--mx-text)] hover:bg-[var(--mx-hover)]"
                            onClick={() => { setFollowUp(r); setFuNote(""); }}>
                            <MessageSquareReply className="mr-1 h-3 w-3" />Follow up
                          </Button>
                        </div>
                        {noteFor === r.id && (
                          <div className="mt-1.5 flex justify-end gap-1" data-testid={`note-editor-${r.id}`}>
                            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="What needs fixing…" aria-label="Change request note"
                              className="w-56 rounded-lg border border-[var(--mx-border)] px-2.5 py-1.5 text-[12px] outline-none focus:ring-2 focus:ring-[var(--mx-accent)]/40" />
                            <Button size="sm" className="h-7 bg-[var(--mx-primary)] px-2 text-[11px] text-white hover:bg-[var(--mx-deep)]"
                              onClick={() => requestChanges(r)}>Send</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Follow-up log */}
        <Card>
          <CardLabel>Follow-up log</CardLabel>
          <div className="mt-1" data-testid="followup-log">
            {fuLog.map((l, i) => (
              <p key={`${l.time}-${i}`} className="border-b border-[var(--mx-bg)] py-1 font-mono text-[10px] text-[var(--mx-muted)] last:border-0">
                <span className="text-[var(--mx-faint)]">{l.time}</span> {l.msg}
              </p>
            ))}
          </div>
        </Card>
      </div>

      {/* Follow-up drawer — in-view column */}
      <Card data-testid="followup-drawer">
        {!followUp ? (
          <div className="flex h-full min-h-40 flex-col items-center justify-center gap-2 text-center">
            <MessageSquareReply className="h-6 w-6 text-[var(--mx-faint)]" />
            <p className="text-[12px] text-[var(--mx-muted)]">Pick “Follow up” on a queue row to message the learner.</p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[15px] font-bold text-[var(--mx-text)]">Follow up — {followUp.student}</p>
                <p className="text-[11px] text-[var(--mx-muted)]">{followUp.type} · {STATUS_LABEL[statusOf(followUp)]} · {followUp.submitted}</p>
              </div>
              <button aria-label="Close follow-up" onClick={() => setFollowUp(null)}
                className="rounded-md p-1 text-[var(--mx-faint)] hover:bg-[var(--mx-hover)]"><X className="h-4 w-4" /></button>
            </div>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Templates</p>
            <div className="mt-1.5 space-y-1.5">
              {FOLLOW_UP_TEMPLATES.map((t) => (
                <button key={t} onClick={() => setFuNote(t)}
                  className={cn("w-full rounded-lg border px-2.5 py-2 text-left text-[12px] font-medium transition-colors",
                    fuNote === t ? "border-[var(--mx-active-border)] bg-[var(--mx-active-bg)] text-[var(--mx-primary)]" : "border-[var(--mx-border)] text-[var(--mx-muted)] hover:bg-[var(--mx-hover)]")}>
                  {t}
                </button>
              ))}
            </div>
            <label className="mt-3 block">
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Custom note</span>
              <textarea value={fuNote} onChange={(e) => setFuNote(e.target.value)} rows={3} aria-label="Follow-up note"
                placeholder="Or write your own follow-up…" className={cn(inputCls, "resize-none")} />
            </label>
            <Button size="sm" className="mt-2 w-full bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]"
              onClick={sendFollowUp} data-testid="send-followup">
              <Send className="mr-1 h-3.5 w-3.5" /> Send follow-up
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}

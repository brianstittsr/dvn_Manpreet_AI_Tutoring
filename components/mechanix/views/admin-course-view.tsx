"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpenText, CheckCircle2, GraduationCap, ImageIcon, ListChecks, MessageSquareText,
  Play, Plus, RefreshCw, Trash2, UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardLabel, inputCls } from "./admin-views";

type LessonType = "video" | "reading" | "quiz";
type QuestionType = "mc" | "yesno" | "image" | "blank";
type Difficulty = "Easy" | "Med" | "Hard";

interface QuizQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  /** Options for multiple-choice and image questions (2–4). */
  options: string[];
  /** Correct option index for mc/image questions. */
  correctOption: number;
  /** Correct answer for yes/no questions. */
  correctYesNo: boolean;
  /** Comma-separated accepted answers for fill-in-the-blank. */
  answers: string;
  caseSensitive: boolean;
  explanation: string;
  difficulty: Difficulty;
  tags: string;
}

interface QuizSettings {
  chatMode: boolean;
  spaced: boolean;
  retakeInterval: "1d" | "3d" | "7d";
  mastery: number;
  maxAttempts: number;
}

interface Lesson {
  id: string;
  module: string;
  title: string;
  type: LessonType;
  url: string;
  body: string;
  questions: QuizQuestion[];
  settings: QuizSettings;
}

const DEFAULT_SETTINGS: QuizSettings = { chatMode: true, spaced: true, retakeInterval: "3d", mastery: 80, maxAttempts: 3 };

let qCounter = 100;
function newQuestion(type: QuestionType = "mc"): QuizQuestion {
  return {
    id: `qq-${++qCounter}`,
    type,
    prompt: type === "blank" ? "Fill in the blank…" : "New question…",
    options: ["Option A", "Option B"],
    correctOption: 0,
    correctYesNo: true,
    answers: "",
    caseSensitive: false,
    explanation: "",
    difficulty: "Med",
    tags: "",
  };
}

const SEED_LESSONS: Lesson[] = [
  { id: "l1", module: "Market structure", title: "Reading market structure", type: "video", url: "", body: "", questions: [], settings: { ...DEFAULT_SETTINGS } },
  { id: "l2", module: "Market structure", title: "Swings & BOS worksheet", type: "reading", url: "", body: "A break of structure needs a body close beyond the swing — wicks don't count…", questions: [], settings: { ...DEFAULT_SETTINGS } },
  {
    id: "l3", module: "Market structure", title: "Structure check", type: "quiz", url: "", body: "",
    settings: { ...DEFAULT_SETTINGS },
    questions: [
      {
        id: "q-sc1", type: "mc", prompt: "What confirms a break of structure?",
        options: ["A wick past the high", "A body close beyond the swing", "A gap on the open"], correctOption: 1,
        correctYesNo: true, answers: "", caseSensitive: false,
        explanation: "Only a closing body beyond the swing confirms the break — wicks are just probes.", difficulty: "Med", tags: "structure,bos",
      },
      {
        id: "q-sc2", type: "image", prompt: "Which markup shows a valid fresh demand zone?",
        options: ["Zone A — untested since departure", "Zone B — touched twice already"], correctOption: 0,
        correctYesNo: true, answers: "", caseSensitive: false,
        explanation: "Fresh zones are untouched since the departure leg — each retest consumes interest.", difficulty: "Hard", tags: "zones,freshness",
      },
    ],
  },
  { id: "l4", module: "Supply & Demand", title: "Marking fresh zones", type: "video", url: "", body: "", questions: [], settings: { ...DEFAULT_SETTINGS } },
  { id: "l5", module: "Supply & Demand", title: "Fresh vs tested zones", type: "reading", url: "", body: "Rank zones by freshness — first touches carry the most weight…", questions: [], settings: { ...DEFAULT_SETTINGS } },
  {
    id: "l6", module: "Supply & Demand", title: "Zone quality quiz", type: "quiz", url: "", body: "",
    settings: { ...DEFAULT_SETTINGS, retakeInterval: "3d", mastery: 80 },
    questions: [
      {
        id: "q-z1", type: "mc", prompt: "Price returns to a fresh 1H demand zone. Highest-quality plan?",
        options: ["Enter immediately at market", "Wait for a bullish reaction inside the zone, SL below", "Short the zone"], correctOption: 1,
        correctYesNo: true, answers: "", caseSensitive: false,
        explanation: "A zone alone isn't an entry — confirmation plus defined risk.", difficulty: "Med", tags: "supply-demand",
      },
      {
        id: "q-z2", type: "yesno", prompt: "A zone touched twice already is still considered 'fresh'.",
        options: [], correctOption: 0, correctYesNo: false, answers: "", caseSensitive: false,
        explanation: "Fresh means untouched since formation — two touches means it's tested.", difficulty: "Easy", tags: "freshness",
      },
      {
        id: "q-z3", type: "blank", prompt: "The Math filter requires reward-to-risk of at least 1:__.",
        options: [], correctOption: 0, correctYesNo: true, answers: "2", caseSensitive: false,
        explanation: "MechaniX requires ≥ 1:2 reward-to-risk before entry.", difficulty: "Easy", tags: "risk,math",
      },
    ],
  },
];

const LESSON_META: Record<LessonType, { label: string; icon: typeof Play }> = {
  video: { label: "Video", icon: Play },
  reading: { label: "Reading", icon: BookOpenText },
  quiz: { label: "Quiz", icon: GraduationCap },
};

const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  mc: "Multiple choice",
  yesno: "Yes-No",
  image: "Image question",
  blank: "Fill in the blank",
};

const DIFF_STYLE: Record<Difficulty, string> = {
  Easy: "bg-[var(--mx-active-bg)] text-[var(--mx-primary)]",
  Med: "bg-amber-50 text-amber-700",
  Hard: "bg-red-50 text-[var(--mx-down)]",
};

function Toggle({ on, onClick, label, testid }: { on: boolean; onClick: () => void; label: string; testid?: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} data-testid={testid} onClick={onClick}
      className={cn("h-5 w-9 shrink-0 rounded-full transition-colors", on ? "bg-[var(--mx-accent)]" : "bg-slate-300")}>
      <span className={cn("block h-4 w-4 translate-x-0.5 rounded-full bg-[var(--mx-card)] transition-transform", on && "translate-x-[18px]")} />
    </button>
  );
}

/* ------------------------------ chat preview ------------------------------ */

type ChatItem =
  | { kind: "bot"; qid: string }
  | { kind: "user"; text: string }
  | { kind: "correct"; text: string }
  | { kind: "retry"; text: string }
  | { kind: "end" };

function blankCorrect(q: QuizQuestion, input: string): boolean {
  const norm = (v: string) => (q.caseSensitive ? v.trim() : v.trim().toLowerCase());
  const accepted = q.answers.split(",").map((a) => a.trim()).filter(Boolean);
  return accepted.some((a) => norm(a) === norm(input));
}

function ChatPreview({ lesson }: { lesson: Lesson }) {
  const { questions, settings } = lesson;
  // Reset when the question set shape changes (ids/types), not on text edits.
  const resetKey = useMemo(() => `${lesson.id}|${questions.map((q) => `${q.id}:${q.type}`).join(",")}`, [lesson.id, questions]);
  const [items, setItems] = useState<ChatItem[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [text, setText] = useState("");

  useEffect(() => {
    setItems(questions.length ? [{ kind: "bot", qid: questions[0].id }] : []);
    setQIdx(0);
    setAnswered(0);
    setText("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const current = questions[qIdx];
  const done = answered >= questions.length && questions.length > 0;

  const recordAnswer = (answerText: string, correct: boolean) => {
    if (!current || done) return;
    const next: ChatItem[] = [{ kind: "user", text: answerText }];
    if (correct) {
      next.push({ kind: "correct", text: current.explanation || "Correct." });
      const nIdx = qIdx + 1;
      if (nIdx < questions.length) next.push({ kind: "bot", qid: questions[nIdx].id });
      else next.push({ kind: "end" });
      setAnswered(answered + 1);
      setQIdx(nIdx);
    } else {
      next.push({ kind: "retry", text: "Not quite — try again. Re-check the lesson hint." });
    }
    setItems((it) => [...it, ...next]);
  };

  const submitBlank = () => {
    if (!text.trim() || !current) return;
    recordAnswer(text.trim(), blankCorrect(current, text));
    setText("");
  };

  const botText = (qid: string) => questions.find((q) => q.id === qid)?.prompt ?? "(question removed)";

  return (
    <Card className="flex min-h-[420px] flex-col" data-testid="chat-preview">
      <div className="flex items-center justify-between">
        <CardLabel>Live preview — chat mode</CardLabel>
        <Button size="sm" variant="outline" aria-label="Restart preview"
          className="h-7 border-[var(--mx-border)] px-2 text-[11px] text-[var(--mx-text)] hover:bg-[var(--mx-hover)]"
          onClick={() => { setItems(questions.length ? [{ kind: "bot", qid: questions[0].id }] : []); setQIdx(0); setAnswered(0); setText(""); }}>
          <RefreshCw className="mr-1 h-3 w-3" />Restart
        </Button>
      </div>
      {!settings.chatMode && (
        <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700">
          Interactive chat mode is off — enable it in quiz settings to deliver this as chat Q&amp;A.
        </p>
      )}
      <div className="mt-2 min-h-0 flex-1 space-y-2 overflow-y-auto rounded-lg border border-[var(--mx-border)] bg-[var(--mx-bg)] p-2.5" aria-live="polite">
        {questions.length === 0 && <p className="py-6 text-center text-[12px] text-[var(--mx-faint)]">No questions yet — add one in the editor.</p>}
        {items.map((it, i) => {
          if (it.kind === "bot") {
            const q = questions.find((x) => x.id === it.qid);
            return (
              <div key={i} className="max-w-[88%] rounded-xl rounded-bl-sm bg-[var(--mx-card)] px-3 py-2 text-[12px] text-[var(--mx-text)] shadow-sm">
                <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--mx-faint)]">Quiz bot</p>
                {q?.type === "image" && (
                  <span className="mb-1.5 flex h-14 items-center justify-center gap-1.5 rounded-md border border-dashed border-[var(--mx-active-border)] bg-[var(--mx-active-bg)] text-[10px] font-semibold text-[var(--mx-primary)]">
                    <ImageIcon className="h-3.5 w-3.5" /> chart image · {q.tags || "no alt"}
                  </span>
                )}
                {botText(it.qid)}
              </div>
            );
          }
          if (it.kind === "user") {
            return <div key={i} className="ml-auto max-w-[80%] rounded-xl rounded-br-sm bg-[var(--mx-primary)] px-3 py-2 text-[12px] text-white">{it.text}</div>;
          }
          if (it.kind === "correct") {
            return (
              <div key={i} className="flex max-w-[88%] items-start gap-1.5 rounded-xl rounded-bl-sm border border-[var(--mx-active-border)] bg-[var(--mx-active-bg)] px-3 py-2 text-[12px] text-[var(--mx-primary)]">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> <span><b>Correct.</b> {it.text}</span>
              </div>
            );
          }
          if (it.kind === "retry") {
            return <div key={i} className="max-w-[88%] rounded-xl rounded-bl-sm bg-amber-50 px-3 py-2 text-[12px] text-amber-800">{it.text}</div>;
          }
          return (
            <div key={i} className="max-w-[92%] rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] px-3 py-2 text-[12px]" data-testid="chat-end">
              <p className="font-bold text-[var(--mx-text)]">Quiz complete — {answered}/{questions.length} correct.</p>
              {settings.spaced && (
                <p className="mt-1 rounded-md bg-[var(--mx-active-bg)] px-2 py-1 text-[11px] font-semibold text-[var(--mx-primary)]">
                  Review again in {settings.retakeInterval} · mastery ≥ {settings.mastery}%
                </p>
              )}
              {!settings.spaced && <p className="mt-1 text-[11px] text-[var(--mx-faint)]">Spaced repetition off — no re-surface scheduled.</p>}
            </div>
          );
        })}
      </div>
      {/* Learner answer input */}
      {current && !done && (
        <div className="mt-2" data-testid="chat-input">
          {(current.type === "mc" || current.type === "image") && (
            <div className="space-y-1">
              {current.options.map((o, i) => (
                <button key={i} onClick={() => recordAnswer(o, i === current.correctOption)}
                  className="w-full rounded-lg border border-[var(--mx-border)] bg-[var(--mx-card)] px-3 py-1.5 text-left text-[12px] font-medium text-[var(--mx-text)] hover:border-[var(--mx-active-border)] hover:bg-[var(--mx-active-bg)]">
                  {o}
                </button>
              ))}
            </div>
          )}
          {current.type === "yesno" && (
            <div className="grid grid-cols-2 gap-1.5">
              {[true, false].map((v) => (
                <button key={String(v)} onClick={() => recordAnswer(v ? "Yes" : "No", v === current.correctYesNo)}
                  className="rounded-lg border border-[var(--mx-border)] bg-[var(--mx-card)] px-3 py-1.5 text-[12px] font-bold text-[var(--mx-text)] hover:border-[var(--mx-active-border)] hover:bg-[var(--mx-active-bg)]">
                  {v ? "Yes" : "No"}
                </button>
              ))}
            </div>
          )}
          {current.type === "blank" && (
            <div className="flex gap-1.5">
              <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitBlank()}
                aria-label="Fill in the blank answer" placeholder="Type the missing word…" className={cn(inputCls, "py-1.5 text-[12px]")} />
              <Button size="sm" className="bg-[var(--mx-primary)] text-white hover:bg-[var(--mx-deep)]" onClick={submitBlank}>Send</Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

/* ------------------------------ question editor ------------------------------ */

function QuestionEditor({ q, onChange, onRemove }: { q: QuizQuestion; onChange: (patch: Partial<QuizQuestion>) => void; onRemove: () => void }) {
  const setOption = (i: number, v: string) => onChange({ options: q.options.map((o, j) => (j === i ? v : o)) });
  const usesOptions = q.type === "mc" || q.type === "image";
  return (
    <div className="rounded-xl border border-[var(--mx-border)] p-3" data-testid={`question-${q.id}`}>
      <div className="flex items-center gap-2">
        <select value={q.type} onChange={(e) => onChange({ type: e.target.value as QuestionType })} aria-label="Question type" data-testid="q-type"
          className={cn(inputCls, "w-40 py-1.5 text-[12px]")}>
          {(Object.keys(QUESTION_TYPE_LABEL) as QuestionType[]).map((t) => <option key={t} value={t}>{QUESTION_TYPE_LABEL[t]}</option>)}
        </select>
        <div className="flex gap-1">
          {(["Easy", "Med", "Hard"] as Difficulty[]).map((d) => (
            <button key={d} onClick={() => onChange({ difficulty: d })} aria-pressed={q.difficulty === d}
              className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", q.difficulty === d ? DIFF_STYLE[d] : "bg-[var(--mx-bg)] text-[var(--mx-faint)]")}>
              {d}
            </button>
          ))}
        </div>
        <button aria-label="Remove question" onClick={onRemove} data-testid="q-remove"
          className="ml-auto rounded-md p-1 text-[var(--mx-faint)] hover:bg-[var(--mx-hover)] hover:text-[var(--mx-down)]"><Trash2 className="h-4 w-4" /></button>
      </div>

      <input value={q.prompt} onChange={(e) => onChange({ prompt: e.target.value })} aria-label="Question prompt" placeholder="Question prompt…"
        className={cn(inputCls, "mt-2 py-1.5 text-[13px] font-semibold")} />

      {usesOptions && (
        <div className="mt-2 space-y-1">
          {q.type === "image" && (
            <div className="mb-2 flex items-center gap-2">
              <span className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--mx-active-border)] bg-[var(--mx-bg)] px-2 py-3 text-[11px] font-semibold text-[var(--mx-muted)]">
                <ImageIcon className="h-3.5 w-3.5" /> Drop image or click to upload — simulated
              </span>
              <input value={q.tags} onChange={(e) => onChange({ tags: e.target.value })} aria-label="Image alt text" placeholder="Alt text / tags"
                className={cn(inputCls, "w-40 py-1.5 text-[11px]")} />
            </div>
          )}
          {q.options.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" name={`correct-${q.id}`} checked={q.correctOption === i} onChange={() => onChange({ correctOption: i })}
                aria-label={`Option ${i + 1} correct`} className="accent-[var(--mx-accent)]" />
              <input value={o} onChange={(e) => setOption(i, e.target.value)} aria-label={`Option ${i + 1}`}
                className={cn(inputCls, "py-1 text-[12px]")} />
              {q.options.length > 2 && (
                <button aria-label={`Remove option ${i + 1}`} onClick={() => onChange({ options: q.options.filter((_, j) => j !== i), correctOption: q.correctOption >= i ? Math.max(0, q.correctOption - 1) : q.correctOption })}
                  className="rounded p-0.5 text-[var(--mx-faint)] hover:text-[var(--mx-down)]"><Trash2 className="h-3 w-3" /></button>
              )}
            </div>
          ))}
          {q.options.length < 4 && (
            <Button size="sm" variant="outline" className="h-7 border-[var(--mx-border)] px-2 text-[11px]" onClick={() => onChange({ options: [...q.options, `Option ${String.fromCharCode(65 + q.options.length)}`] })}>
              <Plus className="mr-1 h-3 w-3" />Add option
            </Button>
          )}
        </div>
      )}

      {q.type === "yesno" && (
        <div className="mt-2 flex items-center gap-3 rounded-lg bg-[var(--mx-bg)] px-2.5 py-2">
          <span className="text-[11px] font-semibold text-[var(--mx-muted)]">Correct answer:</span>
          {([["Yes", true], ["No", false]] as const).map(([lbl, v]) => (
            <label key={lbl} className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--mx-text)]">
              <input type="radio" name={`yn-${q.id}`} checked={q.correctYesNo === v} onChange={() => onChange({ correctYesNo: v })} className="accent-[var(--mx-accent)]" />{lbl}
            </label>
          ))}
        </div>
      )}

      {q.type === "blank" && (
        <div className="mt-2 space-y-1.5">
          <input value={q.answers} onChange={(e) => onChange({ answers: e.target.value })} aria-label="Accepted answers"
            placeholder="Accepted answers, comma separated" className={cn(inputCls, "py-1.5 text-[12px]")} />
          <label className="flex items-center gap-2 text-[11px] text-[var(--mx-muted)]">
            <input type="checkbox" checked={q.caseSensitive} onChange={(e) => onChange({ caseSensitive: e.target.checked })} className="accent-[var(--mx-accent)]" />
            Case-sensitive matching
          </label>
        </div>
      )}

      <input value={q.explanation} onChange={(e) => onChange({ explanation: e.target.value })} aria-label="Explanation" placeholder="Explanation shown after answering…"
        className={cn(inputCls, "mt-2 py-1.5 text-[12px]")} />
      {q.type !== "image" && (
        <input value={q.tags} onChange={(e) => onChange({ tags: e.target.value })} aria-label="Tags" placeholder="Tags, comma separated"
          className={cn(inputCls, "mt-1.5 py-1 text-[11px]")} />
      )}
    </div>
  );
}

/* --------------------------------- view --------------------------------- */

export function AdminCourseView() {
  const [lessons, setLessons] = useState<Lesson[]>(SEED_LESSONS);
  const [selId, setSelId] = useState("l6");
  const lesson = lessons.find((l) => l.id === selId) ?? lessons[0];

  const patchLesson = (patch: Partial<Lesson>) =>
    setLessons((ls) => ls.map((l) => (l.id === lesson.id ? { ...l, ...patch } : l)));
  const patchQuestion = (qid: string, patch: Partial<QuizQuestion>) =>
    patchLesson({ questions: lesson.questions.map((q) => (q.id === qid ? { ...q, ...patch } : q)) });
  const patchSettings = (patch: Partial<QuizSettings>) =>
    patchLesson({ settings: { ...lesson.settings, ...patch } });

  const modules = useMemo(() => {
    const map = new Map<string, Lesson[]>();
    for (const l of lessons) {
      const arr = map.get(l.module) ?? [];
      arr.push(l);
      map.set(l.module, arr);
    }
    return [...map.entries()];
  }, [lessons]);

  return (
    <div className="grid gap-3 p-4 xl:grid-cols-[230px_minmax(0,1fr)_320px]" data-testid="view-admin-course">
      {/* Module / lesson tree */}
      <Card>
        <CardLabel>Course — Foundations</CardLabel>
        {modules.map(([mod, ls]) => (
          <div key={mod} className="mt-2">
            <p className="flex items-center gap-1.5 px-1 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--mx-muted)]">
              <ListChecks className="h-3 w-3" />{mod}
            </p>
            {ls.map((l) => {
              const Icon = LESSON_META[l.type].icon;
              return (
                <button key={l.id} onClick={() => setSelId(l.id)} data-testid={`lesson-${l.id}`}
                  className={cn("flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] font-medium transition-colors",
                    l.id === lesson.id ? "bg-[var(--mx-active-bg)] font-semibold text-[var(--mx-primary)]" : "text-[var(--mx-muted)] hover:bg-[var(--mx-hover)]")}>
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{l.title}</span>
                  {l.type === "quiz" && <span className="ml-auto rounded-full bg-[var(--mx-bg)] px-1.5 text-[9px] font-bold text-[var(--mx-faint)]">{l.questions.length}</span>}
                </button>
              );
            })}
          </div>
        ))}
        <Button size="sm" variant="outline" className="mt-3 w-full border-[var(--mx-border)] text-[var(--mx-text)] hover:bg-[var(--mx-hover)]"
          onClick={() => toast.success("Lesson added — simulated.", { description: "Concept only." })}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Add lesson
        </Button>
      </Card>

      {/* Lesson editor */}
      <div className="min-w-0 space-y-3">
        <Card>
          <CardLabel>Lesson editor</CardLabel>
          <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_190px]">
            <input value={lesson.title} onChange={(e) => patchLesson({ title: e.target.value })} aria-label="Lesson title"
              className={cn(inputCls, "py-1.5 text-[14px] font-bold")} />
            <select value={lesson.type} onChange={(e) => patchLesson({ type: e.target.value as LessonType })} aria-label="Lesson type" data-testid="lesson-type"
              className={cn(inputCls, "py-1.5 text-[12px]")}>
              <option value="video">Video</option>
              <option value="reading">Reading assignment</option>
              <option value="quiz">Quiz block</option>
            </select>
          </div>

          {lesson.type === "video" && (
            <div className="mt-3" data-testid="video-fields">
              <span className="flex h-24 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[var(--mx-active-border)] bg-[var(--mx-bg)] text-[12px] font-semibold text-[var(--mx-muted)]">
                <UploadCloud className="h-5 w-5 text-[var(--mx-accent)]" />
                Drop video or click to upload — simulated
              </span>
              <input value={lesson.url} onChange={(e) => patchLesson({ url: e.target.value })} aria-label="Video URL"
                placeholder="…or paste a video URL" className={cn(inputCls, "mt-2 py-1.5 text-[12px]")} />
            </div>
          )}

          {lesson.type === "reading" && (
            <textarea value={lesson.body} onChange={(e) => patchLesson({ body: e.target.value })} rows={6} aria-label="Reading body" data-testid="reading-body"
              placeholder="Write the reading assignment…" className={cn(inputCls, "mt-3 resize-y text-[12px] leading-relaxed")} />
          )}

          {lesson.type === "quiz" && (
            <div className="mt-3 space-y-2" data-testid="quiz-editor">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Questions — {lesson.questions.length}</p>
                <Button size="sm" variant="outline" className="h-7 border-[var(--mx-border)] px-2 text-[11px] text-[var(--mx-text)] hover:bg-[var(--mx-hover)]"
                  data-testid="add-question" onClick={() => patchLesson({ questions: [...lesson.questions, newQuestion("blank")] })}>
                  <Plus className="mr-1 h-3 w-3" /> Add question
                </Button>
              </div>
              {lesson.questions.map((q) => (
                <QuestionEditor key={q.id} q={q} onChange={(p) => patchQuestion(q.id, p)}
                  onRemove={() => patchLesson({ questions: lesson.questions.filter((x) => x.id !== q.id) })} />
              ))}
            </div>
          )}
        </Card>

        {lesson.type === "quiz" && (
          <Card data-testid="quiz-settings">
            <CardLabel>Quiz settings</CardLabel>
            <div className="mt-2 flex items-center justify-between rounded-lg border border-[var(--mx-border)] px-2.5 py-2">
              <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--mx-text)]">
                <MessageSquareText className="h-3.5 w-3.5 text-[var(--mx-accent)]" /> Interactive chat mode
              </span>
              <Toggle on={lesson.settings.chatMode} onClick={() => patchSettings({ chatMode: !lesson.settings.chatMode })} label="Interactive chat mode" testid="chat-mode-toggle" />
            </div>
            <div className="mt-2 flex items-center justify-between rounded-lg border border-[var(--mx-border)] px-2.5 py-2">
              <span className="text-[12px] font-semibold text-[var(--mx-text)]">Spaced repetition</span>
              <Toggle on={lesson.settings.spaced} onClick={() => patchSettings({ spaced: !lesson.settings.spaced })} label="Spaced repetition" testid="spaced-toggle" />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Retake interval</span>
                <select value={lesson.settings.retakeInterval} onChange={(e) => patchSettings({ retakeInterval: e.target.value as QuizSettings["retakeInterval"] })}
                  className={cn(inputCls, "py-1.5 text-[12px]")} disabled={!lesson.settings.spaced}>
                  <option value="1d">Every 1 day</option>
                  <option value="3d">Every 3 days</option>
                  <option value="7d">Every 7 days</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[var(--mx-faint)]">Max attempts</span>
                <input type="number" min={1} max={9} value={lesson.settings.maxAttempts} aria-label="Max attempts"
                  onChange={(e) => patchSettings({ maxAttempts: Math.max(1, Math.min(9, Number(e.target.value) || 1)) })}
                  className={cn(inputCls, "py-1.5 text-[12px]")} />
              </label>
            </div>
            <label className="mt-2 block">
              <span className="mb-1 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-[var(--mx-faint)]">
                <span>Mastery threshold</span><span className="tabular-nums text-[var(--mx-primary)]">{lesson.settings.mastery}%</span>
              </span>
              <input type="range" min={50} max={100} step={5} value={lesson.settings.mastery} aria-label="Mastery threshold"
                onChange={(e) => patchSettings({ mastery: Number(e.target.value) })} className="w-full accent-[var(--mx-accent)]" />
            </label>
          </Card>
        )}
      </div>

      {/* Live preview */}
      <div className="min-w-0">
        {lesson.type === "quiz" ? (
          <ChatPreview lesson={lesson} />
        ) : (
          <Card className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <MessageSquareText className="h-6 w-6 text-[var(--mx-faint)]" />
            <p className="mt-2 text-[12px] text-[var(--mx-muted)]">Chat-mode preview appears for quiz lessons.<br />Select a quiz block from the tree.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

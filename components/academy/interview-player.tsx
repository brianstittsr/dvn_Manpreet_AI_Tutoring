"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { auth } from "@/lib/firebase";
import type { LearnerProfileData } from "@/types/academy";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Heart,
  Lightbulb,
  Loader2,
  MessagesSquare,
  Send,
  ShieldAlert,
  Sparkles,
  Star,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface InterviewTurn {
  role: "interviewer" | "learner";
  content: string;
}

interface InterviewClientState {
  sessionId: string;
  status: string;
  turns: InterviewTurn[];
  turnCount: number;
  maxTurns: number;
  consentStatus: string;
  profile: LearnerProfileData | null;
}

interface ApiResponse {
  data?: InterviewClientState;
  error?: string;
}

async function callInterviewApi(body: unknown): Promise<InterviewClientState> {
  const token = await auth?.currentUser?.getIdToken();
  if (!token) {
    throw new Error("Please sign in again to continue.");
  }

  const response = await fetch("/api/ai/student-interview", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => null)) as ApiResponse | null;
  if (!response.ok || !payload?.data) {
    throw new Error(payload?.error || "Unable to continue the interview.");
  }
  return payload.data;
}

export function StudentInterviewPlayer({
  lessonId,
  courseId,
  onCompleted,
}: {
  lessonId: string;
  courseId: string;
  onCompleted?: () => void;
}) {
  const [state, setState] = useState<InterviewClientState | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [draft, setDraft] = useState("");
  const startedRef = useRef(false);
  const completedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    callInterviewApi({ action: "start", lessonId, courseId })
      .then(setState)
      .catch((error: unknown) => {
        console.error("Unable to start interview:", error);
        toast.error(error instanceof Error ? error.message : "Unable to start the interview");
      })
      .finally(() => setLoading(false));
  }, [courseId, lessonId]);

  useEffect(() => {
    if (state?.status === "completed" && !completedRef.current) {
      completedRef.current = true;
      onCompleted?.();
    }
  }, [onCompleted, state?.status]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [state?.turns.length]);

  const send = useCallback(async () => {
    const message = draft.trim();
    if (!message || !state || submitting) return;
    setSubmitting(true);
    try {
      const next = await callInterviewApi({
        action: "respond",
        sessionId: state.sessionId,
        message,
      });
      setState(next);
      setDraft("");
    } catch (error) {
      console.error("Interview reply failed:", error);
      toast.error(error instanceof Error ? error.message : "Something went wrong — try again");
    } finally {
      setSubmitting(false);
    }
  }, [draft, state, submitting]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!state) {
    return (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Couldn&apos;t start the interview</AlertTitle>
        <AlertDescription>Please refresh the page and try again.</AlertDescription>
      </Alert>
    );
  }

  if (state.status === "consent_required") {
    return (
      <Alert>
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>A grown-up needs to say it&apos;s okay first</AlertTitle>
        <AlertDescription>
          This chat asks you a few questions about how you like to learn. A parent or guardian needs
          to approve it before you can start.
        </AlertDescription>
      </Alert>
    );
  }

  if (state.status === "paused_safety") {
    return (
      <Alert>
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Let&apos;s take a break</AlertTitle>
        <AlertDescription>
          This chat has been paused. If something is bothering you, please talk with a trusted
          grown-up — a parent, teacher, or counselor.
        </AlertDescription>
      </Alert>
    );
  }

  const completed = state.status === "completed";
  const profile = state.profile;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessagesSquare className="h-4 w-4" />
          <span>
            {completed
              ? "Interview complete"
              : `Question time — about ${Math.max(state.maxTurns - state.turnCount, 1)} to go`}
          </span>
        </div>
        {completed && (
          <Badge className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Done
          </Badge>
        )}
      </div>

      <ScrollArea className="h-[420px] rounded-lg border bg-muted/30 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {state.turns.map((turn, i) => (
            <div
              key={i}
              className={cn("flex", turn.role === "learner" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                  turn.role === "learner"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-card border rounded-bl-sm"
                )}
              >
                {turn.role === "interviewer" && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-1">
                    <Sparkles className="h-3 w-3" />
                    Your coach
                  </div>
                )}
                <div className={cn("prose prose-sm max-w-none", turn.role === "learner" && "prose-invert")}>
                  <ReactMarkdown>{turn.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {submitting && (
            <div className="flex justify-start">
              <div className="bg-card border rounded-2xl rounded-bl-sm px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {!completed && (
        <div className="flex gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type your answer…"
            rows={2}
            className="resize-none"
            disabled={submitting}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <Button onClick={send} disabled={submitting || !draft.trim()} className="self-end">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {completed && profile && (
        <div className="rounded-lg border bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-5 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Heart className="h-4 w-4 text-pink-500" />
            Here&apos;s what I learned about you
          </h3>
          <div className="space-y-2 text-sm">
            {profile.learningStyles.length > 0 && (
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p>
                  <span className="font-medium">You learn best by:</span>{" "}
                  {profile.learningStyles.join(", ")}
                </p>
              </div>
            )}
            {profile.motivators.length > 0 && (
              <div className="flex items-start gap-2">
                <Star className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                <p>
                  <span className="font-medium">What keeps you going:</span>{" "}
                  {profile.motivators.join(", ")}
                </p>
              </div>
            )}
            {profile.interests.length > 0 && (
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                <p>
                  <span className="font-medium">Things you love:</span>{" "}
                  {profile.interests.join(", ")}
                </p>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Your coach will use this to make your lessons feel just right for you.
          </p>
        </div>
      )}
    </div>
  );
}

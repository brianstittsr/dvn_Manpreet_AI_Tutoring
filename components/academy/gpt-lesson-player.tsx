"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { auth } from "@/lib/firebase";
import type { GPTLessonClientState, GPTLessonRequest } from "@/lib/gpt-lesson-types";
import type { GPTLessonStage } from "@/types/academy";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Circle,
  Clock,
  Lightbulb,
  Loader2,
  Lock,
  Send,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

const STAGE_LABELS: Record<GPTLessonStage, string> = {
  notice: "Notice",
  try: "Try",
  challenge: "Challenge",
  verify: "Verify",
  reflect: "Reflect",
  transfer: "Transfer",
};

const STAGE_ORDER = Object.keys(STAGE_LABELS) as GPTLessonStage[];

interface GPTLessonPlayerProps {
  lessonId: string;
  courseId: string;
  onCompleted?: () => void;
}

interface ApiResponse {
  data?: GPTLessonClientState;
  error?: string;
}

async function callGPTLessonApi(body: GPTLessonRequest): Promise<GPTLessonClientState> {
  const token = await auth?.currentUser?.getIdToken();
  if (!token) {
    throw new Error("Please sign in again to continue this lesson.");
  }

  const response = await fetch("/api/ai/gpt-lesson", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => null)) as ApiResponse | null;
  if (!response.ok || !payload?.data) {
    throw new Error(payload?.error || "Unable to continue the GPT Lesson.");
  }
  return payload.data;
}

export function GPTLessonPlayer({ lessonId, courseId, onCompleted }: GPTLessonPlayerProps) {
  const [state, setState] = useState<GPTLessonClientState | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState("");
  const [confidence, setConfidence] = useState("3");
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [transferResponse, setTransferResponse] = useState("");
  const startedRef = useRef(false);
  const completedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    callGPTLessonApi({ action: "start", lessonId, courseId })
      .then(setState)
      .catch((error: unknown) => {
        console.error("Unable to start GPT lesson:", error);
        toast.error(error instanceof Error ? error.message : "Unable to start the GPT Lesson");
      })
      .finally(() => setLoading(false));
  }, [courseId, lessonId]);

  useEffect(() => {
    if (state?.status === "completed" && !completedRef.current) {
      completedRef.current = true;
      onCompleted?.();
    }
  }, [onCompleted, state?.status]);

  const runAction = useCallback(async (request: GPTLessonRequest) => {
    setSubmitting(true);
    try {
      const nextState = await callGPTLessonApi(request);
      setState(nextState);
      setResponse("");
      if (nextState.assessment?.sealed) {
        setQuizAnswers({});
        setTransferResponse("");
      }
    } catch (error: unknown) {
      console.error("GPT lesson action failed:", error);
      toast.error(error instanceof Error ? error.message : "The GPT Lesson request failed");
    } finally {
      setSubmitting(false);
    }
  }, []);

  const submitResponse = () => {
    if (!state || !response.trim()) return;
    void runAction({
      action: "respond",
      sessionId: state.sessionId,
      response: response.trim(),
      confidenceSelfReport:
        state.currentStage === "reflect" ? parseInt(confidence, 10) : undefined,
    });
  };

  const requestHint = () => {
    if (!state) return;
    void runAction({ action: "hint", sessionId: state.sessionId });
  };

  const submitAssessment = () => {
    const assessment = state?.assessment;
    if (!state || !assessment || !transferResponse.trim()) return;
    const answers = assessment.quizItems.map((item) => quizAnswers[item.id] ?? -1);
    if (answers.some((answer) => answer < 0)) {
      toast.error("Answer every knowledge-check question before submitting.");
      return;
    }
    void runAction({
      action: "submitAssessment",
      sessionId: state.sessionId,
      quizAnswers: answers,
      transferResponse: transferResponse.trim(),
    });
  };

  const retryAssessment = () => {
    if (!state) return;
    void runAction({ action: "retryAssessment", sessionId: state.sessionId });
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!state) {
    return (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Unable to load GPT Lesson</AlertTitle>
        <AlertDescription>
          Refresh the page or ask your instructor to check the lesson and AI provider settings.
        </AlertDescription>
      </Alert>
    );
  }

  const currentStageIndex = STAGE_ORDER.indexOf(state.currentStage);
  const completedStages = STAGE_ORDER.filter(
    (stage) => state.stageState[stage].completedAt !== null
  ).length;
  const progressValue = state.status === "completed" ? 100 : Math.round((completedStages / STAGE_ORDER.length) * 100);
  const interactive = ["active", "provider_degraded"].includes(state.status);
  const isTransferStage = state.currentStage === "transfer" && state.assessment && !state.assessment.sealed;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Guided Learning Progress</p>
            <p className="text-xs text-muted-foreground">
              Move through each stage in order. Your explanations become part of the learning evidence.
            </p>
          </div>
          <Badge variant={state.providerDegraded ? "secondary" : "outline"}>
            {state.providerDegraded ? "Fallback mode" : "AI guided"}
          </Badge>
        </div>
        <Progress value={progressValue} className="h-2" />
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {STAGE_ORDER.map((stage, index) => {
            const stageState = state.stageState[stage];
            const isCurrent = stage === state.currentStage && interactive;
            const isComplete = stageState.completedAt !== null || state.status === "completed";
            const isLocked = index > currentStageIndex && !isComplete;

            return (
              <div
                key={stage}
                className={cn(
                  "rounded-md border p-2 text-center",
                  isCurrent && "border-primary bg-primary/5",
                  isComplete && "border-green-500/40 bg-green-500/5",
                  isLocked && "opacity-60"
                )}
              >
                <div className="mx-auto mb-1 flex h-6 w-6 items-center justify-center">
                  {isComplete ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : isLocked ? (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  ) : isCurrent ? (
                    <Sparkles className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs font-medium">{STAGE_LABELS[stage]}</p>
              </div>
            );
          })}
        </div>
      </div>

      {state.status === "consent_required" && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertTitle>Guardian approval required</AlertTitle>
          <AlertDescription>
            This lesson is configured for a learner who needs guardian consent. The lesson will unlock
            after a linked guardian approves access.
          </AlertDescription>
        </Alert>
      )}

      {state.status === "safety_hold" && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Lesson paused</AlertTitle>
          <AlertDescription>
            This session was paused so a staff member can review a safety concern. You can return later.
          </AlertDescription>
        </Alert>
      )}

      {state.status === "pending_review" && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>Submitted for instructor review</AlertTitle>
          <AlertDescription>
            Your transfer assessment is sealed and waiting for an instructor to review the evidence.
          </AlertDescription>
        </Alert>
      )}

      {state.status === "needs_retry" && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>Another transfer attempt is available</AlertTitle>
          <AlertDescription>
            Review the feedback and try the transfer assessment again.
          </AlertDescription>
        </Alert>
      )}

      {state.status === "completed" && (
        <Alert className="border-green-500/40 bg-green-500/5">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Lesson completed</AlertTitle>
          <AlertDescription>
            Your learning evidence met the completion criteria for this GPT Lesson.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {STAGE_LABELS[state.currentStage]} Stage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-[360px] rounded-md border p-4">
            <div className="space-y-4 pr-3">
              {state.messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">Preparing the guided lesson...</p>
              ) : (
                state.messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "max-w-[92%] rounded-lg px-4 py-3 text-sm",
                      message.role === "student"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <div className="mb-1 flex items-center gap-2 text-xs opacity-75">
                      <span>{message.role === "student" ? "You" : message.role === "assistant" ? "Tutor" : "System"}</span>
                      <span>•</span>
                      <span>{STAGE_LABELS[message.stage]}</span>
                    </div>
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {interactive && !isTransferStage && (
            <div className="space-y-3">
              <Label htmlFor="gpt-response">Your response</Label>
              <Textarea
                id="gpt-response"
                value={response}
                onChange={(event) => setResponse(event.target.value)}
                placeholder="Explain what you noticed, what you tried, or how you reasoned through the prompt."
                rows={5}
                disabled={submitting}
              />
              {state.currentStage === "reflect" && (
                <div className="flex max-w-xs flex-col gap-2">
                  <Label htmlFor="confidence">Confidence in your understanding</Label>
                  <Select value={confidence} onValueChange={setConfidence}>
                    <SelectTrigger id="confidence">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <SelectItem key={value} value={String(value)}>
                          {value} — {value === 1 ? "Not confident" : value === 5 ? "Very confident" : "Somewhat confident"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={submitResponse} disabled={submitting || !response.trim()}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Submit Response
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={requestHint}
                  disabled={submitting || !state.canRequestHint}
                >
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Hint{state.hintsRemaining > 0 ? ` (${state.hintsRemaining})` : ""}
                </Button>
              </div>
            </div>
          )}

          {interactive && isTransferStage && state.assessment && (
            <div className="space-y-5">
              <div className="rounded-md border bg-muted/30 p-4">
                <h3 className="font-medium">Knowledge Check</h3>
                <p className="text-sm text-muted-foreground">
                  Answer these questions before writing your transfer response.
                </p>
              </div>

              {state.assessment.quizItems.map((item, itemIndex) => (
                <div key={item.id} className="space-y-3 rounded-md border p-4">
                  <p className="font-medium">
                    {itemIndex + 1}. {item.question}
                  </p>
                  <div className="grid gap-2">
                    {item.options.map((option, optionIndex) => (
                      <button
                        key={`${item.id}-${optionIndex}`}
                        type="button"
                        onClick={() =>
                          setQuizAnswers((current) => ({ ...current, [item.id]: optionIndex }))
                        }
                        className={cn(
                          "rounded-md border px-3 py-2 text-left text-sm transition-colors",
                          quizAnswers[item.id] === optionIndex
                            ? "border-primary bg-primary/10"
                            : "hover:bg-muted"
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="space-y-2">
                <Label htmlFor="transfer-response">Transfer Assessment</Label>
                <p className="text-sm text-muted-foreground">{state.assessment.transferPrompt}</p>
                <Textarea
                  id="transfer-response"
                  value={transferResponse}
                  onChange={(event) => setTransferResponse(event.target.value)}
                  placeholder="Apply the concept to the new situation and explain your reasoning."
                  rows={7}
                  disabled={submitting}
                />
              </div>
              <Button onClick={submitAssessment} disabled={submitting || !transferResponse.trim()}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Seal and Submit Assessment
              </Button>
            </div>
          )}

          {state.status === "needs_retry" && (
            <Button variant="outline" onClick={retryAssessment} disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Start Another Transfer Attempt
            </Button>
          )}

          {state.assessment?.sealed && state.assessment.dimensionScores && (
            <div className="rounded-md border p-4">
              <h3 className="mb-3 font-medium">Understanding Evidence</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(state.assessment.dimensionScores).map(([dimension, score]) => (
                  <div key={dimension} className="rounded-md border p-3">
                    <p className="text-xs font-medium capitalize text-muted-foreground">
                      {dimension.replace(/([A-Z])/g, " $1")}
                    </p>
                    <p className="text-lg font-semibold">
                      {score.score === null ? "—" : `${score.score}/4`}
                    </p>
                    <p className="text-xs text-muted-foreground">{score.status}</p>
                  </div>
                ))}
              </div>
              {state.assessment.compositeScorePercentage !== null && (
                <p className="mt-3 text-sm font-medium">
                  Composite score: {state.assessment.compositeScorePercentage}%
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import type {
  GPTLearningDimension,
  GPTReviewDetail,
  GPTReviewQueueItem,
} from "@/lib/gpt-lesson-types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

type ReviewRequest =
  | { action: "list" }
  | { action: "detail"; sessionId: string }
  | { action: "decide"; assessmentId: string; decision: "approve" | "return"; note?: string };

async function callReviewApi<T>(body: ReviewRequest): Promise<T> {
  const token = await auth?.currentUser?.getIdToken();
  if (!token) throw new Error("Please sign in again to review GPT Lessons.");

  const response = await fetch("/api/ai/gpt-lesson/review", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;
  if (!response.ok || payload?.data === undefined) {
    throw new Error(payload?.error || "Unable to load GPT Lesson review data.");
  }
  return payload.data;
}

export default function GPTLessonReviewsPage() {
  const [queue, setQueue] = useState<GPTReviewQueueItem[]>([]);
  const [detail, setDetail] = useState<GPTReviewDetail | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const items = await callReviewApi<GPTReviewQueueItem[]>({ action: "list" });
      setQueue(items);
      if (!selectedSessionId && items.length > 0) {
        setSelectedSessionId(items[0].sessionId);
      }
    } catch (error: unknown) {
      console.error("Failed to load GPT review queue:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load review queue");
    } finally {
      setLoading(false);
    }
  }, [selectedSessionId]);

  const loadDetail = useCallback(async (sessionId: string) => {
    setDetailLoading(true);
    try {
      setDetail(await callReviewApi<GPTReviewDetail>({ action: "detail", sessionId }));
    } catch (error: unknown) {
      console.error("Failed to load GPT review detail:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load session evidence");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  useEffect(() => {
    if (selectedSessionId) void loadDetail(selectedSessionId);
  }, [loadDetail, selectedSessionId]);

  const decide = async (decision: "approve" | "return") => {
    const assessmentId = detail?.assessment?.id;
    if (!assessmentId) return;
    setSubmitting(true);
    try {
      const nextDetail = await callReviewApi<GPTReviewDetail>({
        action: "decide",
        assessmentId,
        decision,
        note: reviewNote.trim() || undefined,
      });
      setDetail(nextDetail);
      setReviewNote("");
      toast.success(decision === "approve" ? "Assessment approved" : "Assessment returned");
      void loadQueue();
    } catch (error: unknown) {
      console.error("Review decision failed:", error);
      toast.error(error instanceof Error ? error.message : "Unable to save the review decision");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <ClipboardCheck className="h-6 w-6" />
            GPT Lesson Review
          </h1>
          <p className="text-sm text-muted-foreground">
            Review sealed transfer assessments, learning evidence, and safety holds.
          </p>
        </div>
        <Button variant="outline" onClick={() => void loadQueue()} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Review Queue</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[720px]">
              <div className="space-y-2 p-4">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : queue.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No GPT Lesson sessions need review.
                  </p>
                ) : (
                  queue.map((item) => (
                    <button
                      key={item.sessionId}
                      type="button"
                      onClick={() => setSelectedSessionId(item.sessionId)}
                      className={cn(
                        "w-full rounded-lg border p-3 text-left transition-colors",
                        selectedSessionId === item.sessionId
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted"
                      )}
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{item.learnerName}</p>
                          <p className="text-xs text-muted-foreground">{item.learnerEmail}</p>
                        </div>
                        <Badge variant={item.status === "safety_hold" ? "destructive" : "secondary"}>
                          {item.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm">{item.lessonTitle}</p>
                      <p className="text-xs text-muted-foreground">{item.courseTitle}</p>
                      <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
                        {item.quizScorePercentage !== null && <span>Quiz {item.quizScorePercentage}%</span>}
                        {item.compositeScorePercentage !== null && <span>Composite {item.compositeScorePercentage}%</span>}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {detailLoading ? (
            <Card>
              <CardContent className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </CardContent>
            </Card>
          ) : !detail ? (
            <Card>
              <CardContent className="py-16 text-center text-sm text-muted-foreground">
                Select a session to review its evidence.
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{detail.session.lessonTitle}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 text-sm md:grid-cols-3">
                    <div>
                      <p className="text-muted-foreground">Learner</p>
                      <p className="font-medium">{detail.session.learnerName}</p>
                      <p className="text-xs text-muted-foreground">{detail.session.learnerEmail}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Course</p>
                      <p className="font-medium">{detail.session.courseTitle}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <Badge>{detail.session.status.replace("_", " ")}</Badge>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="mb-2 font-medium">Evidence Summary</h3>
                    {Object.keys(detail.session.evidenceSummary).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No dimension evidence was captured.</p>
                    ) : (
                      <div className="grid gap-3 md:grid-cols-2">
                        {Object.entries(detail.session.evidenceSummary).map(([dimension, evidence]) => (
                          <div key={dimension} className="rounded-md border p-3">
                            <p className="text-xs font-medium capitalize text-muted-foreground">
                              {dimension.replace(/([A-Z])/g, " $1")}
                            </p>
                            <p className="mt-1 text-sm">{evidence}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {detail.safetyIncidents.length > 0 && (
                <Alert variant="destructive">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle>Safety incidents</AlertTitle>
                  <AlertDescription>
                    <ul className="mt-2 list-disc space-y-1 pl-4">
                      {detail.safetyIncidents.map((incident) => (
                        <li key={incident.id}>
                          {incident.severity} — {incident.category}: {incident.excerpt}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {detail.assessment && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Sealed Transfer Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-md border p-3">
                        <p className="text-xs text-muted-foreground">Quiz</p>
                        <p className="text-xl font-semibold">
                          {detail.assessment.quizScorePercentage === null
                            ? "—"
                            : `${detail.assessment.quizScorePercentage}%`}
                        </p>
                      </div>
                      <div className="rounded-md border p-3">
                        <p className="text-xs text-muted-foreground">Composite</p>
                        <p className="text-xl font-semibold">
                          {detail.assessment.compositeScorePercentage === null
                            ? "—"
                            : `${detail.assessment.compositeScorePercentage}%`}
                        </p>
                      </div>
                      <div className="rounded-md border p-3">
                        <p className="text-xs text-muted-foreground">Automatic Result</p>
                        <p className="text-xl font-semibold">{detail.assessment.passed ? "Passed" : "Not passed"}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-2 font-medium">Transfer Prompt</h3>
                      <p className="rounded-md bg-muted p-3 text-sm">{detail.assessment.transferPrompt}</p>
                    </div>
                    <div>
                      <h3 className="mb-2 font-medium">Learner Response</h3>
                      <p className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">
                        {detail.assessment.transferResponse || "No response recorded."}
                      </p>
                    </div>

                    {detail.assessment.dimensionScores && (
                      <div>
                        <h3 className="mb-2 font-medium">Dimension Scores</h3>
                        <div className="grid gap-3 md:grid-cols-2">
                          {Object.entries(detail.assessment.dimensionScores).map(([dimension, score]) => (
                            <div key={dimension} className="rounded-md border p-3">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-medium capitalize text-muted-foreground">
                                  {(dimension as GPTLearningDimension).replace(/([A-Z])/g, " $1")}
                                </p>
                                <Badge variant="outline">
                                  {score.score === null ? "insufficient" : `${score.score}/4`}
                                </Badge>
                              </div>
                              <p className="mt-2 text-sm">{score.evidence}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {detail.assessment.reviewStatus === "pending" && (
                      <div className="space-y-3 rounded-md border p-4">
                        <Label htmlFor="review-note">Reviewer note</Label>
                        <Textarea
                          id="review-note"
                          value={reviewNote}
                          onChange={(event) => setReviewNote(event.target.value)}
                          placeholder="Optional feedback for the audit record"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button onClick={() => void decide("approve")} disabled={submitting}>
                            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                            Approve Completion
                          </Button>
                          <Button variant="outline" onClick={() => void decide("return")} disabled={submitting}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Return for Another Attempt
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Session Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[520px] pr-4">
                    <div className="space-y-4">
                      {detail.events.map((event) => (
                        <div key={event.id} className="rounded-md border p-3">
                          <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline">{event.stage}</Badge>
                            <Badge variant="secondary">{event.eventType.replace("_", " ")}</Badge>
                            <span>{event.actor}</span>
                            <span>{new Date(event.createdAt).toLocaleString()}</span>
                            <span>{event.visibility}</span>
                          </div>
                          <p className="whitespace-pre-wrap text-sm">{event.content}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

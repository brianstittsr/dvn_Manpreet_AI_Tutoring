"use client";

import { useCallback, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import type { GPTGuardianLinkClient } from "@/lib/gpt-lesson-types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

type GuardianRequest =
  | { action: "listMine" }
  | { action: "decide"; linkId: string; decision: "approve" | "decline" | "revoke" };

async function callGuardianApi<T>(body: GuardianRequest): Promise<T> {
  const token = await auth?.currentUser?.getIdToken();
  if (!token) throw new Error("Please sign in again to manage guardian consent.");

  const response = await fetch("/api/ai/gpt-lesson/guardian", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;
  if (!response.ok || payload?.data === undefined) {
    throw new Error(payload?.error || "Unable to process the guardian request.");
  }
  return payload.data;
}

export default function GuardianConsentsPage() {
  const [links, setLinks] = useState<GPTGuardianLinkClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadLinks = useCallback(async () => {
    setLoading(true);
    try {
      setLinks(await callGuardianApi<GPTGuardianLinkClient[]>({ action: "listMine" }));
    } catch (error: unknown) {
      console.error("Failed to load guardian consents:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load guardian consents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLinks();
  }, [loadLinks]);

  const decide = async (linkId: string, decision: "approve" | "decline" | "revoke") => {
    setSubmitting(true);
    try {
      await callGuardianApi<GPTGuardianLinkClient>({ action: "decide", linkId, decision });
      toast.success(
        decision === "approve"
          ? "Consent approved"
          : decision === "decline"
            ? "Consent declined"
            : "Consent revoked"
      );
      await loadLinks();
    } catch (error: unknown) {
      console.error("Guardian decision failed:", error);
      toast.error(error instanceof Error ? error.message : "Unable to save the guardian decision");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6 px-4 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <ShieldCheck className="h-6 w-6" />
            Guardian Consents
          </h1>
          <p className="text-sm text-muted-foreground">
            Review requests to allow linked learners to use consent-required AI-guided lessons.
          </p>
        </div>
        <Button variant="outline" onClick={() => void loadLinks()} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>What approval means</AlertTitle>
        <AlertDescription>
          Approval allows the linked learner to start GPT Lessons that require guardian consent. The AI
          tutor uses the platform’s configured topic and safety rules. You can revoke consent later.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Linked Learners</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[560px]">
            <div className="space-y-4 p-4">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : links.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No learners are linked to this guardian account.
                </p>
              ) : (
                links.map((link) => (
                  <div key={link.id} className="rounded-lg border p-4">
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-medium">{link.learnerName}</p>
                        <p className="text-sm text-muted-foreground">{link.learnerEmail}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Relationship: {link.relationship}
                        </p>
                      </div>
                      <Badge variant={link.status === "approved" ? "default" : link.status === "pending" ? "secondary" : "outline"}>
                        {link.status}
                      </Badge>
                    </div>
                    {link.expiresAt && (
                      <p className="mb-3 text-xs text-muted-foreground">
                        Consent expires {new Date(link.expiresAt).toLocaleDateString()}
                      </p>
                    )}
                    {link.status === "pending" ? (
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={() => void decide(link.id, "approve")} disabled={submitting}>
                          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                          Approve AI Lessons
                        </Button>
                        <Button variant="outline" onClick={() => void decide(link.id, "decline")} disabled={submitting}>
                          <XCircle className="mr-2 h-4 w-4" />
                          Decline
                        </Button>
                      </div>
                    ) : link.status === "approved" ? (
                      <Button variant="outline" onClick={() => void decide(link.id, "revoke")} disabled={submitting}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Revoke Consent
                      </Button>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

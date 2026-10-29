"use client";

import { useCallback, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import type { GPTGuardianLinkClient } from "@/lib/gpt-lesson-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

type GuardianRequest =
  | { action: "listStaff" }
  | {
      action: "request";
      learnerEmail: string;
      guardianEmail: string;
      relationship: string;
      expiresAt?: string;
    }
  | { action: "decide"; linkId: string; decision: "revoke" };

async function callGuardianApi<T>(body: GuardianRequest): Promise<T> {
  const token = await auth?.currentUser?.getIdToken();
  if (!token) throw new Error("Please sign in again to manage guardian links.");

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

export default function GuardianLinksAdminPage() {
  const [links, setLinks] = useState<GPTGuardianLinkClient[]>([]);
  const [learnerEmail, setLearnerEmail] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [relationship, setRelationship] = useState("Parent or guardian");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadLinks = useCallback(async () => {
    setLoading(true);
    try {
      setLinks(await callGuardianApi<GPTGuardianLinkClient[]>({ action: "listStaff" }));
    } catch (error: unknown) {
      console.error("Failed to load guardian links:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load guardian links");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLinks();
  }, [loadLinks]);

  const createLink = async () => {
    if (!learnerEmail.trim() || !guardianEmail.trim() || !relationship.trim()) {
      toast.error("Enter the learner, guardian, and relationship.");
      return;
    }
    setSubmitting(true);
    try {
      await callGuardianApi<GPTGuardianLinkClient>({
        action: "request",
        learnerEmail: learnerEmail.trim(),
        guardianEmail: guardianEmail.trim(),
        relationship: relationship.trim(),
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      });
      setLearnerEmail("");
      setGuardianEmail("");
      setExpiresAt("");
      toast.success("Guardian consent request created");
      await loadLinks();
    } catch (error: unknown) {
      console.error("Failed to create guardian link:", error);
      toast.error(error instanceof Error ? error.message : "Unable to create guardian link");
    } finally {
      setSubmitting(false);
    }
  };

  const revokeLink = async (linkId: string) => {
    setSubmitting(true);
    try {
      await callGuardianApi<GPTGuardianLinkClient>({
        action: "decide",
        linkId,
        decision: "revoke",
      });
      toast.success("Guardian consent revoked");
      await loadLinks();
    } catch (error: unknown) {
      console.error("Failed to revoke guardian link:", error);
      toast.error(error instanceof Error ? error.message : "Unable to revoke consent");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <ShieldCheck className="h-6 w-6" />
            Guardian Consent Links
          </h1>
          <p className="text-sm text-muted-foreground">
            Connect minor learner accounts to guardian accounts before a consent-required GPT Lesson starts.
          </p>
        </div>
        <Button variant="outline" onClick={() => void loadLinks()} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create Guardian Link</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="learner-email">Learner email</Label>
            <Input
              id="learner-email"
              type="email"
              value={learnerEmail}
              onChange={(event) => setLearnerEmail(event.target.value)}
              placeholder="learner@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guardian-email">Guardian email</Label>
            <Input
              id="guardian-email"
              type="email"
              value={guardianEmail}
              onChange={(event) => setGuardianEmail(event.target.value)}
              placeholder="guardian@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship</Label>
            <Input
              id="relationship"
              value={relationship}
              onChange={(event) => setRelationship(event.target.value)}
              placeholder="Parent or guardian"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expires-at">Consent expiration (optional)</Label>
            <Input
              id="expires-at"
              type="date"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Button onClick={() => void createLink()} disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Create Consent Request
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Links</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[560px]">
            <div className="space-y-3 p-4">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : links.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No guardian links have been created.
                </p>
              ) : (
                links.map((link) => (
                  <div key={link.id} className="rounded-lg border p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <p className="font-medium">{link.learnerName}</p>
                          <Badge variant={link.status === "approved" ? "default" : link.status === "pending" ? "secondary" : "outline"}>
                            {link.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Learner: {link.learnerEmail}</p>
                        <p className="text-sm text-muted-foreground">
                          Guardian: {link.guardianName} ({link.guardianEmail})
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Relationship: {link.relationship} • Requested by {link.requestedByName}
                        </p>
                        {link.expiresAt && (
                          <p className="text-xs text-muted-foreground">
                            Expires {new Date(link.expiresAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {link.status === "approved" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void revokeLink(link.id)}
                          disabled={submitting}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Revoke
                        </Button>
                      )}
                    </div>
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

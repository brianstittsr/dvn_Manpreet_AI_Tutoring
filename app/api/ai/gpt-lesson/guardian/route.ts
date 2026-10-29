import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import { COLLECTIONS, type TeamMemberDoc } from "@/lib/schema";
import {
  GPT_LMS_COLLECTIONS,
  GPTLessonAuthError,
  isStaffRole,
  requireAdminDb,
  requireAuthenticatedActor,
  type AuthenticatedActor,
} from "@/lib/gpt-lesson-server";
import type { GPTGuardianLinkClient, GPTGuardianLinkDoc } from "@/lib/gpt-lesson-types";

export const dynamic = "force-dynamic";

const CONSENT_POLICY_VERSION = "gpt-guardian-consent-v1";

const requestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("listMine") }),
  z.object({ action: z.literal("listStaff") }),
  z.object({
    action: z.literal("request"),
    learnerEmail: z.string().email(),
    guardianEmail: z.string().email(),
    relationship: z.string().min(1).max(80),
    expiresAt: z.string().datetime().optional(),
  }),
  z.object({
    action: z.literal("decide"),
    linkId: z.string().min(1),
    decision: z.enum(["approve", "decline", "revoke"]),
  }),
]);

function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function iso(value: { toDate(): Date } | null | undefined): string | null {
  return value ? value.toDate().toISOString() : null;
}

async function findTeamMemberByEmail(email: string): Promise<TeamMemberDoc | null> {
  const db = requireAdminDb();
  const normalized = normalizeEmail(email);
  const primarySnapshot = await db
    .collection(COLLECTIONS.TEAM_MEMBERS)
    .where("emailPrimary", "==", normalized)
    .limit(1)
    .get();
  if (!primarySnapshot.empty) {
    return { id: primarySnapshot.docs[0].id, ...primarySnapshot.docs[0].data() } as TeamMemberDoc;
  }
  const secondarySnapshot = await db
    .collection(COLLECTIONS.TEAM_MEMBERS)
    .where("emailSecondary", "==", normalized)
    .limit(1)
    .get();
  if (secondarySnapshot.empty) return null;
  return { id: secondarySnapshot.docs[0].id, ...secondarySnapshot.docs[0].data() } as TeamMemberDoc;
}

function displayName(member: TeamMemberDoc | null): string {
  if (!member) return "Unknown";
  return `${member.firstName} ${member.lastName}`.trim() || member.emailPrimary;
}

async function ensureGuardianMember(email: string): Promise<TeamMemberDoc> {
  const db = requireAdminDb();
  const normalized = normalizeEmail(email);
  const existing = await findTeamMemberByEmail(normalized);
  if (existing) {
    if (!existing.isGuardian) {
      await db.collection(COLLECTIONS.TEAM_MEMBERS).doc(existing.id).update({
        isGuardian: true,
        updatedAt: Timestamp.now(),
      });
      return { ...existing, isGuardian: true };
    }
    return existing;
  }

  const localPart = normalized.split("@")[0] || "Guardian";
  const docRef = db.collection(COLLECTIONS.TEAM_MEMBERS).doc();
  const guardian = {
    firstName: localPart,
    lastName: "Guardian",
    emailPrimary: normalized,
    expertise: "Guardian",
    role: "client",
    status: "pending",
    isGuardian: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  await docRef.set({ id: docRef.id, ...guardian });
  return { id: docRef.id, ...guardian } as TeamMemberDoc;
}

async function serializeLink(link: GPTGuardianLinkDoc): Promise<GPTGuardianLinkClient> {
  const [learner, guardian, requestedBy] = await Promise.all([
    findTeamMemberByEmail(link.learnerEmail),
    findTeamMemberByEmail(link.guardianEmail),
    link.requestedById
      ? requireAdminDb().collection(COLLECTIONS.TEAM_MEMBERS).doc(link.requestedById).get()
      : Promise.resolve(null),
  ]);
  const requester = requestedBy?.exists ? (requestedBy.data() as TeamMemberDoc) : null;

  return {
    id: link.id,
    learnerId: link.learnerId,
    learnerName: displayName(learner),
    learnerEmail: link.learnerEmail,
    guardianId: link.guardianId,
    guardianName: displayName(guardian),
    guardianEmail: link.guardianEmail,
    relationship: link.relationship,
    status: link.status,
    consentPolicyVersion: link.consentPolicyVersion,
    requestedByName: displayName(requester),
    decidedAt: iso(link.decidedAt),
    expiresAt: iso(link.expiresAt),
    createdAt: iso(link.createdAt) || "",
    updatedAt: iso(link.updatedAt) || "",
  };
}

async function getLinkOrThrow(linkId: string): Promise<GPTGuardianLinkDoc> {
  const snapshot = await requireAdminDb()
    .collection(GPT_LMS_COLLECTIONS.GUARDIAN_LINKS)
    .doc(linkId)
    .get();
  if (!snapshot.exists) throw new GPTLessonAuthError("Guardian link not found", 404);
  return { id: snapshot.id, ...snapshot.data() } as GPTGuardianLinkDoc;
}

async function requestGuardianLink(input: {
  actor: AuthenticatedActor;
  learnerEmail: string;
  guardianEmail: string;
  relationship: string;
  expiresAt?: string;
}): Promise<GPTGuardianLinkClient> {
  if (!isStaffRole(input.actor.teamMember.role)) {
    throw new GPTLessonAuthError("Instructor access is required to request guardian consent", 403);
  }

  const learnerEmail = normalizeEmail(input.learnerEmail);
  const guardianEmail = normalizeEmail(input.guardianEmail);
  if (learnerEmail === guardianEmail) {
    throw new GPTLessonAuthError("The learner and guardian must use different accounts", 400);
  }

  const learner = await findTeamMemberByEmail(learnerEmail);
  if (!learner) {
    throw new GPTLessonAuthError("No learner account was found for that email", 404);
  }
  const guardian = await ensureGuardianMember(guardianEmail);
  const db = requireAdminDb();

  const existingSnapshot = await db
    .collection(GPT_LMS_COLLECTIONS.GUARDIAN_LINKS)
    .where("learnerId", "==", learner.id)
    .where("guardianId", "==", guardian.id)
    .get();
  const activeExisting = existingSnapshot.docs
    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as GPTGuardianLinkDoc)
    .find((link) => ["pending", "approved"].includes(link.status));
  if (activeExisting) {
    return serializeLink(activeExisting);
  }

  const docRef = db.collection(GPT_LMS_COLLECTIONS.GUARDIAN_LINKS).doc();
  const now = Timestamp.now();
  const link: Omit<GPTGuardianLinkDoc, "id"> = {
    learnerId: learner.id,
    learnerAuthUid: learner.firebaseUid || null,
    learnerEmail,
    guardianId: guardian.id,
    guardianAuthUid: guardian.firebaseUid || null,
    guardianEmail,
    relationship: input.relationship.trim(),
    status: "pending",
    consentPolicyVersion: CONSENT_POLICY_VERSION,
    requestedById: input.actor.teamMember.id,
    decidedAt: null,
    expiresAt: input.expiresAt ? Timestamp.fromDate(new Date(input.expiresAt)) : null,
    createdAt: now,
    updatedAt: now,
  };
  await docRef.set({ id: docRef.id, ...link });
  return serializeLink({ id: docRef.id, ...link });
}

async function listLinks(actor: AuthenticatedActor, staffOnly: boolean): Promise<GPTGuardianLinkClient[]> {
  if (staffOnly && !isStaffRole(actor.teamMember.role)) {
    throw new GPTLessonAuthError("Instructor access is required", 403);
  }
  const db = requireAdminDb();
  const query = staffOnly
    ? db.collection(GPT_LMS_COLLECTIONS.GUARDIAN_LINKS).get()
    : db
        .collection(GPT_LMS_COLLECTIONS.GUARDIAN_LINKS)
        .where("guardianId", "==", actor.teamMember.id)
        .get();
  const snapshot = await query;
  const links = snapshot.docs
    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as GPTGuardianLinkDoc)
    .sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis());
  return Promise.all(links.map(serializeLink));
}

async function decideLink(input: {
  actor: AuthenticatedActor;
  linkId: string;
  decision: "approve" | "decline" | "revoke";
}): Promise<GPTGuardianLinkClient> {
  const link = await getLinkOrThrow(input.linkId);
  const staff = isStaffRole(input.actor.teamMember.role);
  if (!staff && link.guardianId !== input.actor.teamMember.id) {
    throw new GPTLessonAuthError("You do not have access to this guardian link", 403);
  }

  const allowed =
    (input.decision === "approve" && link.status === "pending") ||
    (input.decision === "decline" && link.status === "pending") ||
    (input.decision === "revoke" && link.status === "approved");
  if (!allowed) {
    throw new GPTLessonAuthError("This guardian link cannot be updated to that status", 409);
  }

  const status = input.decision === "approve" ? "approved" : input.decision === "decline" ? "declined" : "revoked";
  const now = Timestamp.now();
  await requireAdminDb().collection(GPT_LMS_COLLECTIONS.GUARDIAN_LINKS).doc(link.id).update({
    status,
    guardianAuthUid: link.guardianAuthUid || input.actor.firebaseUid,
    decidedAt: now,
    updatedAt: now,
  });
  return serializeLink(await getLinkOrThrow(link.id));
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = requestSchema.parse(await request.json());
    const actor = await requireAuthenticatedActor(request);

    switch (body.action) {
      case "listMine":
        return NextResponse.json({ data: await listLinks(actor, false) });
      case "listStaff":
        return NextResponse.json({ data: await listLinks(actor, true) });
      case "request":
        return NextResponse.json({
          data: await requestGuardianLink({
            actor,
            learnerEmail: body.learnerEmail,
            guardianEmail: body.guardianEmail,
            relationship: body.relationship,
            expiresAt: body.expiresAt,
          }),
        });
      case "decide":
        return NextResponse.json({
          data: await decideLink({ actor, linkId: body.linkId, decision: body.decision }),
        });
    }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return jsonError("Invalid guardian consent request", 400);
    }
    if (error instanceof GPTLessonAuthError) {
      return jsonError(error.message, error.status);
    }
    console.error("Guardian consent API error:", error);
    return jsonError("Unable to process the guardian consent request", 500);
  }
}

/**
 * AI Student Interview — server-side data layer.
 *
 * A bounded chat interview that learns how a child likes to learn and what
 * motivates them. Completed interviews are distilled into a learner profile
 * stored in `lms_learner_profiles`, which GPT lessons read to personalize
 * tutoring. Collections are server-only; clients go through the API route.
 */

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { LearnerProfileData } from "@/types/academy";
import { requireAdminDb } from "./gpt-lesson-server";

export const INTERVIEW_COLLECTIONS = {
  SESSIONS: "lms_interview_sessions",
  TURNS: "turns",
  PROFILES: "lms_learner_profiles",
} as const;

export const INTERVIEW_PROFILE_VERSION = "learner-profile-v1";

export type InterviewSessionStatus = "in_progress" | "completed" | "consent_required" | "paused_safety";

export interface InterviewSessionDoc {
  id: string;
  learnerId: string;
  learnerAuthUid: string;
  lessonId: string;
  courseId: string;
  enrollmentId: string;
  status: InterviewSessionStatus;
  turnCount: number;
  guardianConsentId: string | null;
  provider: string | null;
  model: string | null;
  providerDegraded: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt: Timestamp | null;
}

export interface InterviewTurnDoc {
  id: string;
  sessionId: string;
  role: "interviewer" | "learner";
  content: string;
  createdAt: Timestamp;
}

export interface LearnerProfileDoc {
  id: string;
  odUserId: string;
  profile: LearnerProfileData;
  sourceSessionId: string;
  profileVersion: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Re-exported for server callers; the source lives in a client-safe module so
// browser bundles never pull in firebase-admin through this file.
export { DEFAULT_INTERVIEW_SYSTEM_PROMPT } from "./interview-defaults";

/** Prompt for the per-turn interviewer call. */
export function buildInterviewTurnPrompt(input: {
  systemPrompt: string;
  transcript: { role: "interviewer" | "learner"; content: string }[];
  learnerTurns: number;
  minTurns: number;
  maxTurns: number;
}): string {
  const rendered = input.transcript
    .map((t) => `${t.role === "learner" ? "Learner" : "Interviewer"}: ${t.content}`)
    .join("\n");
  return [
    `Conversation so far (${input.learnerTurns} learner answer${input.learnerTurns === 1 ? "" : "s"}):`,
    rendered || "(the interview has not started yet — open with a warm greeting and your first question)",
    `The interview must run for at least ${input.minTurns} learner answers and must end by ${input.maxTurns}.`,
    "Return JSON only with this shape:",
    '{"interviewerMessage":"your next short message to the learner","shouldConclude":false,"concluded":null}',
    'Set "shouldConclude" to true only when the interview has covered learning style, motivators, and interests, and write "concluded" as a short warm closing message. After the minimum, conclude as soon as the picture feels complete; never exceed the maximum.',
  ].join("\n\n");
}

/** Prompt for the profile-extraction call after the interview ends. */
export function buildProfileExtractionPrompt(transcript: { role: string; content: string }[]): string {
  const rendered = transcript
    .map((t) => `${t.role === "learner" ? "Learner" : "Interviewer"}: ${t.content}`)
    .join("\n");
  return [
    "You are summarizing a short interview with a child about how they like to learn.",
    "From the transcript below, extract a learner profile a tutor can use to personalize lessons.",
    "Use only what the learner actually said — never invent preferences. Use empty arrays or null where the transcript gives no evidence.",
    "Transcript:",
    rendered,
    "Return JSON only with this shape:",
    '{"learningStyles":["how they like to learn, e.g. videos, hands-on, games"],"motivators":["rewards and encouragements that motivate them"],"interests":["hobbies and topics they enjoy"],"pacePreference":"fast|steady|or null","helpPreference":"how they like to be helped when stuck, or null","notes":"anything else a tutor should know, or null","tutorSummary":"2-3 sentences a tutor can use to personalize examples, pacing, and encouragement"}',
    "The tutorSummary must be written for the tutor (third person), never mention the interview, and never include personal identifiers.",
  ].join("\n\n");
}

export function interviewSessionIdFor(learnerId: string, lessonId: string): string {
  return `interview_${learnerId}_${lessonId}`;
}

export async function getInterviewSession(sessionId: string): Promise<InterviewSessionDoc | null> {
  const db = requireAdminDb();
  const snap = await db.collection(INTERVIEW_COLLECTIONS.SESSIONS).doc(sessionId).get();
  return snap.exists ? ({ id: snap.id, ...snap.data() } as InterviewSessionDoc) : null;
}

export async function createInterviewSession(input: {
  learnerId: string;
  learnerAuthUid: string;
  lessonId: string;
  courseId: string;
  enrollmentId: string;
  status: InterviewSessionStatus;
  guardianConsentId: string | null;
  provider: string | null;
  model: string | null;
  providerDegraded: boolean;
}): Promise<InterviewSessionDoc> {
  const db = requireAdminDb();
  const sessionId = interviewSessionIdFor(input.learnerId, input.lessonId);
  const doc: InterviewSessionDoc = {
    id: sessionId,
    learnerId: input.learnerId,
    learnerAuthUid: input.learnerAuthUid,
    lessonId: input.lessonId,
    courseId: input.courseId,
    enrollmentId: input.enrollmentId,
    status: input.status,
    turnCount: 0,
    guardianConsentId: input.guardianConsentId,
    provider: input.provider,
    model: input.model,
    providerDegraded: input.providerDegraded,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    completedAt: null,
  };
  await db.collection(INTERVIEW_COLLECTIONS.SESSIONS).doc(sessionId).set(doc);
  return doc;
}

export async function appendInterviewTurn(input: {
  sessionId: string;
  role: "interviewer" | "learner";
  content: string;
}): Promise<void> {
  const db = requireAdminDb();
  const docRef = db
    .collection(INTERVIEW_COLLECTIONS.SESSIONS)
    .doc(input.sessionId)
    .collection(INTERVIEW_COLLECTIONS.TURNS)
    .doc();
  const turn: InterviewTurnDoc = {
    id: docRef.id,
    sessionId: input.sessionId,
    role: input.role,
    content: input.content,
    createdAt: Timestamp.now(),
  };
  await docRef.set(turn);
  await db
    .collection(INTERVIEW_COLLECTIONS.SESSIONS)
    .doc(input.sessionId)
    .update({
      updatedAt: Timestamp.now(),
      ...(input.role === "learner" ? { turnCount: FieldValue.increment(1) } : {}),
    });
}

export async function getInterviewTurns(sessionId: string): Promise<InterviewTurnDoc[]> {
  const db = requireAdminDb();
  const snapshot = await db
    .collection(INTERVIEW_COLLECTIONS.SESSIONS)
    .doc(sessionId)
    .collection(INTERVIEW_COLLECTIONS.TURNS)
    .orderBy("createdAt", "asc")
    .get();
  return snapshot.docs.map((d) => d.data() as InterviewTurnDoc);
}

export async function getLearnerProfile(odUserId: string): Promise<LearnerProfileDoc | null> {
  const db = requireAdminDb();
  const snap = await db.collection(INTERVIEW_COLLECTIONS.PROFILES).doc(odUserId).get();
  return snap.exists ? ({ id: snap.id, ...snap.data() } as LearnerProfileDoc) : null;
}

export async function upsertLearnerProfile(input: {
  odUserId: string;
  profile: LearnerProfileData;
  sourceSessionId: string;
}): Promise<void> {
  const db = requireAdminDb();
  const docRef = db.collection(INTERVIEW_COLLECTIONS.PROFILES).doc(input.odUserId);
  const existing = await docRef.get();
  const doc: LearnerProfileDoc = {
    id: input.odUserId,
    odUserId: input.odUserId,
    profile: input.profile,
    sourceSessionId: input.sourceSessionId,
    profileVersion: INTERVIEW_PROFILE_VERSION,
    createdAt: existing.exists
      ? (existing.data() as LearnerProfileDoc).createdAt
      : Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  await docRef.set(doc);
}

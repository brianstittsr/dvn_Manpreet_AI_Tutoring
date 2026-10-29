import { NextRequest } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "./firebase-admin";
import { COLLECTIONS, type TeamMemberDoc } from "./schema";
import {
  LMS_COLLECTIONS,
  type EnrollmentDoc,
  type LessonDoc,
} from "./firebase-lms";
import { GPT_LESSON_PROMPT_VERSION, GPT_LESSON_RULES_VERSION } from "./gpt-lesson-prompts";
import {
  GPT_LESSON_STAGES,
  type GPTGuardianLinkDoc,
  type GPTLearningEventDoc,
  type GPTLessonAssessmentDoc,
  type GPTLessonClientAssessment,
  type GPTLessonClientStageState,
  type GPTLessonClientState,
  type GPTLessonMessage,
  type GPTLessonSessionDoc,
  type GPTSafetyIncidentDoc,
  type GPTStageState,
} from "./gpt-lesson-types";
import type { GPTLessonStage } from "@/types/academy";

export const GPT_LMS_COLLECTIONS = {
  SESSIONS: "lms_gpt_lesson_sessions",
  EVENTS: "events",
  ASSESSMENTS: "lms_gpt_lesson_assessments",
  SCORES: "lms_gpt_lesson_scores",
  GUARDIAN_LINKS: "lms_gpt_guardian_links",
  SAFETY_INCIDENTS: "lms_gpt_safety_incidents",
} as const;

export interface AuthenticatedActor {
  firebaseUid: string;
  teamMember: TeamMemberDoc;
}

export class GPTLessonAuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

export function requireAdminDb() {
  if (!adminDb) {
    throw new GPTLessonAuthError("Firebase Admin is not configured", 500);
  }
  return adminDb;
}

export async function requireAuthenticatedActor(request: NextRequest): Promise<AuthenticatedActor> {
  if (!adminAuth || !adminDb) {
    throw new GPTLessonAuthError("Firebase Admin is not configured", 500);
  }

  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  if (!token) {
    throw new GPTLessonAuthError("Missing authorization token", 401);
  }

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(token);
  } catch {
    throw new GPTLessonAuthError("Invalid authorization token", 401);
  }

  const snapshot = await adminDb
    .collection(COLLECTIONS.TEAM_MEMBERS)
    .where("firebaseUid", "==", decoded.uid)
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new GPTLessonAuthError("Authenticated account is not linked to a learner profile", 403);
  }

  const docSnap = snapshot.docs[0];
  return {
    firebaseUid: decoded.uid,
    teamMember: { id: docSnap.id, ...docSnap.data() } as TeamMemberDoc,
  };
}

export function isStaffRole(role: string | undefined): boolean {
  return role === "admin" || role === "superadmin";
}

export function sessionIdFor(learnerId: string, lessonId: string): string {
  return `${learnerId}_${lessonId}`;
}

export function initialStageState(): Record<GPTLessonStage, GPTStageState> {
  return GPT_LESSON_STAGES.reduce(
    (acc, stage) => ({
      ...acc,
      [stage]: { attempts: 0, hintsUsed: 0, completedAt: null, lastResponse: null },
    }),
    {} as Record<GPTLessonStage, GPTStageState>
  );
}

export async function getLessonOrThrow(lessonId: string): Promise<LessonDoc> {
  const db = requireAdminDb();
  const docSnap = await db.collection(LMS_COLLECTIONS.LESSONS).doc(lessonId).get();
  if (!docSnap.exists) throw new GPTLessonAuthError("Lesson not found", 404);
  return { id: docSnap.id, ...docSnap.data() } as LessonDoc;
}

export async function getSessionOrThrow(sessionId: string): Promise<GPTLessonSessionDoc> {
  const db = requireAdminDb();
  const docSnap = await db.collection(GPT_LMS_COLLECTIONS.SESSIONS).doc(sessionId).get();
  if (!docSnap.exists) throw new GPTLessonAuthError("GPT lesson session not found", 404);
  return { id: docSnap.id, ...docSnap.data() } as GPTLessonSessionDoc;
}

export async function getAssessmentOrThrow(assessmentId: string): Promise<GPTLessonAssessmentDoc> {
  const db = requireAdminDb();
  const docSnap = await db.collection(GPT_LMS_COLLECTIONS.ASSESSMENTS).doc(assessmentId).get();
  if (!docSnap.exists) throw new GPTLessonAuthError("GPT lesson assessment not found", 404);
  return { id: docSnap.id, ...docSnap.data() } as GPTLessonAssessmentDoc;
}

export async function getEnrollmentForLearner(
  learnerId: string,
  courseId: string
): Promise<EnrollmentDoc | null> {
  const db = requireAdminDb();
  const snapshot = await db
    .collection(LMS_COLLECTIONS.ENROLLMENTS)
    .where("odUserId", "==", learnerId)
    .where("courseId", "==", courseId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as EnrollmentDoc;
}

export async function getApprovedGuardianConsent(learnerId: string): Promise<GPTGuardianLinkDoc | null> {
  const db = requireAdminDb();
  const snapshot = await db
    .collection(GPT_LMS_COLLECTIONS.GUARDIAN_LINKS)
    .where("learnerId", "==", learnerId)
    .where("status", "==", "approved")
    .get();

  const active = snapshot.docs
    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as GPTGuardianLinkDoc)
    .find((link) => !link.expiresAt || link.expiresAt.toMillis() > Date.now());

  return active || null;
}

export async function getLatestGuardianLink(learnerId: string): Promise<GPTGuardianLinkDoc | null> {
  const db = requireAdminDb();
  const snapshot = await db
    .collection(GPT_LMS_COLLECTIONS.GUARDIAN_LINKS)
    .where("learnerId", "==", learnerId)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs
    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as GPTGuardianLinkDoc)
    .sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis())[0];
}

export async function addLearningEvent(input: {
  sessionId: string;
  learnerId: string;
  stage: GPTLessonStage;
  eventType: GPTLearningEventDoc["eventType"];
  actor: GPTLearningEventDoc["actor"];
  content: string;
  visibility?: GPTLearningEventDoc["visibility"];
  provenance?: GPTLearningEventDoc["provenance"];
}): Promise<string> {
  const db = requireAdminDb();
  const eventsRef = db
    .collection(GPT_LMS_COLLECTIONS.SESSIONS)
    .doc(input.sessionId)
    .collection(GPT_LMS_COLLECTIONS.EVENTS);
  const docRef = eventsRef.doc();

  await docRef.set({
    id: docRef.id,
    sessionId: input.sessionId,
    learnerId: input.learnerId,
    stage: input.stage,
    eventType: input.eventType,
    actor: input.actor,
    content: input.content,
    visibility: input.visibility || "learner",
    provenance: input.provenance || { source: "system" },
    createdAt: Timestamp.now(),
  });

  await db.collection(GPT_LMS_COLLECTIONS.SESSIONS).doc(input.sessionId).update({
    lastEventId: docRef.id,
    lastActivityAt: Timestamp.now(),
  });

  return docRef.id;
}

export async function addSafetyIncident(input: {
  sessionId: string;
  learnerId: string;
  lessonId: string;
  severity: "low" | "medium" | "high";
  category: string;
  excerpt: string;
  createdBy: "system" | "model";
}): Promise<void> {
  const db = requireAdminDb();
  const docRef = db.collection(GPT_LMS_COLLECTIONS.SAFETY_INCIDENTS).doc();
  const incident: GPTSafetyIncidentDoc = {
    id: docRef.id,
    sessionId: input.sessionId,
    learnerId: input.learnerId,
    lessonId: input.lessonId,
    severity: input.severity,
    category: input.category,
    excerpt: input.excerpt.slice(0, 500),
    status: "open",
    createdBy: input.createdBy,
    createdAt: Timestamp.now(),
    acknowledgedById: null,
    acknowledgedAt: null,
  };
  await docRef.set(incident);
}

function timestampToIso(value: Timestamp | null | undefined): string | null {
  return value ? value.toDate().toISOString() : null;
}

export async function getSessionMessages(sessionId: string): Promise<GPTLessonMessage[]> {
  const db = requireAdminDb();
  const snapshot = await db
    .collection(GPT_LMS_COLLECTIONS.SESSIONS)
    .doc(sessionId)
    .collection(GPT_LMS_COLLECTIONS.EVENTS)
    .orderBy("createdAt", "asc")
    .get();

  return snapshot.docs
    .map((docSnap) => docSnap.data() as GPTLearningEventDoc)
    .filter((event) => event.visibility === "learner")
    .filter((event) =>
      ["stage_started", "student_response", "assistant_feedback", "hint", "assessment_started"].includes(
        event.eventType
      )
    )
    .map((event) => ({
      id: event.id,
      role:
        event.actor === "student" ? "student" : event.actor === "assistant" ? "assistant" : "system",
      stage: event.stage,
      content: event.content,
      createdAt: event.createdAt.toDate().toISOString(),
    }));
}

export function sanitizeAssessment(
  assessment: GPTLessonAssessmentDoc | null
): GPTLessonClientAssessment | null {
  if (!assessment) return null;

  return {
    id: assessment.id,
    status: assessment.status,
    reviewStatus: assessment.reviewStatus,
    quizItems: assessment.quizItems.map((item) => ({
      id: item.id,
      question: item.question,
      options: item.options,
    })),
    quizScorePercentage: assessment.quizScorePercentage,
    transferPrompt: assessment.transferPrompt,
    sealed: assessment.sealedAt !== null,
    passed: assessment.passed,
    dimensionScores: assessment.dimensionScores,
    compositeScorePercentage: assessment.compositeScorePercentage,
  };
}

export async function buildClientState(input: {
  session: GPTLessonSessionDoc;
  configMaxHints: number;
  requiresGuardianConsent: boolean;
  consentStatus: GPTLessonClientState["consentStatus"];
  assessment: GPTLessonAssessmentDoc | null;
  providerDegraded?: boolean;
}): Promise<GPTLessonClientState> {
  const { session, configMaxHints, requiresGuardianConsent, consentStatus, assessment } = input;
  const stageState = GPT_LESSON_STAGES.reduce(
    (acc, stage) => ({
      ...acc,
      [stage]: {
        attempts: session.stageState[stage]?.attempts || 0,
        hintsUsed: session.stageState[stage]?.hintsUsed || 0,
        completedAt: timestampToIso(session.stageState[stage]?.completedAt as Timestamp | null),
        lastResponse: session.stageState[stage]?.lastResponse || null,
      } satisfies GPTLessonClientStageState,
    }),
    {} as Record<GPTLessonStage, GPTLessonClientStageState>
  );

  const currentStageState = session.stageState[session.currentStage];
  const canRequestHint =
    session.status === "active" &&
    session.currentStage !== "transfer" &&
    currentStageState.attempts > 0 &&
    currentStageState.hintsUsed < configMaxHints;

  return {
    sessionId: session.id,
    status: session.status,
    currentStage: session.currentStage,
    stageState,
    messages: await getSessionMessages(session.id),
    canRequestHint,
    hintsRemaining: Math.max(0, configMaxHints - currentStageState.hintsUsed),
    requiresGuardianConsent,
    consentStatus,
    assessment: sanitizeAssessment(assessment),
    providerDegraded: input.providerDegraded ?? session.providerDegraded,
  };
}

export async function markLessonCompleteAdmin(input: {
  learnerId: string;
  lessonId: string;
  courseId: string;
  enrollmentId: string;
}): Promise<void> {
  const db = requireAdminDb();
  const progressSnapshot = await db
    .collection(LMS_COLLECTIONS.LESSON_PROGRESS)
    .where("odUserId", "==", input.learnerId)
    .where("lessonId", "==", input.lessonId)
    .limit(1)
    .get();

  if (progressSnapshot.empty) {
    const docRef = db.collection(LMS_COLLECTIONS.LESSON_PROGRESS).doc();
    await docRef.set({
      id: docRef.id,
      odUserId: input.learnerId,
      lessonId: input.lessonId,
      courseId: input.courseId,
      enrollmentId: input.enrollmentId,
      startedAt: Timestamp.now(),
      completedAt: Timestamp.now(),
      progressSeconds: 0,
      isCompleted: true,
      notes: null,
    });
  } else {
    await progressSnapshot.docs[0].ref.update({
      isCompleted: true,
      completedAt: Timestamp.now(),
    });
  }

  const lessonsSnapshot = await db
    .collection(LMS_COLLECTIONS.LESSONS)
    .where("courseId", "==", input.courseId)
    .get();
  const totalLessons = lessonsSnapshot.size;
  if (totalLessons === 0) return;

  const completedSnapshot = await db
    .collection(LMS_COLLECTIONS.LESSON_PROGRESS)
    .where("enrollmentId", "==", input.enrollmentId)
    .where("isCompleted", "==", true)
    .get();

  const progressPercentage = Math.round((completedSnapshot.size / totalLessons) * 100);
  const updates: Record<string, unknown> = {
    progressPercentage,
    lastAccessedAt: FieldValue.serverTimestamp(),
  };
  if (progressPercentage === 100) {
    updates.completedAt = Timestamp.now();
  }
  await db.collection(LMS_COLLECTIONS.ENROLLMENTS).doc(input.enrollmentId).update(updates);
}

export function nextStage(stage: GPTLessonStage): GPTLessonStage | null {
  const index = GPT_LESSON_STAGES.indexOf(stage);
  return index >= 0 && index < GPT_LESSON_STAGES.length - 1 ? GPT_LESSON_STAGES[index + 1] : null;
}

export function baseSession(input: {
  learnerId: string;
  learnerAuthUid: string;
  lessonId: string;
  courseId: string;
  enrollmentId: string;
  status: GPTLessonSessionDoc["status"];
  guardianConsentId: string | null;
  provider: string | null;
  model: string | null;
  providerDegraded: boolean;
}): Omit<GPTLessonSessionDoc, "id"> {
  return {
    learnerId: input.learnerId,
    learnerAuthUid: input.learnerAuthUid,
    lessonId: input.lessonId,
    courseId: input.courseId,
    enrollmentId: input.enrollmentId,
    status: input.status,
    currentStage: "notice",
    stageState: initialStageState(),
    guardianConsentId: input.guardianConsentId,
    activeAssessmentId: null,
    transferAttemptCount: 0,
    evidenceSummary: {},
    lastEventId: null,
    promptVersion: GPT_LESSON_PROMPT_VERSION,
    rulesVersion: GPT_LESSON_RULES_VERSION,
    provider: input.provider,
    model: input.model,
    providerDegraded: input.providerDegraded,
    confidenceSelfReport: null,
    startedAt: Timestamp.now(),
    lastActivityAt: Timestamp.now(),
    completedAt: null,
  };
}

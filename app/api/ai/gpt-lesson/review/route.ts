import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import {
  COLLECTIONS,
  type TeamMemberDoc,
} from "@/lib/schema";
import {
  LMS_COLLECTIONS,
  type CourseDoc,
} from "@/lib/firebase-lms";
import {
  GPT_LMS_COLLECTIONS,
  GPTLessonAuthError,
  addLearningEvent,
  getAssessmentOrThrow,
  getLessonOrThrow,
  getSessionOrThrow,
  isStaffRole,
  markLessonCompleteAdmin,
  requireAdminDb,
  requireAuthenticatedActor,
  type AuthenticatedActor,
} from "@/lib/gpt-lesson-server";
import type {
  GPTLessonAssessmentDoc,
  GPTLessonSessionDoc,
  GPTLearningEventDoc,
  GPTReviewDetail,
  GPTReviewEvent,
  GPTReviewQueueItem,
  GPTSafetyIncidentDoc,
} from "@/lib/gpt-lesson-types";

export const dynamic = "force-dynamic";

const requestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("list") }),
  z.object({
    action: z.literal("detail"),
    sessionId: z.string().min(1),
  }),
  z.object({
    action: z.literal("decide"),
    assessmentId: z.string().min(1),
    decision: z.enum(["approve", "return"]),
    note: z.string().max(2000).optional(),
  }),
]);

function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

function iso(value: { toDate(): Date } | null | undefined): string | null {
  return value ? value.toDate().toISOString() : null;
}

async function requireStaff(request: NextRequest): Promise<AuthenticatedActor> {
  const actor = await requireAuthenticatedActor(request);
  if (!isStaffRole(actor.teamMember.role)) {
    throw new GPTLessonAuthError("Instructor access is required", 403);
  }
  return actor;
}

async function getTeamMemberName(learnerId: string): Promise<{ firstName: string; lastName: string; email: string }> {
  const db = requireAdminDb();
  const snapshot = await db.collection(COLLECTIONS.TEAM_MEMBERS).doc(learnerId).get();
  const member = snapshot.exists ? (snapshot.data() as TeamMemberDoc) : null;
  return {
    firstName: member?.firstName || "",
    lastName: member?.lastName || "",
    email: member?.emailPrimary || "",
  };
}

async function getCourseTitle(courseId: string): Promise<string> {
  const db = requireAdminDb();
  const snapshot = await db.collection(LMS_COLLECTIONS.COURSES).doc(courseId).get();
  return snapshot.exists ? ((snapshot.data() as CourseDoc).title || "Untitled Course") : "Unknown Course";
}

async function buildQueueItem(
  session: GPTLessonSessionDoc
): Promise<GPTReviewQueueItem> {
  const [learner, lesson, courseTitle] = await Promise.all([
    getTeamMemberName(session.learnerId),
    getLessonOrThrow(session.lessonId).catch(() => null),
    getCourseTitle(session.courseId),
  ]);
  const assessment = session.activeAssessmentId
    ? await getAssessmentOrThrow(session.activeAssessmentId).catch(() => null)
    : null;

  return {
    sessionId: session.id,
    assessmentId: assessment?.id || null,
    learnerId: session.learnerId,
    learnerName: `${learner.firstName} ${learner.lastName}`.trim() || "Learner",
    learnerEmail: learner.email,
    courseId: session.courseId,
    courseTitle,
    lessonId: session.lessonId,
    lessonTitle: lesson?.title || "GPT Lesson",
    status: session.status,
    submittedAt: iso(session.lastActivityAt) || "",
    compositeScorePercentage: assessment?.compositeScorePercentage ?? null,
    quizScorePercentage: assessment?.quizScorePercentage ?? null,
    passed: assessment?.passed || false,
    reviewStatus: assessment?.reviewStatus || null,
  };
}

async function getReviewEvents(sessionId: string): Promise<GPTReviewEvent[]> {
  const db = requireAdminDb();
  const snapshot = await db
    .collection(GPT_LMS_COLLECTIONS.SESSIONS)
    .doc(sessionId)
    .collection(GPT_LMS_COLLECTIONS.EVENTS)
    .orderBy("createdAt", "asc")
    .get();

  return snapshot.docs.map((docSnap) => {
    const event = docSnap.data() as GPTLearningEventDoc;
    return {
      id: event.id,
      stage: event.stage,
      eventType: event.eventType,
      actor: event.actor,
      content: event.content,
      visibility: event.visibility,
      provenance: event.provenance,
      createdAt: iso(event.createdAt) || "",
    };
  });
}

function serializeAssessment(assessment: GPTLessonAssessmentDoc): GPTReviewDetail["assessment"] {
  return {
    ...assessment,
    sealedAt: iso(assessment.sealedAt),
    reviewedAt: iso(assessment.reviewedAt),
    createdAt: iso(assessment.createdAt) || "",
    updatedAt: iso(assessment.updatedAt) || "",
  };
}

async function buildDetail(session: GPTLessonSessionDoc): Promise<GPTReviewDetail> {
  const [learner, lesson, courseTitle, events] = await Promise.all([
    getTeamMemberName(session.learnerId),
    getLessonOrThrow(session.lessonId).catch(() => null),
    getCourseTitle(session.courseId),
    getReviewEvents(session.id),
  ]);
  const assessment = session.activeAssessmentId
    ? await getAssessmentOrThrow(session.activeAssessmentId).catch(() => null)
    : null;
  const db = requireAdminDb();
  const incidentsSnapshot = await db
    .collection(GPT_LMS_COLLECTIONS.SAFETY_INCIDENTS)
    .where("sessionId", "==", session.id)
    .get();
  const safetyIncidents = incidentsSnapshot.docs.map((docSnap) => {
    const incident = docSnap.data() as GPTSafetyIncidentDoc;
    return {
      id: incident.id,
      severity: incident.severity,
      category: incident.category,
      excerpt: incident.excerpt,
      status: incident.status,
      createdAt: iso(incident.createdAt) || "",
    };
  });

  return {
    session: {
      id: session.id,
      learnerId: session.learnerId,
      learnerName: `${learner.firstName} ${learner.lastName}`.trim() || "Learner",
      learnerEmail: learner.email,
      lessonId: session.lessonId,
      lessonTitle: lesson?.title || "GPT Lesson",
      courseId: session.courseId,
      courseTitle,
      status: session.status,
      currentStage: session.currentStage,
      evidenceSummary: session.evidenceSummary,
      startedAt: iso(session.startedAt) || "",
      lastActivityAt: iso(session.lastActivityAt) || "",
      completedAt: iso(session.completedAt),
    },
    assessment: assessment ? serializeAssessment(assessment) : null,
    events,
    safetyIncidents,
  };
}

async function decideAssessment(input: {
  actor: AuthenticatedActor;
  assessmentId: string;
  decision: "approve" | "return";
  note?: string;
}): Promise<GPTReviewDetail> {
  const db = requireAdminDb();
  const assessment = await getAssessmentOrThrow(input.assessmentId);
  if (assessment.reviewStatus !== "pending" && assessment.status !== "pending_review") {
    throw new GPTLessonAuthError("This assessment is not waiting for review", 409);
  }

  const session = await getSessionOrThrow(assessment.sessionId);
  const now = Timestamp.now();
  const approved = input.decision === "approve";

  await db.collection(GPT_LMS_COLLECTIONS.ASSESSMENTS).doc(assessment.id).update({
    status: approved ? "approved" : "returned",
    reviewStatus: approved ? "approved" : "returned",
    passed: approved ? true : assessment.passed,
    reviewerId: input.actor.teamMember.id,
    reviewerNote: input.note || null,
    reviewedAt: now,
    updatedAt: now,
  });

  await db.collection(GPT_LMS_COLLECTIONS.SESSIONS).doc(session.id).update({
    status: approved ? "completed" : "needs_retry",
    completedAt: approved ? now : null,
    lastActivityAt: now,
  });

  const scoreSnapshot = await db
    .collection(GPT_LMS_COLLECTIONS.SCORES)
    .where("assessmentId", "==", assessment.id)
    .get();
  await Promise.all(
    scoreSnapshot.docs.map((docSnap) =>
      docSnap.ref.update({
        scoringMethod: "instructor_review",
        reviewerId: input.actor.teamMember.id,
        status: approved ? "demonstrated" : "developing",
        updatedAt: now,
      })
    )
  );

  await addLearningEvent({
    sessionId: session.id,
    learnerId: session.learnerId,
    stage: "transfer",
    eventType: "review_decision",
    actor: "reviewer",
    content: input.note || (approved ? "Assessment approved by instructor." : "Assessment returned for revision."),
    visibility: "staff",
    provenance: { source: "reviewer" },
  });

  if (approved) {
    await markLessonCompleteAdmin({
      learnerId: session.learnerId,
      lessonId: session.lessonId,
      courseId: session.courseId,
      enrollmentId: session.enrollmentId,
    });
  }

  return buildDetail(await getSessionOrThrow(session.id));
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = requestSchema.parse(await request.json());
    const actor = await requireStaff(request);
    const db = requireAdminDb();

    if (body.action === "list") {
      const snapshot = await db
        .collection(GPT_LMS_COLLECTIONS.SESSIONS)
        .where("status", "in", ["pending_review", "safety_hold", "needs_retry"])
        .get();
      const items = await Promise.all(
        snapshot.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as GPTLessonSessionDoc)
          .sort((a, b) => b.lastActivityAt.toMillis() - a.lastActivityAt.toMillis())
          .map(buildQueueItem)
      );
      return NextResponse.json({ data: items });
    }

    if (body.action === "detail") {
      return NextResponse.json({ data: await buildDetail(await getSessionOrThrow(body.sessionId)) });
    }

    return NextResponse.json({
      data: await decideAssessment({
        actor,
        assessmentId: body.assessmentId,
        decision: body.decision,
        note: body.note,
      }),
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return jsonError("Invalid GPT lesson review request", 400);
    }
    if (error instanceof GPTLessonAuthError) {
      return jsonError(error.message, error.status);
    }
    console.error("GPT lesson review API error:", error);
    return jsonError("Unable to process the GPT lesson review request", 500);
  }
}

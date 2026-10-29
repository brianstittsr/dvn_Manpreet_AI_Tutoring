import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import {
  assessmentPassed,
  generateAssessment,
  generateHint,
  generateStageTurn,
  scoreAssessment,
} from "@/lib/gpt-lesson-engine";
import {
  addLearningEvent,
  addSafetyIncident,
  baseSession,
  buildClientState,
  getApprovedGuardianConsent,
  getAssessmentOrThrow,
  getEnrollmentForLearner,
  getLatestGuardianLink,
  getLessonOrThrow,
  getSessionOrThrow,
  GPT_LMS_COLLECTIONS,
  GPTLessonAuthError,
  markLessonCompleteAdmin,
  nextStage,
  requireAdminDb,
  requireAuthenticatedActor,
  sessionIdFor,
} from "@/lib/gpt-lesson-server";
import {
  GPT_LESSON_PROMPT_VERSION,
  GPT_LESSON_RUBRIC_VERSION,
} from "@/lib/gpt-lesson-prompts";
import { screenLearnerText, shouldPauseForSafety } from "@/lib/gpt-lesson-safety";
import type { LessonDoc } from "@/lib/firebase-lms";
import type { GPTLessonConfig } from "@/types/academy";
import type {
  AuthenticatedActor,
} from "@/lib/gpt-lesson-server";
import type {
  GPTLessonAssessmentDoc,
  GPTLessonClientState,
  GPTLessonSessionDoc,
  GPTScoreRecordDoc,
} from "@/lib/gpt-lesson-types";

export const dynamic = "force-dynamic";

const requestSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("start"),
    lessonId: z.string().min(1),
    courseId: z.string().min(1),
  }),
  z.object({
    action: z.literal("respond"),
    sessionId: z.string().min(1),
    response: z.string().min(1).max(5000),
    confidenceSelfReport: z.number().int().min(1).max(5).optional(),
  }),
  z.object({
    action: z.literal("hint"),
    sessionId: z.string().min(1),
  }),
  z.object({
    action: z.literal("submitAssessment"),
    sessionId: z.string().min(1),
    quizAnswers: z.array(z.number().int().min(0).max(3)).max(10),
    transferResponse: z.string().min(1).max(8000),
  }),
  z.object({
    action: z.literal("retryAssessment"),
    sessionId: z.string().min(1),
  }),
]);

type GPTLessonRequest = z.infer<typeof requestSchema>;

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function loadOwnedSession(sessionId: string, actor: AuthenticatedActor) {
  const session = await getSessionOrThrow(sessionId);
  if (session.learnerId !== actor.teamMember.id) {
    throw new GPTLessonAuthError("You do not have access to this lesson session", 403);
  }
  return session;
}

function requiresConsent(config: GPTLessonConfig): boolean {
  return config.requiresGuardianConsent || config.audience === "minor";
}

async function getConsentStatus(learnerId: string, required: boolean) {
  if (!required) return { status: "not_required" as const, link: null };
  const approved = await getApprovedGuardianConsent(learnerId);
  if (approved) return { status: "approved" as const, link: approved };
  const latest = await getLatestGuardianLink(learnerId);
  return { status: latest?.status || "pending" as const, link: latest };
}

async function createTransferAssessment(input: {
  session: GPTLessonSessionDoc;
  config: GPTLessonConfig;
  attemptNumber: number;
}) {
  const db = requireAdminDb();
  const generated = await generateAssessment(input.config);
  const docRef = db.collection(GPT_LMS_COLLECTIONS.ASSESSMENTS).doc();
  const now = Timestamp.now();

  const assessment: Omit<GPTLessonAssessmentDoc, "id"> = {
    sessionId: input.session.id,
    learnerId: input.session.learnerId,
    lessonId: input.session.lessonId,
    courseId: input.session.courseId,
    status: "draft",
    quizItems: generated.quizItems,
    quizAnswers: [],
    quizScorePercentage: null,
    transferPrompt: generated.transferPrompt,
    transferResponse: null,
    sealedAt: null,
    dimensionScores: null,
    compositeScorePercentage: null,
    confidenceSelfReport: input.session.confidenceSelfReport,
    passed: false,
    reviewRequired: input.config.requiresInstructorReview || generated.providerDegraded,
    reviewStatus:
      input.config.requiresInstructorReview || generated.providerDegraded
        ? "pending"
        : "not_required",
    reviewerId: null,
    reviewerNote: null,
    reviewedAt: null,
    provider: generated.provider,
    model: generated.model,
    rubricVersion: GPT_LESSON_RUBRIC_VERSION,
    promptVersion: input.session.promptVersion,
    itemVersion: `${input.session.promptVersion}-attempt-${input.attemptNumber}`,
    createdAt: now,
    updatedAt: now,
  };

  await docRef.set({ id: docRef.id, ...assessment });
  await addLearningEvent({
    sessionId: input.session.id,
    learnerId: input.session.learnerId,
    stage: "transfer",
    eventType: "assessment_started",
    actor: "system",
    content: generated.transferPrompt,
    provenance: {
      source: generated.providerDegraded ? "system" : "ai",
      provider: generated.provider,
      model: generated.model,
      promptVersion: input.session.promptVersion,
      itemVersion: assessment.itemVersion,
    },
  });

  return { id: docRef.id, ...assessment } as GPTLessonAssessmentDoc;
}

async function activateSession(input: {
  sessionId: string;
  session?: GPTLessonSessionDoc;
  actor: AuthenticatedActor;
  lesson: LessonDoc;
  guardianConsentId: string | null;
}) {
  const db = requireAdminDb();
  const config = input.lesson.gptConfig;
  if (!config) throw new GPTLessonAuthError("Lesson is not configured as a GPT Lesson", 400);

  const initialTurn = await generateStageTurn({
    config,
    stage: "notice",
    learnerResponse: null,
    hintsUsed: 0,
  });

  const sessionData = baseSession({
    learnerId: input.actor.teamMember.id,
    learnerAuthUid: input.actor.firebaseUid,
    lessonId: input.lesson.id,
    courseId: input.lesson.courseId,
    enrollmentId: input.session?.enrollmentId || "",
    status: "active",
    guardianConsentId: input.guardianConsentId,
    provider: initialTurn.provider,
    model: initialTurn.model,
    providerDegraded: initialTurn.providerDegraded,
  });

  if (input.session) {
    await db.collection(GPT_LMS_COLLECTIONS.SESSIONS).doc(input.session.id).update({
      ...sessionData,
      enrollmentId: input.session.enrollmentId,
      startedAt: input.session.startedAt,
    });
  } else {
    await db.collection(GPT_LMS_COLLECTIONS.SESSIONS).doc(input.sessionId).set({
      id: input.sessionId,
      ...sessionData,
    });
  }

  await addLearningEvent({
    sessionId: input.sessionId,
    learnerId: input.actor.teamMember.id,
    stage: "notice",
    eventType: input.session ? "stage_started" : "session_started",
    actor: "system",
    content: "GPT Lesson session started.",
  });
  await addLearningEvent({
    sessionId: input.sessionId,
    learnerId: input.actor.teamMember.id,
    stage: "notice",
    eventType: "assistant_feedback",
    actor: "assistant",
    content: initialTurn.assistantMessage,
    provenance: {
      source: initialTurn.providerDegraded ? "system" : "ai",
      provider: initialTurn.provider,
      model: initialTurn.model,
      promptVersion: GPT_LESSON_PROMPT_VERSION,
    },
  });

  if (initialTurn.providerDegraded) {
    await addLearningEvent({
      sessionId: input.sessionId,
      learnerId: input.actor.teamMember.id,
      stage: "notice",
      eventType: "provider_fallback",
      actor: "system",
      content: "The AI provider was unavailable, so a safe fallback prompt was used.",
      visibility: "staff",
    });
  }

  return getSessionOrThrow(input.sessionId);
}

async function respondToStage(input: {
  actor: AuthenticatedActor;
  session: GPTLessonSessionDoc;
  response: string;
  confidenceSelfReport?: number;
}): Promise<GPTLessonClientState> {
  const db = requireAdminDb();
  const lesson = await getLessonOrThrow(input.session.lessonId);
  const config = lesson.gptConfig;
  if (!config) throw new GPTLessonAuthError("Lesson is not configured as a GPT Lesson", 400);

  if (!["active", "provider_degraded"].includes(input.session.status)) {
    throw new GPTLessonAuthError("This GPT Lesson is not currently accepting responses", 409);
  }
  if (input.session.currentStage === "transfer") {
    throw new GPTLessonAuthError("Use the sealed assessment submission for the transfer stage", 409);
  }

  const currentStage = input.session.currentStage;
  const stageState = input.session.stageState[currentStage];
  await addLearningEvent({
    sessionId: input.session.id,
    learnerId: input.session.learnerId,
    stage: currentStage,
    eventType: "student_response",
    actor: "student",
    content: input.response,
  });

  const safety = screenLearnerText(input.response, config.audience === "minor");
  if (safety.severity !== "none") {
    await addLearningEvent({
      sessionId: input.session.id,
      learnerId: input.session.learnerId,
      stage: currentStage,
      eventType: "safety_flag",
      actor: "system",
      content: safety.message || "A safety concern was detected.",
      visibility: safety.severity === "high" ? "staff" : "learner",
    });
    if (safety.severity !== "low") {
      await addSafetyIncident({
        sessionId: input.session.id,
        learnerId: input.session.learnerId,
        lessonId: input.session.lessonId,
        severity: safety.severity,
        category: safety.category || "safety",
        excerpt: input.response,
        createdBy: "system",
      });
    }
    if (shouldPauseForSafety(safety)) {
      await db.collection(GPT_LMS_COLLECTIONS.SESSIONS).doc(input.session.id).update({
        status: "safety_hold",
        lastActivityAt: Timestamp.now(),
      });
      const freshSession = await getSessionOrThrow(input.session.id);
      const assessment = freshSession.activeAssessmentId
        ? await getAssessmentOrThrow(freshSession.activeAssessmentId)
        : null;
      const consent = await getConsentStatus(input.session.learnerId, requiresConsent(config));
      return buildClientState({
        session: freshSession,
        configMaxHints: config.maxHints,
        requiresGuardianConsent: requiresConsent(config),
        consentStatus: consent.status,
        assessment,
      });
    }
  }

  const turn = await generateStageTurn({
    config,
    stage: currentStage,
    learnerResponse: input.response,
    hintsUsed: stageState.hintsUsed,
  });

  if (shouldPauseForSafety(turn.safetyResult)) {
    await addSafetyIncident({
      sessionId: input.session.id,
      learnerId: input.session.learnerId,
      lessonId: input.session.lessonId,
      severity: "high",
      category: turn.safetyResult.category || "model_safety_flag",
      excerpt: input.response,
      createdBy: "model",
    });
    await db.collection(GPT_LMS_COLLECTIONS.SESSIONS).doc(input.session.id).update({
      status: "safety_hold",
      stageState: {
        ...input.session.stageState,
        [currentStage]: {
          ...stageState,
          attempts: stageState.attempts + 1,
          lastResponse: input.response,
        },
      },
      lastActivityAt: Timestamp.now(),
    });
  } else {
    await addLearningEvent({
      sessionId: input.session.id,
      learnerId: input.session.learnerId,
      stage: currentStage,
      eventType: "assistant_feedback",
      actor: "assistant",
      content: turn.assistantMessage,
      provenance: {
        source: turn.providerDegraded ? "system" : "ai",
        provider: turn.provider,
        model: turn.model,
        promptVersion: input.session.promptVersion,
      },
    });

    const updatedStageState = {
      ...input.session.stageState,
      [currentStage]: {
        ...stageState,
        attempts: stageState.attempts + 1,
        lastResponse: input.response,
        completedAt: turn.readyToAdvance ? Timestamp.now() : stageState.completedAt,
      },
    };
    const evidenceSummary = { ...input.session.evidenceSummary };
    for (const [dimension, evidence] of Object.entries(turn.evidence)) {
      if (evidence) evidenceSummary[dimension as keyof typeof evidenceSummary] = evidence;
    }

    const targetStage = turn.readyToAdvance ? nextStage(currentStage) : currentStage;
    let activeAssessmentId = input.session.activeAssessmentId;
    let status = input.session.status;
    let transferAttemptCount = input.session.transferAttemptCount;

    await db.collection(GPT_LMS_COLLECTIONS.SESSIONS).doc(input.session.id).update({
      currentStage: targetStage,
      stageState: updatedStageState,
      evidenceSummary,
      confidenceSelfReport: input.confidenceSelfReport ?? input.session.confidenceSelfReport,
      provider: turn.provider,
      model: turn.model,
      providerDegraded: turn.providerDegraded,
      lastActivityAt: Timestamp.now(),
    });

    if (turn.readyToAdvance && targetStage && targetStage !== currentStage) {
      if (targetStage === "transfer") {
        const freshSession = await getSessionOrThrow(input.session.id);
        transferAttemptCount += 1;
        const assessment = await createTransferAssessment({
          session: { ...freshSession, transferAttemptCount },
          config,
          attemptNumber: transferAttemptCount,
        });
        activeAssessmentId = assessment.id;
        await db.collection(GPT_LMS_COLLECTIONS.SESSIONS).doc(input.session.id).update({
          activeAssessmentId,
          transferAttemptCount,
          lastActivityAt: Timestamp.now(),
        });
      } else {
        const nextTurn = await generateStageTurn({
          config,
          stage: targetStage,
          learnerResponse: null,
          hintsUsed: 0,
        });
        await addLearningEvent({
          sessionId: input.session.id,
          learnerId: input.session.learnerId,
          stage: targetStage,
          eventType: "stage_started",
          actor: "assistant",
          content: nextTurn.assistantMessage,
          provenance: {
            source: nextTurn.providerDegraded ? "system" : "ai",
            provider: nextTurn.provider,
            model: nextTurn.model,
            promptVersion: input.session.promptVersion,
          },
        });
        await db.collection(GPT_LMS_COLLECTIONS.SESSIONS).doc(input.session.id).update({
          provider: nextTurn.provider,
          model: nextTurn.model,
          providerDegraded: nextTurn.providerDegraded,
          lastActivityAt: Timestamp.now(),
        });
      }
    }

    status = (await getSessionOrThrow(input.session.id)).status;
    input.session = { ...input.session, status };
  }

  const freshSession = await getSessionOrThrow(input.session.id);
  const assessment = freshSession.activeAssessmentId
    ? await getAssessmentOrThrow(freshSession.activeAssessmentId)
    : null;
  const consent = await getConsentStatus(input.session.learnerId, requiresConsent(config));
  return buildClientState({
    session: freshSession,
    configMaxHints: config.maxHints,
    requiresGuardianConsent: requiresConsent(config),
    consentStatus: consent.status,
    assessment,
    providerDegraded: turn.providerDegraded,
  });
}

async function requestHint(input: {
  actor: AuthenticatedActor;
  session: GPTLessonSessionDoc;
}): Promise<GPTLessonClientState> {
  const db = requireAdminDb();
  const lesson = await getLessonOrThrow(input.session.lessonId);
  const config = lesson.gptConfig;
  if (!config) throw new GPTLessonAuthError("Lesson is not configured as a GPT Lesson", 400);

  const currentStage = input.session.currentStage;
  const stageState = input.session.stageState[currentStage];
  if (input.session.status !== "active") {
    throw new GPTLessonAuthError("Hints are not available for this session state", 409);
  }
  if (currentStage === "transfer" || stageState.attempts === 0) {
    throw new GPTLessonAuthError("Submit your own attempt before requesting a hint", 409);
  }
  if (stageState.hintsUsed >= config.maxHints) {
    throw new GPTLessonAuthError("No hints remain for this stage", 409);
  }

  const hint = await generateHint({
    config,
    stage: currentStage,
    learnerResponse: stageState.lastResponse,
    hintsUsed: stageState.hintsUsed,
  });

  await addLearningEvent({
    sessionId: input.session.id,
    learnerId: input.session.learnerId,
    stage: currentStage,
    eventType: "hint",
    actor: "assistant",
    content: `${hint.hint}${hint.assistantMessage ? `\n\n${hint.assistantMessage}` : ""}`,
    provenance: {
      source: hint.providerDegraded ? "system" : "ai",
      provider: hint.provider,
      model: hint.model,
      promptVersion: input.session.promptVersion,
    },
  });

  await db.collection(GPT_LMS_COLLECTIONS.SESSIONS).doc(input.session.id).update({
    stageState: {
      ...input.session.stageState,
      [currentStage]: { ...stageState, hintsUsed: stageState.hintsUsed + 1 },
    },
    providerDegraded: hint.providerDegraded,
    lastActivityAt: Timestamp.now(),
  });

  const freshSession = await getSessionOrThrow(input.session.id);
  const assessment = freshSession.activeAssessmentId
    ? await getAssessmentOrThrow(freshSession.activeAssessmentId)
    : null;
  const consent = await getConsentStatus(input.session.learnerId, requiresConsent(config));
  return buildClientState({
    session: freshSession,
    configMaxHints: config.maxHints,
    requiresGuardianConsent: requiresConsent(config),
    consentStatus: consent.status,
    assessment,
    providerDegraded: hint.providerDegraded,
  });
}

async function submitAssessment(input: {
  actor: AuthenticatedActor;
  session: GPTLessonSessionDoc;
  quizAnswers: number[];
  transferResponse: string;
}): Promise<GPTLessonClientState> {
  const db = requireAdminDb();
  const lesson = await getLessonOrThrow(input.session.lessonId);
  const config = lesson.gptConfig;
  if (!config) throw new GPTLessonAuthError("Lesson is not configured as a GPT Lesson", 400);
  if (input.session.currentStage !== "transfer" || !input.session.activeAssessmentId) {
    throw new GPTLessonAuthError("The transfer assessment is not ready", 409);
  }

  const assessment = await getAssessmentOrThrow(input.session.activeAssessmentId);
  if (assessment.status !== "draft") {
    throw new GPTLessonAuthError("This assessment response is already sealed", 409);
  }
  if (input.quizAnswers.length !== assessment.quizItems.length) {
    throw new GPTLessonAuthError("Answer every knowledge-check question before submitting", 400);
  }

  const safety = screenLearnerText(input.transferResponse, config.audience === "minor");
  if (safety.severity !== "none") {
    await addLearningEvent({
      sessionId: input.session.id,
      learnerId: input.session.learnerId,
      stage: "transfer",
      eventType: "safety_flag",
      actor: "system",
      content: safety.message || "A safety concern was detected.",
      visibility: safety.severity === "high" ? "staff" : "learner",
    });
    if (safety.severity !== "low") {
      await addSafetyIncident({
        sessionId: input.session.id,
        learnerId: input.session.learnerId,
        lessonId: input.session.lessonId,
        severity: safety.severity,
        category: safety.category || "safety",
        excerpt: input.transferResponse,
        createdBy: "system",
      });
    }
    if (shouldPauseForSafety(safety)) {
      await db.collection(GPT_LMS_COLLECTIONS.SESSIONS).doc(input.session.id).update({
        status: "safety_hold",
        lastActivityAt: Timestamp.now(),
      });
      const freshSession = await getSessionOrThrow(input.session.id);
      return buildClientState({
        session: freshSession,
        configMaxHints: config.maxHints,
        requiresGuardianConsent: requiresConsent(config),
        consentStatus: "approved",
        assessment,
      });
    }
  }

  const assessmentRef = db.collection(GPT_LMS_COLLECTIONS.ASSESSMENTS).doc(assessment.id);
  await assessmentRef.update({
    quizAnswers: input.quizAnswers,
    transferResponse: input.transferResponse,
    sealedAt: Timestamp.now(),
    status: "sealed",
    updatedAt: Timestamp.now(),
  });
  await addLearningEvent({
    sessionId: input.session.id,
    learnerId: input.session.learnerId,
    stage: "transfer",
    eventType: "assessment_submitted",
    actor: "student",
    content: input.transferResponse,
    visibility: "staff",
  });

  const score = await scoreAssessment({
    config,
    transferPrompt: assessment.transferPrompt,
    transferResponse: input.transferResponse,
    quizItems: assessment.quizItems,
    quizAnswers: input.quizAnswers,
  });
  const passed = !score.providerDegraded && assessmentPassed({
    quizScorePercentage: score.quizScorePercentage,
    dimensionScores: score.dimensionScores,
    config,
  });
  const mustReview =
    config.requiresInstructorReview ||
    score.providerDegraded ||
    (!passed && input.session.transferAttemptCount >= config.maxTransferAttempts);
  const reviewStatus = mustReview ? "pending" : "not_required";
  const assessmentStatus = mustReview ? "pending_review" : "scored";

  await assessmentRef.update({
    status: assessmentStatus,
    quizScorePercentage: score.quizScorePercentage,
    dimensionScores: score.dimensionScores,
    compositeScorePercentage: score.compositeScorePercentage,
    passed,
    reviewStatus,
    provider: score.provider,
    model: score.model,
    updatedAt: Timestamp.now(),
  });

  const scoreRef = db.collection(GPT_LMS_COLLECTIONS.SCORES).doc();
  const scoreRecord: GPTScoreRecordDoc = {
    id: scoreRef.id,
    sessionId: input.session.id,
    assessmentId: assessment.id,
    learnerId: input.session.learnerId,
    lessonId: input.session.lessonId,
    courseId: input.session.courseId,
    dimensionScores: score.dimensionScores,
    compositeScorePercentage: score.compositeScorePercentage,
    quizScorePercentage: score.quizScorePercentage,
    confidenceSelfReport: input.session.confidenceSelfReport,
    status: score.compositeScorePercentage === null
      ? "insufficient_evidence"
      : passed
        ? "demonstrated"
        : "developing",
    scoringMethod: mustReview ? "instructor_review" : "deterministic_plus_ai_rubric",
    reviewerId: null,
    rubricVersion: GPT_LESSON_RUBRIC_VERSION,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  await scoreRef.set(scoreRecord);
  await addLearningEvent({
    sessionId: input.session.id,
    learnerId: input.session.learnerId,
    stage: "transfer",
    eventType: "score_recorded",
    actor: "system",
    content: score.summary || "Assessment evidence was recorded.",
    visibility: "staff",
    provenance: {
      source: score.providerDegraded ? "system" : "ai",
      provider: score.provider,
      model: score.model,
      promptVersion: input.session.promptVersion,
      itemVersion: assessment.itemVersion,
    },
  });

  let sessionStatus: GPTLessonSessionDoc["status"];
  if (mustReview) {
    sessionStatus = "pending_review";
  } else if (passed) {
    sessionStatus = "completed";
  } else {
    sessionStatus = "needs_retry";
  }

  await db.collection(GPT_LMS_COLLECTIONS.SESSIONS).doc(input.session.id).update({
    status: sessionStatus,
    completedAt: sessionStatus === "completed" ? Timestamp.now() : null,
    lastActivityAt: Timestamp.now(),
  });

  if (sessionStatus === "completed") {
    await markLessonCompleteAdmin({
      learnerId: input.session.learnerId,
      lessonId: input.session.lessonId,
      courseId: input.session.courseId,
      enrollmentId: input.session.enrollmentId,
    });
  }

  const freshSession = await getSessionOrThrow(input.session.id);
  const freshAssessment = await getAssessmentOrThrow(assessment.id);
  const consent = await getConsentStatus(input.session.learnerId, requiresConsent(config));
  return buildClientState({
    session: freshSession,
    configMaxHints: config.maxHints,
    requiresGuardianConsent: requiresConsent(config),
    consentStatus: consent.status,
    assessment: freshAssessment,
    providerDegraded: score.providerDegraded,
  });
}

async function retryAssessment(input: {
  actor: AuthenticatedActor;
  session: GPTLessonSessionDoc;
}): Promise<GPTLessonClientState> {
  const db = requireAdminDb();
  const lesson = await getLessonOrThrow(input.session.lessonId);
  const config = lesson.gptConfig;
  if (!config) throw new GPTLessonAuthError("Lesson is not configured as a GPT Lesson", 400);
  if (input.session.status !== "needs_retry") {
    throw new GPTLessonAuthError("This lesson does not currently allow another transfer attempt", 409);
  }
  if (input.session.transferAttemptCount >= config.maxTransferAttempts) {
    throw new GPTLessonAuthError("No transfer attempts remain", 409);
  }

  const attemptNumber = input.session.transferAttemptCount + 1;
  const assessment = await createTransferAssessment({
    session: input.session,
    config,
    attemptNumber,
  });
  await db.collection(GPT_LMS_COLLECTIONS.SESSIONS).doc(input.session.id).update({
    status: "active",
    currentStage: "transfer",
    activeAssessmentId: assessment.id,
    transferAttemptCount: attemptNumber,
    lastActivityAt: Timestamp.now(),
  });

  const freshSession = await getSessionOrThrow(input.session.id);
  const consent = await getConsentStatus(input.session.learnerId, requiresConsent(config));
  return buildClientState({
    session: freshSession,
    configMaxHints: config.maxHints,
    requiresGuardianConsent: requiresConsent(config),
    consentStatus: consent.status,
    assessment,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = requestSchema.parse(await request.json()) as GPTLessonRequest;
    const actor = await requireAuthenticatedActor(request);

    switch (body.action) {
      case "start": {
        const lesson = await getLessonOrThrow(body.lessonId);
        if (lesson.contentType !== "gptLesson" || !lesson.gptConfig) {
          return jsonError("This lesson is not configured as a GPT Lesson", 400);
        }
        if (lesson.courseId !== body.courseId) {
          return jsonError("Lesson does not belong to the requested course", 400);
        }
        const enrollment = await getEnrollmentForLearner(actor.teamMember.id, body.courseId);
        if (!enrollment) {
          return jsonError("You must be enrolled in this course before starting the lesson", 403);
        }

        const consent = await getConsentStatus(
          actor.teamMember.id,
          requiresConsent(lesson.gptConfig)
        );
        const sessionId = sessionIdFor(actor.teamMember.id, body.lessonId);
        const db = requireAdminDb();
        const existingSnap = await db.collection(GPT_LMS_COLLECTIONS.SESSIONS).doc(sessionId).get();
        const existing = existingSnap.exists
          ? ({ id: existingSnap.id, ...existingSnap.data() } as GPTLessonSessionDoc)
          : null;

        if (existing && existing.status !== "consent_required") {
          const assessment = existing.activeAssessmentId
            ? await getAssessmentOrThrow(existing.activeAssessmentId)
            : null;
          return NextResponse.json({
            data: await buildClientState({
              session: existing,
              configMaxHints: lesson.gptConfig.maxHints,
              requiresGuardianConsent: requiresConsent(lesson.gptConfig),
              consentStatus: consent.status,
              assessment,
            }),
          });
        }

        if (consent.status !== "not_required" && consent.status !== "approved") {
          const sessionData = baseSession({
            learnerId: actor.teamMember.id,
            learnerAuthUid: actor.firebaseUid,
            lessonId: body.lessonId,
            courseId: body.courseId,
            enrollmentId: enrollment.id,
            status: "consent_required",
            guardianConsentId: consent.link?.id || null,
            provider: null,
            model: null,
            providerDegraded: false,
          });
          await db.collection(GPT_LMS_COLLECTIONS.SESSIONS).doc(sessionId).set({
            id: sessionId,
            ...sessionData,
          });
          await addLearningEvent({
            sessionId,
            learnerId: actor.teamMember.id,
            stage: "notice",
            eventType: "consent_required",
            actor: "system",
            content: "Guardian approval is required before this lesson can begin.",
          });
          const session = await getSessionOrThrow(sessionId);
          return NextResponse.json({
            data: await buildClientState({
              session,
              configMaxHints: lesson.gptConfig.maxHints,
              requiresGuardianConsent: true,
              consentStatus: consent.status,
              assessment: null,
            }),
          });
        }

        const session = await activateSession({
          sessionId,
          session: existing || undefined,
          actor,
          lesson,
          guardianConsentId: consent.link?.id || null,
        });
        session.enrollmentId = enrollment.id;
        await db.collection(GPT_LMS_COLLECTIONS.SESSIONS).doc(sessionId).update({
          enrollmentId: enrollment.id,
        });

        return NextResponse.json({
          data: await buildClientState({
            session: await getSessionOrThrow(sessionId),
            configMaxHints: lesson.gptConfig.maxHints,
            requiresGuardianConsent: requiresConsent(lesson.gptConfig),
            consentStatus: consent.status,
            assessment: null,
          }),
        });
      }
      case "respond": {
        const session = await loadOwnedSession(body.sessionId, actor);
        return NextResponse.json({
          data: await respondToStage({
            actor,
            session,
            response: body.response,
            confidenceSelfReport: body.confidenceSelfReport,
          }),
        });
      }
      case "hint": {
        const session = await loadOwnedSession(body.sessionId, actor);
        return NextResponse.json({ data: await requestHint({ actor, session }) });
      }
      case "submitAssessment": {
        const session = await loadOwnedSession(body.sessionId, actor);
        return NextResponse.json({
          data: await submitAssessment({
            actor,
            session,
            quizAnswers: body.quizAnswers,
            transferResponse: body.transferResponse,
          }),
        });
      }
      case "retryAssessment": {
        const session = await loadOwnedSession(body.sessionId, actor);
        return NextResponse.json({ data: await retryAssessment({ actor, session }) });
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError("Invalid GPT lesson request", 400);
    }
    if (error instanceof GPTLessonAuthError) {
      return jsonError(error.message, error.status);
    }
    console.error("GPT lesson API error:", error);
    return jsonError("Unable to process the GPT lesson request", 500);
  }
}

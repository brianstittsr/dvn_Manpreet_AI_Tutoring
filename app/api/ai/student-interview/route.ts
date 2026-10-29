/**
 * AI Student Interview API
 *
 * POST — authenticated learners. Runs a bounded chat interview that discovers
 * the learner's style, interests, and motivators, then distills it into a
 * learner profile (lms_learner_profiles) that personalizes GPT lessons.
 *
 * Actions:
 *   start   { lessonId, courseId }            → create/resume session
 *   respond { sessionId, message }            → learner reply → next question
 *
 * Guardian consent mirrors GPT lessons: required for minor-audience configs
 * or when interviewConfig.requiresGuardianConsent is set.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Timestamp } from "firebase-admin/firestore";
import { rateLimit } from "@/lib/rate-limit";
import { callStructuredJson } from "@/lib/llm-runtime";
import {
  GPTLessonAuthError,
  addSafetyIncident,
  getApprovedGuardianConsent,
  getEnrollmentForLearner,
  getLatestGuardianLink,
  getLessonOrThrow,
  markLessonCompleteAdmin,
  requireAdminDb,
  requireAuthenticatedActor,
} from "@/lib/gpt-lesson-server";
import { screenLearnerText } from "@/lib/gpt-lesson-safety";
import {
  INTERVIEW_COLLECTIONS,
  appendInterviewTurn,
  buildInterviewTurnPrompt,
  buildProfileExtractionPrompt,
  createInterviewSession,
  getInterviewSession,
  getInterviewTurns,
  getLearnerProfile,
  interviewSessionIdFor,
  upsertLearnerProfile,
} from "@/lib/interview-server";
import type { LearnerProfileData, StudentInterviewConfig } from "@/types/academy";

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
    message: z.string().min(1).max(2000),
  }),
]);

const turnResponseSchema = z.object({
  interviewerMessage: z.string().min(1),
  shouldConclude: z.boolean().optional().default(false),
  concluded: z.string().nullable().optional().default(null),
});

const profileSchema = z.object({
  learningStyles: z.array(z.string()).optional().default([]),
  motivators: z.array(z.string()).optional().default([]),
  interests: z.array(z.string()).optional().default([]),
  pacePreference: z.string().nullable().optional().default(null),
  helpPreference: z.string().nullable().optional().default(null),
  notes: z.string().nullable().optional().default(null),
  tutorSummary: z.string().optional().default(""),
});

const FALLBACK_QUESTIONS = [
  "Hi! I'm so glad you're here. I have a few quick questions so your coach knows how to make learning fun for you. First — what's your favorite thing to learn about, in school or out?",
  "Nice! When you want to learn something new, what works best for you — watching a video, reading, playing a game, or trying it with your hands?",
  "What makes you feel really proud of your work?",
  "What kind of reward makes you want to keep going — stars, badges, streaks, unlocking new things, or hearing 'great job'?",
  "When something gets hard or boring, what usually happens for you?",
  "When you're stuck, what helps most — a hint, an example, trying again, or seeing it done once?",
  "Last one! What do you love doing when you're not in school — hobbies, sports, games, anything?",
];

const FALLBACK_CLOSING =
  "That was awesome — thank you for telling me about how you learn! Your coach will use this to make your lessons fit you even better.";

interface ConsentState {
  status: "not_required" | "approved" | "pending" | "rejected";
  linkId: string | null;
}

async function getInterviewConsent(
  learnerId: string,
  config: StudentInterviewConfig
): Promise<ConsentState> {
  const required = config.requiresGuardianConsent || config.audience === "minor";
  if (!required) return { status: "not_required", linkId: null };
  const approved = await getApprovedGuardianConsent(learnerId);
  if (approved) return { status: "approved", linkId: approved.id };
  const latest = await getLatestGuardianLink(learnerId);
  return { status: (latest?.status as ConsentState["status"]) || "pending", linkId: latest?.id || null };
}

interface ClientStateTurn {
  role: "interviewer" | "learner";
  content: string;
}

interface ClientState {
  sessionId: string;
  status: string;
  turns: ClientStateTurn[];
  turnCount: number;
  maxTurns: number;
  consentStatus: ConsentState["status"];
  profile: LearnerProfileData | null;
}

function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

async function toClientState(input: {
  sessionId: string;
  status: string;
  maxTurns: number;
  turnCount?: number;
  consentStatus: ConsentState["status"];
  profile?: LearnerProfileData | null;
}): Promise<ClientState> {
  const turns = await getInterviewTurns(input.sessionId);
  return {
    sessionId: input.sessionId,
    status: input.status,
    turns: turns.map((t) => ({ role: t.role, content: t.content })),
    turnCount: input.turnCount ?? turns.filter((t) => t.role === "learner").length,
    maxTurns: input.maxTurns,
    consentStatus: input.consentStatus,
    profile: input.profile ?? null,
  };
}

async function finalizeInterview(input: {
  sessionId: string;
  learnerId: string;
  lessonId: string;
  courseId: string;
  enrollmentId: string;
}): Promise<LearnerProfileData> {
  const db = requireAdminDb();
  const turns = await getInterviewTurns(input.sessionId);
  const transcript = turns.map((t) => ({ role: t.role, content: t.content }));

  const extracted = await callStructuredJson(
    profileSchema,
    "You produce accurate, conservative learner-profile JSON from an interview transcript.",
    buildProfileExtractionPrompt(transcript),
    900
  );

  const profile: LearnerProfileData = extracted.data ?? {
    learningStyles: [],
    motivators: [],
    interests: [],
    pacePreference: null,
    helpPreference: null,
    notes: null,
    tutorSummary: "",
  };

  await upsertLearnerProfile({
    odUserId: input.learnerId,
    profile,
    sourceSessionId: input.sessionId,
  });

  await db.collection(INTERVIEW_COLLECTIONS.SESSIONS).doc(input.sessionId).update({
    status: "completed",
    completedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    provider: extracted.provider,
    model: extracted.model,
    providerDegraded: extracted.providerDegraded,
  });

  await markLessonCompleteAdmin({
    learnerId: input.learnerId,
    lessonId: input.lessonId,
    courseId: input.courseId,
    enrollmentId: input.enrollmentId,
  });

  return profile;
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, {
    scope: "student-interview",
    limit: 30,
    windowMs: 60_000,
  });
  if (limited) return limited;

  try {
    const actor = await requireAuthenticatedActor(request);
    const learnerId = actor.teamMember.id;

    const body = await request.json().catch(() => null);
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid request", 400);
    }

    if (parsed.data.action === "start") {
      const { lessonId, courseId } = parsed.data;
      const lesson = await getLessonOrThrow(lessonId);
      if (lesson.contentType !== "studentInterview" || !lesson.interviewConfig) {
        return jsonError("This lesson is not an AI student interview", 400);
      }
      const config = lesson.interviewConfig;
      const enrollment = await getEnrollmentForLearner(learnerId, courseId);
      if (!enrollment) {
        return jsonError("You must be enrolled in this course to start", 403);
      }

      const consent = await getInterviewConsent(learnerId, config);
      const sessionId = interviewSessionIdFor(learnerId, lessonId);
      const existing = await getInterviewSession(sessionId);

      if (existing) {
        if (existing.status === "completed") {
          const profile = await getLearnerProfile(learnerId);
          return NextResponse.json({
            data: await toClientState({
              sessionId,
              status: "completed",
              maxTurns: config.maxTurns,
              consentStatus: consent.status,
              profile: profile?.profile ?? null,
            }),
          });
        }
        if (existing.status === "paused_safety") {
          return NextResponse.json({
            data: await toClientState({
              sessionId,
              status: "paused_safety",
              maxTurns: config.maxTurns,
              consentStatus: consent.status,
            }),
          });
        }
        if (existing.status === "in_progress") {
          return NextResponse.json({
            data: await toClientState({
              sessionId,
              status: "in_progress",
              maxTurns: config.maxTurns,
              turnCount: existing.turnCount,
              consentStatus: consent.status,
            }),
          });
        }
      }

      if (consent.status !== "not_required" && consent.status !== "approved") {
        if (!existing) {
          await createInterviewSession({
            learnerId,
            learnerAuthUid: actor.firebaseUid,
            lessonId,
            courseId,
            enrollmentId: enrollment.id,
            status: "consent_required",
            guardianConsentId: consent.linkId,
            provider: null,
            model: null,
            providerDegraded: false,
          });
        }
        return NextResponse.json({
          data: {
            sessionId,
            status: "consent_required",
            turns: [],
            turnCount: 0,
            maxTurns: config.maxTurns,
            consentStatus: consent.status,
            profile: null,
          } satisfies ClientState,
        });
      }

      const session =
        existing && existing.status === "consent_required"
          ? existing
          : await createInterviewSession({
              learnerId,
              learnerAuthUid: actor.firebaseUid,
              lessonId,
              courseId,
              enrollmentId: enrollment.id,
              status: "in_progress",
              guardianConsentId: consent.linkId,
              provider: null,
              model: null,
              providerDegraded: false,
            });

      const opening = await callStructuredJson(
        turnResponseSchema,
        config.systemPrompt,
        buildInterviewTurnPrompt({
          systemPrompt: config.systemPrompt,
          transcript: [],
          learnerTurns: 0,
          minTurns: config.minTurns,
          maxTurns: config.maxTurns,
        }),
        400
      );

      const openingMessage = opening.data?.interviewerMessage || FALLBACK_QUESTIONS[0];
      await appendInterviewTurn({ sessionId, role: "interviewer", content: openingMessage });

      const db = requireAdminDb();
      await db.collection(INTERVIEW_COLLECTIONS.SESSIONS).doc(sessionId).update({
        status: "in_progress",
        guardianConsentId: consent.linkId,
        provider: opening.provider,
        model: opening.model,
        providerDegraded: opening.providerDegraded,
        updatedAt: Timestamp.now(),
      });

      return NextResponse.json({
        data: await toClientState({
          sessionId: session.id,
          status: "in_progress",
          maxTurns: config.maxTurns,
          consentStatus: consent.status,
        }),
      });
    }

    // action === "respond"
    const { sessionId, message } = parsed.data;
    const session = await getInterviewSession(sessionId);
    if (!session || session.learnerId !== learnerId) {
      return jsonError("Interview session not found", 404);
    }
    if (session.status !== "in_progress") {
      return jsonError(`This interview is ${session.status}`, 409);
    }

    const lesson = await getLessonOrThrow(session.lessonId);
    const config = lesson.interviewConfig;
    if (!config) {
      return jsonError("Interview configuration is missing", 500);
    }

    const safety = screenLearnerText(message, config.audience === "minor");
    if (safety.severity === "high") {
      await addSafetyIncident({
        sessionId,
        learnerId,
        lessonId: session.lessonId,
        severity: "high",
        category: safety.category || "learner_safety_disclosure",
        excerpt: message,
        createdBy: "system",
      });
      await requireAdminDb()
        .collection(INTERVIEW_COLLECTIONS.SESSIONS)
        .doc(sessionId)
        .update({ status: "paused_safety", updatedAt: Timestamp.now() });
      return NextResponse.json({
        data: await toClientState({
          sessionId,
          status: "paused_safety",
          maxTurns: config.maxTurns,
          consentStatus: "approved",
        }),
      });
    }

    await appendInterviewTurn({ sessionId, role: "learner", content: message });

    const turns = await getInterviewTurns(sessionId);
    const transcript = turns.map((t) => ({ role: t.role, content: t.content }));
    const learnerTurns = transcript.filter((t) => t.role === "learner").length;

    const turn = await callStructuredJson(
      turnResponseSchema,
      config.systemPrompt,
      buildInterviewTurnPrompt({
        systemPrompt: config.systemPrompt,
        transcript,
        learnerTurns,
        minTurns: config.minTurns,
        maxTurns: config.maxTurns,
      }),
      400
    );

    const hitMax = learnerTurns >= config.maxTurns;
    const conclude = hitMax || (learnerTurns >= config.minTurns && (turn.data?.shouldConclude ?? false));

    if (conclude) {
      const closing = turn.data?.concluded || (hitMax ? FALLBACK_CLOSING : turn.data?.interviewerMessage) || FALLBACK_CLOSING;
      await appendInterviewTurn({ sessionId, role: "interviewer", content: closing });
      const profile = await finalizeInterview({
        sessionId,
        learnerId,
        lessonId: session.lessonId,
        courseId: session.courseId,
        enrollmentId: session.enrollmentId,
      });
      return NextResponse.json({
        data: await toClientState({
          sessionId,
          status: "completed",
          maxTurns: config.maxTurns,
          consentStatus: "approved",
          profile,
        }),
      });
    }

    const fallbackIndex = Math.min(learnerTurns, FALLBACK_QUESTIONS.length - 1);
    const nextMessage =
      turn.data?.interviewerMessage || FALLBACK_QUESTIONS[fallbackIndex] || FALLBACK_CLOSING;
    await appendInterviewTurn({ sessionId, role: "interviewer", content: nextMessage });

    return NextResponse.json({
      data: await toClientState({
        sessionId,
        status: "in_progress",
        maxTurns: config.maxTurns,
        turnCount: learnerTurns,
        consentStatus: "approved",
      }),
    });
  } catch (error) {
    if (error instanceof GPTLessonAuthError) {
      return jsonError(error.message, error.status);
    }
    console.error("Student interview error:", error);
    return jsonError("The interview hit a problem — please try again", 500);
  }
}

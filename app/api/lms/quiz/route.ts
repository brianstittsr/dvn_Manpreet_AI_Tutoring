import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import {
  GPTLessonAuthError,
  isStaffRole,
  requireAdminDb,
} from "@/lib/gpt-lesson-server";
import {
  getEnrollmentById,
  parseQuizContent,
  recalcEnrollmentProgress,
  requireLearner,
  setLessonCompleteServer,
} from "@/lib/lms-server";
import { LMS_COLLECTIONS, type LessonDoc } from "@/lib/firebase-lms";

export const dynamic = "force-dynamic";

const submitSchema = z.object({
  lessonId: z.string().min(1).max(120),
  courseId: z.string().min(1).max(120),
  enrollmentId: z.string().min(1).max(120),
  answers: z.array(z.number().int().min(0).max(25)).min(1).max(100),
});

function handleError(error: unknown): NextResponse {
  if (error instanceof GPTLessonAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("[lms/quiz] error:", error);
  return NextResponse.json({ error: "Quiz request failed" }, { status: 500 });
}

async function loadQuizLesson(lessonId: string) {
  const db = requireAdminDb();
  const snap = await db.collection(LMS_COLLECTIONS.LESSONS).doc(lessonId).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() as Omit<LessonDoc, "id">) };
}

/**
 * GET /api/lms/quiz?lessonId= — return the quiz questions WITHOUT answers
 * (correctAnswer/explanation stripped). Scoring happens server-side only.
 */
export async function GET(request: NextRequest) {
  try {
    await requireLearner(request);
    const lessonId = request.nextUrl.searchParams.get("lessonId");
    if (!lessonId) {
      return NextResponse.json({ error: "lessonId is required" }, { status: 400 });
    }

    const lesson = await loadQuizLesson(lessonId);
    if (!lesson || lesson.contentType !== "quiz" || !lesson.textContent) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const quiz = parseQuizContent(lesson.textContent);
    return NextResponse.json({
      data: {
        title: quiz.title ?? lesson.title,
        passingScore: quiz.passingScore,
        questions: quiz.questions.map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options,
        })),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/lms/quiz — submit answers, score server-side, store the attempt,
 * and mark the lesson complete when passed. Questions/answers are never
 * trusted from the client.
 */
export async function POST(request: NextRequest) {
  try {
    const learner = await requireLearner(request);
    const parsed = submitSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid quiz submission" }, { status: 400 });
    }
    const { lessonId, courseId, enrollmentId, answers } = parsed.data;

    const enrollment = await getEnrollmentById(enrollmentId);
    if (!enrollment || enrollment.courseId !== courseId) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }
    if (enrollment.userId !== learner.learnerId && !isStaffRole(learner.actor.teamMember.role)) {
      return NextResponse.json({ error: "Not your enrollment" }, { status: 403 });
    }

    const lesson = await loadQuizLesson(lessonId);
    if (!lesson || lesson.contentType !== "quiz" || !lesson.textContent) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const quiz = parseQuizContent(lesson.textContent);
    if (quiz.questions.length === 0) {
      return NextResponse.json({ error: "Quiz has no questions" }, { status: 422 });
    }

    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct += 1;
    });
    const score = Math.round((correct / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    const db = requireAdminDb();
    const attemptRef = db.collection("lms_quiz_attempts").doc();
    await attemptRef.set({
      id: attemptRef.id,
      odUserId: enrollment.userId,
      lessonId,
      courseId,
      enrollmentId,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation ?? null,
      })),
      answers,
      score,
      totalQuestions: quiz.questions.length,
      passed,
      passingScore: quiz.passingScore,
      startedAt: Timestamp.now(),
      completedAt: Timestamp.now(),
    });

    let certificateId: string | null = null;
    let progressPercentage = enrollment.progressPercentage;
    if (passed) {
      await setLessonCompleteServer({
        learnerId: enrollment.userId,
        lessonId,
        courseId,
        enrollmentId,
        completed: true,
      });
      const result = await recalcEnrollmentProgress({
        enrollmentId,
        courseId,
        learnerId: enrollment.userId,
        recipientName: learner.displayName,
      });
      progressPercentage = result.progressPercentage;
      certificateId = result.certificateId;
    }

    return NextResponse.json({
      data: {
        attemptId: attemptRef.id,
        score,
        passed,
        passingScore: quiz.passingScore,
        correctCount: correct,
        totalQuestions: quiz.questions.length,
        answers,
        questions: quiz.questions.map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation ?? null,
        })),
        progressPercentage,
        certificateId,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

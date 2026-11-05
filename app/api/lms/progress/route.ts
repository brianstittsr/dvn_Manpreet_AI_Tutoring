import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GPTLessonAuthError, isStaffRole } from "@/lib/gpt-lesson-server";
import {
  getEnrollmentById,
  recalcEnrollmentProgress,
  requireLearner,
  setLessonCompleteServer,
} from "@/lib/lms-server";

export const dynamic = "force-dynamic";

const progressSchema = z.object({
  lessonId: z.string().min(1).max(120),
  courseId: z.string().min(1).max(120),
  enrollmentId: z.string().min(1).max(120),
  completed: z.boolean().default(true),
});

function handleError(error: unknown): NextResponse {
  if (error instanceof GPTLessonAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("[lms/progress] error:", error);
  return NextResponse.json({ error: "Progress update failed" }, { status: 500 });
}

/**
 * POST /api/lms/progress — mark a lesson complete/incomplete and recompute
 * the enrollment. Issues the certificate server-side at 100% and returns it.
 */
export async function POST(request: NextRequest) {
  try {
    const learner = await requireLearner(request);
    const parsed = progressSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid progress payload" }, { status: 400 });
    }
    const { lessonId, courseId, enrollmentId, completed } = parsed.data;

    const enrollment = await getEnrollmentById(enrollmentId);
    if (!enrollment || enrollment.courseId !== courseId) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }
    const owns = enrollment.userId === learner.learnerId;
    if (!owns && !isStaffRole(learner.actor.teamMember.role)) {
      return NextResponse.json({ error: "Not your enrollment" }, { status: 403 });
    }

    await setLessonCompleteServer({
      learnerId: enrollment.userId,
      lessonId,
      courseId,
      enrollmentId,
      completed,
    });

    const result = await recalcEnrollmentProgress({
      enrollmentId,
      courseId,
      learnerId: enrollment.userId,
      recipientName: learner.displayName,
    });

    return NextResponse.json({
      data: {
        lessonId,
        isCompleted: completed,
        progressPercentage: result.progressPercentage,
        courseCompleted: result.completed,
        certificateId: result.certificateId,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GPTLessonAuthError } from "@/lib/gpt-lesson-server";
import {
  getEnrollmentFor,
  issueCertificateIfComplete,
  requireLearner,
} from "@/lib/lms-server";

export const dynamic = "force-dynamic";

const certSchema = z.object({
  courseId: z.string().min(1).max(120),
  // Staff may request for another learner's enrollment
  enrollmentId: z.string().min(1).max(120).optional(),
});

function handleError(error: unknown): NextResponse {
  if (error instanceof GPTLessonAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("[lms/certificate] error:", error);
  return NextResponse.json({ error: "Certificate request failed" }, { status: 500 });
}

/**
 * POST /api/lms/certificate — ensure a completion certificate exists for a
 * finished enrollment. Idempotent; refuses when the course isn't complete.
 */
export async function POST(request: NextRequest) {
  try {
    const learner = await requireLearner(request);
    const parsed = certSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    const enrollment = await getEnrollmentFor(learner.learnerId, parsed.data.courseId);
    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }
    if (!enrollment.completedAt) {
      return NextResponse.json({ error: "Course not yet completed" }, { status: 409 });
    }

    const certificateId = await issueCertificateIfComplete({
      enrollmentId: enrollment.id,
      learnerId: learner.learnerId,
      courseId: parsed.data.courseId,
      recipientName: learner.displayName,
    });

    return NextResponse.json({ data: { certificateId } });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * GET /api/lms/certificate?courseId= — the caller's certificate id, if issued.
 */
export async function GET(request: NextRequest) {
  try {
    const learner = await requireLearner(request);
    const courseId = request.nextUrl.searchParams.get("courseId");
    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }
    const enrollment = await getEnrollmentFor(learner.learnerId, courseId);
    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }
    return NextResponse.json({
      data: {
        completed: Boolean(enrollment.completedAt),
        certificateId: enrollment.certificateId,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

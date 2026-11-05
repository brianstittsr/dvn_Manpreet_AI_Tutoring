import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  GPTLessonAuthError,
  isStaffRole,
  requireAdminDb,
} from "@/lib/gpt-lesson-server";
import { ensureEnrollment, getEnrollmentFor, requireLearner } from "@/lib/lms-server";
import { LMS_COLLECTIONS, type CourseDoc } from "@/lib/firebase-lms";

export const dynamic = "force-dynamic";

const enrollSchema = z.object({
  courseId: z.string().min(1).max(120),
});

function handleError(error: unknown): NextResponse {
  if (error instanceof GPTLessonAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("[lms/enroll] error:", error);
  return NextResponse.json({ error: "Enrollment failed" }, { status: 500 });
}

/**
 * POST /api/lms/enroll — enroll the caller in a course.
 * Free courses enroll immediately; paid courses must go through checkout
 * (this route refuses them, so enrollment can't be forged for paid content).
 */
export async function POST(request: NextRequest) {
  try {
    const learner = await requireLearner(request);
    const parsed = enrollSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    const db = requireAdminDb();
    const courseSnap = await db
      .collection(LMS_COLLECTIONS.COURSES)
      .doc(parsed.data.courseId)
      .get();
    if (!courseSnap.exists) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    const course = courseSnap.data() as CourseDoc;

    if (!course.isPublished && !isStaffRole(learner.actor.teamMember.role)) {
      return NextResponse.json({ error: "Course is not available" }, { status: 404 });
    }

    const existing = await getEnrollmentFor(learner.learnerId, course.id);
    if (existing) {
      return NextResponse.json({
        data: { enrollmentId: existing.id, alreadyEnrolled: true },
      });
    }

    const isFree = course.isFree || !course.priceInCents || course.priceInCents <= 0;
    if (!isFree && !isStaffRole(learner.actor.teamMember.role)) {
      return NextResponse.json(
        { error: "This course requires purchase — complete checkout to enroll", code: "PAYMENT_REQUIRED" },
        { status: 402 }
      );
    }

    const { enrollmentId, created } = await ensureEnrollment(learner.learnerId, course.id);
    return NextResponse.json(
      { data: { enrollmentId, alreadyEnrolled: !created } },
      { status: created ? 201 : 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_CONFIG } from "@/lib/stripe";

import { Timestamp } from "firebase-admin/firestore";
import { LMS_COLLECTIONS, type CourseDoc } from "@/lib/firebase-lms";
import {
  GPTLessonAuthError,
  requireAdminDb,
} from "@/lib/gpt-lesson-server";
import { ensureEnrollment, getEnrollmentFor, requireLearner } from "@/lib/lms-server";
import Stripe from "stripe";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const checkoutSchema = z.object({
  courseIds: z.array(z.string().min(1).max(120)).min(1).max(20),
});

function handleError(error: unknown): NextResponse {
  if (error instanceof GPTLessonAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("Error creating course checkout session:", error);
  return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
}

/**
 * POST /api/stripe/course-checkout
 *
 * Authenticated only — the buyer's identity is resolved server-side from the
 * Firebase ID token (never trusted from the request body). Free courses are
 * enrolled immediately (idempotent); paid courses create pending purchases +
 * a Stripe session, and the webhook enrolls on payment.
 */
export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { scope: "stripe-course-checkout", limit: 15, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const learner = await requireLearner(request);
    const parsed = checkoutSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const { courseIds } = parsed.data;
    const db = requireAdminDb();

    // Fetch all courses and validate
    const courses: CourseDoc[] = [];

    for (const courseId of courseIds) {
      const courseSnap = await db.collection(LMS_COLLECTIONS.COURSES).doc(courseId).get();
      if (!courseSnap.exists) {
        return NextResponse.json({ error: `Course ${courseId} not found` }, { status: 404 });
      }
      const course = { id: courseSnap.id, ...courseSnap.data() } as CourseDoc;
      if (!course.isPublished) {
        return NextResponse.json(
          { error: `Course "${course.title}" is not available for purchase` },
          { status: 400 }
        );
      }
      courses.push(course);
    }

    // Drop courses the learner already owns — never double-enroll/double-charge
    const unowned: CourseDoc[] = [];
    const alreadyOwned: CourseDoc[] = [];
    for (const course of courses) {
      const existing = await getEnrollmentFor(learner.learnerId, course.id);
      (existing ? alreadyOwned : unowned).push(course);
    }

    if (unowned.length === 0) {
      return NextResponse.json({
        data: {
          isFree: true,
          enrollmentIds: [],
          alreadyOwned: alreadyOwned.map((c) => c.id),
          redirectUrl: "/portal/my-courses",
        },
      });
    }

    const payableSubtotal = unowned.reduce(
      (sum, c) => sum + (c.isFree ? 0 : c.priceInCents),
      0
    );

    // All remaining courses free (or all paid ones owned) → enroll directly
    if (payableSubtotal === 0) {
      const enrollmentIds: string[] = [];
      for (const course of unowned) {
        const purchaseRef = await db.collection(LMS_COLLECTIONS.COURSE_PURCHASES).add({
          odUserId: learner.learnerId,
          userEmail: learner.email,
          userName: learner.displayName,
          courseId: course.id,
          courseTitle: course.title,
          priceInCents: 0,
          discountInCents: 0,
          totalInCents: 0,
          couponCode: null,
          stripeSessionId: null,
          stripePaymentIntentId: null,
          paymentStatus: "paid",
          purchasedAt: Timestamp.now(),
          refundedAt: null,
          refundReason: null,
          createdAt: Timestamp.now(),
        });

        const { enrollmentId } = await ensureEnrollment(
          learner.learnerId,
          course.id,
          purchaseRef.id
        );
        enrollmentIds.push(enrollmentId);
      }

      return NextResponse.json({
        data: {
          success: true,
          isFree: true,
          enrollmentIds,
          alreadyOwned: alreadyOwned.map((c) => c.id),
          redirectUrl: "/portal/my-courses?enrolled=true",
        },
      });
    }

    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
    }

    // Build Stripe line items for the unowned paid courses; free courses in
    // the cart are enrolled immediately alongside the paid purchase.
    const paidCourses = unowned.filter((c) => !c.isFree && c.priceInCents > 0);
    const stripeLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = paidCourses.map(
      (course) => ({
        price_data: {
          currency: STRIPE_CONFIG.currency,
          product_data: {
            name: course.title,
            description: course.shortDescription || undefined,
            images: course.thumbnailUrl ? [course.thumbnailUrl] : undefined,
            metadata: { courseId: course.id, type: "course" },
          },
          unit_amount: course.priceInCents,
        },
        quantity: 1,
      })
    );

    // Pending purchase records for the paid courses
    const purchaseIds: string[] = [];
    for (const course of paidCourses) {
      const purchaseRef = await db.collection(LMS_COLLECTIONS.COURSE_PURCHASES).add({
        odUserId: learner.learnerId,
        userEmail: learner.email,
        userName: learner.displayName,
        courseId: course.id,
        courseTitle: course.title,
        priceInCents: course.priceInCents,
        discountInCents: 0,
        totalInCents: course.priceInCents,
        couponCode: null,
        stripeSessionId: null,
        stripePaymentIntentId: null,
        paymentStatus: "pending",
        purchasedAt: Timestamp.now(),
        refundedAt: null,
        refundReason: null,
        createdAt: Timestamp.now(),
      });
      purchaseIds.push(purchaseRef.id);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: STRIPE_CONFIG.paymentMethods as Stripe.Checkout.SessionCreateParams.PaymentMethodType[],
      line_items: stripeLineItems,
      mode: "payment",
      success_url: `${APP_URL}/academy/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/academy/cart?cancelled=true`,
      customer_email: learner.email || undefined,
      metadata: {
        type: "course_purchase",
        userId: learner.learnerId,
        courseIds: paidCourses.map((c) => c.id).join(","),
        purchaseIds: purchaseIds.join(","),
      },
      billing_address_collection: "required",
      allow_promotion_codes: true,
    });

    for (const purchaseId of purchaseIds) {
      await db.collection(LMS_COLLECTIONS.COURSE_PURCHASES).doc(purchaseId).update({
        stripeSessionId: session.id,
      });
    }

    // Enroll the free cart items immediately — they don't wait for payment.
    const freeEnrollmentIds: string[] = [];
    for (const course of unowned.filter((c) => c.isFree || c.priceInCents <= 0)) {
      const { enrollmentId } = await ensureEnrollment(learner.learnerId, course.id);
      freeEnrollmentIds.push(enrollmentId);
    }

    return NextResponse.json({
      data: {
        success: true,
        sessionId: session.id,
        sessionUrl: session.url,
        purchaseIds,
        freeEnrollmentIds,
        alreadyOwned: alreadyOwned.map((c) => c.id),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

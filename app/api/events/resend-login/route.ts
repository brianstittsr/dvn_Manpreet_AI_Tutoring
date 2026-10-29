import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS, type EventDoc, type EventRegistration } from "@/lib/schema";
import { rateLimit } from "@/lib/rate-limit";
import {
  requireAuthenticatedActor,
  isStaffRole,
  GPTLessonAuthError,
} from "@/lib/gpt-lesson-server";
import { provisionStudentAccount } from "@/lib/student-provisioning";

const bodySchema = z.object({
  registrationId: z.string().min(1),
});

/**
 * POST /api/events/resend-login — staff only.
 * Re-provisions the attendee's learner account and resends the
 * set-password welcome email for a given event registration.
 */
export async function POST(request: NextRequest) {
  const limited = rateLimit(request, {
    scope: "event-resend-login",
    limit: 20,
    windowMs: 60_000,
  });
  if (limited) return limited;

  try {
    const actor = await requireAuthenticatedActor(request);
    if (!isStaffRole(actor.teamMember.role)) {
      return NextResponse.json({ error: "Staff access required" }, { status: 403 });
    }

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "registrationId is required" }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const regRef = adminDb
      .collection(COLLECTIONS.EVENT_REGISTRATIONS)
      .doc(parsed.data.registrationId);
    const regSnap = await regRef.get();
    if (!regSnap.exists) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    const registration = regSnap.data() as EventRegistration;
    const eventSnap = await adminDb
      .collection(COLLECTIONS.EVENTS)
      .doc(registration.eventId)
      .get();
    const eventTitle = eventSnap.exists
      ? (eventSnap.data() as EventDoc).title
      : "your event";

    const provision = await provisionStudentAccount({
      email: registration.email,
      firstName: registration.firstName,
      lastName: registration.lastName,
      context: `your registration for "${eventTitle}"`,
    });

    await regRef.update({
      accountUserId: provision.userId,
      accountProvisioned: !provision.error,
      accountProvisionError: provision.error || null,
    });

    return NextResponse.json({
      success: !provision.error,
      emailSent: provision.emailSent,
      accountCreated: provision.accountCreated,
      error: provision.error || null,
    });
  } catch (error) {
    if (error instanceof GPTLessonAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[resend-login] Failed:", error);
    return NextResponse.json({ error: "Failed to resend login info" }, { status: 500 });
  }
}

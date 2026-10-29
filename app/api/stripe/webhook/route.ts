import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS, type EventDoc, type EventRegistration } from "@/lib/schema";
import { LMS_COLLECTIONS, type CoursePurchaseDoc } from "@/lib/firebase-lms";
import { provisionStudentAccount } from "@/lib/student-provisioning";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = constructWebhookEvent(body, signature);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // Check if this is a course purchase or event registration
        if (session.metadata?.type === "course_purchase") {
          await handleCourseCheckoutCompleted(session);
        } else {
          await handleCheckoutCompleted(session);
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutExpired(session);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (!adminDb) return;

  const registrationId = session.metadata?.registrationId;
  const eventId = session.metadata?.eventId;

  if (!registrationId || !eventId) {
    console.error("Missing metadata in checkout session");
    return;
  }

  // Update registration
  const regRef = adminDb.collection(COLLECTIONS.EVENT_REGISTRATIONS).doc(registrationId);
  const regSnap = await regRef.get();

  if (!regSnap.exists) {
    console.error("Registration not found:", registrationId);
    return;
  }

  const registration = regSnap.data() as EventRegistration;

  await regRef.update({
    paymentStatus: "paid",
    status: "confirmed",
    stripePaymentIntentId: session.payment_intent,
    updatedAt: Timestamp.now(),
  });

  // Update ticket quantities sold
  const eventRef = adminDb.collection(COLLECTIONS.EVENTS).doc(eventId);
  const eventSnap = await eventRef.get();

  if (eventSnap.exists) {
    const event = eventSnap.data() as EventDoc;
    const updatedTicketTypes = event.ticketTypes?.map((ticketType) => {
      const purchasedTicket = registration.tickets.find(
        (t) => t.ticketTypeId === ticketType.id
      );
      if (purchasedTicket) {
        return {
          ...ticketType,
          quantitySold: ticketType.quantitySold + purchasedTicket.quantity,
        };
      }
      return ticketType;
    });

    // Calculate total attendees
    const totalTicketsSold = registration.tickets.reduce(
      (sum, t) => sum + t.quantity,
      0
    );

    await eventRef.update({
      ticketTypes: updatedTicketTypes,
      currentAttendees: FieldValue.increment(totalTicketsSold),
      updatedAt: Timestamp.now(),
    });
  }

  // Provision the learner account and email login info — failures must not
  // break the confirmed registration.
  try {
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
  } catch (provisionError) {
    console.error("[webhook] Account provisioning failed:", provisionError);
    await regRef.update({
      accountProvisioned: false,
      accountProvisionError:
        provisionError instanceof Error ? provisionError.message : "unknown",
    });
  }

  console.log(`Registration ${registrationId} confirmed for event ${eventId}`);
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  if (!adminDb) return;

  const registrationId = session.metadata?.registrationId;

  if (!registrationId) return;

  const regRef = adminDb.collection(COLLECTIONS.EVENT_REGISTRATIONS).doc(registrationId);
  await regRef.update({
    paymentStatus: "failed",
    status: "cancelled",
    updatedAt: Timestamp.now(),
  });

  console.log(`Registration ${registrationId} expired`);
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  if (!adminDb) return;

  // Find registration by payment intent
  const snapshot = await adminDb
    .collection(COLLECTIONS.EVENT_REGISTRATIONS)
    .where("stripePaymentIntentId", "==", paymentIntent.id)
    .get();

  if (snapshot.empty) return;

  const regDoc = snapshot.docs[0];
  await adminDb.collection(COLLECTIONS.EVENT_REGISTRATIONS).doc(regDoc.id).update({
    paymentStatus: "failed",
    updatedAt: Timestamp.now(),
  });

  console.log(`Payment failed for registration ${regDoc.id}`);
}

async function handleRefund(charge: Stripe.Charge) {
  if (!adminDb) return;

  const paymentIntentId = charge.payment_intent;
  if (!paymentIntentId) return;

  // Find registration by payment intent
  const snapshot = await adminDb
    .collection(COLLECTIONS.EVENT_REGISTRATIONS)
    .where("stripePaymentIntentId", "==", paymentIntentId)
    .get();

  if (snapshot.empty) return;

  const regDoc = snapshot.docs[0];
  const registration = regDoc.data() as EventRegistration;

  // Check if fully refunded
  const isFullRefund = charge.amount_refunded >= charge.amount;

  await adminDb.collection(COLLECTIONS.EVENT_REGISTRATIONS).doc(regDoc.id).update({
    paymentStatus: "refunded",
    status: isFullRefund ? "cancelled" : registration.status,
    updatedAt: Timestamp.now(),
  });

  // If fully refunded, update ticket quantities
  if (isFullRefund && registration.eventId) {
    const eventRef = adminDb.collection(COLLECTIONS.EVENTS).doc(registration.eventId);
    const eventSnap = await eventRef.get();

    if (eventSnap.exists) {
      const event = eventSnap.data() as EventDoc;
      const updatedTicketTypes = event.ticketTypes?.map((ticketType) => {
        const refundedTicket = registration.tickets.find(
          (t) => t.ticketTypeId === ticketType.id
        );
        if (refundedTicket) {
          return {
            ...ticketType,
            quantitySold: Math.max(
              0,
              ticketType.quantitySold - refundedTicket.quantity
            ),
          };
        }
        return ticketType;
      });

      const totalTicketsRefunded = registration.tickets.reduce(
        (sum, t) => sum + t.quantity,
        0
      );

      await eventRef.update({
        ticketTypes: updatedTicketTypes,
        currentAttendees: FieldValue.increment(-totalTicketsRefunded),
        updatedAt: Timestamp.now(),
      });
    }
  }

  console.log(`Refund processed for registration ${regDoc.id}`);
}

// ============================================================================
// COURSE PURCHASE HANDLERS
// ============================================================================

async function handleCourseCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (!adminDb) return;

  const userId = session.metadata?.userId;
  const courseIds = session.metadata?.courseIds?.split(",") || [];
  const purchaseIds = session.metadata?.purchaseIds?.split(",") || [];

  if (!userId || courseIds.length === 0) {
    console.error("Missing metadata in course checkout session");
    return;
  }

  // Update all purchase records
  for (const purchaseId of purchaseIds) {
    const purchaseRef = adminDb.collection(LMS_COLLECTIONS.COURSE_PURCHASES).doc(purchaseId);
    const purchaseSnap = await purchaseRef.get();

    if (!purchaseSnap.exists) {
      console.error("Purchase not found:", purchaseId);
      continue;
    }

    const purchase = purchaseSnap.data() as CoursePurchaseDoc;

    // Update purchase status
    await purchaseRef.update({
      paymentStatus: "paid",
      stripePaymentIntentId: session.payment_intent,
      purchasedAt: Timestamp.now(),
    });

    // Create enrollment for this course
    const enrollmentData = {
      id: "",
      userId: purchase.odUserId,
      courseId: purchase.courseId,
      enrolledAt: Timestamp.now(),
      completedAt: null,
      progressPercentage: 0,
      lastAccessedAt: null,
      certificateIssuedAt: null,
      certificateId: null,
      purchaseId: purchaseId,
    };

    await adminDb.collection(LMS_COLLECTIONS.ENROLLMENTS).add(enrollmentData);

    // Increment course enrollment count
    await adminDb.collection(LMS_COLLECTIONS.COURSES).doc(purchase.courseId).update({
      enrollmentCount: FieldValue.increment(1),
    });

    console.log(`Enrollment created for course ${purchase.courseId}, user ${purchase.odUserId}`);
  }

  console.log(`Course purchase completed for user ${userId}, courses: ${courseIds.join(", ")}`);
}

import { NextRequest, NextResponse } from "next/server";
import { createEventCheckoutSession, type CheckoutLineItem } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS, type EventDoc, type EventRegistration } from "@/lib/schema";
import { rateLimit } from "@/lib/rate-limit";
import { provisionStudentAccount } from "@/lib/student-provisioning";

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { scope: "stripe-event-checkout", limit: 15, windowMs: 60_000 });
  if (limited) return limited;
  try {
    const body = await request.json();
    const {
      eventId,
      tickets,
      customerInfo,
    }: {
      eventId: string;
      tickets: { ticketTypeId: string; quantity: number }[];
      customerInfo: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        company?: string;
      };
    } = body;

    // Validate required fields
    if (!eventId || !tickets || tickets.length === 0 || !customerInfo) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    // Get event from Firestore
    const eventRef = adminDb.collection(COLLECTIONS.EVENTS).doc(eventId);
    const eventSnap = await eventRef.get();

    if (!eventSnap.exists) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const event = { id: eventSnap.id, ...eventSnap.data() } as EventDoc;

    // Validate event is published
    if (event.status !== "published") {
      return NextResponse.json(
        { error: "Event is not available for registration" },
        { status: 400 }
      );
    }

    // Build line items and validate tickets
    const lineItems: CheckoutLineItem[] = [];
    const ticketDetails: EventRegistration["tickets"] = [];
    let subtotal = 0;

    for (const ticketOrder of tickets) {
      const ticketType = event.ticketTypes?.find(
        (t) => t.id === ticketOrder.ticketTypeId
      );

      if (!ticketType) {
        return NextResponse.json(
          { error: `Ticket type ${ticketOrder.ticketTypeId} not found` },
          { status: 400 }
        );
      }

      if (!ticketType.isActive) {
        return NextResponse.json(
          { error: `Ticket type ${ticketType.name} is not available` },
          { status: 400 }
        );
      }

      // Check availability
      const available = ticketType.quantity - ticketType.quantitySold;
      if (ticketOrder.quantity > available) {
        return NextResponse.json(
          { error: `Only ${available} tickets available for ${ticketType.name}` },
          { status: 400 }
        );
      }

      // Check max per order
      if (ticketOrder.quantity > ticketType.maxPerOrder) {
        return NextResponse.json(
          { error: `Maximum ${ticketType.maxPerOrder} tickets per order for ${ticketType.name}` },
          { status: 400 }
        );
      }

      const totalPrice = ticketType.price * ticketOrder.quantity;
      subtotal += totalPrice;

      lineItems.push({
        ticketTypeId: ticketType.id,
        ticketTypeName: ticketType.name,
        priceInCents: ticketType.price,
        quantity: ticketOrder.quantity,
      });

      ticketDetails.push({
        ticketTypeId: ticketType.id,
        ticketTypeName: ticketType.name,
        quantity: ticketOrder.quantity,
        unitPrice: ticketType.price,
        totalPrice,
      });
    }

    // Check if this is a free event
    if (subtotal === 0 || event.isFreeEvent) {
      // Create registration directly without Stripe
      const registration = {
        eventId,
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone,
        company: customerInfo.company,
        tickets: ticketDetails,
        subtotal: 0,
        discount: 0,
        total: 0,
        paymentStatus: "paid",
        status: "confirmed",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const regRef = await adminDb
        .collection(COLLECTIONS.EVENT_REGISTRATIONS)
        .add(registration);

      // Provision the learner account and email login info — failures must not
      // break the registration itself.
      try {
        const provision = await provisionStudentAccount({
          email: customerInfo.email,
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          context: `your registration for "${event.title}"`,
        });
        await regRef.update({
          accountUserId: provision.userId,
          accountProvisioned: !provision.error,
          accountProvisionError: provision.error || null,
        });
      } catch (provisionError) {
        console.error("[create-checkout] Account provisioning failed:", provisionError);
        await regRef.update({
          accountProvisioned: false,
          accountProvisionError:
            provisionError instanceof Error ? provisionError.message : "unknown",
        });
      }

      return NextResponse.json({
        success: true,
        isFree: true,
        registrationId: regRef.id,
        redirectUrl: `/events/${event.slug || eventId}/confirmation?registration_id=${regRef.id}`,
      });
    }

    // Create pending registration
    const pendingRegistration = {
      eventId,
      firstName: customerInfo.firstName,
      lastName: customerInfo.lastName,
      email: customerInfo.email,
      phone: customerInfo.phone,
      company: customerInfo.company,
      tickets: ticketDetails,
      subtotal,
      discount: 0,
      total: subtotal,
      paymentStatus: "pending",
      status: "pending",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const regRef = await adminDb
      .collection(COLLECTIONS.EVENT_REGISTRATIONS)
      .add(pendingRegistration);

    // Create Stripe checkout session
    const session = await createEventCheckoutSession(
      eventId,
      event.slug || eventId,
      event.title,
      lineItems,
      customerInfo.email,
      {
        registrationId: regRef.id,
        customerFirstName: customerInfo.firstName,
        customerLastName: customerInfo.lastName,
      }
    );

    // Update registration with Stripe session ID
    await adminDb.collection(COLLECTIONS.EVENT_REGISTRATIONS).doc(regRef.id).update({
      stripeSessionId: session.id,
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      sessionUrl: session.url,
      registrationId: regRef.id,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

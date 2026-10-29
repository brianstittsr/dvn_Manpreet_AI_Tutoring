import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

const smsOptInSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional().default(""),
  smsConsentTransactional: z.literal("on").optional(),
  smsConsentMarketing: z.literal("on").optional(),
});

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { scope: "sms-opt-in", limit: 5, windowMs: 60_000 });
  if (limited) return limited;
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      smsConsentTransactional: formData.get("smsConsentTransactional"),
      smsConsentMarketing: formData.get("smsConsentMarketing"),
    };

    const parsed = smsOptInSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((issue) => issue.message).join(", ") },
        { status: 400 }
      );
    }

    const { name, email, phone, smsConsentTransactional, smsConsentMarketing } = parsed.data;

    const optInData = {
      name,
      email,
      phone,
      smsConsentTransactional: smsConsentTransactional === "on" || false,
      smsConsentMarketing: smsConsentMarketing === "on" || false,
      source: "sms-opt-in-page",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await adminDb.collection(COLLECTIONS.SMS_OPT_INS).add(optInData);

    return NextResponse.json(
      { success: true, message: "Opt-in submitted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("SMS opt-in submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit opt-in. Please try again." },
      { status: 500 }
    );
  }
}

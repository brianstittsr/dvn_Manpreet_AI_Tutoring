import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { LMS_COLLECTIONS } from "@/lib/firebase-lms";
import { rateLimit } from "@/lib/rate-limit";

/**
 * GET /api/certificates/[id] — public certificate lookup for the printable
 * certificate page and third-party verification. Returns only the fields a
 * certificate is meant to display (no user ids or internal data).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = rateLimit(request, {
    scope: "certificate-read",
    limit: 60,
    windowMs: 60_000,
  });
  if (limited) return limited;

  if (!adminDb) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const { id } = await params;
  const snap = await adminDb.collection(LMS_COLLECTIONS.CERTIFICATES).doc(id).get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  }

  const cert = snap.data() as {
    certificateType?: string;
    courseId?: string | null;
    title?: string;
    recipientName?: string;
    issuedAt?: { toDate?: () => Date } | null;
    certificateNumber?: string;
  };

  let courseTitle: string | null = null;
  if (cert.courseId) {
    const courseSnap = await adminDb
      .collection(LMS_COLLECTIONS.COURSES)
      .doc(cert.courseId)
      .get();
    if (courseSnap.exists) {
      courseTitle = (courseSnap.data() as { title?: string }).title || null;
    }
  }

  const issuedAt =
    cert.issuedAt && typeof cert.issuedAt.toDate === "function"
      ? cert.issuedAt.toDate().toISOString()
      : null;

  return NextResponse.json({
    id: snap.id,
    title: cert.title || "Certificate of Completion",
    recipientName: cert.recipientName || "Learner",
    courseTitle,
    certificateType: cert.certificateType || "course",
    issuedAt,
    certificateNumber: cert.certificateNumber || null,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS, type TeamMemberDoc } from "@/lib/schema";

export const dynamic = "force-dynamic";

function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * POST /api/auth/sync-profile — write users/{uid} = { role, teamMemberId }.
 *
 * Firestore rules can't query teamMembers by firebaseUid, so this doc is the
 * role bridge used by security rules (isAdmin(), ownership checks). It is
 * server-written only — clients can never self-assign a role. Auth users
 * without a teamMembers record get a null-role doc so ownership fallbacks
 * (resource.data.userId == request.auth.uid) still work.
 */
export async function POST(request: NextRequest) {
  try {
    if (!adminAuth || !adminDb) {
      return jsonError("Firebase Admin is not configured", 500);
    }

    const authorization = request.headers.get("authorization");
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    if (!token) return jsonError("Missing authorization token", 401);

    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(token);
    } catch {
      return jsonError("Invalid authorization token", 401);
    }

    const memberSnap = await adminDb
      .collection(COLLECTIONS.TEAM_MEMBERS)
      .where("firebaseUid", "==", decoded.uid)
      .limit(1)
      .get();
    const member = memberSnap.empty
      ? null
      : ({ id: memberSnap.docs[0].id, ...memberSnap.docs[0].data() } as TeamMemberDoc);

    await adminDb.collection("users").doc(decoded.uid).set(
      {
        uid: decoded.uid,
        teamMemberId: member?.id ?? null,
        role: member?.role ?? "client",
        email: decoded.email ?? null,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({
      data: { role: member?.role ?? "client", teamMemberId: member?.id ?? null },
    });
  } catch (error) {
    console.error("[auth/sync-profile] error:", error);
    return jsonError("Sync failed", 500);
  }
}

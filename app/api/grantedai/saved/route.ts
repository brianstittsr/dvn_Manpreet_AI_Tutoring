import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import {
  GPTLessonAuthError,
  isStaffRole,
  requireAdminDb,
  requireAuthenticatedActor,
} from "@/lib/gpt-lesson-server";

export const dynamic = "force-dynamic";

const SAVED_COLLECTION = "grantedaiSavedGrants";

const saveSchema = z.object({
  externalId: z.string().min(1).max(200),
  name: z.string().min(1).max(300),
  funder: z.string().max(300).optional(),
  amount: z.string().max(120).optional(),
  deadline: z.string().max(120).optional(),
  summary: z.string().max(4000).optional(),
  url: z.string().max(1000).optional(),
  fitScore: z.number().optional(),
  notes: z.string().max(2000).optional(),
  source: z.enum(["grant", "foundation", "discover"]).default("grant"),
});

const deleteSchema = z.object({ id: z.string().min(1).max(160) });

async function requireStaff(req: NextRequest) {
  const actor = await requireAuthenticatedActor(req);
  if (!isStaffRole(actor.teamMember.role)) {
    throw new GPTLessonAuthError("Staff access is required", 403);
  }
  return actor;
}

function handleError(error: unknown): NextResponse {
  if (error instanceof GPTLessonAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("[grantedai/saved] error:", error);
  return NextResponse.json({ error: "Request failed" }, { status: 500 });
}

/** GET /api/grantedai/saved — list saved grants/funders (staff). */
export async function GET(req: NextRequest) {
  try {
    await requireStaff(req);
    const db = requireAdminDb();
    const snap = await db
      .collection(SAVED_COLLECTION)
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();
    return NextResponse.json({
      data: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
    });
  } catch (error) {
    return handleError(error);
  }
}

/** POST /api/grantedai/saved — bookmark a grant or funder (staff). */
export async function POST(req: NextRequest) {
  try {
    const actor = await requireStaff(req);
    const parsed = saveSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid save request" }, { status: 400 });
    }
    const db = requireAdminDb();

    // Idempotent per external id + source
    const existing = await db
      .collection(SAVED_COLLECTION)
      .where("externalId", "==", parsed.data.externalId)
      .where("source", "==", parsed.data.source)
      .limit(1)
      .get();
    if (!existing.empty) {
      return NextResponse.json({ data: { id: existing.docs[0].id, alreadySaved: true } });
    }

    const ref = db.collection(SAVED_COLLECTION).doc();
    await ref.set({
      id: ref.id,
      ...parsed.data,
      savedBy: actor.teamMember.emailPrimary || actor.firebaseUid,
      createdAt: Timestamp.now(),
    });
    await db.collection("auditLogs").add({
      actorId: actor.firebaseUid,
      actorEmail: actor.teamMember.emailPrimary,
      action: "grantedai.saved",
      entityType: "saved_grant",
      entityId: ref.id,
      metadata: { externalId: parsed.data.externalId, source: parsed.data.source },
      createdAt: Timestamp.now(),
    });
    return NextResponse.json({ data: { id: ref.id } }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

/** DELETE /api/grantedai/saved — remove a bookmark (staff). */
export async function DELETE(req: NextRequest) {
  try {
    await requireStaff(req);
    const parsed = deleteSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    const db = requireAdminDb();
    await db.collection(SAVED_COLLECTION).doc(parsed.data.id).delete();
    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    return handleError(error);
  }
}

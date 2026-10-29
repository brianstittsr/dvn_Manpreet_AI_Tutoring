import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";

/** GET /api/linkedin/drafts - list current user's drafts */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: "Firebase not initialized" }, { status: 500 });
    }

    const snapshot = await adminDb
      .collection(COLLECTIONS.LINKEDIN_ARTICLES)
      .where("createdById", "==", userId)
      .orderBy("updatedAt", "desc")
      .get();

    const articles = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    return NextResponse.json({ data: articles });
  } catch (error) {
    console.error("[linkedin/drafts] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch LinkedIn drafts" },
      { status: 500 }
    );
  }
}

interface SaveDraftBody {
  id?: string;
  title: string;
  content: string;
  hashtags?: string;
  images: string[];
  referenceLinks: unknown[];
  glossary: unknown[];
  status?: "draft" | "scheduled" | "published" | "failed";
  scheduledFor?: string;
  createdById: string;
  createdByName: string;
}

/** POST /api/linkedin/drafts - save or update a draft/scheduled/published article */
export async function POST(request: NextRequest) {
  try {
    const body: SaveDraftBody = await request.json();

    if (!body.title || !body.content || !body.createdById || !body.createdByName) {
      return NextResponse.json(
        { error: "title, content, createdById and createdByName are required" },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json({ error: "Firebase not initialized" }, { status: 500 });
    }

    const now = Timestamp.now();
    const payload = {
      title: body.title,
      content: body.content,
      hashtags: body.hashtags || "",
      images: body.images || [],
      referenceLinks: body.referenceLinks || [],
      glossary: body.glossary || [],
      status: body.status || "draft",
      scheduledFor: body.scheduledFor ? Timestamp.fromDate(new Date(body.scheduledFor)) : null,
      createdById: body.createdById,
      createdByName: body.createdByName,
      updatedAt: now,
    };

    let docRef;
    if (body.id) {
      docRef = adminDb.collection(COLLECTIONS.LINKEDIN_ARTICLES).doc(body.id);
      await docRef.update(payload);
    } else {
      docRef = adminDb.collection(COLLECTIONS.LINKEDIN_ARTICLES).doc();
      await docRef.set({
        ...payload,
        publishedAt: null,
        linkedinPostId: null,
        linkedinError: null,
        createdAt: now,
      });
    }

    const saved = await docRef.get();
    return NextResponse.json({ data: { id: docRef.id, ...saved.data() } });
  } catch (error) {
    console.error("[linkedin/drafts] POST error:", error);
    return NextResponse.json(
      { error: "Failed to save LinkedIn draft" },
      { status: 500 }
    );
  }
}

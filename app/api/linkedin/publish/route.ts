import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";

interface PublishBody {
  id?: string;
  title: string;
  content: string;
  hashtags?: string;
  images: string[];
  referenceLinks: unknown[];
  glossary: unknown[];
  createdById: string;
  createdByName: string;
}

/** POST /api/linkedin/publish - publish article immediately to LinkedIn */
export async function POST(request: NextRequest) {
  try {
    const body: PublishBody = await request.json();

    if (!body.title || !body.content || !body.createdById || !body.createdByName) {
      return NextResponse.json(
        { error: "title, content, createdById and createdByName are required" },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json({ error: "Firebase not initialized" }, { status: 500 });
    }

    // Fetch the user's LinkedIn connection
    const connectionSnap = await adminDb
      .collection(COLLECTIONS.LINKEDIN_CONNECTIONS)
      .where("userId", "==", body.createdById)
      .where("isActive", "==", true)
      .limit(1)
      .get();

    if (connectionSnap.empty) {
      return NextResponse.json(
        { error: "No active LinkedIn connection found. Please connect LinkedIn first." },
        { status: 401 }
      );
    }

    const connection = connectionSnap.docs[0].data();
    const accessToken = connection.accessToken;
    const profileId = connection.profileId;

    if (!profileId) {
      return NextResponse.json(
        { error: "LinkedIn connection is missing a profile ID. Please reconnect your LinkedIn account." },
        { status: 401 }
      );
    }

    // Use LinkedIn's ugcPosts API to create a post
    const shareContent = buildShareContent(profileId, body.title, body.content, body.hashtags, body.images);

    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(shareContent),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[linkedin/publish] LinkedIn API error:", response.status, errorText);
      return NextResponse.json(
        { error: `LinkedIn publish failed: ${response.status} ${errorText}` },
        { status: 502 }
      );
    }

    const result = await response.json();
    const linkedinPostId = result.id || null;
    const linkedinPostUrl = linkedinPostId
      ? `https://www.linkedin.com/feed/update/${linkedinPostId}`
      : null;
    const now = Timestamp.now();

    const payload = {
      title: body.title,
      content: body.content,
      hashtags: body.hashtags || "",
      images: body.images || [],
      referenceLinks: body.referenceLinks || [],
      glossary: body.glossary || [],
      status: "published",
      publishedAt: now,
      linkedinPostId,
      linkedinPostUrl,
      linkedinError: null,
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
        scheduledFor: null,
        createdAt: now,
      });
    }

    const saved = await docRef.get();
    return NextResponse.json({ data: { id: docRef.id, ...saved.data() } });
  } catch (error) {
    console.error("[linkedin/publish] POST error:", error);
    return NextResponse.json(
      { error: "Failed to publish to LinkedIn" },
      { status: 500 }
    );
  }
}

function buildShareContent(profileId: string, title: string, content: string, hashtags?: string, images?: string[]) {
  const fullContent = `${title}\n\n${content}${hashtags ? `\n\n${hashtags}` : ""}`;
  const authorUrn = `urn:li:person:${profileId}`;

  const share: Record<string, unknown> = {
    author: authorUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: {
          text: fullContent,
        },
        shareMediaCategory: "NONE",
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

  if (images && images.length > 0) {
    // Placeholder for image assets; LinkedIn requires upload-registered image URNs first.
    share.specificContent = {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: fullContent },
        shareMediaCategory: "IMAGE",
        media: images.map((url, index) => ({
          status: "READY",
          description: { text: `Image ${index + 1} for ${title}` },
          originalUrl: url,
          title: { text: title },
        })),
      },
    };
  }

  return share;
}

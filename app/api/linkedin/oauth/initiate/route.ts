import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";
import crypto from "crypto";

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;

/** GET /api/linkedin/oauth/initiate - start OAuth flow and return LinkedIn auth URL */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    if (!LINKEDIN_CLIENT_ID || !LINKEDIN_REDIRECT_URI) {
      return NextResponse.json(
        { error: "LinkedIn OAuth is not configured. Set LINKEDIN_CLIENT_ID and LINKEDIN_REDIRECT_URI." },
        { status: 500 }
      );
    }

    const state = crypto.randomBytes(16).toString("hex");

    // Store pending state in Firestore with 10 min TTL
    if (adminDb) {
      await adminDb.collection(COLLECTIONS.OAUTH_STATES).doc(state).set({
        userId,
        provider: "linkedin",
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromMillis(Date.now() + 10 * 60 * 1000),
      });
    }

    const scope = encodeURIComponent("r_liteprofile r_emailaddress w_member_social");
    const authUrl =
      "https://www.linkedin.com/oauth/v2/authorization" +
      `?response_type=code` +
      `&client_id=${LINKEDIN_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}` +
      `&state=${state}` +
      `&scope=${scope}`;

    return NextResponse.json({ data: { authUrl, state } });
  } catch (error) {
    console.error("[linkedin/oauth/initiate] error:", error);
    return NextResponse.json(
      { error: "Failed to initiate LinkedIn OAuth" },
      { status: 500 }
    );
  }
}

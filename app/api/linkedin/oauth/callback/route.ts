import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;

/** GET /api/linkedin/oauth/callback - OAuth callback from LinkedIn */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      const errorDescription = searchParams.get("error_description") || "LinkedIn OAuth error";
      return NextResponse.json({ error: errorDescription }, { status: 400 });
    }

    if (!code || !state) {
      return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
    }

    if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET || !LINKEDIN_REDIRECT_URI) {
      return NextResponse.json(
        { error: "LinkedIn OAuth is not configured." },
        { status: 500 }
      );
    }

    // Validate state
    if (!adminDb) {
      return NextResponse.json({ error: "Firebase not initialized" }, { status: 500 });
    }

    const stateDoc = await adminDb.collection(COLLECTIONS.OAUTH_STATES).doc(state).get();
    if (!stateDoc.exists) {
      return NextResponse.json({ error: "Invalid or expired state" }, { status: 403 });
    }

    const { userId } = stateDoc.data() || {};
    await adminDb.collection(COLLECTIONS.OAUTH_STATES).doc(state).delete();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId in state" }, { status: 403 });
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: LINKEDIN_REDIRECT_URI,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("[linkedin/oauth/callback] token error:", tokenResponse.status, errorText);
      return NextResponse.json(
        { error: `LinkedIn token exchange failed: ${errorText}` },
        { status: 502 }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresAt = tokenData.expires_in
      ? Timestamp.fromMillis(Date.now() + tokenData.expires_in * 1000)
      : null;
    const scopes = tokenData.scope ? tokenData.scope.split(" ") : [];

    // Fetch basic profile to get profile ID and name
    const profileResponse = await fetch(
      "https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const emailResponse = await fetch(
      "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    let profileName: string | undefined;
    let profileId: string | undefined;
    let profilePicture: string | undefined;
    let profileEmail: string | undefined;

    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      profileId = profile.id;
      const firstName = profile.firstName?.localized?.en_US || "";
      const lastName = profile.lastName?.localized?.en_US || "";
      profileName = `${firstName} ${lastName}`.trim();
      const pictureElements = profile.profilePicture?.["displayImage~"]?.elements;
      profilePicture = pictureElements?.[pictureElements.length - 1]?.identifiers?.[0]?.identifier;
    }

    if (emailResponse.ok) {
      const emailData = await emailResponse.json();
      profileEmail = emailData.elements?.[0]?.["handle~"]?.emailAddress;
    }

    const now = Timestamp.now();

    // Upsert connection document
    const existing = await adminDb
      .collection(COLLECTIONS.LINKEDIN_CONNECTIONS)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    const connectionPayload = {
      userId,
      profileId: profileId || null,
      accessToken,
      refreshToken: refreshToken || null,
      expiresAt,
      profileName: profileName || null,
      profileEmail: profileEmail || null,
      profilePicture: profilePicture || null,
      scopes,
      isActive: true,
      updatedAt: now,
    };

    if (existing.empty) {
      const docRef = adminDb.collection(COLLECTIONS.LINKEDIN_CONNECTIONS).doc();
      await docRef.set({
        ...connectionPayload,
        connectedAt: now,
      });
    } else {
      await existing.docs[0].ref.update(connectionPayload);
    }

    // Redirect to the LinkedIn content page (or portal home)
    return NextResponse.redirect(new URL("/portal/linkedin-content", request.url));
  } catch (error) {
    console.error("[linkedin/oauth/callback] error:", error);
    return NextResponse.json(
      { error: "Failed to complete LinkedIn OAuth" },
      { status: 500 }
    );
  }
}

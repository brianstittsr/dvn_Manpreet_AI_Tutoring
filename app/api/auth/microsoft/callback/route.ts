/**
 * Microsoft OAuth Callback Handler
 * 
 * Handles the OAuth callback from Microsoft after user authorization
 * Exchanges the authorization code for access tokens
 */

import { NextRequest, NextResponse } from "next/server";
import { exchangeMicrosoftCode, MSGraphConfig, MS_SCOPES } from "@/lib/microsoft-graph";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";

// Get Microsoft config from environment
function getMicrosoftConfig(): MSGraphConfig | null {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const tenantId = process.env.MICROSOFT_TENANT_ID || "common";
  const redirectUri = process.env.MICROSOFT_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/microsoft/callback`;

  if (!clientId) {
    return null;
  }

  return {
    clientId,
    clientSecret,
    tenantId,
    redirectUri,
    scopes: MS_SCOPES,
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle OAuth errors
  if (error) {
    console.error("Microsoft OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      new URL(`/portal/settings?error=${encodeURIComponent(errorDescription || error)}`, request.url)
    );
  }

  // Validate code
  if (!code) {
    return NextResponse.redirect(
      new URL("/portal/settings?error=No authorization code received", request.url)
    );
  }

  // Get Microsoft config
  const config = getMicrosoftConfig();
  if (!config) {
    return NextResponse.redirect(
      new URL("/portal/settings?error=Microsoft integration not configured", request.url)
    );
  }

  try {
    // Exchange code for tokens
    const result = await exchangeMicrosoftCode(config, code);

    if (!result.success || !result.data) {
      return NextResponse.redirect(
        new URL(`/portal/settings?error=${encodeURIComponent(result.error || "Token exchange failed")}`, request.url)
      );
    }

    // Parse state to get user ID (if provided)
    let userId = "default";
    if (state) {
      try {
        const stateData = JSON.parse(atob(state));
        userId = stateData.userId || "default";
      } catch {
        // State parsing failed, use default
      }
    }

    // Store tokens in the server-only secrets collection
    if (adminDb) {
      await adminDb
        .collection("platformSecrets")
        .doc(`microsoft_tokens_${userId}`)
        .set(
          {
            accessToken: result.data.accessToken,
            refreshToken: result.data.refreshToken,
            expiresAt: result.data.expiresAt,
            connectedAt: Timestamp.now(),
            provider: "microsoft",
          },
          { merge: true }
        );

      // Update integration status
      await adminDb
        .collection(COLLECTIONS.PLATFORM_SETTINGS)
        .doc("default")
        .set(
          {
            integrations: {
              microsoft: {
                connected: true,
                connectedAt: Timestamp.now(),
                scopes: MS_SCOPES,
              },
            },
          },
          { merge: true }
        );
    }

    // Redirect back to settings with success
    return NextResponse.redirect(
      new URL("/portal/settings?success=Microsoft account connected successfully", request.url)
    );
  } catch (error) {
    console.error("Microsoft OAuth callback error:", error);
    return NextResponse.redirect(
      new URL(`/portal/settings?error=${encodeURIComponent("Failed to connect Microsoft account")}`, request.url)
    );
  }
}

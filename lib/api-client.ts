"use client";

import { auth } from "@/lib/firebase";

/**
 * Headers for an authenticated JSON request to a server API route.
 * Attaches the current user's Firebase ID token as a Bearer token when
 * the user is signed in.
 */
export async function authedJsonHeaders(): Promise<HeadersInit> {
  const token = await auth?.currentUser?.getIdToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

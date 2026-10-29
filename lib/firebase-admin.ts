/**
 * Firebase Admin SDK Configuration
 * For server-side operations (API routes, server components)
 */

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

// Initialize Firebase Admin
function initializeFirebaseAdmin(): App | null {
  // Check if already initialized
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Check for service account credentials
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || (!serviceAccount && (!clientEmail || !privateKey))) {
    console.warn("Firebase Admin: Missing service account credentials");
    return null;
  }

  try {
    const credentials = serviceAccount
      ? JSON.parse(serviceAccount)
      : { projectId, clientEmail, privateKey };

    return initializeApp({
      credential: cert(credentials),
      projectId: projectId,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    return null;
  }
}

const adminApp = initializeFirebaseAdmin();

// Export admin services
export const adminDb: Firestore | null = adminApp ? getFirestore(adminApp) : null;
export const adminAuth: Auth | null = adminApp ? getAuth(adminApp) : null;
export const adminStorage = adminApp ? getStorage(adminApp) : null;

export default adminApp;

/**
 * Server-side student account provisioning.
 *
 * After an event registration (or admin action) this helper makes sure the
 * registrant can sign in to the learner portal:
 *   1. Firebase Auth account (created if missing)
 *   2. teamMembers client record (so portal sign-in links the user)
 *   3. A "set your password" email with a Firebase reset link
 *
 * All writes use the Admin SDK — never import this from client code.
 */

import { adminAuth, adminDb } from "./firebase-admin";
import { sendFromCurioQuest } from "./email-service";
import { COLLECTIONS } from "./schema";

export interface ProvisionResult {
  userId: string | null;
  accountCreated: boolean;
  teamMemberCreated: boolean;
  emailSent: boolean;
  error?: string;
}

const APP_NAME = "CurioQuest";

function baseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "https://manpreetai2.vercel.app"
  );
}

function buildWelcomeEmail(params: {
  firstName: string;
  resetLink: string;
  context: string;
}): { subject: string; text: string; html: string } {
  const signInUrl = `${baseUrl()}/sign-in`;
  const subject = `Your ${APP_NAME} learner account is ready`;

  const text = [
    `Hi ${params.firstName},`,
    ``,
    `Your ${APP_NAME} learner account has been created for ${params.context}.`,
    ``,
    `Step 1 — Set your password:`,
    params.resetLink,
    ``,
    `Step 2 — Sign in to your learner portal:`,
    signInUrl,
    ``,
    `If you did not expect this email you can ignore it — the link expires on its own.`,
    ``,
    `— The ${APP_NAME} Team`,
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
      <h2 style="color: #0f766e;">Welcome to ${APP_NAME}!</h2>
      <p>Hi ${params.firstName},</p>
      <p>Your learner account has been created for <strong>${params.context}</strong>.</p>
      <p><strong>Step 1 — Set your password:</strong></p>
      <p><a href="${params.resetLink}" style="display:inline-block;background:#0f766e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Set My Password</a></p>
      <p><strong>Step 2 — Sign in to your learner portal:</strong></p>
      <p><a href="${signInUrl}">${signInUrl}</a></p>
      <p style="color:#6b7280;font-size:13px;">If you did not expect this email you can ignore it — the link expires on its own.</p>
      <p>— The ${APP_NAME} Team</p>
    </div>`;

  return { subject, text, html };
}

/**
 * Ensure a registrant has a Firebase Auth account, a linked client
 * teamMembers record, and (optionally) a welcome email with a
 * set-password link. Safe to call more than once — existing accounts
 * are reused and the email is re-sent.
 */
export async function provisionStudentAccount(params: {
  email: string;
  firstName: string;
  lastName: string;
  context?: string;
  sendLoginEmail?: boolean;
}): Promise<ProvisionResult> {
  const result: ProvisionResult = {
    userId: null,
    accountCreated: false,
    teamMemberCreated: false,
    emailSent: false,
  };

  const email = params.email.toLowerCase().trim();
  if (!email) {
    result.error = "Missing email";
    return result;
  }

  if (!adminAuth || !adminDb) {
    result.error = "Firebase Admin not initialized";
    return result;
  }

  try {
    // 1. Firebase Auth account — reuse if the email already has one.
    try {
      const existing = await adminAuth.getUserByEmail(email);
      result.userId = existing.uid;
    } catch (error: unknown) {
      const code = (error as { code?: string }).code;
      if (code !== "auth/user-not-found") throw error;
      const created = await adminAuth.createUser({
        email,
        displayName: `${params.firstName} ${params.lastName}`.trim(),
        emailVerified: false,
      });
      result.userId = created.uid;
      result.accountCreated = true;
    }

    // 2. teamMembers client record — portal sign-in links by emailPrimary.
    const teamMembers = adminDb.collection(COLLECTIONS.TEAM_MEMBERS);
    const existingMember = await teamMembers
      .where("emailPrimary", "==", email)
      .limit(1)
      .get();
    let teamMemberId: string | null = null;
    if (existingMember.empty) {
      const now = new Date();
      const memberRef = await teamMembers.add({
        firstName: params.firstName,
        lastName: params.lastName,
        emailPrimary: email,
        firebaseUid: result.userId,
        role: "client",
        status: "active",
        expertise: "",
        isClient: true,
        clientSince: now,
        createdAt: now,
        updatedAt: now,
      });
      teamMemberId = memberRef.id;
      result.teamMemberCreated = true;
    } else {
      teamMemberId = existingMember.docs[0].id;
      // Backfill the UID link if the member record predates provisioning.
      if (!existingMember.docs[0].data().firebaseUid) {
        await existingMember.docs[0].ref.update({ firebaseUid: result.userId });
      }
    }

    // users/{uid} role doc — the bridge Firestore rules use for role checks.
    if (result.userId) {
      await adminDb.collection("users").doc(result.userId).set(
        {
          uid: result.userId,
          teamMemberId,
          role: "client",
          email,
          updatedAt: new Date(),
        },
        { merge: true }
      );
    }

    // 3. Welcome email with a set-password link.
    if (params.sendLoginEmail !== false) {
      const resetLink = await adminAuth.generatePasswordResetLink(email);
      const { subject, text, html } = buildWelcomeEmail({
        firstName: params.firstName,
        resetLink,
        context: params.context || "your registration",
      });
      const sendResult = await sendFromCurioQuest({
        to: email,
        subject,
        text,
        html,
      });
      result.emailSent = sendResult.success;
      if (!sendResult.success) {
        result.error = sendResult.error;
      }
    }

    return result;
  } catch (error) {
    console.error("[student-provisioning] Failed:", error);
    result.error = error instanceof Error ? error.message : "Provisioning failed";
    return result;
  }
}

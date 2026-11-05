/**
 * Server-side LMS operations (Firebase Admin SDK).
 *
 * All learner-record writes (enrollments, progress, quiz attempts,
 * certificates, purchases) go through these helpers so Firestore rules can
 * deny direct client writes. Never import from client components.
 */

import { Timestamp, FieldValue } from "firebase-admin/firestore";
import type { NextRequest } from "next/server";
import {
  requireAdminDb,
  requireAuthenticatedActor,
  type AuthenticatedActor,
} from "@/lib/gpt-lesson-server";
import { LMS_COLLECTIONS } from "@/lib/firebase-lms";

export interface StaffOrLearner {
  actor: AuthenticatedActor;
  /** teamMembers doc id — the key used in enrollment.userId / progress.odUserId */
  learnerId: string;
  displayName: string;
  email: string;
  isStaff: boolean;
}

/**
 * Authenticate the request and resolve the caller's LMS identity.
 * Enrollments/progress are keyed on the teamMembers doc id; for auth users
 * with no teamMembers record we fall back to the Firebase UID.
 */
export async function requireLearner(request: NextRequest): Promise<StaffOrLearner> {
  const actor = await requireAuthenticatedActor(request);
  const member = actor.teamMember;
  const role = member.role;
  return {
    actor,
    learnerId: member.id || actor.firebaseUid,
    displayName:
      [member.firstName, member.lastName].filter(Boolean).join(" ").trim() ||
      member.emailPrimary ||
      "Learner",
    email: member.emailPrimary || "",
    isStaff: role === "admin" || role === "superadmin",
  };
}

// ---------------------------------------------------------------------------
// Enrollment
// ---------------------------------------------------------------------------

export interface ServerEnrollment {
  id: string;
  userId: string;
  courseId: string;
  progressPercentage: number;
  completedAt: Timestamp | null;
  certificateId: string | null;
  purchaseId?: string | null;
}

export async function getEnrollmentFor(
  learnerId: string,
  courseId: string
): Promise<ServerEnrollment | null> {
  const db = requireAdminDb();
  const snap = await db
    .collection(LMS_COLLECTIONS.ENROLLMENTS)
    .where("userId", "==", learnerId)
    .where("courseId", "==", courseId)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...(doc.data() as Omit<ServerEnrollment, "id">) };
}

export async function getEnrollmentById(
  enrollmentId: string
): Promise<ServerEnrollment | null> {
  const db = requireAdminDb();
  const snap = await db.collection(LMS_COLLECTIONS.ENROLLMENTS).doc(enrollmentId).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() as Omit<ServerEnrollment, "id">) };
}

/** Idempotent enrollment creation. Returns { enrollmentId, created }. */
export async function ensureEnrollment(
  learnerId: string,
  courseId: string,
  purchaseId?: string
): Promise<{ enrollmentId: string; created: boolean }> {
  const db = requireAdminDb();
  const existing = await getEnrollmentFor(learnerId, courseId);
  if (existing) return { enrollmentId: existing.id, created: false };

  const ref = db.collection(LMS_COLLECTIONS.ENROLLMENTS).doc();
  await ref.set({
    id: ref.id,
    userId: learnerId,
    courseId,
    enrolledAt: Timestamp.now(),
    completedAt: null,
    progressPercentage: 0,
    lastAccessedAt: null,
    certificateIssuedAt: null,
    certificateId: null,
    purchaseId: purchaseId || null,
  });
  await db
    .collection(LMS_COLLECTIONS.COURSES)
    .doc(courseId)
    .update({ enrollmentCount: FieldValue.increment(1) })
    .catch((e) => console.error("[lms] enrollmentCount increment failed:", e));

  return { enrollmentId: ref.id, created: true };
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export async function setLessonCompleteServer(input: {
  learnerId: string;
  lessonId: string;
  courseId: string;
  enrollmentId: string;
  completed: boolean;
}): Promise<void> {
  const db = requireAdminDb();
  const snap = await db
    .collection(LMS_COLLECTIONS.LESSON_PROGRESS)
    .where("odUserId", "==", input.learnerId)
    .where("lessonId", "==", input.lessonId)
    .limit(1)
    .get();

  if (snap.empty) {
    const ref = db.collection(LMS_COLLECTIONS.LESSON_PROGRESS).doc();
    await ref.set({
      id: ref.id,
      odUserId: input.learnerId,
      lessonId: input.lessonId,
      courseId: input.courseId,
      enrollmentId: input.enrollmentId,
      startedAt: Timestamp.now(),
      completedAt: input.completed ? Timestamp.now() : null,
      progressSeconds: 0,
      isCompleted: input.completed,
      notes: null,
    });
    return;
  }
  await snap.docs[0].ref.update({
    isCompleted: input.completed,
    completedAt: input.completed ? Timestamp.now() : null,
  });
}

/**
 * Recompute an enrollment's percentage from completed lessons and issue the
 * completion certificate server-side at 100%. Returns the fresh values.
 */
export async function recalcEnrollmentProgress(input: {
  enrollmentId: string;
  courseId: string;
  learnerId: string;
  recipientName: string;
}): Promise<{ progressPercentage: number; completed: boolean; certificateId: string | null }> {
  const db = requireAdminDb();

  const lessonsSnap = await db
    .collection(LMS_COLLECTIONS.LESSONS)
    .where("courseId", "==", input.courseId)
    .get();
  const totalLessons = lessonsSnap.size;

  const completedSnap = await db
    .collection(LMS_COLLECTIONS.LESSON_PROGRESS)
    .where("enrollmentId", "==", input.enrollmentId)
    .where("isCompleted", "==", true)
    .get();

  // Completed progress docs that no longer map to a live lesson don't count.
  const liveLessonIds = new Set(lessonsSnap.docs.map((d) => d.id));
  const completedLive = completedSnap.docs.filter((d) =>
    liveLessonIds.has(d.data().lessonId as string)
  ).length;

  const progressPercentage =
    totalLessons === 0 ? 0 : Math.round((completedLive / totalLessons) * 100);
  const completed = totalLessons > 0 && progressPercentage >= 100;

  const enrollmentRef = db.collection(LMS_COLLECTIONS.ENROLLMENTS).doc(input.enrollmentId);
  const updates: Record<string, unknown> = {
    progressPercentage,
    lastAccessedAt: FieldValue.serverTimestamp(),
  };
  if (completed) updates.completedAt = Timestamp.now();
  await enrollmentRef.update(updates);

  let certificateId: string | null = null;
  if (completed) {
    certificateId = await issueCertificateIfComplete({
      enrollmentId: input.enrollmentId,
      learnerId: input.learnerId,
      courseId: input.courseId,
      recipientName: input.recipientName,
    });
  } else {
    const snap = await enrollmentRef.get();
    certificateId = (snap.data()?.certificateId as string | null) ?? null;
  }

  return { progressPercentage, completed, certificateId };
}

/**
 * Issue the completion certificate for a finished enrollment — idempotent.
 * Mirrors lib/firebase-lms.issueCertificate but uses the Admin SDK.
 */
export async function issueCertificateIfComplete(input: {
  enrollmentId: string;
  learnerId: string;
  courseId: string;
  recipientName: string;
}): Promise<string | null> {
  const db = requireAdminDb();
  const enrollmentRef = db.collection(LMS_COLLECTIONS.ENROLLMENTS).doc(input.enrollmentId);
  const enrollmentSnap = await enrollmentRef.get();
  if (!enrollmentSnap.exists) return null;

  const enrollment = enrollmentSnap.data() as {
    completedAt?: Timestamp | null;
    certificateId?: string | null;
  };
  if (!enrollment.completedAt) return null;
  if (enrollment.certificateId) return enrollment.certificateId;

  const courseSnap = await db.collection(LMS_COLLECTIONS.COURSES).doc(input.courseId).get();
  const courseTitle = (courseSnap.data()?.title as string) || "Course";

  const certRef = db.collection(LMS_COLLECTIONS.CERTIFICATES).doc();
  const certificateNumber = `CQ-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;

  await certRef.set({
    id: certRef.id,
    odUserId: input.learnerId,
    certificateType: "course",
    courseId: input.courseId,
    learningPathId: null,
    workshopId: null,
    assessmentId: null,
    title: `${courseTitle} — Certificate of Completion`,
    recipientName: input.recipientName,
    issuedAt: Timestamp.now(),
    certificateNumber,
    pdfUrl: null,
    verificationUrl: `/certificate/${certRef.id}`,
  });

  await enrollmentRef.update({
    certificateIssuedAt: Timestamp.now(),
    certificateId: certRef.id,
  });

  return certRef.id;
}

// ---------------------------------------------------------------------------
// Quiz scoring
// ---------------------------------------------------------------------------

export interface QuizQuestionServer {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface ParsedQuiz {
  title?: string;
  passingScore: number;
  questions: QuizQuestionServer[];
}

/**
 * Parse quiz questions from a lesson's markdown textContent.
 * Format: `### Question` headers, `A) option` lines (✓/✔ marks correct),
 * `Passing Score: NN%`, `*explanation*` lines.
 */
export function parseQuizContent(textContent: string): ParsedQuiz {
  const questions: QuizQuestionServer[] = [];
  let passingScore = 70;
  let title: string | undefined;
  let current: Partial<QuizQuestionServer> | null = null;
  let qNum = 0;

  const flush = () => {
    if (current?.question && current.options && current.options.length > 0) {
      questions.push(current as QuizQuestionServer);
    }
    current = null;
  };

  for (const rawLine of textContent.split("\n")) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    const scoreMatch = trimmed.match(/Passing Score:\s*(\d+)%/i);
    if (scoreMatch) {
      passingScore = parseInt(scoreMatch[1], 10);
      continue;
    }

    if (!title && /^#\s+\w/.test(trimmed) && !trimmed.startsWith("##")) {
      title = trimmed.replace(/^#\s*/, "");
      continue;
    }

    const questionMatch = trimmed.match(/^###?\s*(?:Question\s*\d+|Q\d+)[.:]?\s*(.*)/i);
    if (questionMatch || trimmed.match(/^###?\s+\w/)) {
      flush();
      current = {
        id: `q${++qNum}`,
        question: questionMatch ? questionMatch[1] : trimmed.replace(/^###?\s*/, ""),
        options: [],
        correctAnswer: 0,
      };
      continue;
    }

    const optionMatch = trimmed.match(/^([A-Z])[).]\s*(.*)/i);
    if (optionMatch && current) {
      const optionText = optionMatch[2];
      const isCorrect = optionText.includes("✓") || optionText.includes("✔");
      const cleanText = optionText.replace(/[✓✔]/g, "").trim();
      if (isCorrect) current.correctAnswer = current.options?.length || 0;
      current.options = [...(current.options || []), cleanText];
      continue;
    }

    if (trimmed.startsWith("*") && current) {
      current.explanation = trimmed.replace(/^\*+|\*+$/g, "").trim();
    }
  }
  flush();

  return { title, passingScore, questions };
}

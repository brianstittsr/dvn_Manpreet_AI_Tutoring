/**
 * Firebase LMS Student Utilities
 * 
 * Provides student-facing operations for course progress, quiz attempts, and certificates.
 */

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";

const LMS_COLLECTIONS = {
  LESSONS: "lms_lessons",
  LESSON_PROGRESS: "lms_lesson_progress",
  QUIZ_ATTEMPTS: "lms_quiz_attempts",
  ENROLLMENTS: "lms_enrollments",
  CERTIFICATES: "lms_certificates",
};

// ============================================================================
// TYPES
// ============================================================================

export interface LessonProgressDoc {
  id: string;
  odUserId: string;
  lessonId: string;
  courseId: string;
  enrollmentId: string;
  startedAt: Timestamp;
  completedAt: Timestamp | null;
  progressSeconds: number;
  isCompleted: boolean;
  notes: string | null;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface QuizAttemptDoc {
  id: string;
  odUserId: string;
  lessonId: string;
  courseId: string;
  enrollmentId: string;
  questions: QuizQuestion[];
  answers: number[];
  score: number;
  totalQuestions: number;
  passed: boolean;
  passingScore: number;
  startedAt: Timestamp;
  completedAt: Timestamp;
}

/** Result returned by the server-side progress/quiz APIs. */
export interface ProgressResult {
  lessonId?: string;
  isCompleted?: boolean;
  progressPercentage: number;
  courseCompleted?: boolean;
  certificateId: string | null;
}

export interface QuizSubmitResult {
  attemptId: string;
  score: number;
  passed: boolean;
  passingScore: number;
  correctCount: number;
  totalQuestions: number;
  progressPercentage: number;
  certificateId: string | null;
  questions: QuizQuestion[];
}

async function authedJson<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await auth?.currentUser?.getIdToken();
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers as Record<string, string> | undefined),
    },
  });
  const json = (await res.json().catch(() => ({}))) as { data?: T; error?: string };
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
  return json.data as T;
}

// ============================================================================
// LESSON PROGRESS
// ============================================================================

export async function getLessonProgress(
  userId: string,
  lessonId: string
): Promise<LessonProgressDoc | null> {
  if (!db) throw new Error("Firebase not initialized");

  const progressRef = collection(db, LMS_COLLECTIONS.LESSON_PROGRESS);
  const q = query(
    progressRef,
    where("odUserId", "==", userId),
    where("lessonId", "==", lessonId),
    limit(1)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as LessonProgressDoc;
}

export async function getCourseProgress(
  userId: string,
  courseId: string
): Promise<LessonProgressDoc[]> {
  if (!db) throw new Error("Firebase not initialized");

  const progressRef = collection(db, LMS_COLLECTIONS.LESSON_PROGRESS);
  const q = query(
    progressRef,
    where("odUserId", "==", userId),
    where("courseId", "==", courseId)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => doc.data() as LessonProgressDoc);
}

/**
 * Mark a lesson complete via the server API. The server verifies enrollment
 * ownership, writes progress, recomputes the course percentage, and issues
 * the completion certificate at 100%.
 */
export async function markLessonComplete(data: {
  userId: string;
  lessonId: string;
  courseId: string;
  enrollmentId: string;
}): Promise<ProgressResult> {
  return authedJson<ProgressResult>("/api/lms/progress", {
    method: "POST",
    body: JSON.stringify({
      lessonId: data.lessonId,
      courseId: data.courseId,
      enrollmentId: data.enrollmentId,
      completed: true,
    }),
  });
}

export async function markLessonIncomplete(data: {
  userId: string;
  lessonId: string;
  enrollmentId: string;
  courseId: string;
}): Promise<ProgressResult> {
  return authedJson<ProgressResult>("/api/lms/progress", {
    method: "POST",
    body: JSON.stringify({
      lessonId: data.lessonId,
      courseId: data.courseId,
      enrollmentId: data.enrollmentId,
      completed: false,
    }),
  });
}

// ============================================================================
// QUIZ ATTEMPTS
// ============================================================================

/** Fetch quiz questions for display — answers are stripped server-side. */
export async function getQuizForLesson(lessonId: string): Promise<{
  title: string;
  passingScore: number;
  questions: { id: string; question: string; options: string[] }[];
}> {
  return authedJson(`/api/lms/quiz?lessonId=${encodeURIComponent(lessonId)}`);
}

/**
 * Submit quiz answers for server-side scoring. The server parses the
 * authoritative questions from the lesson doc — the client sends only
 * answer indexes.
 */
export async function submitQuizAttempt(data: {
  userId: string;
  lessonId: string;
  courseId: string;
  enrollmentId: string;
  answers: number[];
}): Promise<QuizSubmitResult> {
  return authedJson<QuizSubmitResult>("/api/lms/quiz", {
    method: "POST",
    body: JSON.stringify({
      lessonId: data.lessonId,
      courseId: data.courseId,
      enrollmentId: data.enrollmentId,
      answers: data.answers,
    }),
  });
}

export async function getQuizAttempts(
  userId: string,
  lessonId: string
): Promise<QuizAttemptDoc[]> {
  if (!db) throw new Error("Firebase not initialized");

  const attemptsRef = collection(db, LMS_COLLECTIONS.QUIZ_ATTEMPTS);
  const q = query(
    attemptsRef,
    where("odUserId", "==", userId),
    where("lessonId", "==", lessonId),
    orderBy("completedAt", "desc")
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => doc.data() as QuizAttemptDoc);
}

export async function getBestQuizAttempt(
  userId: string,
  lessonId: string
): Promise<QuizAttemptDoc | null> {
  if (!db) throw new Error("Firebase not initialized");

  const attempts = await getQuizAttempts(userId, lessonId);
  if (attempts.length === 0) return null;

  // Return the attempt with the highest score
  return attempts.reduce((best, current) => 
    current.score > best.score ? current : best
  );
}

// ============================================================================
// CERTIFICATES
// ============================================================================

/**
 * Idempotently ensure a completion certificate exists for a finished course.
 * Delegates to the server, which verifies the enrollment's completedAt.
 */
export async function ensureCourseCertificate(data: {
  enrollmentId: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  recipientName: string;
}): Promise<string | null> {
  const result = await authedJson<{ certificateId: string | null }>(
    "/api/lms/certificate",
    {
      method: "POST",
      body: JSON.stringify({ courseId: data.courseId }),
    }
  );
  return result.certificateId;
}

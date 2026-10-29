/**
 * Seed a compact "Test Drive" course for end-to-end testing.
 *
 * Creates (idempotently — safe to re-run):
 *   - Course "Test Drive: Six-Stage AI Learning" (slug: test-drive-course)
 *     with one module and one lesson of each interactive content type:
 *     text, video, studentInterview, gptLesson, quiz.
 *   - Demo student account: demo.student@curioquest.com / DemoLearn2026!
 *   - An active enrollment linking that student to the test course.
 *
 * Unlike seed-curioquest-academy.ts, this script does NOT wipe any data.
 *
 * Run: npx tsx scripts/seed-test-course.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const projectId =
  process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

let credential;
if (serviceAccountJson) {
  credential = cert(JSON.parse(serviceAccountJson));
} else if (clientEmail && privateKey && projectId) {
  credential = cert({ projectId, clientEmail, privateKey });
} else {
  console.error(
    "Missing Firebase Admin credentials. Set FIREBASE_SERVICE_ACCOUNT_KEY " +
      "or FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY in .env.local"
  );
  process.exit(1);
}

const app = initializeApp({ credential, projectId });
const db = getFirestore(app);
const auth = getAuth(app);

// ============================================================================
// Deterministic IDs — re-running updates the same docs, no duplicates.
// ============================================================================

const COURSE_ID = "testdrive-course";
const MODULE_ID = "testdrive-module-1";
const ENROLLMENT_ID = "testdrive-enrollment";

const DEMO_STUDENT = {
  email: "demo.student@curioquest.com",
  password: "DemoLearn2026!",
  firstName: "Demo",
  lastName: "Student",
};

const DEFAULT_INTERVIEW_SYSTEM_PROMPT = `You are a warm, friendly interviewer talking with a child about how they like to learn. Your goal is to understand what helps them enjoy learning and do their best.

Ask ONE short question at a time, then wait for their answer. Keep your words simple — about a 6th grade reading level. Be curious and encouraging, never pushy.

Across the conversation, gently explore:
- Which school subjects and activities they enjoy most
- How they like to learn new things (watching videos, playing games, reading, doing it with their hands, talking it through)
- What makes them feel proud of their work
- What rewards motivate them (stars, badges, streaks, unlocking new things, hearing "great job", free time)
- When they feel focused and when they get bored or stuck
- How they like to be helped when something is hard (hints, examples, trying again, being shown once)
- Their hobbies and interests that a coach could use in examples

Rules:
- Never ask for their name, address, school name, phone, email, passwords, or family details.
- If they share something that sounds unsafe or upsetting, respond kindly and briefly, then flag it — do not keep asking questions about it.
- Ask at most one question per message. No lists of questions.
- When you have a good picture (usually after several answers), wrap up warmly and thank them.`;

// ============================================================================
// LESSONS — one of each interactive content type
// ============================================================================

interface SeedLesson {
  title: string;
  description: string;
  contentType: string;
  videoUrl?: string;
  videoDurationSeconds?: number;
  textContent?: string;
  gptConfig?: Record<string, unknown>;
  interviewConfig?: Record<string, unknown>;
}

const lessons: SeedLesson[] = [
  {
    title: "Welcome to the Test Course",
    description:
      "A quick read that explains what this sandbox course is for and what to try in each lesson.",
    contentType: "text",
    textContent: `# Welcome to the Test Course

This course is a **sandbox** — a safe place to try every kind of lesson CurioQuest offers.

Here is what you will try:

1. **This text lesson** — read it, then mark it complete.
2. **A video lesson** — a short clip you can watch to the end.
3. **An AI Student Interview** — a friendly chat where the AI coach learns how *you* like to learn.
4. **A GPT Lesson** — the six-stage guided lesson: Notice, Try, Challenge, Verify, Reflect, Transfer.
5. **A quiz** — three quick questions to check what you learned.

When every lesson is done, the course is complete and a certificate is issued. Let's go!`,
  },
  {
    title: "Watch This: A Quick Video",
    description:
      "A short sample video. Watch it to the end to see how video lessons track progress.",
    contentType: "video",
    videoUrl:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    videoDurationSeconds: 15,
  },
  {
    title: "Tell Me How You Learn",
    description:
      "A friendly chat with your coach — answer a few fun questions so every lesson can be shaped just for you.",
    contentType: "studentInterview",
    interviewConfig: {
      systemPrompt: DEFAULT_INTERVIEW_SYSTEM_PROMPT,
      minTurns: 4,
      maxTurns: 8,
      estimatedDurationMinutes: 5,
      audience: "minor",
      gradeBand: "3-5",
      requiresGuardianConsent: false,
    },
  },
  {
    title: "GPT Lesson: What Is a Fraction?",
    description:
      "A guided AI lesson — your coach asks, you think, you try. Experience all six stages on a real math topic.",
    contentType: "gptLesson",
    gptConfig: {
      topicArea: "fractions as equal parts of a whole",
      learningObjective:
        "Explain that a fraction names equal parts of a whole, and identify halves, thirds, and fourths in everyday examples",
      audience: "minor",
      gradeBand: "3-5",
      prerequisites: [],
      tutorPersona: "math",
      customPersonaInstructions: null,
      estimatedDurationMinutes: 15,
      maxHints: 3,
      requiresGuardianConsent: false,
      requiresInstructorReview: false,
      quizPassingPercentage: 80,
      rubricPassingScore: 3,
      maxTransferAttempts: 2,
      promptVersion: "gpt-lesson-v1",
    },
  },
  {
    title: "Quick Check: What Did You Notice?",
    description:
      "Three quick questions about how this platform works — a demo of the quiz lesson type.",
    contentType: "quiz",
    textContent: `# Test Course Check

Passing Score: 70%

### Q1: In a GPT lesson, what happens first?
A) You take a final exam
B) The coach asks what you already notice about the topic ✓
C) You watch a long lecture
*The six stages start with NOTICE — the coach surfaces what you already know.

### Q2: What does the AI Student Interview learn about you?
A) Your home address
B) Your grades at school
C) How you like to learn and what rewards motivate you ✓
*The interview personalizes future lessons — it never asks for private details.

### Q3: When every lesson in a course is complete, what do you earn?
A) A completion certificate ✓
B) Nothing happens
C) The course resets
*Completing a course issues a printable certificate and updates your progress report.`,
  },
  {
    title: "Wrap-Up: You Tested Everything",
    description:
      "A short closing read — mark it complete to finish the course and earn your test certificate.",
    contentType: "text",
    textContent: `# You Did It

You tried every interactive lesson type:

- Read a text lesson
- Watched a video
- Chatted through an AI interview
- Worked through a six-stage GPT lesson
- Passed a quiz

Mark this lesson complete to finish the course — your certificate will be issued automatically and you can print your progress report from the course page.`,
  },
];

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log("🧪 Seeding Test Drive course...\n");

  // --- Course ---
  const courseRef = db.collection("lms_courses").doc(COURSE_ID);
  await courseRef.set({
    id: COURSE_ID,
    title: "Test Drive: Six-Stage AI Learning",
    slug: "test-drive-course",
    description:
      "A short sandbox course with one lesson of every type — text, video, an AI interview, a six-stage GPT lesson, and a quiz. Built for end-to-end testing of enroll → learn → complete → certificate.",
    shortDescription:
      "A compact sandbox course to test every lesson type end-to-end.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&q=80&auto=format&fit=crop",
    thumbnailImageId: null,
    previewVideoUrl: null,
    categoryId: null,
    instructorName: "Coach Maya",
    instructorBio:
      "Your friendly AI math coach. Coach Maya helps you figure out tricky problems one hint at a time.",
    instructorImageUrl: null,
    difficultyLevel: "beginner",
    estimatedDurationMinutes: 45,
    minSubscriptionTierId: null,
    isFeatured: false,
    isPublished: true,
    publishedAt: Timestamp.now(),
    tags: ["test", "sandbox", "gpt-lesson", "demo"],
    learningOutcomes: [
      "Experience every lesson content type CurioQuest supports",
      "Complete a course and receive a certificate",
    ],
    prerequisites: [],
    enrollmentCount: 0,
    priceInCents: 0,
    compareAtPriceInCents: null,
    isFree: true,
    stripePriceId: null,
    stripeProductId: null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  console.log("   ✓ Course: Test Drive: Six-Stage AI Learning");

  // --- Module ---
  const moduleRef = db.collection("lms_course_modules").doc(MODULE_ID);
  await moduleRef.set({
    id: MODULE_ID,
    courseId: COURSE_ID,
    title: "Try Every Lesson Type",
    description:
      "One of each: text, video, AI interview, GPT lesson, and a quiz.",
    sortOrder: 0,
    createdAt: Timestamp.now(),
  });
  console.log("   ✓ Module with", lessons.length, "lessons");

  // --- Lessons ---
  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    const lessonId = `testdrive-lesson-${i + 1}`;
    await db
      .collection("lms_lessons")
      .doc(lessonId)
      .set({
        id: lessonId,
        moduleId: MODULE_ID,
        courseId: COURSE_ID,
        title: lesson.title,
        slug: lesson.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
        description: lesson.description,
        contentType: lesson.contentType,
        videoUrl: lesson.videoUrl ?? null,
        videoDurationSeconds: lesson.videoDurationSeconds ?? null,
        textContent: lesson.textContent ?? null,
        downloadUrl: null,
        gptConfig: lesson.gptConfig ?? null,
        interviewConfig: lesson.interviewConfig ?? null,
        imageId: null,
        imageUrl: null,
        isPreview: i === 0,
        sortOrder: i,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    console.log(`      • ${lesson.title} (${lesson.contentType})`);
  }

  // --- Demo student account ---
  console.log("\n👤 Provisioning demo student...");
  let uid: string;
  try {
    const existing = await auth.getUserByEmail(DEMO_STUDENT.email);
    uid = existing.uid;
    await auth.updateUser(uid, {
      password: DEMO_STUDENT.password,
      displayName: `${DEMO_STUDENT.firstName} ${DEMO_STUDENT.lastName}`,
    });
    console.log(`   ✓ Reused existing auth account (${uid})`);
  } catch (error: unknown) {
    const code = (error as { code?: string }).code;
    if (code !== "auth/user-not-found") throw error;
    const created = await auth.createUser({
      email: DEMO_STUDENT.email,
      password: DEMO_STUDENT.password,
      displayName: `${DEMO_STUDENT.firstName} ${DEMO_STUDENT.lastName}`,
    });
    uid = created.uid;
    console.log(`   ✓ Created auth account (${uid})`);
  }

  // --- teamMembers record (sign-in links by firebaseUid / emailPrimary) ---
  const membersSnap = await db
    .collection("teamMembers")
    .where("emailPrimary", "==", DEMO_STUDENT.email)
    .limit(1)
    .get();
  let teamMemberId: string;
  if (membersSnap.empty) {
    const ref = await db.collection("teamMembers").add({
      firstName: DEMO_STUDENT.firstName,
      lastName: DEMO_STUDENT.lastName,
      emailPrimary: DEMO_STUDENT.email,
      firebaseUid: uid,
      role: "client",
      status: "active",
      expertise: "",
      isClient: true,
      clientSince: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    teamMemberId = ref.id;
    console.log(`   ✓ Created teamMember (${teamMemberId})`);
  } else {
    teamMemberId = membersSnap.docs[0].id;
    await membersSnap.docs[0].ref.update({
      firebaseUid: uid,
      updatedAt: Timestamp.now(),
    });
    console.log(`   ✓ Linked existing teamMember (${teamMemberId})`);
  }

  // --- Enrollment ---
  await db
    .collection("lms_enrollments")
    .doc(ENROLLMENT_ID)
    .set({
      id: ENROLLMENT_ID,
      userId: teamMemberId,
      courseId: COURSE_ID,
      enrolledAt: Timestamp.now(),
      completedAt: null,
      progressPercentage: 0,
      lastAccessedAt: null,
      certificateIssuedAt: null,
      certificateId: null,
    });
  console.log(`   ✓ Enrolled in test course`);

  console.log(`
✅ Test course ready!

   Course:  Test Drive: Six-Stage AI Learning (id: ${COURSE_ID})
   Lessons: 5 — text, video, studentInterview, gptLesson, quiz

   Sign in at /sign-in:
     Email:    ${DEMO_STUDENT.email}
     Password: ${DEMO_STUDENT.password}

   Then open /portal/my-courses and start the course.
   Completing all lessons → certificate auto-issues → /certificate/<id>
   Print report → /portal/my-courses/${COURSE_ID}/report

   Note: the GPT lesson and interview use the configured LLM when one is
   set (Settings → LLM Configuration or OPENAI_API_KEY). Without one they
   run in safe scripted-fallback mode; the GPT lesson will then require
   instructor review before passing (by design).
`);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});

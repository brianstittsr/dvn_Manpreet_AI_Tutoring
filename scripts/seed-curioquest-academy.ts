/**
 * Seed CurioQuest Academy Data Script
 *
 * Replaces the business-coaching LMS catalog with K-12 AI tutoring courses
 * built around the CurioQuest three-coach model:
 *   - Coach Maya      -> Math
 *   - Story Explorer  -> Reading & Language Arts
 *   - Growth & Glow   -> Life Skills & Study Skills
 *
 * Deletes existing lms_* seed docs (and the legacy non-lms catalog
 * collections), then seeds categories, courses, modules, lessons,
 * workshops, badges, and subscription tiers.
 *
 * Lesson content spans every ContentType: video, text, quiz, assignment,
 * download, live, and gptLesson (with full GPTLessonConfig).
 *
 * Run with: npx ts-node scripts/seed-curioquest-academy.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

// Firebase Admin — prefer the single JSON service-account key, fall back to
// the split client-email/private-key vars used by lib/firebase-admin.
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

// ============================================================================
// COLLECTION NAMES
// ============================================================================

const COLLECTIONS = {
  CATEGORIES: "lms_categories",
  COURSES: "lms_courses",
  COURSE_MODULES: "lms_course_modules",
  LESSONS: "lms_lessons",
  WORKSHOPS: "lms_workshops",
  BADGES: "lms_badges",
  SUBSCRIPTION_TIERS: "lms_subscription_tiers",
};

// Collections wiped before seeding. The second group is learner data tied to
// the old catalog; the third is the legacy non-lms catalog (dead collections
// from the original seed-firebase-academy run — nothing reads them).
const WIPE_COLLECTIONS = [
  ...Object.values(COLLECTIONS),
  "lms_enrollments",
  "lms_lesson_progress",
  "lms_workshop_registrations",
  "courses",
  "courseCategories",
  "workshops",
  "subscriptionTiers",
  "blogCategories",
];

// ============================================================================
// TYPES
// ============================================================================

type ContentType =
  | "video"
  | "text"
  | "quiz"
  | "assignment"
  | "download"
  | "live"
  | "studentInterview"
  | "gptLesson";

interface GPTConfig {
  topicArea: string;
  learningObjective: string;
  audience: "minor" | "adult";
  gradeBand: string;
  prerequisites: string[];
  tutorPersona: "math" | "reading" | "lifeSkills";
  customPersonaInstructions: string | null;
  estimatedDurationMinutes: number;
  maxHints: number;
  requiresGuardianConsent: boolean;
  requiresInstructorReview: boolean;
  quizPassingPercentage: number;
  rubricPassingScore: number;
  maxTransferAttempts: number;
  promptVersion: string;
}

interface InterviewConfig {
  systemPrompt: string;
  minTurns: number;
  maxTurns: number;
  estimatedDurationMinutes: number | null;
  audience: "minor" | "adult";
  gradeBand: string | null;
  requiresGuardianConsent: boolean;
}

interface SeedLesson {
  title: string;
  description: string;
  contentType: ContentType;
  videoDurationSeconds?: number;
  textContent?: string;
  gptConfig?: Partial<GPTConfig> & Pick<GPTConfig, "topicArea" | "learningObjective" | "tutorPersona">;
  interviewConfig?: InterviewConfig;
}

interface SeedModule {
  title: string;
  description: string;
  lessons: SeedLesson[];
}

interface SeedCourse {
  title: string;
  shortDescription: string;
  description: string;
  categorySlug: string;
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  estimatedDurationMinutes: number;
  isFeatured: boolean;
  thumbnailUrl: string;
  tags: string[];
  learningOutcomes: string[];
  prerequisites: string[];
  instructorName: string;
  instructorBio: string;
  modules: SeedModule[];
}

// ============================================================================
// HELPERS
// ============================================================================

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const COACH = {
  math: {
    name: "Coach Maya",
    bio: "Your friendly AI math coach. Coach Maya helps you figure out tricky problems one hint at a time — and celebrates every win.",
  },
  reading: {
    name: "Story Explorer",
    bio: "Your friendly AI reading coach. Story Explorer loves great stories and helps you find the big ideas hiding inside them.",
  },
  lifeSkills: {
    name: "Growth & Glow",
    bio: "Your friendly AI life-skills coach. Growth & Glow helps you build confidence, kindness, and super-learner habits.",
  },
} as const;

function gpt(
  overrides: Partial<GPTConfig> &
    Pick<GPTConfig, "topicArea" | "learningObjective" | "tutorPersona"> & {
      gradeBand?: string;
    }
): GPTConfig {
  return {
    audience: "minor",
    gradeBand: "3-5",
    prerequisites: [],
    customPersonaInstructions: null,
    estimatedDurationMinutes: 20,
    maxHints: 3,
    requiresGuardianConsent: true,
    requiresInstructorReview: true,
    quizPassingPercentage: 80,
    rubricPassingScore: 3,
    maxTransferAttempts: 2,
    promptVersion: "gpt-lesson-v1",
    ...overrides,
  };
}

// Mirrors lib/interview-server.ts DEFAULT_INTERVIEW_SYSTEM_PROMPT — kept inline
// so the seed never imports the app's firebase-admin graph.
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

function interview(gradeBand: string): InterviewConfig {
  return {
    systemPrompt: DEFAULT_INTERVIEW_SYSTEM_PROMPT,
    minTurns: 6,
    maxTurns: 12,
    estimatedDurationMinutes: 10,
    audience: "minor",
    gradeBand,
    requiresGuardianConsent: true,
  };
}

// Verified Unsplash photos (kids learning, in use across the marketing pages)
const IMG = {
  classroom: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&q=80&auto=format&fit=crop",
  writing: "https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=1200&q=80&auto=format&fit=crop",
  reading: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=1200&q=80&auto=format&fit=crop",
  happy: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&q=80&auto=format&fit=crop",
  friends: "https://images.unsplash.com/photo-1555009393-f20bdb245c4d?w=1200&q=80&auto=format&fit=crop",
  supplies: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80&auto=format&fit=crop",
};

// ============================================================================
// CATEGORIES
// ============================================================================

const categories = [
  {
    name: "Math Adventures",
    slug: "math-adventures",
    description: "Numbers, shapes, and puzzles — made fun with Coach Maya",
    icon: "🔢",
    color: "#6366f1",
    sortOrder: 1,
  },
  {
    name: "Reading & Stories",
    slug: "reading-stories",
    description: "Books, words, and stories — explored with Story Explorer",
    icon: "📚",
    color: "#a855f7",
    sortOrder: 2,
  },
  {
    name: "Life Skills",
    slug: "life-skills",
    description: "Confidence, kindness, and feelings — growing with Growth & Glow",
    icon: "🌟",
    color: "#f97316",
    sortOrder: 3,
  },
  {
    name: "Study Skills",
    slug: "study-skills",
    description: "Focus, memory, and smart habits for super learners",
    icon: "💡",
    color: "#22c55e",
    sortOrder: 4,
  },
];

// ============================================================================
// COURSES
// ============================================================================

const courses: SeedCourse[] = [
  // -------------------------------------------------------------------------
  // COURSE 1 — MATH
  // -------------------------------------------------------------------------
  {
    title: "Number Sense Adventures",
    shortDescription:
      "Build rock-solid number skills — place value, adding, subtracting, and your first multiplication wins. For grades 3–5.",
    description: `Numbers are everywhere — and once they make sense, math gets a lot more fun.

In this course, Coach Maya helps you truly understand how numbers work. You'll break big numbers into pieces, add and subtract in your head like a pro, and take your first steps into multiplication and division.

Every lesson follows the CurioQuest way: your coach asks, you think, you try — and you never just get handed the answer.

Best for learners in grades 3–5, or anyone who wants to feel more confident with numbers.`,
    categorySlug: "math-adventures",
    difficultyLevel: "beginner",
    estimatedDurationMinutes: 240,
    isFeatured: true,
    thumbnailUrl: IMG.supplies,
    tags: ["math", "place value", "addition", "subtraction", "multiplication", "grades 3-5"],
    learningOutcomes: [
      "Explain what each digit in a 4-digit number is worth",
      "Add and subtract 2- and 3-digit numbers using smart strategies",
      "Multiply and divide using equal groups and arrays",
      "Solve real-life word problems step by step",
    ],
    prerequisites: ["Can count to 1,000", "Can read and write two-digit numbers"],
    instructorName: COACH.math.name,
    instructorBio: COACH.math.bio,
    modules: [
      {
        title: "Place Value Power",
        description: "Discover what each digit in a number really means.",
        lessons: [
          {
            title: "How Your AI Coach Teaches",
            description:
              "Your first guided lesson — experience all six stages (Notice, Try, Challenge, Verify, Reflect, Transfer) while Coach Maya shows you how learning works here.",
            contentType: "gptLesson",
            gptConfig: gpt({
              topicArea:
                "the six-stage guided-learning method — noticing a problem, trying on your own, taking on a challenge, verifying your work, reflecting, and transferring the idea to real life",
              learningObjective:
                "Name the six stages of a guided lesson and describe what the learner does at each stage.",
              tutorPersona: "math",
              gradeBand: "3-5",
              prerequisites: [],
              estimatedDurationMinutes: 15,
            }),
          },
          {
            title: "Tell Me How You Learn",
            description:
              "A friendly chat with your coach — answer a few fun questions so every lesson can be shaped just for you.",
            contentType: "studentInterview",
            interviewConfig: interview("3-5"),
          },
          {
            title: "Welcome to Place Value",
            description: "A warm-up video: what place value is and why it matters.",
            contentType: "video",
            videoDurationSeconds: 480,
          },
          {
            title: "Thousands, Hundreds, Tens, and Ones",
            description: "Read how every digit in a number has its own job.",
            contentType: "text",
            textContent: `## Every Digit Has a Job

Look at the number 3,482. It is not just a bunch of digits — each digit stands for something.

- The **3** is in the thousands place. It means 3,000.
- The **4** is in the hundreds place. It means 400.
- The **8** is in the tens place. It means 80.
- The **2** is in the ones place. It means 2.

So 3,482 is really 3,000 + 400 + 80 + 2. Mathematicians call this *expanded form*.

## Why It Matters

Place value is the secret behind almost everything in math. When you add 45 + 38, you are really adding tens and ones. When you regroup (or "carry the 1"), you are moving a ten from the ones place to the tens place.

## Try It

Write the number 5,209 in expanded form. Hint: what does the 0 in the tens place mean?`,
          },
          {
            title: "Place Value Detective",
            description:
              "A guided AI lesson with Coach Maya: hunt for digit values in mystery numbers.",
            contentType: "gptLesson",
            gptConfig: gpt({
              topicArea: "place value in numbers up to 10,000",
              learningObjective:
                "Identify the value of each digit in numbers up to four digits and write numbers in expanded form.",
              tutorPersona: "math",
              gradeBand: "3-5",
              prerequisites: ["Read and write three-digit numbers"],
            }),
          },
          {
            title: "Place Value Checkpoint",
            description: "Quick quiz to show what you know about place value.",
            contentType: "quiz",
          },
          {
            title: "Place Value Chart Worksheet",
            description: "Download and print your own place-value chart to practice with.",
            contentType: "download",
            textContent: `Use this printable chart to line up the digits in any number.

Tip: write one number each day in your chart — your homework problems work great!`,
          },
        ],
      },
      {
        title: "Add, Subtract & Solve",
        description: "Smart mental-math strategies for bigger numbers.",
        lessons: [
          {
            title: "Mental Math Tricks",
            description: "Video: three tricks for adding and subtracting in your head.",
            contentType: "video",
            videoDurationSeconds: 540,
          },
          {
            title: "Word Problem Practice",
            description:
              "A guided AI lesson: turn everyday word problems into math you can solve.",
            contentType: "gptLesson",
            gptConfig: gpt({
              topicArea: "two-step addition and subtraction word problems",
              learningObjective:
                "Read a word problem, decide which operation to use, and solve it in steps.",
              tutorPersona: "math",
              gradeBand: "3-5",
              prerequisites: ["Add and subtract two-digit numbers"],
            }),
          },
          {
            title: "Shopping List Challenge",
            description:
              "Assignment: use a pretend $20 budget and a shopping list to practice real-world math.",
            contentType: "assignment",
            textContent: `## Your Mission

You have $20 to spend at the Snack Shop:

- Apple: $1 each
- Juice box: $2 each
- Granola bar: $3 each
- Yogurt: $4 each

**Part 1:** Buy exactly 6 items without going over $20. Write down your list and show your math.

**Part 2:** What is the most expensive list of 6 items you can make? The cheapest?

**Part 3:** Explain in 2–3 sentences how you checked that you stayed under budget.`,
          },
          {
            title: "Live Math Game Session",
            description:
              "Join a live small-group game session with Coach Maya — math bingo, number races, and more.",
            contentType: "live",
            videoDurationSeconds: 2700,
          },
        ],
      },
      {
        title: "Multiply & Divide Fun",
        description: "Meet multiplication and division through equal groups.",
        lessons: [
          {
            title: "Arrays and Equal Groups",
            description: "Read how rows, groups, and pictures make multiplication make sense.",
            contentType: "text",
            textContent: `## What Multiplication Really Means

4 × 3 is not magic — it means **4 groups of 3**. Draw 4 circles with 3 dots in each, and you can see 12 dots right there.

The same idea is called an *array*: dots lined up in rows and columns. 4 rows of 3 dots = 12 dots. An array shows the answer before you even count!

## Division Is the Opposite

If 4 × 3 = 12, then 12 ÷ 4 = 3. Division asks: "How many in each group?" or "How many groups?"

Sharing 12 cookies fairly among 4 friends? That's division. Each friend gets 3.

## Try It

Draw an array for 3 × 5. How many dots do you get? Now write the division fact that goes with it.`,
          },
          {
            title: "Times Table Explorer",
            description:
              "A guided AI lesson: discover patterns in the times tables with Coach Maya.",
            contentType: "gptLesson",
            gptConfig: gpt({
              topicArea: "multiplication facts through 10x10",
              learningObjective:
                "Use equal groups and skip-counting patterns to build and recall multiplication facts.",
              tutorPersona: "math",
              gradeBand: "3-5",
              prerequisites: ["Skip-count by 2s, 5s, and 10s"],
            }),
          },
          {
            title: "Multiplication Mix-Up Quiz",
            description: "Quiz: equal groups, arrays, and division — show what you know.",
            contentType: "quiz",
          },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // COURSE 2 — MATH
  // -------------------------------------------------------------------------
  {
    title: "Fractions Fun Lab",
    shortDescription:
      "Fractions finally make sense! Parts of a whole, equivalent fractions, and real-life fraction problems. For grades 4–6.",
    description: `Half a pizza, a quarter of an hour, three-fourths of a mile — fractions are part of everyday life.

In this hands-on course, Coach Maya helps you see what fractions really mean instead of memorizing rules. You'll build fraction models, discover equivalent fractions, and solve problems about food, time, and measuring.

Best for learners in grades 4–6 who are ready to stop guessing and start understanding.`,
    categorySlug: "math-adventures",
    difficultyLevel: "intermediate",
    estimatedDurationMinutes: 210,
    isFeatured: true,
    thumbnailUrl: IMG.classroom,
    tags: ["math", "fractions", "equivalent fractions", "grades 4-6"],
    learningOutcomes: [
      "Explain what the numerator and denominator mean",
      "Show fractions with pictures and number lines",
      "Find equivalent fractions and compare fraction sizes",
      "Solve fraction problems from real life",
    ],
    prerequisites: ["Multiply and divide whole numbers", "Understand equal groups"],
    instructorName: COACH.math.name,
    instructorBio: COACH.math.bio,
    modules: [
      {
        title: "Meet the Fractions",
        description: "What a fraction is — and what it is not.",
        lessons: [
          {
            title: "How Your AI Coach Teaches",
            description:
              "Your first guided lesson — experience all six stages (Notice, Try, Challenge, Verify, Reflect, Transfer) while Coach Maya shows you how learning works here.",
            contentType: "gptLesson",
            gptConfig: gpt({
              topicArea:
                "the six-stage guided-learning method — noticing a problem, trying on your own, taking on a challenge, verifying your work, reflecting, and transferring the idea to real life",
              learningObjective:
                "Name the six stages of a guided lesson and describe what the learner does at each stage.",
              tutorPersona: "math",
              gradeBand: "4-6",
              prerequisites: [],
              estimatedDurationMinutes: 15,
            }),
          },
          {
            title: "Tell Me How You Learn",
            description:
              "A friendly chat with your coach — answer a few fun questions so every lesson can be shaped just for you.",
            contentType: "studentInterview",
            interviewConfig: interview("4-6"),
          },
          {
            title: "What Is a Fraction?",
            description: "Video: fractions as parts of a whole, with drawings you'll recognize.",
            contentType: "video",
            videoDurationSeconds: 420,
          },
          {
            title: "Parts of a Whole",
            description: "Read how the top and bottom numbers each tell you something important.",
            contentType: "text",
            textContent: `## Two Numbers, One Job

A fraction has two parts:

- The **denominator** (bottom) tells you how many equal parts the whole is split into.
- The **numerator** (top) tells you how many of those parts you're talking about.

In 3/4, something is split into 4 equal parts — and you have 3 of them. Like 3 slices of a 4-slice pizza.

## A Fraction Is a Fair Share

Fractions only work when the parts are **equal**. A pizza cut into one giant slice and three tiny ones doesn't really give you fourths. Fair shares are the whole point!

## Try It

A chocolate bar is broken into 8 equal squares. You eat 5. What fraction did you eat? What fraction is left?`,
          },
          {
            title: "Fraction Basics",
            description: "A guided AI lesson: build and label fractions with Coach Maya.",
            contentType: "gptLesson",
            gptConfig: gpt({
              topicArea: "understanding numerators, denominators, and unit fractions",
              learningObjective:
                "Name the fraction shown by a model and explain the role of the numerator and denominator.",
              tutorPersona: "math",
              gradeBand: "4-6",
              prerequisites: ["Divide a shape into equal parts"],
            }),
          },
        ],
      },
      {
        title: "Compare & Equivalents",
        description: "Why 1/2, 2/4, and 4/8 are really the same amount.",
        lessons: [
          {
            title: "Fraction Families",
            description: "Read how equivalent fractions are different names for the same amount.",
            contentType: "text",
            textContent: `## Same Amount, Different Name

Cut a pizza into 2 pieces and take 1: you have 1/2. Cut it into 4 and take 2: you have 2/4. Same pizza, same amount — **equivalent fractions**.

The trick: multiply the top and bottom by the same number, and the fraction keeps its value. 1/2 × 2/2 = 2/4. × 4/4 = 4/8.

## Which Fraction Is Bigger?

To compare fractions, give them the same denominator (same-size pieces). Is 1/3 or 1/4 bigger? A third of a pizza is a bigger slice than a fourth — fewer cuts, bigger pieces. So 1/3 > 1/4.

## Try It

Find two fractions equivalent to 3/5. Then decide which is bigger: 2/3 or 3/5?`,
          },
          {
            title: "Equivalent Fractions Quest",
            description:
              "A guided AI lesson: hunt for equivalent fractions and prove your answers.",
            contentType: "gptLesson",
            gptConfig: gpt({
              topicArea: "generating and recognizing equivalent fractions",
              learningObjective:
                "Create equivalent fractions by multiplying or dividing numerator and denominator, and compare simple fractions.",
              tutorPersona: "math",
              gradeBand: "4-6",
              prerequisites: ["Name the numerator and denominator of a fraction"],
            }),
          },
          {
            title: "Compare the Fractions",
            description: "Quiz: equivalents, comparisons, and number-line thinking.",
            contentType: "quiz",
          },
        ],
      },
      {
        title: "Fractions in Real Life",
        description: "Food, time, and measuring — where fractions live.",
        lessons: [
          {
            title: "Pizza & Pie Math",
            description: "Video: fraction puzzles about sharing food fairly.",
            contentType: "video",
            videoDurationSeconds: 390,
          },
          {
            title: "Fraction Recipe Challenge",
            description:
              "Assignment: double and halve a real recipe using what you learned.",
            contentType: "assignment",
            textContent: `## Your Mission

A smoothie recipe for 2 people uses:

- 1/2 cup of yogurt
- 3/4 cup of frozen berries
- 1/4 cup of honey
- 1 cup of milk

**Part 1:** Your whole family wants smoothies — 4 people. Double every ingredient. Write the new amounts.

**Part 2:** Now make the recipe for just 1 person. Halve every ingredient.

**Part 3:** Explain how you found half of 3/4 cup. A drawing is a great way to show your thinking!`,
          },
          {
            title: "Fraction Strips Printable",
            description: "Download printable fraction strips to fold, cut, and compare.",
            contentType: "download",
            textContent: `Print these fraction strips on thick paper if you can.

Fold them, line them up, and see for yourself which fractions match. Keep them in your math folder — they make every fraction homework easier.`,
          },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // COURSE 3 — READING
  // -------------------------------------------------------------------------
  {
    title: "Story Explorer: Reading Adventures",
    shortDescription:
      "Go inside great stories — find the main idea, understand characters, and read between the lines. For grades 3–5.",
    description: `Every story has secrets hiding inside it. Great readers know how to find them.

In this course, Story Explorer guides you through short, fun passages and shows you how real readers think: what's the main idea? Why did the character do that? What is the story trying to say without saying it?

Best for learners in grades 3–5 who love stories — or who want to love them.`,
    categorySlug: "reading-stories",
    difficultyLevel: "beginner",
    estimatedDurationMinutes: 225,
    isFeatured: true,
    thumbnailUrl: IMG.reading,
    tags: ["reading", "main idea", "characters", "inference", "grades 3-5"],
    learningOutcomes: [
      "Find the main idea and the details that support it",
      "Describe characters using clues from the story",
      "Make smart inferences — read between the lines",
      "Explain what a story is really about in your own words",
    ],
    prerequisites: ["Read short stories and paragraphs independently"],
    instructorName: COACH.reading.name,
    instructorBio: COACH.reading.bio,
    modules: [
      {
        title: "Main Idea Magic",
        description: "Find the one big idea every paragraph is really about.",
        lessons: [
          {
            title: "How Your AI Coach Teaches",
            description:
              "Your first guided lesson — experience all six stages (Notice, Try, Challenge, Verify, Reflect, Transfer) while Story Explorer shows you how learning works here.",
            contentType: "gptLesson",
            gptConfig: gpt({
              topicArea:
                "the six-stage guided-learning method — noticing a problem, trying on your own, taking on a challenge, verifying your work, reflecting, and transferring the idea to real life",
              learningObjective:
                "Name the six stages of a guided lesson and describe what the learner does at each stage.",
              tutorPersona: "reading",
              gradeBand: "3-5",
              prerequisites: [],
              estimatedDurationMinutes: 15,
            }),
          },
          {
            title: "Tell Me How You Learn",
            description:
              "A friendly chat with your coach — answer a few fun questions so every lesson can be shaped just for you.",
            contentType: "studentInterview",
            interviewConfig: interview("3-5"),
          },
          {
            title: "Finding the Big Idea",
            description: "Video: what 'main idea' means and how to spot it fast.",
            contentType: "video",
            videoDurationSeconds: 450,
          },
          {
            title: "Main Idea vs. Details",
            description: "Read the difference between the big idea and the facts that prove it.",
            contentType: "text",
            textContent: `## The Umbrella Trick

Think of the main idea as an umbrella. All the little details have to fit under it.

Here's a paragraph:

> Bees visit flowers to collect nectar. They carry pollen from flower to flower. This helps plants make seeds. Farmers depend on bees for many of the foods we eat.

The details talk about nectar, pollen, seeds, and farmers. What big idea covers them all? **Bees are important helpers for plants and people.**

## Finding It Yourself

Ask two questions:

1. What is this paragraph mostly about? (The topic)
2. What is the author saying about it? (The point)

Topic + point = main idea.

## Try It

Write one sentence: "Paragraphs have a main idea because ______." Your answer should fit under the umbrella of this whole lesson!`,
          },
          {
            title: "Main Idea Detective",
            description:
              "A guided AI lesson: solve short passages and find the main idea with Story Explorer.",
            contentType: "gptLesson",
            gptConfig: gpt({
              topicArea: "identifying main idea and supporting details in short passages",
              learningObjective:
                "State the main idea of a short passage and name two details that support it.",
              tutorPersona: "reading",
              gradeBand: "3-5",
              prerequisites: ["Read a short paragraph aloud"],
            }),
          },
          {
            title: "Main Idea Checkpoint",
            description: "Quiz: pick the main idea and the details that support it.",
            contentType: "quiz",
          },
        ],
      },
      {
        title: "Characters & Settings",
        description: "Understand who a story is about and where it happens.",
        lessons: [
          {
            title: "Who and Where",
            description: "Read how authors show you characters — without just telling you.",
            contentType: "text",
            textContent: `## Show, Don't Tell

Good authors don't say "Maya was nervous." They say "Maya's hands shook as she reached for the microphone." You figured out she was nervous all by yourself — that's reading like a detective.

## Character Clues

Watch for three kinds of clues:

1. **Actions** — what the character does
2. **Words** — what the character says (and how they say it)
3. **Feelings** — what the character thinks inside

## The Setting Matters Too

A story about a stormy lighthouse feels different than the same story on a sunny beach. Setting isn't just where — it changes how the story feels and what can happen.

## Try It

"Jamal slammed his notebook shut and stared at the rain." What can you guess about how Jamal feels? What clues told you?`,
          },
          {
            title: "Character Feelings",
            description:
              "A guided AI lesson: figure out how characters feel using story clues.",
            contentType: "gptLesson",
            gptConfig: gpt({
              topicArea: "describing character feelings and traits using text evidence",
              learningObjective:
                "Describe a character's feelings and back it up with evidence from the story.",
              tutorPersona: "reading",
              gradeBand: "3-5",
              prerequisites: ["Identify the characters in a story"],
            }),
          },
          {
            title: "Character Trading Card",
            description:
              "Assignment: make a 'trading card' for a character from a book you love.",
            contentType: "assignment",
            textContent: `## Your Mission

Pick a character from any book you know well.

**On your card, include:**

- The character's name and the book they're from
- Three words that describe them (brave? sneaky? kind?)
- One thing they DO in the story that proves one of your words
- One thing they SAY that shows their personality
- A drawing of the character (stick figures welcome!)

**Bonus:** Give your character a "power stat" — how brave, clever, or kind are they out of 10? Explain your rating in one sentence.`,
          },
        ],
      },
      {
        title: "Inference Detective",
        description: "Read between the lines — figure out what the story doesn't say.",
        lessons: [
          {
            title: "Reading Between the Lines",
            description: "Video: what an inference is, with fun mystery examples.",
            contentType: "video",
            videoDurationSeconds: 400,
          },
          {
            title: "Make an Inference",
            description:
              "A guided AI lesson: use clues to figure out what the author doesn't tell you.",
            contentType: "gptLesson",
            gptConfig: gpt({
              topicArea: "making inferences from short fiction passages",
              learningObjective:
                "Make a reasonable inference about a character or event and explain which clues support it.",
              tutorPersona: "reading",
              gradeBand: "3-5",
              prerequisites: ["Retell the main events of a short story"],
            }),
          },
          {
            title: "Inference Clue Cards",
            description: "Download practice clue cards for offline inference games.",
            contentType: "download",
            textContent: `Print and cut out these clue cards.

Each card has a tiny scene — like "wet shoes by the door and a dripping umbrella." Your job: say what you infer, and which clue told you. Play with a friend or family member!`,
          },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // COURSE 4 — READING/WRITING
  // -------------------------------------------------------------------------
  {
    title: "Word Power: Vocabulary & Writing",
    shortDescription:
      "Unlock new words, build stronger sentences, and write stories people want to read. For grades 5–7.",
    description: `Words are your superpower — the right word makes your ideas sparkle.

In this course, Story Explorer helps you crack new words using context clues, stretch flat sentences into strong ones, and write story openings that grab readers from the first line.

Best for learners in grades 5–7 who are ready to level up their writing.`,
    categorySlug: "reading-stories",
    difficultyLevel: "intermediate",
    estimatedDurationMinutes: 240,
    isFeatured: false,
    thumbnailUrl: IMG.writing,
    tags: ["vocabulary", "writing", "sentences", "context clues", "grades 5-7"],
    learningOutcomes: [
      "Use context clues to figure out new words",
      "Write stronger, more interesting sentences",
      "Use transition words to connect ideas",
      "Write a story opening that hooks the reader",
    ],
    prerequisites: ["Write complete sentences and short paragraphs"],
    instructorName: COACH.reading.name,
    instructorBio: COACH.reading.bio,
    modules: [
      {
        title: "Word Detective",
        description: "Figure out new words without a dictionary.",
        lessons: [
          {
            title: "How Your AI Coach Teaches",
            description:
              "Your first guided lesson — experience all six stages (Notice, Try, Challenge, Verify, Reflect, Transfer) while Story Explorer shows you how learning works here.",
            contentType: "gptLesson",
            gptConfig: gpt({
              topicArea:
                "the six-stage guided-learning method — noticing a problem, trying on your own, taking on a challenge, verifying your work, reflecting, and transferring the idea to real life",
              learningObjective:
                "Name the six stages of a guided lesson and describe what the learner does at each stage.",
              tutorPersona: "reading",
              gradeBand: "5-7",
              prerequisites: [],
              estimatedDurationMinutes: 15,
            }),
          },
          {
            title: "Tell Me How You Learn",
            description:
              "A friendly chat with your coach — answer a few fun questions so every lesson can be shaped just for you.",
            contentType: "studentInterview",
            interviewConfig: interview("5-7"),
          },
          {
            title: "Context Clues",
            description: "Read how the words around a mystery word give away its meaning.",
            contentType: "text",
            textContent: `## The Sentence Is the Clue

You don't need a dictionary for every new word. The sentence around it usually whispers the answer. These whispers are called **context clues**.

Three clues to look for:

1. **Definition clue:** "The arbor, a shady archway covered in vines, was cool."
2. **Example clue:** "Citrus fruits, such as oranges and lemons, grow in Florida."
3. **Opposite clue:** "Unlike her talkative brother, Priya was taciturn — she barely said a word."

## Detective Steps

1. Read the sentence with the new word.
2. Look for a clue — definition, example, or opposite.
3. Guess the meaning. Swap your guess into the sentence — does it still make sense?

## Try It

"The desert was arid, with no rain for months." What does *arid* mean? Which clue type told you?`,
          },
          {
            title: "Crack the Context Clue",
            description:
              "A guided AI lesson: decode tricky words in real sentences with Story Explorer.",
            contentType: "gptLesson",
            gptConfig: gpt({
              topicArea: "using context clues to determine word meaning",
              learningObjective:
                "Use definition, example, and contrast clues to figure out the meaning of unfamiliar words.",
              tutorPersona: "reading",
              gradeBand: "5-7",
              prerequisites: ["Read grade-level paragraphs independently"],
            }),
          },
          {
            title: "Word Detective Quiz",
            description: "Quiz: six mystery words, six chances to crack the clues.",
            contentType: "quiz",
          },
        ],
      },
      {
        title: "Sentence Builders",
        description: "Turn flat sentences into strong, interesting ones.",
        lessons: [
          {
            title: "Strong Sentences",
            description: "Read the two moves that make any sentence better.",
            contentType: "text",
            textContent: `## Two Moves, Stronger Sentences

Flat sentence: "The dog ran."

**Move 1 — Add details.** Where? Why? How? "The muddy dog ran across the wet grass toward the open gate." Now we can see it!

**Move 2 — Vary your openers.** If every sentence starts with "The," readers get sleepy. Try starting with a when, where, or how:

- "Suddenly, the dog ran."
- "Across the wet grass, the dog ran."
- "Barking wildly, the dog ran."

## Words That Connect

Transition words glue your ideas together: *first, next, because, however, finally*. They tell the reader how your thoughts fit — like road signs for your ideas.

## Try It

Take this flat sentence and run both moves on it: "The girl ate lunch." Make us see it!`,
          },
          {
            title: "Stretch a Sentence",
            description:
              "Assignment: take five flat sentences and stretch them into great ones.",
            contentType: "assignment",
            textContent: `## Your Mission

Stretch each of these flat sentences into a strong one. Use at least one detail AND one new opener per sentence.

1. The bird sang.
2. We played outside.
3. My brother cooked.
4. The rain fell.
5. She opened the box.

**Bonus:** Pick your best stretched sentence and stretch it one more time — can you make it even better without making it confusing?`,
          },
          {
            title: "Transition Words List",
            description: "Download a printable list of connective words for your writing.",
            contentType: "download",
            textContent: `Print this one-page list of transition words and keep it by your writing space.

When a paragraph feels choppy, pick one word from the list and watch your ideas snap together.`,
          },
        ],
      },
      {
        title: "Your Story, Your Voice",
        description: "Write openings that hook readers — and stories that keep them.",
        lessons: [
          {
            title: "Story Starters",
            description: "Video: four ways to open a story that grab the reader instantly.",
            contentType: "video",
            videoDurationSeconds: 420,
          },
          {
            title: "Write a Story Opening",
            description:
              "A guided AI lesson: craft a story opening with feedback from Story Explorer.",
            contentType: "gptLesson",
            gptConfig: gpt({
              topicArea: "writing engaging story openings",
              learningObjective:
                "Write a story opening paragraph that introduces a character, sets a scene, and hooks the reader.",
              tutorPersona: "reading",
              gradeBand: "5-7",
              prerequisites: ["Write a paragraph with complete sentences"],
              estimatedDurationMinutes: 25,
            }),
          },
          {
            title: "Finish the Story",
            description:
              "Assignment: take a story opening we give you and write what happens next.",
            contentType: "assignment",
            textContent: `## Your Mission

Here's your opening — the rest is up to you:

> The key under the flowerpot wasn't there. It had been there every day for three years. Mia stared at the empty spot of dirt and felt her heart speed up.

**Write 3–5 paragraphs** telling what happens next. Include:

- One strong sentence with a transition word (underline it!)
- One place where you show how a character feels instead of telling
- An ending that answers at least one question — or opens a bigger mystery`,
          },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // COURSE 5 — LIFE SKILLS
  // -------------------------------------------------------------------------
  {
    title: "Growth & Glow: Confidence & Kindness",
    shortDescription:
      "Understand your feelings, be a great friend, and solve problems like a pro. For grades 3–6.",
    description: `The most important skills aren't in any textbook.

In this course, Growth & Glow helps you understand your big feelings, practice being a kind friend, and learn a simple step-by-step way to solve everyday problems — at school, at home, and anywhere.

Best for learners in grades 3–6. Grown-ups love watching this one too.`,
    categorySlug: "life-skills",
    difficultyLevel: "beginner",
    estimatedDurationMinutes: 180,
    isFeatured: true,
    thumbnailUrl: IMG.friends,
    tags: ["life skills", "feelings", "friendship", "problem solving", "grades 3-6"],
    learningOutcomes: [
      "Name and describe your feelings",
      "Use calm-down strategies that really work",
      "Practice kindness and solve friendship problems",
      "Follow a 4-step plan for everyday problems",
    ],
    prerequisites: [],
    instructorName: COACH.lifeSkills.name,
    instructorBio: COACH.lifeSkills.bio,
    modules: [
      {
        title: "All About Feelings",
        description: "Name it to tame it — understand what you feel and why.",
        lessons: [
          {
            title: "How Your AI Coach Teaches",
            description:
              "Your first guided lesson — experience all six stages (Notice, Try, Challenge, Verify, Reflect, Transfer) while Growth & Glow shows you how learning works here.",
            contentType: "gptLesson",
            gptConfig: gpt({
              topicArea:
                "the six-stage guided-learning method — noticing a problem, trying on your own, taking on a challenge, verifying your work, reflecting, and transferring the idea to real life",
              learningObjective:
                "Name the six stages of a guided lesson and describe what the learner does at each stage.",
              tutorPersona: "lifeSkills",
              gradeBand: "3-6",
              prerequisites: [],
              estimatedDurationMinutes: 15,
            }),
          },
          {
            title: "Tell Me How You Learn",
            description:
              "A friendly chat with your coach — answer a few fun questions so every lesson can be shaped just for you.",
            contentType: "studentInterview",
            interviewConfig: interview("3-6"),
          },
          {
            title: "Name That Feeling",
            description: "Video: a tour of feelings — the big ones, the tricky ones, and why they matter.",
            contentType: "video",
            videoDurationSeconds: 360,
          },
          {
            title: "Big Feelings Are Okay",
            description: "Read why every feeling is allowed — and what to do with the tough ones.",
            contentType: "text",
            textContent: `## Feelings Are Messengers

Every feeling is a message. Anger says "something feels unfair." Worry says "something matters to me." Sadness says "I lost something important." Even the uncomfortable feelings are trying to help.

## Name It to Tame It

Scientists found something cool: when you name a feeling out loud — "I feel frustrated" — your brain starts to calm down. Naming the feeling is the first step to handling it.

## You Choose What Happens Next

Feelings are visitors. You can feel furious AND choose to take three slow breaths instead of yelling. The feeling isn't the problem — what we do with it is the skill.

## Try It

Name the last big feeling you had today. What message was it sending?`,
          },
          {
            title: "Calm-Down Strategies",
            description:
              "A guided AI lesson: build your personal calm-down toolkit with Growth & Glow.",
            contentType: "gptLesson",
            gptConfig: gpt({
              topicArea: "identifying feelings and choosing calm-down strategies",
              learningObjective:
                "Name common emotions and pick a calm-down strategy that fits a tricky situation.",
              tutorPersona: "lifeSkills",
              gradeBand: "3-6",
              prerequisites: [],
            }),
          },
          {
            title: "Feelings Journal",
            description:
              "Assignment: keep a 3-day feelings journal and spot your patterns.",
            contentType: "assignment",
            textContent: `## Your Mission

For the next 3 days, write down (or draw!) your feelings twice a day — once in the morning, once in the evening.

**For each entry, note:**

- The feeling's name (mad? excited? worried? proud?)
- What was happening when you felt it
- What you did with the feeling

**After 3 days, answer:** Do you notice any patterns? Which feeling visited you most? What helped you with the tough ones?`,
          },
        ],
      },
      {
        title: "Being a Good Friend",
        description: "Kindness, listening, and fixing friendship bumps.",
        lessons: [
          {
            title: "Kindness in Action",
            description: "Read what real friendship looks like — and feels like.",
            contentType: "text",
            textContent: `## Friendship Is a Verb

Kindness isn't just a nice idea — it's something you DO. Real friendship looks like:

- **Listening for real** — eyes up, phone down, actually hearing them
- **Including people** — noticing who's alone and making room
- **Saying the true thing kindly** — honest, not mean
- **Fixing it when you mess up** — "I'm sorry" plus doing better next time

## Everyone Has Bad Days

When a friend is grumpy or quiet, it usually isn't about you. Asking "Are you okay?" is a superpower most people forget they have.

## Try It

Think of one small kind thing you could do tomorrow — for a friend, a classmate, or someone at home. Bonus points if you actually do it!`,
          },
          {
            title: "Solve a Friendship Problem",
            description:
              "A guided AI lesson: practice handling tricky friend situations.",
            contentType: "gptLesson",
            gptConfig: gpt({
              topicArea: "resolving friendship conflicts with empathy",
              learningObjective:
                "Suggest kind, fair ways to handle a disagreement with a friend.",
              tutorPersona: "lifeSkills",
              gradeBand: "3-6",
              prerequisites: [],
            }),
          },
          {
            title: "What Would You Do?",
            description: "Quiz: pick the kindest, smartest move in real friend situations.",
            contentType: "quiz",
          },
        ],
      },
      {
        title: "Problem Solving Power",
        description: "A simple 4-step plan for any problem.",
        lessons: [
          {
            title: "The Problem-Solving Steps",
            description: "Video: the 4-step plan that works on almost any problem.",
            contentType: "video",
            videoDurationSeconds: 330,
          },
          {
            title: "Practice Problem Solving",
            description:
              "A guided AI lesson: use the 4-step plan on everyday problems.",
            contentType: "gptLesson",
            gptConfig: gpt({
              topicArea: "using a four-step problem-solving process",
              learningObjective:
                "Apply the steps — name it, brainstorm, choose, try it — to an everyday problem.",
              tutorPersona: "lifeSkills",
              gradeBand: "3-6",
              prerequisites: [],
            }),
          },
          {
            title: "Problem-Solving Steps Poster",
            description: "Download a printable poster of the 4 steps for your wall.",
            contentType: "download",
            textContent: `Print this poster and hang it where you do homework.

Next time a problem feels too big, walk through the four steps: Name it, Brainstorm, Choose, Try it. You've got this.`,
          },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // COURSE 6 — STUDY SKILLS
  // -------------------------------------------------------------------------
  {
    title: "Super Learner: Study Skills & Focus",
    shortDescription:
      "Train your focus, unlock memory tricks, and make a weekly plan that works. For grades 6–8.",
    description: `Smart isn't something you're born with — it's something you build.

In this course, Growth & Glow teaches you the habits real learners use: how to focus when everything is distracting, memory tricks that make facts stick, and how to plan your week so schoolwork stops running your life.

Best for learners in grades 6–8 who want to study smarter, not longer.`,
    categorySlug: "study-skills",
    difficultyLevel: "intermediate",
    estimatedDurationMinutes: 200,
    isFeatured: false,
    thumbnailUrl: IMG.happy,
    tags: ["study skills", "focus", "memory", "planning", "grades 6-8"],
    learningOutcomes: [
      "Build a personal focus routine that blocks distractions",
      "Use memory tricks like chunking and spaced practice",
      "Take notes you can actually study from",
      "Make a weekly plan and check what worked",
    ],
    prerequisites: [],
    instructorName: COACH.lifeSkills.name,
    instructorBio: COACH.lifeSkills.bio,
    modules: [
      {
        title: "Focus Power",
        description: "Train your attention like a muscle.",
        lessons: [
          {
            title: "How Your AI Coach Teaches",
            description:
              "Your first guided lesson — experience all six stages (Notice, Try, Challenge, Verify, Reflect, Transfer) while Growth & Glow shows you how learning works here.",
            contentType: "gptLesson",
            gptConfig: gpt({
              topicArea:
                "the six-stage guided-learning method — noticing a problem, trying on your own, taking on a challenge, verifying your work, reflecting, and transferring the idea to real life",
              learningObjective:
                "Name the six stages of a guided lesson and describe what the learner does at each stage.",
              tutorPersona: "lifeSkills",
              gradeBand: "6-8",
              prerequisites: [],
              estimatedDurationMinutes: 15,
            }),
          },
          {
            title: "Tell Me How You Learn",
            description:
              "A friendly chat with your coach — answer a few fun questions so every lesson can be shaped just for you.",
            contentType: "studentInterview",
            interviewConfig: interview("6-8"),
          },
          {
            title: "Train Your Focus",
            description: "Video: why your brain wanders — and how to bring it back.",
            contentType: "video",
            videoDurationSeconds: 400,
          },
          {
            title: "Beat the Distractions",
            description: "Read the simple setup that makes focusing way easier.",
            contentType: "text",
            textContent: `## Your Brain Loves Easy Wins

Your brain runs toward whatever is easiest and most fun — that's why the phone wins against homework every time. You can't win by willpower alone. You win by changing the setup.

## The Focus Setup

1. **One thing only.** Write down the ONE task before you start.
2. **Phone out of the room.** Not silenced — out. A visible phone drains focus even when it's off.
3. **25-minute sprints.** Work 25 minutes, break 5. Repeat. (This is called the Pomodoro method.)
4. **Name the distraction.** When your mind wanders, say "I'm thinking about snacks" — then come back. Noticing IS the exercise.

## Try It

Do one real 25-minute sprint today. What did you notice pulling your attention away?`,
          },
          {
            title: "Build a Focus Plan",
            description:
              "A guided AI lesson: design your personal focus routine with Growth & Glow.",
            contentType: "gptLesson",
            gptConfig: gpt({
              topicArea: "building focus and study routines",
              learningObjective:
                "Identify personal distractions and build a realistic focus routine for homework time.",
              tutorPersona: "lifeSkills",
              gradeBand: "6-8",
              prerequisites: [],
            }),
          },
          {
            title: "Focus Check-In",
            description: "Quiz: the focus setup, distraction traps, and sprint timing.",
            contentType: "quiz",
          },
        ],
      },
      {
        title: "Memory & Note Tricks",
        description: "Make facts stick — without cramming.",
        lessons: [
          {
            title: "Memory Champions",
            description: "Read the three tricks memory champions actually use.",
            contentType: "text",
            textContent: `## Trick 1: Chunking

Your brain holds about 4 things at once. So group things! A 10-digit phone number is hard — but three chunks (555-867-5309) is easy. Same trick works for vocabulary, dates, and steps in math.

## Trick 2: Spaced Practice

Cramming feels like it's working — then everything evaporates by Friday. Studying a little bit on Monday, Wednesday, and Friday beats 3 hours in one night. Your brain keeps what it practices over time.

## Trick 3: Teach It

Want to really learn something? Explain it to someone else — a parent, a pet, a stuffed animal. If you can teach it simply, you know it. If you get stuck, you just found what to study next.

## Try It

Pick something you have to memorize this week. Which of the three tricks will you use, and when?`,
          },
          {
            title: "Try a Memory Trick",
            description:
              "A guided AI lesson: practice chunking and teach-back on real material.",
            contentType: "gptLesson",
            gptConfig: gpt({
              topicArea: "memory strategies: chunking, spaced practice, and retrieval",
              learningObjective:
                "Apply at least one memory strategy to a real study task and explain why it works.",
              tutorPersona: "lifeSkills",
              gradeBand: "6-8",
              prerequisites: [],
            }),
          },
          {
            title: "Cornell Notes Template",
            description: "Download the note-taking template that makes review easy.",
            contentType: "download",
            textContent: `Print this Cornell notes template.

Notes go in the big column, key questions in the small column, summary at the bottom. Cover the big column and quiz yourself using your questions — that's a memory trick built right in.`,
          },
        ],
      },
      {
        title: "Plan & Achieve",
        description: "Make a week you can actually win.",
        lessons: [
          {
            title: "Goal Setting That Works",
            description: "Video: why 'do better' fails — and the goal formula that works.",
            contentType: "video",
            videoDurationSeconds: 360,
          },
          {
            title: "My Weekly Plan",
            description:
              "Assignment: build next week's plan with real tasks, times, and one goal.",
            contentType: "assignment",
            textContent: `## Your Mission

Make a plan for next week — a real one you'll try to follow.

**Include:**

- **One goal** for the week. Make it specific: "finish my science project draft" beats "work on science."
- **Your must-do tasks** — homework, chores, practice — with a day and rough time for each
- **One thing you're doing just for fun** — rest matters!
- **A check-in:** on Friday, write 2 sentences. What worked? What will you change next week?

**Tip:** If your plan looks impossible, it is. Shrink it until it fits — a small plan you follow beats a big plan you quit.`,
          },
          {
            title: "Reflect & Improve",
            description:
              "A guided AI lesson: look back at your week and make the next one better.",
            contentType: "gptLesson",
            gptConfig: gpt({
              topicArea: "reflecting on study habits and setting improvement goals",
              learningObjective:
                "Reflect on a week of studying, name what helped, and set one specific improvement goal.",
              tutorPersona: "lifeSkills",
              gradeBand: "6-8",
              prerequisites: [],
              estimatedDurationMinutes: 25,
            }),
          },
        ],
      },
    ],
  },
];

// ============================================================================
// WORKSHOPS
// ============================================================================

const workshops = [
  {
    title: "Meet Your AI Coach: Family Orientation",
    slug: "family-orientation",
    shortDescription: "Parents and learners meet the coaches, see how guided lessons work, and set up guardian consent together.",
    description: `A friendly live session for families new to CurioQuest.

We'll introduce Coach Maya, Story Explorer, and Growth & Glow; show you exactly how a guided lesson works (hint: coaches ask, kids think); walk through guardian consent and safety controls; and answer every question parents bring.

Bring your learner — they'll get to try a mini-lesson live.`,
    workshopType: "live",
    categorySlug: "life-skills",
    instructorName: "CurioQuest Team",
    scheduledStart: new Date("2025-08-02T15:00:00-04:00"),
    scheduledEnd: new Date("2025-08-02T16:00:00-04:00"),
    maxParticipants: 40,
    isFeatured: true,
  },
  {
    title: "Family Math Game Night",
    slug: "family-math-game-night",
    shortDescription: "Number bingo, estimation games, and math puzzles the whole family can play — no worksheets allowed.",
    description: `Math is more fun when it's a game.

Join Coach Maya and the CurioQuest team for a live family game night: estimation jars, math bingo, and "closest wins" number challenges. Every game builds real number sense — and nobody will even notice they're learning.

Best for kids in grades 3–6 and their grown-ups.`,
    workshopType: "live",
    categorySlug: "math-adventures",
    instructorName: COACH.math.name,
    scheduledStart: new Date("2025-08-09T18:00:00-04:00"),
    scheduledEnd: new Date("2025-08-09T19:00:00-04:00"),
    maxParticipants: 50,
    isFeatured: true,
  },
  {
    title: "Reading Circle Live: Story Detectives",
    slug: "reading-circle-story-detectives",
    shortDescription: "A live read-along where kids hunt for story clues — main ideas, character feelings, and sneaky inferences.",
    description: `Grab your detective hats.

Story Explorer reads a short adventure aloud while learners hunt for clues: What's the main idea? How does the character really feel? What is the story hiding between the lines? Kids share their theories live — every theory with a clue counts as a win.

Best for kids in grades 3–5.`,
    workshopType: "live",
    categorySlug: "reading-stories",
    instructorName: COACH.reading.name,
    scheduledStart: new Date("2025-08-16T16:00:00-04:00"),
    scheduledEnd: new Date("2025-08-16T17:00:00-04:00"),
    maxParticipants: 30,
    isFeatured: false,
  },
];

// ============================================================================
// BADGES
// ============================================================================

const badges = [
  { name: "First Steps", description: "Complete your very first lesson", iconEmoji: "👣", category: "milestone", requirement: "Complete 1 lesson", pointsAwarded: 10 },
  { name: "Math Star", description: "Finish a full math module", iconEmoji: "⭐", category: "course", requirement: "Complete all lessons in a math module", pointsAwarded: 50 },
  { name: "Bookworm", description: "Finish a full reading module", iconEmoji: "🐛", category: "course", requirement: "Complete all lessons in a reading module", pointsAwarded: 50 },
  { name: "Kindness Champion", description: "Complete the friendship module", iconEmoji: "💛", category: "course", requirement: "Complete the Being a Good Friend module", pointsAwarded: 50 },
  { name: "Focus Master", description: "Finish three 25-minute focus sprints", iconEmoji: "🎯", category: "habit", requirement: "Log 3 focus sessions", pointsAwarded: 30 },
  { name: "Quiz Crusher", description: "Score 100% on any lesson quiz", iconEmoji: "💯", category: "achievement", requirement: "Get a perfect score on a quiz", pointsAwarded: 40 },
  { name: "Week Warrior", description: "Learn something 7 days in a row", iconEmoji: "🔥", category: "habit", requirement: "Complete a lesson on 7 consecutive days", pointsAwarded: 75 },
  { name: "Course Champion", description: "Complete an entire course", iconEmoji: "🏆", category: "milestone", requirement: "Finish every lesson in one course", pointsAwarded: 150 },
];

// ============================================================================
// SUBSCRIPTION TIERS
// ============================================================================

const subscriptionTiers = [
  {
    name: "Little Explorer",
    slug: "little-explorer",
    description: "Try CurioQuest free — preview lessons in every course",
    priceMonthly: 0,
    priceAnnual: 0,
    features: [
      "Preview lessons in every course",
      "1 guided AI lesson per week",
      "Parent progress updates",
      "Family orientation workshop",
    ],
    isActive: true,
    sortOrder: 1,
  },
  {
    name: "Learner",
    slug: "learner",
    description: "Full course library for one learner, with all three AI coaches",
    priceMonthly: 999,
    priceAnnual: 9990,
    features: [
      "Everything in Little Explorer",
      "Unlimited guided AI lessons",
      "Full course library — math, reading, life skills",
      "Quizzes, badges, and streaks",
      "Weekly parent progress report",
    ],
    isActive: true,
    sortOrder: 2,
  },
  {
    name: "Family Plan",
    slug: "family-plan",
    description: "Up to 4 learner profiles — the whole family learns together",
    priceMonthly: 1999,
    priceAnnual: 19990,
    features: [
      "Everything in Learner",
      "Up to 4 learner profiles",
      "Priority workshop registration",
      "Live family workshops each month",
      "Family progress dashboard",
    ],
    isActive: true,
    sortOrder: 3,
  },
];

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function deleteCollection(name: string): Promise<number> {
  const snapshot = await db.collection(name).get();
  if (snapshot.empty) return 0;
  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  return snapshot.size;
}

async function main() {
  console.log("🌱 Starting CurioQuest Academy reseed...\n");

  // ------------------------------------------------------------------
  // Phase 1: wipe old catalog data
  // ------------------------------------------------------------------
  console.log("🧹 Clearing existing catalog data...");
  for (const name of WIPE_COLLECTIONS) {
    const count = await deleteCollection(name);
    if (count > 0) console.log(`   ✓ deleted ${count} docs from ${name}`);
  }

  // ------------------------------------------------------------------
  // Phase 2: categories
  // ------------------------------------------------------------------
  console.log("\n📂 Creating categories...");
  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const ref = db.collection(COLLECTIONS.CATEGORIES).doc();
    await ref.set({
      id: ref.id,
      ...cat,
      courseCount: 0,
      workshopCount: 0,
      createdAt: Timestamp.now(),
    });
    categoryMap[cat.slug] = ref.id;
    console.log(`   ✓ ${cat.name}`);
  }

  // ------------------------------------------------------------------
  // Phase 3: courses + modules + lessons
  // ------------------------------------------------------------------
  console.log("\n📚 Creating courses...");
  let totalLessons = 0;
  for (const course of courses) {
    const categoryId = categoryMap[course.categorySlug] ?? null;
    const courseRef = db.collection(COLLECTIONS.COURSES).doc();

    await courseRef.set({
      id: courseRef.id,
      title: course.title,
      slug: generateSlug(course.title),
      description: course.description,
      shortDescription: course.shortDescription,
      thumbnailUrl: course.thumbnailUrl,
      thumbnailImageId: null,
      previewVideoUrl: null,
      categoryId,
      instructorName: course.instructorName,
      instructorBio: course.instructorBio,
      instructorImageUrl: null,
      difficultyLevel: course.difficultyLevel,
      estimatedDurationMinutes: course.estimatedDurationMinutes,
      minSubscriptionTierId: null,
      isFeatured: course.isFeatured,
      isPublished: true,
      publishedAt: Timestamp.now(),
      tags: course.tags,
      learningOutcomes: course.learningOutcomes,
      prerequisites: course.prerequisites,
      enrollmentCount: 0,
      priceInCents: 0,
      compareAtPriceInCents: null,
      isFree: true,
      stripePriceId: null,
      stripeProductId: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    let lessonSortOrder = 0;
    let lessonCount = 0;
    for (let m = 0; m < course.modules.length; m++) {
      const mod = course.modules[m];
      const moduleRef = db.collection(COLLECTIONS.COURSE_MODULES).doc();
      await moduleRef.set({
        id: moduleRef.id,
        courseId: courseRef.id,
        title: mod.title,
        description: mod.description,
        sortOrder: m,
        createdAt: Timestamp.now(),
      });

      for (let l = 0; l < mod.lessons.length; l++) {
        const lesson = mod.lessons[l];
        const lessonRef = db.collection(COLLECTIONS.LESSONS).doc();
        await lessonRef.set({
          id: lessonRef.id,
          moduleId: moduleRef.id,
          courseId: courseRef.id,
          title: lesson.title,
          slug: generateSlug(lesson.title),
          description: lesson.description,
          contentType: lesson.contentType,
          videoUrl: null,
          videoDurationSeconds: lesson.videoDurationSeconds ?? null,
          textContent: lesson.textContent ?? null,
          downloadUrl: null,
          gptConfig: lesson.gptConfig ?? null,
          interviewConfig: lesson.interviewConfig ?? null,
          imageId: null,
          imageUrl: null,
          isPreview: m === 0 && l === 0,
          sortOrder: lessonSortOrder++,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        lessonCount++;
      }
    }
    totalLessons += lessonCount;
    console.log(`   ✓ ${course.title} (${course.modules.length} modules, ${lessonCount} lessons)`);
  }

  // ------------------------------------------------------------------
  // Phase 4: workshops
  // ------------------------------------------------------------------
  console.log("\n🎥 Creating workshops...");
  for (const workshop of workshops) {
    const categoryId = categoryMap[workshop.categorySlug] ?? null;
    const ref = db.collection(COLLECTIONS.WORKSHOPS).doc();
    await ref.set({
      id: ref.id,
      title: workshop.title,
      slug: workshop.slug,
      shortDescription: workshop.shortDescription,
      description: workshop.description,
      workshopType: workshop.workshopType,
      categoryId,
      instructorName: workshop.instructorName,
      scheduledStart: Timestamp.fromDate(workshop.scheduledStart),
      scheduledEnd: Timestamp.fromDate(workshop.scheduledEnd),
      timezone: "America/New_York",
      maxParticipants: workshop.maxParticipants,
      minSubscriptionTierId: null,
      meetingUrl: null,
      recordingUrl: null,
      materialsUrl: null,
      isFeatured: workshop.isFeatured,
      isPublished: true,
      registrationDeadline: null,
      registrationCount: 0,
      thumbnailUrl: null,
      thumbnailImageId: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log(`   ✓ ${workshop.title}`);
  }

  // ------------------------------------------------------------------
  // Phase 5: badges
  // ------------------------------------------------------------------
  console.log("\n🏅 Creating badges...");
  for (const badge of badges) {
    const ref = db.collection(COLLECTIONS.BADGES).doc();
    await ref.set({
      id: ref.id,
      ...badge,
      iconUrl: null,
      isActive: true,
      createdAt: Timestamp.now(),
    });
    console.log(`   ✓ ${badge.iconEmoji} ${badge.name}`);
  }

  // ------------------------------------------------------------------
  // Phase 6: subscription tiers
  // ------------------------------------------------------------------
  console.log("\n💳 Creating subscription tiers...");
  for (const tier of subscriptionTiers) {
    const ref = db.collection(COLLECTIONS.SUBSCRIPTION_TIERS).doc();
    await ref.set({
      id: ref.id,
      ...tier,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log(`   ✓ ${tier.name}`);
  }

  // ------------------------------------------------------------------
  // Phase 7: published family events (public /events page + registration)
  // ------------------------------------------------------------------
  console.log("\n📅 Creating events...");
  const nextDay = (dayOfWeek: number, hour: number): Date => {
    const d = new Date();
    const delta = (dayOfWeek - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + delta);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  const seedEvents = [
    {
      title: "Meet Your AI Coach: Family Orientation",
      slug: "meet-your-ai-coach-family-orientation",
      shortDescription:
        "A live walkthrough for parents and kids — see the six-stage learning method, meet the coaches, and ask questions.",
      category: "webinar" as const,
      start: nextDay(6, 10), // Saturday 10am
      hours: 1,
      locationType: "virtual" as const,
      location: "",
      maxAttendees: 40,
    },
    {
      title: "Family Math Game Night",
      slug: "family-math-game-night",
      shortDescription:
        "Play number games together and see how Coach Maya turns math practice into family fun.",
      category: "workshop" as const,
      start: nextDay(5, 18), // Friday 6pm — nextDay uses 24h: 18:30 below via hours offset
      hours: 1.5,
      locationType: "virtual" as const,
      location: "",
      maxAttendees: 25,
    },
    {
      title: "Parents' Q&A: AI-Guided Learning, Safety & Progress",
      slug: "parents-qa-ai-guided-learning",
      shortDescription:
        "Bring your questions about AI tutoring, child safety, guardian consent, and how progress is measured.",
      category: "webinar" as const,
      start: nextDay(3, 19), // Wednesday 7pm
      hours: 1,
      locationType: "virtual" as const,
      location: "",
      maxAttendees: 60,
    },
  ];

  // Wipe only the events this script seeds — leave admin-created events alone.
  const seedSlugs = seedEvents.map((e) => e.slug);
  const existingEvents = await db
    .collection("events")
    .where("slug", "in", seedSlugs)
    .get();
  for (const d of existingEvents.docs) {
    await d.ref.delete();
  }

  for (const ev of seedEvents) {
    const ref = db.collection("events").doc();
    const end = new Date(ev.start.getTime() + ev.hours * 60 * 60 * 1000);
    await ref.set({
      title: ev.title,
      slug: ev.slug,
      shortDescription: ev.shortDescription,
      description: ev.shortDescription,
      startDate: Timestamp.fromDate(ev.start),
      endDate: Timestamp.fromDate(end),
      timezone: "America/New_York",
      isAllDay: false,
      locationType: ev.locationType,
      location: ev.location,
      virtualLink: null,
      registrationUrl: null,
      registrationDeadline: null,
      maxAttendees: ev.maxAttendees,
      currentAttendees: 0,
      ticketTypes: [
        {
          id: "general",
          name: "Family Ticket",
          description: "Free admission for one family",
          price: 0,
          quantity: ev.maxAttendees,
          quantitySold: 0,
          maxPerOrder: 6,
          isActive: true,
          sortOrder: 0,
        },
      ],
      isFreeEvent: true,
      requiresPayment: false,
      hasCustomLandingPage: false,
      speakers: [],
      agenda: [],
      sponsors: [],
      faq: [],
      imageUrl: null,
      category: ev.category,
      tags: ["family", "free", "live"],
      status: "published",
      isFeatured: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log(`   ✓ ${ev.title}`);
  }

  console.log("\n✅ CurioQuest Academy reseed complete!");
  console.log(`   ${categories.length} categories`);
  console.log(`   ${courses.length} courses, ${courses.reduce((n, c) => n + c.modules.length, 0)} modules, ${totalLessons} lessons`);
  console.log(`   ${workshops.length} workshops, ${badges.length} badges, ${subscriptionTiers.length} tiers, ${seedEvents.length} events`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

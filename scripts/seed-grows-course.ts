/**
 * Seed Script: G.R.O.W.S. Framework Course
 * Run with: npx tsx scripts/seed-grows-course.ts
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, Timestamp } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "manpreethundal-svp",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const LMS_COLLECTIONS = {
  COURSES: "lms_courses",
  COURSE_MODULES: "lms_course_modules",
  LESSONS: "lms_lessons",
};

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function seedGrowsCourse() {
  console.log("🌱 Starting G.R.O.W.S. Course Seed...\n");

  // Create Course
  const courseRef = doc(collection(db, LMS_COLLECTIONS.COURSES));
  const courseData = {
    id: courseRef.id,
    title: "The G.R.O.W.S. Framework: Building a Legacy Business",
    slug: "grows-framework-legacy-business",
    description: "Master the proprietary G.R.O.W.S. framework that guides entrepreneurs to build sustainable wealth, develop high-performing teams, and create lasting legacies. This comprehensive course covers Goals & Strategic Planning, Results-Driven Leadership, Operational Excellence, Wealth Building, and Succession Planning.",
    shortDescription: "Master the G.R.O.W.S. framework to build sustainable wealth and create a lasting business legacy.",
    thumbnailUrl: null,
    thumbnailImageId: null,
    previewVideoUrl: null,
    categoryId: null,
    instructorName: "Manpreet Hundal",
    instructorBio: "Seasoned business strategist helping entrepreneurs build sustainable, legacy-focused businesses.",
    instructorImageUrl: null,
    difficultyLevel: "intermediate",
    estimatedDurationMinutes: 480,
    minSubscriptionTierId: null,
    isFeatured: true,
    isPublished: true,
    publishedAt: Timestamp.now(),
    tags: ["business strategy", "leadership", "legacy planning", "G.R.O.W.S."],
    learningOutcomes: [
      "Develop a clear, compelling vision for your business",
      "Create strategic roadmaps that connect daily decisions to long-term objectives",
      "Build and lead high-performing teams with confidence",
      "Implement operational systems that scale without sacrificing quality",
      "Prepare comprehensive succession plans for business continuity"
    ],
    prerequisites: ["Currently own or operate a business", "Commitment to implementing strategic changes"],
    enrollmentCount: 0,
    priceInCents: 49700,
    compareAtPriceInCents: 99700,
    isFree: false,
    stripePriceId: null,
    stripeProductId: null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await setDoc(courseRef, courseData);
  console.log(`✅ Created course: ${courseData.title}`);

  // Define modules and lessons
  const modules = [
    {
      title: "Introduction to G.R.O.W.S.",
      description: "Understand the foundation of the Legacy Growth System™",
      lessons: [
        { title: "Welcome to the G.R.O.W.S. Journey", type: "video", preview: true },
        { title: "The Legacy Mindset", type: "text", preview: true },
        { title: "Assessing Your Current State", type: "assignment", preview: false },
        { title: "Module 1 Quiz", type: "quiz", preview: false },
      ]
    },
    {
      title: "G - Goals & Strategic Planning",
      description: "Develop clarity, focus, and forward momentum with vision-aligned roadmaps",
      lessons: [
        { title: "Crafting Your Business Vision", type: "text", preview: false },
        { title: "Setting Measurable Goals with Accountability", type: "video", preview: false },
        { title: "Strategic Roadmapping", type: "text", preview: false },
        { title: "Quarterly Planning Sessions", type: "video", preview: false },
        { title: "Module 2 Quiz", type: "quiz", preview: false },
      ]
    },
    {
      title: "R - Results-Driven Leadership",
      description: "Transform your leadership skills to empower teams and inspire change",
      lessons: [
        { title: "Developing Executive Presence", type: "text", preview: false },
        { title: "Building High-Performing Teams", type: "video", preview: false },
        { title: "Navigating Conflict with Skill", type: "text", preview: false },
        { title: "Creating a Culture of Accountability", type: "text", preview: false },
        { title: "Module 3 Quiz", type: "quiz", preview: false },
      ]
    },
    {
      title: "O - Operational Excellence",
      description: "Streamline systems, reclaim time, and improve margins",
      lessons: [
        { title: "Identifying and Eliminating Bottlenecks", type: "text", preview: false },
        { title: "Building Systems That Run Without You", type: "video", preview: false },
        { title: "Efficiency Analysis and Cost Reduction", type: "text", preview: false },
        { title: "Scaling Without Breaking", type: "text", preview: false },
        { title: "Module 4 Quiz", type: "quiz", preview: false },
      ]
    },
    {
      title: "W - Wealth Building & Financial Mastery",
      description: "Build sustainable wealth through smart financial management",
      lessons: [
        { title: "Understanding Your Business Finances", type: "text", preview: false },
        { title: "Improving Profit Margins", type: "video", preview: false },
        { title: "Cash Flow Management", type: "text", preview: false },
        { title: "Module 5 Quiz", type: "quiz", preview: false },
      ]
    },
    {
      title: "S - Succession & Legacy Transition",
      description: "Plan for succession and build a business that endures",
      lessons: [
        { title: "Creating a Succession Plan", type: "text", preview: false },
        { title: "Understanding Business Valuation", type: "video", preview: false },
        { title: "Knowledge Transfer Systems", type: "text", preview: false },
        { title: "Exit Strategy Development", type: "text", preview: false },
        { title: "Module 6 Quiz", type: "quiz", preview: false },
      ]
    },
    {
      title: "Final Assessment & Certification",
      description: "Demonstrate your mastery of the G.R.O.W.S. framework",
      lessons: [
        { title: "Course Review & Key Takeaways", type: "text", preview: false },
        { title: "Final Exam: G.R.O.W.S. Certification", type: "quiz", preview: false },
        { title: "Your Legacy Action Plan", type: "assignment", preview: false },
      ]
    },
  ];

  // Create modules and lessons
  for (let mi = 0; mi < modules.length; mi++) {
    const mod = modules[mi];
    const moduleRef = doc(collection(db, LMS_COLLECTIONS.COURSE_MODULES));
    
    await setDoc(moduleRef, {
      id: moduleRef.id,
      courseId: courseRef.id,
      title: mod.title,
      description: mod.description,
      sortOrder: mi,
      createdAt: Timestamp.now(),
    });
    
    console.log(`  📁 Created module: ${mod.title}`);

    for (let li = 0; li < mod.lessons.length; li++) {
      const lesson = mod.lessons[li];
      const lessonRef = doc(collection(db, LMS_COLLECTIONS.LESSONS));
      
      await setDoc(lessonRef, {
        id: lessonRef.id,
        moduleId: moduleRef.id,
        courseId: courseRef.id,
        title: lesson.title,
        slug: generateSlug(lesson.title),
        description: null,
        contentType: lesson.type,
        videoUrl: null,
        videoDurationSeconds: lesson.type === "video" ? 900 : null,
        textContent: null,
        downloadUrl: null,
        imageId: null,
        imageUrl: null,
        isPreview: lesson.preview,
        sortOrder: li,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      console.log(`    📄 Created lesson: ${lesson.title}`);
    }
  }

  console.log("\n✅ G.R.O.W.S. Course seed completed!");
  console.log(`   Course ID: ${courseRef.id}`);
}

seedGrowsCourse().catch(console.error);

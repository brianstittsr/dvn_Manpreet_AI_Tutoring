/**
 * Firebase Academy Seed Script
 * Run with: npx ts-node scripts/seed-firebase-academy.ts
 * 
 * Seeds the Firestore database with initial AICenter4U Academy data
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

// Initialize Firebase Admin
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!serviceAccount) {
  console.error("Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable");
  process.exit(1);
}

const app = initializeApp({
  credential: cert(JSON.parse(serviceAccount)),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});

const db = getFirestore(app);

// ============================================================================
// SEED DATA
// ============================================================================

const subscriptionTiers = [
  {
    id: "legacy-starter",
    name: "Legacy Starter",
    slug: "legacy-starter",
    description: "Essential resources for business owners beginning their legacy journey",
    priceMonthly: 49,
    priceAnnual: 470,
    features: [
      "Access to Journal articles",
      "Monthly newsletter",
      "Community forum access",
      "1 free workshop per quarter",
    ],
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "legacy-builder",
    name: "Legacy Builder",
    slug: "legacy-builder",
    description: "Comprehensive tools and training for growing business leaders",
    priceMonthly: 149,
    priceAnnual: 1430,
    features: [
      "All Starter features",
      "Full course library access",
      "Weekly group coaching calls",
      "Pre/Post assessments",
      "Certificate programs",
      "Priority workshop registration",
    ],
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "legacy-master",
    name: "Legacy Master",
    slug: "legacy-master",
    description: "Premium access with personalized coaching and exclusive resources",
    priceMonthly: 349,
    priceAnnual: 3350,
    features: [
      "All Builder features",
      "Monthly 1-on-1 coaching session",
      "Custom learning paths",
      "Executive peer group access",
      "Annual strategy retreat invitation",
      "White-glove onboarding",
    ],
    isActive: true,
    sortOrder: 3,
  },
];

const courseCategories = [
  {
    id: "goals-vision",
    name: "Goals & Vision",
    slug: "goals-vision",
    description: "Strategic planning and vision development",
    icon: "Target",
    color: "amber",
    sortOrder: 1,
  },
  {
    id: "revenue-growth",
    name: "Revenue & Growth",
    slug: "revenue-growth",
    description: "Sales, marketing, and business development",
    icon: "TrendingUp",
    color: "green",
    sortOrder: 2,
  },
  {
    id: "operations",
    name: "Operations",
    slug: "operations",
    description: "Systems, processes, and efficiency",
    icon: "Settings",
    color: "blue",
    sortOrder: 3,
  },
  {
    id: "workforce-leadership",
    name: "Workforce & Leadership",
    slug: "workforce-leadership",
    description: "Team building and leadership development",
    icon: "Users",
    color: "purple",
    sortOrder: 4,
  },
  {
    id: "succession-legacy",
    name: "Succession & Legacy",
    slug: "succession-legacy",
    description: "Exit planning and legacy building",
    icon: "ArrowRightLeft",
    color: "orange",
    sortOrder: 5,
  },
];

const courses = [
  {
    id: "grows-framework-masterclass",
    title: "The G.R.O.W.S. Framework Masterclass",
    slug: "grows-framework-masterclass",
    description: "Master the complete AICenter4U methodology for building a business that thrives beyond you. This comprehensive course covers all five pillars of the G.R.O.W.S. framework with practical exercises and real-world case studies.",
    shortDescription: "Master the complete AICenter4U methodology for building a business that thrives beyond you.",
    categoryId: "goals-vision",
    instructorName: "Manpreet Hundal",
    instructorBio: "Founder & CEO of AICenter4U with over two decades of experience helping business leaders unlock their potential.",
    difficultyLevel: "intermediate",
    estimatedDurationMinutes: 480,
    minSubscriptionTierId: "legacy-builder",
    isFeatured: true,
    isPublished: true,
    tags: ["G.R.O.W.S.", "framework", "strategy", "leadership", "succession"],
    learningOutcomes: [
      "Understand and apply all five pillars of the G.R.O.W.S. framework",
      "Create a 10-year vision and 90-day action plan",
      "Build systems that run without your constant involvement",
      "Develop a succession-ready business",
    ],
    prerequisites: [],
  },
  {
    id: "succession-planning-essentials",
    title: "Succession Planning Essentials",
    slug: "succession-planning-essentials",
    description: "Create a comprehensive succession plan that protects your legacy and maximizes business value. Learn the key steps to prepare your business for transition.",
    shortDescription: "Create a comprehensive succession plan that protects your legacy and maximizes business value.",
    categoryId: "succession-legacy",
    instructorName: "Manpreet Hundal",
    difficultyLevel: "advanced",
    estimatedDurationMinutes: 240,
    minSubscriptionTierId: "legacy-builder",
    isFeatured: false,
    isPublished: true,
    tags: ["succession", "exit strategy", "valuation", "transition"],
    learningOutcomes: [
      "Assess your business's succession readiness",
      "Identify and develop potential successors",
      "Create a timeline for transition",
      "Understand business valuation fundamentals",
    ],
    prerequisites: [],
  },
  {
    id: "leadership-that-lasts",
    title: "Leadership That Lasts",
    slug: "leadership-that-lasts",
    description: "Develop leadership skills that empower your team and create lasting organizational culture. Transform from operator to true leader.",
    shortDescription: "Develop leadership skills that empower your team and create lasting organizational culture.",
    categoryId: "workforce-leadership",
    instructorName: "Manpreet Hundal",
    difficultyLevel: "intermediate",
    estimatedDurationMinutes: 360,
    minSubscriptionTierId: "legacy-builder",
    isFeatured: false,
    isPublished: true,
    tags: ["leadership", "team building", "culture", "delegation"],
    learningOutcomes: [
      "Develop your personal leadership philosophy",
      "Build a high-performing leadership team",
      "Create accountability structures",
      "Master the art of delegation",
    ],
    prerequisites: [],
  },
  {
    id: "operational-excellence-blueprint",
    title: "Operational Excellence Blueprint",
    slug: "operational-excellence-blueprint",
    description: "Build systems and processes that run without you—the key to true business freedom. Document, optimize, and scale your operations.",
    shortDescription: "Build systems and processes that run without you—the key to true business freedom.",
    categoryId: "operations",
    instructorName: "Manpreet Hundal",
    difficultyLevel: "beginner",
    estimatedDurationMinutes: 300,
    minSubscriptionTierId: "legacy-builder",
    isFeatured: false,
    isPublished: true,
    tags: ["operations", "systems", "processes", "efficiency"],
    learningOutcomes: [
      "Document your core business processes",
      "Identify and eliminate bottlenecks",
      "Implement quality control systems",
      "Create scalable operational frameworks",
    ],
    prerequisites: [],
  },
  {
    id: "revenue-growth-accelerator",
    title: "Revenue Growth Accelerator",
    slug: "revenue-growth-accelerator",
    description: "Proven strategies to increase revenue, improve margins, and scale your business sustainably without burning out.",
    shortDescription: "Proven strategies to increase revenue, improve margins, and scale your business sustainably.",
    categoryId: "revenue-growth",
    instructorName: "Manpreet Hundal",
    difficultyLevel: "intermediate",
    estimatedDurationMinutes: 360,
    minSubscriptionTierId: "legacy-builder",
    isFeatured: false,
    isPublished: true,
    tags: ["revenue", "growth", "sales", "marketing", "pricing"],
    learningOutcomes: [
      "Identify your most profitable revenue streams",
      "Develop a sustainable growth strategy",
      "Optimize pricing for maximum margin",
      "Build a predictable sales pipeline",
    ],
    prerequisites: [],
  },
];

const workshops = [
  {
    id: "90-day-action-plan",
    title: "Building Your 90-Day Action Plan",
    slug: "90-day-action-plan",
    description: "Learn how to break down your annual goals into quarterly rocks and weekly priorities that drive real results.",
    shortDescription: "Break down your annual goals into quarterly rocks and weekly priorities.",
    workshopType: "live",
    categoryId: "goals-vision",
    instructorName: "Manpreet Hundal",
    scheduledStart: Timestamp.fromDate(new Date("2025-01-15T14:00:00-05:00")),
    scheduledEnd: Timestamp.fromDate(new Date("2025-01-15T16:00:00-05:00")),
    timezone: "America/New_York",
    maxParticipants: 25,
    minSubscriptionTierId: "legacy-builder",
    isFeatured: true,
    isPublished: true,
  },
  {
    id: "exit-strategy-deep-dive",
    title: "Exit Strategy Deep Dive",
    slug: "exit-strategy-deep-dive",
    description: "A comprehensive workshop on preparing your business for sale, maximizing valuation, and ensuring a smooth transition.",
    shortDescription: "Prepare your business for sale and maximize valuation.",
    workshopType: "live",
    categoryId: "succession-legacy",
    instructorName: "Manpreet Hundal",
    scheduledStart: Timestamp.fromDate(new Date("2025-01-22T13:00:00-05:00")),
    scheduledEnd: Timestamp.fromDate(new Date("2025-01-22T15:30:00-05:00")),
    timezone: "America/New_York",
    maxParticipants: 20,
    minSubscriptionTierId: "legacy-builder",
    isFeatured: false,
    isPublished: true,
  },
  {
    id: "team-accountability-systems",
    title: "Team Accountability Systems",
    slug: "team-accountability-systems",
    description: "Implement proven accountability structures that keep your team aligned and performing at their best.",
    shortDescription: "Implement proven accountability structures for your team.",
    workshopType: "live",
    categoryId: "workforce-leadership",
    instructorName: "Manpreet Hundal",
    scheduledStart: Timestamp.fromDate(new Date("2025-01-29T15:00:00-05:00")),
    scheduledEnd: Timestamp.fromDate(new Date("2025-01-29T17:00:00-05:00")),
    timezone: "America/New_York",
    maxParticipants: 30,
    minSubscriptionTierId: "legacy-builder",
    isFeatured: false,
    isPublished: true,
  },
];

const blogCategories = [
  { id: "leadership", name: "Leadership", slug: "leadership", sortOrder: 1 },
  { id: "succession-planning", name: "Succession Planning", slug: "succession-planning", sortOrder: 2 },
  { id: "business-growth", name: "Business Growth", slug: "business-growth", sortOrder: 3 },
  { id: "operations", name: "Operations", slug: "operations", sortOrder: 4 },
  { id: "legacy-stories", name: "Legacy Stories", slug: "legacy-stories", sortOrder: 5 },
];

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function seedCollection(collectionName: string, data: any[]) {
  console.log(`Seeding ${collectionName}...`);
  const batch = db.batch();
  
  for (const item of data) {
    const { id, ...docData } = item;
    const ref = db.collection(collectionName).doc(id);
    batch.set(ref, {
      ...docData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }
  
  await batch.commit();
  console.log(`✓ Seeded ${data.length} documents to ${collectionName}`);
}

async function main() {
  console.log("🌱 Starting Firebase Academy seed...\n");
  
  try {
    await seedCollection("subscriptionTiers", subscriptionTiers);
    await seedCollection("courseCategories", courseCategories);
    await seedCollection("courses", courses);
    await seedCollection("workshops", workshops);
    await seedCollection("blogCategories", blogCategories);
    
    console.log("\n✅ Firebase Academy seed completed successfully!");
  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    process.exit(1);
  }
}

main();

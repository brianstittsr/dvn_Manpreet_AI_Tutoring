/**
 * Seed LMS Data Script
 * 
 * Populates the LMS with initial categories, courses, workshops, and badges
 * based on the CurioQuest G.R.O.W.S. framework content.
 * 
 * Run with: npx ts-node scripts/seed-lms-data.ts
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  Timestamp,
  getDocs,
} from "firebase/firestore";

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

// Collection names
const COLLECTIONS = {
  CATEGORIES: "lms_categories",
  COURSES: "lms_courses",
  COURSE_MODULES: "lms_course_modules",
  LESSONS: "lms_lessons",
  WORKSHOPS: "lms_workshops",
  BADGES: "lms_badges",
  SUBSCRIPTION_TIERS: "lms_subscription_tiers",
};

// Helper to generate slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Categories based on G.R.O.W.S. framework
const categories = [
  {
    name: "Goals & Vision",
    slug: "goals-vision",
    description: "Set clear goals and create a compelling vision for your business future",
    icon: "🎯",
    color: "#f59e0b",
    sortOrder: 1,
  },
  {
    name: "Revenue & Growth",
    slug: "revenue-growth",
    description: "Strategies to increase revenue, improve margins, and scale sustainably",
    icon: "📈",
    color: "#22c55e",
    sortOrder: 2,
  },
  {
    name: "Operations",
    slug: "operations",
    description: "Build systems and processes that run without you",
    icon: "⚙️",
    color: "#3b82f6",
    sortOrder: 3,
  },
  {
    name: "Workforce & Leadership",
    slug: "workforce-leadership",
    description: "Develop leadership skills and build high-performing teams",
    icon: "👥",
    color: "#8b5cf6",
    sortOrder: 4,
  },
  {
    name: "Succession & Legacy",
    slug: "succession-legacy",
    description: "Plan for the future and create a lasting legacy",
    icon: "🏆",
    color: "#f97316",
    sortOrder: 5,
  },
];

// Courses based on existing academy content
const courses = [
  {
    title: "The G.R.O.W.S. Framework Masterclass",
    shortDescription: "Master the complete CurioQuest methodology for building a business that thrives beyond you.",
    description: `This comprehensive masterclass takes you through the entire G.R.O.W.S. framework - the proven methodology used by CurioQuest to help business owners build companies that thrive beyond them.

You'll learn how to:
- Set clear, actionable goals aligned with your vision
- Create sustainable revenue growth strategies
- Build operational systems that run without you
- Develop and lead high-performing teams
- Plan for succession and create a lasting legacy

This course includes real-world case studies, practical exercises, and templates you can immediately apply to your business.`,
    categorySlug: "goals-vision",
    difficultyLevel: "intermediate",
    estimatedDurationMinutes: 480,
    isFeatured: true,
    tags: ["framework", "strategy", "leadership", "systems"],
    learningOutcomes: [
      "Understand and apply the complete G.R.O.W.S. framework",
      "Create a 10-year vision and break it into actionable quarterly goals",
      "Identify and fix operational bottlenecks in your business",
      "Build a leadership team that can run the business without you",
      "Develop a preliminary succession plan",
    ],
    prerequisites: ["Basic business ownership experience"],
    modules: [
      {
        title: "Introduction to G.R.O.W.S.",
        description: "Understanding the framework and its components",
        lessons: [
          { title: "Welcome & Course Overview", contentType: "video", duration: 10 },
          { title: "The CurioQuest Philosophy", contentType: "video", duration: 15 },
          { title: "G.R.O.W.S. Framework Overview", contentType: "video", duration: 20 },
          { title: "Self-Assessment: Where Are You Now?", contentType: "quiz", duration: 15 },
        ],
      },
      {
        title: "Goals & Vision",
        description: "Setting clear goals and creating a compelling vision",
        lessons: [
          { title: "The Power of Vision", contentType: "video", duration: 20 },
          { title: "Creating Your 10-Year Vision", contentType: "video", duration: 25 },
          { title: "Breaking Down to 3-Year Goals", contentType: "video", duration: 20 },
          { title: "Quarterly Rocks & Weekly Priorities", contentType: "video", duration: 25 },
          { title: "Vision Board Exercise", contentType: "assignment", duration: 30 },
        ],
      },
      {
        title: "Revenue & Growth",
        description: "Strategies for sustainable revenue growth",
        lessons: [
          { title: "Understanding Your Revenue Model", contentType: "video", duration: 20 },
          { title: "Pricing Strategies That Work", contentType: "video", duration: 25 },
          { title: "Sales Process Optimization", contentType: "video", duration: 30 },
          { title: "Customer Retention Strategies", contentType: "video", duration: 20 },
          { title: "Revenue Growth Action Plan", contentType: "assignment", duration: 30 },
        ],
      },
      {
        title: "Operations Excellence",
        description: "Building systems that run without you",
        lessons: [
          { title: "The Owner's Trap", contentType: "video", duration: 15 },
          { title: "Process Documentation Fundamentals", contentType: "video", duration: 25 },
          { title: "Creating Standard Operating Procedures", contentType: "video", duration: 30 },
          { title: "Automation & Technology", contentType: "video", duration: 20 },
          { title: "Document Your Top 5 Processes", contentType: "assignment", duration: 45 },
        ],
      },
      {
        title: "Workforce & Leadership",
        description: "Building and leading high-performing teams",
        lessons: [
          { title: "Leadership vs Management", contentType: "video", duration: 20 },
          { title: "Hiring A-Players", contentType: "video", duration: 25 },
          { title: "Building Accountability Systems", contentType: "video", duration: 25 },
          { title: "Developing Your Leadership Team", contentType: "video", duration: 30 },
          { title: "Team Assessment Exercise", contentType: "assignment", duration: 30 },
        ],
      },
      {
        title: "Succession & Legacy",
        description: "Planning for the future",
        lessons: [
          { title: "What is Succession Planning?", contentType: "video", duration: 20 },
          { title: "Exit Strategy Options", contentType: "video", duration: 25 },
          { title: "Business Valuation Basics", contentType: "video", duration: 25 },
          { title: "Creating Your Succession Timeline", contentType: "video", duration: 20 },
          { title: "Your Legacy Statement", contentType: "assignment", duration: 30 },
        ],
      },
    ],
  },
  {
    title: "Succession Planning Essentials",
    shortDescription: "Create a comprehensive succession plan that protects your legacy and maximizes business value.",
    description: `Every business owner will eventually exit their business - the question is whether it will be on your terms or someone else's. This course teaches you how to plan for a successful transition.

Learn the key elements of succession planning, from identifying potential successors to maximizing your business value before exit.`,
    categorySlug: "succession-legacy",
    difficultyLevel: "advanced",
    estimatedDurationMinutes: 240,
    isFeatured: false,
    tags: ["succession", "exit strategy", "valuation", "legacy"],
    learningOutcomes: [
      "Understand the different types of business exits",
      "Identify and develop potential successors",
      "Maximize your business value before exit",
      "Create a comprehensive succession timeline",
      "Protect your legacy through proper planning",
    ],
    prerequisites: ["5+ years of business ownership", "Basic financial literacy"],
    modules: [
      {
        title: "Succession Planning Fundamentals",
        description: "Understanding why and when to plan",
        lessons: [
          { title: "Why Succession Planning Matters", contentType: "video", duration: 15 },
          { title: "The Cost of Not Planning", contentType: "video", duration: 20 },
          { title: "When to Start Planning", contentType: "video", duration: 15 },
        ],
      },
      {
        title: "Exit Strategy Options",
        description: "Exploring your options",
        lessons: [
          { title: "Selling to a Third Party", contentType: "video", duration: 25 },
          { title: "Family Succession", contentType: "video", duration: 25 },
          { title: "Management Buyout", contentType: "video", duration: 20 },
          { title: "ESOP & Other Options", contentType: "video", duration: 20 },
        ],
      },
      {
        title: "Maximizing Business Value",
        description: "Preparing your business for transition",
        lessons: [
          { title: "Business Valuation Methods", contentType: "video", duration: 30 },
          { title: "Value Drivers & Detractors", contentType: "video", duration: 25 },
          { title: "Financial Clean-Up", contentType: "video", duration: 20 },
          { title: "Reducing Owner Dependency", contentType: "video", duration: 25 },
        ],
      },
    ],
  },
  {
    title: "Leadership That Lasts",
    shortDescription: "Develop leadership skills that empower your team and create lasting organizational culture.",
    description: `Great leaders aren't born - they're developed. This course teaches you the leadership skills needed to build a team that can run your business without your constant involvement.

From communication to delegation, from culture-building to conflict resolution, you'll learn practical leadership techniques you can apply immediately.`,
    categorySlug: "workforce-leadership",
    difficultyLevel: "intermediate",
    estimatedDurationMinutes: 360,
    isFeatured: true,
    tags: ["leadership", "team building", "culture", "management"],
    learningOutcomes: [
      "Develop your personal leadership style",
      "Build a culture of accountability",
      "Master the art of delegation",
      "Handle difficult conversations effectively",
      "Create systems for developing future leaders",
    ],
    prerequisites: ["Currently managing at least one employee"],
    modules: [
      {
        title: "Leadership Foundations",
        description: "Understanding what makes a great leader",
        lessons: [
          { title: "Leadership vs Management", contentType: "video", duration: 20 },
          { title: "Your Leadership Style", contentType: "video", duration: 25 },
          { title: "Leadership Assessment", contentType: "quiz", duration: 20 },
        ],
      },
      {
        title: "Building Your Team",
        description: "Hiring and developing A-players",
        lessons: [
          { title: "Defining Your Ideal Team", contentType: "video", duration: 20 },
          { title: "The Hiring Process", contentType: "video", duration: 30 },
          { title: "Onboarding for Success", contentType: "video", duration: 25 },
          { title: "Performance Management", contentType: "video", duration: 25 },
        ],
      },
      {
        title: "Creating Culture",
        description: "Building a winning organizational culture",
        lessons: [
          { title: "What is Culture?", contentType: "video", duration: 15 },
          { title: "Defining Your Core Values", contentType: "video", duration: 25 },
          { title: "Living Your Values Daily", contentType: "video", duration: 20 },
          { title: "Culture Assessment", contentType: "assignment", duration: 30 },
        ],
      },
    ],
  },
  {
    title: "Operational Excellence Blueprint",
    shortDescription: "Build systems and processes that run without you—the key to true business freedom.",
    description: `Are you the bottleneck in your own business? This course teaches you how to document, systematize, and automate your operations so your business can run without your constant involvement.

Learn the exact process for creating SOPs, implementing accountability systems, and leveraging technology to free up your time.`,
    categorySlug: "operations",
    difficultyLevel: "beginner",
    estimatedDurationMinutes: 300,
    isFeatured: false,
    tags: ["operations", "systems", "processes", "automation", "SOPs"],
    learningOutcomes: [
      "Identify operational bottlenecks in your business",
      "Create effective standard operating procedures",
      "Implement accountability systems",
      "Leverage technology for automation",
      "Build a self-managing organization",
    ],
    prerequisites: [],
    modules: [
      {
        title: "The Systems Mindset",
        description: "Thinking in systems",
        lessons: [
          { title: "Why Systems Matter", contentType: "video", duration: 15 },
          { title: "The E-Myth Revisited", contentType: "video", duration: 20 },
          { title: "Identifying Your Core Processes", contentType: "video", duration: 25 },
        ],
      },
      {
        title: "Process Documentation",
        description: "Creating effective SOPs",
        lessons: [
          { title: "SOP Fundamentals", contentType: "video", duration: 20 },
          { title: "The Documentation Process", contentType: "video", duration: 30 },
          { title: "Tools & Templates", contentType: "video", duration: 20 },
          { title: "Document Your First Process", contentType: "assignment", duration: 45 },
        ],
      },
      {
        title: "Implementation & Improvement",
        description: "Making systems stick",
        lessons: [
          { title: "Training Your Team", contentType: "video", duration: 25 },
          { title: "Measuring & Improving", contentType: "video", duration: 20 },
          { title: "Continuous Improvement Culture", contentType: "video", duration: 20 },
        ],
      },
    ],
  },
  {
    title: "Revenue Growth Accelerator",
    shortDescription: "Proven strategies to increase revenue, improve margins, and scale your business sustainably.",
    description: `Revenue is the lifeblood of any business. This course teaches you proven strategies to increase your top line while maintaining healthy margins.

From pricing optimization to sales process improvement, from customer retention to new market expansion, you'll learn actionable strategies to accelerate your revenue growth.`,
    categorySlug: "revenue-growth",
    difficultyLevel: "intermediate",
    estimatedDurationMinutes: 360,
    isFeatured: false,
    tags: ["revenue", "sales", "pricing", "growth", "margins"],
    learningOutcomes: [
      "Analyze and optimize your pricing strategy",
      "Build a repeatable sales process",
      "Increase customer lifetime value",
      "Identify new revenue opportunities",
      "Create a revenue growth action plan",
    ],
    prerequisites: ["Existing revenue stream", "Basic financial understanding"],
    modules: [
      {
        title: "Revenue Fundamentals",
        description: "Understanding your revenue model",
        lessons: [
          { title: "Revenue Model Analysis", contentType: "video", duration: 25 },
          { title: "Key Revenue Metrics", contentType: "video", duration: 20 },
          { title: "Revenue Assessment", contentType: "quiz", duration: 15 },
        ],
      },
      {
        title: "Pricing Strategy",
        description: "Optimizing your pricing",
        lessons: [
          { title: "Pricing Psychology", contentType: "video", duration: 25 },
          { title: "Value-Based Pricing", contentType: "video", duration: 30 },
          { title: "Pricing Experiments", contentType: "video", duration: 20 },
        ],
      },
      {
        title: "Sales Excellence",
        description: "Building a winning sales process",
        lessons: [
          { title: "Sales Process Mapping", contentType: "video", duration: 25 },
          { title: "Lead Generation Strategies", contentType: "video", duration: 30 },
          { title: "Closing Techniques", contentType: "video", duration: 25 },
          { title: "Sales Team Development", contentType: "video", duration: 25 },
        ],
      },
    ],
  },
  {
    title: "Vision to Execution",
    shortDescription: "Transform your 10-year vision into quarterly rocks and weekly priorities that drive results.",
    description: `Having a vision is great, but execution is everything. This course teaches you how to break down your long-term vision into actionable quarterly goals and weekly priorities.

Learn the exact planning process used by successful business owners to turn big dreams into daily actions.`,
    categorySlug: "goals-vision",
    difficultyLevel: "beginner",
    estimatedDurationMinutes: 180,
    isFeatured: false,
    tags: ["vision", "goals", "planning", "execution", "priorities"],
    learningOutcomes: [
      "Create a compelling 10-year vision",
      "Break down vision into 3-year goals",
      "Set effective quarterly rocks",
      "Prioritize weekly tasks for maximum impact",
      "Build accountability for execution",
    ],
    prerequisites: [],
    modules: [
      {
        title: "Vision Creation",
        description: "Defining where you want to go",
        lessons: [
          { title: "The Power of Vision", contentType: "video", duration: 20 },
          { title: "10-Year Visioning Exercise", contentType: "video", duration: 30 },
          { title: "Vision Statement Workshop", contentType: "assignment", duration: 30 },
        ],
      },
      {
        title: "Goal Setting",
        description: "Breaking down the vision",
        lessons: [
          { title: "3-Year Goals", contentType: "video", duration: 20 },
          { title: "Annual Planning", contentType: "video", duration: 25 },
          { title: "Quarterly Rocks", contentType: "video", duration: 25 },
        ],
      },
      {
        title: "Weekly Execution",
        description: "Making it happen",
        lessons: [
          { title: "Weekly Planning Process", contentType: "video", duration: 20 },
          { title: "Priority Management", contentType: "video", duration: 20 },
          { title: "Accountability Systems", contentType: "video", duration: 20 },
        ],
      },
    ],
  },
];

// Workshops
const workshops = [
  {
    title: "Building Your 90-Day Action Plan",
    shortDescription: "Learn how to break down your annual goals into quarterly rocks and weekly priorities.",
    description: "A hands-on workshop where you'll create your own 90-day action plan with guidance from Manpreet Hundal.",
    workshopType: "live",
    categorySlug: "goals-vision",
    instructorName: "Manpreet Hundal",
    scheduledStart: new Date("2025-01-15T14:00:00-05:00"),
    scheduledEnd: new Date("2025-01-15T16:00:00-05:00"),
    maxParticipants: 25,
    isFeatured: true,
  },
  {
    title: "Exit Strategy Deep Dive",
    shortDescription: "A comprehensive workshop on preparing your business for sale.",
    description: "Learn the key steps to maximize your business value and prepare for a successful exit.",
    workshopType: "live",
    categorySlug: "succession-legacy",
    instructorName: "Manpreet Hundal",
    scheduledStart: new Date("2025-01-22T13:00:00-05:00"),
    scheduledEnd: new Date("2025-01-22T15:30:00-05:00"),
    maxParticipants: 20,
    isFeatured: false,
  },
  {
    title: "Team Accountability Systems",
    shortDescription: "Implement proven accountability structures for your team.",
    description: "Learn how to create and implement accountability systems that keep your team aligned and performing.",
    workshopType: "live",
    categorySlug: "workforce-leadership",
    instructorName: "Manpreet Hundal",
    scheduledStart: new Date("2025-01-29T15:00:00-05:00"),
    scheduledEnd: new Date("2025-01-29T17:00:00-05:00"),
    maxParticipants: 30,
    isFeatured: false,
  },
  {
    title: "Financial Dashboard Mastery",
    shortDescription: "Build and use financial dashboards for real-time visibility.",
    description: "Create custom financial dashboards that give you instant insight into your business performance.",
    workshopType: "live",
    categorySlug: "operations",
    instructorName: "Manpreet Hundal",
    scheduledStart: new Date("2025-02-05T14:00:00-05:00"),
    scheduledEnd: new Date("2025-02-05T16:00:00-05:00"),
    maxParticipants: 25,
    isFeatured: false,
  },
  {
    title: "Sales Process Optimization",
    shortDescription: "Streamline your sales process to close more deals faster.",
    description: "Analyze and optimize your sales process for better conversion rates and shorter sales cycles.",
    workshopType: "live",
    categorySlug: "revenue-growth",
    instructorName: "Manpreet Hundal",
    scheduledStart: new Date("2025-02-12T13:00:00-05:00"),
    scheduledEnd: new Date("2025-02-12T15:00:00-05:00"),
    maxParticipants: 25,
    isFeatured: false,
  },
];

// Badges for gamification
const badges = [
  {
    name: "First Steps",
    description: "Complete your first lesson",
    iconEmoji: "🎯",
    category: "achievement",
    requirement: "Complete 1 lesson",
    pointsAwarded: 10,
  },
  {
    name: "Course Completer",
    description: "Complete your first course",
    iconEmoji: "🏆",
    category: "achievement",
    requirement: "Complete 1 course",
    pointsAwarded: 100,
  },
  {
    name: "Bookworm",
    description: "Complete 5 courses",
    iconEmoji: "📚",
    category: "milestone",
    requirement: "Complete 5 courses",
    pointsAwarded: 500,
  },
  {
    name: "7-Day Streak",
    description: "Learn for 7 days in a row",
    iconEmoji: "🔥",
    category: "streak",
    requirement: "7 consecutive days of learning",
    pointsAwarded: 50,
  },
  {
    name: "30-Day Streak",
    description: "Learn for 30 days in a row",
    iconEmoji: "⚡",
    category: "streak",
    requirement: "30 consecutive days of learning",
    pointsAwarded: 200,
  },
  {
    name: "Workshop Warrior",
    description: "Attend 5 live workshops",
    iconEmoji: "🎓",
    category: "milestone",
    requirement: "Attend 5 workshops",
    pointsAwarded: 250,
  },
  {
    name: "Certificate Collector",
    description: "Earn 3 certificates",
    iconEmoji: "🏅",
    category: "milestone",
    requirement: "Earn 3 certificates",
    pointsAwarded: 300,
  },
  {
    name: "G.R.O.W.S. Master",
    description: "Complete all G.R.O.W.S. framework courses",
    iconEmoji: "👑",
    category: "special",
    requirement: "Complete all 5 category courses",
    pointsAwarded: 1000,
  },
  {
    name: "Early Adopter",
    description: "One of the first 100 academy members",
    iconEmoji: "🌟",
    category: "special",
    requirement: "Join within first 100 members",
    pointsAwarded: 100,
  },
  {
    name: "Top Learner",
    description: "Reach the monthly leaderboard top 10",
    iconEmoji: "🥇",
    category: "achievement",
    requirement: "Top 10 monthly points",
    pointsAwarded: 150,
  },
];

// Subscription tiers
const subscriptionTiers = [
  {
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
    sortOrder: 1,
  },
  {
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
    sortOrder: 2,
  },
  {
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
    sortOrder: 3,
  },
];

async function seedData() {
  console.log("🌱 Starting LMS data seeding...\n");

  try {
    // Check if data already exists
    const existingCategories = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
    if (!existingCategories.empty) {
      console.log("⚠️  Data already exists. Skipping seed to prevent duplicates.");
      console.log("   Delete existing data first if you want to re-seed.");
      process.exit(0);
    }

    // Seed categories
    console.log("📁 Creating categories...");
    const categoryMap: Record<string, string> = {};
    for (const cat of categories) {
      const docRef = doc(collection(db, COLLECTIONS.CATEGORIES));
      await setDoc(docRef, {
        id: docRef.id,
        ...cat,
        courseCount: 0,
        workshopCount: 0,
        createdAt: Timestamp.now(),
      });
      categoryMap[cat.slug] = docRef.id;
      console.log(`   ✓ ${cat.name}`);
    }

    // Seed courses with modules and lessons
    console.log("\n📚 Creating courses...");
    for (const course of courses) {
      const categoryId = categoryMap[course.categorySlug] || null;
      const courseRef = doc(collection(db, COLLECTIONS.COURSES));
      
      await setDoc(courseRef, {
        id: courseRef.id,
        title: course.title,
        slug: generateSlug(course.title),
        shortDescription: course.shortDescription,
        description: course.description,
        categoryId,
        instructorName: "Manpreet Hundal",
        instructorBio: "Founder of CurioQuest with 20+ years of experience helping business owners build lasting legacies.",
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
        enrollmentCount: Math.floor(Math.random() * 150) + 50, // Random enrollment count
        thumbnailUrl: null,
        thumbnailImageId: null,
        previewVideoUrl: null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Update category course count
      if (categoryId) {
        const catRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);
        const catSnap = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
        // Note: In production, use increment()
      }

      // Create modules and lessons
      let lessonSortOrder = 0;
      for (let moduleIndex = 0; moduleIndex < course.modules.length; moduleIndex++) {
        const module = course.modules[moduleIndex];
        const moduleRef = doc(collection(db, COLLECTIONS.COURSE_MODULES));
        
        await setDoc(moduleRef, {
          id: moduleRef.id,
          courseId: courseRef.id,
          title: module.title,
          description: module.description,
          sortOrder: moduleIndex,
          createdAt: Timestamp.now(),
        });

        // Create lessons
        for (let lessonIndex = 0; lessonIndex < module.lessons.length; lessonIndex++) {
          const lesson = module.lessons[lessonIndex];
          const lessonRef = doc(collection(db, COLLECTIONS.LESSONS));
          
          await setDoc(lessonRef, {
            id: lessonRef.id,
            moduleId: moduleRef.id,
            courseId: courseRef.id,
            title: lesson.title,
            slug: generateSlug(lesson.title),
            description: null,
            contentType: lesson.contentType,
            videoUrl: null,
            videoDurationSeconds: lesson.duration * 60,
            textContent: null,
            downloadUrl: null,
            isPreview: lessonIndex === 0 && moduleIndex === 0, // First lesson is preview
            sortOrder: lessonSortOrder++,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
        }
      }

      console.log(`   ✓ ${course.title} (${course.modules.length} modules)`);
    }

    // Seed workshops
    console.log("\n🎥 Creating workshops...");
    for (const workshop of workshops) {
      const categoryId = categoryMap[workshop.categorySlug] || null;
      const workshopRef = doc(collection(db, COLLECTIONS.WORKSHOPS));
      
      await setDoc(workshopRef, {
        id: workshopRef.id,
        title: workshop.title,
        slug: generateSlug(workshop.title),
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
        registrationCount: Math.floor(Math.random() * 15) + 5,
        thumbnailUrl: null,
        thumbnailImageId: null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      console.log(`   ✓ ${workshop.title}`);
    }

    // Seed badges
    console.log("\n🏅 Creating badges...");
    for (const badge of badges) {
      const badgeRef = doc(collection(db, COLLECTIONS.BADGES));
      
      await setDoc(badgeRef, {
        id: badgeRef.id,
        name: badge.name,
        description: badge.description,
        iconUrl: null,
        iconEmoji: badge.iconEmoji,
        category: badge.category,
        requirement: badge.requirement,
        pointsAwarded: badge.pointsAwarded,
        isActive: true,
        createdAt: Timestamp.now(),
      });

      console.log(`   ✓ ${badge.iconEmoji} ${badge.name}`);
    }

    // Seed subscription tiers
    console.log("\n💳 Creating subscription tiers...");
    for (const tier of subscriptionTiers) {
      const tierRef = doc(collection(db, COLLECTIONS.SUBSCRIPTION_TIERS));
      
      await setDoc(tierRef, {
        id: tierRef.id,
        name: tier.name,
        slug: tier.slug,
        description: tier.description,
        priceMonthly: tier.priceMonthly,
        priceAnnual: tier.priceAnnual,
        features: tier.features,
        isActive: true,
        sortOrder: tier.sortOrder,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      console.log(`   ✓ ${tier.name} ($${tier.priceMonthly}/mo)`);
    }

    console.log("\n✅ LMS data seeding complete!");
    console.log("\nSummary:");
    console.log(`   - ${categories.length} categories`);
    console.log(`   - ${courses.length} courses`);
    console.log(`   - ${workshops.length} workshops`);
    console.log(`   - ${badges.length} badges`);
    console.log(`   - ${subscriptionTiers.length} subscription tiers`);

  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }

  process.exit(0);
}

seedData();

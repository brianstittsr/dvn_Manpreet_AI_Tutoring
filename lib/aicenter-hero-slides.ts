import { HeroSlide } from "@/components/marketing/hero-carousel";

/**
 * AICenter4U - Hero Carousel Slides
 *
 * Marketing copy for the AICenter4U AI-guided tutoring platform.
 * Written at a ~6th grade reading level: short sentences, common words.
 * Background photos: kids learning (Unsplash, verified public URLs).
 */
export const aicenterHeroSlides: HeroSlide[] = [
  {
    id: "aicenter-1",
    badge: "Welcome to AICenter4U",
    headline: "A Coach That Helps Kids",
    highlightedText: "Really Understand",
    subheadline: "Our AI coaches ask questions, give hints, and cheer kids on. Your child learns to think and solve problems on their own.",
    benefits: ["3 Friendly Coaches", "Learn at Your Own Pace", "Parents Stay in the Loop"],
    primaryCta: { text: "Start Learning", href: "/academy" },
    secondaryCta: { text: "See How It Works", href: "/about" },
    isPublished: true,
    order: 1,
    backgroundImage: {
      imageId: "unsplash-kids-learning",
      url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1920&q=80&auto=format&fit=crop",
      name: "Kids learning together in class"
    }
  },
  {
    id: "aicenter-2",
    badge: "Meet Coach Maya",
    headline: "Math Makes Sense",
    highlightedText: "Step by Step",
    subheadline: "Coach Maya helps kids figure out math problems on their own. She asks one question at a time and never just gives away the answer.",
    benefits: ["One Question at a Time", "Hints, Not Answers", "Builds Real Confidence"],
    primaryCta: { text: "Try Math Coaching", href: "/academy" },
    secondaryCta: { text: "Meet All Coaches", href: "/about" },
    isPublished: true,
    order: 2,
    backgroundImage: {
      imageId: "unsplash-kid-writing",
      url: "https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=1920&q=80&auto=format&fit=crop",
      name: "Child writing and solving problems"
    }
  },
  {
    id: "aicenter-3",
    badge: "Meet Story Explorer",
    headline: "Reading Becomes",
    highlightedText: "an Adventure",
    subheadline: "Story Explorer turns every story into a fun journey. Kids learn to spot clues, explain their ideas, and love reading.",
    benefits: ["Fun Story Questions", "Evidence Detective Skills", "Any Reading Level"],
    primaryCta: { text: "Start Reading", href: "/academy" },
    secondaryCta: { text: "Learn More", href: "/about" },
    isPublished: true,
    order: 3,
    backgroundImage: {
      imageId: "unsplash-kid-reading",
      url: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=1920&q=80&auto=format&fit=crop",
      name: "Child enjoying a book"
    }
  },
  {
    id: "aicenter-4",
    badge: "Meet Growth & Glow",
    headline: "Real-Life Skills,",
    highlightedText: "Learned by Doing",
    subheadline: "Growth & Glow sets fun monthly challenges. Kids practice skills like planning, saving, and helping others - then show what they can do.",
    benefits: ["Monthly Skill Quests", "Practice in Real Life", "Grow More Independent"],
    primaryCta: { text: "Explore Life Skills", href: "/academy" },
    secondaryCta: { text: "How It Works", href: "/about" },
    isPublished: true,
    order: 4,
    backgroundImage: {
      imageId: "unsplash-kid-tablet",
      url: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1920&q=80&auto=format&fit=crop",
      name: "Child learning on a tablet"
    }
  },
  {
    id: "aicenter-5",
    badge: "For Parents & Guardians",
    headline: "You See Every",
    highlightedText: "Step They Take",
    subheadline: "Get simple progress updates you can read in a minute. See what your child tried, what clicked, and what comes next.",
    benefits: ["Quick Progress Updates", "Guardian Approval First", "Safe for Kids"],
    primaryCta: { text: "Get Started", href: "/sign-up" },
    secondaryCta: { text: "Talk to Us", href: "/contact" },
    isPublished: true,
    order: 5,
    backgroundImage: {
      imageId: "unsplash-parent-child",
      url: "https://images.unsplash.com/photo-1555009393-f20bdb245c4d?w=1920&q=80&auto=format&fit=crop",
      name: "Parent helping child learn"
    }
  },
];

/**
 * AICenter4U Trust Indicators
 * Display these in the hero section footer
 */
export const aicenterTrustIndicators = [
  { title: "3 AI Coaches", subtitle: "Math, Reading, Life Skills" },
  { title: "6 Steps", subtitle: "Guided Learning Cycle" },
  { title: "Hints", subtitle: "Not Just Answers" },
  { title: "Guardian", subtitle: "Approved & Informed" },
  { title: "Anywhere", subtitle: "Phone, Tablet, Computer" },
];

/**
 * AICenter4U Core Values
 * For use in about section and other marketing materials
 */
export const aicenterCoreValues = [
  {
    name: "Learn",
    description: "We teach kids to understand, not just to finish.",
  },
  {
    name: "Believe",
    description: "Confidence grows when kids see their own progress.",
  },
  {
    name: "Grow",
    description: "Every lesson helps kids become more independent.",
  },
  {
    name: "Safe",
    description: "Kid-first design with parents always in control.",
  },
];

/**
 * AICenter4U Coaches
 * The three AI learning coaches
 */
export const aicenterCoaches = [
  {
    id: "math",
    title: "Coach Maya",
    tagline: "Math Coach",
    description: "Helps kids work through math one question at a time - with hints and encouragement, never just the answer.",
    features: [
      "Guided problem solving",
      "Catches gaps early",
      "Explains the 'why'",
      "Ages 8 and up",
    ],
  },
  {
    id: "reading",
    title: "Story Explorer",
    tagline: "Reading Coach",
    description: "Turns stories into adventures. Kids learn to find clues in the text and explain their ideas clearly.",
    features: [
      "Fun story questions",
      "Builds vocabulary",
      "Teaches text evidence",
      "Any reading level",
    ],
  },
  {
    id: "lifeskills",
    title: "Growth & Glow",
    tagline: "Life Skills Coach",
    description: "Sets a fun skill challenge each month. Kids plan, practice, and show what they can do in real life.",
    features: [
      "Monthly skill quests",
      "Real-world practice",
      "Builds independence",
      "Family friendly",
    ],
  },
];

/**
 * AICenter4U FAQ Items
 */
export const aicenterFAQs = [
  {
    question: "Is AICenter4U safe for my child?",
    answer: "Yes. Kids learn inside a protected space. Parents approve access, see progress reports, and can ask for human help anytime. We only keep the data needed for learning.",
  },
  {
    question: "Does the AI just give kids the answers?",
    answer: "No. Our coaches ask questions and give hints. Kids try problems on their own first, then show what they learned with fresh work - no AI help allowed on the final check.",
  },
  {
    question: "What subjects can my child learn?",
    answer: "Three areas right now: math with Coach Maya, reading with Story Explorer, and life skills with Growth & Glow. Each one uses the same friendly step-by-step method.",
  },
  {
    question: "What ages is it for?",
    answer: "AICenter4U works best for kids about 8 to 14 years old. Each coach adjusts to your child's level, so it fits beginners and more advanced learners.",
  },
];

/**
 * AICenter4U Company Info
 */
export const aicenterCompanyInfo = {
  name: "AICenter4U",
  tagline: "Learn. Believe. Grow.",
  program: "A Waraba Haven Foundation program",
};

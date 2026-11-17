export type MechanixSection = "Learn" | "Practice" | "Trade" | "Community" | "Admin";

export interface MechanixView {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  section: MechanixSection;
}

export const DEFAULT_VIEW = "practice";

export const SECTION_DEFAULT: Record<MechanixSection, string> = {
  Learn: "dashboard",
  Practice: "practice",
  Trade: "trade",
  Community: "community",
  Admin: "admin-login",
};

export const MECHANIX_VIEWS: MechanixView[] = [
  { slug: "login", title: "Sign In", shortTitle: "Sign in", section: "Learn", description: "Sign in to MechaniX — simulated authentication." },
  { slug: "account-setup", title: "Account Setup", shortTitle: "Account", section: "Learn", description: "Profile, timezone, currency, theme, and risk defaults." },
  { slug: "dashboard", title: "Dashboard", shortTitle: "Dashboard", section: "Learn", description: "Today: next lesson, routine, chart preview, and KPIs." },
  { slug: "onboarding", title: "Onboarding", shortTitle: "Onboarding", section: "Learn", description: "Guided setup: goals, markets, schedule, and risk." },
  { slug: "lesson", title: "Lesson", shortTitle: "Lesson", section: "Learn", description: "Lesson card with an embedded mini chart task." },
  { slug: "quiz", title: "Scenario Quiz", shortTitle: "Quiz", section: "Learn", description: "Scenario quiz with feedback and level acceptance." },
  { slug: "quiz-builder", title: "Quiz Builder", shortTitle: "Quiz Builder", section: "Learn", description: "Exam and quiz editor with publish settings." },
  { slug: "integrations", title: "Integrations", shortTitle: "Integrations", section: "Learn", description: "External LMS connections and course sync." },
  { slug: "practice", title: "Practice", shortTitle: "Practice", section: "Practice", description: "Chart practice workspace with simulated orders." },
  { slug: "markets", title: "Markets", shortTitle: "Markets", section: "Practice", description: "Market overview and sortable instrument table." },
  { slug: "scanner", title: "Scanner", shortTitle: "Scanner", section: "Practice", description: "Four Filter setup scanner. Educational, not advice." },
  { slug: "orderflow", title: "Bookmap / Order Flow", shortTitle: "Bookmap", section: "Practice", description: "Liquidity heatmap and DOM ladder (simulated)." },
  { slug: "trade", title: "Trade", shortTitle: "Trade", section: "Trade", description: "Chart, positions, and simulated order ticket." },
  { slug: "prop", title: "Prop Challenge", shortTitle: "Prop", section: "Trade", description: "Rule meters and equity curve for the challenge." },
  { slug: "copier", title: "Trade Copier", shortTitle: "Copier", section: "Trade", description: "Lead to follower copy mapping and controls." },
  { slug: "journal", title: "Journal", shortTitle: "Journal", section: "Trade", description: "Win/loss calendar, KPIs, and day detail." },
  { slug: "community", title: "Community", shortTitle: "Community", section: "Community", description: "Channels, chat, reactions, and chart attachments." },
  { slug: "discussions", title: "Discussions", shortTitle: "Discussions", section: "Community", description: "Forum feed with filters, search, and new posts." },
  { slug: "coach", title: "Coach Review", shortTitle: "Coach", section: "Community", description: "Review queue, submission chart, and rubric." },
  { slug: "group-quiz", title: "Group Quiz", shortTitle: "Group Quiz", section: "Community", description: "Live team challenge with animated leaderboard." },
  { slug: "shop", title: "Shop", shortTitle: "Shop", section: "Community", description: "Courses, tools, merch, and coaching — simulated cart." },
  { slug: "admin-login", title: "Staff Sign In", shortTitle: "Staff", section: "Admin", description: "Staff area — coach and admin sign-in. Simulated authentication." },
  { slug: "admin-students", title: "Student Manager", shortTitle: "Students", section: "Admin", description: "Learner roster, level gating, and coach assignments." },
  { slug: "admin-course", title: "Course Builder", shortTitle: "Course", section: "Admin", description: "Module/lesson editor with quiz blocks and a chat-mode preview." },
  { slug: "admin-review", title: "Coach Review & Follow-up", shortTitle: "Review", section: "Admin", description: "Submission review queue, rubric actions, and follow-ups." },
  { slug: "admin-connectors", title: "Market Connectors", shortTitle: "Connectors", section: "Admin", description: "Provider connections and canonical instrument mapping." },
  { slug: "admin-architecture", title: "Architecture Principles", shortTitle: "Architecture", section: "Admin", description: "The seven platform architecture principles." },
];

export const VIEW_SLUGS = MECHANIX_VIEWS.map((v) => v.slug);

export function getMechanixView(slug: string): MechanixView | undefined {
  return MECHANIX_VIEWS.find((v) => v.slug === slug);
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Play,
  Users,
  Award,
  BookOpen,
  Calendar,
  Target,
  TrendingUp,
  CheckCircle,
  Clock,
  Star,
} from "lucide-react";
import {
  getCourses,
  getWorkshops,
  getCategories,
  getAcademyStats,
  type CourseDoc,
  type WorkshopDoc,
  type CategoryDoc,
} from "@/lib/firebase-lms";

// Fallback data for when Firebase is not available — mirrors the seeded catalog
const fallbackCourses = [
  {
    title: "Number Sense Adventures",
    description: "Place value, word problems, and multiplication missions with Coach Maya — your friendly AI math guide.",
    category: "Math Adventures",
    duration: "3 hours",
    lessons: 14,
    level: "Grades 3-5",
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&h=450&q=80",
    slug: "number-sense-adventures",
    isFeatured: true,
  },
  {
    title: "Fractions Fun Lab",
    description: "Slice, compare, and play with fractions through guided experiments and everyday examples.",
    category: "Math Adventures",
    duration: "2.5 hours",
    lessons: 11,
    level: "Grades 4-6",
    image: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=800&h=450&q=80",
    slug: "fractions-fun-lab",
  },
  {
    title: "Story Explorer: Reading Adventures",
    description: "Find the big idea in every story and become a reading detective with your AI Story Explorer.",
    category: "Reading & Stories",
    duration: "3 hours",
    lessons: 12,
    level: "Grades 3-5",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&h=450&q=80",
    slug: "story-explorer-reading-adventures",
  },
  {
    title: "Growth & Glow: Confidence & Kindness",
    description: "Name feelings, solve friendship puzzles, and build everyday confidence with your Growth & Glow coach.",
    category: "Life Skills",
    duration: "3 hours",
    lessons: 12,
    level: "Grades 3-6",
    image: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?auto=format&fit=crop&w=800&h=450&q=80",
    slug: "growth-glow-confidence-kindness",
  },
];

const fallbackCategories = [
  { id: "math-adventures", name: "Math Adventures", slug: "math-adventures", icon: Target, color: "bg-teal-500", courseCount: 2 },
  { id: "reading-stories", name: "Reading & Stories", slug: "reading-stories", icon: BookOpen, color: "bg-purple-500", courseCount: 2 },
  { id: "life-skills", name: "Life Skills", slug: "life-skills", icon: Users, color: "bg-pink-500", courseCount: 1 },
  { id: "study-skills", name: "Study Skills", slug: "study-skills", icon: Star, color: "bg-blue-500", courseCount: 1 },
];

const fallbackWorkshops = [
  {
    title: "Meet Your AI Coach: Family Orientation",
    date: "Next Saturday",
    time: "10:00 AM EST",
    type: "Live Workshop",
    spots: 20,
  },
  {
    title: "Family Math Game Night",
    date: "Monthly",
    time: "6:30 PM EST",
    type: "Live Workshop",
    spots: 15,
  },
  {
    title: "Reading Circle Live: Story Detectives",
    date: "Monthly",
    time: "5:00 PM EST",
    type: "Live Workshop",
    spots: 18,
  },
];

// Category icon mapping
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "math-adventures": Target,
  "reading-stories": BookOpen,
  "life-skills": Users,
  "study-skills": Star,
};

const CATEGORY_COLORS: Record<string, string> = {
  "math-adventures": "bg-teal-500",
  "reading-stories": "bg-purple-500",
  "life-skills": "bg-pink-500",
  "study-skills": "bg-blue-500",
};

const subscriptionTiers = [
  {
    name: "Little Explorer",
    price: 0,
    period: "month",
    description: "A gentle first step — perfect for trying AI-guided learning together",
    features: [
      "1 course of your choice",
      "Meet-the-coach demo lesson",
      "Student interview for personalization",
      "Progress dashboard for parents",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Learner",
    price: 9.99,
    period: "month",
    description: "Full access for one child across every course and coach",
    features: [
      "All courses unlocked",
      "All AI coach personas",
      "Six-stage guided lessons",
      "Badges, points & certificates",
      "Printable progress reports",
      "Priority workshop registration",
    ],
    cta: "Start Learning",
    popular: true,
  },
  {
    name: "Family Plan",
    price: 19.99,
    period: "month",
    description: "Everything for the whole family — up to 4 learners on one plan",
    features: [
      "All Learner features",
      "Up to 4 learner profiles",
      "Guardian consent controls",
      "Family workshops included",
      "Dedicated family support",
    ],
    cta: "Start Family Plan",
    popular: false,
  },
];

export default function AcademyPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseDoc[]>([]);
  const [workshops, setWorkshops] = useState<WorkshopDoc[]>([]);
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [stats, setStats] = useState({ totalCourses: 35, totalLessons: 200, totalWorkshops: 50, totalEnrollments: 500, totalCertificates: 0 });
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [coursesData, workshopsData, categoriesData, statsData] = await Promise.all([
          getCourses({ isPublished: true, isFeatured: true, limitCount: 4 }),
          getWorkshops({ isPublished: true, upcoming: true, limitCount: 3 }),
          getCategories(),
          getAcademyStats(),
        ]);
        setCourses(coursesData);
        setWorkshops(workshopsData);
        setCategories(categoriesData);
        setStats(statsData);
        setUseFallback(false);
      } catch (error) {
        console.error("Error loading academy data:", error);
        // Use fallback data on error
        setUseFallback(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Use Firebase data or fallback when there's an error or no data
  const displayCourses = courses.length > 0 ? courses : (useFallback ? fallbackCourses : []);
  const displayWorkshops = workshops.length > 0 ? workshops : (useFallback ? fallbackWorkshops : []);
  const displayCategories = categories.length > 0 ? categories : (useFallback ? fallbackCategories : []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-teal-500/20 text-teal-300 border-teal-500/30">
              CurioQuest Academy
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
              Where Kids Learn to Love{" "}
              <span className="text-teal-300">Learning</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Friendly AI coaches guide your child through K-12 lessons built for real
              understanding — not memorization. Every course is safe, family-friendly,
              and made for curious minds.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="text-lg bg-teal-500 hover:bg-teal-600 text-slate-900" asChild>
                <Link href="/academy/courses">
                  Explore Courses
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg border-white/30 text-white hover:bg-white/10" asChild>
                <Link href="#pricing">
                  View Pricing
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl font-bold text-teal-300">{stats.totalCourses || 6}</div>
                <div className="text-gray-400">Courses</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-teal-300">{stats.totalLessons || 70}+</div>
                <div className="text-gray-400">Guided Lessons</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-teal-300">3</div>
                <div className="text-gray-400">AI Coaches</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-teal-300">6</div>
                <div className="text-gray-400">Learning Stages</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20">
        <div className="container">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Courses</h2>
              <p className="text-muted-foreground">Kid-approved adventures in math, reading, and life skills</p>
            </div>
            <Button variant="ghost" className="text-teal-600" asChild>
              <Link href="/academy/courses">
                View All Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-video" />
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-6 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : displayCourses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayCourses.map((course: any) => (
                <Card key={course.id || course.slug} className="group overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-slate-200 relative overflow-hidden">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-slate-900/40" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="h-6 w-6 text-teal-600 ml-1" />
                      </div>
                    </div>
                    {course.isFeatured && (
                      <Badge className="absolute top-3 left-3 bg-teal-500 text-white">Featured</Badge>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Badge variant="outline" className="text-xs capitalize">{course.difficultyLevel}</Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{course.shortDescription || course.description}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.estimatedDurationMinutes ? `${Math.round(course.estimatedDurationMinutes / 60)}h` : "TBD"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.enrollmentCount} enrolled
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {fallbackCourses.map((course) => (
              <Card key={course.slug} className="group overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-slate-200 relative overflow-hidden">
                  {course.image && course.image.startsWith("http") ? (
                    <img
                      src={course.image}
                      alt={course.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-slate-900/40" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="h-6 w-6 text-teal-600 ml-1" />
                    </div>
                  </div>
                  {course.isFeatured && (
                    <Badge className="absolute top-3 left-3 bg-teal-500 text-white">Featured</Badge>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Badge variant="outline" className="text-xs">{course.category}</Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{course.description}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {course.lessons} lessons
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-slate-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Browse by Category</h2>
            <p className="text-muted-foreground">Pick a topic your child is curious about</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {displayCategories.length > 0 ? (
              displayCategories.map((category) => {
                const IconComponent = CATEGORY_ICONS[category.slug] || Target;
                const colorClass = CATEGORY_COLORS[category.slug] || "bg-teal-500";
                return (
                  <Link
                    key={category.id}
                    href={`/academy/courses?category=${category.slug}`}
                    className="group"
                  >
                    <Card className="text-center p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                      <div className={`w-14 h-14 rounded-full ${colorClass} flex items-center justify-center mx-auto mb-4`}>
                        <IconComponent className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="font-semibold mb-1 group-hover:text-teal-600 transition-colors">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.courseCount} courses</p>
                    </Card>
                  </Link>
                );
              })
            ) : (
              fallbackCategories.map((category) => (
                <Link
                  key={category.name}
                  href={`/academy/courses?category=${category.name.toLowerCase().replace(/ & /g, '-')}`}
                  className="group"
                >
                  <Card className="text-center p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className={`w-14 h-14 rounded-full ${category.color} flex items-center justify-center mx-auto mb-4`}>
                      <category.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="font-semibold mb-1 group-hover:text-teal-600 transition-colors">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.courseCount} courses</p>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Upcoming Workshops */}
      <section className="py-20">
        <div className="container">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Upcoming Workshops</h2>
              <p className="text-muted-foreground">Live family sessions — learn and play together</p>
            </div>
            <Button variant="ghost" className="text-teal-600" asChild>
              <Link href="/academy/workshops">
                View All Workshops
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {workshops.length > 0 ? (
              workshops.map((workshop) => (
                <Card key={workshop.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-teal-600 border-teal-500/50">
                        <Calendar className="h-3 w-3 mr-1" />
                        {workshop.workshopType === "live" ? "Live Workshop" : "Recorded"}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{workshop.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {workshop.scheduledStart?.toDate().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {workshop.scheduledStart?.toDate().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" })}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {workshop.maxParticipants ? `${workshop.maxParticipants - workshop.registrationCount} spots remaining` : "Open registration"}
                      </div>
                    </div>
                    <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white" asChild>
                      <Link href="/academy/workshops">
                        Register Now
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : useFallback ? (
              fallbackWorkshops.map((workshop) => (
                <Card key={workshop.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-teal-600 border-teal-500/50">
                        <Calendar className="h-3 w-3 mr-1" />
                        {workshop.type}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{workshop.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {workshop.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {workshop.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {workshop.spots} spots remaining
                      </div>
                    </div>
                    <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white" asChild>
                      <Link href="/academy/workshops">
                        Register Now
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : null}
          </div>
        </div>
      </section>

      {/* Assessments Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-teal-500/20 text-teal-300 border-teal-500/30">
              How Our AI Coaches Teach
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Six Stages to Real Understanding</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Every guided lesson walks your child through Notice, Try, Challenge, Verify,
              Reflect, and Transfer — so they prove what they know by doing it themselves,
              not by memorizing answers.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-teal-300" />
                </div>
                <h3 className="font-semibold mb-2">Personalized Lessons</h3>
                <p className="text-sm text-gray-400">A friendly interview learns how your child learns best — then every coach adapts</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-teal-300" />
                </div>
                <h3 className="font-semibold mb-2">Progress You Can See</h3>
                <p className="text-sm text-gray-400">Track quiz scores, completed lessons, and learning metrics — printable anytime</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-teal-300" />
                </div>
                <h3 className="font-semibold mb-2">Certificates & Badges</h3>
                <p className="text-sm text-gray-400">Celebrate wins with badges along the way and a certificate at completion</p>
              </div>
            </div>

            <Button size="lg" className="mt-10 bg-teal-500 hover:bg-teal-600 text-slate-900" asChild>
              <Link href="/academy/courses">
                See How It Works
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Choose Your Family Plan</h2>
            <p className="text-muted-foreground">Simple pricing that grows with your learner</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {subscriptionTiers.map((tier) => (
              <Card 
                key={tier.name} 
                className={`relative ${tier.popular ? 'border-teal-500 shadow-lg scale-105' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-teal-500 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="my-6">
                    <span className="text-4xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground">/{tier.period}</span>
                  </div>
                  <ul className="space-y-3 text-left mb-8">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${tier.popular ? 'bg-teal-500 hover:bg-teal-600 text-slate-900' : ''}`}
                    variant={tier.popular ? 'default' : 'outline'}
                  >
                    {tier.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Start free — no credit card required. Cancel anytime. Parents approve everything.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-teal-50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Meet Your Child&apos;s AI Coach?</h2>
            <p className="text-muted-foreground mb-8">
              Join families discovering a safer, friendlier way to learn with AI.
              The first course is free — and the first lesson shows you exactly how it works.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white" asChild>
                <Link href="/academy/courses">
                  Browse All Courses
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">
                  Ask a Question
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

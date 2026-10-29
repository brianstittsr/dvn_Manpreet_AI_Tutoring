import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle,
  HelpCircle,
  Target,
  Quote,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How to Build a Leadership Team You Can Trust | CurioQuest",
  description:
    "The difference between a business that scales and one that stalls often comes down to one thing: the leadership team. Learn how to build yours and break through the ceiling holding you back.",
  keywords: [
    "leadership team building",
    "executive team development",
    "scaling business",
    "delegation strategy",
    "trust in leadership",
    "business growth",
  ],
  openGraph: {
    title: "How to Build a Leadership Team You Can Trust",
    description:
      "The difference between a business that scales and one that stalls often comes down to one thing: the leadership team. Here's how to build yours.",
    type: "article",
    publishedTime: "2025-12-05",
    authors: ["CurioQuest"],
    images: [
      {
        url: "https://images.pexels.com/photos/3182822/pexels-photo-3182822.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        width: 1260,
        height: 750,
        alt: "Strong leadership team collaborating in modern office",
      },
    ],
  },
};

export default function ArticlePage() {
  return (
    <article className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] bg-slate-900">
        <Image
          src="https://images.pexels.com/photos/3182822/pexels-photo-3182822.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          alt="Leadership team collaboration and trust"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container pb-16">
            <Badge className="mb-4 bg-amber-500 text-slate-900 hover:bg-amber-600">
              Leadership
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl mb-4">
              How to Build a Leadership Team You Can Trust
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-gray-300">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                December 5, 2025
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                7 min read
              </span>
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                CurioQuest Team
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container py-16">
        <div className="grid lg:grid-cols-[1fr,320px] gap-12">
          {/* Main Content */}
          <div className="max-w-3xl">
            <Link
              href="/journal"
              className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to The Journal
            </Link>

            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              The difference between a business that scales and one that stalls 
              often comes down to one thing: the leadership team. Here's how 
              to build yours and finally break through the ceiling that's been 
              holding you back.
            </p>

            <p className="text-lg leading-relaxed mb-6">
              You've probably heard the saying: "The bottleneck is always at 
              the top of the bottle." For most business owners, that bottleneck 
              is you. Not because you're incompetent—quite the opposite. You're 
              too capable, too involved, and too essential.
            </p>

            <p className="text-lg leading-relaxed mb-6">
              The businesses that scale to 8, 9, or 10 figures have something 
              in common: they have leadership teams that function without the 
              founder's constant involvement. And the owners of those businesses? 
              They have something priceless: peace of mind.
            </p>

            <Card className="mb-10 border-amber-500/30 bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                    <HelpCircle className="h-6 w-6 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Is Your Leadership Team Ready for Growth?
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Take our 5-minute Business Legacy Assessment to discover 
                      exactly how strong your current leadership team is and 
                      what gaps you need to fill before you can scale with 
                      confidence.
                    </p>
                    <Button
                      className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                      asChild
                    >
                      <Link href="/quiz">
                        Take the Assessment
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <h2 className="text-2xl font-bold mb-4">
              The Problem: Why Most Owners Can't Let Go
            </h2>

            <p className="text-lg leading-relaxed mb-6">
              Before we talk about how to build your leadership team, let's 
              address the elephant in the room: trust. Most owners can't build 
              a strong team because they can't trust anyone to do the job as 
              well as they can.
            </p>

            <p className="text-lg leading-relaxed mb-6">
              And you know what? They're usually right—at first. No one will 
              care about your business as much as you do. No one will have your 
              institutional knowledge. No one will make decisions exactly like 
              you would.
            </p>

            <div className="bg-slate-50 border-l-4 border-amber-500 p-6 my-6">
              <Quote className="h-6 w-6 text-amber-500 mb-2" />
              <p className="italic text-lg">
                "The goal isn't to find people exactly like you. The goal is 
                to find people who are better than you at specific things, and 
                then get out of their way."
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-4 mt-8">
              The 5 Pillars of a Trusted Leadership Team
            </h2>

            <div className="space-y-8 mb-10">
              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold">
                    1
                  </span>
                  Hire for Values Alignment
                </h3>
                <p className="text-lg leading-relaxed mb-4">
                  Skills can be taught. Values can't. Before you hire for 
                  competence, hire for character. Ask yourself: Would I trust 
                  this person with my reputation? Would they make decisions 
                  aligned with what matters most to me?
                </p>
                <p className="text-muted-foreground">
                  <strong>Action Step:</strong> Define your top 5 non-negotiable 
                  values. Use behavioral interview questions to assess alignment 
                  before making any leadership hire.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold">
                    2
                  </span>
                  Create Crystal-Clear Roles and Authority
                </h3>
                <p className="text-lg leading-relaxed mb-4">
                  Nothing kills trust faster than ambiguity. Your leadership 
                  team needs to know exactly what they're responsible for and 
                  what decisions they can make without your approval.
                </p>
                <p className="text-muted-foreground">
                  <strong>Action Step:</strong> Document decision-making 
                  authority matrices. What can they decide independently? What 
                  requires consultation? What needs your approval? Be specific.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold">
                    3
                  </span>
                  Invest in Their Development
                </h3>
                <p className="text-lg leading-relaxed mb-4">
                  Trust grows when you invest in people. Provide coaching, 
                  training, and opportunities for growth. When you demonstrate 
                  that you believe in their potential, they'll rise to meet 
                  your expectations.
                </p>
                <p className="text-muted-foreground">
                  <strong>Action Step:</strong> Allocate 5-10% of your leadership 
                  payroll budget to professional development. Create individual 
                  growth plans for each team member.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold">
                    4
                  </span>
                  Practice Radical Transparency
                </h3>
                <p className="text-lg leading-relaxed mb-4">
                  Trust is a two-way street. Share your vision, your concerns, 
                  and even your mistakes with your leadership team. When they 
                  understand the full picture, they can make better decisions 
                  and feel true ownership.
                </p>
                <p className="text-muted-foreground">
                  <strong>Action Step:</strong> Implement weekly leadership team 
                  meetings where you share financials, challenges, and strategic 
                  thinking openly.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold">
                    5
                  </span>
                  Let Them Fail (Within Boundaries)
                </h3>
                <p className="text-lg leading-relaxed mb-4">
                  Trust isn't proven until it's tested. Give your team real 
                  responsibility and let them make mistakes. The key is creating 
                  a culture where failures are learning opportunities, not 
                  career-ending disasters.
                </p>
                <p className="text-muted-foreground">
                  <strong>Action Step:</strong> Identify 3 decisions you've been 
                  making that someone else should own. Delegate them this month 
                  and commit to not intervening unless absolutely necessary.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4 mt-8">
              The Transition: From Doer to Leader
            </h2>

            <p className="text-lg leading-relaxed mb-6">
              Building a trusted leadership team requires you to change how you 
              operate. You need to shift from being the best doer in the company 
              to being the best leader of leaders. This is uncomfortable. It 
              requires letting go of control and embracing a new identity.
            </p>

            <p className="text-lg leading-relaxed mb-6">
              But here's what awaits you on the other side: a business that 
              grows without your constant presence. A team that solves problems 
              without escalating everything to you. And most importantly, the 
              freedom to focus on what only you can do—vision, strategy, and 
              building relationships.
            </p>

            <div className="bg-green-50 border-l-4 border-green-500 p-6 my-8">
              <p className="font-semibold text-green-900 mb-2">The Reward</p>
              <p className="text-green-800">
                Business owners with strong leadership teams work fewer hours, 
                earn more, and have businesses worth significantly more at exit.
              </p>
            </div>

            <Card className="mb-10 bg-slate-900 text-white">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                    <Target className="h-6 w-6 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Ready to Build Your Leadership Team?
                    </h3>
                    <p className="text-gray-300 mb-4">
                      At CurioQuest, we specialize in helping business owners 
                      transform from overwhelmed operators into confident 
                      leaders of high-performing teams. Our proven methodology 
                      has helped hundreds of owners build leadership teams 
                      they can trust—and businesses that thrive without them.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Button
                        className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                        asChild
                      >
                        <Link href="/schedule-a-call">
                          Schedule Your Strategy Call
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="border-white/30 hover:bg-white/10"
                        asChild
                      >
                        <Link href="/quiz">
                          Take the Assessment First
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <h2 className="text-2xl font-bold mb-4">
              The Bottom Line
            </h2>

            <p className="text-lg leading-relaxed mb-6">
              Your business will never scale beyond your personal capacity 
              unless you build a leadership team you trust. The good news? 
              Trust can be built systematically. It requires intention, 
              investment, and a willingness to let go—but the rewards are 
              transformational.
            </p>

            <p className="text-lg leading-relaxed mb-8">
              Don't wait until you're burned out or until a crisis forces 
              your hand. Start building your leadership team today.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                size="lg"
                asChild
              >
                <Link href="/schedule-a-call">
                  Build Your Leadership Team
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
              >
                <Link href="/quiz">
                  Take the Assessment
                </Link>
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Related Articles</h3>
                <div className="space-y-4">
                  <Link
                    href="/journal/founder-to-ceo-mindset-shift"
                    className="block group"
                  >
                    <p className="font-medium group-hover:text-amber-600 transition-colors">
                      From Founder to CEO: Making the Mindset Shift
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Leadership • 8 min read
                    </p>
                  </Link>
                  <Separator />
                  <Link
                    href="/journal/5-signs-business-would-collapse-without-you"
                    className="block group"
                  >
                    <p className="font-medium group-hover:text-amber-600 transition-colors">
                      5 Signs Your Business Would Collapse Without You
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Leadership • 8 min read
                    </p>
                  </Link>
                  <Separator />
                  <Link
                    href="/journal/hidden-cost-being-indispensable"
                    className="block group"
                  >
                    <p className="font-medium group-hover:text-amber-600 transition-colors">
                      The Hidden Cost of Being Indispensable
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Operations • 5 min read
                    </p>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-slate-900">
              <CardContent className="p-6">
                <h3 className="font-bold mb-2">Start Building Trust Today</h3>
                <p className="text-sm mb-4">
                  Schedule a free consultation to learn how we can help you 
                  build a leadership team that scales with your vision.
                </p>
                <Button
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                  asChild
                >
                  <Link href="/schedule-a-call">
                    Book Your Call
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-16 bg-slate-50">
        <div className="container max-w-4xl text-center">
          <h2 className="text-2xl font-bold mb-4">
            Transform Your Business With the Right Team
          </h2>
          <p className="text-muted-foreground mb-8">
            Join hundreds of business owners who have broken through their 
            growth ceiling by building leadership teams they trust.
          </p>
          <Button
            className="bg-amber-500 hover:bg-amber-600 text-slate-900"
            size="lg"
            asChild
          >
            <Link href="/schedule-a-call">
              Schedule Your Free Strategy Call
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </article>
  );
}

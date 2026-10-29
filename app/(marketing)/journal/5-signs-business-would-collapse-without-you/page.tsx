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
  Target,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Quote,
} from "lucide-react";

export const metadata: Metadata = {
  title: "5 Signs Your Business Would Collapse Without You | AICenter4U",
  description:
    "If you can't take a vacation without your phone blowing up, you don't have a business—you have a job. Discover the 5 warning signs and how to build a business that thrives without your constant presence.",
  keywords: [
    "business bottleneck",
    "owner dependency",
    "business succession",
    "entrepreneur burnout",
    "scalable business",
    "legacy planning",
  ],
  openGraph: {
    title: "5 Signs Your Business Would Collapse Without You",
    description:
      "If you can't take a vacation without your phone blowing up, you don't have a business—you have a job. Here's how to know if you're the bottleneck.",
    type: "article",
    publishedTime: "2025-12-15",
    authors: ["AICenter4U"],
    images: [
      {
        url: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        width: 1260,
        height: 750,
        alt: "Stressed business owner overwhelmed with work",
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
          src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          alt="Business owner overwhelmed with constant demands"
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
              5 Signs Your Business Would Collapse Without You
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-gray-300">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                December 15, 2025
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                8 min read
              </span>
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                AICenter4U Team
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

            {/* Lead Paragraph */}
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              If you can't take a two-week vacation without your phone blowing up, 
              you don't have a business—you have a job. And worse, it's a job that 
              owns you instead of the other way around.
            </p>

            <p className="text-lg leading-relaxed mb-6">
              Every business owner dreams of building something that lasts. But 
              here's the harsh reality: most businesses are held together by the 
              sheer willpower of their founder. Remove that founder, and the whole 
              thing crumbles like a house of cards.
            </p>

            <p className="text-lg leading-relaxed mb-8">
              The good news? You can change this. But first, you need to recognize 
              the warning signs. Take our quick assessment to see where your 
              business stands.
            </p>

            {/* CTA 1 - Quiz */}
            <Card className="mb-10 border-amber-500/30 bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                    <HelpCircle className="h-6 w-6 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Is Your Business Built to Last?
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Take our 5-minute Business Legacy Assessment to discover 
                      exactly where your business stands and what steps you need 
                      to take to build something that thrives without your 
                      constant presence.
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

            <Separator className="my-8" />

            {/* Sign 1 */}
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-lg font-bold">
                1
              </span>
              You're the Only One Who Can Make Decisions
            </h2>

            <p className="text-lg leading-relaxed mb-6">
              Does everything—from approving a $50 expense to hiring a new 
              team member—require your sign-off? If your team can't move forward 
              without asking "What do you think?" you're not just running a 
              business; you're babysitting adults.
            </p>

            <p className="text-lg leading-relaxed mb-6">
              This isn't just inefficient—it's dangerous. What happens if you 
              get sick? What if you want to sell the business someday? A 
              potential buyer will see this as a massive risk, and your 
              valuation will plummet.
            </p>

            <div className="bg-slate-50 border-l-4 border-amber-500 p-6 my-6">
              <p className="italic text-lg">
                "The businesses that command the highest multiples are the ones 
                where the owner could walk away tomorrow and everything would 
                keep running smoothly."
              </p>
            </div>

            {/* Sign 2 */}
            <h2 className="text-2xl font-bold mb-4 mt-10 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-lg font-bold">
                2
              </span>
              Your Team Can't Solve Problems Without You
            </h2>

            <p className="text-lg leading-relaxed mb-6">
              When something goes wrong—and something always goes wrong—does 
              your team come to you with solutions, or just problems? If you're 
              the only one who knows how to fix things, you've built yourself 
              a very expensive, very stressful job.
            </p>

            <p className="text-lg leading-relaxed mb-6">
              Great leaders don't solve every problem. They build teams that 
              can solve problems. They create systems and processes that 
              anticipate issues before they become crises.
            </p>

            {/* Sign 3 */}
            <h2 className="text-2xl font-bold mb-4 mt-10 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-lg font-bold">
                3
              </span>
              Your Customers Only Want to Talk to You
            </h2>

            <p className="text-lg leading-relaxed mb-6">
              This is a classic trap. You think you're being "customer-focused" 
              by handling every client relationship personally. But what you're 
              really doing is creating a business that can't scale—and can't be 
              sold.
            </p>

            <p className="text-lg leading-relaxed mb-6">
              The most valuable businesses have strong customer relationships 
              that extend beyond the founder. Your clients should love your 
              <em> brand</em>, not just <em>you</em>.
            </p>

            {/* Sign 4 */}
            <h2 className="text-2xl font-bold mb-4 mt-10 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-lg font-bold">
                4
              </span>
              You Can't Take a Real Vacation
            </h2>

            <p className="text-lg leading-relaxed mb-6">
              When was the last time you took a two-week vacation where you 
              didn't check email, didn't take calls, and didn't worry about 
              what was happening back at the office? If you can't remember, 
              your business owns you.
            </p>

            <p className="text-lg leading-relaxed mb-6">
              Here's a challenge: Book a two-week trip somewhere with no 
              internet. If the thought terrifies you, you know exactly what 
              you need to work on.
            </p>

            {/* Sign 5 */}
            <h2 className="text-2xl font-bold mb-4 mt-10 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-lg font-bold">
                5
              </span>
              You Have No Idea What Your Business Is Worth
            </h2>

            <p className="text-lg leading-relaxed mb-6">
              If someone offered to buy your business today, would you know 
              what it's actually worth? Most owners don't. And the ones who 
              are overly dependent on the founder are almost always 
              disappointed by the valuation.
            </p>

            <p className="text-lg leading-relaxed mb-6">
              A business that depends on its owner is worth less than one 
              that doesn't. It's that simple. Buyers pay premiums for 
              businesses that run themselves. They discount—or walk away 
              from—businesses that can't survive without the founder.
            </p>

            <Separator className="my-8" />

            {/* The Solution */}
            <h2 className="text-2xl font-bold mb-4">
              The Solution: Build a Business That Outlives You
            </h2>

            <p className="text-lg leading-relaxed mb-6">
              Here's the truth: You didn't start your business to create 
              a prison for yourself. You started it to create freedom, 
              wealth, and something meaningful that lasts.
            </p>

            <p className="text-lg leading-relaxed mb-6">
              The path forward requires three things:
            </p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                <span className="text-lg">
                  <strong>Systems:</strong> Document everything. Create 
                  processes that anyone can follow.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                <span className="text-lg">
                  <strong>Team:</strong> Hire people who are smarter than 
                  you. Build a leadership team you can trust.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                <span className="text-lg">
                  <strong>Vision:</strong> Create a purpose that extends 
                  beyond you. Build a brand, not just a business.
                </span>
              </li>
            </ul>

            {/* CTA 2 - Schedule Call */}
            <Card className="mb-10 bg-slate-900 text-white">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                    <Target className="h-6 w-6 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Ready to Build a Business That Thrives Without You?
                    </h3>
                    <p className="text-gray-300 mb-4">
                      At AICenter4U, we've helped hundreds of business owners 
                      transform their companies from owner-dependent operations 
                      into scalable, sellable assets. Schedule a free strategy 
                      call to discover your personalized roadmap to freedom.
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

            {/* Conclusion */}
            <h2 className="text-2xl font-bold mb-4">The Bottom Line</h2>

            <p className="text-lg leading-relaxed mb-6">
              Your business should serve you, not the other way around. If 
              you're seeing any of these five signs, it's time to make a 
              change. The longer you wait, the harder it becomes—and the 
              more value you're leaving on the table.
            </p>

            <p className="text-lg leading-relaxed mb-8">
              Don't let another year go by building a job instead of a legacy. 
              Take the first step today.
            </p>

            <div className="flex flex-wrap gap-4">
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
              <Button
                variant="outline"
                size="lg"
                asChild
              >
                <Link href="/quiz">
                  Take the Business Assessment
                </Link>
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Author Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                    <User className="h-8 w-8 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-semibold">AICenter4U</p>
                    <p className="text-sm text-muted-foreground">
                      Business Strategy Experts
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  We help business owners transform their companies into 
                  scalable, sellable assets that thrive for generations.
                </p>
              </CardContent>
            </Card>

            {/* Related Articles */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Related Articles</h3>
                <div className="space-y-4">
                  <Link
                    href="/journal/succession-planning-checklist"
                    className="block group"
                  >
                    <p className="font-medium group-hover:text-amber-600 transition-colors">
                      The Succession Planning Checklist Every Owner Needs
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Succession • 6 min read
                    </p>
                  </Link>
                  <Separator />
                  <Link
                    href="/journal/build-leadership-team-you-can-trust"
                    className="block group"
                  >
                    <p className="font-medium group-hover:text-amber-600 transition-colors">
                      How to Build a Leadership Team You Can Trust
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Leadership • 7 min read
                    </p>
                  </Link>
                  <Separator />
                  <Link
                    href="/journal/building-business-that-outlives-you"
                    className="block group"
                  >
                    <p className="font-medium group-hover:text-amber-600 transition-colors">
                      Building a Business That Outlives You
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Legacy • 7 min read
                    </p>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* CTA Card */}
            <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-slate-900">
              <CardContent className="p-6">
                <h3 className="font-bold mb-2">Want Personalized Advice?</h3>
                <p className="text-sm mb-4">
                  Schedule a free strategy call to discuss your specific 
                  situation and get a customized action plan.
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

      {/* Newsletter Section */}
      <section className="py-16 bg-slate-50">
        <div className="container max-w-4xl text-center">
          <h2 className="text-2xl font-bold mb-4">
            Get More Insights Like This
          </h2>
          <p className="text-muted-foreground mb-8">
            Join 2,500+ business owners who receive our weekly strategies 
            for building lasting legacies.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-slate-900"
              asChild
            >
              <Link href="/quiz">
                Take the Business Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </article>
  );
}

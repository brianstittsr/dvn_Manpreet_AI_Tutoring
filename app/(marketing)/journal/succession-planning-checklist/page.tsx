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
  CheckCircle,
  HelpCircle,
  Target,
  ClipboardCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "The Succession Planning Checklist Every Owner Needs | AICenter4U",
  description:
    "Whether you're 5 years or 15 years from exit, having a succession plan isn't optional—it's essential. Download our comprehensive checklist to ensure your business legacy is protected.",
  keywords: [
    "succession planning",
    "business exit strategy",
    "owner transition",
    "business succession checklist",
    "exit planning",
    "legacy planning",
  ],
  openGraph: {
    title: "The Succession Planning Checklist Every Owner Needs",
    description:
      "Whether you're 5 years or 15 years from exit, having a succession plan isn't optional—it's essential. Here's your complete checklist.",
    type: "article",
    publishedTime: "2025-12-10",
    authors: ["AICenter4U"],
    images: [
      {
        url: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        width: 1260,
        height: 750,
        alt: "Business succession planning meeting",
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
          src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          alt="Business succession planning with trusted advisors"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container pb-16">
            <Badge className="mb-4 bg-amber-500 text-slate-900 hover:bg-amber-600">
              Succession
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl mb-4">
              The Succession Planning Checklist Every Owner Needs
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-gray-300">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                December 10, 2025
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                6 min read
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

            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Whether you're 5 years or 15 years from exit, having a succession 
              plan isn't optional—it's essential. Here's your complete checklist 
              to ensure your business legacy is protected.
            </p>

            <p className="text-lg leading-relaxed mb-6">
              Every business owner will exit their business eventually. The only 
              question is whether you'll do it on your terms—or someone else's. 
              Without a proper succession plan, you're not just risking your 
              retirement; you're risking everything you've built.
            </p>

            <Card className="mb-10 border-amber-500/30 bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                    <HelpCircle className="h-6 w-6 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      How Ready Is Your Business for Transition?
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Before you dive into this checklist, take our 5-minute 
                      Business Legacy Assessment. You'll discover exactly where 
                      your business stands and what critical steps you need to 
                      take before you're ready to exit.
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

            <h2 className="text-2xl font-bold mb-6">
              The 12-Point Succession Planning Checklist
            </h2>

            <div className="space-y-6 mb-10">
              {/* Checklist Items */}
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Define Your Exit Timeline</h3>
                  <p className="text-muted-foreground">
                    Set a target date for your exit. Whether it's 3 years or 10, 
                    having a deadline forces action and helps you work backward 
                    to create your plan.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Identify Potential Successors</h3>
                  <p className="text-muted-foreground">
                    Will it be family? Key employees? An outside buyer? Each 
                    option requires a different preparation strategy. Start 
                    identifying and grooming successors now.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Get a Professional Valuation</h3>
                  <p className="text-muted-foreground">
                    You can't optimize what you don't measure. A professional 
                    valuation gives you a baseline and identifies value drivers 
                    you can improve before exit.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Document All Processes</h3>
                  <p className="text-muted-foreground">
                    Create standard operating procedures for every critical 
                    function. A business that runs on systems is worth more 
                    than one that runs on tribal knowledge.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold shrink-0">
                  5
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Build Your Leadership Team</h3>
                  <p className="text-muted-foreground">
                    Develop a management team that can run the business without 
                    you. Buyers pay premiums for businesses with strong leadership 
                    in place.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold shrink-0">
                  6
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Clean Up Your Financials</h3>
                  <p className="text-muted-foreground">
                    Ensure 3-5 years of clean, audited financial statements. 
                    Eliminate personal expenses run through the business. 
                    Buyers scrutinize financials heavily.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold shrink-0">
                  7
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Diversify Your Customer Base</h3>
                  <p className="text-muted-foreground">
                    No single customer should represent more than 10-15% of 
                    revenue. Concentration risk is a major red flag for buyers 
                    and significantly reduces valuation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold shrink-0">
                  8
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Protect Intellectual Property</h3>
                  <p className="text-muted-foreground">
                    Ensure all IP is properly registered and owned by the 
                    business, not individuals. This includes patents, trademarks, 
                    copyrights, and proprietary processes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold shrink-0">
                  9
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Establish Key Employee Retention</h3>
                  <p className="text-muted-foreground">
                    Create golden handcuffs for critical team members. 
                    Employment agreements, non-competes, and retention 
                    bonuses protect your business value during transition.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold shrink-0">
                  10
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Consult Your Advisory Team</h3>
                  <p className="text-muted-foreground">
                    Assemble and meet with your accountant, attorney, financial 
                    planner, and business broker. Each plays a critical role in 
                    a successful exit.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold shrink-0">
                  11
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Plan Your Life After Exit</h3>
                  <p className="text-muted-foreground">
                    What will you do with your time? Many owners struggle with 
                    identity loss after selling. Having a plan for your next 
                    chapter ensures a fulfilling transition.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold shrink-0">
                  12
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Create Your Legacy Vision</h3>
                  <p className="text-muted-foreground">
                    What do you want your business to become after you're gone? 
                    Document your values, vision, and hopes for the company's 
                    future to guide successors.
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            <h2 className="text-2xl font-bold mb-4">
              The Cost of Waiting
            </h2>

            <p className="text-lg leading-relaxed mb-6">
              Here's what most business owners don't realize: every year you 
              delay succession planning, you're potentially losing hundreds of 
              thousands—or even millions—in business value. Why? Because the 
              factors that drive valuation take time to implement.
            </p>

            <p className="text-lg leading-relaxed mb-6">
              You can't build a leadership team overnight. You can't diversify 
              your customer base in a month. You can't create bulletproof systems 
              in a weekend. These things take years.
            </p>

            <div className="bg-red-50 border-l-4 border-red-500 p-6 my-8">
              <p className="font-semibold text-red-900 mb-2">The Hard Truth</p>
              <p className="text-red-800">
                The best time to start succession planning was 5 years ago. 
                The second best time is today.
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-4 mt-8">
              Your Next Steps
            </h2>

            <p className="text-lg leading-relaxed mb-6">
              Don't let this be another article you read and forget. Take action 
              today. The future of your legacy depends on the decisions you make 
              right now.
            </p>

            <Card className="mb-10 bg-slate-900 text-white">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                    <Target className="h-6 w-6 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Ready to Secure Your Business Legacy?
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Our succession planning experts have helped hundreds of 
                      business owners successfully exit their businesses—on 
                      their terms and for maximum value. Schedule a free 
                      strategy call to start building your personalized 
                      succession plan today.
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

            <div className="flex flex-wrap gap-4">
              <Button
                className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                size="lg"
                asChild
              >
                <Link href="/schedule-a-call">
                  Start Your Succession Plan
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
              >
                <Link href="/quiz">
                  Take Business Assessment
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
                    href="/journal/exit-strategy-sell-transition-close"
                    className="block group"
                  >
                    <p className="font-medium group-hover:text-amber-600 transition-colors">
                      Exit Strategy: Sell, Transition, or Close?
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Succession • 10 min read
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
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-slate-900">
              <CardContent className="p-6">
                <h3 className="font-bold mb-2">Don't Wait Until It's Too Late</h3>
                <p className="text-sm mb-4">
                  Every day you delay is a day of lost value. Schedule your 
                  free succession planning consultation now.
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
            Protect Everything You've Built
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of business owners who are taking control of 
            their exit strategy and building lasting legacies.
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

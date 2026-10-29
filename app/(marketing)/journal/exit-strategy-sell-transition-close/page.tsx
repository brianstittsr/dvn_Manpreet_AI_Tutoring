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
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Exit Strategy: Sell, Transition, or Close? | AICenter4U",
  description:
    "Every business owner will exit eventually. The question is whether you'll do it on your terms or someone else's. Explore your options and discover the path that maximizes your legacy and wealth.",
  keywords: [
    "business exit strategy",
    "selling a business",
    "business transition",
    "exit planning",
    "business valuation",
    "legacy planning",
    "succession options",
  ],
  openGraph: {
    title: "Exit Strategy: Sell, Transition, or Close?",
    description:
      "Every business owner will exit eventually. The question is whether you'll do it on your terms or someone else's. Let's explore your options.",
    type: "article",
    publishedTime: "2025-11-28",
    authors: ["AICenter4U"],
    images: [
      {
        url: "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        width: 1260,
        height: 750,
        alt: "Business exit strategy planning",
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
          src="https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          alt="Business owner planning exit strategy"
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
              Exit Strategy: Sell, Transition, or Close?
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-gray-300">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                November 28, 2025
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                10 min read
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
              Every business owner will exit their business eventually. The 
              question is whether you'll do it on your terms—or someone else's. 
              Let's explore your options and discover the path that maximizes 
              both your wealth and your legacy.
            </p>

            <p className="text-lg leading-relaxed mb-6">
              You've spent years—maybe decades—building your business. You've 
              sacrificed weekends, missed family events, and poured your heart 
              and soul into creating something meaningful. Now it's time to 
              think about what comes next.
            </p>

            <p className="text-lg leading-relaxed mb-6">
              But here's the uncomfortable truth: most business owners don't 
              have an exit plan. They haven't thought through their options, 
              haven't prepared their business for transition, and haven't 
              positioned themselves to maximize value. When the time comes—
              whether by choice or circumstance—they're forced into reactive 
              mode, often leaving millions on the table.
            </p>

            <Card className="mb-10 border-amber-500/30 bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                    <HelpCircle className="h-6 w-6 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      What's Your Best Exit Path?
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Every business is unique, and every owner has different 
                      goals. Take our 5-minute Business Legacy Assessment to 
                      discover which exit strategy aligns best with your 
                      situation and how to prepare for maximum value.
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
              Your Three Exit Options
            </h2>

            <p className="text-lg leading-relaxed mb-8">
              When it comes to exiting your business, you essentially have three 
              paths. Each has pros and cons, and the right choice depends on your 
              goals, timeline, and what you've built.
            </p>

            {/* Option 1: Sell */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold">Option 1: Sell to a Third Party</h3>
              </div>

              <p className="text-lg leading-relaxed mb-4">
                Selling to an outside buyer—whether a strategic acquirer, private 
                equity firm, or competitor—can provide the highest financial return. 
                Strategic buyers often pay premiums for synergies, while financial 
                buyers look for strong cash flows and growth potential.
              </p>

              <h4 className="font-semibold mb-2">Pros:</h4>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Highest potential valuation and liquidity</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Clean break with no ongoing obligations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Access to resources for business growth</span>
                </li>
              </ul>

              <h4 className="font-semibold mb-2">Cons:</h4>
              <ul className="space-y-2 mb-4 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <span>Requires extensive preparation (2-5 years ideally)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <span>Loss of control over company culture and legacy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <span>Potential staff changes and restructuring</span>
                </li>
              </ul>

              <p className="text-muted-foreground italic">
                <strong>Best for:</strong> Owners seeking maximum financial return 
                and a clean exit, particularly those with businesses generating 
                $1M+ in annual profit.
              </p>
            </div>

            <Separator className="my-8" />

            {/* Option 2: Transition */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold">Option 2: Transition to Family or Employees</h3>
              </div>

              <p className="text-lg leading-relaxed mb-4">
                Passing the torch to family members or key employees preserves 
                your legacy and maintains continuity. This path requires careful 
                grooming of successors and often takes longer than a third-party 
                sale, but can be deeply fulfilling.
              </p>

              <h4 className="font-semibold mb-2">Pros:</h4>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Preserves company culture and values</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Maintains legacy and community relationships</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Potential tax advantages and gradual transition</span>
                </li>
              </ul>

              <h4 className="font-semibold mb-2">Cons:</h4>
              <ul className="space-y-2 mb-4 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <span>Lower valuation than third-party sale</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <span>Family dynamics can complicate decisions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <span>Requires 5-10+ years of succession planning</span>
                </li>
              </ul>

              <p className="text-muted-foreground italic">
                <strong>Best for:</strong> Owners who prioritize legacy preservation 
                and have capable, committed successors already in place.
              </p>
            </div>

            <Separator className="my-8" />

            {/* Option 3: Close */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-gray-600 rotate-180" />
                </div>
                <h3 className="text-2xl font-bold">Option 3: Close or Liquidate</h3>
              </div>

              <p className="text-lg leading-relaxed mb-4">
                While not ideal, closing or liquidating is sometimes the right 
                choice—particularly for businesses with significant challenges, 
                declining markets, or owners who need to exit quickly due to health 
                or personal circumstances.
              </p>

              <h4 className="font-semibold mb-2">When it makes sense:</h4>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Business has minimal transferable value</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Market conditions make sale unlikely</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Owner health or personal emergency requires immediate exit</span>
                </li>
              </ul>

              <p className="text-muted-foreground italic">
                <strong>Best for:</strong> Businesses with limited market value or 
                owners facing circumstances that prevent other exit options.
              </p>
            </div>

            <Separator className="my-8" />

            <h2 className="text-2xl font-bold mb-4">
              How to Prepare for Your Exit (Regardless of Which Path You Choose)
            </h2>

            <p className="text-lg leading-relaxed mb-6">
              No matter which exit strategy you pursue, preparation is the key 
              to maximizing value and ensuring a smooth transition. Here's what 
              every owner should do, starting now:
            </p>

            <div className="space-y-4 mb-8">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">1. Get a Professional Valuation</h4>
                <p className="text-muted-foreground">
                  You can't optimize what you don't measure. Understand your 
                  current value and the drivers that could increase it.
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">2. Reduce Owner Dependency</h4>
                <p className="text-muted-foreground">
                  The more the business depends on you, the less it's worth. 
                  Build systems and teams that can operate without you.
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">3. Clean Up Your Financials</h4>
                <p className="text-muted-foreground">
                  Ensure 3-5 years of clean, auditable financial statements. 
                  Eliminate personal expenses and questionable transactions.
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">4. Diversify Revenue Sources</h4>
                <p className="text-muted-foreground">
                  No customer should represent more than 10-15% of revenue. 
                  Concentration risk destroys valuation.
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">5. Document Everything</h4>
                <p className="text-muted-foreground">
                  Create standard operating procedures for all critical functions. 
                  A business that runs on systems is worth more.
                </p>
              </div>
            </div>

            <Card className="mb-10 bg-slate-900 text-white">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                    <Target className="h-6 w-6 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Ready to Plan Your Exit Strategy?
                    </h3>
                    <p className="text-gray-300 mb-4">
                      At AICenter4U, we've helped hundreds of business owners 
                      successfully navigate exits of all types. Whether you're 
                      considering a sale, family transition, or other path, we 
                      can help you maximize value and preserve your legacy. 
                      Schedule a free strategy call to start planning your exit 
                      on your terms.
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
              Your exit from your business is inevitable. The only question is 
              whether you'll be in control of how it happens—or whether 
              circumstances will force your hand. The owners who exit successfully 
              are the ones who start planning years in advance.
            </p>

            <p className="text-lg leading-relaxed mb-8">
              Don't wait for a health scare, burnout, or market shift to force 
              your decision. Start exploring your options today, and build a 
              business that gives you choices when the time comes.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                size="lg"
                asChild
              >
                <Link href="/schedule-a-call">
                  Plan Your Exit Strategy
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
                <h3 className="font-bold mb-2">Don't Leave Your Exit to Chance</h3>
                <p className="text-sm mb-4">
                  Every day you wait is a day of lost value. Schedule your 
                  free exit strategy consultation today.
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
            Exit on Your Terms. Preserve Your Legacy.
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of business owners who are taking control of their 
            exit strategy and building lasting legacies.
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

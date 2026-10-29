import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Calendar, Clock, User, Target, HelpCircle, CheckCircle, Lightbulb, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "From Founder to CEO: Making the Mindset Shift | CurioQuest",
  description: "Building a business requires one set of skills. Leading a business requires another. Here's how to make the transition successfully and scale beyond yourself.",
  keywords: ["founder to CEO", "mindset shift", "business leadership", "scaling business", "entrepreneur transition", "CEO mindset"],
  openGraph: {
    title: "From Founder to CEO: Making the Mindset Shift",
    description: "Building a business requires one set of skills. Leading a business requires another. Here's how to make the transition successfully.",
    type: "article",
    publishedTime: "2025-11-08",
    authors: ["CurioQuest"],
    images: [{ url: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", width: 1260, height: 750, alt: "Business leader at desk" }]
  }
};

export default function ArticlePage() {
  return (
    <article className="min-h-screen bg-white">
      <div className="relative h-[60vh] min-h-[500px] bg-slate-900">
        <Image src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Founder to CEO transition" fill className="object-cover opacity-60" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container pb-16">
            <Badge className="mb-4 bg-amber-500 text-slate-900">Leadership</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl mb-4">From Founder to CEO: Making the Mindset Shift</h1>
            <div className="flex flex-wrap items-center gap-6 text-gray-300">
              <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />November 8, 2025</span>
              <span className="flex items-center gap-2"><Clock className="h-4 w-4" />8 min read</span>
              <span className="flex items-center gap-2"><User className="h-4 w-4" />CurioQuest Team</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-16">
        <div className="grid lg:grid-cols-[1fr,320px] gap-12">
          <div className="max-w-3xl">
            <Link href="/journal" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8"><ArrowLeft className="h-4 w-4 mr-2" />Back to The Journal</Link>
            
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">Building a business requires one set of skills. Leading a business requires another. Here's how to make the transition successfully.</p>
            
            <p className="text-lg leading-relaxed mb-6">You started as a founder. You were the chief everything officer—sales, operations, customer service, bookkeeping. You wore every hat, solved every problem, and made every decision. That scrappy, do-it-all mindset got you here.</p>
            
            <p className="text-lg leading-relaxed mb-6">But it's also what's holding you back.</p>
            
            <p className="text-lg leading-relaxed mb-6">To scale your business, you must evolve from founder to CEO. This isn't just a title change—it's a complete mindset transformation. And most entrepreneurs never make it.</p>

            <Card className="mb-10 border-amber-500/30 bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shrink-0"><HelpCircle className="h-6 w-6 text-slate-900" /></div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Where Are You on the Founder-to-CEO Journey?</h3>
                    <p className="text-muted-foreground mb-4">Take our Business Legacy Assessment to discover your current leadership stage and what specific shifts you need to make to become the CEO your business needs.</p>
                    <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" asChild><Link href="/quiz">Take the Assessment<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <h2 className="text-2xl font-bold mb-6">The 5 Critical Mindset Shifts</h2>
            
            <div className="space-y-8 mb-10">
              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3"><Lightbulb className="h-6 w-6 text-amber-500" />1. From Doing to Deciding</h3>
                <p className="text-lg leading-relaxed mb-4">Founders do. CEOs decide. When you're doing the work, you're limited by your personal capacity. When you're making strategic decisions, you're limited only by your vision.</p>
                <p className="text-muted-foreground italic">The shift: Stop asking "How do I do this?" Start asking "Who should do this?" and "What outcome do we need?"</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3"><TrendingUp className="h-6 w-6 text-amber-500" />2. From Working IN to Working ON</h3>
                <p className="text-lg leading-relaxed mb-4">Founders get trapped working in the business—handling daily operations, solving immediate problems, managing crises. CEOs work on the business—designing systems, building culture, setting strategy.</p>
                <p className="text-muted-foreground italic">The shift: Schedule 2 hours daily for "on the business" work. Protect this time fiercely.</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3"><Users className="h-6 w-6 text-amber-500" />3. From Individual Contributor to Team Builder</h3>
                <p className="text-lg leading-relaxed mb-4">Your value as a founder comes from your personal output. Your value as a CEO comes from your team's output. The best CEOs multiply their impact through others.</p>
                <p className="text-muted-foreground italic">The shift: Measure your success by your team's results, not your personal accomplishments.</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3"><Target className="h-6 w-6 text-amber-500" />4. From Short-Term to Long-Term</h3>
                <p className="text-lg leading-relaxed mb-4">Founders live in the present—making payroll, closing deals, fighting fires. CEOs live in the future—building sustainable competitive advantages, developing talent, positioning for market shifts.</p>
                <p className="text-muted-foreground italic">The shift: Spend 30% of your time on initiatives that won't pay off for 6-12 months.</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3"><Scale className="h-6 w-6 text-amber-500" />5. From Control to Empowerment</h3>
                <p className="text-lg leading-relaxed mb-4">Founders control. CEOs empower. You can't scale if every decision runs through you. You must build systems and trust your team to execute.</p>
                <p className="text-muted-foreground italic">The shift: Identify 5 decisions you make weekly that someone else should own. Delegate them.</p>
              </div>
            </div>

            <Separator className="my-8" />

            <h2 className="text-2xl font-bold mb-4">Why Most Founders Never Become CEOs</h2>
            <p className="text-lg leading-relaxed mb-6">The founder-to-CEO transition is the most difficult evolution in business. It requires letting go of what made you successful and embracing discomfort. Many entrepreneurs resist this shift because:</p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3"><span className="text-red-500 font-bold">•</span><span><strong>Identity crisis:</strong> Being the "doer" is who you are. Being a strategist feels less tangible.</span></li>
              <li className="flex items-start gap-3"><span className="text-red-500 font-bold">•</span><span><strong>Imposter syndrome:</strong> You don't feel qualified to be a "CEO"—so you keep doing operational work.</span></li>
              <li className="flex items-start gap-3"><span className="text-red-500 font-bold">•</span><span><strong>Short-term pain:</strong> Delegation initially slows things down. It feels inefficient.</span></li>
              <li className="flex items-start gap-3"><span className="text-red-500 font-bold">•</span><span><strong>No model:</strong> You've never seen what great CEO leadership looks like.</span></li>
            </ul>

            <Card className="mb-10 bg-slate-900 text-white">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shrink-0"><TrendingUp className="h-6 w-6 text-slate-900" /></div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Ready to Make the Founder-to-CEO Shift?</h3>
                    <p className="text-gray-300 mb-4">At CurioQuest, we've guided hundreds of entrepreneurs through this exact transformation. We help you identify your specific mindset blocks, build the systems and team you need, and step fully into your role as CEO. Schedule a strategy call to start your transition.</p>
                    <div className="flex flex-wrap gap-4">
                      <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" asChild><Link href="/schedule-a-call">Schedule Your Strategy Call<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                      <Button variant="outline" className="border-white/30 hover:bg-white/10" asChild><Link href="/quiz">Take the Assessment First</Link></Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-4">
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" size="lg" asChild><Link href="/schedule-a-call">Become the CEO Your Business Needs<ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
              <Button variant="outline" size="lg" asChild><Link href="/quiz">Take the Business Assessment</Link></Button>
            </div>
          </div>

          <aside className="space-y-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Related Articles</h3>
                <div className="space-y-4">
                  <Link href="/journal/build-leadership-team-you-can-trust" className="block group"><p className="font-medium group-hover:text-amber-600">How to Build a Leadership Team You Can Trust</p><p className="text-sm text-muted-foreground">Leadership • 7 min read</p></Link>
                  <Separator />
                  <Link href="/journal/5-signs-business-would-collapse-without-you" className="block group"><p className="font-medium group-hover:text-amber-600">5 Signs Your Business Would Collapse Without You</p><p className="text-sm text-muted-foreground">Leadership • 8 min read</p></Link>
                  <Separator />
                  <Link href="/journal/90-day-business-transformation-blueprint" className="block group"><p className="font-medium group-hover:text-amber-600">The 90-Day Business Transformation Blueprint</p><p className="text-sm text-muted-foreground">Strategy • 9 min read</p></Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-slate-900">
              <CardContent className="p-6">
                <h3 className="font-bold mb-2">Start Your CEO Journey Today</h3>
                <p className="text-sm mb-4">The longer you wait, the harder it becomes. Schedule your free strategy call now.</p>
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white" asChild><Link href="/schedule-a-call">Book Your Call<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      <section className="py-16 bg-slate-50">
        <div className="container max-w-4xl text-center">
          <h2 className="text-2xl font-bold mb-4">Transform From Founder to CEO</h2>
          <p className="text-muted-foreground mb-8">Join hundreds of entrepreneurs who have made the mindset shift and scaled their businesses beyond what they thought possible.</p>
          <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" size="lg" asChild><Link href="/schedule-a-call">Schedule Your Free Strategy Call<ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
        </div>
      </section>
    </article>
  );
}

function Users({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function Scale({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10" />
      <path d="M12 3v18" />
      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
  );
}

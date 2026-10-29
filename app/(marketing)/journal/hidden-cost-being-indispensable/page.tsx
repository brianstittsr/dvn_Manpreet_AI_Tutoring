import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Calendar, Clock, User, Target, HelpCircle, AlertTriangle, DollarSign, Clock3 } from "lucide-react";

export const metadata: Metadata = {
  title: "The Hidden Cost of Being Indispensable | CurioQuest",
  description: "Being the go-to person for everything feels good—until it doesn't. Here's why being indispensable is actually holding you back and costing you your freedom.",
  keywords: ["indispensable trap", "owner dependency", "delegation", "business owner burnout", "scalable business", "letting go"],
  openGraph: {
    title: "The Hidden Cost of Being Indispensable",
    description: "Being the go-to person for everything feels good—until it doesn't. Here's why being indispensable is actually holding you back.",
    type: "article",
    publishedTime: "2025-10-25",
    authors: ["CurioQuest"],
    images: [{ url: "https://images.pexels.com/photos/3182759/pexels-photo-3182759.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", width: 1260, height: 750, alt: "Overwhelmed business owner" }]
  }
};

export default function ArticlePage() {
  return (
    <article className="min-h-screen bg-white">
      <div className="relative h-[60vh] min-h-[500px] bg-slate-900">
        <Image src="https://images.pexels.com/photos/3182759/pexels-photo-3182759.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Overwhelmed business owner" fill className="object-cover opacity-60" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container pb-16">
            <Badge className="mb-4 bg-amber-500 text-slate-900">Operations</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl mb-4">The Hidden Cost of Being Indispensable</h1>
            <div className="flex flex-wrap items-center gap-6 text-gray-300">
              <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />October 25, 2025</span>
              <span className="flex items-center gap-2"><Clock className="h-4 w-4" />5 min read</span>
              <span className="flex items-center gap-2"><User className="h-4 w-4" />CurioQuest Team</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-16">
        <div className="grid lg:grid-cols-[1fr,320px] gap-12">
          <div className="max-w-3xl">
            <Link href="/journal" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8"><ArrowLeft className="h-4 w-4 mr-2" />Back to The Journal</Link>
            
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">Being the go-to person for everything feels good—until it doesn't. Here's why being indispensable is actually holding you back and costing you your freedom.</p>
            
            <p className="text-lg leading-relaxed mb-6">It starts innocently enough. You're the founder. You know everything about the business. People come to you with questions, and you have answers. Solving problems feels good. Being needed feels important.</p>
            
            <p className="text-lg leading-relaxed mb-6">But slowly, almost imperceptibly, you become trapped. The business can't function without you. Every decision requires your input. Your phone buzzes constantly. Your "vacations" are just working from different locations.</p>

            <p className="text-lg leading-relaxed mb-6">You've built yourself a very expensive prison.</p>

            <Card className="mb-10 border-amber-500/30 bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shrink-0"><HelpCircle className="h-6 w-6 text-slate-900" /></div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Is Your Business Trapping You?</h3>
                    <p className="text-muted-foreground mb-4">Take our Business Legacy Assessment to discover how dependent your business is on you—and what steps you need to take to reclaim your freedom.</p>
                    <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" asChild><Link href="/quiz">Take the Assessment<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <h2 className="text-2xl font-bold mb-6">The Real Costs of Being Indispensable</h2>
            
            <div className="space-y-8 mb-10">
              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3"><DollarSign className="h-6 w-6 text-red-500" />1. Financial Cost: Lower Business Valuation</h3>
                <p className="text-lg leading-relaxed mb-4">When your business depends on you, it's worth less. Much less. Buyers discount—or walk away from—businesses that can't operate without the founder. You might be leaving millions on the table when it's time to exit.</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3"><Clock3 className="h-6 w-6 text-red-500" />2. Time Cost: No Real Freedom</h3>
                <p className="text-lg leading-relaxed mb-4">You didn't start a business to work 80-hour weeks indefinitely. But that's exactly what indispensability requires. You can't take real vacations. You can't unplug. You're always on call.</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3"><AlertTriangle className="h-6 w-6 text-red-500" />3. Risk Cost: Single Point of Failure</h3>
                <p className="text-lg leading-relaxed mb-4">What happens if you get sick? Have a family emergency? Want to retire? If everything depends on you, any disruption becomes a crisis.</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3"><TrendingDown className="h-6 w-6 text-red-500" />4. Growth Cost: The Ceiling</h3>
                <p className="text-lg leading-relaxed mb-4">Your business can only grow as much as you can personally handle. Once you hit your capacity ceiling, growth stops. The only way to break through is to become dispensable.</p>
              </div>
            </div>

            <Separator className="my-8" />

            <h2 className="text-2xl font-bold mb-4">The Paradox: You Must Become Dispensable to Scale</h2>
            <p className="text-lg leading-relaxed mb-6">Here's the counterintuitive truth: your goal should be to make yourself completely unnecessary to the day-to-day operations of your business. Not less involved—unnecessary.</p>
            
            <p className="text-lg leading-relaxed mb-6">This doesn't mean abandoning your business. It means elevating your role from operator to owner. From doing the work to designing the systems that do the work. From solving problems to preventing them.</p>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 my-8">
              <p className="font-semibold text-amber-900 mb-2">The Mindset Shift</p>
              <p className="text-amber-800">Your value isn't in what you do—it's in what you build that others can do.</p>
            </div>

            <h2 className="text-2xl font-bold mb-4">How to Become Dispensable (The Right Way)</h2>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3"><CheckCircle className="h-6 w-6 text-green-500 shrink-0 mt-0.5" /><span className="text-lg"><strong>Document everything:</strong> Turn your knowledge into written procedures anyone can follow.</span></li>
              <li className="flex items-start gap-3"><CheckCircle className="h-6 w-6 text-green-500 shrink-0 mt-0.5" /><span className="text-lg"><strong>Hire people smarter than you:</strong> Stop trying to be the expert in everything.</span></li>
              <li className="flex items-start gap-3"><CheckCircle className="h-6 w-6 text-green-500 shrink-0 mt-0.5" /><span className="text-lg"><strong>Delegate decisions, not just tasks:</strong> Give people authority, not just assignments.</span></li>
              <li className="flex items-start gap-3"><CheckCircle className="h-6 w-6 text-green-500 shrink-0 mt-0.5" /><span className="text-lg"><strong>Build systems, not dependencies:</strong> Create processes that work without you.</span></li>
            </ul>

            <Card className="mb-10 bg-slate-900 text-white">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shrink-0"><Target className="h-6 w-6 text-slate-900" /></div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Ready to Break Free?</h3>
                    <p className="text-gray-300 mb-4">At CurioQuest, we help business owners escape the indispensability trap. We guide you through systematically building systems, teams, and processes that free you from day-to-day operations—without sacrificing business performance.</p>
                    <div className="flex flex-wrap gap-4">
                      <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" asChild><Link href="/schedule-a-call">Reclaim Your Freedom<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                      <Button variant="outline" className="border-white/30 hover:bg-white/10" asChild><Link href="/quiz">Take the Assessment First</Link></Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-4">
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" size="lg" asChild><Link href="/schedule-a-call">Break Free from the Trap<ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
              <Button variant="outline" size="lg" asChild><Link href="/quiz">Take the Business Assessment</Link></Button>
            </div>
          </div>

          <aside className="space-y-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Related Articles</h3>
                <div className="space-y-4">
                  <Link href="/journal/5-signs-business-would-collapse-without-you" className="block group"><p className="font-medium group-hover:text-amber-600">5 Signs Your Business Would Collapse Without You</p><p className="text-sm text-muted-foreground">Leadership • 8 min read</p></Link>
                  <Separator />
                  <Link href="/journal/build-leadership-team-you-can-trust" className="block group"><p className="font-medium group-hover:text-amber-600">Build a Leadership Team You Can Trust</p><p className="text-sm text-muted-foreground">Leadership • 7 min read</p></Link>
                  <Separator />
                  <Link href="/journal/founder-to-ceo-mindset-shift" className="block group"><p className="font-medium group-hover:text-amber-600">From Founder to CEO: Making the Mindset Shift</p><p className="text-sm text-muted-foreground">Leadership • 8 min read</p></Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-slate-900">
              <CardContent className="p-6">
                <h3 className="font-bold mb-2">Regain Your Freedom</h3>
                <p className="text-sm mb-4">Stop being a prisoner to your business. Schedule your free strategy call today.</p>
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white" asChild><Link href="/schedule-a-call">Book Your Call<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      <section className="py-16 bg-slate-50">
        <div className="container max-w-4xl text-center">
          <h2 className="text-2xl font-bold mb-4">Break Free. Build a Business That Works Without You.</h2>
          <p className="text-muted-foreground mb-8">Join business owners who have escaped the indispensability trap and reclaimed their time, freedom, and peace of mind.</p>
          <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" size="lg" asChild><Link href="/schedule-a-call">Schedule Your Free Strategy Call<ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
        </div>
      </section>
    </article>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function TrendingDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  );
}

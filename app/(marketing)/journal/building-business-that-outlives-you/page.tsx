import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Calendar, Clock, User, Target, HelpCircle, Heart, Building2, TreePine } from "lucide-react";

export const metadata: Metadata = {
  title: "Building a Business That Outlives You | AICenter4U",
  description: "Legacy isn't about what you accumulate—it's about what you leave behind. Here's how to build a business that endures for generations.",
  keywords: ["business legacy", "generational business", "long term business", "business endurance", "legacy planning", "business that lasts"],
  openGraph: {
    title: "Building a Business That Outlives You",
    description: "Legacy isn't about what you accumulate—it's about what you leave behind. Here's how to build a business that endures for generations.",
    type: "article",
    publishedTime: "2025-11-01",
    authors: ["AICenter4U"],
    images: [{ url: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", width: 1260, height: 750, alt: "Strong foundation building" }]
  }
};

export default function ArticlePage() {
  return (
    <article className="min-h-screen bg-white">
      <div className="relative h-[60vh] min-h-[500px] bg-slate-900">
        <Image src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Building lasting legacy" fill className="object-cover opacity-60" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container pb-16">
            <Badge className="mb-4 bg-amber-500 text-slate-900">Legacy</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl mb-4">Building a Business That Outlives You</h1>
            <div className="flex flex-wrap items-center gap-6 text-gray-300">
              <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />November 1, 2025</span>
              <span className="flex items-center gap-2"><Clock className="h-4 w-4" />7 min read</span>
              <span className="flex items-center gap-2"><User className="h-4 w-4" />AICenter4U Team</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-16">
        <div className="grid lg:grid-cols-[1fr,320px] gap-12">
          <div className="max-w-3xl">
            <Link href="/journal" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8"><ArrowLeft className="h-4 w-4 mr-2" />Back to The Journal</Link>
            
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">Legacy isn't about what you accumulate—it's about what you leave behind. Here's how to build a business that endures for generations.</p>
            
            <p className="text-lg leading-relaxed mb-6">Most business owners think about legacy in terms of wealth—how much money they'll pass to their children, the properties they'll own, the accounts they'll leave behind. But true legacy is different.</p>
            
            <p className="text-lg leading-relaxed mb-6">Real legacy is building something that continues to create value long after you're gone. It's creating opportunities for people you'll never meet. It's building systems, culture, and purpose that outlast any single person.</p>

            <p className="text-lg leading-relaxed mb-6">The question isn't "How much can I extract from this business?" The question is "What can I build that will endure?"</p>

            <Card className="mb-10 border-amber-500/30 bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shrink-0"><Heart className="h-6 w-6 text-slate-900" /></div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">What Legacy Are You Building?</h3>
                    <p className="text-muted-foreground mb-4">Take our Business Legacy Assessment to discover what kind of legacy your business is currently positioned to create—and how to build something truly enduring.</p>
                    <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" asChild><Link href="/quiz">Take the Assessment<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <h2 className="text-2xl font-bold mb-6">The Four Pillars of an Enduring Business</h2>
            
            <div className="space-y-8 mb-10">
              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-3"><Building2 className="h-6 w-6 text-amber-500" />1. Purpose Beyond Profit</h3>
                <p className="text-lg leading-relaxed mb-4">Businesses built only to make money don't inspire loyalty. They don't attract the best talent. They don't create raving fans. But businesses built around a genuine purpose—the desire to solve real problems, serve real people, make a real difference—become movements.</p>
                <p className="text-muted-foreground">Ask yourself: If profit were guaranteed, what would we still do? That's your purpose.</p>
              </div>

              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-3"><TreePine className="h-6 w-6 text-amber-500" />2. Culture That Transcends People</h3>
                <p className="text-lg leading-relaxed mb-4">Great culture isn't about ping-pong tables or free snacks. It's about shared values that guide decisions when no one is watching. It's about how you treat people, how you handle failure, how you celebrate success.</p>
                <p className="text-muted-foreground">Document your values. Hire for them. Fire for violating them. Make culture your competitive advantage.</p>
              </div>

              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-3"><Target className="h-6 w-6 text-amber-500" />3. Systems That Survive Turnover</h3>
                <p className="text-lg leading-relaxed mb-4">Tribal knowledge dies when people leave. Documented systems endure. The businesses that last are the ones where key processes exist independently of any single person.</p>
                <p className="text-muted-foreground">Every critical function should have written procedures, training programs, and quality standards.</p>
              </div>

              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-3"><Users2 className="h-6 w-6 text-amber-500" />4. Leaders Who Carry the Torch</h3>
                <p className="text-lg leading-relaxed mb-4">Your legacy lives or dies with your leadership team. Are you developing people who believe in the mission? Who can make decisions aligned with your values? Who will continue building when you're not there?</p>
                <p className="text-muted-foreground">Invest in leadership development. Your legacy depends on the people you develop, not just the wealth you accumulate.</p>
              </div>
            </div>

            <Separator className="my-8" />

            <h2 className="text-2xl font-bold mb-4">The Wealth vs. Legacy Mindset</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="border-red-200">
                <CardContent className="p-6">
                  <h3 className="font-bold text-red-700 mb-3">Wealth-Only Mindset</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Maximize short-term extraction</li>
                    <li>• Keep knowledge and power centralized</li>
                    <li>• Build around personal brand</li>
                    <li>• Exit strategy: sell and walk away</li>
                    <li>• Business dies or declines after exit</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <h3 className="font-bold text-green-700 mb-3">Legacy Mindset</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Build sustainable value creation</li>
                    <li>• Distribute knowledge and authority</li>
                    <li>• Build around shared purpose</li>
                    <li>• Exit strategy: ensure continuity</li>
                    <li>• Business thrives for generations</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <p className="text-lg leading-relaxed mb-6">Here's the beautiful irony: businesses built for legacy often create more wealth than those built only for profit. Why? Because purpose attracts talent. Systems create efficiency. Culture drives retention. These are the ingredients of sustainable competitive advantage.</p>

            <Card className="mb-10 bg-slate-900 text-white">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shrink-0"><TreePine className="h-6 w-6 text-slate-900" /></div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Ready to Build Something That Lasts?</h3>
                    <p className="text-gray-300 mb-4">At AICenter4U, we help business owners transform their companies from personal operations into enduring institutions. We guide you through building the systems, culture, and leadership team that will carry your vision forward for generations.</p>
                    <div className="flex flex-wrap gap-4">
                      <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" asChild><Link href="/schedule-a-call">Start Building Your Legacy<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                      <Button variant="outline" className="border-white/30 hover:bg-white/10" asChild><Link href="/quiz">Take the Assessment First</Link></Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-4">
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" size="lg" asChild><Link href="/schedule-a-call">Build Your Lasting Legacy<ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
              <Button variant="outline" size="lg" asChild><Link href="/quiz">Take the Business Assessment</Link></Button>
            </div>
          </div>

          <aside className="space-y-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Related Articles</h3>
                <div className="space-y-4">
                  <Link href="/journal/succession-planning-checklist" className="block group"><p className="font-medium group-hover:text-amber-600">The Succession Planning Checklist</p><p className="text-sm text-muted-foreground">Succession • 6 min read</p></Link>
                  <Separator />
                  <Link href="/journal/exit-strategy-sell-transition-close" className="block group"><p className="font-medium group-hover:text-amber-600">Exit Strategy: Sell, Transition, or Close?</p><p className="text-sm text-muted-foreground">Succession • 10 min read</p></Link>
                  <Separator />
                  <Link href="/journal/build-leadership-team-you-can-trust" className="block group"><p className="font-medium group-hover:text-amber-600">Build a Leadership Team You Can Trust</p><p className="text-sm text-muted-foreground">Leadership • 7 min read</p></Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-slate-900">
              <CardContent className="p-6">
                <h3 className="font-bold mb-2">Build Something That Matters</h3>
                <p className="text-sm mb-4">Your legacy starts with a single decision. Schedule your free strategy call today.</p>
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white" asChild><Link href="/schedule-a-call">Book Your Call<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      <section className="py-16 bg-slate-50">
        <div className="container max-w-4xl text-center">
          <h2 className="text-2xl font-bold mb-4">Leave a Legacy That Endures</h2>
          <p className="text-muted-foreground mb-8">Join business owners who are building more than wealth—they're building institutions that will impact generations.</p>
          <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" size="lg" asChild><Link href="/schedule-a-call">Schedule Your Free Strategy Call<ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
        </div>
      </section>
    </article>
  );
}

function Users2({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 21a8 8 0 0 0-16 0" />
      <circle cx="10" cy="8" r="5" />
      <path d="M22 20c0-3.37-2-6.5-5-8" />
      <path d="M17 20c0-3.37-2-6.5-5-8" />
    </svg>
  );
}

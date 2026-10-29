import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Calendar, Clock, User, Target, HelpCircle, CheckCircle, Rocket } from "lucide-react";

export const metadata: Metadata = {
  title: "The 90-Day Business Transformation Blueprint | CurioQuest",
  description: "Real change doesn't take years—it takes focus. Here's our proven framework for achieving measurable results in just 90 days.",
  keywords: ["business transformation", "90 day plan", "business growth", "strategic planning", "business turnaround", "rapid growth strategy"],
  openGraph: {
    title: "The 90-Day Business Transformation Blueprint",
    description: "Real change doesn't take years—it takes focus. Here's our proven framework for achieving measurable results in just 90 days.",
    type: "article",
    publishedTime: "2025-11-20",
    authors: ["CurioQuest"],
    images: [{ url: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", width: 1260, height: 750, alt: "Business team celebrating success" }]
  }
};

export default function ArticlePage() {
  return (
    <article className="min-h-screen bg-white">
      <div className="relative h-[60vh] min-h-[500px] bg-slate-900">
        <Image src="https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Business transformation success" fill className="object-cover opacity-60" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container pb-16">
            <Badge className="mb-4 bg-amber-500 text-slate-900">Strategy</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl mb-4">The 90-Day Business Transformation Blueprint</h1>
            <div className="flex flex-wrap items-center gap-6 text-gray-300">
              <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />November 20, 2025</span>
              <span className="flex items-center gap-2"><Clock className="h-4 w-4" />9 min read</span>
              <span className="flex items-center gap-2"><User className="h-4 w-4" />CurioQuest Team</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-16">
        <div className="grid lg:grid-cols-[1fr,320px] gap-12">
          <div className="max-w-3xl">
            <Link href="/journal" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8"><ArrowLeft className="h-4 w-4 mr-2" />Back to The Journal</Link>
            
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">Real change doesn't take years—it takes focus. Here's our proven framework for achieving measurable results in just 90 days.</p>
            
            <p className="text-lg leading-relaxed mb-6">Most business owners believe transformation takes years. They've been sold the myth that meaningful change requires massive time investments. But here's the truth: What most businesses need isn't more time—it's more focus.</p>
            
            <p className="text-lg leading-relaxed mb-6">In 90 days, you can completely transform how your business operates. You can implement systems that scale, build a leadership team that performs, and create the foundation for sustainable growth. The key is knowing exactly what to focus on and in what order.</p>

            <Card className="mb-10 border-amber-500/30 bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shrink-0"><HelpCircle className="h-6 w-6 text-slate-900" /></div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Ready for Your 90-Day Transformation?</h3>
                    <p className="text-muted-foreground mb-4">Take our Business Legacy Assessment to identify your biggest opportunities for rapid improvement and get a customized 90-day action plan.</p>
                    <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" asChild><Link href="/quiz">Take the Assessment<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <h2 className="text-2xl font-bold mb-6">The 90-Day Framework: Three 30-Day Sprints</h2>
            
            <div className="space-y-8 mb-10">
              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-3"><span className="w-10 h-10 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold">1</span>Days 1-30: Assess & Align</h3>
                <p className="text-lg mb-4">The first 30 days are about getting crystal clear on where you are and where you're going. This isn't about making changes yet—it's about understanding what needs to change.</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" /><span>Complete business diagnostic (financials, operations, team, systems)</span></li>
                  <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" /><span>Define your 90-day transformation goals (be specific and measurable)</span></li>
                  <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" /><span>Identify the 3 biggest bottlenecks holding you back</span></li>
                  <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" /><span>Align your leadership team around the vision</span></li>
                </ul>
              </div>

              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-3"><span className="w-10 h-10 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold">2</span>Days 31-60: Build & Implement</h3>
                <p className="text-lg mb-4">Now it's time to build. This is where you create the systems, processes, and structures that will transform your business.</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" /><span>Document core processes (sales, operations, customer service)</span></li>
                  <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" /><span>Implement key systems (project management, CRM, financial tracking)</span></li>
                  <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" /><span>Delegate decision-making authority to your leadership team</span></li>
                  <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" /><span>Establish weekly check-ins and accountability structures</span></li>
                </ul>
              </div>

              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-3"><span className="w-10 h-10 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold">3</span>Days 61-90: Optimize & Scale</h3>
                <p className="text-lg mb-4">The final 30 days are about optimizing what you've built and preparing for sustained growth.</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" /><span>Refine processes based on real-world feedback</span></li>
                  <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" /><span>Train team members on new systems</span></li>
                  <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" /><span>Measure results against your 90-day goals</span></li>
                  <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" /><span>Plan your next 90-day sprint</span></li>
                </ul>
              </div>
            </div>

            <Separator className="my-8" />

            <h2 className="text-2xl font-bold mb-4">The Transformation Results You Can Expect</h2>
            <p className="text-lg leading-relaxed mb-6">When you follow this framework with discipline, here's what typically happens in 90 days:</p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <Card><CardContent className="p-4"><p className="font-semibold text-green-600">20-30% increase in operational efficiency</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="font-semibold text-green-600">50% reduction in owner-involved decisions</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="font-semibold text-green-600">Clear documented processes for all key functions</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="font-semibold text-green-600">Leadership team empowered and aligned</p></CardContent></Card>
            </div>

            <Card className="mb-10 bg-slate-900 text-white">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shrink-0"><Rocket className="h-6 w-6 text-slate-900" /></div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Ready to Transform Your Business in 90 Days?</h3>
                    <p className="text-gray-300 mb-4">At CurioQuest, we've guided hundreds of business owners through successful 90-day transformations. Our proven methodology helps you achieve in 3 months what might otherwise take 3 years.</p>
                    <div className="flex flex-wrap gap-4">
                      <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" asChild><Link href="/schedule-a-call">Start Your 90-Day Transformation<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                      <Button variant="outline" className="border-white/30 hover:bg-white/10" asChild><Link href="/quiz">Take the Assessment First</Link></Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-4">
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" size="lg" asChild><Link href="/schedule-a-call">Schedule Your Strategy Call<ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
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
                  <Link href="/journal/hidden-cost-being-indispensable" className="block group"><p className="font-medium group-hover:text-amber-600">The Hidden Cost of Being Indispensable</p><p className="text-sm text-muted-foreground">Operations • 5 min read</p></Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-slate-900">
              <CardContent className="p-6">
                <h3 className="font-bold mb-2">Start Your Transformation Today</h3>
                <p className="text-sm mb-4">Every day you wait is a day of lost momentum. Schedule your free strategy call now.</p>
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white" asChild><Link href="/schedule-a-call">Book Your Call<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      <section className="py-16 bg-slate-50">
        <div className="container max-w-4xl text-center">
          <h2 className="text-2xl font-bold mb-4">Transform Your Business in 90 Days</h2>
          <p className="text-muted-foreground mb-8">Join hundreds of business owners who have achieved dramatic results in just 90 days.</p>
          <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" size="lg" asChild><Link href="/schedule-a-call">Schedule Your Free Strategy Call<ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
        </div>
      </section>
    </article>
  );
}

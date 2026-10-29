import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Calendar, Clock, User, Target, HelpCircle, CheckCircle, XCircle, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "Why Most Business Coaches Fail (And How to Find One That Works) | AICenter4U",
  description: "The coaching industry is full of promises. Here's how to separate the real deal from the pretenders and find a coach who delivers results.",
  keywords: ["business coach", "coaching industry", "find a business coach", "coaching results", "business mentoring", "executive coaching"],
  openGraph: {
    title: "Why Most Business Coaches Fail (And How to Find One That Works)",
    description: "The coaching industry is full of promises. Here's how to separate the real deal from the pretenders and find a coach who delivers results.",
    type: "article",
    publishedTime: "2025-11-15",
    authors: ["AICenter4U"],
    images: [{ url: "https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", width: 1260, height: 750, alt: "Business coaching session" }]
  }
};

export default function ArticlePage() {
  return (
    <article className="min-h-screen bg-white">
      <div className="relative h-[60vh] min-h-[500px] bg-slate-900">
        <Image src="https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Business coaching" fill className="object-cover opacity-60" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container pb-16">
            <Badge className="mb-4 bg-amber-500 text-slate-900">Business</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl mb-4">Why Most Business Coaches Fail (And How to Find One That Works)</h1>
            <div className="flex flex-wrap items-center gap-6 text-gray-300">
              <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />November 15, 2025</span>
              <span className="flex items-center gap-2"><Clock className="h-4 w-4" />6 min read</span>
              <span className="flex items-center gap-2"><User className="h-4 w-4" />AICenter4U Team</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-16">
        <div className="grid lg:grid-cols-[1fr,320px] gap-12">
          <div className="max-w-3xl">
            <Link href="/journal" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8"><ArrowLeft className="h-4 w-4 mr-2" />Back to The Journal</Link>
            
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">The coaching industry is full of promises. Here's how to separate the real deal from the pretenders and find a coach who actually delivers results.</p>
            
            <p className="text-lg leading-relaxed mb-6">You've probably seen the ads: "Scale to 7 figures!" "Work less, earn more!" "Transform your business in 30 days!" The business coaching industry has exploded, and with it, a flood of self-proclaimed experts promising miracles.</p>
            
            <p className="text-lg leading-relaxed mb-6">Here's the uncomfortable truth: most business coaching fails. Not because coaching doesn't work—it absolutely can—but because most coaches aren't qualified to do it.</p>

            <Card className="mb-10 border-amber-500/30 bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shrink-0"><HelpCircle className="h-6 w-6 text-slate-900" /></div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Is Coaching Right for Your Business?</h3>
                    <p className="text-muted-foreground mb-4">Take our Business Legacy Assessment to identify your specific challenges and discover whether coaching—or another approach—is what your business needs right now.</p>
                    <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" asChild><Link href="/quiz">Take the Assessment<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <h2 className="text-2xl font-bold mb-6">The 5 Reasons Most Business Coaches Fail</h2>
            
            <div className="space-y-6 mb-10">
              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3"><XCircle className="h-6 w-6 text-red-500" />1. They've Never Actually Built a Business</h3>
                <p className="text-lg leading-relaxed mb-4">This is the dirty secret of the coaching industry: many coaches have never built, scaled, or exited a real business. They've read books, taken courses, and gotten certifications—but they've never sat in your seat.</p>
                <p className="text-muted-foreground">Would you take fitness advice from someone who's never worked out? Then why take business advice from someone who's never built one?</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3"><XCircle className="h-6 w-6 text-red-500" />2. They Use Cookie-Cutter Playbooks</h3>
                <p className="text-lg leading-relaxed mb-4">Your business is unique. Your challenges are unique. Your goals are unique. Yet most coaches apply the same generic framework to every client, regardless of industry, size, or situation.</p>
                <p className="text-muted-foreground">Real transformation requires custom solutions, not off-the-shelf programs.</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3"><XCircle className="h-6 w-6 text-red-500" />3. They Focus on Motivation, Not Mechanics</h3>
                <p className="text-lg leading-relaxed mb-4">Motivation feels good in the moment, but it doesn't build systems. It doesn't document processes. It doesn't create financial controls. You need someone who can teach you the mechanics of running a scalable business.</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3"><XCircle className="h-6 w-6 text-red-500" />4. They Can't Prove Results</h3>
                <p className="text-lg leading-relaxed mb-4">Ask a coach for specific, measurable results their clients have achieved. Most will give you vague testimonials or quote revenue numbers without context. Real coaches track and can prove ROI.</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3"><XCircle className="h-6 w-6 text-red-500" />5. They Promise Quick Fixes</h3>
                <p className="text-lg leading-relaxed mb-4">Real business transformation takes time. Anyone promising you'll "10X your revenue in 90 days" is either lying or planning to teach you unethical tactics that won't last.</p>
              </div>
            </div>

            <Separator className="my-8" />

            <h2 className="text-2xl font-bold mb-6">How to Find a Coach Who Actually Works</h2>
            
            <div className="space-y-6 mb-10">
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3"><CheckCircle className="h-6 w-6 text-green-600" />1. Look for Real-World Experience</h3>
                <p className="text-muted-foreground">Your coach should have built and scaled actual businesses. Ask about their track record, their exits, their failures. Real experience includes setbacks and lessons learned the hard way.</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3"><CheckCircle className="h-6 w-6 text-green-600" />2. Demand Customized Solutions</h3>
                <p className="text-muted-foreground">Beware of coaches selling pre-packaged programs. Look for someone who does deep diagnostic work upfront and builds a custom roadmap for your specific situation.</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3"><CheckCircle className="h-6 w-6 text-green-600" />3. Insist on Measurable Outcomes</h3>
                <p className="text-muted-foreground">Before you start, define what success looks like. Set specific, measurable goals. A good coach will hold you accountable to real metrics, not just "feeling better about your business."</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3"><CheckCircle className="h-6 w-6 text-green-600" />4. Check References (The Right Way)</h3>
                <p className="text-muted-foreground">Don't just read testimonials. Ask to speak with current and past clients. Ask specifically about results achieved and challenges faced. A coach with nothing to hide will gladly connect you.</p>
              </div>
            </div>

            <Card className="mb-10 bg-slate-900 text-white">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shrink-0"><Award className="h-6 w-6 text-slate-900" /></div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">A Different Approach to Business Growth</h3>
                    <p className="text-gray-300 mb-4">At AICenter4U, we don't call ourselves coaches—we're business transformation partners. We've built, scaled, and exited real businesses. We create custom strategies based on deep diagnostic work. And we measure our success by your measurable results.</p>
                    <div className="flex flex-wrap gap-4">
                      <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" asChild><Link href="/schedule-a-call">See If We're the Right Fit<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                      <Button variant="outline" className="border-white/30 hover:bg-white/10" asChild><Link href="/quiz">Take the Assessment First</Link></Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-4">
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" size="lg" asChild><Link href="/schedule-a-call">Find the Right Business Partner<ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
              <Button variant="outline" size="lg" asChild><Link href="/quiz">Take the Business Assessment</Link></Button>
            </div>
          </div>

          <aside className="space-y-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Related Articles</h3>
                <div className="space-y-4">
                  <Link href="/journal/90-day-business-transformation-blueprint" className="block group"><p className="font-medium group-hover:text-amber-600">The 90-Day Business Transformation Blueprint</p><p className="text-sm text-muted-foreground">Strategy • 9 min read</p></Link>
                  <Separator />
                  <Link href="/journal/founder-to-ceo-mindset-shift" className="block group"><p className="font-medium group-hover:text-amber-600">From Founder to CEO: Making the Mindset Shift</p><p className="text-sm text-muted-foreground">Leadership • 8 min read</p></Link>
                  <Separator />
                  <Link href="/journal/5-signs-business-would-collapse-without-you" className="block group"><p className="font-medium group-hover:text-amber-600">5 Signs Your Business Would Collapse Without You</p><p className="text-sm text-muted-foreground">Leadership • 8 min read</p></Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-slate-900">
              <CardContent className="p-6">
                <h3 className="font-bold mb-2">Stop Wasting Time on Bad Coaching</h3>
                <p className="text-sm mb-4">Discover the real results you can achieve with the right business partner.</p>
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white" asChild><Link href="/schedule-a-call">Book Your Call<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      <section className="py-16 bg-slate-50">
        <div className="container max-w-4xl text-center">
          <h2 className="text-2xl font-bold mb-4">Find a Business Partner Who Delivers Results</h2>
          <p className="text-muted-foreground mb-8">Stop wasting money on coaching that doesn't work. Let's build something real together.</p>
          <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" size="lg" asChild><Link href="/schedule-a-call">Schedule Your Free Strategy Call<ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
        </div>
      </section>
    </article>
  );
}

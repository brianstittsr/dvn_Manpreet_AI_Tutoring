"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Clock, 
  Target, 
  Lightbulb, 
  TrendingUp,
  CheckCircle,
  Users,
  Settings,
  ArrowRightLeft
} from "lucide-react";

const quizBenefits = [
  {
    icon: Target,
    title: "Identify Your Gaps",
    description: "Discover what's holding your business back from reaching its full potential.",
  },
  {
    icon: Lightbulb,
    title: "Get Personalized Insights",
    description: "Receive actionable recommendations tailored to your specific situation.",
  },
  {
    icon: TrendingUp,
    title: "Create Your Roadmap",
    description: "Understand the next steps to build a business that outlasts you.",
  },
];

const quizAreas = [
  { icon: Target, label: "Strategic Clarity" },
  { icon: Users, label: "Leadership Effectiveness" },
  { icon: Settings, label: "Operational Efficiency" },
  { icon: ArrowRightLeft, label: "Succession Readiness" },
];

export default function QuizIntroPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-amber-500/50 text-amber-600">
              Free 2-Minute Assessment
            </Badge>
            
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
              Discover Your{" "}
              <span className="text-amber-500">Legacy Growth IQ™</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Find out what's holding your business back—and get a personalized roadmap 
              to grow with purpose, build your team, and create a lasting legacy.
            </p>

            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-10">
              <Clock className="h-5 w-5" />
              <span>Takes only 2 minutes</span>
              <span className="mx-2">•</span>
              <span>100% Free</span>
              <span className="mx-2">•</span>
              <span>Instant Results</span>
            </div>

            <Button 
              size="lg" 
              className="text-lg px-10 py-6 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
              asChild
            >
              <Link href="/quiz">
                Start the Quiz Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* What You'll Learn Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              What You'll Discover
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {quizBenefits.map((benefit) => (
                <Card key={benefit.title} className="border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="h-7 w-7 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quiz Areas Section */}
      <section className="py-16 bg-slate-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              The Quiz Covers 4 Key Areas
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Our assessment evaluates the critical dimensions of business growth and legacy building.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {quizAreas.map((area) => (
                <div key={area.label} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center mx-auto mb-3">
                    <area.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="font-medium">{area.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What Happens Next Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              What Happens After the Quiz?
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Get Your Score</h3>
                  <p className="text-muted-foreground">
                    Receive your Legacy Growth IQ™ score across all four dimensions immediately after completing the quiz.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Review Your Insights</h3>
                  <p className="text-muted-foreground">
                    Get personalized recommendations based on your specific answers and business situation.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Optional: Book a Strategy Call</h3>
                  <p className="text-muted-foreground">
                    If you'd like to discuss your results and explore how CurioQuest can help, schedule a free 30-minute strategy call with Manpreet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">
              Join Hundreds of Business Owners Who've Taken the Quiz
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div>
                <div className="text-4xl font-bold text-amber-400 mb-2">500+</div>
                <div className="text-gray-400">Quizzes Completed</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-amber-400 mb-2">4.9/5</div>
                <div className="text-gray-400">Average Rating</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-amber-400 mb-2">92%</div>
                <div className="text-gray-400">Found It Valuable</div>
              </div>
            </div>

            <blockquote className="text-xl italic text-gray-300 mb-6">
              "The quiz helped me see blind spots I didn't know I had. The insights were spot-on 
              and gave me a clear starting point for improving my business."
            </blockquote>
            <div className="text-gray-400">— Marcus T., Construction Company Owner</div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-amber-50 to-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Discover Your Legacy Growth IQ™?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Take 2 minutes to find out what's standing between you and the business legacy you deserve.
            </p>
            
            <Button 
              size="lg" 
              className="text-lg px-10 py-6 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
              asChild
            >
              <Link href="/quiz">
                Start the Free Quiz
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-amber-500" />
                <span>No email required to start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-amber-500" />
                <span>Instant results</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-amber-500" />
                <span>100% free</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

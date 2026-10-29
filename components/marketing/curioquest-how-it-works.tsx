"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Eye, PenLine, Zap, CheckCircle2, Brain, RefreshCw } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Notice",
    description: "Your child sees the goal and says what looks easy or tricky. Warm up, no pressure.",
    icon: Eye,
  },
  {
    number: "02",
    title: "Try",
    description: "Kids take their own shot first. The coach watches how they think - not just the final answer.",
    icon: PenLine,
  },
  {
    number: "03",
    title: "Challenge",
    description: "A fun twist makes kids explain their thinking or check an answer that might be wrong.",
    icon: Zap,
  },
  {
    number: "04",
    title: "Verify",
    description: "Did it work? Kids check their answer and learn how to prove it to themselves.",
    icon: CheckCircle2,
  },
  {
    number: "05",
    title: "Reflect",
    description: "What worked? What will they try next time? Kids name the strategy that helped.",
    icon: Brain,
  },
  {
    number: "06",
    title: "Transfer",
    description: "Time to shine. A brand-new problem, solved with no AI help - proof the skill is really theirs.",
    icon: RefreshCw,
  },
];

export function CurioQuestHowItWorks() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4 border-amber-500/50 text-amber-600">
            The CurioQuest Way
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            How Learning Works Here
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Every lesson follows the same friendly six steps. Kids always know what
            comes next - and parents can see real proof of learning.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 hidden md:block" />

          <div className="space-y-12 md:space-y-0">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`relative md:grid md:grid-cols-2 md:gap-8 md:items-center ${
                  index % 2 === 0 ? "" : "md:direction-rtl"
                }`}
              >
                {/* Content */}
                <div className={`${index % 2 === 0 ? "md:text-right md:pr-12" : "md:text-left md:pl-12 md:col-start-2"}`}>
                  <div className={`flex items-center gap-4 mb-4 ${index % 2 === 0 ? "md:justify-end" : "md:justify-start"}`}>
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center md:hidden">
                      <step.icon className="h-6 w-6 text-amber-600" />
                    </div>
                    <span className="text-4xl font-bold text-amber-500/30">{step.number}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>

                {/* Icon (Desktop) */}
                <div className={`hidden md:flex items-center justify-center ${index % 2 === 0 ? "md:col-start-2" : "md:col-start-1 md:row-start-1"}`}>
                  <div className="relative z-10 w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                </div>

                {/* Spacer for alternating layout */}
                {index < steps.length - 1 && <div className="h-8 md:hidden" />}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900" asChild>
            <Link href="/academy">
              Try a Lesson
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calculator, BookOpen, Sprout, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

const coaches = [
  {
    title: "Coach Maya",
    tagline: "Math Coach",
    stepBadge: "MATH",
    description:
      "Coach Maya helps kids work through math problems on their own. She asks one question at a time, gives hints when kids get stuck, and celebrates every win.",
    expandedContent:
      "Coach Maya never just gives away the answer. She helps kids spot what they already know, try their own idea first, and figure out tricky steps with gentle hints. When a child gets it right, she asks them to explain how - so the learning really sticks.",
    icon: Calculator,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    image: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=1200&q=80&auto=format&fit=crop",
    imageAlt: "Child working on math problems on a laptop",
    features: [
      "Guided problem solving",
      "Finds gaps early",
      "Explains the 'why'",
      "Builds real confidence",
    ],
  },
  {
    title: "Story Explorer",
    tagline: "Reading Coach",
    stepBadge: "READ",
    description:
      "Story Explorer turns every story into a fun adventure. Kids learn to spot clues in the text, explain their ideas, and fall in love with reading.",
    expandedContent:
      "Instead of quizzing kids, Story Explorer asks them to be detectives. What did the character really mean? What clue tells you that? Kids learn to point to the words in the story that back up their ideas - the same skills great readers use every day.",
    icon: BookOpen,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    image: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=1200&q=80&auto=format&fit=crop",
    imageAlt: "Child happily reading a book",
    features: [
      "Fun story questions",
      "Evidence detective skills",
      "Builds vocabulary",
      "Any reading level",
    ],
  },
  {
    title: "Growth & Glow",
    tagline: "Life Skills Coach",
    stepBadge: "LIFE",
    description:
      "Growth & Glow sets a fun skill challenge each month. Kids plan, practice, and show what they can do - like saving money, planning their week, or helping a friend.",
    expandedContent:
      "Each month brings a new real-world quest. Kids make a simple plan, try the skill at home or with friends, and share how it went. Little by little, they learn to handle real life on their own - and feel proud doing it.",
    icon: Sprout,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    image: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=1200&q=80&auto=format&fit=crop",
    imageAlt: "Kids smiling while learning on a laptop together",
    features: [
      "Monthly skill quests",
      "Real-world practice",
      "Builds independence",
      "Family friendly",
    ],
  },
];

export function CurioQuestServicesOverview() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleCard = (title: string) => {
    setExpandedCard(expandedCard === title ? null : title);
  };

  return (
    <section className="py-20 md:py-28 bg-slate-50">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4 border-amber-500/50 text-amber-600">
            Meet Your AI Coaches
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Three Coaches. One Goal: Your Child Understands.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Each coach guides kids with questions and hints - never just the answer.
            Kids learn to think, try, and figure things out for themselves.
          </p>
        </div>

        {/* Coach Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {coaches.map((coach) => (
            <Card key={coach.title} className="relative overflow-hidden group hover:shadow-lg transition-shadow border-0 shadow-md">
              {/* Coach Image */}
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={coach.image}
                  alt={coach.imageAlt}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-amber-500 text-slate-900 font-semibold">
                    {coach.stepBadge}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${coach.bgColor} flex items-center justify-center mb-2`}>
                  <coach.icon className={`h-6 w-6 ${coach.color}`} />
                </div>
                <CardTitle className="text-2xl">{coach.title}</CardTitle>
                <CardDescription className="text-base font-medium text-amber-600">
                  {coach.tagline}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{coach.description}</p>

                <ul className="grid grid-cols-1 gap-2">
                  {coach.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckCircle className={`h-4 w-4 mt-0.5 shrink-0 ${coach.color}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Expanded Content */}
                {expandedCard === coach.title && (
                  <div className="pt-4 border-t border-amber-200 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-sm text-muted-foreground mb-4">{coach.expandedContent}</p>
                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900" asChild>
                      <Link href="/academy">
                        Start Learning with {coach.title}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}

                <Button
                  variant="ghost"
                  className="group/btn p-0 h-auto text-amber-600 hover:text-amber-700"
                  onClick={() => toggleCard(coach.title)}
                >
                  {expandedCard === coach.title ? (
                    <>
                      Show less
                      <ChevronUp className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Learn more
                      <ChevronDown className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-y-0.5" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sign Up CTA */}
        <div className="mt-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 md:p-12 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to See Your Child Light Up?
          </h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Join families who want kids to really understand - not just finish the worksheet.
            Getting started takes just a few minutes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="text-lg bg-amber-500 hover:bg-amber-600 text-slate-900" asChild>
              <Link href="/academy">
                Explore Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg border-amber-400 text-amber-400 hover:bg-amber-400/20 hover:text-amber-300" asChild>
              <Link href="/contact">
                Ask a Question
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-gray-400">
            Built for kids. Approved by parents and guardians.
          </p>
        </div>
      </div>
    </section>
  );
}

import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Eye,
  ShieldCheck,
  Heart,
  Users,
  Sparkles,
  ArrowRight,
  Quote,
  Calculator,
  BookOpen,
  Sprout,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About CurioQuest | Learn, Believe, Grow",
  description:
    "CurioQuest is a safe, guided learning platform for kids. Friendly AI coaches help children truly understand math, reading, and life skills - one question at a time.",
};

const values = [
  {
    icon: Heart,
    title: "Understanding First",
    description:
      "We never rush to the answer. Kids learn to think, try, and explain their ideas.",
  },
  {
    icon: ShieldCheck,
    title: "Safety Always",
    description:
      "Parents approve access, see progress, and can reach a real person anytime.",
  },
  {
    icon: Users,
    title: "Every Kid Belongs",
    description:
      "Made for all kinds of learners, on any device, at any reading level.",
  },
  {
    icon: Sparkles,
    title: "Proof, Not Guesses",
    description:
      "Kids show what they can do on their own. Parents see real evidence of learning.",
  },
];

const coaches = [
  {
    icon: Calculator,
    name: "Coach Maya",
    subject: "Math",
    description:
      "Helps kids work through math step by step. She asks the right question at the right time - so kids solve problems on their own.",
  },
  {
    icon: BookOpen,
    name: "Story Explorer",
    subject: "Reading",
    description:
      "Turns every story into a detective adventure. Kids learn to find clues in the text and explain their ideas.",
  },
  {
    icon: Sprout,
    name: "Growth & Glow",
    subject: "Life Skills",
    description:
      "Sets a fun challenge each month. Kids plan, practice a real-world skill, and share how it went.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-amber-500/50 text-amber-400">
              About CurioQuest
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Learn. Believe.{" "}
              <span className="text-amber-400">Grow.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              We built CurioQuest for one simple reason: kids learn best when they
              figure things out for themselves - with a patient guide by their side.
            </p>
          </div>
        </div>
      </section>

      {/* Why We Exist */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="relative">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80&auto=format&fit=crop"
                  alt="Children learning together at a table"
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-4 max-w-xs">
                <Quote className="h-6 w-6 text-amber-400 mb-2" />
                <p className="text-sm text-muted-foreground italic">
                  &quot;Kids don&apos;t need more answers. They need better questions.&quot;
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                Why CurioQuest Exists
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="text-lg">
                  Most learning apps work the same way. A kid gets stuck, the app gives
                  the answer, and everyone moves on. It looks like learning - but nothing
                  really stuck.
                </p>
                <p>
                  CurioQuest works differently. Our AI coaches ask questions and give
                  hints, so kids do the thinking. Then, at the end of every lesson, kids
                  solve a new problem all by themselves - no help allowed. That&apos;s how we
                  know (and how you know) they really learned it.
                </p>
                <p>
                  And because kids come first, safety is built in from the start.
                  Parents approve access, get simple progress updates, and can always
                  ask for a real person to step in.
                </p>
              </div>
              <Button className="mt-8 bg-amber-500 hover:bg-amber-600 text-slate-900" asChild>
                <Link href="/contact">
                  Talk to Our Team
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <Card className="border-2 border-amber-500/20">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-6">
                  <Target className="h-6 w-6 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground">
                  To give every child a patient, encouraging guide that helps them
                  truly understand - not just finish the worksheet. We help kids learn
                  to think, believe in themselves, and grow.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-500/20">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-6">
                  <Eye className="h-6 w-6 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                <p className="text-muted-foreground">
                  A world where every kid - no matter where they live or how they
                  learn - has a coach who believes in them, and every parent can see
                  real proof of progress.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Meet the Coaches */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-amber-500/50 text-amber-600">
              Meet the Coaches
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Three Coaches. One Goal: Understanding.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Each coach guides kids the same friendly way - one question at a time,
              never just the answer.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {coaches.map((coach) => (
              <Card key={coach.name} className="text-center border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                    <coach.icon className="h-7 w-7 text-amber-600" />
                  </div>
                  <Badge variant="outline" className="mb-2 border-amber-500/50 text-amber-600">
                    {coach.subject}
                  </Badge>
                  <h3 className="text-xl font-semibold mb-2">{coach.name}</h3>
                  <p className="text-muted-foreground text-sm">{coach.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* The Learning Cycle */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 border-amber-500/50 text-amber-600">
              Our Approach
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              The Six-Step Learning Cycle
            </h2>
            <p className="text-lg text-muted-foreground mb-12">
              Every lesson follows the same simple path. Kids always know what&apos;s next -
              and the last step proves they can do it alone.
            </p>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-12">
              {["Notice", "Try", "Challenge", "Verify", "Reflect", "Transfer"].map((step) => (
                <div key={step} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center mx-auto mb-2">
                    <span className="text-sm font-bold text-white">{step[0]}</span>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {step}
                  </div>
                </div>
              ))}
            </div>

            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900" asChild>
              <Link href="/academy">
                Explore Our Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-amber-500/50 text-amber-600">
              What We Stand For
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Our Core Values</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we build at CurioQuest.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {values.map((value) => (
              <Card key={value.title} className="text-center border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-7 w-7 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Help Your Child Grow?
          </h2>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            Join the families who want kids to really understand - and have fun
            doing it. The first lesson is waiting.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Button
              size="lg"
              className="text-lg px-8 bg-amber-500 hover:bg-amber-600 text-slate-900"
              asChild
            >
              <Link href="/academy">
                Start Learning Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-white text-white hover:bg-white hover:text-slate-900"
              asChild
            >
              <Link href="/contact">
                Questions? Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Video, FileText, Download, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Resources | AICenter4U",
  description:
    "Free resources, guides, and tools to help you build a lasting business legacy. Download our playbooks, read articles, and watch educational content.",
};

const resources = [
  {
    id: "journal",
    icon: BookOpen,
    title: "The Journal",
    description: "Practical strategies, honest insights, and real stories to help you build a business that thrives today and endures for generations.",
    link: "/journal",
    cta: "Read Articles",
  },
  {
    id: "academy",
    icon: Video,
    title: "Legacy Growth Academy",
    description: "On-demand courses and training programs to develop your leadership skills, operational excellence, and succession planning capabilities.",
    link: "/academy",
    cta: "Explore Courses",
  },
  {
    id: "quiz",
    icon: FileText,
    title: "Legacy Growth IQ™ Quiz",
    description: "Take our free assessment to discover what's holding your business back and get a personalized growth roadmap.",
    link: "/quiz-intro",
    cta: "Take the Quiz",
  },
];

export default function ResourcesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-amber-500/50 text-amber-400">
              Free Resources
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Tools to Build Your{" "}
              <span className="text-amber-400">Legacy</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              Access our library of free guides, articles, assessments, and tools 
              designed to help you build a business that outlasts you.
            </p>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {resources.map((resource) => (
              <Card key={resource.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                    <resource.icon className="h-6 w-6 text-amber-600" />
                  </div>
                  <CardTitle className="text-xl">{resource.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <p className="text-muted-foreground mb-6">
                    {resource.description}
                  </p>
                  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900" asChild>
                    <Link href={resource.link}>
                      {resource.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Need Personalized Guidance?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            While our resources are a great starting point, nothing beats a one-on-one 
            conversation about your specific situation and goals.
          </p>
          <Button
            size="lg"
            className="text-lg px-8 bg-amber-500 hover:bg-amber-600 text-slate-900"
            asChild
          >
            <Link href="/schedule-a-call">
              Schedule a Strategy Call
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}

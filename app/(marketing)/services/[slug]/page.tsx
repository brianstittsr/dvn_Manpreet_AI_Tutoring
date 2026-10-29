import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Users,
  Settings,
  ArrowRightLeft,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const services = {
  "strategic-planning": {
    icon: Target,
    title: "Strategic Planning",
    tagline: "Clarity. Focus. Forward momentum.",
    description:
      "Vision-aligned roadmaps that connect daily decisions to long-term legacy goals. We help you see the big picture and execute with precision.",
    benefits: [
      "Develop a clear, compelling vision for your business",
      "Set measurable goals with accountability systems",
      "Create strategic roadmaps that guide daily decisions",
      "Track performance metrics that matter",
      "Align your team around shared objectives",
    ],
    features: [
      "Business Vision Development",
      "Goal Setting & Tracking",
      "Strategic Roadmapping",
      "Performance Metrics",
      "Quarterly Planning Sessions",
    ],
    ideal: "Business owners who feel stuck or lack direction, companies experiencing plateau, leaders who want to work ON the business instead of IN it.",
  },
  "leadership-coaching": {
    icon: Users,
    title: "Leadership Coaching",
    tagline: "Lead with courage and conviction.",
    description:
      "Transform your leadership skills to empower teams and inspire change. Build the confidence to make bold decisions that drive results.",
    benefits: [
      "Develop executive presence and confidence",
      "Build and lead high-performing teams",
      "Improve communication and influence",
      "Navigate conflict with skill and grace",
      "Create a culture of accountability",
    ],
    features: [
      "Executive Coaching",
      "Team Leadership Development",
      "Communication Skills Training",
      "Conflict Resolution",
      "Leadership Assessment",
    ],
    ideal: "Founders transitioning to CEO, leaders struggling with team dynamics, business owners who want to develop their leadership team.",
  },
  "operational-excellence": {
    icon: Settings,
    title: "Operational Excellence",
    tagline: "Work smarter. Grow faster.",
    description:
      "Streamline systems, reclaim time, and improve margins. We help you build processes that scale without sacrificing quality.",
    benefits: [
      "Identify and eliminate operational bottlenecks",
      "Build systems that run without you",
      "Improve efficiency and reduce waste",
      "Lower costs while maintaining quality",
      "Create scalable processes for growth",
    ],
    features: [
      "Process Optimization",
      "System Implementation",
      "Efficiency Analysis",
      "Cost Reduction Strategies",
      "Workflow Automation",
    ],
    ideal: "Businesses experiencing growing pains, owners working too many hours, companies with inconsistent results or quality issues.",
  },
  "legacy-transition": {
    icon: ArrowRightLeft,
    title: "Legacy Transition",
    tagline: "Pass it on with confidence.",
    description:
      "Plan for succession and build a business that endures. Whether you're selling, transitioning to family, or stepping back—we prepare you for what's next.",
    benefits: [
      "Create a comprehensive succession plan",
      "Understand your business's true value",
      "Develop exit strategies that maximize value",
      "Transfer knowledge to the next generation",
      "Ensure business continuity beyond your tenure",
    ],
    features: [
      "Succession Planning",
      "Business Valuation Guidance",
      "Exit Strategy Development",
      "Knowledge Transfer Systems",
      "Transition Coaching",
    ],
    ideal: "Business owners approaching retirement, founders considering sale or transition, family businesses planning generational transfer.",
  },
};

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = services[slug as keyof typeof services];
  
  if (!service) {
    return {
      title: "Service Not Found | AICenter4U",
    };
  }

  return {
    title: `${service.title} | AICenter4U`,
    description: service.description,
  };
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;
  const service = services[slug as keyof typeof services];

  if (!service) {
    notFound();
  }

  const IconComponent = service.icon;

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-6 border-amber-500/50 text-amber-400">
              <Link href="/services" className="hover:underline">
                ← All Services
              </Link>
            </Badge>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <IconComponent className="h-8 w-8 text-amber-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  {service.title}
                </h1>
                <p className="text-xl text-amber-400 mt-2">{service.tagline}</p>
              </div>
            </div>
            <p className="text-lg text-gray-300">
              {service.description}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Benefits */}
            <div>
              <h2 className="text-2xl font-bold mb-6">What You'll Achieve</h2>
              <ul className="space-y-4">
                {service.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>

              <Button className="mt-8 bg-amber-500 hover:bg-amber-600 text-slate-900" asChild>
                <Link href="/schedule-a-call">
                  Schedule a Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Features Card */}
            <div>
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-t-lg">
                  <CardTitle className="text-xl">What's Included</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="pt-6 border-t">
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                      IDEAL FOR:
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {service.ideal}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Take the first step toward transforming your business. Schedule a complimentary 
            strategy call to discuss how our {service.title.toLowerCase()} services can help you achieve your goals.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
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
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8"
              asChild
            >
              <Link href="/quiz-intro">
                Take the Free Quiz
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

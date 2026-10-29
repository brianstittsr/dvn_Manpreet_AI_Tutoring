import { Metadata } from "next";
import Link from "next/link";
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
  Phone,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Services | CurioQuest",
  description:
    "Explore CurioQuest's business coaching services: Strategic Planning, Leadership Coaching, Operational Excellence, and Legacy Transition. Build a business that outlasts you.",
};

const services = [
  {
    id: "strategic-planning",
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
  {
    id: "leadership-coaching",
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
  {
    id: "operational-excellence",
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
  {
    id: "legacy-transition",
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
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-amber-500/50 text-amber-400">
              Our Services
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              How We Help You Build a{" "}
              <span className="text-amber-400">Legacy</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              We don't offer cookie-cutter programs. Instead, we co-create strategies tailored 
              to your unique vision, challenges, and goals—with measurable results in 90 days.
            </p>
          </div>
        </div>
      </section>

      {/* G.R.O.W.S. Framework Overview */}
      <section className="py-16 bg-amber-50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">The Legacy Growth System™</h2>
            <p className="text-muted-foreground mb-8">
              Our proprietary G.R.O.W.S. framework guides every engagement, ensuring 
              sustainable growth, strong leadership, and succession readiness.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              {["Goals", "Roadmap", "Operations", "Workforce", "Succession"].map((step, index) => (
                <div key={step} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {step.charAt(0)}
                    </span>
                  </div>
                  <span className="font-medium">{step}</span>
                  {index < 4 && <ArrowRight className="h-4 w-4 text-amber-500 hidden sm:block" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Detail */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="space-y-24">
            {services.map((service, index) => (
              <div 
                key={service.id} 
                id={service.id}
                className={`grid md:grid-cols-2 gap-12 items-start ${
                  index % 2 === 1 ? "md:direction-rtl" : ""
                }`}
              >
                {/* Content */}
                <div className={index % 2 === 1 ? "md:order-2" : ""}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <service.icon className="h-7 w-7 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">{service.title}</h2>
                      <p className="text-amber-600 font-medium">{service.tagline}</p>
                    </div>
                  </div>
                  
                  <p className="text-lg text-muted-foreground mb-8">
                    {service.description}
                  </p>

                  <div className="mb-8">
                    <h3 className="font-semibold mb-4">What You'll Achieve:</h3>
                    <ul className="space-y-3">
                      {service.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" asChild>
                    <Link href="/schedule-a-call">
                      Schedule a Consultation
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>

                {/* Card */}
                <div className={index % 2 === 1 ? "md:order-1" : ""}>
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
            ))}
          </div>
        </div>
      </section>

      {/* How We Work Together */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <Badge variant="outline" className="mb-4 border-amber-500/50 text-amber-600">
              Our Process
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How We Work Together
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Every engagement is customized to your needs, but here's what you can expect.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { step: "1", title: "Discovery", description: "We learn about your business, challenges, and goals through deep conversation." },
              { step: "2", title: "Strategy", description: "Together, we create a customized roadmap aligned with your vision." },
              { step: "3", title: "Implementation", description: "You execute with hands-on coaching, accountability, and support." },
              { step: "4", title: "Results", description: "We measure progress, celebrate wins, and adjust as needed." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container text-center">
          <Phone className="h-12 w-12 mx-auto mb-6 text-amber-400" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Not Sure Where to Start?
          </h2>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            Take our free Legacy Growth IQ™ Quiz to discover what's holding your business back, 
            or schedule a complimentary strategy call with Manpreet.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Button
              size="lg"
              className="text-lg px-8 bg-amber-500 hover:bg-amber-600 text-slate-900"
              asChild
            >
              <Link href="/quiz-intro">
                Take the Free Quiz
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-white/30 hover:bg-white/10"
              asChild
            >
              <Link href="/schedule-a-call">
                Schedule a Strategy Call
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

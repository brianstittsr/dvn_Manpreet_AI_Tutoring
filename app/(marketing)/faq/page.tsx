import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  HelpCircle,
  MessageCircle,
  Phone,
} from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ | AICenter4U",
  description:
    "Frequently asked questions about AICenter4U coaching services, the G.R.O.W.S. framework, pricing, and how we help business owners build lasting legacies.",
};

const faqCategories = [
  {
    title: "About AICenter4U",
    faqs: [
      {
        question: "What is AICenter4U?",
        answer:
          "AICenter4U is a business coaching and consulting firm founded by Manpreet Hundal. We help small business owners and entrepreneurs build sustainable growth strategies through strategic planning, leadership coaching, operational excellence, and succession planning. Our mission is to empower business leaders to build wealth, inspire teams, and leave lasting legacies.",
      },
      {
        question: "Who is Manpreet Hundal?",
        answer:
          "Manpreet Hundal is the founder and lead coach at AICenter4U. With over 20 years of experience helping business leaders unlock their potential, Manpreet founded AICenter4U after witnessing countless talented entrepreneurs struggle—not from lack of vision, but from lack of strategic execution. She works directly with clients to bridge that gap and help them build businesses that outlast them.",
      },
      {
        question: "Why is it called 'AICenter4U'?",
        answer:
          "The name 'AICenter4U' represents a deeply personal commitment. 83 symbolizes the year that shaped Manpreet's understanding of what it means to build something that lasts—a reminder that legacy isn't about what you accumulate, but what you leave behind. It reflects our core belief that your business should be a vehicle for your legacy, not a prison that holds you captive.",
      },
      {
        question: "Where is AICenter4U located?",
        answer:
          "AICenter4U is headquartered in Cincinnati, Ohio. We work with clients throughout Ohio, the Midwest, and nationally through virtual coaching. Our address is 4724 Vine Street, Cincinnati, OH 45217.",
      },
    ],
  },
  {
    title: "Services & Programs",
    faqs: [
      {
        question: "What services does AICenter4U offer?",
        answer:
          "We offer four core services: Strategic Planning (vision-aligned roadmaps), Leadership Coaching (executive development and team building), Operational Excellence (systems and process optimization), and Legacy Transition (succession planning and exit strategies). All services are delivered through our proprietary G.R.O.W.S. framework.",
      },
      {
        question: "What is the G.R.O.W.S. framework?",
        answer:
          "G.R.O.W.S. is our proprietary 5-step framework designed to help small business owners achieve sustainable growth. It stands for: Goals (clarifying your vision), Roadmap (strategic planning), Operations (systems and processes), Workforce (team and leadership development), and Succession (exit and transition planning). This framework guides every engagement and ensures comprehensive business transformation.",
      },
      {
        question: "What is the Legacy Growth IQ™ Quiz?",
        answer:
          "The Legacy Growth IQ™ Quiz is a free 2-minute assessment that helps you identify what's holding your business back. You'll receive personalized insights and actionable next steps based on your responses. It's a great way to start understanding where your business stands and what areas need attention.",
      },
      {
        question: "Do you work with businesses outside of Ohio?",
        answer:
          "Yes! While we're based in Cincinnati and have a strong presence in Ohio and the Midwest, we work with clients nationally through virtual coaching. Many of our clients are located across the United States and participate in coaching sessions via video conference.",
      },
    ],
  },
  {
    title: "Working Together",
    faqs: [
      {
        question: "How do I get started with AICenter4U?",
        answer:
          "The best way to get started is to take our free Legacy Growth IQ™ Quiz or schedule a complimentary strategy call with Manpreet. During the strategy call, we'll discuss your business, challenges, and goals to determine if we're a good fit to work together.",
      },
      {
        question: "What does a typical engagement look like?",
        answer:
          "Every engagement is customized to your needs, but typically includes: an initial discovery phase where we learn about your business, a strategy development phase where we create your roadmap, an implementation phase with regular coaching sessions and accountability, and ongoing support to measure progress and adjust as needed. Most clients see measurable results within 90 days.",
      },
      {
        question: "How often do we meet?",
        answer:
          "Meeting frequency depends on your program and needs. Most clients meet weekly or bi-weekly for coaching sessions, with additional support available between sessions. We also offer intensive programs with more frequent touchpoints for accelerated results.",
      },
      {
        question: "Do you work with my team or just me?",
        answer:
          "Both! While much of our work focuses on the business owner, we also work with leadership teams when appropriate. Building a strong leadership team is a key component of the G.R.O.W.S. framework, and we often facilitate team sessions, leadership development, and strategic planning with your key people.",
      },
      {
        question: "What results can I expect?",
        answer:
          "Results vary by client and situation, but our clients typically experience: increased clarity and strategic focus, improved leadership and team performance, streamlined operations and better margins, reduced owner hours and improved work-life balance, and clear succession or exit plans. We promise measurable improvements within 90 days.",
      },
    ],
  },
  {
    title: "Investment & Pricing",
    faqs: [
      {
        question: "How much does coaching cost?",
        answer:
          "Our programs are customized based on your needs, goals, and the scope of work involved. We offer various engagement levels to accommodate different budgets and situations. The best way to get specific pricing is to schedule a strategy call where we can discuss your situation and recommend the right program for you.",
      },
      {
        question: "Is there a minimum commitment?",
        answer:
          "We believe in earning your business every month, but meaningful transformation takes time. Most of our programs have a minimum 90-day commitment to ensure we have enough time to create real, lasting change. After that, engagements continue on a month-to-month basis.",
      },
      {
        question: "Do you offer payment plans?",
        answer:
          "Yes, we offer flexible payment options to make our programs accessible. We can discuss payment arrangements during your strategy call based on the program that's right for you.",
      },
      {
        question: "What's the ROI of business coaching?",
        answer:
          "The ROI of coaching varies, but our clients consistently report returns that far exceed their investment. Common outcomes include increased revenue and profits, higher business valuations, reduced owner hours (time is money!), and avoided costly mistakes. One client sold their business for 40% more than their original valuation after working with us.",
      },
    ],
  },
  {
    title: "Community & Events",
    faqs: [
      {
        question: "What is the Legacy Leaders Community?",
        answer:
          "The Legacy Leaders Community is our private network of business owners who are committed to building lasting legacies. Members get access to monthly mastermind sessions, exclusive webinars, a resource library, and a supportive peer network. It's a great way to connect with like-minded entrepreneurs and get ongoing support.",
      },
      {
        question: "What events does AICenter4U offer?",
        answer:
          "We host a variety of events including virtual webinars, in-person workshops, monthly mastermind sessions, and live Q&A sessions with Manpreet. Events cover topics like succession planning, leadership development, strategic planning, and more. Check our Events page for upcoming opportunities.",
      },
      {
        question: "How do I join the community?",
        answer:
          "You can join the Legacy Leaders Community by signing up on our website or by becoming a coaching client. Community membership is included with most coaching programs, or available as a standalone membership for those who want peer support and resources.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-amber-500/50 text-amber-400">
              Frequently Asked Questions
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Got Questions?{" "}
              <span className="text-amber-400">We've Got Answers</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              Everything you need to know about AICenter4U, our services, and how we help 
              business owners build lasting legacies.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-16">
            {faqCategories.map((category) => (
              <div key={category.title}>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <HelpCircle className="h-6 w-6 text-amber-500" />
                  {category.title}
                </h2>
                <Accordion type="single" collapsible className="space-y-4">
                  {category.faqs.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`${category.title}-${index}`}
                      className="border rounded-lg px-6 shadow-sm"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-4">
                        <span className="font-medium">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-6 text-amber-500" />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Still Have Questions?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              We're here to help. Reach out directly and we'll get back to you within 24 hours.
            </p>
            <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <Phone className="h-8 w-8 mx-auto mb-4 text-amber-500" />
                <h3 className="font-semibold mb-2">Call Us</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Speak directly with our team
                </p>
                <a
                  href="tel:+15133351978"
                  className="text-amber-600 font-medium hover:underline"
                >
                  (513) 335-1978
                </a>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <MessageCircle className="h-8 w-8 mx-auto mb-4 text-amber-500" />
                <h3 className="font-semibold mb-2">Email Us</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  We'll respond within 24 hours
                </p>
                <a
                  href="mailto:info@aicenter4u.com"
                  className="text-amber-600 font-medium hover:underline"
                >
                  info@aicenter4u.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            Take the first step toward building a business that outlasts you. 
            Schedule a free strategy call or take our Legacy Growth IQ™ Quiz.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
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
              className="text-lg px-8 border-white/30 hover:bg-white/10"
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

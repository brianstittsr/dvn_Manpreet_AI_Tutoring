"use client";

import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is AICenter4U safe for my child?",
    answer: "Yes. Kids learn inside a protected space built just for them. A parent or guardian approves access, gets progress updates, and can ask for a human helper anytime. We only keep the information needed for learning - nothing extra.",
  },
  {
    question: "Does the AI just give kids the answers?",
    answer: "No. Our coaches ask questions and give hints instead. Kids always try on their own first. At the end of a lesson, they solve a brand-new problem with no AI help at all - that's how we know they really learned it.",
  },
  {
    question: "What subjects can my child learn?",
    answer: "Three areas right now: math with Coach Maya, reading with Story Explorer, and life skills with Growth & Glow. Each coach uses the same friendly six-step method, so kids always know what to expect.",
  },
  {
    question: "What ages is it for?",
    answer: "AICenter4U works best for kids about 8 to 14 years old. Every coach adjusts to your child's level, so it fits beginners and more advanced learners.",
  },
  {
    question: "How do parents see progress?",
    answer: "You get a short summary you can read in about a minute. It shows what your child tried, what they figured out, and what comes next. You can also link your account to your child's for a closer look.",
  },
  {
    question: "What if my child gets stuck or frustrated?",
    answer: "The coaches are patient and never rush. If a child is really stuck, they get a hint - then an easier step. Kids can also pause anytime or ask to talk to a real person.",
  },
  {
    question: "Does my child need special equipment?",
    answer: "Nope. AICenter4U works on phones, tablets, and computers. It's designed to be easy to use, easy to read, and light on data.",
  },
  {
    question: "How much does it cost?",
    answer: "We keep pricing family-friendly, and some lessons are free to try. Check the Courses page for current options, or contact us and we'll help you pick the right fit.",
  },
];

export function AICenter4UFAQSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4 border-amber-500/50 text-amber-600">
            Common Questions
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Questions Parents Ask Us
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything families want to know before getting started with AICenter4U.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-medium hover:text-amber-600">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Additional Help */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Still have questions?{" "}
            <a href="/contact" className="text-amber-600 hover:text-amber-700 font-medium">
              Send us a message
            </a>{" "}
            - a real person will get back to you.
          </p>
        </div>
      </div>
    </section>
  );
}

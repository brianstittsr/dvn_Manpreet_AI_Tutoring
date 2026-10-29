"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    id: 1,
    quote: "My son used to shut down when math got hard. Now he talks through problems out loud. The coach asks him questions instead of giving answers - that's what changed everything.",
    author: "Priya S.",
    title: "Mom of a 4th grader",
    location: "Ohio",
    result: "Math confidence way up",
    rating: 5,
  },
  {
    id: 2,
    quote: "Story Explorer got my daughter reading on her own. She actually asks me for more books now. I never thought an app could do that.",
    author: "Daniel R.",
    title: "Dad of a 3rd grader",
    location: "Kentucky",
    result: "Reads every night now",
    rating: 5,
  },
  {
    id: 3,
    quote: "I love the progress updates. In one minute I can see what my kids tried, where they got stuck, and what they figured out. No guessing.",
    author: "Angela M.",
    title: "Mom of two learners",
    location: "Indiana",
    result: "Always in the loop",
    rating: 5,
  },
  {
    id: 4,
    quote: "The life skills quests are our favorite. My daughter planned a whole week of chores and saving money by herself. She was so proud.",
    author: "Marcus J.",
    title: "Dad of a 6th grader",
    location: "Ohio",
    result: "Real-world independence",
    rating: 5,
  },
  {
    id: 5,
    quote: "What sold me: kids have to prove they learned it with no help. That's honest. Other apps just tell kids they're great. This one shows they really are.",
    author: "Sofia L.",
    title: "Mom & homeschool teacher",
    location: "Kentucky",
    result: "Learning you can verify",
    rating: 5,
  },
];

export function CurioQuestTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-slate-50 to-amber-50">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4 border-amber-500/50 text-amber-600">
            Family Stories
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            What Parents Are Saying
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Real moments from families learning with CurioQuest coaches.
          </p>
        </div>

        {/* Featured Testimonial */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-8 md:p-12">
              <div className="flex justify-center mb-6">
                <Quote className="h-12 w-12 text-amber-400" />
              </div>
              
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(currentTestimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-xl md:text-2xl text-center font-medium leading-relaxed mb-8">
                &quot;{currentTestimonial.quote}&quot;
              </blockquote>

              {/* Result Badge */}
              <div className="flex justify-center mb-6">
                <Badge className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 text-sm px-4 py-1">
                  Result: {currentTestimonial.result}
                </Badge>
              </div>

              {/* Author */}
              <div className="text-center">
                <div className="font-semibold text-lg">{currentTestimonial.author}</div>
                <div className="text-muted-foreground">
                  {currentTestimonial.title} • {currentTestimonial.location}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrev}
              className="rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all duration-300",
                    index === currentIndex
                      ? "bg-amber-500 w-6"
                      : "bg-slate-300 hover:bg-slate-400"
                  )}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              className="rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Testimonial Grid (Additional) */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {testimonials.slice(0, 3).map((testimonial) => (
            <Card key={testimonial.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 line-clamp-4">
                  &quot;{testimonial.quote}&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <span className="font-semibold text-amber-600">
                      {testimonial.author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">{testimonial.author}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.title}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

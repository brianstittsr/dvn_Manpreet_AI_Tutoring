"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Quote,
  TrendingUp,
  Star,
  Building2,
  Briefcase,
  Loader2,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { COLLECTIONS, type SuccessStoryDoc } from "@/lib/schema";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export function SuccessStoriesContent() {
  const [stories, setStories] = useState<(SuccessStoryDoc & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, COLLECTIONS.SUCCESS_STORIES),
      orderBy("order", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const storiesData = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as SuccessStoryDoc & { id: string }))
          .filter((s) => s.isPublished);
        setStories(storiesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching stories:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Separate featured and regular stories
  const featuredStory = stories.find((s) => s.isFeatured);
  const regularStories = stories.filter((s) => !s.isFeatured);

  // Calculate stats
  const stats = [
    { value: stories.length.toString(), label: "Success Stories" },
    { value: "47M", label: "Revenue Generated" },
    { value: "92%", label: "Client Satisfaction" },
    { value: "4.9", label: "Average Rating" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <>
      {/* Stats Bar */}
      <section className="py-8 bg-amber-500">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-slate-900">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-700">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Story */}
      {featuredStory && (
        <section className="py-20 md:py-28">
          <div className="container">
            <div className="max-w-6xl mx-auto">
              <Badge
                variant="outline"
                className="mb-4 border-amber-500/50 text-amber-600"
              >
                Featured Success Story
              </Badge>
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className="grid md:grid-cols-2">
                  <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-8 md:p-12 flex flex-col justify-center">
                    <div className="w-24 h-24 rounded-full bg-amber-500 flex items-center justify-center mb-6 overflow-hidden">
                      {featuredStory.image ? (
                        <img
                          src={featuredStory.image.url}
                          alt={featuredStory.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl font-bold text-white">
                          {featuredStory.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold mb-1">
                      {featuredStory.name}
                    </h3>
                    <p className="text-amber-700 mb-4">
                      {featuredStory.company}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-amber-800">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {featuredStory.industry}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {featuredStory.location}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-8 md:p-12">
                    <Quote className="h-10 w-10 text-amber-400 mb-4" />
                    <p className="text-xl italic text-muted-foreground mb-6">
                      &ldquo;{featuredStory.quote}&rdquo;
                    </p>

                    <div className="mb-6">
                      <h4 className="font-semibold mb-2">The Challenge:</h4>
                      <p className="text-sm text-muted-foreground">
                        {featuredStory.challenge}
                      </p>
                    </div>

                    {featuredStory.solution && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-2">The Solution:</h4>
                        <p className="text-sm text-muted-foreground">
                          {featuredStory.solution}
                        </p>
                      </div>
                    )}

                    {featuredStory.results.length > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        {featuredStory.results.map((result) => (
                          <div
                            key={result.metric}
                            className="text-center p-4 bg-slate-50 rounded-lg"
                          >
                            <div className="text-2xl font-bold text-amber-600">
                              {result.value}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {result.metric}
                            </div>
                            {result.period && (
                              <div className="text-xs text-muted-foreground">
                                {result.period}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* More Success Stories */}
      {regularStories.length > 0 && (
        <section className="py-20 md:py-28 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                More Success Stories
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Every business is unique, but the results speak for themselves.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {regularStories.map((story) => (
                <Card key={story.id} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center overflow-hidden">
                        {story.image ? (
                          <img
                            src={story.image.url}
                            alt={story.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-amber-600">
                            {story.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{story.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {story.company}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1 mb-4">
                      {[...Array(story.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>

                    <Quote className="h-6 w-6 text-amber-400 mb-2" />
                    <p className="text-sm italic text-muted-foreground mb-4 line-clamp-4">
                      &ldquo;{story.quote}&rdquo;
                    </p>

                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        <strong>Challenge:</strong> {story.challenge}
                      </p>
                      {story.results.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {story.results.slice(0, 3).map((result, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-xs"
                            >
                              {result.value} {result.metric}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Video Testimonials Placeholder */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold">Hear It From Them</h2>
            <p className="mt-2 text-muted-foreground">
              Watch video testimonials from our clients
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="aspect-video flex items-center justify-center bg-slate-100"
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center mx-auto mb-2">
                    <svg
                      className="h-8 w-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground">Video Coming Soon</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-6 text-amber-400" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Write Your Success Story?
          </h2>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            Join the hundreds of business owners who have transformed their
            companies with CurioQuest. Your legacy starts today.
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
              <Link href="/quiz-intro">Take the Free Quiz</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

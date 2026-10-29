"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  BookOpen,
  Star,
  CheckCircle,
  Sparkles,
  Heart,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { COLLECTIONS, type EventDoc } from "@/lib/schema";
import { getWorkshops, type WorkshopDoc } from "@/lib/firebase-lms";

const EVENT_TYPE_ICONS: Record<string, React.ElementType> = {
  webinar: Video,
  workshop: BookOpen,
  conference: Users,
  networking: Users,
  training: Star,
  other: Calendar,
};

const communityBenefits = [
  {
    title: "Family Workshops",
    description: "Hands-on sessions where parents and kids learn side by side.",
  },
  {
    title: "Meet-the-Coach Sessions",
    description: "See exactly how our AI coaches teach before your child starts.",
  },
  {
    title: "Parent Q&A Nights",
    description: "Ask anything about AI-guided learning, safety, and progress.",
  },
  {
    title: "Game Nights",
    description: "Math and reading games the whole family can play together.",
  },
  {
    title: "Early Access",
    description: "Families hear about new events before public registration.",
  },
  {
    title: "Always Free to Join",
    description: "Community events are free — learning together costs nothing.",
  },
];

function eventDateLabel(event: EventDoc): string {
  const start = event.startDate?.toDate?.();
  if (!start) return "Date TBA";
  return start.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function eventTimeLabel(event: EventDoc): string {
  const start = event.startDate?.toDate?.();
  const end = event.endDate?.toDate?.();
  if (!start) return "";
  const fmt = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return end ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
}

function eventLocationLabel(event: EventDoc): string {
  if (event.locationType === "virtual") return "Virtual (Online)";
  if (event.locationType === "hybrid")
    return event.location ? `${event.location} + Online` : "Hybrid";
  return event.location || "Location TBA";
}

function spotsLabel(event: EventDoc): string | null {
  if (!event.maxAttendees) return null;
  const remaining = event.maxAttendees - (event.currentAttendees || 0);
  return `${Math.max(remaining, 0)} spots available`;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [workshops, setWorkshops] = useState<WorkshopDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [eventSnap, workshopData] = await Promise.all([
          db
            ? getDocs(
                query(
                  collection(db, COLLECTIONS.EVENTS),
                  where("status", "==", "published"),
                  orderBy("startDate", "asc")
                )
              )
            : Promise.resolve(null),
          getWorkshops({ isPublished: true, upcoming: true, limitCount: 3 }).catch(
            () => [] as WorkshopDoc[]
          ),
        ]);

        if (eventSnap) {
          const now = new Date();
          const loaded = eventSnap.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as EventDoc
          );
          setEvents(
            loaded.filter((e) => {
              const start = e.startDate?.toDate?.();
              return !start || start >= new Date(now.getTime() - 24 * 60 * 60 * 1000);
            })
          );
        }
        setWorkshops(workshopData);
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-teal-500/50 text-teal-300">
              Events & Family Community
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Learn and Play{" "}
              <span className="text-teal-300">Together</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              Family workshops, meet-the-coach sessions, and parent Q&A nights.
              Come see how AI-guided learning works — and have fun doing it.
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-teal-500/50 text-teal-600">
              Mark Your Calendar
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Upcoming Events
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Register for a live session and get your learner account set up at the
              same time — login details arrive by email after you register.
            </p>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            {loading ? (
              [1, 2].map((i) => (
                <Card key={i} className="border-0 shadow-lg">
                  <CardContent className="p-6 md:p-8">
                    <Skeleton className="h-6 w-40 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))
            ) : events.length > 0 ? (
              events.map((event, index) => {
                const Icon =
                  EVENT_TYPE_ICONS[event.category || "other"] || Calendar;
                const featured = index === 0;
                return (
                  <Card
                    key={event.id}
                    className={`border-0 shadow-lg ${featured ? "ring-2 ring-teal-500" : ""}`}
                  >
                    {featured && (
                      <div className="bg-teal-500 text-slate-900 text-center py-2 text-sm font-medium">
                        <Star className="h-4 w-4 inline mr-2" />
                        Featured Event
                      </div>
                    )}
                    <CardContent className="p-6 md:p-8">
                      <div className="flex flex-col md:flex-row md:items-start gap-6">
                        <div className="w-16 h-16 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0">
                          <Icon className="h-8 w-8 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge variant="secondary" className="capitalize">
                              {event.category || "Event"}
                            </Badge>
                            {event.isFreeEvent && (
                              <Badge className="bg-teal-500/10 text-teal-700 border-teal-500/30">
                                Free
                              </Badge>
                            )}
                            {spotsLabel(event) && (
                              <span className="text-sm text-muted-foreground">
                                {spotsLabel(event)}
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                          <p className="text-muted-foreground mb-4">
                            {event.shortDescription || event.description}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {eventDateLabel(event)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {eventTimeLabel(event)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {eventLocationLabel(event)}
                            </span>
                          </div>
                          <Button
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                            asChild
                          >
                            <Link href={`/events/${event.slug || event.id}`}>
                              Register Now
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-10 text-center">
                  <Sparkles className="h-10 w-10 text-teal-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">New Events Coming Soon</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    We&apos;re planning our next family workshops and parent
                    sessions. In the meantime, join an academy workshop below or
                    explore the courses.
                  </p>
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white" asChild>
                    <Link href="/academy/courses">
                      Explore Courses
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Academy Workshops */}
      {workshops.length > 0 && (
        <section className="py-20 md:py-28 bg-slate-50">
          <div className="container">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 border-teal-500/50 text-teal-600">
                Academy Workshops
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Live Learning Sessions
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {workshops.map((workshop) => (
                <Card key={workshop.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <Badge variant="outline" className="text-teal-600 border-teal-500/50 w-fit mb-2">
                      <Calendar className="h-3 w-3 mr-1" />
                      {workshop.workshopType === "live" ? "Live Workshop" : "Recorded"}
                    </Badge>
                    <CardTitle className="text-xl">{workshop.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {workshop.shortDescription || workshop.description}
                    </p>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {workshop.scheduledStart
                          ?.toDate()
                          .toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {workshop.maxParticipants
                          ? `${Math.max(workshop.maxParticipants - workshop.registrationCount, 0)} spots remaining`
                          : "Open registration"}
                      </div>
                    </div>
                    <Button
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                      asChild
                    >
                      <Link href="/academy/workshops">Register Now</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Community Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <Badge variant="outline" className="mb-4 border-teal-500/50 text-teal-600">
                The CurioQuest Family
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                Learning Is Better Together
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Our community events are built for families. Watch your child light
                up during a math game night, meet the AI coaches before your first
                lesson, and get honest answers to your questions about AI and
                learning.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {communityBenefits.map((benefit) => (
                  <div key={benefit.title} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium">{benefit.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white" asChild>
                <Link href="/contact">
                  Join the Family
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Why Families Join Us
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-teal-600">6</div>
                      <div className="text-sm text-muted-foreground">
                        Learning Stages
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-teal-600">3</div>
                      <div className="text-sm text-muted-foreground">
                        AI Coaches
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-teal-600">100%</div>
                      <div className="text-sm text-muted-foreground">
                        Family-Safe Content
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-teal-600">Free</div>
                      <div className="text-sm text-muted-foreground">
                        Community Events
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container text-center">
          <Calendar className="h-12 w-12 mx-auto mb-6 text-teal-300" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Don&apos;t Miss the Next Family Event
          </h2>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            Register for an event and your learner account is created for you —
            login details arrive by email, ready for your first lesson.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Button
              size="lg"
              className="text-lg px-8 bg-teal-500 hover:bg-teal-600 text-slate-900"
              asChild
            >
              <Link href="/academy">
                Explore the Academy
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-white/30 hover:bg-white/10"
              asChild
            >
              <Link href="/contact">Ask a Question</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

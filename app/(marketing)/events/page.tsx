import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  Mic,
  BookOpen,
  Star,
  CheckCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Events & Community | AICenter4U",
  description:
    "Join AICenter4U events, workshops, and community gatherings. Connect with fellow business owners committed to building lasting legacies.",
};

const upcomingEvents = [
  {
    id: 1,
    title: "Building a Business That Outlives You",
    type: "Webinar",
    date: "January 15, 2026",
    time: "12:00 PM - 1:00 PM EST",
    location: "Virtual (Zoom)",
    description:
      "Learn the 5 key elements every business needs to thrive beyond its founder. Manpreet Hundal shares insights from 20+ years of helping business owners prepare for succession.",
    spots: 47,
    icon: Video,
    featured: true,
  },
  {
    id: 2,
    title: "Legacy Leaders Mastermind",
    type: "Monthly Meetup",
    date: "January 22, 2026",
    time: "8:00 AM - 10:00 AM EST",
    location: "Cincinnati, OH",
    description:
      "Join fellow business owners for our monthly mastermind session. Share challenges, celebrate wins, and get peer accountability.",
    spots: 12,
    icon: Users,
  },
  {
    id: 3,
    title: "The Succession Planning Workshop",
    type: "Workshop",
    date: "February 8, 2026",
    time: "9:00 AM - 4:00 PM EST",
    location: "Cincinnati, OH",
    description:
      "A full-day intensive workshop on creating your succession plan. Leave with a complete roadmap for your business transition.",
    spots: 20,
    icon: BookOpen,
  },
  {
    id: 4,
    title: "Ask Manpreet: Live Q&A Session",
    type: "Live Q&A",
    date: "February 12, 2026",
    time: "12:00 PM - 12:45 PM EST",
    location: "Virtual (Zoom)",
    description:
      "Bring your toughest business questions. Manpreet answers live and provides actionable advice you can implement immediately.",
    spots: 100,
    icon: Mic,
  },
];

const pastEvents = [
  {
    title: "90-Day Transformation Kickoff",
    date: "December 2025",
    attendees: 85,
  },
  {
    title: "Leadership Team Building Workshop",
    date: "November 2025",
    attendees: 24,
  },
  {
    title: "Exit Strategy Summit",
    date: "October 2025",
    attendees: 120,
  },
];

const communityBenefits = [
  {
    title: "Monthly Mastermind Sessions",
    description: "Connect with peers facing similar challenges and opportunities.",
  },
  {
    title: "Exclusive Webinars",
    description: "Access to members-only training and Q&A sessions with Manpreet.",
  },
  {
    title: "Resource Library",
    description: "Templates, checklists, and tools to accelerate your growth.",
  },
  {
    title: "Private Community",
    description: "24/7 access to a supportive network of business owners.",
  },
  {
    title: "Early Event Access",
    description: "First access to workshops and events before public registration.",
  },
  {
    title: "Member Discounts",
    description: "Special pricing on coaching programs and intensive workshops.",
  },
];

export default function EventsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-amber-500/50 text-amber-400">
              Events & Community
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Learn, Connect, and{" "}
              <span className="text-amber-400">Grow Together</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              Join a community of business owners who are committed to building 
              lasting legacies. Attend events, connect with peers, and accelerate your growth.
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-amber-500/50 text-amber-600">
              Mark Your Calendar
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Upcoming Events
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              From virtual webinars to in-person workshops, there's always an opportunity to learn and connect.
            </p>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            {upcomingEvents.map((event) => (
              <Card 
                key={event.id} 
                className={`border-0 shadow-lg ${event.featured ? "ring-2 ring-amber-500" : ""}`}
              >
                {event.featured && (
                  <div className="bg-amber-500 text-slate-900 text-center py-2 text-sm font-medium">
                    <Star className="h-4 w-4 inline mr-2" />
                    Featured Event
                  </div>
                )}
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    <div className="w-16 h-16 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                      <event.icon className="h-8 w-8 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="secondary">{event.type}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {event.spots} spots available
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                      <p className="text-muted-foreground mb-4">{event.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </span>
                      </div>
                      <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                        Register Now
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <Badge variant="outline" className="mb-4 border-amber-500/50 text-amber-600">
                Legacy Leaders Community
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                You Don't Have to Build Alone
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Join a private community of business owners who understand your challenges, 
                celebrate your wins, and hold you accountable to your goals. The Legacy Leaders 
                Community is where ambitious entrepreneurs come to grow together.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {communityBenefits.map((benefit) => (
                  <div key={benefit.title} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium">{benefit.title}</h4>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                Join the Community
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="relative">
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Community Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-amber-600">250+</div>
                      <div className="text-sm text-muted-foreground">Active Members</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-amber-600">48</div>
                      <div className="text-sm text-muted-foreground">Events This Year</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-amber-600">$2.4M</div>
                      <div className="text-sm text-muted-foreground">Revenue Generated</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-amber-600">92%</div>
                      <div className="text-sm text-muted-foreground">Member Retention</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Past Events */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold">Recent Events</h2>
            <p className="mt-2 text-muted-foreground">
              See what our community has been up to
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pastEvents.map((event) => (
              <Card key={event.title} className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-6 w-6 text-slate-600" />
                  </div>
                  <h3 className="font-semibold mb-1">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{event.date}</p>
                  <Badge variant="secondary">{event.attendees} attendees</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container text-center">
          <Calendar className="h-12 w-12 mx-auto mb-6 text-amber-400" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Don't Miss Our Next Event
          </h2>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            Subscribe to get notified about upcoming events, workshops, and community gatherings.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Button
              size="lg"
              className="text-lg px-8 bg-amber-500 hover:bg-amber-600 text-slate-900"
              asChild
            >
              <Link href="/schedule-a-call">
                Schedule a Call
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

import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Calendar,
  Clock,
  Search,
  BookOpen,
  TrendingUp,
  Users,
  Target,
} from "lucide-react";

export const metadata: Metadata = {
  title: "The Journal | AICenter4U",
  description:
    "Insights, strategies, and stories to help business owners build lasting legacies. Expert advice on leadership, succession planning, and business growth.",
};

const featuredPost = {
  title: "5 Signs Your Business Would Collapse Without You",
  excerpt:
    "If you can't take a two-week vacation without your phone blowing up, you don't have a business—you have a job. Here's how to know if you're the bottleneck, and what to do about it.",
  category: "Leadership",
  date: "December 15, 2025",
  readTime: "8 min read",
  image: "/images/blog-featured.jpg",
  slug: "5-signs-business-would-collapse-without-you",
};

const blogPosts = [
  {
    title: "The Succession Planning Checklist Every Owner Needs",
    excerpt:
      "Whether you're 5 years or 15 years from exit, having a succession plan isn't optional—it's essential. Here's your complete checklist.",
    category: "Succession",
    date: "December 10, 2025",
    readTime: "6 min read",
    slug: "succession-planning-checklist",
  },
  {
    title: "How to Build a Leadership Team You Can Trust",
    excerpt:
      "The difference between a business that scales and one that stalls often comes down to one thing: the leadership team. Here's how to build yours.",
    category: "Leadership",
    date: "December 5, 2025",
    readTime: "7 min read",
    slug: "build-leadership-team-you-can-trust",
  },
  {
    title: "Exit Strategy: Sell, Transition, or Close?",
    excerpt:
      "Every business owner will exit eventually. The question is whether you'll do it on your terms or someone else's. Let's explore your options.",
    category: "Succession",
    date: "November 28, 2025",
    readTime: "10 min read",
    slug: "exit-strategy-sell-transition-close",
  },
  {
    title: "The 90-Day Business Transformation Blueprint",
    excerpt:
      "Real change doesn't take years—it takes focus. Here's our proven framework for achieving measurable results in just 90 days.",
    category: "Strategy",
    date: "November 20, 2025",
    readTime: "9 min read",
    slug: "90-day-business-transformation-blueprint",
  },
  {
    title: "Why Most Business Coaches Fail (And How to Find One That Works)",
    excerpt:
      "The coaching industry is full of promises. Here's how to separate the real deal from the pretenders and find a coach who delivers results.",
    category: "Business",
    date: "November 15, 2025",
    readTime: "6 min read",
    slug: "why-most-business-coaches-fail",
  },
  {
    title: "From Founder to CEO: Making the Mindset Shift",
    excerpt:
      "Building a business requires one set of skills. Leading a business requires another. Here's how to make the transition successfully.",
    category: "Leadership",
    date: "November 8, 2025",
    readTime: "8 min read",
    slug: "founder-to-ceo-mindset-shift",
  },
  {
    title: "Building a Business That Outlives You",
    excerpt:
      "Legacy isn't about what you accumulate—it's about what you leave behind. Here's how to build a business that endures for generations.",
    category: "Legacy",
    date: "November 1, 2025",
    readTime: "7 min read",
    slug: "building-business-that-outlives-you",
  },
  {
    title: "The Hidden Cost of Being Indispensable",
    excerpt:
      "Being the go-to person for everything feels good—until it doesn't. Here's why being indispensable is actually holding you back.",
    category: "Operations",
    date: "October 25, 2025",
    readTime: "5 min read",
    slug: "hidden-cost-being-indispensable",
  },
];

const categories = [
  { name: "All", count: 24, icon: BookOpen },
  { name: "Leadership", count: 8, icon: Users },
  { name: "Succession", count: 6, icon: ArrowRight },
  { name: "Strategy", count: 5, icon: Target },
  { name: "Operations", count: 5, icon: TrendingUp },
];

export default function LegacyJournalPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-amber-500/50 text-amber-400">
              The Journal
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Insights for Building a{" "}
              <span className="text-amber-400">Lasting Legacy</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              Practical strategies, honest insights, and real stories to help you build 
              a business that thrives today and endures for generations.
            </p>
            
            {/* Search */}
            <div className="mt-8 max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search articles..."
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 border-b">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={category.name === "All" ? "default" : "outline"}
                className={category.name === "All" ? "bg-amber-500 hover:bg-amber-600 text-slate-900" : ""}
              >
                <category.icon className="h-4 w-4 mr-2" />
                {category.name}
                <span className="ml-2 text-xs opacity-70">({category.count})</span>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16">
        <div className="container">
          <Card className="overflow-hidden border-0 shadow-xl">
            <div className="grid md:grid-cols-2">
              <div className="aspect-video md:aspect-auto bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                <div className="text-center p-8">
                  <BookOpen className="h-16 w-16 text-amber-600 mx-auto mb-4" />
                  <p className="text-amber-800 font-medium">Featured Article</p>
                </div>
              </div>
              <CardContent className="p-8 md:p-12 flex flex-col justify-center">
                <Badge className="w-fit mb-4 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
                  {featuredPost.category}
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  {featuredPost.title}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {featuredPost.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {featuredPost.readTime}
                  </span>
                </div>
                <Button className="w-fit bg-amber-500 hover:bg-amber-600 text-slate-900" asChild>
                  <Link href={`/journal/${featuredPost.slug}`}>
                    Read Article
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </div>
          </Card>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 bg-slate-50">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8">Latest Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Link key={post.slug} href={`/journal/${post.slug}`} className="block group">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow h-full">
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center group-hover:from-amber-50 group-hover:to-amber-100 transition-colors">
                    <BookOpen className="h-10 w-10 text-slate-400 group-hover:text-amber-500 transition-colors" />
                  </div>
                  <CardContent className="p-6">
                    <Badge className="mb-3 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
                      {post.category}
                    </Badge>
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Articles
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-6 text-amber-400" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Get Legacy Insights Delivered
          </h2>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            Join 2,500+ business owners who receive our weekly insights on building 
            businesses that last. No spam, just actionable advice.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900 whitespace-nowrap">
              Subscribe
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <p className="mt-4 text-sm text-gray-400">
            Unsubscribe anytime. We respect your inbox.
          </p>
        </div>
      </section>
    </>
  );
}

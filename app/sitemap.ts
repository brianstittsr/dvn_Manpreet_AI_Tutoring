import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://curioquest.com";

  // Static pages
  const staticPages = [
    "",
    "/about",
    "/company",
    "/leadership",
    "/contact",
    "/services",
    "/v-edge",
    "/v-edge/quality",
    "/v-edge/reshore",
    "/twinedge",
    "/intelledge",
    "/affiliates",
    "/case-studies",
    "/resources",
    "/resources/blog",
    "/resources/guides",
    "/resources/webinars",
    "/events",
    "/faq",
    "/news",
    "/careers",
    "/privacy",
    "/terms",
    "/cookies",
    "/accessibility",
    "/journal",
    "/schedule-a-call",
    "/quiz",
    "/quiz-intro",
  ];

  const staticSitemap: MetadataRoute.Sitemap = staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : route.startsWith("/v-edge") || route.startsWith("/twinedge") || route.startsWith("/intelledge") ? 0.9 : 0.8,
  }));

  // Service pages with higher priority
  const servicePages = [
    { url: `${baseUrl}/services/supplier-readiness`, priority: 0.9 },
    { url: `${baseUrl}/services/iso-certification`, priority: 0.9 },
    { url: `${baseUrl}/services/digital-transformation`, priority: 0.9 },
    { url: `${baseUrl}/services/lean-manufacturing`, priority: 0.9 },
  ];

  const serviceSitemap: MetadataRoute.Sitemap = servicePages.map((page) => ({
    url: page.url,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: page.priority,
  }));

  // Blog article pages
  const blogArticles = [
    { slug: "5-signs-business-would-collapse-without-you", priority: 0.8 },
    { slug: "succession-planning-checklist", priority: 0.8 },
    { slug: "build-leadership-team-you-can-trust", priority: 0.8 },
    { slug: "exit-strategy-sell-transition-close", priority: 0.8 },
    { slug: "90-day-business-transformation-blueprint", priority: 0.8 },
    { slug: "why-most-business-coaches-fail", priority: 0.8 },
    { slug: "founder-to-ceo-mindset-shift", priority: 0.8 },
    { slug: "building-business-that-outlives-you", priority: 0.8 },
    { slug: "hidden-cost-being-indispensable", priority: 0.8 },
  ];

  const blogSitemap: MetadataRoute.Sitemap = blogArticles.map((article) => ({
    url: `${baseUrl}/journal/${article.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: article.priority,
  }));

  return [...staticSitemap, ...serviceSitemap, ...blogSitemap];
}

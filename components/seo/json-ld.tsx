import Script from "next/script";

// Organization Schema
export function OrganizationJsonLd() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AICenter4U",
    alternateName: "AICenter4U",
    url: "https://aicenter4u.com",
    logo: "https://aicenter4u.com/aicenter4u-logo.svg",
    description:
      "AICenter4U helps entrepreneurs and business owners build sustainable wealth, develop high-performing teams, and create lasting legacies through strategic coaching.",
    foundingDate: "2020",
    founders: [
      {
        "@type": "Person",
        name: "Manpreet Hundal",
        jobTitle: "Founder & CEO",
      },
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "US",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+1-513-555-0183",
        contactType: "sales",
        availableLanguage: ["English"],
      },
      {
        "@type": "ContactPoint",
        email: "info@aicenter4u.com",
        contactType: "customer service",
      },
    ],
    sameAs: [
      "https://www.linkedin.com/company/aicenter4ubusiness",
      "https://twitter.com/aicenter4ubusiness",
      "https://www.facebook.com/aicenter4ubusiness",
    ],
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    knowsAbout: [
      "Business Coaching",
      "Executive Coaching",
      "Leadership Development",
      "Strategic Planning",
      "Business Succession",
      "Legacy Planning",
      "Operational Excellence",
      "Team Development",
    ],
  };

  return (
    <Script
      id="organization-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
  );
}

// Local Business Schema (for local SEO)
export function LocalBusinessJsonLd() {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "AICenter4U",
    image: "https://aicenter4u.com/aicenter4u-logo.svg",
    url: "https://aicenter4u.com",
    telephone: "+1-513-555-0183",
    email: "info@aicenter4u.com",
    priceRange: "$$$$",
    address: {
      "@type": "PostalAddress",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 39.1031,
      longitude: -84.5120,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "17:00",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "47",
    },
  };

  return (
    <Script
      id="localbusiness-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
    />
  );
}

// Service Schema
interface ServiceJsonLdProps {
  name: string;
  description: string;
  url: string;
  provider?: string;
  areaServed?: string;
}

export function ServiceJsonLd({
  name,
  description,
  url,
  provider = "AICenter4U",
  areaServed = "United States",
}: ServiceJsonLdProps) {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url,
    provider: {
      "@type": "Organization",
      name: provider,
      url: "https://aicenter4u.com",
    },
    areaServed: {
      "@type": "Country",
      name: areaServed,
    },
    serviceType: "Business Coaching",
  };

  return (
    <Script
      id={`service-jsonld-${name.toLowerCase().replace(/\s+/g, "-")}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
    />
  );
}

// FAQ Schema
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQJsonLdProps {
  faqs: FAQItem[];
}

export function FAQJsonLd({ faqs }: FAQJsonLdProps) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <Script
      id="faq-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  );
}

// Breadcrumb Schema
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Script
      id="breadcrumb-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
    />
  );
}

// Article/Blog Schema
interface ArticleJsonLdProps {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
}

export function ArticleJsonLd({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  authorName,
}: ArticleJsonLdProps) {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    image,
    datePublished,
    dateModified,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "AICenter4U",
      logo: {
        "@type": "ImageObject",
        url: "https://aicenter4u.com/aicenter4u-logo.svg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return (
    <Script
      id="article-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
    />
  );
}

// WebSite Schema with SearchAction
export function WebsiteJsonLd() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AICenter4U",
    alternateName: "AICenter4U",
    url: "https://aicenter4u.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://aicenter4u.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Script
      id="website-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
    />
  );
}

import { AICenter4UHeroCarousel } from "@/components/marketing/aicenter4u-hero-carousel";
import { AICenter4UServicesOverview } from "@/components/marketing/aicenter4u-services-overview";
import { AICenter4UStatsSection } from "@/components/marketing/aicenter4u-stats-section";
import { AICenter4UHowItWorks } from "@/components/marketing/aicenter4u-how-it-works";
import { AICenter4UTestimonials } from "@/components/marketing/aicenter4u-testimonials";
import { AICenter4UFAQSection } from "@/components/marketing/aicenter4u-faq-section";
import { AICenter4UCTASection } from "@/components/marketing/aicenter4u-cta-section";

export default function HomePage() {
  return (
    <>
      <AICenter4UHeroCarousel />
      <AICenter4UServicesOverview />
      <AICenter4UHowItWorks />
      <AICenter4UStatsSection />
      <AICenter4UTestimonials />
      <AICenter4UFAQSection />
      <AICenter4UCTASection />
    </>
  );
}

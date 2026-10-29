import { CurioQuestHeroCarousel } from "@/components/marketing/curioquest-hero-carousel";
import { CurioQuestServicesOverview } from "@/components/marketing/curioquest-services-overview";
import { CurioQuestStatsSection } from "@/components/marketing/curioquest-stats-section";
import { CurioQuestHowItWorks } from "@/components/marketing/curioquest-how-it-works";
import { CurioQuestTestimonials } from "@/components/marketing/curioquest-testimonials";
import { CurioQuestFAQSection } from "@/components/marketing/curioquest-faq-section";
import { CurioQuestCTASection } from "@/components/marketing/curioquest-cta-section";

export default function HomePage() {
  return (
    <>
      <CurioQuestHeroCarousel />
      <CurioQuestServicesOverview />
      <CurioQuestHowItWorks />
      <CurioQuestStatsSection />
      <CurioQuestTestimonials />
      <CurioQuestFAQSection />
      <CurioQuestCTASection />
    </>
  );
}

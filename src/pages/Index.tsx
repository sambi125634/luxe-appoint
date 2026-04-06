import { useRef } from "react";
import { LandingNavbar } from "@/components/landing";
import { TopBanner } from "@/components/landing/TopBanner";
import { NewHeroSection } from "@/components/landing/NewHeroSection";
import { OwnYourClientsSection } from "@/components/landing/OwnYourClientsSection";
import { SalonLossCalculator } from "@/components/landing/SalonLossCalculator";
import { SystemFlowSection } from "@/components/landing/SystemFlowSection";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { InteractivePhoneMockup } from "@/components/landing/InteractivePhoneMockup";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { AudienceSection } from "@/components/landing/AudienceSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { GuaranteeSection } from "@/components/landing/GuaranteeSection";
import { NewFAQSection } from "@/components/landing/NewFAQSection";
import { NewLandingFooter } from "@/components/landing/NewLandingFooter";

const Index = () => {
  const pricingRef = useRef<HTMLDivElement>(null);

  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBanner />
      <LandingNavbar onScrollToForm={scrollToPricing} />

      <main>
        <NewHeroSection onScrollToForm={scrollToPricing} />
        <OwnYourClientsSection />
        <SalonLossCalculator />
        <SystemFlowSection onScrollToForm={scrollToPricing} />
        <ComparisonSection />
        <InteractivePhoneMockup />
        <TestimonialsSection />
        <AudienceSection />
        <div ref={pricingRef}>
          <PricingSection onScrollToForm={scrollToPricing} />
        </div>
        <GuaranteeSection />
        <NewFAQSection />
      </main>

      <NewLandingFooter />
    </div>
  );
};

export default Index;

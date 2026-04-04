import { useRef } from "react";
import { LandingNavbar, LeadFormSection } from "@/components/landing";
import { NewHeroSection } from "@/components/landing/NewHeroSection";
import { SocialProofBar } from "@/components/landing/SocialProofBar";

import { ProblemSection } from "@/components/landing/ProblemSection";
import { GameChangerFeaturesSection } from "@/components/landing/GameChangerFeaturesSection";
import { OwnYourClientsSection } from "@/components/landing/OwnYourClientsSection";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { ValueStackSection } from "@/components/landing/ValueStackSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import DemoPreviewSection from "@/components/landing/DemoPreviewSection";
import { MobileAppSection } from "@/components/landing/MobileAppSection";
import { AudienceSection } from "@/components/landing/AudienceSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { GuaranteeSection } from "@/components/landing/GuaranteeSection";
import { NewFAQSection } from "@/components/landing/NewFAQSection";
import { NewFinalCTASection } from "@/components/landing/NewFinalCTASection";
import { NewLandingFooter } from "@/components/landing/NewLandingFooter";

const Index = () => {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar onScrollToForm={scrollToForm} />

      <main>
        <NewHeroSection onScrollToForm={scrollToForm} />
        <SocialProofBar />
        <LossNumbersSection />
        <ProblemSection onScrollToForm={scrollToForm} />
        <GameChangerFeaturesSection />
        <OwnYourClientsSection />
        <ComparisonSection />
        <ValueStackSection />
        <TestimonialsSection />
        <DemoPreviewSection />
        <MobileAppSection />
        <AudienceSection />
        <PricingSection onScrollToForm={scrollToForm} />
        <GuaranteeSection />

        <div ref={formRef}>
          <LeadFormSection />
        </div>

        <NewFAQSection />
        <NewFinalCTASection onScrollToForm={scrollToForm} />
      </main>

      <NewLandingFooter />
    </div>
  );
};

export default Index;

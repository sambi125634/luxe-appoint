import { useRef } from "react";
import { LandingNavbar, LeadFormSection } from "@/components/landing";
import { NewHeroSection } from "@/components/landing/NewHeroSection";
import { SocialProofBar } from "@/components/landing/SocialProofBar";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { TransformationSection } from "@/components/landing/TransformationSection";
import { AIGameChangersSection } from "@/components/landing/AIGameChangersSection";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { InteractiveDemoSection } from "@/components/landing/InteractiveDemoSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { AudienceSection } from "@/components/landing/AudienceSection";
import { PricingSection } from "@/components/landing/PricingSection";
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
        <ProblemSection />
        <TransformationSection />
        <AIGameChangersSection />
        <ComparisonSection />
        <FeaturesSection />
        <InteractiveDemoSection />
        <TestimonialsSection />
        <AudienceSection />
        <PricingSection onScrollToForm={scrollToForm} />
        
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

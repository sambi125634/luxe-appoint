import { useRef } from "react";
import {
  HeroSection,
  PainPointsSection,
  SolutionSection,
  HowItWorksSection,
  DemoPreviewSection,
  TargetAudienceSection,
  LeadFormSection,
  FAQSection,
  FinalCTASection,
  LandingNavbar,
  LandingFooter,
} from "@/components/landing";

const Index = () => {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar onScrollToForm={scrollToForm} />
      
      <main>
        <HeroSection onScrollToForm={scrollToForm} />
        
        <section id="features">
          <PainPointsSection />
          <SolutionSection />
        </section>
        
        <section id="how-it-works">
          <HowItWorksSection />
        </section>
        
        <section id="demo-preview">
          <DemoPreviewSection />
        </section>
        
        <TargetAudienceSection />
        
        <div ref={formRef}>
          <LeadFormSection />
        </div>
        
        <section id="faq">
          <FAQSection />
        </section>
        
        <FinalCTASection onScrollToForm={scrollToForm} />
      </main>
      
      <LandingFooter />
    </div>
  );
};

export default Index;

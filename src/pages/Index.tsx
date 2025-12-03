import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { HeroSection } from "@/components/landing/HeroSection";
import { PainPointsSection } from "@/components/landing/PainPointsSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { DemoPreviewSection } from "@/components/landing/DemoPreviewSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { TargetAudienceSection } from "@/components/landing/TargetAudienceSection";
import { DemoOfferSection } from "@/components/landing/DemoOfferSection";
import { LeadFormSection } from "@/components/landing/LeadFormSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";

export default function Index() {
  const scrollToDemo = () => {
    document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToForm = () => {
    document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-serif text-xl font-semibold">Beauty Calendar</span>
          </Link>
          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="sm" onClick={scrollToDemo} className="hidden sm:flex">
              Demo
            </Button>
            <Link to="/admin">
              <Button variant="outline" size="sm" className="hidden md:flex">
                Panel salonu
              </Button>
            </Link>
            <Button variant="luxury" size="sm" onClick={scrollToForm}>
              Zgłoś salon
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection onScrollToDemo={scrollToDemo} />

      {/* Pain Points Section */}
      <PainPointsSection />

      {/* Solution Section */}
      <SolutionSection />

      {/* Demo Preview Section */}
      <DemoPreviewSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Target Audience Section */}
      <TargetAudienceSection />

      {/* Demo Offer Section */}
      <DemoOfferSection />

      {/* Lead Form Section */}
      <LeadFormSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Final CTA Section */}
      <FinalCTASection onScrollToForm={scrollToForm} />

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border bg-muted/20">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-serif font-semibold">Beauty Calendar</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/demo" className="hover:text-foreground transition-colors">Demo</Link>
              <Link to="/admin" className="hover:text-foreground transition-colors">Panel salonu</Link>
              <button onClick={scrollToForm} className="hover:text-foreground transition-colors">Kontakt</button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2024 Beauty Calendar. Stworzone z miłością do piękna.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
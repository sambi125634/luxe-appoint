import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, Sparkles } from "lucide-react";

interface HeroSectionProps {
  onScrollToForm: () => void;
}

const HeroSection = ({ onScrollToForm }: HeroSectionProps) => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-deep/20 via-background to-burgundy/10" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gold/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-deep/20 rounded-full blur-3xl animate-pulse" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium text-gold">{t("hero.badge")}</span>
          </div>
          
          {/* Main headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in leading-tight">
            {t("hero.title")}{" "}
            <span className="text-gradient-luxury">{t("hero.titleHighlight")}</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in leading-relaxed">
            {t("hero.description")}
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-violet-deep to-burgundy hover:opacity-90 text-white px-8 py-6 text-lg group"
              onClick={() => window.location.href = '/demo'}
            >
              <Calendar className="mr-2 h-5 w-5" />
              {t("hero.secondaryCta")}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-gold/30 hover:bg-gold/10 px-8 py-6 text-lg"
              onClick={onScrollToForm}
            >
              {t("hero.cta")}
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-muted-foreground animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm">{t("hero.badge")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm">{t("howItWorks.step3.description")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

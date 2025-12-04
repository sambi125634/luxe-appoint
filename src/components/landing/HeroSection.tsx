import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, CheckCircle, Zap } from "lucide-react";

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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-gold/5 to-burgundy/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-8 animate-fade-in">
            <Zap className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium text-gold">{t("hero.badge")}</span>
          </div>
          
          {/* Main headline - stronger, action-oriented */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-foreground mb-4 animate-fade-in leading-tight">
            {t("hero.title")}
          </h1>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-8 animate-fade-in leading-tight">
            <span className="text-gradient-luxury">{t("hero.titleHighlight")}</span>
          </h2>
          
          {/* Subtitle - benefit focused */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in leading-relaxed">
            {t("hero.description")}
          </p>
          
          {/* CTAs - stronger, benefit-oriented */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in mb-8">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-gold via-gold/90 to-gold/80 hover:from-gold/90 hover:to-gold/70 text-background font-bold px-10 py-7 text-lg group shadow-lg shadow-gold/25 hover:shadow-xl hover:shadow-gold/30 transition-all"
              onClick={onScrollToForm}
            >
              {t("hero.cta")}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-foreground/20 hover:bg-foreground/5 px-8 py-7 text-lg group"
              onClick={() => window.location.href = '/demo'}
            >
              <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              {t("hero.secondaryCta")}
            </Button>
          </div>
          
          {/* Trust indicators - more specific */}
          <div className="flex flex-wrap justify-center gap-6 text-muted-foreground animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">{t("hero.trustBadge1")}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">{t("hero.trustBadge2")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

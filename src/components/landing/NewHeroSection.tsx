import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedMockup from "./AnimatedMockup";

interface NewHeroSectionProps {
  onScrollToForm: () => void;
}

export const NewHeroSection = ({ onScrollToForm }: NewHeroSectionProps) => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/3 rounded-full blur-3xl" />
      </div>
      
      {/* Floating sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <Sparkles
            key={i}
            className="absolute text-accent/40 animate-pulse"
            style={{
              top: `${15 + i * 15}%`,
              left: `${5 + i * 18}%`,
              animationDelay: `${i * 0.5}s`,
              width: 16 + i * 4,
              height: 16 + i * 4,
            }}
          />
        ))}
      </div>

      <div className="container relative z-10 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Badge */}
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <Badge 
                variant="outline" 
                className="px-4 py-2 text-sm font-medium border-primary/30 bg-primary/5 text-primary"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                🚀 Jedyny kalendarz z AI dla salonów beauty
              </Badge>
            </div>

            {/* Headline */}
            <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                Twój system rezerwacji pracuje za Ciebie 24/7.{" "}
                <span className="text-gradient-luxury">
                  I nie bierze prowizji od Twoich klientek.
                </span>
              </h1>
            </div>

            {/* Subheadline */}
            <p 
              className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              Pierwszy system z AI, który przewiduje przychody, eliminuje no-showy 
              i wypełnia luki w grafiku — automatycznie. Za 0% prowizji.
            </p>

            {/* CTAs */}
            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in"
              style={{ animationDelay: '0.4s' }}
            >
              <Button 
                size="lg" 
                onClick={onScrollToForm}
                className="group relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Załóż konto za darmo
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-20" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                asChild
                className="group px-8 py-6 text-lg border-2 hover:bg-primary/5"
              >
                <Link to="/demo">
                  <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Zobacz demo na żywo
                </Link>
              </Button>
            </div>

            {/* Social Proof Bar */}
            <div 
              className="animate-fade-in"
              style={{ animationDelay: '0.45s' }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-emerald-600 font-bold text-sm">
                  Zaufało nam już ponad 150+ salonów w całej Polsce
                </span>
              </div>
            </div>

            {/* Trust indicators */}
            <div 
              className="flex flex-wrap gap-6 justify-center lg:justify-start text-sm text-muted-foreground animate-fade-in"
              style={{ animationDelay: '0.5s' }}
            >
              {[
                "Bez karty kredytowej",
                "Gotowe w 5 minut",
                "14 dni za darmo"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right content - Animated Mockup */}
          <div 
            className="relative animate-fade-in lg:animate-slide-in-right"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="relative">
              {/* Glow effect behind mockup */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 blur-3xl scale-110 opacity-50" />
              
              <AnimatedMockup />
              
              {/* Floating notification badges */}
              <div className="absolute -top-4 -right-4 bg-card shadow-lg rounded-lg p-3 border border-border animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="font-medium">+23% rezerwacji</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-card shadow-lg rounded-lg p-3 border border-border animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="font-medium">AI aktywne</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-primary/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

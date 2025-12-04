import { useTranslation } from "react-i18next";
import { UserPlus, Palette, Code2, Rocket, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const HowItWorksSection = () => {
  const { t } = useTranslation();

  const steps = [
    {
      icon: UserPlus,
      number: "01",
      title: t("howItWorks.step1.title"),
      description: t("howItWorks.step1.description"),
      highlight: t("howItWorks.step1.highlight"),
      color: "from-primary to-primary/70",
    },
    {
      icon: Palette,
      number: "02",
      title: t("howItWorks.step2.title"),
      description: t("howItWorks.step2.description"),
      highlight: t("howItWorks.step2.highlight"),
      color: "from-secondary to-secondary/70",
    },
    {
      icon: Code2,
      number: "03",
      title: t("howItWorks.step3.title"),
      description: t("howItWorks.step3.description"),
      highlight: t("howItWorks.step3.highlight"),
      color: "from-accent to-accent/70",
    },
    {
      icon: Rocket,
      number: "04",
      title: t("howItWorks.step4.title"),
      description: t("howItWorks.step4.description"),
      highlight: t("howItWorks.step4.highlight"),
      color: "from-primary to-secondary",
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-background to-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <Clock className="w-4 h-4" />
            {t("howItWorks.badge")}
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
            {t("howItWorks.title")}
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl animate-fade-in" style={{ animationDelay: "200ms" }}>
            {t("howItWorks.subtitle")}
          </p>
        </div>
        
        {/* Steps - Timeline layout */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent transform md:-translate-x-1/2" />
            
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              const Icon = step.icon;
              
              return (
                <div 
                  key={index} 
                  className={cn(
                    "relative flex items-start gap-8 mb-12 last:mb-0 animate-fade-in",
                    "md:gap-0"
                  )}
                  style={{ animationDelay: `${300 + index * 150}ms` }}
                >
                  {/* Content - alternating sides on desktop */}
                  <div className={cn(
                    "flex-1 pl-20 md:pl-0",
                    "md:flex md:items-center",
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  )}>
                    {/* Text content */}
                    <div className={cn(
                      "md:w-[calc(50%-3rem)] md:px-6",
                      isEven ? "md:text-right" : "md:text-left"
                    )}>
                      <div className={cn(
                        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3",
                        `bg-gradient-to-r ${step.color} text-white`
                      )}>
                        {step.highlight}
                      </div>
                      <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                    
                    {/* Icon circle - center */}
                    <div className="absolute left-0 md:left-1/2 md:relative md:mx-0 transform md:-translate-x-0">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110",
                        `bg-gradient-to-br ${step.color}`
                      )}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-card border-2 border-primary flex items-center justify-center text-xs font-bold text-primary shadow-sm">
                        {step.number}
                      </div>
                    </div>
                    
                    {/* Empty space for alignment on desktop */}
                    <div className="hidden md:block md:w-[calc(50%-3rem)]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: "900ms" }}>
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">{t("howItWorks.cta.title")}</p>
                <p className="text-sm text-muted-foreground">{t("howItWorks.cta.subtitle")}</p>
              </div>
            </div>
            <a href="#lead-form" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
              {t("howItWorks.cta.button")}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

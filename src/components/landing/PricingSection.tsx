import { Check, Sparkles, ArrowRight, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface PricingSectionProps {
  onScrollToForm: () => void;
}

const plans = [
  {
    name: "FREE",
    price: "0 zł",
    period: "/ miesiąc",
    description: "Idealny na start",
    features: [
      "1 lokalizacja",
      "Do 3 pracowników",
      "Nieograniczone rezerwacje",
      "Podstawowe raporty",
      "Przypomnienia SMS/email",
      "Email support",
    ],
    cta: "Zacznij za darmo",
    ctaLink: "/auth",
    popular: false,
    icon: Zap,
  },
  {
    name: "PRO",
    price: "99 zł",
    period: "/ miesiąc",
    description: "Najczęściej wybierany",
    features: [
      "Wszystko z FREE plus:",
      "Nieograniczeni pracownicy",
      "AI Smart Scheduling",
      "Prognoza przychodów",
      "Radar Odejść (Client Risk Score)",
      "Zaawansowane raporty i księgowość",
      "Dynamiczne ceny AI",
      "Priority support",
    ],
    cta: "Rozpocznij 30-dniowy trial",
    ctaLink: "/auth",
    popular: true,
    icon: Sparkles,
  },
  {
    name: "VIP",
    price: "497 zł",
    setupFee: true,
    recurringPrice: "+ 199 zł/mies.",
    period: "",
    description: "Dla sieci salonów",
    features: [
      "Wszystko z PRO plus:",
      "Onboarding done-for-you",
      "Wiele lokalizacji",
      "Dedicated account manager",
      "Pipeline sprzedażowy",
      "API access",
      "Integracja GoHighLevel",
      "Custom branding",
    ],
    cta: "Umów rozmowę",
    popular: false,
    icon: Crown,
  },
];

export const PricingSection = ({ onScrollToForm }: PricingSectionProps) => {
  return (
    <section id="pricing" className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/20">
      <div className="container">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Prosty cennik.{" "}
            <span className="text-gradient-luxury">Bez niespodzianek.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Zacznij za darmo, płać gdy rośniesz. Prowizja od rezerwacji? Zawsze 0%.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={cn(
                "relative overflow-hidden transition-all duration-300 hover:-translate-y-1",
                plan.popular 
                  ? "border-primary shadow-xl scale-105 z-10" 
                  : "border-border/50 hover:border-border hover:shadow-lg"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  Najpopularniejszy
                </div>
              )}
              
              <CardHeader className={cn("text-center pb-0", plan.popular && "pt-10")}>
                <div className="flex justify-center mb-3">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    plan.popular ? "bg-primary/20" : "bg-muted"
                  )}>
                    <plan.icon className={cn("w-6 h-6", plan.popular ? "text-primary" : "text-muted-foreground")} />
                  </div>
                </div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.setupFee && (
                    <span className="text-sm text-muted-foreground block mt-1">
                      jednorazowy setup {plan.recurringPrice}
                    </span>
                  )}
                  {!plan.setupFee && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {plan.description}
                </p>
              </CardHeader>
              
              <CardContent className="pt-6">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {plan.ctaLink ? (
                  <Button 
                    asChild
                    className={cn(
                      "w-full",
                      !plan.popular && "bg-muted hover:bg-muted/80 text-foreground"
                    )}
                    variant={plan.popular ? "default" : "secondary"}
                  >
                    <Link to={plan.ctaLink}>
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                ) : (
                  <Button 
                    onClick={onScrollToForm}
                    className="w-full bg-muted hover:bg-muted/80 text-foreground"
                    variant="secondary"
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom note */}
        <div className="text-center mt-12">
          <Badge variant="outline" className="px-4 py-2 text-sm">
            💡 Prowizja od rezerwacji? <strong>0 zł</strong>. Zawsze. Niezależnie od planu.
          </Badge>
        </div>
      </div>
    </section>
  );
};

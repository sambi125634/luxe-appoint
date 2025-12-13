import { Check, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
      "Email support",
    ],
    cta: "Zacznij za darmo",
    popular: false,
  },
  {
    name: "PRO",
    price: "49 zł",
    period: "/ miesiąc",
    description: "Najczęściej wybierany",
    features: [
      "Wszystko z FREE plus:",
      "Nieograniczeni pracownicy",
      "AI Smart Scheduling",
      "Prognoza przychodów",
      "Client Risk Score",
      "Zaawansowane raporty",
      "Priority support",
    ],
    cta: "Rozpocznij 14-dniowy trial",
    popular: true,
  },
  {
    name: "BUSINESS",
    price: "99 zł",
    period: "/ miesiąc",
    description: "Dla sieci salonów",
    features: [
      "Wszystko z PRO plus:",
      "Wiele lokalizacji",
      "Pipeline sprzedażowy",
      "Integracja GoHighLevel",
      "API access",
      "Dedicated account manager",
    ],
    cta: "Skontaktuj się z nami",
    popular: false,
  },
];

export const PricingSection = ({ onScrollToForm }: PricingSectionProps) => {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/20">
      <div className="container">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Prosty cennik.{" "}
            <span className="text-gradient-luxury">Bez niespodzianek.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Zacznij za darmo, płać gdy rośniesz
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
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
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
                
                <Button 
                  onClick={onScrollToForm}
                  className={cn(
                    "w-full",
                    plan.popular 
                      ? "" 
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  )}
                  variant={plan.popular ? "default" : "secondary"}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
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

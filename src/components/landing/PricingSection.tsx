import { useState } from "react";
import { Check, Sparkles, ArrowRight, Crown, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface PricingSectionProps {
  onScrollToForm: () => void;
}

export const PricingSection = ({ onScrollToForm }: PricingSectionProps) => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "FREE",
      price: "0 zł",
      period: "/ na zawsze",
      description: "Zacznij w 60 sekund. Zero karty, zero prowizji, zero ryzyka.",
      features: [
        "Kalendarz — widok dzienny i tygodniowy",
        "1 pracownik",
        "Do 10 usług w katalogu",
        "1 widget rezerwacji + link do udostępnienia",
        "Baza do 50 klientów z historią",
        "Potwierdzenia email",
        "Profil salonu + godziny otwarcia",
      ],
      limitations: [
        "SMS i przypomnienia automatyczne",
        "Raporty i statystyki",
        "Magazyn i skaner",
        "Zaawansowany CRM",
        "AI features",
      ],
      cta: "Zacznij za darmo",
      ctaLink: "/auth",
      popular: false,
      icon: Zap,
    },
    {
      name: "PRO",
      price: isAnnual ? "119 zł" : "149 zł",
      period: "/ miesiąc",
      description: "Pełne zarządzanie salonem. Jedna wizyta manicure — i cały system się zwraca.",
      features: [
        "Wszystko z FREE +",
        "Do 5 pracowników z osobnymi kalendarzami",
        "Nieograniczone usługi i widgety rezerwacji",
        "SMS + email — potwierdzenia, przypomnienia, follow-up",
        "CRM — tagi, segmentacja, voice notes, pełna historia",
        "📷 Skaner magazynowy przez aparat telefonu",
        "Raporty przychodów, no-show, retencji",
        "Kody rabatowe + UTM tracking kampanii",
        "Własne logo i kolory na widgecie",
        "Własna domena rezerwacji (np. rezerwacje.twojsalon.pl)",
      ],
      limitations: [
        "AI Autopilot Engine (12 funkcji)",
        "Multi-lokalizacja",
        "White-label / API",
      ],
      cta: "Wybierz PRO",
      ctaLink: "/auth",
      popular: true,
      icon: Sparkles,
      savings: isAnnual ? "Oszczędzasz 360 zł/rok" : undefined,
    },
    {
      name: "ELITE",
      price: isAnnual ? "279 zł" : "349 zł",
      setupFee: true,
      setupPrice: "497 zł",
      period: "/ miesiąc",
      badge: "CEO LEVEL",
      description: "AI pracuje na Twój salon 24/7. Ty prowadzisz biznes. System zarabia.",
      features: [
        "Wszystko z PRO +",
        "🤖 AI Autopilot Engine — 12 funkcji sztucznej inteligencji",
        "Silent Fans Detector™ — reaktywacja cichych fanów",
        "Smart Gap Management — AI wypełnia luki w kalendarzu",
        "AI Upsell Engine — automatyczne dosprzedawanie usług",
        "True Profit Dashboard — zysk netto per zabieg",
        "Churn Prediction — kto odchodzi i dlaczego",
        "Nielimitowani pracownicy + multi-lokalizacja",
        "White-label + API + webhooks",
        "1h prywatny onboarding z ekspertem (wideo)",
        "Priorytetowe wsparcie — odpowiedź w 2h",
      ],
      cta: "Umów prywatny onboarding",
      popular: false,
      icon: Crown,
      savings: isAnnual ? "Oszczędzasz 840 zł/rok" : undefined,
    },
  ];

  return (
    <section id="pricing" className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/20">
      <div className="container">
        {/* Section header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Booksy bierze do 81 000 zł rocznie w prowizjach.
            <br />
            <span className="text-gradient-luxury">Beauty Calendar zaczyna od 0 zł.</span>
          </h2>
        </motion.div>

        {/* Annual/Monthly toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={cn("text-sm font-medium", !isAnnual ? "text-foreground" : "text-muted-foreground")}>
            Miesięcznie
          </span>
          <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
          <span className={cn("text-sm font-medium", isAnnual ? "text-foreground" : "text-muted-foreground")}>
            Rocznie (oszczędzasz 20%)
          </span>
          {isAnnual && (
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              -20%
            </Badge>
          )}
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              custom={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card
                className={cn(
                  "relative overflow-hidden transition-all duration-300 hover:-translate-y-1 h-full",
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

                {plan.badge && !plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-1 text-sm font-medium">
                    <Crown className="w-4 h-4 inline mr-1" />
                    {plan.badge}
                  </div>
                )}

                <CardHeader className={cn("text-center pb-0", (plan.popular || plan.badge) && "pt-10")}>
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
                    <span className="text-muted-foreground text-sm"> {plan.period}</span>
                    {plan.setupFee && (
                      <span className="text-sm text-muted-foreground block mt-1">
                        + {plan.setupPrice} jednorazowy onboarding
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {plan.description}
                  </p>
                  {plan.savings && (
                    <Badge className="mt-2 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      {plan.savings}
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="pt-6">
                  <ul className="space-y-3 mb-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.limitations && (
                    <div className="mb-6 pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Nie zawiera:</p>
                      {plan.limitations.map((lim, i) => (
                        <p key={i} className="text-xs text-muted-foreground/70 mb-1">— {lim}</p>
                      ))}
                    </div>
                  )}

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
            </motion.div>
          ))}
        </div>

        {/* Bottom info */}
        <motion.div
          className="text-center mt-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-sm text-muted-foreground">
            Płatności: Przelewy24 (BLIK, przelew bankowy, karta)<br />
            Rezygnacja jednym kliknięciem · Bez okresu wypowiedzenia · Bez ukrytych opłat
          </p>
        </motion.div>
      </div>
    </section>
  );
};
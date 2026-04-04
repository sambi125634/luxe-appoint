import { useState } from "react";
import { Check, Sparkles, ArrowRight, Crown, Zap, ShieldCheck, X } from "lucide-react";
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
      price: "0 z\u0142",
      period: "/ na zawsze",
      description: "Dla jednoosobowych dzia\u0142alno\u015Bci. Zacznij w 60 sekund, bez karty, bez ryzyka.",
      features: [
        "1 pracownik",
        "Do 50 klientek w bazie",
        "Do 10 us\u0142ug w katalogu",
        "Do 20 produkt\u00F3w w magazynie",
        "1 widget rezerwacji + link",
        "Potwierdzenia email",
        "Profil salonu + godziny otwarcia",
      ],
      limitations: [
        "Aplikacje mobilne",
        "SMS i przypomnienia automatyczne",
        "Raporty i statystyki",
        "AI Autopilot",
        "CRM zaawansowany",
        "Programy polece\u0144",
      ],
      cta: "Zacznij za darmo",
      ctaLink: "/auth",
      popular: false,
      icon: Zap,
    },
    {
      name: "PRO",
      price: isAnnual ? "79 z\u0142 netto" : "99 z\u0142 netto",
      period: "/ miesi\u0105c",
      description: "Pe\u0142ne zarz\u0105dzanie salonem. Jedna wizyta manicure \u2014 i ca\u0142y system si\u0119 zwraca.",
      features: [
        "Wszystko z FREE +",
        "Nieograniczeni pracownicy",
        "Nieograniczone us\u0142ugi i klientki",
        "Aplikacja mobilna (w\u0142a\u015Bciciel + klientka)",
        "SMS + email \u2014 potwierdzenia, przypomnienia, follow-up",
        "CRM \u2014 tagi, segmentacja, voice notes, pe\u0142na historia",
        "\uD83D\uDCF7 Skaner magazynowy przez aparat telefonu",
        "Raporty przychod\u00F3w, no-show, retencji",
        "R\u0119czne sekwencje retencyjne (\u015Acie\u017Cka Klientki)",
        "Programy polece\u0144 + Google Reviews",
        "Eksport danych i raporty finansowe",
        "Nieograniczony magazyn",
      ],
      limitations: [
        "AI Autopilot Engine (12 funkcji)",
        "Prywatny onboarding 1:1",
        "Konsultacja strategiczna",
      ],
      cta: "Wybierz PRO",
      ctaLink: "/auth",
      popular: true,
      icon: Sparkles,
      savings: isAnnual ? "Oszcz\u0119dzasz 240 z\u0142/rok" : undefined,
    },
    {
      name: "ELITE",
      price: isAnnual ? "279 z\u0142" : "349 z\u0142",
      setupFee: true,
      setupPrice: "497 z\u0142",
      period: "/ miesi\u0105c",
      badge: "CEO LEVEL",
      description: "AI pracuje na Tw\u00F3j salon 24/7. My konfigurujemy sekwencje za Ciebie.",
      features: [
        "Wszystko z PRO +",
        "\uD83E\uDD16 AI Autopilot Engine \u2014 12 funkcji sztucznej inteligencji",
        "Silent Fans Detector\u2122 \u2014 reaktywacja cichych fan\u00F3w",
        "Smart Gap Management \u2014 AI wype\u0142nia luki w kalendarzu",
        "AI Upsell Engine \u2014 automatyczne dosprzedawanie us\u0142ug",
        "True Profit Dashboard \u2014 zysk netto per zabieg",
        "Churn Prediction \u2014 kto odchodzi i dlaczego",
        "Prywatny onboarding 1:1 z ekspertem (wideo)",
        "Konfiguracja sekwencji retencyjnych za Ciebie",
        "Konsultacja strategiczna \u2014 plan wzrostu salonu",
        "Priorytetowe wsparcie \u2014 odpowied\u017A w 2h",
      ],
      cta: "Um\u00F3w prywatny onboarding",
      popular: false,
      icon: Crown,
      savings: isAnnual ? "Oszcz\u0119dzasz 840 z\u0142/rok" : undefined,
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
            Prosta cena. Zero prowizji.
            <br />
            <span className="text-gradient-luxury">Pe\u0142na kontrola nad Twoim biznesem.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Zacznij za darmo. Przejd\u017A na PRO gdy b\u0119dziesz gotowa. \u017Badnych ukrytych op\u0142at.
          </p>
        </motion.div>

        {/* Annual/Monthly toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={cn("text-sm font-medium", !isAnnual ? "text-foreground" : "text-muted-foreground")}>
            Miesi\u0119cznie
          </span>
          <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
          <span className={cn("text-sm font-medium", isAnnual ? "text-foreground" : "text-muted-foreground")}>
            Rocznie (oszcz\u0119dzasz 20%)
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
                        <p key={i} className="text-xs text-muted-foreground/70 mb-1">\u2014 {lim}</p>
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
            Wszystkie ceny netto. P\u0142atno\u015Bci: Przelewy24 (BLIK, przelew bankowy, karta)<br />
            Rezygnacja jednym klikni\u0119ciem \u00B7 Bez okresu wypowiedzenia \u00B7 Bez ukrytych op\u0142at
          </p>
        </motion.div>
      </div>
    </section>
  );
};
import { useState } from "react";
import { Check, Sparkles, ArrowRight, Crown, Zap, Percent } from "lucide-react";
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
      description: "Dla jednoosobowych działalności które stawiają pierwsze kroki",
      features: [
        "Max 1 pracownik",
        "Max 50 klientek w bazie",
        "Max 10 usług",
        "Max 20 produktów w magazynie",
        "Tylko potwierdzenia email (bez SMS)",
        "Kalendarz + Widget rezerwacji",
        "Podstawowe statystyki",
      ],
      limitations: [
        "Aplikacja mobilna",
        "SMS i przypomnienia automatyczne",
        "AI Autopilot",
        "Retencja i sekwencje",
      ],
      cta: "Zacznij za darmo",
      ctaLink: "/auth",
      popular: false,
      icon: Zap,
    },
    {
      name: "PRO",
      price: isAnnual ? "79 zł netto" : "99 zł netto",
      period: "/ miesiąc",
      description: "Dla salonów które chcą rosnąć i odzyskać kontrolę",
      features: [
        "Wszystko z FREE +",
        "Nieograniczeni pracownicy",
        "Nieograniczone usługi i klientki",
        "Nieograniczony magazyn",
        "SMS + email powiadomienia",
        "Aplikacja mobilna (właściciel + klientka)",
        "Ścieżka Klientki™ (ręczna konfiguracja)",
        "Program poleceń",
        "Karty konsultacyjne",
        "Eksport danych",
        "Raporty finansowe + wysyłka do księgowej",
        "Receptury i True Profit",
        "Skanowanie kodów kamerą",
      ],
      limitations: [
        "AI Autopilot",
        "AI Segmentacja",
        "Prognoza AI",
        "Onboarding 1:1",
      ],
      cta: "Zacznij 14 dni bez karty",
      ctaLink: "/auth",
      popular: true,
      icon: Sparkles,
      savings: isAnnual ? "Oszczędzasz 240 zł/rok" : undefined,
    },
    {
      name: "ELITE",
      price: isAnnual ? "279 zł" : "349 zł",
      setupFee: true,
      setupPrice: "497 zł",
      period: "/ miesiąc",
      badge: "Pełna moc",
      description: "Dla salonów które chcą system który pracuje za nich 24/7",
      features: [
        "Wszystko z PRO +",
        "\ud83e\udd16 AI Autopilot (wykrywa, wysyła, reaguje)",
        "AI Segmentacja klientek automatyczna",
        "AI Prognoza przychodów (30 dni, 94%)",
        "Radar Odejść (wykrywa zagrożone klientki)",
        "Auto-zaliczki dla no-show przez AI",
        "Prywatny Onboarding Call 1:1",
        "Konfiguracja sekwencji za Ciebie",
        "Konsultacja strategiczna salonu",
        "Priorytetowy support — odpowiedź w 2h",
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
            <span className="text-gradient-luxury">Pełna kontrola nad Twoim biznesem.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Zacznij za darmo. Przejdź na PRO gdy będziesz gotowa. Żadnych ukrytych opłat.
          </p>
        </motion.div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={cn("text-sm font-medium", !isAnnual ? "text-foreground" : "text-muted-foreground")}>Miesięcznie</span>
          <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
          <span className={cn("text-sm font-medium", isAnnual ? "text-foreground" : "text-muted-foreground")}>Rocznie (oszczędzasz 20%)</span>
          {isAnnual && <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">-20%</Badge>}
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className={cn(
                "relative overflow-hidden transition-all duration-300 hover:-translate-y-1 h-full",
                plan.popular ? "border-primary shadow-xl scale-105 z-10" : "border-border/50 hover:border-border hover:shadow-lg"
              )}>
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                    <Sparkles className="w-4 h-4 inline mr-1" />Najpopularniejszy
                  </div>
                )}
                {plan.badge && !plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-1 text-sm font-medium">
                    <Crown className="w-4 h-4 inline mr-1" />{plan.badge}
                  </div>
                )}
                <CardHeader className={cn("text-center pb-0", (plan.popular || plan.badge) && "pt-10")}>
                  <div className="flex justify-center mb-3">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", plan.popular ? "bg-primary/20" : "bg-muted")}>
                      <plan.icon className={cn("w-6 h-6", plan.popular ? "text-primary" : "text-muted-foreground")} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm"> {plan.period}</span>
                    {plan.setupFee && <span className="text-sm text-muted-foreground block mt-1">+ {plan.setupPrice} jednorazowy onboarding</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                  {plan.savings && <Badge className="mt-2 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">{plan.savings}</Badge>}
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3 mb-4">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /><span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.limitations && (
                    <div className="mb-6 pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Nie zawiera:</p>
                      {plan.limitations.map((lim, i) => <p key={i} className="text-xs text-muted-foreground/70 mb-1">— {lim}</p>)}
                    </div>
                  )}
                  {plan.ctaLink ? (
                    <Button asChild className={cn("w-full", !plan.popular && "bg-muted hover:bg-muted/80 text-foreground")} variant={plan.popular ? "default" : "secondary"}>
                      <Link to={plan.ctaLink}>{plan.cta}<ArrowRight className="w-4 h-4 ml-2" /></Link>
                    </Button>
                  ) : (
                    <Button onClick={onScrollToForm} className="w-full bg-muted hover:bg-muted/80 text-foreground" variant="secondary">
                      {plan.cta}<ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Zero commission */}
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="inline-flex items-center gap-3 bg-card border border-border rounded-2xl px-8 py-4">
            <Percent className="w-5 h-5 text-primary" />
            <p className="font-bold text-lg">0% prowizji od rezerwacji — <span className="text-primary">zawsze.</span></p>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            W żadnym pakiecie nie pobieramy prowizji od wizyt Twoich klientek. Nigdy.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

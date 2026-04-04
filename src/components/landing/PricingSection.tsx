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
      price: "0 z\u0142",
      period: "/ na zawsze",
      description: "Dla jednoosobowych dzia\u0142alno\u015bci kt\u00f3re stawiaj\u0105 pierwsze kroki",
      features: [
        "Max 1 pracownik",
        "Max 50 klientek w bazie",
        "Max 10 us\u0142ug",
        "Max 20 produkt\u00f3w w magazynie",
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
      price: isAnnual ? "79 z\u0142 netto" : "99 z\u0142 netto",
      period: "/ miesi\u0105c",
      description: "Dla salon\u00f3w kt\u00f3re chc\u0105 rosn\u0105\u0107 i odzyska\u0107 kontrol\u0119",
      features: [
        "Wszystko z FREE +",
        "Nieograniczeni pracownicy",
        "Nieograniczone us\u0142ugi i klientki",
        "Nieograniczony magazyn",
        "SMS + email powiadomienia",
        "Aplikacja mobilna (w\u0142a\u015bciciel + klientka)",
        "\u015acie\u017cka Klientki\u2122 (r\u0119czna konfiguracja)",
        "Program polece\u0144",
        "Karty konsultacyjne",
        "Eksport danych",
        "Raporty finansowe + wysy\u0142ka do ksi\u0119gowej",
        "Receptury i True Profit",
        "Skanowanie kod\u00f3w kamer\u0105",
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
      savings: isAnnual ? "Oszcz\u0119dzasz 240 z\u0142/rok" : undefined,
    },
    {
      name: "ELITE",
      price: isAnnual ? "279 z\u0142" : "349 z\u0142",
      setupFee: true,
      setupPrice: "497 z\u0142",
      period: "/ miesi\u0105c",
      badge: "Pe\u0142na moc",
      description: "Dla salon\u00f3w kt\u00f3re chc\u0105 system kt\u00f3ry pracuje za nich 24/7",
      features: [
        "Wszystko z PRO +",
        "\ud83e\udd16 AI Autopilot (wykrywa, wysy\u0142a, reaguje)",
        "AI Segmentacja klientek automatyczna",
        "AI Prognoza przychod\u00f3w (30 dni, 94%)",
        "Radar Odej\u015b\u0107 (wykrywa zagro\u017cone klientki)",
        "Auto-zaliczki dla no-show przez AI",
        "Prywatny Onboarding Call 1:1",
        "Konfiguracja sekwencji za Ciebie",
        "Konsultacja strategiczna salonu",
        "Priorytetowy support \u2014 odpowied\u017a w 2h",
      ],
      cta: "Um\u00f3w prywatny onboarding",
      popular: false,
      icon: Crown,
      savings: isAnnual ? "Oszcz\u0119dzasz 840 z\u0142/rok" : undefined,
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
            <span className="text-gradient-luxury">Pe\u0142na kontrola nad Twoim biznesem.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Zacznij za darmo. Przejd\u017a na PRO gdy b\u0119dziesz gotowa. \u017badnych ukrytych op\u0142at.
          </p>
        </motion.div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={cn("text-sm font-medium", !isAnnual ? "text-foreground" : "text-muted-foreground")}>Miesi\u0119cznie</span>
          <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
          <span className={cn("text-sm font-medium", isAnnual ? "text-foreground" : "text-muted-foreground")}>Rocznie (oszcz\u0119dzasz 20%)</span>
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
                      {plan.limitations.map((lim, i) => <p key={i} className="text-xs text-muted-foreground/70 mb-1">\u2014 {lim}</p>)}
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
            <p className="font-bold text-lg">0% prowizji od rezerwacji \u2014 <span className="text-primary">zawsze.</span></p>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            W \u017cadnym pakiecie nie pobieramy prowizji od wizyt Twoich klientek. Nigdy.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

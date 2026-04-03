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
      name: "STARTER",
      price: "0 zł",
      period: "/ miesiąc — na zawsze",
      description: "Idealny na start. Zacznij bez ryzyka.",
      features: [
        "1 pracownik (właścicielka)",
        "Do 50 klientek w bazie",
        "Do 5 usług w katalogu",
        "1 widget rezerwacji",
        "Przypomnienia email",
        "Podstawowy dashboard",
        "0% prowizji od rezerwacji",
      ],
      limitations: [
        "Brak SMS",
        "Brak AI features",
        "Brak zaawansowanych raportów",
      ],
      cta: "Zacznij za darmo",
      ctaLink: "/auth",
      popular: false,
      icon: Zap,
    },
    {
      name: "PRO",
      price: isAnnual ? "79 zł" : "99 zł",
      period: "/ miesiąc",
      description: "Najczęściej wybierany. Pełna moc AI.",
      features: [
        "Nieograniczeni pracownicy",
        "Nieograniczona baza klientek",
        "Nieograniczone usługi i widgety",
        "SMS + email (potwierdzenia, przypomnienia)",
        "AI Autopilot (Smart Gap, Silent Fans, Churn)",
        "Prognoza przychodów (94% trafność)",
        "True Profit Dashboard",
        "Magazyn ze skanerem kodów kreskowych",
        "Program poleceń + Google Reviews",
        "Google Calendar sync",
        "Eksport danych CSV/PDF",
        "Branding (logo, kolory, custom slug)",
        "0% prowizji od rezerwacji",
      ],
      cta: "Rozpocznij za 99 zł/mies",
      ctaLink: "/auth",
      popular: true,
      icon: Sparkles,
      savings: isAnnual ? "Oszczędzasz 240 zł/rok" : undefined,
    },
    {
      name: "ELITE",
      price: isAnnual ? "199 zł" : "249 zł",
      setupFee: true,
      setupPrice: "497 zł",
      period: "/ miesiąc",
      description: "Dla ambitnych salonów i sieci.",
      features: [
        "Wszystko z PRO plus:",
        "Prywatny onboarding call (30 min)",
        "White-label (brak brandingu BC)",
        "Własna domena (rezerwacje.twojsalon.pl)",
        "Multi-lokalizacja (kilka salonów)",
        "Dostęp do API + Webhooks",
        "CEO Unicat Intelligence™ (AI insights)",
        "Mood Tracking + Pixel Conditioning",
        "Własny email i numer SMS (custom sender)",
        "Priorytetowe wsparcie techniczne",
        "0% prowizji od rezerwacji",
      ],
      cta: "Umów rozmowę",
      popular: false,
      icon: Crown,
      savings: isAnnual ? "Oszczędzasz 600 zł/rok" : undefined,
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
            Prosty cennik.{" "}
            <span className="text-gradient-luxury">Bez niespodzianek.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Zacznij za darmo, płać gdy rośniesz. Prowizja od rezerwacji? Zawsze 0%.
          </p>
        </motion.div>

        {/* Annual/Monthly toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={cn("text-sm font-medium", !isAnnual ? "text-foreground" : "text-muted-foreground")}>
            Miesięcznie
          </span>
          <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
          <span className={cn("text-sm font-medium", isAnnual ? "text-foreground" : "text-muted-foreground")}>
            Rocznie
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
                    <span className="text-muted-foreground text-sm"> {plan.period}</span>
                    {plan.setupFee && (
                      <span className="text-sm text-muted-foreground block mt-1">
                        + {plan.setupPrice} jednorazowy setup
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
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Ograniczenia:</p>
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

        {/* Anchoring vs Booksy */}
        <motion.div
          className="text-center mt-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
            <p className="text-xl font-bold mb-1 flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              0 zł prowizji od rezerwacji. Zawsze.
            </p>
            <p className="text-muted-foreground">
              99 zł/mies vs 3 000–6 000 zł/mies na prowizjach Booksy. To 30–60× taniej.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

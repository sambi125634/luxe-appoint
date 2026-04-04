import { useState } from "react";
import { Check, Sparkles, ArrowRight, Crown, Zap, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AnimatedHeadline, containerVariants, cardVariants, appleEaseArray } from "@/components/ui/AnimatedSection";

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
      features: ["Max 1 pracownik", "Max 50 klientek w bazie", "Max 10 usług", "Max 20 produktów w magazynie", "Tylko potwierdzenia email (bez SMS)", "Kalendarz + Widget rezerwacji", "Podstawowe statystyki"],
      limitations: ["Aplikacja mobilna", "SMS i przypomnienia automatyczne", "AI Autopilot", "Retencja i sekwencje"],
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
      features: ["Wszystko z FREE +", "Nieograniczeni pracownicy", "Nieograniczone usługi i klientki", "Nieograniczony magazyn", "SMS + email powiadomienia", "Aplikacja mobilna (właściciel + klientka)", "Ścieżka Klientki™ (ręczna konfiguracja)", "Program poleceń", "Karty konsultacyjne", "Eksport danych", "Raporty finansowe + wysyłka do księgowej", "Receptury i True Profit", "Skanowanie kodów kamerą"],
      limitations: ["AI Autopilot", "AI Segmentacja", "Prognoza AI", "Onboarding 1:1"],
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
      features: ["Wszystko z PRO +", "🤖 AI Autopilot (wykrywa, wysyła, reaguje)", "AI Segmentacja klientek automatyczna", "AI Prognoza przychodów (30 dni, 94%)", "Radar Odejść (wykrywa zagrożone klientki)", "Auto-zaliczki dla no-show przez AI", "Prywatny Onboarding Call 1:1", "Konfiguracja sekwencji za Ciebie", "Konsultacja strategiczna salonu", "Priorytetowy support — odpowiedź w 2h"],
      cta: "Umów prywatny onboarding",
      popular: false,
      icon: Crown,
      savings: isAnnual ? "Oszczędzasz 840 zł/rok" : undefined,
    },
  ];

  return (
    <section id="pricing" className="landing-section-dark landing-section-spacing" style={{ background: "linear-gradient(180deg, #faf9f7 0%, #f5f0ff 50%, #faf9f7 100%)" }}>
      <div className="max-w-[1200px] mx-auto px-[max(24px,5vw)]">
        <AnimatedHeadline className="text-center mb-10">
          <h2 className="headline-section mb-4" style={{ color: "#1d1d1f" }}>
            Prosta cena. Zero prowizji.
            <br />
            <span className="apple-accent-gradient">Pełna kontrola nad Twoim biznesem.</span>
          </h2>
          <p className="subheadline max-w-2xl mx-auto" style={{ color: "#6e6e73" }}>
            Zacznij za darmo. Przejdź na PRO gdy będziesz gotowa. Żadnych ukrytych opłat.
          </p>
        </AnimatedHeadline>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-14">
          <button
            onClick={() => setIsAnnual(false)}
            className={cn("text-sm font-medium px-4 py-2 rounded-full transition-all", !isAnnual ? "bg-[#8b5cf6] text-white" : "text-[#6e6e73]")}
          >
            Miesięcznie
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={cn("text-sm font-medium px-4 py-2 rounded-full transition-all", isAnnual ? "bg-[#8b5cf6] text-white" : "text-[#6e6e73]")}
          >
            Rocznie (-20%)
          </button>
        </div>

        {/* Cards */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {plans.map((plan, index) => (
            <motion.div key={index} variants={cardVariants}>
              <div className={cn(
                "bg-white rounded-[20px] p-8 h-full flex flex-col relative overflow-hidden transition-all duration-300 border",
                plan.popular ? "ring-2 ring-[#8b5cf6] scale-[1.02] border-[#8b5cf6]/20 shadow-lg shadow-[#8b5cf6]/10" : "border-black/6 shadow-sm"
              )}>
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 text-center py-1.5 text-xs font-semibold" style={{ background: "#8b5cf6", color: "#fff" }}>
                    <Sparkles className="w-3 h-3 inline mr-1" />Najpopularniejszy
                  </div>
                )}
                {plan.badge && !plan.popular && (
                  <div className="absolute top-0 left-0 right-0 text-center py-1.5 text-xs font-semibold" style={{ background: "linear-gradient(90deg, #f59e0b, #ef4444)", color: "#fff" }}>
                    <Crown className="w-3 h-3 inline mr-1" />{plan.badge}
                  </div>
                )}

                <div className={cn("text-center", (plan.popular || plan.badge) && "pt-8")}>
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: plan.popular ? "rgba(139,92,246,0.1)" : "#faf9f7" }}>
                      <plan.icon className="w-6 h-6" style={{ color: plan.popular ? "#8b5cf6" : "#86868b" }} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-4" style={{ color: "#1d1d1f", fontFamily: "'Inter', sans-serif" }}>{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold" style={{ color: "#1d1d1f", fontFamily: "'Playfair Display', serif" }}>{plan.price}</span>
                    <span className="text-sm" style={{ color: "#86868b" }}> {plan.period}</span>
                    {plan.setupFee && <span className="text-sm block mt-1" style={{ color: "#86868b" }}>+ {plan.setupPrice} jednorazowy onboarding</span>}
                  </div>
                  <p className="text-sm mb-2" style={{ color: "#6e6e73" }}>{plan.description}</p>
                  {plan.savings && <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "rgba(34,197,94,0.08)", color: "#16a34a" }}>{plan.savings}</span>}
                </div>

                <div className="flex-1 mt-6">
                  <ul className="space-y-3 mb-4">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#6e6e73" }}>
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /><span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.limitations && (
                    <div className="pt-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                      <p className="text-xs font-medium mb-2" style={{ color: "#86868b" }}>Nie zawiera:</p>
                      {plan.limitations.map((lim, i) => <p key={i} className="text-xs mb-1" style={{ color: "#c7c7cc" }}>— {lim}</p>)}
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  {plan.ctaLink ? (
                    <Link
                      to={plan.ctaLink}
                      className={cn(
                        "block w-full text-center rounded-full py-3.5 text-sm font-semibold transition-all",
                        plan.popular ? "apple-btn-primary" : "apple-btn-secondary-dark"
                      )}
                    >
                      {plan.cta} <ArrowRight className="w-4 h-4 inline ml-1" />
                    </Link>
                  ) : (
                    <button
                      onClick={onScrollToForm}
                      className="apple-btn-secondary-dark w-full text-sm"
                    >
                      {plan.cta} <ArrowRight className="w-4 h-4 inline ml-1" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3, ease: appleEaseArray }}
        >
          <div className="inline-flex items-center gap-3 bg-white rounded-[20px] border border-black/6 shadow-sm px-8 py-4">
            <Percent className="w-5 h-5 text-[#8b5cf6]" />
            <p className="font-bold text-lg" style={{ color: "#1d1d1f", fontFamily: "'Inter', sans-serif" }}>0% prowizji od rezerwacji — <span style={{ color: "#8b5cf6" }}>zawsze.</span></p>
          </div>
          <p className="text-sm mt-3" style={{ color: "#86868b" }}>
            W żadnym pakiecie nie pobieramy prowizji od wizyt Twoich klientek. Nigdy.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

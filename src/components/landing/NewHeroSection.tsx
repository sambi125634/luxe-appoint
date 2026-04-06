import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";

interface NewHeroSectionProps {
  onScrollToForm: () => void;
}

export const NewHeroSection = ({ onScrollToForm }: NewHeroSectionProps) => {
  const scrollToDemo = () => {
    document.getElementById("demo-preview")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[85vh] flex flex-col items-center overflow-hidden bg-background">
      {/* Warm gradient at bottom — peach/lavender fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[35%] pointer-events-none"
        style={{
          background: "linear-gradient(to top, hsl(30 30% 92% / 0.6), hsl(280 20% 94% / 0.3), transparent)",
        }}
      />

      <div className="container relative z-10 py-20 lg:py-28 flex flex-col items-center text-center">
        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0 }}
        >
          <Badge
            variant="outline"
            className="px-5 py-2.5 border-primary/20 bg-primary/5 text-primary mb-8"
            style={{ fontSize: "14px", fontWeight: 500, letterSpacing: "0.02em" }}
          >
            ✨ 🚀 Jedyny kalendarz z AI dla salonów beauty
          </Badge>
        </motion.div>

        {/* H1 — serif, dark plum */}
        <motion.h1
          className="max-w-4xl leading-[1.08] tracking-[-0.02em]"
          style={{
            fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
            fontSize: "clamp(36px, 5.5vw, 64px)",
            fontWeight: 700,
            color: "#1A1A2E",
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          Twój system rezerwacji pracuje za Ciebie 24/7.{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #7c3aed, #9b2d6b)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            I nie bierze prowizji od Twoich klientek.
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          className="max-w-xl leading-relaxed text-muted-foreground mt-7"
          style={{ fontSize: "17px" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Pierwszy system z AI, który przewiduje przychody, eliminuje no-showy
          i wypełnia luki w grafiku — automatycznie. Za 0% prowizji.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 mt-9"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Button
            size="lg"
            onClick={onScrollToForm}
            className="group relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <span className="relative z-10 flex items-center gap-2">
              Załóż konto za darmo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="group px-8 py-6 text-base border-border text-foreground hover:bg-accent/50"
            onClick={scrollToDemo}
          >
            <Play className="w-4 h-4 mr-1" />
            Zobacz demo na żywo
          </Button>
        </motion.div>

        {/* Trust badge — green */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-200 bg-emerald-50/60">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm text-emerald-700 font-medium">
              Zaufało nam już ponad 150+ salonów w całej Polsce
            </span>
          </div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          className="flex flex-wrap justify-center gap-5 mt-5"
          style={{ fontSize: "13px" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
        >
          {["Bez karty kredytowej", "Gotowe w 5 minut", "0% prowizji — zawsze"].map((item, index) => (
            <div key={index} className="flex items-center gap-1.5 text-muted-foreground">
              <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-emerald-600" />
              </div>
              <span>{item}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

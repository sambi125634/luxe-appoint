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
    <section className="relative min-h-[90vh] flex flex-col items-center overflow-hidden bg-background">
      {/* Warm lavender-peach gradient at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[45%] pointer-events-none"
        style={{
          background: "linear-gradient(to top, hsl(30 25% 90% / 0.7), hsl(280 15% 92% / 0.5), transparent)",
        }}
      />

      <div className="container relative z-10 py-16 lg:py-24 flex flex-col items-center text-center">
        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0 }}
        >
          <Badge
            variant="outline"
            className="px-5 py-2.5 border-primary/20 bg-primary/5 text-primary mb-10"
            style={{ fontSize: "14px", fontWeight: 500, letterSpacing: "0.02em" }}
          >
            ✨ 🚀 Jedyny kalendarz z AI dla salonów beauty
          </Badge>
        </motion.div>

        {/* H1 — serif, dark plum, large */}
        <motion.h1
          className="max-w-5xl leading-[1.05] tracking-[-0.01em]"
          style={{
            fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
            fontSize: "clamp(40px, 6vw, 72px)",
            fontWeight: 700,
            color: "#2D1B4E",
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          Twój system rezerwacji pracuje za Ciebie 24/7.{" "}
          <span
            style={{
              fontStyle: "italic",
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
          className="max-w-xl leading-relaxed mt-8"
          style={{ fontSize: "17px", color: "#6B6B7B" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Pierwszy system z AI, który przewiduje przychody, eliminuje no-showy
          i wypełnia luki w grafiku — automatycznie. Za 0% prowizji.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <button
            onClick={onScrollToForm}
            className="group relative overflow-hidden px-9 py-4 text-base font-medium rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300"
            style={{ backgroundColor: "#4A2272" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3D1B61")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4A2272")}
          >
            <span className="flex items-center gap-2">
              Załóż konto za darmo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          <button
            onClick={scrollToDemo}
            className="group flex items-center justify-center gap-2 px-9 py-4 text-base font-medium rounded-xl border border-border bg-background text-foreground hover:bg-accent/50 transition-all duration-300"
          >
            <Play className="w-4 h-4" />
            Zobacz demo na żywo
          </button>
        </motion.div>

        {/* Trust badge — green */}
        <motion.div
          className="mt-7"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-emerald-200 bg-emerald-50/60">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm text-emerald-700 font-medium">
              Zaufało nam już ponad 150+ salonów w całej Polsce
            </span>
          </div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          className="flex flex-wrap justify-center gap-6 mt-5"
          style={{ fontSize: "14px" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
        >
          {["Bez karty kredytowej", "Gotowe w 5 minut", "0% prowizji — zawsze"].map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-muted-foreground">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>{item}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

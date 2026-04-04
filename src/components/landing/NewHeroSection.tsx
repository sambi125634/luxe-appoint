import { lazy, Suspense, useRef, useState, useEffect } from "react";
import { Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { SplitText, appleEaseArray } from "@/components/ui/AnimatedSection";

const Hero3DScene = lazy(() => import("./Hero3DScene").catch(() => ({ default: () => null })));

interface NewHeroSectionProps {
  onScrollToForm: () => void;
}

export const NewHeroSection = ({ onScrollToForm }: NewHeroSectionProps) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const scrollToDemo = () => {
    document.getElementById("demo-preview")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden landing-section-dark">
      {/* Gradient orb */}
      <div
        className="pointer-events-none fixed w-[600px] h-[600px] rounded-full opacity-20 blur-[120px] z-0 hidden md:block"
        style={{
          background: "radial-gradient(circle, #8b5cf6 0%, #ec4899 50%, transparent 70%)",
          left: mousePos.x - 300,
          top: mousePos.y - 300,
          transition: "left 0.3s ease-out, top 0.3s ease-out",
        }}
      />

      {/* Static background orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#8b5cf6]/10 blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#ec4899]/10 blur-[150px]" />

      <Suspense fallback={null}>
        <Hero3DScene />
      </Suspense>

      <div className="relative z-10 max-w-[1200px] mx-auto px-[max(24px,5vw)] landing-section-spacing text-center">
        {/* Eyebrow */}
        <motion.p
          className="eyebrow tracking-widest mb-8 landing-text-subtle-dark"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: appleEaseArray, delay: 0.2 }}
        >
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8b5cf6] animate-pulse" />
            Platforma beauty z AI
          </span>
        </motion.p>

        {/* H1 — split reveal */}
        <h1 className="headline-hero mb-6" style={{ color: "#f5f5f7" }}>
          <SplitText text="Twój salon rezerwuje, przypomina" />
          <br />
          <span className="apple-accent-gradient">
            <SplitText text="i odzyskuje klientki sam." />
          </span>
        </h1>

        {/* Sub */}
        <motion.p
          className="subheadline max-w-2xl mx-auto mb-10"
          style={{ color: "rgba(245,245,247,0.7)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: appleEaseArray, delay: 0.8 }}
        >
          AI rezerwuje, przypomina i odzyskuje klientki — automatycznie.
          <br />
          <span style={{ color: "#f5f5f7", fontWeight: 500 }}>Twoja baza. Twoje dane. Na zawsze.</span>
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: appleEaseArray, delay: 1.0 }}
        >
          <button
            onClick={onScrollToForm}
            className="apple-btn-primary text-base font-semibold px-8 py-4 flex items-center justify-center gap-2 group"
          >
            Zacznij za darmo
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={scrollToDemo}
            className="apple-btn-secondary-dark text-base px-8 py-4 flex items-center justify-center gap-2"
          >
            Zobacz jak działa
            <span className="text-lg">→</span>
          </button>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          className="flex flex-wrap gap-6 justify-center text-sm"
          style={{ color: "rgba(245,245,247,0.5)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: appleEaseArray, delay: 1.2 }}
        >
          {[
            "Bez karty kredytowej",
            "Gotowe w 5 minut",
            "0% prowizji od rezerwacji",
            "Twoje dane — zawsze Twoje",
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-400" />
              </div>
              <span>{item}</span>
            </div>
          ))}
        </motion.div>

        {/* Live social proof */}
        <motion.div
          className="flex items-center justify-center gap-3 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: appleEaseArray, delay: 1.4 }}
        >
          <div className="flex -space-x-2">
            {["AK", "MW", "JP", "KW", "LS"].map((initials, idx) => (
              <div
                key={idx}
                className="w-7 h-7 rounded-full bg-[#8b5cf6]/30 border-2 border-black flex items-center justify-center text-xs font-bold"
                style={{ color: "#8b5cf6" }}
              >
                {initials}
              </div>
            ))}
          </div>
          <p className="text-sm" style={{ color: "rgba(245,245,247,0.5)" }}>
            <span className="font-bold" style={{ color: "#f5f5f7" }}>23 salony</span>{" "}
            dołączyły w tym tygodniu
          </p>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 2 }}
      >
        <span className="eyebrow text-[10px]" style={{ color: "rgba(245,245,247,0.4)" }}>Odkryj</span>
        <div className="w-6 h-10 rounded-full border border-white/20 flex justify-center pt-2">
          <motion.div
            className="w-1.5 h-3 bg-white/40 rounded-full"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

      {/* Section transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#0a0a0a] pointer-events-none" />
    </section>
  );
};
import { ArrowRight, Shield, Lock, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { SplitText, appleEaseArray } from "@/components/ui/AnimatedSection";

interface NewFinalCTASectionProps {
  onScrollToForm: () => void;
}

export const NewFinalCTASection = ({ onScrollToForm }: NewFinalCTASectionProps) => {
  return (
    <section className="landing-section-dark landing-section-spacing relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#8b5cf6]/10 blur-[200px]" />

      <div className="relative z-10 max-w-[800px] mx-auto px-[max(24px,5vw)] text-center">
        <h2 className="headline-section mb-8" style={{ color: "#f5f5f7" }}>
          <SplitText text="Każdy dzień bez Beauty Calendar" />
          <br />
          <span className="apple-accent-gradient">
            <SplitText text="to pieniądze które mogłaś mieć." />
          </span>
        </h2>

        <motion.p
          className="subheadline mb-12"
          style={{ color: "rgba(245,245,247,0.6)" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, ease: appleEaseArray }}
        >
          Dołącz do właścicielek salonów które odzyskały kontrolę nad swoim biznesem — i swoimi klientkami.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, ease: appleEaseArray }}
        >
          <button onClick={onScrollToForm} className="apple-btn-primary text-base px-10 py-4 flex items-center justify-center gap-2 group">
            Zacznij za darmo — bez karty kredytowej
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button onClick={onScrollToForm} className="apple-btn-secondary-dark text-base px-8 py-4">
            Porozmawiajmy najpierw →
          </button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, ease: appleEaseArray }}
        >
          <div className="flex -space-x-2">
            {["AK", "MW", "JP"].map((i, idx) => (
              <div key={idx} className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-bold" style={{ background: "rgba(139,92,246,0.2)", color: "#8b5cf6" }}>
                {i}
              </div>
            ))}
          </div>
          <p className="text-sm" style={{ color: "rgba(245,245,247,0.5)" }}>
            <span className="font-bold" style={{ color: "#f5f5f7" }}>23 salony</span> dołączyły w tym tygodniu
          </p>
        </motion.div>

        {/* Trust */}
        <motion.div
          className="flex items-center justify-center gap-6 flex-wrap"
          style={{ color: "rgba(245,245,247,0.3)" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, ease: appleEaseArray }}
        >
          <div className="flex items-center gap-1.5 text-sm"><Lock className="w-3.5 h-3.5" />SSL 256-bit</div>
          <div className="flex items-center gap-1.5 text-sm"><Shield className="w-3.5 h-3.5" />RODO</div>
          <div className="text-sm font-bold">Przelewy24</div>
          <div className="text-sm font-bold">BLIK</div>
          <div className="flex items-center gap-1.5 text-sm"><CreditCard className="w-3.5 h-3.5" />Bez karty</div>
          <div className="text-sm">Twoje dane — zawsze Twoje</div>
        </motion.div>
      </div>
    </section>
  );
};
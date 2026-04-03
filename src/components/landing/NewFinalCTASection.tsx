import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Lock, CreditCard, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface NewFinalCTASectionProps {
  onScrollToForm: () => void;
}

export const NewFinalCTASection = ({ onScrollToForm }: NewFinalCTASectionProps) => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-pink-500/10" />

      <div className="relative z-10 container max-w-3xl mx-auto px-4 text-center">
        <motion.h2
          className="text-3xl md:text-5xl font-serif font-bold mb-6 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Każdy dzień z prowizjami to dzień,<br />
          <span className="bg-gradient-to-r from-destructive to-amber-500 bg-clip-text text-transparent">
            w którym oddajesz swoje pieniądze.
          </span>
        </motion.h2>

        <motion.div
          className="text-lg text-muted-foreground mb-10 space-y-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <p>163 funkcje. 0% prowizji. Konfiguracja w 15 minut.</p>
          <p>Zacznij od FREE — bez karty, bez zobowiązań, bez ryzyka.</p>
          <p className="font-semibold text-foreground">Jedyne ryzyko to zostawienie rzeczy tak jak są.</p>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Button size="lg" onClick={onScrollToForm} className="h-14 px-10 text-lg gap-2 relative overflow-hidden">
            <span>Zacznij za darmo — odbierz dostęp</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button size="lg" variant="outline" onClick={onScrollToForm} className="h-14 px-8 text-lg gap-2">
            Umów prywatną prezentację
          </Button>
        </motion.div>

        {/* Micro-copy */}
        <motion.p
          className="text-sm text-muted-foreground mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          Dołącz w 60 sekund · Nie wymagamy karty kredytowej · Rezygnacja jednym kliknięciem
        </motion.p>

        {/* Trust indicators */}
        <motion.div
          className="flex items-center justify-center gap-6 opacity-60 flex-wrap"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.6 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-1.5 text-sm">
            <Lock className="w-3.5 h-3.5" />
            SSL 256-bit
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Shield className="w-3.5 h-3.5" />
            RODO compliant
          </div>
          <div className="text-sm font-bold">Przelewy24</div>
          <div className="text-sm font-bold">BLIK</div>
          <div className="flex items-center gap-1.5 text-sm">
            <CreditCard className="w-3.5 h-3.5" />
            Bez karty kredytowej
          </div>
        </motion.div>
      </div>
    </section>
  );
};
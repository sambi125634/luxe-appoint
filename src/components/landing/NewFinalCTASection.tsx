import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Lock, CreditCard } from "lucide-react";
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
          Ka\u017Cdy dzie\u0144 bez systemu retencji<br />
          <span className="bg-gradient-to-r from-destructive to-amber-500 bg-clip-text text-transparent">
            to klientka, kt\u00F3ra nie wr\u00F3ci.
          </span>
        </motion.h2>

        <motion.div
          className="text-lg text-muted-foreground mb-10 space-y-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <p>Twoja baza. Twoje dane. Twoje narz\u0119dzia retencji. Od 99 z\u0142 netto/mies.</p>
          <p>Zacznij od FREE \u2014 14 dni pe\u0142nego dost\u0119pu, bez karty, bez zobowi\u0105za\u0144.</p>
          <p className="font-semibold text-foreground">Jedyne ryzyko to zostawienie rzeczy tak jak s\u0105.</p>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Button size="lg" onClick={onScrollToForm} className="h-14 px-10 text-lg gap-2 relative overflow-hidden">
            <span>Zacznij za darmo \u2014 odbierz dost\u0119p</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button size="lg" variant="outline" onClick={onScrollToForm} className="h-14 px-8 text-lg gap-2">
            Um\u00F3w prywatn\u0105 prezentacj\u0119
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
          Do\u0142\u0105cz w 60 sekund \u00B7 Nie wymagamy karty kredytowej \u00B7 Rezygnacja jednym klikni\u0119ciem
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
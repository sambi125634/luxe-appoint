import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Lock, CreditCard } from "lucide-react";
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
          Każdy dzień bez Beauty Calendar
          <br />
          <span className="bg-gradient-to-r from-destructive to-amber-500 bg-clip-text text-transparent">
            to pieniądze które mogłaś mieć.
          </span>
        </motion.h2>

        <motion.div
          className="text-lg text-muted-foreground mb-10 space-y-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <p>Dołącz do właścicielek salonów które odzyskały kontrolę nad swoim biznesem — i swoimi klientkami.</p>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Button size="lg" onClick={onScrollToForm} className="h-14 px-10 text-lg gap-2 relative overflow-hidden">
            <span>Zacznij za darmo — bez karty kredytowej</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button size="lg" variant="outline" onClick={onScrollToForm} className="h-14 px-8 text-lg gap-2">
            Porozmawiajmy najpierw →
          </Button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex -space-x-2">
            {["AK", "MW", "JP"].map((i, idx) => (
              <div key={idx} className="w-6 h-6 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-[10px] font-bold text-primary">
                {i}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">23 salony</span> dołączyły w tym tygodniu
          </p>
        </motion.div>

        {/* Trust */}
        <motion.div
          className="flex items-center justify-center gap-6 opacity-60 flex-wrap"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.6 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
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

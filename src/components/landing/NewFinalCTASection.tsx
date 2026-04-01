import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, CreditCard, Headphones, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface NewFinalCTASectionProps {
  onScrollToForm: () => void;
}

export const NewFinalCTASection = ({ onScrollToForm }: NewFinalCTASectionProps) => {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Social proof avatars */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-3 px-5 py-3 bg-muted/50 rounded-full border border-border/50">
              <div className="flex -space-x-2">
                {["AK", "MW", "JP", "KW"].map((initials, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-bold text-primary"
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                <strong className="text-foreground">12 salonów</strong> dołączyło w tym tygodniu
              </span>
            </div>
          </motion.div>

          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Przestań oddawać swoje pieniądze platformom.
            <br />
            <span className="text-gradient-luxury">Zacznij zarabiać więcej od jutra.</span>
          </motion.h2>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Dołącz do setek salonów, które już odkryły moc AI w rezerwacjach. Zacznij za darmo — bez karty kredytowej, bez zobowiązań.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button
              size="lg"
              onClick={onScrollToForm}
              className="group relative overflow-hidden px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all after:absolute after:inset-0 after:translate-x-[-100%] after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent hover:after:translate-x-[100%] after:transition-transform after:duration-700"
            >
              <span className="relative z-10 flex items-center gap-2">
                Załóż darmowe konto
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              asChild
              className="group px-8 py-6 text-lg border-2"
            >
              <Link to="/demo">
                <div className="flex flex-col items-start text-left">
                  <span className="text-xs text-muted-foreground">Nie jesteś pewna?</span>
                  <span className="flex items-center gap-1">
                    Zobacz jak AI wypełni Twój kalendarz
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-medium text-foreground">Bezpieczne płatności</div>
                <div>Przelewy24 · BLIK</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-medium text-foreground">SSL · RODO</div>
                <div>Twoje dane są bezpieczne</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Headphones className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-medium text-foreground">Support po polsku</div>
                <div>Odpowiedź w 4h</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

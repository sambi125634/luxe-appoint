import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import heroCalendar from "@/assets/screenshots/hero-calendar.png";

interface NewHeroSectionProps {
  onScrollToForm: () => void;
}

export const NewHeroSection = ({ onScrollToForm }: NewHeroSectionProps) => {
  const scrollToDemo = () => {
    document.getElementById("demo-preview")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-background">
      {/* Subtle radial accent */}
      <div
        className="absolute top-[-20%] right-[-10%] w-[60%] h-[80%] rounded-full opacity-[0.07] pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
        }}
      />

      <div className="container relative z-10 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Copy */}
          <div className="flex flex-col space-y-6 max-w-xl">
            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Badge
                variant="outline"
                className="px-4 py-2 border-primary/20 bg-primary/5 text-primary w-fit"
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: "12px",
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                }}
              >
                Większość właścicielek salonów nie wie że...
              </Badge>
            </motion.div>

            {/* H1 — sequential reveal, wider horizontal layout */}
            <div className="space-y-0">
              {[
                { text: "Pracujesz. Zarabiasz.", delay: 0.3, weight: 400 },
                { text: "I budujesz czyjś biznes.", delay: 0.5, weight: 600 },
              ].map(({ text, delay, weight }) => (
                <motion.span
                  key={text}
                  className="block leading-[1.1] tracking-[-0.02em]"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "clamp(36px, 5vw, 64px)",
                    fontWeight: weight,
                    color: "hsl(var(--secondary))",
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay, ease: "easeOut" }}
                >
                  {text}
                </motion.span>
              ))}
            </div>

            {/* H2 — "Nie swój." gradient */}
            <motion.h2
              className="leading-[1.1] tracking-[-0.02em] -mt-2"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(40px, 5.5vw, 72px)",
                fontWeight: 600,
                fontStyle: "italic",
                background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
            >
              Nie swój.
            </motion.h2>

            {/* Sub */}
            <motion.p
              className="max-w-md leading-relaxed text-muted-foreground"
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: "16px",
                fontWeight: 400,
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              Każda klientka którą pozyskałaś przez platformę marketplace — należy do platformy. Jej dane. Jej historia. Jej kontakt.{" "}
              <span className="font-semibold text-foreground">
                Beauty Calendar to zmienia.
              </span>
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <Button
                size="lg"
                onClick={onScrollToForm}
                className="group relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Zacznij za darmo
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="group px-8 py-6 text-base border-border text-foreground hover:bg-accent/50"
                onClick={scrollToDemo}
              >
                Zobacz jak to działa →
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              className="flex flex-wrap gap-4"
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: "13px",
                fontWeight: 400,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              {[
                "Bez karty kredytowej",
                "Gotowe w 5 minut",
                "0% prowizji",
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-1.5 text-muted-foreground">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-emerald-600" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Product mockup */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          >
            <div className="relative">
              <img
                src={heroCalendar}
                alt="Kalendarz Beauty Calendar — widok tygodniowy z rezerwacjami"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
              {/* Subtle glow behind the mockup */}
              <div
                className="absolute inset-0 -z-10 blur-3xl opacity-20 scale-110"
                style={{
                  background:
                    "radial-gradient(ellipse at center, hsl(var(--primary)) 0%, transparent 70%)",
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Live social proof — below the grid */}
        <motion.div
          className="flex items-center justify-center gap-3 mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.6 }}
        >
          <div className="flex -space-x-2">
            {["AK", "MW", "JP", "KW", "LS"].map((initials, idx) => (
              <div
                key={idx}
                className="w-7 h-7 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-xs font-bold text-primary"
              >
                {initials}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Średnio <span className="font-bold text-foreground">23 klientki</span>{" "}
            wróciły do salonów, które uruchomiły system w tym tygodniu
          </p>
        </motion.div>
      </div>
    </section>
  );
};

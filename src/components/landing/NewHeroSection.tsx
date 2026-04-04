import { lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Hero3DScene = lazy(() => import("./Hero3DScene").catch(() => ({ default: () => null })));

interface NewHeroSectionProps {
  onScrollToForm: () => void;
}

export const NewHeroSection = ({ onScrollToForm }: NewHeroSectionProps) => {
  const scrollToDemo = () => {
    document.getElementById("demo-preview")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-dark via-background to-muted/30" />

      <Suspense fallback={null}>
        <Hero3DScene />
      </Suspense>

      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/20 z-[1]" />
      <div className="absolute inset-0 z-[1]" style={{
        background: "radial-gradient(ellipse 60% 70% at 50% 50%, hsl(var(--background) / 0.85) 0%, hsl(var(--background) / 0.3) 60%, transparent 100%)"
      }} />
      <div className="absolute inset-0 bg-background/50 md:bg-transparent z-[1]" />

      <div className="container relative z-10 py-20 lg:py-32">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Badge
              variant="outline"
              className="px-4 py-2 text-sm font-medium border-primary/30 bg-primary/5 text-primary backdrop-blur-sm animate-pulse"
            >
              dla właścicielek salonów w Polsce
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
              Twoje klientki odchodzą.
              <br />
              <span className="text-muted-foreground font-normal text-2xl md:text-3xl lg:text-4xl block mt-2">
                Nie dlatego że jesteś zła.
              </span>
              <span className="text-gradient-luxury">
                Dlatego że nikt im nie przypomniał.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-normal">
              Twój salon rezerwuje, przypomina i odzyskuje klientki sam. Każdego dnia.
            </p>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Nawet kiedy śpisz.
            <br />
            <span className="font-semibold text-foreground">Ty zajmujesz się zabiegami.</span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Button
              size="lg"
              onClick={onScrollToForm}
              className="group relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg shadow-glow hover:shadow-[0_0_60px_hsl(var(--primary)/0.4)] transition-all duration-500 after:absolute after:inset-0 after:translate-x-[-100%] after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent hover:after:translate-x-[100%] after:transition-transform after:duration-700"
            >
              <span className="relative z-10 flex items-center gap-2">
                Zacznij za darmo — bez karty kredytowej
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="group px-8 py-6 text-lg border-2 hover:bg-primary/5 backdrop-blur-sm"
              onClick={scrollToDemo}
            >
              Zobacz jak to działa →
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="flex flex-wrap gap-6 justify-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            {[
              "Bez karty kredytowej",
              "Gotowe w 5 minut",
              "0% prowizji od rezerwacji",
              "Twoje dane — zawsze Twoje",
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Check className="w-3 h-3 text-emerald-600" />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </motion.div>

          {/* Live social proof */}
          <motion.div
            className="flex items-center justify-center gap-3 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <div className="flex -space-x-2">
              {["AK", "MW", "JP", "KW", "LS"].map((initials, idx) => (
                <div
                  key={idx}
                  className="w-7 h-7 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-bold text-primary"
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
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
        <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-primary/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

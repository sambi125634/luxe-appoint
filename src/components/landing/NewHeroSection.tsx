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
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-10">
          {/* Eyebrow */}
          <motion.p
            className="text-sm tracking-widest uppercase text-muted-foreground font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            dla właścicielek salonów w Polsce
          </motion.p>

          {/* Headline */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.05] tracking-tight font-serif">
              Twoje klientki
              <br />
              odchodzą.
              <br />
              <span className="text-muted-foreground font-normal text-3xl md:text-4xl lg:text-5xl xl:text-5xl leading-snug block mt-4">
                Nie dlatego że jesteś zła.
              </span>
            </h1>
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-5xl font-bold leading-snug">
              <span className="text-gradient-luxury">
                Dlatego że nikt
                <br />
                im nie przypomniał, dlaczego miałyby to zrobić.
              </span>
            </h2>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Beauty Calendar robi to za Ciebie.
            <br />
            Automatycznie. Każdego dnia. Nawet kiedy śpisz.
          </motion.p>

          {/* CTA */}
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Button
              size="lg"
              onClick={onScrollToForm}
              className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-10 py-7 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-500"
            >
              Zacznij za darmo — bez karty kredytowej
            </Button>

            <p className="text-sm text-muted-foreground max-w-md">
              Średnio <span className="font-semibold text-foreground">23 klientki</span> wróciły do salonów,
              które uruchomiły system w tym tygodniu.
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

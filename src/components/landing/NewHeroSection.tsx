import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, ArrowRight, Play, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";

const Hero3DScene = lazy(() => import("./Hero3DScene"));

interface NewHeroSectionProps {
  onScrollToForm: () => void;
}

const AnimatedSalonCount = () => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const target = 150;
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView]);

  return <span ref={ref} className="font-bold text-primary">{count}+ salonów</span>;
};

export const NewHeroSection = ({ onScrollToForm }: NewHeroSectionProps) => {
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
          {/* Animated Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Badge
              variant="outline"
              className="px-4 py-2 text-sm font-medium border-primary/30 bg-primary/5 text-primary backdrop-blur-sm animate-pulse"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              🚀 Jedyny kalendarz z AI dla salonów beauty
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
              Twój salon rezerwuje, przypomina
              <br />
              <span className="text-gradient-luxury">i odzyskuje klientki sam.</span>
              <br />
              <span className="text-muted-foreground text-3xl md:text-4xl lg:text-5xl">
                Bez Booksy. Bez prowizji. Bez chaosu.
              </span>
            </h1>
          </motion.div>

          {/* Subheadline with live counter */}
          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Dołącz do <AnimatedSalonCount /> które przestały płacić prowizje.
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
                Załóż konto za darmo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              asChild
              className="group px-8 py-6 text-lg border-2 hover:bg-primary/5 backdrop-blur-sm"
            >
              <Link to="/demo">
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Zobacz demo na żywo
              </Link>
            </Button>
          </motion.div>

          {/* Social proof inline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 backdrop-blur-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-emerald-600 font-bold text-sm">
                Zaufało nam już ponad 150+ salonów w całej Polsce
              </span>
            </div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="flex flex-wrap gap-6 justify-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            {[
              "Bez karty kredytowej",
              "Gotowe w 5 minut",
              "0% prowizji — zawsze",
              "📱 Aplikacja mobilna iOS & Android",
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Check className="w-3 h-3 text-emerald-600" />
                </div>
                <span>{item}</span>
              </div>
            ))}
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

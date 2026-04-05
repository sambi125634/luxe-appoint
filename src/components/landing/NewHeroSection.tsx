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
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0d0520 0%, #1a0838 50%, #0a0a14 100%)' }}
    >
      <Suspense fallback={null}>
        <Hero3DScene />
      </Suspense>

      <div className="absolute inset-0 z-[1]" style={{
        background: "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(10,5,32,0.7) 0%, transparent 70%)"
      }} />

      <div className="container relative z-10 py-20 lg:py-32">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
          {/* Badge */}
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Badge
              variant="outline"
              className="px-4 py-2 border-primary/30 bg-primary/5 text-primary backdrop-blur-sm"
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '0.04em',
              }}
            >
              Większość właścicielek salonów nie wie że...
            </Badge>
          </motion.div>

          {/* H1 — sequential reveal */}
          <div className="space-y-1">
            {[
              { text: "Pracujesz.", delay: 0.3, weight: 300, color: 'rgba(255,255,255,0.75)' },
              { text: "Zarabiasz.", delay: 0.45, weight: 400, color: 'rgba(255,255,255,0.85)' },
              { text: "I budujesz", delay: 0.6, weight: 500, color: 'rgba(255,255,255,0.92)' },
              { text: "czyjś biznes.", delay: 0.75, weight: 700, color: '#ffffff' },
            ].map(({ text, delay, weight, color }) => (
              <motion.span
                key={text}
                className="block tracking-[-0.02em]"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 'clamp(40px, 6.5vw, 88px)',
                  lineHeight: 1.05,
                  fontWeight: weight,
                  color,
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay, ease: "easeOut" }}
              >
                {text}
              </motion.span>
            ))}
          </div>

          {/* H2 — "Nie swój." */}
          <motion.h2
            className="tracking-[-0.02em]"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(48px, 7.5vw, 100px)',
              lineHeight: 1.05,
              fontWeight: 600,
              fontStyle: 'italic',
              background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.0, ease: "easeOut" }}
          >
            Nie swój.
          </motion.h2>

          {/* Sub */}
          <motion.p
            className="max-w-2xl leading-relaxed"
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: '18px',
              fontWeight: 400,
              color: 'rgba(255,255,255,0.60)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
          >
            Każda klientka którą pozyskałaś przez platformę
            <br />
            marketplace — należy do platformy.
            <br />
            Jej dane. Jej historia. Jej kontakt.
            <br />
            <span style={{ fontWeight: 600, color: '#ffffff', marginTop: '8px', display: 'inline-block' }}>
              Beauty Calendar to zmienia.
            </span>
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
              className="group relative overflow-hidden bg-white hover:bg-white/90 text-black px-8 py-6 text-lg shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] transition-all duration-500 after:absolute after:inset-0 after:translate-x-[-100%] after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent hover:after:translate-x-[100%] after:transition-transform after:duration-700"
            >
              <span className="relative z-10 flex items-center gap-2">
                Zacznij za darmo — bez karty kredytowej
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="group px-8 py-6 text-lg border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              onClick={scrollToDemo}
            >
              Zobacz jak to działa →
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="flex flex-wrap gap-6 justify-center"
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: '13px',
              fontWeight: 400,
              color: 'rgba(255,255,255,0.50)',
            }}
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

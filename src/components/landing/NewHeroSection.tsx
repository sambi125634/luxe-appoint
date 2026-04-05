import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Scissors, Calendar, Heart, Star, MessageCircle, Stamp } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import heroCalendar from "@/assets/screenshots/hero-calendar.png";

interface NewHeroSectionProps {
  onScrollToForm: () => void;
}

const floatingIcons = [
  { Icon: Scissors, top: "8%", left: "5%", delay: 0, size: 22 },
  { Icon: Calendar, top: "18%", right: "7%", delay: 0.3, size: 20 },
  { Icon: Heart, top: "55%", left: "3%", delay: 0.6, size: 18 },
  { Icon: Star, top: "40%", right: "4%", delay: 0.15, size: 24 },
  { Icon: MessageCircle, top: "72%", left: "8%", delay: 0.45, size: 20 },
  { Icon: Stamp, top: "65%", right: "6%", delay: 0.75, size: 18 },
];

export const NewHeroSection = ({ onScrollToForm }: NewHeroSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const scrollToDemo = () => {
    document.getElementById("demo-preview")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} className="relative min-h-[90vh] flex flex-col items-center overflow-hidden bg-background">
      {/* Subtle radial accent */}
      <div
        className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[60%] rounded-full opacity-[0.06] pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
        }}
      />

      {/* Floating animated icons */}
      {floatingIcons.map(({ Icon, delay, size, ...pos }, idx) => (
        <FloatingIcon key={idx} Icon={Icon} delay={delay} size={size} style={pos} scrollYProgress={scrollYProgress} />
      ))}

      <div className="container relative z-10 py-20 lg:py-28 flex flex-col items-center text-center">
        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0 }}
        >
          <Badge
            variant="outline"
            className="px-4 py-2 border-primary/20 bg-primary/5 text-primary mb-6"
            style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.04em" }}
          >
            Większość właścicielek salonów nie wie że...
          </Badge>
        </motion.div>

        {/* H1 — centered, bold sans-serif */}
        <div className="max-w-3xl space-y-0">
          {[
            { text: "Pracujesz. Zarabiasz.", delay: 0.2, weight: 700 },
            { text: "I budujesz czyjś biznes.", delay: 0.4, weight: 700 },
          ].map(({ text, delay, weight }) => (
            <motion.span
              key={text}
              className="block leading-[1.1] tracking-[-0.03em] text-secondary"
              style={{
                fontSize: "clamp(40px, 6vw, 72px)",
                fontWeight: weight,
              }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay, ease: "easeOut" }}
            >
              {text}
            </motion.span>
          ))}
        </div>

        {/* H2 — gradient */}
        <motion.h2
          className="leading-[1.1] tracking-[-0.03em] mt-1"
          style={{
            fontSize: "clamp(44px, 7vw, 80px)",
            fontWeight: 700,
            fontStyle: "italic",
            background: "linear-gradient(135deg, #7c3aed, #ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
        >
          Nie swój.
        </motion.h2>

        {/* Sub */}
        <motion.p
          className="max-w-lg leading-relaxed text-muted-foreground mt-6"
          style={{ fontSize: "17px" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          Każda klientka którą pozyskałaś przez platformę marketplace — należy do platformy. Jej dane. Jej historia. Jej kontakt.{" "}
          <span className="font-semibold text-foreground">Beauty Calendar to zmienia.</span>
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
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
          className="flex flex-wrap justify-center gap-4 mt-5"
          style={{ fontSize: "13px" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.3 }}
        >
          {["Bez karty kredytowej", "Gotowe w 5 minut", "0% prowizji"].map((item, index) => (
            <div key={index} className="flex items-center gap-1.5 text-muted-foreground">
              <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-emerald-600" />
              </div>
              <span>{item}</span>
            </div>
          ))}
        </motion.div>

        {/* Product mockup — below text, with perspective */}
        <motion.div
          className="relative w-full max-w-5xl mt-14"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5, ease: "easeOut" }}
        >
          <div
            className="relative"
            style={{
              perspective: "1200px",
            }}
          >
            <img
              src={heroCalendar}
              alt="Kalendarz Beauty Calendar — widok tygodniowy z rezerwacjami"
              className="w-full h-auto rounded-2xl shadow-2xl"
              style={{
                transform: "rotateX(2deg)",
              }}
            />
            {/* Glow behind mockup */}
            <div
              className="absolute inset-0 -z-10 blur-3xl opacity-20 scale-110"
              style={{
                background: "radial-gradient(ellipse at center, hsl(var(--primary)) 0%, transparent 70%)",
              }}
            />
          </div>
        </motion.div>

        {/* Social proof */}
        <motion.div
          className="flex items-center justify-center gap-3 mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.7 }}
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

/* ── Floating Icon component ── */

interface FloatingIconProps {
  Icon: React.ElementType;
  delay: number;
  size: number;
  style: Record<string, string | undefined>;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}

const FloatingIcon = ({ Icon, delay, size, style, scrollYProgress }: FloatingIconProps) => {
  const y = useTransform(scrollYProgress, [0, 1], [0, -40]);

  return (
    <motion.div
      className="absolute z-0 text-primary/15 hidden lg:block"
      style={{ ...style, y }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 1.7 + delay }}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4 + delay * 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Icon size={size} strokeWidth={1.5} />
      </motion.div>
    </motion.div>
  );
};

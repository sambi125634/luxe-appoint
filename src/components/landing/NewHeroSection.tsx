import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";

interface NewHeroSectionProps {
  onScrollToForm: () => void;
}

export const NewHeroSection = ({ onScrollToForm }: NewHeroSectionProps) => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -left-[12%] -top-28 h-[16rem] w-[16rem] md:h-[32rem] md:w-[32rem] rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary) / 0.22) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute right-[-4%] top-[4%] h-[10rem] w-[10rem] md:h-[18rem] md:w-[18rem] rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, hsl(var(--accent) / 0.14) 0%, transparent 72%)",
          }}
        />
        <div
          className="absolute bottom-[-12%] left-1/2 h-[14rem] w-[30rem] md:h-[22rem] md:w-[58rem] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse at center, hsl(var(--accent) / 0.22) 0%, hsl(var(--primary) / 0.08) 50%, transparent 76%)",
          }}
        />
      </div>

      <div className="container relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0 }}
        >
          <Badge
            variant="outline"
            className="mb-6 md:mb-12 rounded-full border-primary/20 bg-background/80 px-4 md:px-6 py-2.5 md:py-3 text-[11px] md:text-[13px] text-primary backdrop-blur-sm"
            style={{ fontWeight: 500, letterSpacing: "0.02em" }}
          >
            ✨ 🚀 {t("landing.hero.badge")}
          </Badge>
        </motion.div>

        <motion.h1
          className="max-w-[980px] text-foreground font-extrabold font-serif"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(36px, 8vw, 78px)",
            fontWeight: 600,
            lineHeight: 0.94,
            letterSpacing: "-0.03em",
            textWrap: "balance",
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
        {t("landing.hero.title1")}{" "}
          <span
            style={{
              fontStyle: "italic",
              background:
                "linear-gradient(180deg, hsl(var(--violet-light)) 0%, hsl(var(--secondary)) 96%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {t("landing.hero.title2")}
          </span>
        </motion.h1>

        <motion.p
          className="mt-6 md:mt-10 max-w-[760px] text-base md:text-lg leading-relaxed text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {t("landing.hero.subtitle")}
        </motion.p>

        <motion.div
          className="mt-8 md:mt-12 flex flex-col gap-3 sm:gap-4 sm:flex-row w-full sm:w-auto px-2 sm:px-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Button
            size="lg"
            onClick={onScrollToForm}
            className="h-12 md:h-14 rounded-2xl px-6 md:px-10 text-[15px] md:text-[17px] shadow-soft sm:min-w-[294px]"
          >
            <span className="flex items-center gap-2">
              {t("landing.hero.cta1")}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.location.href = '/demo'}
            className="h-12 md:h-14 rounded-2xl bg-background/75 px-6 md:px-10 text-[15px] md:text-[17px] text-foreground backdrop-blur-sm sm:min-w-[314px]"
          >
            <Play className="w-4 h-4" />
            {t("landing.hero.cta2")}
          </Button>
        </motion.div>

        <motion.div
          className="mt-6 md:mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-4 md:px-5 py-2 md:py-2.5 shadow-sm backdrop-blur-sm">
            <span className="text-xs md:text-sm font-medium text-emerald-700">
              🇵🇱 {t("landing.hero.madeIn")}
            </span>
          </div>
        </motion.div>

        <motion.div
          className="mt-5 md:mt-6 flex flex-wrap justify-center gap-3 md:gap-8"
          style={{ fontSize: "13px" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
        >
          {[t("landing.hero.trust1"), t("landing.hero.trust2"), t("landing.hero.trust3")].map((item) => (
            <div key={item} className="flex items-center gap-2 text-muted-foreground">
              <Check className="h-4 w-4 text-emerald-500" />
              <span>{item}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 z-10 hidden md:flex h-12 w-7 -translate-x-1/2 items-start justify-center rounded-full border border-primary/20 bg-background/40 p-2 backdrop-blur-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        <div className="h-3 w-1 rounded-full bg-primary/35" />
      </motion.div>
    </section>
  );
};

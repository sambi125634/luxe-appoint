import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, Bell, RotateCcw, Brain, Gift, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

import stepBookingNew from "@/assets/screenshots/step-booking-new.png";
import stepAutopilot from "@/assets/screenshots/step-autopilot.png";
import stepPipeline from "@/assets/screenshots/step-pipeline.png";
import stepRadar from "@/assets/screenshots/step-radar.png";
import stepReferral from "@/assets/screenshots/step-referral.png";
import stepTrueProfit from "@/assets/screenshots/step-true-profit.png";

const icons: LucideIcon[] = [CalendarCheck, Bell, RotateCcw, Brain, Gift, TrendingUp];
const images = [stepBookingNew, stepAutopilot, stepPipeline, stepRadar, stepReferral, stepTrueProfit];
const AUTO_SWITCH_MS = 6000;

interface SystemFlowSectionProps {
  onScrollToForm?: () => void;
}

export const SystemFlowSection = ({ onScrollToForm }: SystemFlowSectionProps) => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const steps = Array.from({ length: 6 }, (_, i) => ({
    icon: icons[i],
    number: i + 1,
    title: t(`landing.systemFlow.step${i + 1}t`),
    description: t(`landing.systemFlow.step${i + 1}d`),
    image: images[i],
    imageAlt: t(`landing.systemFlow.step${i + 1}alt`),
  }));

  const advance = useCallback(() => {
    setActiveStep((prev) => (prev + 1) % steps.length);
  }, [steps.length]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(advance, AUTO_SWITCH_MS);
    return () => clearInterval(timer);
  }, [isPaused, advance]);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 12000);
  };

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-background">
      <div className="container max-w-6xl mx-auto px-4">
        <motion.div className="text-center mb-10 md:mb-16" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, ease: "easeOut" }}>
          <span className="text-xs md:text-sm font-medium tracking-widest uppercase text-muted-foreground">{t("landing.systemFlow.label")}</span>
          <h2 className="mt-3 md:mt-4 text-2xl md:text-4xl font-serif font-bold leading-tight text-foreground">
            {t("landing.systemFlow.title1")}{" "}
            <br className="hidden md:block" />
            <span className="text-primary">{t("landing.systemFlow.title2")}</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-8 lg:gap-12 items-start">
          <motion.div className="flex flex-col gap-1" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }}>
            {steps.map((step, index) => {
              const isActive = index === activeStep;
              return (
                <button key={index} onClick={() => handleStepClick(index)} className={`relative flex items-start gap-4 text-left rounded-xl p-4 transition-all duration-300 ${isActive ? "bg-primary/5 shadow-sm" : "hover:bg-muted/50"}`}>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 text-sm font-bold ${isActive ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground"}`}>
                    {step.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-semibold transition-colors duration-300 ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{step.title}</h3>
                    <AnimatePresence mode="wait">
                      {isActive && (
                        <motion.p className="text-xs text-muted-foreground mt-1 leading-relaxed" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                          {step.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                    {isActive && !isPaused && (
                      <div className="mt-2 h-0.5 bg-muted rounded-full overflow-hidden">
                        <motion.div className="h-full bg-primary rounded-full" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: AUTO_SWITCH_MS / 1000, ease: "linear" }} key={`progress-${activeStep}`} />
                      </div>
                    )}
                    {isActive && (
                      <motion.img src={step.image} alt={step.imageAlt} className="mt-3 w-full rounded-xl shadow-md object-contain max-h-[220px] lg:hidden" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} />
                    )}
                  </div>
                </button>
              );
            })}
          </motion.div>

          <motion.div className="relative hidden lg:block" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: 0.2 }}>
            <AnimatePresence mode="wait">
              <motion.img key={activeStep} src={steps[activeStep].image} alt={steps[activeStep].imageAlt} className="w-full h-auto rounded-2xl shadow-xl object-contain" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }} />
            </AnimatePresence>
          </motion.div>
        </div>

        <motion.div className="mt-14 text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5, delay: 0.6 }}>
          <Button size="lg" className="rounded-full" onClick={onScrollToForm}>{t("landing.systemFlow.cta")}</Button>
        </motion.div>
      </div>
    </section>
  );
};

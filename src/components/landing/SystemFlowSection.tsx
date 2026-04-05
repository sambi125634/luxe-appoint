import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, Bell, RotateCcw, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

import stepBooking from "@/assets/screenshots/step-booking.png";
import stepDashboard from "@/assets/screenshots/step-dashboard.png";
import stepRetention from "@/assets/screenshots/step-retention.png";
import stepClients from "@/assets/screenshots/step-clients.png";

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

const steps: Step[] = [
  {
    icon: CalendarCheck,
    title: "Klientka rezerwuje",
    description:
      "Widget na Twojej stronie, Instagramie lub przez link w bio. Bez telefonu. Bez \u201Esprawdzę i oddzwonię\u201D.",
    image: stepBooking,
    imageAlt: "Widget rezerwacyjny Beauty Calendar — wybór usługi",
  },
  {
    icon: Bell,
    title: "Przypomnienie automatyczne",
    description:
      "24h przed wizytą — SMS. 2h przed — push. Zero no-showów. (-67% no-showów po pierwszym miesiącu)",
    image: stepDashboard,
    imageAlt: "Dashboard Beauty Calendar — podsumowanie dnia",
  },
  {
    icon: RotateCcw,
    title: "Sekwencja powrotu",
    description:
      "Spersonalizowana oferta kolejnej wizyty. W optymalnym momencie. Kiedy klientka jest gotowa wrócić.",
    image: stepRetention,
    imageAlt: "Ścieżka Klientki — system powrotów Beauty Calendar",
  },
  {
    icon: Heart,
    title: "Klientka wraca — sama",
    description:
      "Bez Twojego działania. Bez telefonu. Bez ręcznego pisania wiadomości. Twój salon zarabia nawet gdy śpisz.",
    image: stepClients,
    imageAlt: "Lista klientek z historią wizyt w Beauty Calendar",
  },
];

const AUTO_SWITCH_MS = 5000;

interface SystemFlowSectionProps {
  onScrollToForm?: () => void;
}

export const SystemFlowSection = ({ onScrollToForm }: SystemFlowSectionProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const advance = useCallback(() => {
    setActiveStep((prev) => (prev + 1) % steps.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(advance, AUTO_SWITCH_MS);
    return () => clearInterval(timer);
  }, [isPaused, advance]);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    setIsPaused(true);
    // Resume auto after 10s
    setTimeout(() => setIsPaused(false), 10000);
  };

  return (
    <section className="py-24 bg-background">
      <div className="container max-w-6xl mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
            Jak to działa
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-serif font-bold leading-tight text-foreground">
            Od pierwszej rezerwacji{" "}
            <br className="hidden md:block" />
            do stałej klientki.{" "}
            <span className="text-primary">Automatycznie.</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-[340px_1fr] gap-8 lg:gap-12 items-start">
          {/* Left — Step list */}
          <motion.div
            className="flex flex-col gap-1"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === activeStep;
              return (
                <button
                  key={index}
                  onClick={() => handleStepClick(index)}
                  className={`relative flex items-start gap-4 text-left rounded-xl p-4 transition-all duration-300 ${
                    isActive
                      ? "bg-primary/5 shadow-sm"
                      : "hover:bg-muted/50"
                  }`}
                >
                  {/* Icon circle */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-sm font-semibold transition-colors duration-300 ${
                        isActive ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </h3>
                    <AnimatePresence mode="wait">
                      {isActive && (
                        <motion.p
                          className="text-xs text-muted-foreground mt-1 leading-relaxed"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {step.description}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {/* Progress bar for active step */}
                    {isActive && !isPaused && (
                      <div className="mt-2 h-0.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: AUTO_SWITCH_MS / 1000, ease: "linear" }}
                          key={`progress-${activeStep}`}
                        />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </motion.div>

          {/* Right — Screenshot */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={activeStep}
                src={steps[activeStep].image}
                alt={steps[activeStep].imageAlt}
                className="w-full h-auto rounded-2xl shadow-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              />
            </AnimatePresence>
          </motion.div>
        </div>

        <motion.div
          className="mt-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Button size="lg" className="rounded-full" onClick={onScrollToForm}>
            Chcę taki system — zaczynam za darmo
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

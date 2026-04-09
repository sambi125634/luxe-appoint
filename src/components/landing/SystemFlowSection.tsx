import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, Bell, RotateCcw, Brain, Gift, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

import stepBookingNew from "@/assets/screenshots/step-booking-new.png";
import stepAutopilot from "@/assets/screenshots/step-autopilot.png";
import stepPipeline from "@/assets/screenshots/step-pipeline.png";
import stepRadar from "@/assets/screenshots/step-radar.png";
import stepReferral from "@/assets/screenshots/step-referral.png";
import stepDashboard from "@/assets/screenshots/step-dashboard.png";

interface Step {
  icon: LucideIcon;
  number: number;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

const steps: Step[] = [
  {
    icon: CalendarCheck,
    number: 1,
    title: "Rezerwacja w 30 sekund — bez aplikacji",
    description:
      "Klientka otwiera link, wybiera termin i rezerwuje. Bez pobierania aplikacji, bez zakładania konta, bez dzwonienia. 30 sekund od kliknięcia do potwierdzenia. Żaden inny system na polskim rynku tego nie oferuje.",
    image: stepBooking,
    imageAlt: "Rezerwacja online w 30 sekund bez aplikacji — Beauty Calendar",
  },
  {
    icon: Bell,
    number: 2,
    title: "Rozgrzewka przed wizytą",
    description:
      "Inne systemy wysyłają suche przypomnienie. Twój wysyła treści edukacyjne o zarezerwowanej usłudze — klientka czeka na wizytę jak na prezent. Efekt? −67% no-showów w pierwszym miesiącu.",
    image: stepDashboard,
    imageAlt: "Rozgrzewka przed wizytą — redukcja no-showów o 67%",
  },
  {
    icon: RotateCcw,
    number: 3,
    title: "Sekwencja 5 wizyt",
    description:
      "Statystyka jest brutalna: 60% nowych klientek nie wraca po pierwszej wizycie. System wysyła idealnie wyczasowane wiadomości, które prowadzą klientkę od pierwszej wizyty do piątej — automatycznie, bez Twojego udziału.",
    image: stepRetention,
    imageAlt: "Automatyczna sekwencja 5 wizyt — retencja klientek",
  },
  {
    icon: Brain,
    number: 4,
    title: "Radar Odejść — AI, który nie śpi",
    description:
      "AI analizuje zachowanie każdej klientki i wykrywa sygnały odejścia 3 tygodnie wcześniej. Zanim klientka zdąży zapomnieć o Twoim salonie, dostaje spersonalizowaną ofertę powrotu. Ty nawet nie wiesz, że była zagrożona.",
    image: stepClients,
    imageAlt: "Radar Odejść — AI wykrywa zagrożone klientki 3 tygodnie wcześniej",
  },
  {
    icon: Gift,
    number: 5,
    title: "Efekt Kuli Śnieżnej",
    description:
      "Zadowolona klientka poleca Twój salon koleżance. Koleżanka dostaje powitalny rabat, klientka — nagrodę. System śledzi każde polecenie, nalicza nagrody i buduje ranking ambasadorek. Bez Twojego wysiłku.",
    image: stepClients,
    imageAlt: "Efekt Kuli Śnieżnej — automatyczny system poleceń",
  },
  {
    icon: TrendingUp,
    number: 6,
    title: "True Profit — ile naprawdę zarabiasz",
    description:
      "Inne systemy pokazują przychód. Twój odejmuje koszt produktów, czas pracy, prowizje — i pokazuje realny zysk z każdej usługi, każdego dnia, każdej stylistki. Pierwszy raz wiesz, ile naprawdę zarabiasz.",
    image: stepDashboard,
    imageAlt: "True Profit — realny zysk z każdej usługi i stylistki",
  },
];

const AUTO_SWITCH_MS = 6000;

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
    setTimeout(() => setIsPaused(false), 12000);
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
            Jedna klientka. Pięć wizyt.{" "}
            <br className="hidden md:block" />
            <span className="text-primary">Zero Twojego wysiłku.</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-8 lg:gap-12 items-start">
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
                  {/* Number + Icon circle */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 text-sm font-bold ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.number}
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

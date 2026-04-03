import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Gift, Bell, Heart, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClientOnboardingProps {
  salonName: string;
  onComplete: () => void;
}

const slides = [
  {
    icon: Calendar,
    title: "Rezerwuj online 24/7",
    description: "Umów wizytę w kilka sekund — bez dzwonienia. Wybierz usługę, termin i specjalistkę.",
    color: "from-blue-500/15 to-blue-600/15",
    iconColor: "text-blue-600",
  },
  {
    icon: Gift,
    title: "Zbieraj punkty",
    description: "Za każdą wizytę dostajesz punkty lojalnościowe. Wymieniaj je na darmowe zabiegi i rabaty!",
    color: "from-primary/15 to-primary/20",
    iconColor: "text-primary",
  },
  {
    icon: Bell,
    title: "Nigdy nie zapomnisz",
    description: "Przypomnienia o wizytach, nowe promocje i kupony — wszystko w jednym miejscu.",
    color: "from-green-500/15 to-green-600/15",
    iconColor: "text-green-600",
  },
  {
    icon: Heart,
    title: "Poleć znajomej",
    description: "Udostępnij link i zyskaj punkty za każde polecenie. Twoja znajoma też dostanie bonus!",
    color: "from-pink-500/15 to-pink-600/15",
    iconColor: "text-pink-600",
  },
];

export function ClientOnboarding({ salonName, onComplete }: ClientOnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const isLast = currentSlide === slides.length - 1;
  const slide = slides[currentSlide];

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">{salonName}</span>
        </div>
        <button
          onClick={onComplete}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Pomiń
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col items-center text-center"
          >
            <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${slide.color} flex items-center justify-center mb-8`}>
              <slide.icon className={`h-14 w-14 ${slide.iconColor}`} />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">{slide.title}</h2>
            <p className="text-base text-muted-foreground leading-relaxed max-w-xs">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-6 pb-10 space-y-4">
        {/* Dots */}
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentSlide ? "w-8 bg-primary" : "w-2 bg-muted-foreground/20"
              }`}
            />
          ))}
        </div>

        <Button
          className="w-full h-14 rounded-2xl text-base font-semibold"
          onClick={handleNext}
        >
          {isLast ? "Zaczynamy!" : "Dalej"}
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}

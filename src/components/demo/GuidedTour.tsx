import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft, Calendar, Plus, Scissors, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface GuidedTourProps {
  onClose: () => void;
}

const tourSteps = [
  {
    icon: Sparkles,
    title: "Witaj w Beauty Calendar!",
    description: "Poznaj system, który zrewolucjonizuje zarządzanie Twoim salonem. Pokażemy Ci najważniejsze funkcje w 4 prostych krokach.",
    highlight: null,
  },
  {
    icon: Calendar,
    title: "Twój kalendarz wizyt",
    description: "Tutaj widzisz wszystkie rezerwacje w widoku tygodniowym. Kolorowe kafelki pokazują wizyty poszczególnych pracowników. Kliknij dowolny slot, aby dodać nową wizytę.",
    highlight: "calendar",
  },
  {
    icon: Plus,
    title: "Dodawanie wizyt w sekundę",
    description: "Kliknij na wolny slot w kalendarzu lub użyj przycisku 'Nowa wizyta'. Wybierz klientkę, usługę i pracownika - gotowe! System automatycznie sprawdza dostępność.",
    highlight: "add-appointment",
  },
  {
    icon: Scissors,
    title: "Zarządzaj usługami i personelem",
    description: "W menu bocznym znajdziesz sekcje Usługi i Personel. Dodawaj nowe usługi z cenami, czasem trwania i zdjęciami. Przypisuj je do konkretnych pracowników.",
    highlight: "sidebar",
  },
];

export function GuidedTour({ onClose }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" />
      
      {/* Spotlight effect based on highlight */}
      {step.highlight && (
        <div className={cn(
          "absolute border-4 border-primary rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] animate-pulse",
          step.highlight === "calendar" && "top-32 left-72 right-8 bottom-8",
          step.highlight === "add-appointment" && "top-4 right-4 w-40 h-12",
          step.highlight === "sidebar" && "top-20 left-4 w-60 h-64",
        )} />
      )}

      {/* Tour Card */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-4">
        <div className="glass-card-elevated p-6 relative animate-scale-in">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-4">
            {tourSteps.map((_, index) => (
              <div 
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === currentStep 
                    ? "w-8 bg-primary" 
                    : index < currentStep 
                      ? "w-4 bg-primary/50" 
                      : "w-4 bg-muted"
                )}
              />
            ))}
          </div>

          {/* Content */}
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
              <step.icon className="w-7 h-7 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              disabled={isFirstStep}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Wstecz
            </Button>

            <span className="text-sm text-muted-foreground">
              {currentStep + 1} / {tourSteps.length}
            </span>

            <Button
              variant="luxury"
              size="sm"
              onClick={handleNext}
              className="gap-1"
            >
              {isLastStep ? "Rozpocznij" : "Dalej"}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>

          {/* Skip link */}
          <button 
            onClick={onClose}
            className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          >
            Pomiń przewodnik
          </button>
        </div>
      </div>
    </div>
  );
}

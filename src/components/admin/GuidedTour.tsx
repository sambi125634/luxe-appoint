import { useState, useEffect, useCallback } from "react";
import { X, ArrowRight, ArrowLeft, Calendar, Users, Scissors, UserCheck, LayoutDashboard, Code, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TabType } from "./AdminSidebar";
import { TabType } from "./AdminSidebar";

interface TourStep {
  id: string;
  targetTab: TabType;
  icon: React.ReactNode;
  title: string;
  description: string;
  limitations?: string;
  position: "center" | "content";
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    targetTab: "home",
    icon: <Sparkles className="w-6 h-6" />,
    title: "Witaj w Beauty Calendar! 🎉",
    description: "Przeprowadzimy Cię przez każdą sekcję panelu, żebyś wiedziała dokładnie co tu robisz, jakie dane wpisać i dlaczego to ważne. Zajmie to 2 minuty.",
    position: "center",
  },
  {
    id: "dashboard",
    targetTab: "home",
    icon: <LayoutDashboard className="w-6 h-6" />,
    title: "Dashboard — centrum dowodzenia",
    description: "Tutaj widzisz podsumowanie dnia: nadchodzące wizyty, przychody, alerty i statystyki. Im więcej danych dodasz, tym więcej informacji tutaj zobaczysz.",
    limitations: "Bez wizyt i klientów dashboard będzie pusty — to normalne na start.",
    position: "content",
  },
  {
    id: "calendar",
    targetTab: "calendar",
    icon: <Calendar className="w-6 h-6" />,
    title: "Kalendarz — serce salonu",
    description: "Tutaj zarządzasz wizytami. Kliknij w wolny slot, aby dodać wizytę. Widzisz grafik wszystkich pracowników na jednym ekranie. Klientki mogą też rezerwować same przez widget.",
    limitations: "Żeby widzieć sloty, musisz najpierw dodać pracowników i ustawić godziny pracy.",
    position: "content",
  },
  {
    id: "clients",
    targetTab: "clients",
    icon: <Users className="w-6 h-6" />,
    title: "Klienci — Twoja baza",
    description: "Lista wszystkich klientów salonu. Możesz dodać klientów ręcznie, importować z CSV, lub poczekać — system automatycznie tworzy profil przy pierwszej rezerwacji.",
    limitations: "Bez klientów nie będziesz mogła tworzyć wizyt w kalendarzu.",
    position: "content",
  },
  {
    id: "services",
    targetTab: "services",
    icon: <Scissors className="w-6 h-6" />,
    title: "Usługi — Twój cennik",
    description: "Zarządzaj usługami: nazwy, ceny, czas trwania, kategorie. Te dane wyświetlają się w widgecie rezerwacji. Jeśli korzystałaś z szablonów w onboardingu, Twoje usługi już tu są.",
    voiceText: "Sekcja usług to Twój cennik. Zarządzasz tu nazwami, cenami, czasem trwania i kategoriami zabiegów. Te dane wyświetlają się w widgecie rezerwacji, który widzą Twoje klientki. Jeśli korzystałaś z szablonów w onboardingu, Twoje usługi już tu są.",
    limitations: "Bez usług klientki nie będą mogły rezerwować wizyt.",
    position: "content",
  },
  {
    id: "staff",
    targetTab: "staff",
    icon: <UserCheck className="w-6 h-6" />,
    title: "Pracownicy — Twój zespół",
    description: "Dodaj członków zespołu, przypisz im usługi i ustaw godziny pracy. Każdy pracownik ma swój kolor w kalendarzu. Możesz też zaprosić ich do systemu.",
    voiceText: "Tu dodajesz członków zespołu. Każdy pracownik ma swoje godziny pracy, przypisane usługi i unikalny kolor w kalendarzu. Jeśli pracujesz sama, dodaj siebie jako jedynego pracownika — to konieczne, żeby kalendarz działał.",
    limitations: "Bez pracowników kalendarz nie pokaże żadnych slotów.",
    position: "content",
  },
  {
    id: "widgets",
    targetTab: "widgets",
    icon: <Code className="w-6 h-6" />,
    title: "Widget — rezerwacje online",
    description: "Skopiuj kod widgetu i wklej na swoją stronę www lub udostępnij bezpośredni link. Klientki rezerwują 24/7 — nawet o 23:00. To najważniejszy krok do automatyzacji.",
    voiceText: "Widget rezerwacji to klucz do automatyzacji. Skopiuj kod i wklej na swoją stronę, albo udostępnij bezpośredni link w mediach społecznościowych. Klientki rezerwują 24 na 7 — nawet o 23 w nocy, kiedy Ty odpoczywasz.",
    limitations: "Widget wymaga skonfigurowanych usług i pracowników, żeby pokazywać wolne terminy.",
    position: "content",
  },
  {
    id: "settings",
    targetTab: "settings",
    icon: <Settings className="w-6 h-6" />,
    title: "Ustawienia — personalizacja",
    description: "Skonfiguruj profil salonu, branding, powiadomienia SMS/email i integracje. Logo i kolory wyświetlają się w widgecie rezerwacji.",
    voiceText: "W ustawieniach konfigurujesz profil salonu, logo, kolory brandingowe, powiadomienia SMS i email dla klientek, oraz integracje z innymi narzędziami jak Google Calendar. Twoje logo i kolory wyświetlają się w widgecie rezerwacji.",
    position: "content",
  },
  {
    id: "cta",
    targetTab: "home",
    icon: <Sparkles className="w-6 h-6" />,
    title: "Gotowa do startu! 🚀",
    description: "Znasz już wszystkie sekcje. Zacznij od uzupełnienia danych — lista kontrolna na dashboardzie pokaże Ci co jeszcze zostało. Możesz uruchomić ten samouczek ponownie w dowolnym momencie.",
    voiceText: "Gratulacje! Znasz już wszystkie sekcje panelu. Zacznij od uzupełnienia danych — lista kontrolna na dashboardzie pokaże Ci co jeszcze zostało do zrobienia. Możesz uruchomić ten samouczek ponownie w dowolnym momencie z menu bocznego.",
    position: "center",
  },
];

interface GuidedTourProps {
  onTabChange: (tab: TabType) => void;
  onComplete: () => void;
}

export function GuidedTour({ onTabChange, onComplete }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const step = tourSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  useEffect(() => {
    if (step.position !== "center") {
      onTabChange(step.targetTab);
    }
  }, [currentStep, step.targetTab, step.position, onTabChange]);

  const animate = useCallback((cb: () => void) => {
    setIsAnimating(true);
    setTimeout(() => {
      cb();
      setIsAnimating(false);
    }, 150);
  }, []);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      animate(() => setCurrentStep((p) => p + 1));
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      animate(() => setCurrentStep((p) => p - 1));
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem("admin-tour-completed", "true");
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] animate-fade-in" />

      <div
        className={cn(
          "fixed z-[70] transition-all duration-300",
          step.position === "center"
            ? "inset-0 flex items-center justify-center p-4"
            : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        )}
      >
        <div
          className={cn(
            "bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden",
            isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100",
            "transition-all duration-300 animate-scale-in"
          )}
        >
          {/* Progress */}
          <div className="h-1 bg-muted">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Header */}
          <div className="p-6 pb-0 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary">
                {step.icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Krok {currentStep + 1} z {tourSteps.length}
                </p>
                <h3 className="font-serif text-xl font-semibold">{step.title}</h3>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleComplete} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-muted-foreground leading-relaxed">{step.description}</p>

            {step.limitations && (
              <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  ⚠️ {step.limitations}
                </p>
              </div>
            )}

            {/* Voice guidance */}
            <div className="mt-4">
              <VoiceGuidanceButton text={step.voiceText} label="Posłuchaj wyjaśnienia" variant="outline" size="sm" />
            </div>

            {isLastStep && (
              <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20">
                <p className="text-sm font-medium text-center">
                  💡 Samouczek możesz uruchomić ponownie klikając „Samouczek" w menu bocznym
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 pt-0 flex items-center justify-between">
            <Button variant="ghost" onClick={handleComplete} className="text-muted-foreground">
              Pomiń
            </Button>
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <Button variant="outline" onClick={handlePrev} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Wstecz
                </Button>
              )}
              <Button onClick={handleNext} className="gap-2">
                {isLastStep ? (
                  <>
                    Rozpocznij pracę
                    <Sparkles className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Dalej
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function useAdminTourState() {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem("admin-tour-completed");
    if (!completed) {
      const timer = setTimeout(() => setShowTour(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const restartTour = useCallback(() => {
    localStorage.removeItem("admin-tour-completed");
    setShowTour(true);
  }, []);

  return { showTour, setShowTour, restartTour };
}

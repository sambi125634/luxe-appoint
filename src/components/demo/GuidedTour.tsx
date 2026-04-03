import { useState, useEffect } from "react";
import { X, ArrowRight, ArrowLeft, Calendar, Users, Scissors, UserCheck, LayoutDashboard, Code, Settings, Sparkles, MessageSquare, ClipboardList, Package, Receipt, Route, Radar, Heart, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { TabType } from "@/components/admin/AdminSidebar";

interface TourStep {
  id: string;
  targetTab: TabType;
  icon: React.ReactNode;
  position: "center" | "content";
}

const tourSteps: TourStep[] = [
  { id: "welcome", targetTab: "home", icon: <Sparkles className="w-6 h-6" />, position: "center" },
  { id: "dashboard", targetTab: "home", icon: <LayoutDashboard className="w-6 h-6" />, position: "content" },
  { id: "calendar", targetTab: "calendar", icon: <Calendar className="w-6 h-6" />, position: "content" },
  { id: "widgets", targetTab: "widgets", icon: <Code className="w-6 h-6" />, position: "content" },
  { id: "staff", targetTab: "staff", icon: <UserCheck className="w-6 h-6" />, position: "content" },
  { id: "clients", targetTab: "clients", icon: <Users className="w-6 h-6" />, position: "content" },
  { id: "conversations", targetTab: "conversations", icon: <MessageSquare className="w-6 h-6" />, position: "content" },
  { id: "consultation", targetTab: "consultation", icon: <ClipboardList className="w-6 h-6" />, position: "content" },
  { id: "services", targetTab: "services", icon: <Scissors className="w-6 h-6" />, position: "content" },
  { id: "products", targetTab: "products", icon: <Package className="w-6 h-6" />, position: "content" },
  { id: "accounting", targetTab: "accounting", icon: <Receipt className="w-6 h-6" />, position: "content" },
  { id: "pipeline", targetTab: "pipeline", icon: <Route className="w-6 h-6" />, position: "content" },
  { id: "retention", targetTab: "retention", icon: <Radar className="w-6 h-6" />, position: "content" },
  { id: "referral", targetTab: "referral", icon: <Heart className="w-6 h-6" />, position: "content" },
  { id: "settings", targetTab: "settings", icon: <Settings className="w-6 h-6" />, position: "content" },
  { id: "support", targetTab: "support", icon: <HelpCircle className="w-6 h-6" />, position: "content" },
  { id: "cta", targetTab: "home", icon: <Sparkles className="w-6 h-6" />, position: "center" },
];

interface GuidedTourProps {
  onTabChange: (tab: TabType) => void;
  onComplete: () => void;
}

export function GuidedTour({ onTabChange, onComplete }: GuidedTourProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const step = tourSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  useEffect(() => {
    if (step.targetTab && step.position !== "center") {
      onTabChange(step.targetTab);
    }
  }, [currentStep, step.targetTab, step.position, onTabChange]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem("demo-tour-completed", "true");
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] animate-fade-in" />
      
      <div className={cn(
        "fixed z-[70] transition-all duration-300",
        step.position === "center" 
          ? "inset-0 flex items-center justify-center p-4" 
          : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      )}>
        <div className={cn(
          "bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden",
          isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100",
          "transition-all duration-300 animate-scale-in"
        )}>
          {/* Progress bar */}
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
                  {t("tour.step", { current: currentStep + 1, total: tourSteps.length })}
                </p>
                <h3 className="font-serif text-xl font-semibold">
                  {t(`tour.steps.${step.id}.title`)}
                </h3>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleComplete} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-muted-foreground leading-relaxed">
              {t(`tour.steps.${step.id}.description`)}
            </p>

            {isLastStep && (
              <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20">
                <p className="text-sm font-medium text-center">
                  {t("tour.restartHint")}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 pt-0 flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={handleComplete}
              className="text-muted-foreground"
            >
              {t("tour.skip")}
            </Button>
            
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <Button variant="outline" onClick={handlePrev} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  {t("common.back")}
                </Button>
              )}
              <Button onClick={handleNext} className="gap-2">
                {isLastStep ? (
                  <>
                    {t("tour.start")}
                    <Sparkles className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    {t("common.next")}
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

export function useTourState() {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const tourCompleted = localStorage.getItem("demo-tour-completed");
    if (!tourCompleted) {
      const timer = setTimeout(() => setShowTour(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  return { showTour, setShowTour };
}

import { useState, useEffect, useCallback, useLayoutEffect } from "react";
import { X, ArrowRight, ArrowLeft, Calendar, Users, Scissors, Code, Sparkles, Receipt, Radar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { TabType } from "./AdminSidebar";

interface TourStep {
  id: string;
  targetTab: TabType;
  icon: React.ReactNode;
  position: "center" | "spotlight";
}

const tourSteps: TourStep[] = [
  { id: "welcome",    targetTab: "home",       icon: <Sparkles className="w-6 h-6" />, position: "center" },
  { id: "calendar",   targetTab: "calendar",   icon: <Calendar className="w-6 h-6" />, position: "spotlight" },
  { id: "clients",    targetTab: "clients",    icon: <Users className="w-6 h-6" />,    position: "spotlight" },
  { id: "services",   targetTab: "services",   icon: <Scissors className="w-6 h-6" />, position: "spotlight" },
  { id: "accounting", targetTab: "accounting", icon: <Receipt className="w-6 h-6" />,  position: "spotlight" },
  { id: "retention",  targetTab: "retention",  icon: <Radar className="w-6 h-6" />,    position: "spotlight" },
  { id: "widgets",    targetTab: "widgets",    icon: <Code className="w-6 h-6" />,     position: "spotlight" },
  { id: "cta",        targetTab: "home",       icon: <Sparkles className="w-6 h-6" />, position: "center" },
];

interface GuidedTourProps {
  onTabChange: (tab: TabType) => void;
  onComplete: () => void;
}

type Rect = { top: number; left: number; width: number; height: number };

function useTargetRect(selector: string | null): Rect | null {
  const [rect, setRect] = useState<Rect | null>(null);

  useLayoutEffect(() => {
    if (!selector) {
      setRect(null);
      return;
    }
    let raf = 0;
    const measure = () => {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    const tick = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    // Retry a few times after mount/tab-change so layout settles
    measure();
    const timeouts = [50, 150, 300, 600].map((d) => window.setTimeout(measure, d));
    window.addEventListener("resize", tick);
    window.addEventListener("scroll", tick, true);
    return () => {
      cancelAnimationFrame(raf);
      timeouts.forEach(clearTimeout);
      window.removeEventListener("resize", tick);
      window.removeEventListener("scroll", tick, true);
    };
  }, [selector]);

  return rect;
}

export function GuidedTour({ onTabChange, onComplete }: GuidedTourProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = tourSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  useEffect(() => {
    onTabChange(step.targetTab);
  }, [currentStep, step.targetTab, step.position, onTabChange]);

  const targetSelector =
    step.position === "spotlight" ? `[data-tour-target="${step.targetTab}"]` : null;
  const rect = useTargetRect(targetSelector);

  const handleNext = () => {
    if (isLastStep) handleComplete();
    else setCurrentStep((p) => p + 1);
  };

  const handlePrev = () => {
    if (!isFirstStep) setCurrentStep((p) => p - 1);
  };

  const handleComplete = useCallback(() => {
    setIsVisible(false);
    localStorage.setItem("admin-tour-completed", "true");
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleComplete();
      else if (e.key === "ArrowRight") {
        if (currentStep < tourSteps.length - 1) setCurrentStep((p) => p + 1);
        else handleComplete();
      } else if (e.key === "ArrowLeft" && currentStep > 0) {
        setCurrentStep((p) => p - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentStep, handleComplete]);

  if (!isVisible) return null;

  // ---------- Card ----------
  const card = (
    <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="p-5 pb-0 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary">
            {step.icon}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
              {t("tour.step", { current: currentStep + 1, total: tourSteps.length })}
            </p>
            <h3 className="font-serif text-lg font-semibold leading-tight truncate">
              {t(`tour.steps.${step.id}.title`)}
            </h3>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleComplete} className="text-muted-foreground hover:text-foreground -mt-1 -mr-1 shrink-0">
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="p-5">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t(`tour.steps.${step.id}.description`)}
        </p>
        {isLastStep && (
          <div className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20">
            <p className="text-xs font-medium text-center">
              {t("tour.restartHint")}
            </p>
          </div>
        )}
      </div>
      <div className="px-5 pb-5 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleComplete} className="text-muted-foreground">
          {t("tour.skip")}
        </Button>
        <div className="flex items-center gap-2">
          {!isFirstStep && (
            <Button variant="outline" size="sm" onClick={handlePrev} className="gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              {t("common.back")}
            </Button>
          )}
          <Button size="sm" onClick={handleNext} className="gap-1.5">
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
  );

  // ---------- Centered (welcome / cta) ----------
  if (step.position === "center" || !rect) {
    return (
      <>
        <div
          className="fixed inset-0 bg-background/70 backdrop-blur-[2px] z-[60] animate-fade-in"
          onClick={handleComplete}
        />
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-md">{card}</div>
        </div>
      </>
    );
  }

  // ---------- Spotlight ----------
  const PAD = 8;
  const sx = Math.max(0, rect.left - PAD);
  const sy = Math.max(0, rect.top - PAD);
  const sw = rect.width + PAD * 2;
  const sh = rect.height + PAD * 2;

  // Tooltip placement: right of the sidebar item, vertically centered, clamped.
  const CARD_W = 384; // max-w-md
  const CARD_EST_H = 320;
  const GAP = 16;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  let tipLeft = sx + sw + GAP;
  if (tipLeft + CARD_W + 12 > vw) tipLeft = Math.max(12, sx - CARD_W - GAP);
  let tipTop = sy + sh / 2 - CARD_EST_H / 2;
  tipTop = Math.max(12, Math.min(tipTop, vh - CARD_EST_H - 12));

  const dim = "bg-black/55";

  return (
    <>
      {/* 4-segment dim around spotlight (transparent inside) */}
      <div className={cn("fixed left-0 right-0 top-0 z-[60] animate-fade-in", dim)} style={{ height: sy }} />
      <div className={cn("fixed left-0 right-0 z-[60]", dim)} style={{ top: sy + sh, bottom: 0 }} />
      <div className={cn("fixed z-[60]", dim)} style={{ top: sy, left: 0, width: sx, height: sh }} />
      <div className={cn("fixed z-[60]", dim)} style={{ top: sy, left: sx + sw, right: 0, height: sh }} />

      {/* Spotlight ring (non-blocking, so item stays clickable) */}
      <div
        className="fixed z-[61] rounded-2xl pointer-events-none transition-all duration-300 ease-out"
        style={{
          top: sy,
          left: sx,
          width: sw,
          height: sh,
          boxShadow:
            "0 0 0 2px hsl(var(--primary)), 0 0 0 6px hsl(var(--primary) / 0.25), 0 0 48px 12px hsl(var(--primary) / 0.45)",
        }}
      />

      {/* Tooltip card */}
      <div
        className="fixed z-[70] transition-all duration-300 ease-out"
        style={{ top: tipTop, left: tipLeft, width: CARD_W }}
      >
        {card}
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

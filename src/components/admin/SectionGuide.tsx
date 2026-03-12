import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Lightbulb, ListOrdered, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface SectionGuideProps {
  sectionKey: string;
  className?: string;
}

const SECTION_KEYS = [
  "home", "calendar", "clients", "services", "staff", "widgets",
  "timeOff", "stats", "settings", "conversations", "pipeline",
  "accounting", "products", "recipes", "consultation", "support"
];

export function SectionGuide({ sectionKey, className }: SectionGuideProps) {
  const { t } = useTranslation();
  const storageKey = `section-guide-seen-${sectionKey}`;
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(storageKey);
    if (!seen) {
      setIsExpanded(true);
      localStorage.setItem(storageKey, "true");
    }
  }, [storageKey]);

  if (!SECTION_KEYS.includes(sectionKey)) return null;

  const goal = t(`sectionGuide.${sectionKey}.goal`);
  const steps = t(`sectionGuide.${sectionKey}.steps`, { returnObjects: true }) as string[];
  const painPoint = t(`sectionGuide.${sectionKey}.painPoint`);

  return (
    <div className={cn("mb-6 animate-fade-in", className)}>
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors w-full text-left group"
        >
          <Lightbulb className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-medium text-primary">{t('sectionGuide.showGuide')}</span>
          <span className="text-xs text-muted-foreground ml-1 hidden sm:inline">{t('sectionGuide.showGuideHint')}</span>
          <ChevronDown className="w-4 h-4 text-primary ml-auto shrink-0 group-hover:translate-y-0.5 transition-transform" />
        </button>
      )}

      {isExpanded && (
        <div className="p-5 bg-gradient-to-br from-card to-muted/20 border border-border rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">{t('sectionGuide.guideTitle')}</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('sectionGuide.collapse')}
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-foreground leading-relaxed">{goal}</p>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2">
              <ListOrdered className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('sectionGuide.howTo')}</span>
            </div>
            <ol className="space-y-1.5 ml-0.5">
              {Array.isArray(steps) && steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/10">
            <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-primary/90 leading-relaxed">{painPoint}</p>
          </div>
        </div>
      )}
    </div>
  );
}

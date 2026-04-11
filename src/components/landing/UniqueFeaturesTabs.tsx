import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sparkles, RefreshCw, AlertOctagon, Heart, ShieldCheck, Bell, Repeat2, Smartphone, QrCode, Gift, Database, Tags, FlaskConical,
  type LucideIcon,
} from "lucide-react";

const ACCENT_CLASSES: Record<string, { bg: string; text: string; border: string; badgeBg: string; metricText: string }> = {
  violet: { bg: "bg-violet-100", text: "text-violet-600", border: "hover:border-violet-200", badgeBg: "bg-violet-50 text-violet-600 border-violet-200", metricText: "text-violet-600" },
  orange: { bg: "bg-orange-100", text: "text-orange-600", border: "hover:border-orange-200", badgeBg: "bg-orange-50 text-orange-600 border-orange-200", metricText: "text-orange-600" },
  pink: { bg: "bg-pink-100", text: "text-pink-600", border: "hover:border-pink-200", badgeBg: "bg-pink-50 text-pink-600 border-pink-200", metricText: "text-pink-600" },
  green: { bg: "bg-emerald-100", text: "text-emerald-600", border: "hover:border-emerald-200", badgeBg: "bg-emerald-50 text-emerald-600 border-emerald-200", metricText: "text-emerald-600" },
  blue: { bg: "bg-blue-100", text: "text-blue-600", border: "hover:border-blue-200", badgeBg: "bg-blue-50 text-blue-600 border-blue-200", metricText: "text-blue-600" },
  teal: { bg: "bg-teal-100", text: "text-teal-600", border: "hover:border-teal-200", badgeBg: "bg-teal-50 text-teal-600 border-teal-200", metricText: "text-teal-600" },
  indigo: { bg: "bg-indigo-100", text: "text-indigo-600", border: "hover:border-indigo-200", badgeBg: "bg-indigo-50 text-indigo-600 border-indigo-200", metricText: "text-indigo-600" },
  rose: { bg: "bg-rose-100", text: "text-rose-600", border: "hover:border-rose-200", badgeBg: "bg-rose-50 text-rose-600 border-rose-200", metricText: "text-rose-600" },
  amber: { bg: "bg-amber-100", text: "text-amber-600", border: "hover:border-amber-200", badgeBg: "bg-amber-50 text-amber-600 border-amber-200", metricText: "text-amber-600" },
};

const tabIcons: LucideIcon[][] = [
  [RefreshCw, AlertOctagon, Heart],
  [ShieldCheck, Bell, Repeat2],
  [Smartphone, QrCode, Gift],
  [Database, Tags, FlaskConical],
];

const tabColors = [
  ["violet", "orange", "pink"],
  ["green", "blue", "teal"],
  ["violet", "indigo", "rose"],
  ["violet", "amber", "teal"],
];

function ExportDescription({ t }: { t: (k: string) => string }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          <span className="font-medium text-foreground/70">{t("landing.features.exportBooksy")}</span> {t("landing.features.exportBooksyList")}
        </p>
      </div>
      <div className="border-l-2 border-primary/30 pl-3">
        <p className="text-sm leading-relaxed">
          <span className="font-semibold text-primary">{t("landing.features.exportBc")}</span>{" "}
          <span className="text-muted-foreground">{t("landing.features.exportBcList")}</span>
        </p>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{t("landing.features.exportConclusion")}</p>
    </div>
  );
}

export function UniqueFeaturesTabs() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const INTERVAL_MS = 8000;
  const TICK_MS = 50;

  const tabEmojis = [t("landing.features.tab1emoji"), t("landing.features.tab2emoji"), t("landing.features.tab3emoji"), t("landing.features.tab4emoji")];
  const tabLabels = [t("landing.features.tab1"), t("landing.features.tab2"), t("landing.features.tab3"), t("landing.features.tab4")];

  // Build cards from translation keys
  const cardKeys = [[1,2,3],[4,5,6],[7,8,9],[10,11,12]];
  const tabs = cardKeys.map((keys, tabIdx) => ({
    emoji: tabEmojis[tabIdx],
    label: tabLabels[tabIdx],
    cards: keys.map((k, cardIdx) => ({
      icon: tabIcons[tabIdx][cardIdx],
      badge: t(`landing.features.c${k}badge`),
      title: t(`landing.features.c${k}title`),
      description: k === 10 ? "__EXPORT__" : t(`landing.features.c${k}desc`),
      metric: t(`landing.features.c${k}metric`),
      accentColor: tabColors[tabIdx][cardIdx],
    })),
  }));

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { setActiveTab((current) => (current + 1) % tabs.length); return 0; }
        return prev + (100 / (INTERVAL_MS / TICK_MS));
      });
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [isPaused, tabs.length]);

  useEffect(() => { setProgress(0); }, [activeTab]);

  const handleTabClick = useCallback((index: number) => { setActiveTab(index); setIsPaused(true); setProgress(0); }, []);
  const handleAreaEnter = useCallback(() => setIsPaused(true), []);
  const handleAreaLeave = useCallback(() => setIsPaused(false), []);

  const scrollToPricing = () => { document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" }); };

  return (
    <div className="py-16 md:py-20 lg:py-28">
      <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
        <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-full px-4 py-1.5 mb-6">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <span className="text-sm font-medium text-violet-600">{t("landing.features.badge")}</span>
        </div>
        <h2 className="text-2xl md:text-4xl lg:text-[42px] font-bold leading-tight mb-4">
          <span className="text-primary">{t("landing.features.title1")}</span> {t("landing.features.title2")}
        </h2>
        <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {t("landing.features.subtitle1")}{" "}<span className="text-foreground font-medium">{t("landing.features.subtitle2")}</span>
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }}>
        <div className="relative flex items-center gap-1 md:gap-2 mb-8 md:mb-10 p-1 md:p-1.5 bg-gray-100 rounded-2xl max-w-2xl mx-auto">
          {tabs.map((tab, i) => (
            <button key={i} onClick={() => handleTabClick(i)} className={cn("flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-2 md:px-3 py-2.5 md:py-2.5 rounded-xl transition-all duration-300 text-xs md:text-sm font-semibold relative", activeTab === i ? "bg-violet-600 text-white shadow-md shadow-violet-200" : "text-gray-400 hover:text-gray-600 hover:bg-white/60")}>
              <span className="text-base leading-none">{tab.emoji}</span>
              <span className="leading-none text-[10px] sm:text-xs md:text-sm">{tab.label}</span>
              {activeTab === i && i < tabs.length - 1 && (
                <motion.div className="absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 sm:hidden" animate={{ x: [0, 4, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}>
                  <ChevronRight className="w-4 h-4 text-violet-400" />
                </motion.div>
              )}
            </button>
          ))}
        </div>
        <div className="max-w-2xl mx-auto h-0.5 bg-gray-100 rounded-full overflow-hidden mb-8">
          <motion.div className="h-full bg-violet-400 rounded-full" style={{ width: `${progress}%` }} transition={{ duration: 0.05, ease: "linear" }} />
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5" onMouseEnter={handleAreaEnter} onMouseLeave={handleAreaLeave}>
          {tabs[activeTab].cards.map((card, i) => {
            const accent = ACCENT_CLASSES[card.accentColor] || ACCENT_CLASSES.violet;
            const Icon = card.icon;
            const isExport = card.description === "__EXPORT__";
            return (
              <motion.div key={`${activeTab}-${i}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ delay: i * 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }} onMouseEnter={handleAreaEnter} onMouseLeave={handleAreaLeave} className={cn("bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:shadow-violet-50/50 transition-all duration-300 hover:-translate-y-1 cursor-default", accent.border)}>
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", accent.bg)}>
                    <Icon className={cn("w-5 h-5", accent.text)} />
                  </div>
                  <span className={cn("text-[11px] font-medium px-2.5 py-1 rounded-full border", accent.badgeBg)}>{card.badge}</span>
                </div>
                <h4 className="font-bold text-[15px] text-foreground mb-2 leading-snug">{card.title}</h4>
                {isExport ? <ExportDescription t={t} /> : <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>}
                <div className="border-t border-gray-100 mt-4 pt-3">
                  <p className={cn("text-sm font-semibold", accent.metricText)}>→ {card.metric}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <motion.div className="text-center mt-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
        <p className="text-sm text-muted-foreground mb-5">{t("landing.features.bottomNote")}</p>
        <Button onClick={scrollToPricing} size="lg" className="rounded-full px-8 text-base">{t("landing.features.bottomCta")}</Button>
      </motion.div>
    </div>
  );
}

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UniqueFeaturesTabs } from "./UniqueFeaturesTabs";

export const ComparisonSection = () => {
  const { t } = useTranslation();
  const [showShared, setShowShared] = useState(false);

  const sharedFeatures = [
    { name: t("landing.comparison.f1"), bc: true, market: true },
    { name: t("landing.comparison.f2"), bc: true, market: true },
    { name: t("landing.comparison.f3"), bc: true, market: true },
    { name: t("landing.comparison.f4"), bc: true, market: true },
    { name: t("landing.comparison.f5"), bc: true, market: true },
    { name: t("landing.comparison.f6"), bc: true, market: true },
    { name: t("landing.comparison.f7"), bc: true, market: true },
    { name: t("landing.comparison.f8"), bc: true, market: true },
    { name: t("landing.comparison.f9"), bc: true, market: true, bcNote: t("landing.comparison.f9bcNote"), marketNote: t("landing.comparison.f9marketNote") },
    { name: t("landing.comparison.f10"), bc: true, market: false, marketNote: t("landing.comparison.f10marketNote") },
    { name: t("landing.comparison.f11"), bc: true, market: true },
    { name: t("landing.comparison.f12"), bc: true, market: true },
    { name: t("landing.comparison.f13"), bc: true, market: true, bcNote: t("landing.comparison.f13bcNote"), marketNote: t("landing.comparison.f13marketNote") },
  ];

  return (
    <section className="py-20 lg:py-32 bg-white" id="comparison">
      <div className="container max-w-5xl">
        <UniqueFeaturesTabs />

        <motion.div className="mt-12 max-w-3xl mx-auto" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <button onClick={() => setShowShared(!showShared)} className="mx-auto flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            {t("landing.comparison.compareStandard")}
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showShared ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {showShared && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                <div className="mt-6 rounded-xl border border-border bg-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t("landing.comparison.feature")}</th>
                          <th className="text-center py-3 px-4 font-medium text-primary w-32">{t("landing.comparison.beautyCalendar")}</th>
                          <th className="text-center py-3 px-4 font-medium text-muted-foreground w-32">{t("landing.comparison.marketplace")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sharedFeatures.map((f, i) => (
                          <tr key={i} className="border-b border-border/50 last:border-0">
                            <td className="py-2.5 px-4 text-foreground">{f.name}</td>
                            <td className="py-2.5 px-4 text-center">
                              <div className="flex flex-col items-center gap-0.5">
                                <Check className="w-4 h-4 text-emerald-600" />
                                {f.bcNote && <span className="text-[10px] text-primary">{f.bcNote}</span>}
                              </div>
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <div className="flex flex-col items-center gap-0.5">
                                {f.market ? <Check className="w-4 h-4 text-muted-foreground" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                                {f.marketNote && <span className="text-[10px] text-muted-foreground">{f.marketNote}</span>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 px-4 py-2 border-t border-border/50">
                    {t("landing.comparison.disclaimer")}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

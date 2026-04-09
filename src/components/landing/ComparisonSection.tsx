import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronDown,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UniqueFeaturesTabs } from "./UniqueFeaturesTabs";

const sharedFeatures = [
  { name: "Kalendarz online z rezerwacjami", bc: true, market: true },
  { name: "CRM z kartami klientów i tagami", bc: true, market: true },
  { name: "Automatyczne SMS/email przypomnienia", bc: true, market: true },
  { name: "Kampanie marketingowe SMS/email", bc: true, market: true },
  { name: "Zarządzanie magazynem", bc: true, market: true },
  { name: "Raporty sprzedaży i statystyki", bc: true, market: true },
  { name: "Karty lojalnościowe / pieczątki", bc: true, market: true },
  { name: "Płatności online", bc: true, market: true },
  { name: "Kaucje / zaliczki", bc: true, market: true, bcNote: "automatyczne reguły", marketNote: "ręczne" },
  { name: "Wideoprezentacja usług", bc: true, market: false, marketNote: "tylko zdjęcia" },
  { name: "Grupy usług / kategorie", bc: true, market: true },
  { name: "Wielostanowiskowość", bc: true, market: true },
  { name: "Formularze / zgody klientek", bc: true, market: true, bcNote: "builder", marketNote: "prostsze" },
];

export const ComparisonSection = () => {
  const [showShared, setShowShared] = useState(false);

  const scrollToForm = () => {
    document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-20 lg:py-32 bg-white" id="comparison">
      <div className="container max-w-5xl">
        {/* Header */}


        {/* NEW: Unique features tabs */}
        <UniqueFeaturesTabs />

        {/* Shared features disclaimer + collapsible */}
        {/* Collapsible shared features */}
        <motion.div
          className="mt-12 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
            <button
              onClick={() => setShowShared(!showShared)}
              className="mx-auto flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Porównaj standardowe funkcje
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${showShared ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {showShared && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-6 rounded-xl border border-border bg-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/50">
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Funkcja</th>
                            <th className="text-center py-3 px-4 font-medium text-primary w-32">Beauty Calendar</th>
                            <th className="text-center py-3 px-4 font-medium text-muted-foreground w-32">Marketplace</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sharedFeatures.map((f, i) => (
                            <tr key={i} className="border-b border-border/50 last:border-0">
                              <td className="py-2.5 px-4 text-foreground">{f.name}</td>
                              <td className="py-2.5 px-4 text-center">
                                <div className="flex flex-col items-center gap-0.5">
                                  <Check className="w-4 h-4 text-emerald-600" />
                                  {f.bcNote && (
                                    <span className="text-[10px] text-primary">{f.bcNote}</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-2.5 px-4 text-center">
                                <div className="flex flex-col items-center gap-0.5">
                                  {f.market ? (
                                    <Check className="w-4 h-4 text-muted-foreground" />
                                  ) : (
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                  )}
                                  {f.marketNote && (
                                    <span className="text-[10px] text-muted-foreground">{f.marketNote}</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 px-4 py-2 border-t border-border/50">
                      Dane porównawcze oparte na publicznie dostępnych cennikach (stan na 2026).
                      Prowizja 45% dotyczy usługi Boost (nowe klientki z marketplace), nie wszystkich wizyt.
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

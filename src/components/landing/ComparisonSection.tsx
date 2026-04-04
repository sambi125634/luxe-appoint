import { Check, X, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AnimatedHeadline, appleEaseArray } from "@/components/ui/AnimatedSection";

const comparisonData = [
  { feature: "Prowizja od rezerwacji", bc: "0%", booksy: "0–45% (Boost)", noSystem: "—", highlight: true },
  { feature: "Koszt podstawowy (miesięcznie)", bc: "od 99 zł netto", booksy: "~145 zł netto", noSystem: "0 zł (+ chaos)", highlight: true },
  { feature: "Własność bazy danych klientów", bc: true, booksy: false, noSystem: true, highlight: false },
  { feature: "Narzędzia retencji klientek", bc: true, booksy: false, noSystem: false, highlight: false },
  { feature: "Prywatna aplikacja mobilna", bc: true, booksy: false, noSystem: false, highlight: false },
  { feature: "AI Autopilot (12 funkcji)", bc: true, booksy: false, noSystem: false, highlight: false },
  { feature: "Skaner magazynowy (aparat)", bc: true, booksy: false, noSystem: false, highlight: false },
  { feature: "CRM z historią i tagami", bc: true, booksy: "partial", noSystem: false, highlight: false },
  { feature: "True Profit per zabieg", bc: true, booksy: false, noSystem: false, highlight: false },
  { feature: "SMS + email automatyzacja", bc: true, booksy: "partial", noSystem: false, highlight: false },
  { feature: "Własna domena rezerwacji", bc: true, booksy: false, noSystem: false, highlight: false },
  { feature: "Ścieżka Klientki (5 wizyt)", bc: true, booksy: false, noSystem: false, highlight: false },
  { feature: "Widget per kampania", bc: true, booksy: false, noSystem: false, highlight: false },
];

const StatusIcon = ({ status, isHighlight, isBc }: { status: boolean | string; isHighlight?: boolean; isBc?: boolean }) => {
  if (status === true) return <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center"><Check className="w-4 h-4 text-emerald-400" /></div>;
  if (status === false) return <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center"><X className="w-4 h-4 text-red-400" /></div>;
  if (status === "partial") return <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-amber-400" /></div>;
  return <span className={cn("text-sm font-medium", isHighlight && isBc && "text-emerald-400 font-bold", isHighlight && !isBc && "text-red-400 font-bold")}>{status}</span>;
};

export const ComparisonSection = () => {
  return (
    <section className="landing-section-light landing-section-spacing">
      <div className="max-w-[1200px] mx-auto px-[max(24px,5vw)]">
        <AnimatedHeadline className="text-center mb-16">
          <h2 className="headline-section mb-4" style={{ color: "#1d1d1f" }}>
            Beauty Calendar vs. platformy marketplace.{" "}
            <span className="apple-accent-gradient">Uczciwe porównanie.</span>
          </h2>
          <p className="subheadline landing-text-muted-light max-w-2xl mx-auto">
            Porównaj fakty — nie opinie. Ceny oparte na publicznie dostępnych cennikach.
          </p>
        </AnimatedHeadline>

        <motion.div
          className="overflow-x-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: appleEaseArray }}
        >
          <table className="w-full min-w-[700px]">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                <th className="text-left py-4 px-4 font-semibold" style={{ color: "#1d1d1f", fontFamily: "'Inter', sans-serif" }}>Funkcja</th>
                <th className="py-4 px-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full mb-2" style={{ background: "#8b5cf6", color: "#fff" }}>
                      Twój salon, Twoje zasady
                    </span>
                    <span className="font-bold text-lg" style={{ color: "#8b5cf6", fontFamily: "'Inter', sans-serif" }}>Beauty Calendar</span>
                  </div>
                </th>
                <th className="py-4 px-4 text-center font-semibold landing-text-muted-light" style={{ fontFamily: "'Inter', sans-serif" }}>B🤡SY / Marketplace</th>
                <th className="py-4 px-4 text-center font-semibold landing-text-muted-light" style={{ fontFamily: "'Inter', sans-serif" }}>Brak systemu</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, index) => (
                <tr
                  key={index}
                  className="transition-colors"
                  style={{
                    borderBottom: "1px solid rgba(0,0,0,0.04)",
                    background: row.highlight ? "rgba(239,68,68,0.04)" : index % 2 === 0 ? "rgba(0,0,0,0.02)" : "transparent",
                  }}
                >
                  <td className="py-4 px-4 font-medium text-sm" style={{ color: row.highlight ? "#ef4444" : "#1d1d1f", fontFamily: "'Inter', sans-serif" }}>{row.feature}</td>
                  <td className="py-4 px-4"><div className="flex justify-center"><StatusIcon status={row.bc} isHighlight={row.highlight} isBc={true} /></div></td>
                  <td className="py-4 px-4"><div className="flex justify-center"><StatusIcon status={row.booksy} isHighlight={row.highlight} /></div></td>
                  <td className="py-4 px-4"><div className="flex justify-center"><StatusIcon status={row.noSystem} isHighlight={row.highlight} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm landing-text-muted-light">
          <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center"><Check className="w-3 h-3 text-emerald-500" /></div><span>Pełna funkcjonalność</span></div>
          <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center"><AlertTriangle className="w-3 h-3 text-amber-500" /></div><span>Ograniczona</span></div>
          <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center"><X className="w-3 h-3 text-red-500" /></div><span>Brak</span></div>
        </div>

        <p className="text-center text-xs landing-text-muted-light mt-8">
          Dane porównawcze oparte na publicznie dostępnych cennikach i regulaminach (stan na 2026). 
          Prowizja 45% dotyczy usługi Boost (nowe klientki z marketplace), nie wszystkich wizyt.
        </p>
      </div>

      <div className="h-32 section-fade-to-dark mt-16" />
    </section>
  );
};
import { Settings, Play, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedHeadline, appleEaseArray } from "@/components/ui/AnimatedSection";

const DemoPreviewSection = () => {
  return (
    <section className="landing-section-dark-4 landing-section-spacing relative overflow-hidden" id="demo-preview">
      <div className="max-w-[1200px] mx-auto px-[max(24px,5vw)] relative z-10">
        <AnimatedHeadline className="max-w-3xl mx-auto text-center mb-12">
          <p className="eyebrow tracking-widest mb-4 landing-text-subtle-dark flex items-center justify-center gap-2">
            <Play className="w-4 h-4" />
            Interaktywny podgląd
          </p>
          <h2 className="headline-section mb-4" style={{ color: "#f5f5f7" }}>
            Przeklikaj sam — zobacz jak to działa
          </h2>
          <p className="subheadline" style={{ color: "rgba(245,245,247,0.6)" }}>
            Pełny panel administracyjny z przykładowymi danymi. Bez rejestracji, bez zobowiązań.
          </p>
        </AnimatedHeadline>

        <motion.div
          className="max-w-4xl mx-auto mb-10 rounded-3xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: appleEaseArray }}
        >
          <div className="px-4 py-2.5 flex items-center justify-between text-sm" style={{ background: "#8b5cf6", color: "#fff" }}>
            <span>👀 Przeglądasz wersję demo Beauty Calendar</span>
            <button
              className="text-xs px-3 py-1 rounded-full font-medium"
              style={{ background: "rgba(255,255,255,0.2)" }}
              onClick={() => (window.location.href = "/auth")}
            >
              Załóż swoje konto — 0 zł →
            </button>
          </div>
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="flex-1 mx-4">
              <div className="rounded-md px-3 py-1.5 text-xs text-center" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(245,245,247,0.4)" }}>
                calendar.beauty-funnels.com/demo
              </div>
            </div>
          </div>
          <div className="p-6 grid grid-cols-3 gap-4">
            <div className="space-y-2">
              {["Dashboard", "Kalendarz", "Klienci", "Usługi", "Retencja", "Polecenia"].map((item, i) => (
                <div
                  key={item}
                  className="px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: i === 0 ? "#8b5cf6" : "transparent",
                    color: i === 0 ? "#fff" : "rgba(245,245,247,0.4)",
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: i === 0 ? 500 : 400,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="col-span-2 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Dzisiaj", value: "2 450 zł", color: "#34d399" },
                  { label: "Ten tydzień", value: "12 800 zł", color: "#8b5cf6" },
                  { label: "Obłożenie", value: "78%", color: "#fbbf24" },
                ].map((stat) => (
                  <div key={stat.label} className="p-3 rounded-xl landing-card-dark">
                    <div className="text-xs" style={{ color: "rgba(245,245,247,0.4)" }}>{stat.label}</div>
                    <div className="text-xl font-bold" style={{ color: stat.color, fontFamily: "'Inter', sans-serif" }}>{stat.value}</div>
                  </div>
                ))}
              </div>
              <div className="h-24 rounded-xl flex items-center justify-center landing-card-dark">
                <span className="text-xs" style={{ color: "rgba(245,245,247,0.3)" }}>📊 Wykres przychodów</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl landing-card-dark">
                  <div className="text-xs mb-1" style={{ color: "rgba(245,245,247,0.4)" }}>AI Autopilot</div>
                  <div className="flex items-center gap-1 text-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>Aktywny</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl landing-card-dark">
                  <div className="text-xs mb-1" style={{ color: "rgba(245,245,247,0.4)" }}>Klientki w ryzyku</div>
                  <div className="text-sm font-bold text-amber-400" style={{ fontFamily: "'Inter', sans-serif" }}>7 wymaga uwagi</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            className="apple-btn-primary flex items-center gap-2 text-base"
            onClick={() => (window.location.href = "/demo")}
          >
            <Settings className="w-4 h-4" />
            Otwórz pełne demo
          </button>
          <button
            className="apple-btn-secondary-dark flex items-center gap-2 text-base"
            onClick={() => (window.location.href = "/auth")}
          >
            Załóż swoje konto za darmo
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default DemoPreviewSection;
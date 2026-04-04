import { Settings, Play, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedHeadline, appleEaseArray } from "@/components/ui/AnimatedSection";

const DemoPreviewSection = () => {
  return (
    <section className="landing-section-dark landing-section-spacing relative overflow-hidden" id="demo-preview">
      <div className="max-w-[1200px] mx-auto px-[max(24px,5vw)] relative z-10">
        <AnimatedHeadline className="max-w-3xl mx-auto text-center mb-12">
          <p className="eyebrow tracking-widest mb-4 flex items-center justify-center gap-2" style={{ color: "#8b5cf6" }}>
            <Play className="w-4 h-4" />
            Interaktywny podgląd
          </p>
          <h2 className="headline-section mb-4" style={{ color: "#1d1d1f" }}>
            Przeklikaj sam — zobacz jak to działa
          </h2>
          <p className="subheadline" style={{ color: "#6e6e73" }}>
            Pełny panel administracyjny z przykładowymi danymi. Bez rejestracji, bez zobowiązań.
          </p>
        </AnimatedHeadline>

        <motion.div
          className="max-w-4xl mx-auto mb-10 rounded-3xl overflow-hidden bg-white shadow-xl"
          style={{ border: "1px solid rgba(0,0,0,0.08)" }}
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
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#faf9f7" }}>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="flex-1 mx-4">
              <div className="rounded-md px-3 py-1.5 text-xs text-center" style={{ background: "rgba(0,0,0,0.03)", color: "#86868b" }}>
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
                    color: i === 0 ? "#fff" : "#86868b",
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
                  { label: "Dzisiaj", value: "2 450 zł", color: "#16a34a" },
                  { label: "Ten tydzień", value: "12 800 zł", color: "#8b5cf6" },
                  { label: "Obłożenie", value: "78%", color: "#d97706" },
                ].map((stat) => (
                  <div key={stat.label} className="p-3 rounded-xl bg-[#faf9f7] border border-black/4">
                    <div className="text-xs" style={{ color: "#86868b" }}>{stat.label}</div>
                    <div className="text-xl font-bold" style={{ color: stat.color, fontFamily: "'Inter', sans-serif" }}>{stat.value}</div>
                  </div>
                ))}
              </div>
              <div className="h-24 rounded-xl flex items-center justify-center bg-[#faf9f7] border border-black/4">
                <span className="text-xs" style={{ color: "#86868b" }}>📊 Wykres przychodów</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#faf9f7] border border-black/4">
                  <div className="text-xs mb-1" style={{ color: "#86868b" }}>AI Autopilot</div>
                  <div className="flex items-center gap-1 text-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-600 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>Aktywny</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#faf9f7] border border-black/4">
                  <div className="text-xs mb-1" style={{ color: "#86868b" }}>Klientki w ryzyku</div>
                  <div className="text-sm font-bold text-amber-500" style={{ fontFamily: "'Inter', sans-serif" }}>7 wymaga uwagi</div>
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

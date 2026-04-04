import { Shield, Award } from "lucide-react";
import { motion } from "framer-motion";
import { appleEaseArray } from "@/components/ui/AnimatedSection";

export const GuaranteeSection = () => {
  return (
    <section className="landing-section-dark-2 landing-section-spacing">
      <div className="max-w-[800px] mx-auto px-[max(24px,5vw)] space-y-6">
        <motion.div
          className="landing-card-dark p-8 md:p-10"
          style={{ borderColor: "rgba(34,197,94,0.2)" }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.7, ease: appleEaseArray }}
        >
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(34,197,94,0.1)" }}>
              <Shield className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.1)", color: "#34d399" }}>
                GWARANCJA 1
              </span>
              <h3 className="font-bold text-xl mt-3 mb-2" style={{ color: "#f5f5f7", fontFamily: "'Inter', sans-serif" }}>30 dni bez pytań — zwracamy 100%</h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(245,245,247,0.6)" }}>
                Jeśli z jakiegokolwiek powodu nie jesteś zadowolona w pierwszych 30 dniach PRO/ELITE — jeden email wystarczy. Pełny zwrot. Zero formalności.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="landing-card-dark p-8 md:p-10"
          style={{ borderColor: "rgba(245,158,11,0.2)" }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.7, ease: appleEaseArray, delay: 0.1 }}
        >
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(245,158,11,0.1)" }}>
              <Award className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.1)", color: "#fbbf24" }}>
                GWARANCJA 2 — ELITE
              </span>
              <h3 className="font-bold text-xl mt-3 mb-2" style={{ color: "#f5f5f7", fontFamily: "'Inter', sans-serif" }}>Oszczędź 10 000 zł w 90 dni lub oddamy 3 miesiące abonamentu</h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(245,245,247,0.6)" }}>
                Jeśli w ciągu 90 dni korzystania z ELITE nie odnotujesz oszczędności minimum 10 000 zł (no-showy + odzyskane klientki + czas), oddamy Ci 3 miesiące abonamentu.
              </p>
              <p className="text-xs mt-2 italic" style={{ color: "rgba(245,245,247,0.3)" }}>
                Warunek: uruchomiony Autopilot + skonfigurowany Widget.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
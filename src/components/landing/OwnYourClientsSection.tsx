import { AlertTriangle, X, Check } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedHeadline, appleEaseArray } from "@/components/ui/AnimatedSection";

export const OwnYourClientsSection = () => {
  return (
    <section className="landing-section-dark landing-section-spacing">
      <div className="max-w-[1200px] mx-auto px-[max(24px,5vw)]">
        <motion.div
          className="grid md:grid-cols-2 gap-16 items-center"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.8, ease: appleEaseArray }}
        >
          <div>
            <p className="eyebrow tracking-widest mb-6 text-red-500 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              Wiedziałaś o tym?
            </p>

            <h2 className="headline-section mb-8" style={{ color: "#1d1d1f" }}>
              Pracujesz na budowę
              <span className="text-red-500"> cudzej bazy klientek.</span>
            </h2>

            <div className="space-y-5 body-text" style={{ color: "#6e6e73" }}>
              <p>
                Platformy marketplace działają jak
                <strong style={{ color: "#1d1d1f" }}> Allegro dla usług beauty.</strong>
                {" "}Wchodzisz, wystawiasz usługi, bijesz się ceną z innymi salonami obok Ciebie. Klientka wybiera najtańszego.
              </p>
              <p>
                Co gorsza — ta klientka
                <strong style={{ color: "#1d1d1f" }}> należy do platformy, nie do Ciebie.</strong>
                {" "}Jej dane, jej historia, jej preferencje — to ich własność. Gdy odejdziesz, nie zabierzesz ich ze sobą.
              </p>
              <p>
                Przez lata budujesz ich biznes.
                <strong style={{ color: "#1d1d1f" }}> Nie swój.</strong>
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Marketplace card */}
            <div className="landing-card-dark p-6" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-sm">🏪</div>
                <span className="font-bold text-sm" style={{ color: "#1d1d1f", fontFamily: "'Inter', sans-serif" }}>Platforma marketplace</span>
              </div>
              <ul className="space-y-2.5 text-sm" style={{ color: "#6e6e73" }}>
                {[
                  "Klientki należą do platformy",
                  "Odejście = utrata całej historii",
                  "Walczysz ceną z konkurencją obok",
                  "Brak narzędzi do retencji klientek",
                  "Prowizja od każdej nowej wizyty",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <X className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Beauty Calendar card */}
            <div className="landing-card-dark p-6" style={{ borderColor: "rgba(139,92,246,0.2)", background: "rgba(139,92,246,0.03)" }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center text-sm">✨</div>
                <span className="font-bold text-sm" style={{ color: "#1d1d1f", fontFamily: "'Inter', sans-serif" }}>Beauty Calendar</span>
              </div>
              <ul className="space-y-2.5 text-sm" style={{ color: "#6e6e73" }}>
                {[
                  { text: "Twoje klientki. Na zawsze.", bold: true, extra: " Eksport jednym kliknięciem" },
                  { text: "Prywatna aplikacja — tylko Twój salon" },
                  { text: "Budujesz własny brand, nie cudzy" },
                  { text: "Automatyczne sekwencje retencyjne" },
                  { text: "0% prowizji od rezerwacji. Zawsze." },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>
                      {item.bold ? <strong style={{ color: "#1d1d1f" }}>{item.text}</strong> : item.text}
                      {item.extra}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center">
              <p className="text-xs italic" style={{ color: "#86868b" }}>
                {"„"}Nie budujesz na cudzej ziemi. Budujesz własny dom.{"""}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

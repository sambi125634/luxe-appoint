import { useState } from "react";
import { motion } from "framer-motion";

export const InteractivePhoneMockup = () => {
  const [iframeError, setIframeError] = useState(false);

  return (
    <section className="py-20 lg:py-28 bg-black overflow-hidden">
      <motion.div
        className="container max-w-6xl mx-auto px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — text */}
          <motion.div
            className="flex flex-col justify-center"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-4">
              Aplikacja dla Twoich klientek
            </p>

            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
              Tak wygląda Twoja
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                aplikacja dla klientek.
              </span>
            </h2>

            <p className="text-white/60 text-lg leading-relaxed mb-8 max-w-md">
              Prawdziwa aplikacja mobilna Twojego salonu. Klientka rezerwuje, sprawdza wizyty i zbiera punkty lojalnościowe — wszystko w jednym miejscu.
            </p>

            <div className="space-y-4 mb-10">
              {[
                "Rezerwuje wizytę w 3 kliknięcia",
                "Widzi historię wizyt i ulubione",
                "Dostaje powiadomienia i kupony lojalnościowe",
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-primary font-mono font-bold">→</span>
                  <span className="text-white/70 text-sm">{text}</span>
                </div>
              ))}
            </div>

            <p className="text-white/30 text-xs italic">
              * Wersja demo z przykładowymi danymi salonu
            </p>
          </motion.div>

          {/* Right — phone mockup */}
          <motion.div
            className="flex justify-center items-center py-8"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            <div className="relative">
              {/* Glow */}
              <div className="absolute -inset-8 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

              {/* iPhone frame */}
              <div
                className="relative w-[320px] bg-[#1a1a1a] rounded-[50px] p-3 shadow-2xl border border-white/10"
                style={{
                  boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.08), 0 50px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
                }}
              >
                {/* Dynamic Island */}
                <div className="w-28 h-7 bg-black rounded-full mx-auto mb-2 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-[#1a1a1a] border border-white/10" />
                </div>

                {/* Screen */}
                <div
                  className="w-full rounded-[38px] overflow-hidden bg-white"
                  style={{ height: "580px" }}
                >
                  {iframeError ? (
                    <div className="w-full h-full bg-muted flex flex-col items-center justify-center p-6 text-center">
                      <span className="text-4xl mb-4">📱</span>
                      <p className="font-bold text-foreground mb-2">Aplikacja ładuje się...</p>
                      <p className="text-sm text-muted-foreground">
                        Kliknij aby zobaczyć aplikację klientki
                      </p>
                      <a
                        href="/app"
                        className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm"
                      >
                        Otwórz aplikację →
                      </a>
                    </div>
                  ) : (
                    <iframe
                      src="/s/demo-salon"
                      className="w-full h-full border-0"
                      title="Beauty Calendar — aplikacja klientki"
                      onError={() => setIframeError(true)}
                      style={{
                        transform: "scale(0.85)",
                        transformOrigin: "top left",
                        width: "118%",
                        height: "118%",
                      }}
                    />
                  )}
                </div>

                {/* Home indicator */}
                <div className="w-24 h-1 bg-white/20 rounded-full mx-auto mt-3" />
              </div>

            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

import { AlertTriangle, X, Check } from "lucide-react";
import { motion } from "framer-motion";

const marketplacePoints = [
  "Eksportujesz: imię, telefon, email. I nic więcej.",
  "Jutro mogą podnieść prowizję — i nic nie zrobisz",
  "Twoja konkurencja jest wyświetlana obok Ciebie",
  "Brak sekwencji — klientka znika i nikt jej nie goni",
  "Klientki porównują Cię z tańszą konkurencją w jednym widoku",
  "Budujesz ich bazę. Ich brand. Ich biznes. Nie swój.",
];

const bcPoints = [
  { text: "Twoje klientki. Twoje dane. Na zawsze.", bold: true },
  { text: "0% prowizji — dziś, jutro i za 5 lat" },
  { text: "Radar Odejść — AI wykrywa zagrożone klientki 3 tygodnie wcześniej" },
  { text: "Auto-zaliczka od klientek z historią no-show — bez niezręcznej rozmowy" },
  { text: "Budujesz własną bazę — nikt Ci jej nie odbierze" },
  { text: "Za rok masz asset który pracuje dla Ciebie — nie dla platformy" },
];

export const OwnYourClientsSection = () => {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden" style={{ backgroundColor: "#FAFAF8" }}>
      {/* Subtle radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #B87D5E 0%, transparent 70%)" }} />
      </div>

      <div className="container max-w-5xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          className="relative text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Owalny czerwony glow */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[320px] md:w-[700px] md:h-[400px] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(ellipse, rgba(217,79,61,0.08) 0%, rgba(217,79,61,0.03) 40%, transparent 70%)",
            }}
          />
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium mb-6" style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#D94F3D" }}>
            <AlertTriangle className="w-3.5 h-3.5" />
            Wiedziałaś o tym?
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold mb-6 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#1A1A2E" }}>
            Pracujesz na budowę{" "}
            <span style={{ color: "#D94F3D" }}>cudzej bazy klientek.</span>
          </h2>

          <p className="max-w-2xl mx-auto text-base md:text-lg leading-relaxed" style={{ color: "#4A4A5A" }}>
            Gdyby się nad tym zastanowić, to czym różni się platforma marketplace od wystawienia się na targowisku, gdzie wszyscy sprzedają to samo? Dlaczego nie możesz wyeksportować najważniejszych unikatowych danych klienta, takich jak preferencje zakupowe czy historia wizyt?{" "}
            <span style={{ color: "#1A1A2E", fontWeight: 500 }}>Bo należą one do platformy. Jutro mogą podnieść prowizję, pojutrze wyświetlić Twoją konkurencję 10 zł taniej — zachęcając Cię do oddania 50% prowizji, obiecując, że być może Ciebie wyświetlą dziś użytkownikom.</span>
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-14">
          {/* Marketplace card */}
          <motion.div
            className="relative rounded-2xl p-6 md:p-8 overflow-hidden"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #F0ECE6",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Red accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #D94F3D, transparent)" }} />

            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ backgroundColor: "#FEF2F2" }}>🏪</div>
              <span className="font-bold text-sm tracking-wide uppercase" style={{ color: "#1A1A2E" }}>Platforma marketplace</span>
            </div>

            <ul className="space-y-3">
              {marketplacePoints.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm" style={{ color: "#4A4A5A" }}>
                  <X className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#D94F3D" }} />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Beauty Calendar card */}
          <motion.div
            className="relative rounded-2xl p-6 md:p-8 overflow-hidden"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid rgba(184,125,94,0.3)",
              boxShadow: "0 4px 12px rgba(184,125,94,0.1)",
            }}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Bronze accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #B87D5E, transparent)" }} />

            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ backgroundColor: "rgba(184,125,94,0.1)" }}>✨</div>
              <span className="font-bold text-sm tracking-wide uppercase" style={{ color: "#1A1A2E" }}>Beauty Calendar</span>
            </div>

            <ul className="space-y-3">
              {bcPoints.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm" style={{ color: "#4A4A5A" }}>
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#B87D5E" }} />
                  <span>
                    {item.bold ? <strong style={{ color: "#B87D5E" }}>{item.text}</strong> : item.text}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Quote */}
        <motion.p
          className="text-center text-lg md:text-xl italic font-medium"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            background: "linear-gradient(180deg, #1A1A2E 0%, #4A4A5A 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          „Nie budujesz na cudzej ziemi. Budujesz własny dom."
        </motion.p>
      </div>
    </section>
  );
};

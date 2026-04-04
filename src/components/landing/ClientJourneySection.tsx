import { motion } from "framer-motion";

const appleEase = [0.25, 0.46, 0.45, 0.94] as const;

const sceneAnimation = {
  initial: { opacity: 0, y: 80 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-20%" },
  transition: { duration: 1, ease: appleEase },
};

const mockupAnimation = (delay = 0.4) => ({
  initial: { opacity: 0, x: 30 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true },
  transition: { delay, duration: 0.8 },
});

export const ClientJourneySection = () => {
  const scrollToForm = () => {
    document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative bg-black overflow-hidden" id="journey">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-900/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <motion.div
        className="text-center pt-[120px] pb-24 px-6"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: appleEase }}
      >
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-violet-400 mb-6">
          Wyobraź sobie
        </p>
        <h2 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight max-w-4xl mx-auto">
          Twój salon o 6 rano.
          <br />
          <span className="text-white/40">Ty jeszcze śpisz.</span>
        </h2>
      </motion.div>

      {/* ── SCENA 01 ── */}
      <motion.div {...sceneAnimation} className="min-h-[60vh] flex flex-col justify-center max-w-5xl mx-auto px-6 py-24 border-b border-white/5">
        <span className="text-xs font-mono text-white/20 mb-8 block">— 06:23</span>
        <h3 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-white leading-tight mb-8">
          Klientka wchodzi
          <br />
          na Twój Instagram.
          <br />
          <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
            Rezerwuje zabieg.
          </span>
        </h3>
        <div className="max-w-xl">
          <p className="text-lg md:text-xl text-white/50 leading-relaxed mb-4">
            Nie dzwoni. Nie czeka. Nie pisze "czy jest wolny termin?".
            Klika link w bio — i za 30 sekund ma potwierdzenie.
          </p>
          <p className="text-sm text-white/25 font-mono">
            Widget rezerwacji Beauty Calendar · dostępny 24/7
          </p>
        </div>
        <motion.div
          {...mockupAnimation()}
          className="mt-12 inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 max-w-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">📅</span>
          </div>
          <div>
            <p className="text-white text-sm font-semibold">Nowa rezerwacja</p>
            <p className="text-white/40 text-xs">Manicure hybrydowy · jutro 11:00</p>
          </div>
        </motion.div>
      </motion.div>

      {/* ── SCENA 02 ── */}
      <motion.div {...sceneAnimation} className="min-h-[60vh] flex flex-col justify-center max-w-5xl mx-auto px-6 py-24 border-b border-white/5">
        <span className="text-xs font-mono text-white/20 mb-8 block">— dzień przed wizytą · 10:00</span>
        <h3 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-white leading-tight mb-8">
          System wysyła
          <br />
          przypomnienie.
          <br />
          <span className="text-white/30 text-2xl sm:text-3xl md:text-4xl font-normal">
            Bez Twojego udziału.
          </span>
        </h3>
        <div className="max-w-xl">
          <p className="text-lg md:text-xl text-white/50 leading-relaxed mb-4">
            SMS o 10:00. Push o 8:00 w dniu wizyty.
            Klientka pamięta. Przychodzi. Fotel nie stoi pusty.
          </p>
          <p className="text-sm text-white/25 font-mono">
            Statystyki Beauty Calendar · -67% no-showów po pierwszym miesiącu
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-12 bg-[#1c1c1e] rounded-3xl p-4 max-w-xs border border-white/5"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-xs text-white font-bold">BC</span>
            </div>
            <div>
              <p className="text-white text-xs font-semibold">Beauty Calendar</p>
              <p className="text-white/30 text-xs">teraz</p>
            </div>
          </div>
          <div className="bg-[#2c2c2e] rounded-2xl rounded-tl-sm px-4 py-3">
            <p className="text-white text-sm leading-relaxed">
              Cześć Aniu! ✨ Przypominamy o jutrzejszej wizycie o 11:00. Do zobaczenia! 💅
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* ── SCENA 03 ── */}
      <motion.div {...sceneAnimation} className="min-h-[60vh] flex flex-col justify-center max-w-5xl mx-auto px-6 py-24 border-b border-white/5">
        <span className="text-xs font-mono text-white/20 mb-8 block">— 2 godziny po wizycie</span>
        <h3 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-white leading-tight mb-8">
          Klientka wychodzi
          <br />
          zadowolona.
          <br />
          <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
            System już działa.
          </span>
        </h3>
        <div className="max-w-xl">
          <p className="text-lg md:text-xl text-white/50 leading-relaxed mb-4">
            Automatyczna prośba o opinię. Karta konsultacyjna zapisana w profilu.
            Następna wizyta już zaproponowana — w idealnym momencie dla tej usługi.
          </p>
          <p className="text-sm text-white/25 font-mono">
            Sekwencja po-wizytowa Beauty Calendar · uruchamia się automatycznie
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-12 flex gap-8 flex-wrap"
        >
          {[
            { value: "+34%", label: "więcej opinii Google" },
            { value: "2h", label: "po wizycie automatycznie" },
            { value: "68%", label: "otwiera wiadomość" },
          ].map((stat, i) => (
            <div key={i} className="border-l border-violet-500/30 pl-4">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-white/30 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── SCENA 04 ── */}
      <motion.div {...sceneAnimation} className="min-h-[60vh] flex flex-col justify-center max-w-5xl mx-auto px-6 py-24 border-b border-white/5">
        <span className="text-xs font-mono text-white/20 mb-8 block">— 3 tygodnie później</span>
        <h3 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-white leading-tight mb-8">
          Klientka wraca.
          <br />
          <span className="text-white/30 text-2xl sm:text-3xl md:text-4xl font-normal">
            Sama z siebie?
          </span>
          <br />
          Nie. System ją przyciągnął.
        </h3>
        <div className="max-w-xl">
          <p className="text-lg md:text-xl text-white/50 leading-relaxed mb-4">
            W optymalnym momencie dla jej usługi — dostała ofertę której nie mogła odmówić.
            Myślała że to Ty o niej pamiętasz. W pewnym sensie tak.
          </p>
          <p className="text-sm text-white/25 font-mono">
            Ścieżka Klientki™ · automatyczna sekwencja między wizytami
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 1 }}
          style={{ originX: 0 }}
          className="mt-12 max-w-md"
        >
          <div className="flex items-center gap-0 mb-3">
            {["1.", "2.", "3.", "4.", "5."].map((n, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border ${
                    i <= 1
                      ? "bg-violet-600 border-violet-500 text-white"
                      : i === 2
                      ? "bg-violet-600/30 border-violet-500/50 text-violet-300"
                      : "bg-white/5 border-white/10 text-white/20"
                  }`}
                >
                  {n}
                </div>
                {i < 4 && (
                  <div className={`h-[2px] w-8 ${i < 1 ? "bg-violet-500" : "bg-white/10"}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-white/30 text-xs font-mono">Wizyta 2 z 5 · na ścieżce powrotu</p>
        </motion.div>
      </motion.div>

      {/* ── SCENA 05 — KULMINACJA ── */}
      <motion.div {...sceneAnimation} className="min-h-[80vh] flex flex-col justify-center max-w-5xl mx-auto px-6 py-32 text-center items-center">
        <span className="text-xs font-mono text-white/20 mb-8 block">— 6 miesięcy później</span>
        <h3 className="text-4xl sm:text-5xl md:text-8xl font-serif font-bold leading-tight mb-8">
          <span className="text-white/20">Ona jest</span>
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
            stałą bywalczynią.
          </span>
          <br />
          <span className="text-white/20">Twojego salonu.</span>
        </h3>
        <p className="text-lg md:text-2xl text-white/40 max-w-2xl leading-relaxed mb-6">
          Przyszła raz. Wróciła pięć razy. Poleciła Cię trzem znajomym.
          Nie dlatego że byłaś najlepsza w Google.
        </p>
        <p className="text-lg md:text-2xl text-white font-medium mb-16">
          Dlatego że miałaś system który o niej pamiętał.
        </p>

        {/* Wartość życiowa */}
        <div className="border border-white/10 rounded-3xl px-12 py-10 bg-white/[0.03] mb-16 max-w-sm">
          <p className="text-white/40 text-sm mb-2">Wartość jednej stałej klientki rocznie</p>
          <p className="text-6xl font-black text-white mb-2">4 800 zł</p>
          <p className="text-white/30 text-xs">12 wizyt × średnia 400 zł</p>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={scrollToForm}
            className="bg-white text-black font-semibold text-lg px-10 py-5 rounded-full hover:bg-white/90 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Chcę taki system — zaczynam za darmo
          </button>
          <p className="text-white/20 text-sm">Bez karty kredytowej · gotowe w 5 minut</p>
        </div>
      </motion.div>
    </section>
  );
};

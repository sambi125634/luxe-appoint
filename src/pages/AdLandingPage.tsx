import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const IFRAME_W = 390;
const IFRAME_H = 844;
const PHONE_W_MOBILE = 240;
const PHONE_W_TABLET = 280;
const PHONE_W_DESKTOP = 300;

const FloatingCard = ({
  position,
  icon,
  iconBg,
  label,
  value,
  valueClass = "",
  delay = 0,
}: {
  position: string;
  icon: string;
  iconBg: string;
  label: string;
  value: string;
  valueClass?: string;
  delay?: number;
}) => (
  <motion.div
    className={`absolute z-[2] flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl px-4 py-3 ${position}`}
    animate={{ y: [0, -10, 0] }}
    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay }}
  >
    <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center text-base shrink-0 ${iconBg}`}>
      {icon}
    </div>
    <div className="flex flex-col gap-0.5">
      <span className="text-[0.68rem] text-white/40 whitespace-nowrap">{label}</span>
      <span className={`text-[0.82rem] font-medium text-white whitespace-nowrap ${valueClass}`}>{value}</span>
    </div>
  </motion.div>
);

const AdLandingPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#06060b] font-sans text-[#f4f0ff] overflow-x-hidden relative">
      {/* Ambient backgrounds */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-[radial-gradient(ellipse,rgba(192,132,252,0.09)_0%,transparent_65%)]" />
        <div className="absolute -bottom-[15%] -right-[5%] w-[55%] h-[55%] bg-[radial-gradient(ellipse,rgba(232,121,160,0.07)_0%,transparent_65%)]" />
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-[radial-gradient(ellipse,rgba(240,192,96,0.04)_0%,transparent_65%)]" />
      </div>

      {/* Page content */}
      <div className="relative z-[1] flex flex-col items-center px-6 py-12 md:px-8 md:py-16 gap-12">

        {/* ── HERO TEXT ── */}
        <motion.div
          className="text-center max-w-[600px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Eyebrow */}
          <motion.div
            className="inline-flex items-center gap-2 border border-[rgba(192,132,252,0.3)] bg-[rgba(192,132,252,0.07)] text-[#c084fc] text-[0.68rem] font-medium tracking-[0.16em] uppercase px-4 py-1.5 rounded-full mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#c084fc] animate-pulse" />
            {t("landing.adLanding.label")}
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="font-serif text-[clamp(2.4rem,7vw,4rem)] leading-[1.08] tracking-[-0.01em] mb-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Koniec z formularzami.{"\n"}
            Koniec z <em className="italic bg-gradient-to-r from-[#c084fc] to-[#e879a0] bg-clip-text text-transparent">no-shows.</em>{"\n"}
            Zaczyna się era AI.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-white/40 text-base font-light leading-[1.7] max-w-[480px] mx-auto mb-8"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            Pierwszy w Polsce system który zamienia ruch z reklam w potwierdzone wizyty — bez formularzy, bez głuchych telefonów, bez klientek których już nie oddzwonisz.
          </motion.p>

          {/* Pills */}
          <motion.div
            className="flex flex-wrap gap-2.5 justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            {[
              "Bez instalacji aplikacji",
              "AI potwierdza każdą wizytę",
              "Zaliczka online",
              "24/7 automatycznie",
            ].map((text) => (
              <div
                key={text}
                className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full px-3.5 py-1.5 text-[0.75rem] text-white/40"
              >
                <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#c084fc] to-[#e879a0] shrink-0" />
                {text}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── MOCKUP SCENE ── */}
        <motion.div
          className="relative w-full max-w-[480px] md:max-w-[680px] lg:max-w-[800px] flex justify-center items-center"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.4 }}
        >
          {/* Floating cards — hidden on mobile */}
          <div className="hidden md:block">
            <FloatingCard
              position="left-4 lg:left-16 top-[18%]"
              icon="✓"
              iconBg="bg-[rgba(192,132,252,0.2)]"
              label="Wizyta potwierdzona"
              value="Karolina W."
              delay={0}
            />
            <FloatingCard
              position="right-4 lg:right-16 top-[42%]"
              icon="↑"
              iconBg="bg-[rgba(232,121,160,0.2)]"
              label="No-shows zredukowane"
              value="-40%"
              valueClass="text-[#4ade80]"
              delay={2}
            />
            <FloatingCard
              position="left-[5%] bottom-[12%]"
              icon="💰"
              iconBg="bg-[rgba(240,192,96,0.2)]"
              label="Oszczędność / rok"
              value="+67 200 zł"
              valueClass="text-[#c084fc]"
              delay={4}
            />
          </div>

          {/* Phone frame */}
          <div className="relative z-[3] w-[240px] md:w-[280px] lg:w-[300px] shrink-0">
            {/* Screen glow */}
            <div className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[160%] h-[60%] bg-[radial-gradient(ellipse,rgba(192,132,252,0.08)_0%,transparent_70%)] pointer-events-none z-[1]" />

            {/* Side buttons */}
            <div className="absolute -right-[3px] top-[28%] w-[3px] h-[50px] bg-gradient-to-b from-[#2a2040] to-[#1a1030] rounded-r-sm" />
            <div className="absolute -left-[3px] top-[20%] w-[3px] h-[26px] bg-gradient-to-b from-[#2a2040] to-[#1a1030] rounded-l-sm" />
            <div className="absolute -left-[3px] top-[33%] w-[3px] h-[40px] bg-gradient-to-b from-[#2a2040] to-[#1a1030] rounded-l-sm" />
            <div className="absolute -left-[3px] top-[46%] w-[3px] h-[40px] bg-gradient-to-b from-[#2a2040] to-[#1a1030] rounded-l-sm" />

            {/* Outer shell */}
            <div
              className="bg-gradient-to-br from-[#2a2040] via-[#0f0c1a] to-[#1a1030] rounded-[44px] p-2.5"
              style={{
                boxShadow:
                  "0 0 0 1px rgba(192,132,252,0.25), 0 0 60px rgba(192,132,252,0.12), 0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              {/* Inner */}
              <div className="bg-[#0a0812] rounded-[36px] overflow-hidden relative">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90px] h-[26px] bg-[#0a0812] rounded-b-[18px] z-10 flex items-center justify-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a2e] border border-white/[0.07]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[rgba(192,132,252,0.5)] animate-pulse" />
                </div>

                {/* Iframe — actual widget */}
                <div className="w-full overflow-hidden" style={{ aspectRatio: `${IFRAME_W}/${IFRAME_H}` }}>
                  <iframe
                    src="/s/demo-salon"
                    className="border-0 w-full h-full"
                    title={t("landing.adLanding.iframeTitle")}
                    style={{
                      width: IFRAME_W,
                      height: IFRAME_H,
                      transform: `scale(var(--phone-scale))`,
                      transformOrigin: "top left",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* CSS variable for responsive scaling */}
            <style>{`
              :root {
                --phone-scale: ${PHONE_W_MOBILE / IFRAME_W};
              }
              @media (min-width: 768px) {
                :root { --phone-scale: ${PHONE_W_TABLET / IFRAME_W}; }
              }
              @media (min-width: 1024px) {
                :root { --phone-scale: ${PHONE_W_DESKTOP / IFRAME_W}; }
              }
            `}</style>
          </div>
        </motion.div>

        {/* ── BAIT BELOW MOCKUP ── */}
        <motion.div
          className="max-w-[480px] text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Divider with icon */}
          <div className="flex items-center gap-3 justify-center mb-5">
            <div className="flex-1 max-w-[60px] h-px bg-white/[0.08]" />
            <div className="w-8 h-8 rounded-full bg-[rgba(192,132,252,0.12)] border border-[rgba(192,132,252,0.25)] flex items-center justify-center text-sm">
              🤖
            </div>
            <div className="flex-1 max-w-[60px] h-px bg-white/[0.08]" />
          </div>

          <p className="text-[0.85rem] text-white/40 leading-[1.65]">
            <strong className="text-white font-medium">Podaj swoje dane jako właściciel salonu.</strong>
            <br /><br />
            Zaraz po rezerwacji zadzwoni do Ciebie nasz asystent AI —{"\n"}
            dokładnie tak jak zadzwoni do każdej klientki Twojego salonu.
            <br /><br />
            <strong className="text-white font-medium">Na kolejnej stronie zobaczysz{"\n"}ile Twój salon traci każdego roku bez tego systemu.</strong>
          </p>

          {/* Bouncing arrow */}
          <div className="mt-4 flex flex-col items-center gap-1 animate-bounce">
            <span className="block w-px h-6 bg-gradient-to-b from-[rgba(192,132,252,0.6)] to-transparent" />
            <span className="block w-2 h-2 border-r border-b border-[rgba(192,132,252,0.5)] rotate-45 -mt-2" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdLandingPage;

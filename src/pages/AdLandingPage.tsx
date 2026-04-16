import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const IFRAME_W = 390;
const IFRAME_H = 844;
const PHONE_W_MOBILE = 320;
const PHONE_W_TABLET = 360;
const PHONE_W_DESKTOP = 400;

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
    className={`absolute z-[2] flex items-center gap-3 rounded-[14px] border border-[rgba(180,150,120,0.18)] bg-white px-4 py-3 ${position}`}
    style={{
      boxShadow: "0 4px 20px rgba(180,150,120,0.12), 0 1px 0 rgba(255,255,255,0.8) inset",
    }}
    animate={{ y: [0, -8, 0] }}
    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay }}
  >
    <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center text-base shrink-0 ${iconBg}`}>
      {icon}
    </div>
    <div className="flex flex-col gap-0.5">
      <span className="text-[0.63rem] text-[rgba(44,36,32,0.45)] whitespace-nowrap">{label}</span>
      <span className={`text-[0.82rem] font-medium text-[#2c2420] whitespace-nowrap ${valueClass}`}>{value}</span>
    </div>
  </motion.div>
);

/* Ambient blobs — warm tones */
const orbVariants = [
  { x: ["-10%", "5%", "-10%"], y: ["-20%", "-15%", "-20%"], dur: 20 },
  { x: ["60%", "50%", "60%"], y: ["70%", "80%", "70%"], dur: 25 },
  { x: ["25%", "35%", "25%"], y: ["30%", "45%", "30%"], dur: 22 },
  { x: ["70%", "60%", "70%"], y: ["10%", "20%", "10%"], dur: 18 },
  { x: ["40%", "50%", "40%"], y: ["50%", "40%", "50%"], dur: 24 },
  { x: ["5%", "15%", "5%"], y: ["60%", "70%", "60%"], dur: 28 },
];

const orbStyles = [
  { w: "70%", h: "70%", bg: "radial-gradient(ellipse, rgba(181,115,122,0.10) 0%, transparent 65%)" },
  { w: "55%", h: "55%", bg: "radial-gradient(ellipse, rgba(200,149,107,0.09) 0%, transparent 65%)" },
  { w: "45%", h: "45%", bg: "radial-gradient(ellipse, rgba(200,168,107,0.06) 0%, transparent 65%)" },
  { w: "50%", h: "50%", bg: "radial-gradient(ellipse, rgba(181,115,122,0.08) 0%, transparent 60%)" },
  { w: "40%", h: "40%", bg: "radial-gradient(ellipse, rgba(200,149,107,0.07) 0%, transparent 60%)" },
  { w: "35%", h: "35%", bg: "radial-gradient(ellipse, rgba(212,144,154,0.06) 0%, transparent 65%)" },
];

/* Rising particles */
const Particles = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {Array.from({ length: 12 }).map((_, i) => (
      <motion.div
        key={`ptcl-${i}`}
        className="absolute rounded-full"
        style={{
          width: 3 + Math.random() * 3,
          height: 3 + Math.random() * 3,
          left: `${8 + Math.random() * 84}%`,
          bottom: `-${Math.random() * 5}%`,
          background: i % 2 === 0 ? "rgba(181,115,122,0.25)" : "rgba(200,149,107,0.2)",
        }}
        animate={{
          y: [0, -window.innerHeight * 0.8],
          opacity: [0, 0.6, 0.6, 0],
          scale: [0.5, 1],
        }}
        transition={{
          duration: 14 + Math.random() * 10,
          repeat: Infinity,
          delay: Math.random() * 10,
          ease: "linear",
        }}
      />
    ))}
  </div>
);

/* Expanding ring */
const OrbRings = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {[0, 4, 8].map((delay) => (
      <motion.div
        key={delay}
        className="absolute top-1/2 left-1/2 rounded-full border border-[rgba(181,115,122,0.12)]"
        style={{ width: 200, height: 200 }}
        animate={{
          scale: [0.3, 2.5],
          opacity: [0.4, 0],
          x: "-50%",
          y: "-50%",
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          delay,
          ease: "easeOut",
        }}
      />
    ))}
  </div>
);

const AdLandingPage = () => {
  const { t } = useTranslation();

  return (
    <div
      className="min-h-screen font-sans overflow-x-hidden relative"
      style={{ background: "#faf7f2", color: "#2c2420" }}
    >
      {/* Dot grid */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(180,150,120,0.2) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 100%)",
        }}
      />

      {/* Animated ambient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {orbVariants.map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: orbStyles[i].w,
              height: orbStyles[i].h,
              background: orbStyles[i].bg,
              filter: "blur(70px)",
            }}
            animate={{ left: orb.x, top: orb.y }}
            transition={{ duration: orb.dur, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <Particles />
      <OrbRings />

      {/* Page content */}
      <div className="relative z-[1] flex flex-col items-center px-4 py-12 md:px-8 md:py-20 gap-10 md:gap-12">

        {/* ── HERO TEXT ── */}
        <motion.div
          className="text-center max-w-[600px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Eyebrow */}
          <motion.div
            className="inline-flex items-center gap-2 border border-[rgba(181,115,122,0.35)] bg-[rgba(181,115,122,0.06)] text-[#b5737a] text-[0.68rem] font-medium tracking-[0.16em] uppercase px-4 py-1.5 rounded-full mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4909a] animate-pulse" />
            {t("landing.adLanding.label")}
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="font-serif text-[clamp(2.2rem,7vw,3.8rem)] font-light leading-[1.08] tracking-[0.01em] mb-5 text-[#2c2420]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Koniec z formularzami.{"\n"}
            Koniec z{" "}
            <em className="italic font-normal bg-gradient-to-r from-[#c8956b] to-[#b5737a] bg-clip-text text-transparent">
              no-shows.
            </em>
            {"\n"}
            Zaczyna się era AI.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-[rgba(44,36,32,0.45)] text-[0.97rem] font-light leading-[1.75] max-w-[480px] mx-auto mb-8"
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
                className="flex items-center gap-1.5 bg-white border border-[rgba(180,150,120,0.18)] rounded-full px-3.5 py-1.5 text-[0.73rem] text-[rgba(44,36,32,0.45)]"
                style={{ boxShadow: "0 1px 4px rgba(180,150,120,0.1)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-[#c8956b] to-[#b5737a] shrink-0" />
                {text}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── MOCKUP SCENE ── */}
        <motion.div
          className="relative w-full max-w-[540px] md:max-w-[740px] lg:max-w-[900px] flex justify-center items-center py-10"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.4 }}
        >
          {/* Floating cards — hidden on mobile */}
          <div className="hidden md:block">
            <FloatingCard
              position="left-0 lg:left-12 top-[16%]"
              icon="✓"
              iconBg="bg-[rgba(181,115,122,0.1)]"
              label="Wizyta potwierdzona"
              value="Karolina W."
              delay={0}
            />
            <FloatingCard
              position="right-0 lg:right-12 top-[44%]"
              icon="↑"
              iconBg="bg-[rgba(200,149,107,0.1)]"
              label="No-shows zredukowane"
              value="-40%"
              valueClass="text-[#6a9e6a]"
              delay={2}
            />
            <FloatingCard
              position="left-1/2 -translate-x-1/2 bottom-[6%]"
              icon="✦"
              iconBg="bg-[rgba(200,168,107,0.1)]"
              label="Oszczędność / rok"
              value="+67 200 zł"
              valueClass="text-[#b5737a]"
              delay={4}
            />
          </div>

          {/* Phone frame */}
          <div className="relative z-[3] w-[320px] md:w-[360px] lg:w-[400px] shrink-0">
            {/* Screen glow */}
            <div
              className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[160%] h-[60%] pointer-events-none z-[1]"
              style={{ background: "radial-gradient(ellipse, rgba(181,115,122,0.06) 0%, transparent 70%)" }}
            />

            {/* Side buttons */}
            <div className="absolute -right-[3px] top-[26%] w-[3px] h-[55px] bg-gradient-to-b from-[#ede6da] to-[#d8cfc4] rounded-r-sm" />
            <div className="absolute -left-[3px] top-[18%] w-[3px] h-[28px] bg-gradient-to-b from-[#ede6da] to-[#d8cfc4] rounded-l-sm" />
            <div className="absolute -left-[3px] top-[30%] w-[3px] h-[44px] bg-gradient-to-b from-[#ede6da] to-[#d8cfc4] rounded-l-sm" />
            <div className="absolute -left-[3px] top-[44%] w-[3px] h-[44px] bg-gradient-to-b from-[#ede6da] to-[#d8cfc4] rounded-l-sm" />

            {/* Outer shell — warm beige */}
            <div
              className="rounded-[48px] p-2.5"
              style={{
                background: "linear-gradient(160deg, #ede6da 0%, #f8f4ee 50%, #e8dfd2 100%)",
                boxShadow:
                  "0 0 0 1px rgba(181,115,122,0.2), 0 0 60px rgba(181,115,122,0.08), 0 40px 80px rgba(180,150,120,0.2), inset 0 1px 0 rgba(255,255,255,0.9)",
              }}
            >
              {/* Inner */}
              <div className="bg-[#fdfaf6] rounded-[40px] overflow-hidden relative">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-[#fdfaf6] rounded-b-[20px] z-10 flex items-center justify-center gap-1.5">
                  <div className="w-[11px] h-[11px] rounded-full bg-[#ede6da] border border-[rgba(180,150,120,0.2)]" />
                  <div className="w-[7px] h-[7px] rounded-full bg-[rgba(181,115,122,0.6)] animate-pulse" />
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
          className="max-w-[500px] text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Divider with icon */}
          <div className="flex items-center gap-3 justify-center mb-5">
            <div className="flex-1 max-w-[70px] h-px bg-[rgba(180,150,120,0.32)]" />
            <div className="w-[34px] h-[34px] rounded-full bg-[rgba(181,115,122,0.08)] border border-[rgba(181,115,122,0.22)] flex items-center justify-center text-[15px]">
              🤍
            </div>
            <div className="flex-1 max-w-[70px] h-px bg-[rgba(180,150,120,0.32)]" />
          </div>

          <p className="text-[0.86rem] text-[rgba(44,36,32,0.45)] leading-[1.75]">
            <strong className="text-[#2c2420] font-medium">Podaj swoje dane jako właściciel salonu.</strong>
            <br /><br />
            Zaraz po rezerwacji zadzwoni do Ciebie nasz asystent AI —{"\n"}
            dokładnie tak jak zadzwoni do każdej klientki Twojego salonu.
            <br /><br />
            <strong className="text-[#2c2420] font-medium">Na kolejnej stronie zobaczysz{"\n"}ile Twój salon traci każdego roku bez tego systemu.</strong>
          </p>

          {/* Bouncing arrow */}
          <div className="mt-5 flex flex-col items-center animate-bounce">
            <span className="block w-px h-7 bg-gradient-to-b from-[rgba(181,115,122,0.5)] to-transparent" />
            <span className="block w-2 h-2 border-r border-b border-[rgba(181,115,122,0.45)] rotate-45 -mt-[5px]" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdLandingPage;

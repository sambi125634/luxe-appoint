import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Shield, CreditCard, Bot, Sparkles } from "lucide-react";

const IFRAME_W = 390;
const IFRAME_H = 844;
const FRAME_W = 360;
const SCALE = FRAME_W / IFRAME_W;
const FRAME_H = Math.round(IFRAME_H * SCALE);

const FeaturePill = ({ icon: Icon, text, delay }: { icon: React.ElementType; text: string; delay: number }) => (
  <motion.div
    className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    <Icon className="w-4 h-4 text-[#9B6B8A]" />
    <span className="text-white/70 text-sm">{text}</span>
  </motion.div>
);

const AdLandingPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#0A0612] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_top,#3D2066_0%,transparent_60%)] opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#6B3FA0_0%,transparent_50%)] opacity-10 pointer-events-none" />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[#9B6B8A]/30"
          style={{
            left: `${15 + i * 15}%`,
            top: `${10 + (i % 3) * 30}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center px-4 py-12 md:py-20">
        {/* Label */}
        <motion.p
          className="text-xs font-semibold tracking-[0.2em] uppercase text-[#9B6B8A] mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {t("landing.adLanding.label")}
        </motion.p>

        {/* Headline */}
        <motion.h1
          className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center tracking-tight leading-[1.1] max-w-3xl mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          {t("landing.adLanding.headline1")}
        </motion.h1>

        {/* Subtitle — Brunson bait */}
        <motion.p
          className="text-white/50 text-base md:text-lg max-w-xl text-center mb-10 md:mb-14 whitespace-pre-line"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          {t("landing.adLanding.subtitle")}
        </motion.p>

        {/* Phone frame with widget */}
        <motion.div
          className="relative mb-6"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.35 }}
        >
          {/* Glow behind phone */}
          <div className="absolute -inset-12 bg-[#6B3FA0]/15 rounded-full blur-3xl pointer-events-none" />

          <div
            className="relative bg-[#1a1a1a] rounded-[50px] p-3 shadow-2xl border border-white/10"
            style={{
              width: FRAME_W + 24,
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.08), 0 60px 120px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            {/* Notch */}
            <div className="w-28 h-7 bg-black rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#1a1a1a] border border-white/10" />
            </div>

            {/* Iframe */}
            <div
              className="rounded-[38px] overflow-hidden bg-white"
              style={{ height: FRAME_H }}
            >
              <iframe
                src="/s/demo-salon"
                className="border-0"
                title={t("landing.adLanding.iframeTitle")}
                style={{
                  width: IFRAME_W,
                  height: IFRAME_H,
                  transform: `scale(${SCALE})`,
                  transformOrigin: "top left",
                }}
              />
            </div>

            {/* Home indicator */}
            <div className="w-24 h-1 bg-white/20 rounded-full mx-auto mt-3" />
          </div>
        </motion.div>

        {/* Hint under widget */}
        <motion.p
          className="text-white/40 text-sm text-center max-w-sm mb-10 md:mb-14"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {t("landing.adLanding.ctaInfo")}
        </motion.p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3">
          <FeaturePill icon={Shield} text={t("landing.adLanding.pill1")} delay={0.1} />
          <FeaturePill icon={CreditCard} text={t("landing.adLanding.pill2")} delay={0.2} />
          <FeaturePill icon={Bot} text={t("landing.adLanding.pill3")} delay={0.3} />
        </div>
      </div>
    </div>
  );
};

export default AdLandingPage;


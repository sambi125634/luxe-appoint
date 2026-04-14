import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Phone, Globe, Sparkles, Bot } from "lucide-react";

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
          {t("landing.adLanding.headline1")}{" "}
          <span className="bg-gradient-to-r from-[#9B6B8A] to-[#6B3FA0] bg-clip-text text-transparent">
            {t("landing.adLanding.headline2")}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-white/50 text-base md:text-lg max-w-xl text-center mb-10 md:mb-14"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          {t("landing.adLanding.subtitle")}
        </motion.p>

        {/* Phone frame with widget */}
        <motion.div
          className="relative mb-10 md:mb-14"
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

        {/* Info + CTA section */}
        <motion.div
          className="flex flex-col items-center gap-6 max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <p className="text-white/60 text-center text-sm md:text-base leading-relaxed">
            {t("landing.adLanding.ctaInfo")}
          </p>

          <Link
            to="/demo-agent"
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-white text-base md:text-lg overflow-hidden transition-transform duration-200 hover:scale-[1.02]"
          >
            {/* Animated gradient border */}
            <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#3D2066] via-[#6B3FA0] to-[#9B6B8A] p-[2px]">
              <span className="block w-full h-full rounded-[14px] bg-[#0A0612]" />
            </span>
            <span className="relative flex items-center gap-3">
              <Bot className="w-5 h-5 text-[#9B6B8A]" />
              {t("landing.adLanding.ctaButton")}
            </span>
          </Link>
        </motion.div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-10 md:mt-14">
          <FeaturePill icon={Globe} text={t("landing.adLanding.pill1")} delay={0.1} />
          <FeaturePill icon={Phone} text={t("landing.adLanding.pill2")} delay={0.2} />
          <FeaturePill icon={Sparkles} text={t("landing.adLanding.pill3")} delay={0.3} />
        </div>
      </div>
    </div>
  );
};

export default AdLandingPage;

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Mic, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RetellWebClient } from "retell-client-js-sdk";
import { useTranslation } from "react-i18next";
import VoiceWaves from "@/components/demo-agent/VoiceWaves";
import SavingsCalculator from "@/components/demo-agent/SavingsCalculator";

type CallStatus = "idle" | "connecting" | "active" | "ended" | "error";

const AGENT_ID = "agent_97d146912ae36f5c916710204c";

/* ── Floating particles — warm tones ── */
const FloatingParticles = () => {
  const particles = Array.from({ length: 7 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 3,
    duration: 12 + Math.random() * 8,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.id % 2 === 0 ? "rgba(181,115,122,0.18)" : "rgba(200,149,107,0.15)",
          }}
          animate={{
            y: [0, -30, 0, 20, 0],
            x: [0, 15, -10, 5, 0],
            opacity: [0.2, 0.5, 0.3, 0.6, 0.2],
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
};

/* ── Dot grid background ── */
const DotGrid = () => (
  <div
    className="absolute inset-0 overflow-hidden pointer-events-none"
    style={{
      backgroundImage: "radial-gradient(circle, rgba(180,150,120,0.18) 1px, transparent 1px)",
      backgroundSize: "28px 28px",
      maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 100%)",
      WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 100%)",
      opacity: 0.6,
    }}
  />
);

/* ── Feature pills ── */
const featurePills = [
  { pl: "Rozmowa w przeglądarce", en: "Browser-based call" },
  { pl: "Bez numeru telefonu", en: "No phone number needed" },
  { pl: "AI w czasie rzeczywistym", en: "Real-time AI" },
];

const FeaturePills = () => {
  const { i18n } = useTranslation();
  const isPl = i18n.language?.startsWith("pl");

  return (
    <motion.div
      className="flex flex-wrap justify-center gap-3 mt-10"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.15, delayChildren: 0.8 } } }}
    >
      {featurePills.map((pill, i) => (
        <motion.span
          key={i}
          className="text-xs font-medium text-[rgba(44,36,32,0.45)] border border-[rgba(180,150,120,0.25)] bg-white/60 backdrop-blur-sm rounded-full px-4 py-1.5"
          variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.5 }}
        >
          {isPl ? pill.pl : pill.en}
        </motion.span>
      ))}
    </motion.div>
  );
};

/* ── Main page ── */
const DemoAgentPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const retellClientRef = useRef<RetellWebClient | null>(null);
  const calculatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      retellClientRef.current?.stopCall();
    };
  }, []);

  useEffect(() => {
    if (callStatus === "ended") {
      const timer = setTimeout(() => {
        calculatorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [callStatus]);

  const startCall = useCallback(async () => {
    setCallStatus("connecting");
    try {
      const { data, error } = await supabase.functions.invoke("create-retell-web-call", {
        body: { agent_id: AGENT_ID },
      });
      if (error || !data?.access_token) {
        throw new Error(error?.message || "Brak access_token");
      }
      const client = new RetellWebClient();
      retellClientRef.current = client;
      client.on("call_started", () => setCallStatus("active"));
      client.on("call_ended", () => setCallStatus("ended"));
      client.on("agent_start_talking", () => setAgentSpeaking(true));
      client.on("agent_stop_talking", () => setAgentSpeaking(false));
      client.on("error", (e) => {
        console.error("Retell error:", e);
        setCallStatus("error");
        toast.error(t("demoAgent.errorOccurred"));
      });
      await client.startCall({ accessToken: data.access_token });
    } catch (err) {
      console.error("Start call error:", err);
      setCallStatus("error");
      toast.error(t("demoAgent.errorOccurred"));
    }
  }, [t]);

  const endCall = useCallback(() => {
    retellClientRef.current?.stopCall();
    setCallStatus("ended");
  }, []);

  const resetCall = useCallback(() => {
    setCallStatus("idle");
    setAgentSpeaking(false);
  }, []);

  const isActive = callStatus === "active";

  const agentState: "idle" | "listening" | "processing" | "speaking" =
    callStatus === "connecting"
      ? "processing"
      : isActive && agentSpeaking
        ? "speaking"
        : isActive
          ? "listening"
          : "idle";

  const glowColor =
    callStatus === "error"
      ? "rgba(217,79,61,0.15)"
      : agentState === "speaking"
        ? "rgba(181,115,122,0.20)"
        : agentState === "listening"
          ? "rgba(200,149,107,0.15)"
          : agentState === "processing"
            ? "rgba(181,115,122,0.12)"
            : callStatus === "ended"
              ? "rgba(106,158,106,0.12)"
              : "rgba(181,115,122,0.08)";

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 py-12 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #faf7f2 0%, #f4efe6 50%, #faf7f2 100%)" }}
    >
      <DotGrid />
      <FloatingParticles />

      {/* Central glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 600,
          height: 600,
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          transition: "background 0.8s ease",
        }}
      />

      {/* Back button */}
      <motion.div
        className="absolute top-6 left-6 z-20"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2 text-[rgba(44,36,32,0.45)] hover:text-[#2c2420] hover:bg-[rgba(181,115,122,0.06)]"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("demoAgent.back")}
        </Button>
      </motion.div>

      {/* Header */}
      <motion.div
        className="text-center mb-8 max-w-xl relative z-10 mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span
          className="uppercase tracking-[0.2em] text-sm font-semibold mb-4 block"
          style={{
            backgroundImage: "linear-gradient(135deg, #b5737a, #c8956b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {t("demoAgent.label")}
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-[#2c2420] tracking-tight mb-2 leading-[1.1] whitespace-pre-line font-serif">
          {t("demoAgent.title")}
        </h1>
        <p className="text-[rgba(44,36,32,0.45)] text-base leading-relaxed max-w-md mx-auto whitespace-pre-line">
          {t("demoAgent.description")}
        </p>
      </motion.div>

      {/* Wave + controls area */}
      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        {/* Voice Waves */}
        <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
          <VoiceWaves agentState={agentState} />

          {/* Center icon overlay */}
          <motion.div
            className="absolute rounded-full flex items-center justify-center"
            style={{
              width: 80,
              height: 80,
              background:
                agentState === "listening"
                  ? "linear-gradient(135deg, rgba(200,149,107,0.85), rgba(181,115,122,0.8))"
                  : agentState === "processing"
                    ? "linear-gradient(135deg, rgba(181,115,122,0.85), rgba(139,96,112,0.9))"
                    : agentState === "speaking"
                      ? "linear-gradient(135deg, rgba(181,115,122,0.85), rgba(106,158,106,0.7))"
                      : "linear-gradient(135deg, rgba(200,149,107,0.8), rgba(181,115,122,0.8))",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.3)",
              boxShadow: "0 4px 20px rgba(181,115,122,0.2)",
              transition: "background 0.6s ease",
            }}
            animate={
              agentState === "processing"
                ? { scale: [1, 1.08, 1] }
                : agentState === "speaking"
                  ? { scale: [1, 1.12, 1] }
                  : agentState === "listening"
                    ? { scale: [1, 1.05, 1] }
                    : { scale: [1, 1.03, 1] }
            }
            transition={{
              duration: agentState === "processing" ? 0.8 : agentState === "speaking" ? 1.2 : 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Mic className="w-7 h-7 text-white/90" />
          </motion.div>
        </div>

        {/* Status text */}
        <div className="h-8 mt-4 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={callStatus + (agentSpeaking ? "s" : "l")}
              className="text-sm font-medium text-[rgba(44,36,32,0.45)]"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              {callStatus === "idle" && t("demoAgent.statusIdle")}
              {callStatus === "connecting" && t("demoAgent.statusConnecting")}
              {callStatus === "active" && (agentSpeaking ? t("demoAgent.statusAgentSpeaking") : t("demoAgent.statusListening"))}
              {callStatus === "ended" && t("demoAgent.statusEnded")}
              {callStatus === "error" && t("demoAgent.statusError")}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        <div className="mt-6 w-full max-w-xs">
          <AnimatePresence mode="wait">
            {callStatus === "idle" && (
              <motion.div key="idle-btn" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="relative group rounded-[14px] p-[2px] overflow-hidden">
                  <div
                    className="absolute inset-0 animate-spin"
                    style={{
                      background: "conic-gradient(from 0deg, #c8956b, #b5737a, #d4909a, #b5737a, #c8956b)",
                      animationDuration: "4s",
                    }}
                  />
                  <Button
                    onClick={startCall}
                    className="relative w-full text-white rounded-[12px] px-8 py-5 font-semibold text-base transition-all z-10"
                    style={{ background: "linear-gradient(135deg, #c8956b, #b5737a)" }}
                    size="lg"
                  >
                    <motion.span
                      className="inline-flex mr-2"
                      animate={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <Phone className="w-5 h-5" />
                    </motion.span>
                    {t("demoAgent.startCall")}
                  </Button>
                </div>
              </motion.div>
            )}

            {callStatus === "connecting" && (
              <motion.div key="connect-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Button disabled className="w-full rounded-[12px] px-8 py-5 bg-[rgba(181,115,122,0.1)] text-[rgba(44,36,32,0.45)] border border-[rgba(180,150,120,0.18)]" size="lg">
                  <div className="w-5 h-5 border-2 border-[rgba(181,115,122,0.2)] border-t-[rgba(181,115,122,0.7)] rounded-full animate-spin mr-2" />
                  {t("demoAgent.statusConnecting")}
                </Button>
              </motion.div>
            )}

            {callStatus === "active" && (
              <motion.div key="active-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Button
                  onClick={endCall}
                  className="w-full rounded-[12px] px-8 py-5 font-semibold text-base bg-[#D94F3D] hover:bg-[#c4402f] text-white border-0"
                  size="lg"
                >
                  <PhoneOff className="w-5 h-5 mr-2" />
                  {t("demoAgent.endCall")}
                </Button>
              </motion.div>
            )}

            {(callStatus === "ended" || callStatus === "error") && (
              <motion.div key="end-btns" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
                <Button
                  onClick={resetCall}
                  className="w-full text-white rounded-[12px] px-8 py-5 font-semibold border-0"
                  style={{ background: "linear-gradient(135deg, #c8956b, #b5737a)" }}
                  size="lg"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  {t("demoAgent.tryAgain")}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/")}
                  className="w-full rounded-[12px] text-[rgba(44,36,32,0.45)] hover:text-[#2c2420] hover:bg-[rgba(181,115,122,0.06)]"
                >
                  {t("demoAgent.backToHome")}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Feature pills */}
      <FeaturePills />

      {/* Separator */}
      <div className="w-full max-w-[680px] mx-auto mt-20 mb-16 relative z-10">
        <div className="h-px bg-gradient-to-r from-transparent via-[rgba(181,115,122,0.25)] to-transparent" />
      </div>

      {/* Savings Calculator */}
      <div ref={calculatorRef}>
        <SavingsCalculator />
      </div>

      {/* Bottom padding */}
      <div className="h-16" />
    </div>
  );
};

export default DemoAgentPage;

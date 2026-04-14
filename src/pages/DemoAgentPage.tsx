import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Mic, Bot, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RetellWebClient } from "retell-client-js-sdk";
import { useTranslation } from "react-i18next";

type CallStatus = "idle" | "connecting" | "active" | "ended" | "error";

const AGENT_ID = "agent_placeholder"; // Replace with actual Retell agent ID

const DemoAgentPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const retellClientRef = useRef<RetellWebClient | null>(null);

  useEffect(() => {
    return () => {
      retellClientRef.current?.stopCall();
    };
  }, []);

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

  return (
    <div className="min-h-screen bg-[#F5F3FA] flex flex-col items-center justify-center px-4 py-12">
      {/* Back button */}
      <motion.div
        className="absolute top-6 left-6"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 text-[#5A5770]">
          <ArrowLeft className="w-4 h-4" />
          {t("demoAgent.back")}
        </Button>
      </motion.div>

      <motion.div
        className="text-center mb-8 max-w-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="text-[#9B6B8A] uppercase tracking-widest text-sm font-semibold mb-3 block">
          {t("demoAgent.label")}
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-[#1E1B2E] tracking-tight mb-3">
          {t("demoAgent.title")}
        </h1>
        <p className="text-[#5A5770] text-base leading-relaxed">
          {t("demoAgent.description")}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="w-full max-w-md rounded-[16px] border border-[#E8E4F0] shadow-md bg-white">
          <CardContent className="p-8 flex flex-col items-center gap-6">
            {/* Avatar / visualizer */}
            <div className="relative flex items-center justify-center">
              <AnimatePresence mode="wait">
                {callStatus === "active" && agentSpeaking ? (
                  <motion.div
                    key="speaking"
                    className="absolute w-28 h-28 rounded-full bg-[#3D2066]/10"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                ) : callStatus === "active" ? (
                  <motion.div
                    key="listening"
                    className="absolute w-28 h-28 rounded-full bg-[#9B6B8A]/10"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                ) : null}
              </AnimatePresence>

              <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-[#3D2066] to-[#6B3FA0] flex items-center justify-center shadow-lg">
                {callStatus === "active" ? (
                  <Mic className="w-8 h-8 text-white" />
                ) : (
                  <Bot className="w-8 h-8 text-white" />
                )}
              </div>
            </div>

            {/* Status text */}
            <p className="text-sm font-medium text-[#5A5770]">
              {callStatus === "idle" && t("demoAgent.statusIdle")}
              {callStatus === "connecting" && t("demoAgent.statusConnecting")}
              {callStatus === "active" && (agentSpeaking ? t("demoAgent.statusAgentSpeaking") : t("demoAgent.statusListening"))}
              {callStatus === "ended" && t("demoAgent.statusEnded")}
              {callStatus === "error" && t("demoAgent.statusError")}
            </p>

            {/* Action buttons */}
            {callStatus === "idle" && (
              <Button
                onClick={startCall}
                className="w-full bg-gradient-to-r from-[#3D2066] to-[#6B3FA0] text-white rounded-[12px] px-8 py-4 font-semibold text-base hover:opacity-90 transition-opacity"
                size="lg"
              >
                <Phone className="w-5 h-5 mr-2" />
                {t("demoAgent.startCall")}
              </Button>
            )}

            {callStatus === "connecting" && (
              <Button disabled className="w-full rounded-[12px] px-8 py-4" size="lg">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                {t("demoAgent.statusConnecting")}
              </Button>
            )}

            {callStatus === "active" && (
              <Button
                onClick={endCall}
                variant="destructive"
                className="w-full rounded-[12px] px-8 py-4 font-semibold text-base"
                size="lg"
              >
                <PhoneOff className="w-5 h-5 mr-2" />
                {t("demoAgent.endCall")}
              </Button>
            )}

            {(callStatus === "ended" || callStatus === "error") && (
              <div className="flex flex-col gap-3 w-full">
                <Button
                  onClick={resetCall}
                  className="w-full bg-gradient-to-r from-[#3D2066] to-[#6B3FA0] text-white rounded-[12px] px-8 py-4 font-semibold"
                  size="lg"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  {t("demoAgent.tryAgain")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="w-full rounded-[12px]"
                >
                  {t("demoAgent.backToHome")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DemoAgentPage;

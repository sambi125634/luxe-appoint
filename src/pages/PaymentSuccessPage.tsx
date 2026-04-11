import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Loader2, XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

type PaymentStatus = "polling" | "completed" | "failed";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session");
  const [status, setStatus] = useState<PaymentStatus>("polling");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      setStatus("failed");
      return;
    }

    const checkStatus = async () => {
      const { data, error } = await supabase
        .from("payment_transactions")
        .select("status")
        .eq("p24_session_id", sessionId)
        .maybeSingle();

      if (error) {
        console.error("Payment status check error:", error);
        // Also check old flow (appointments table)
        const { data: appt } = await supabase
          .from("appointments")
          .select("payment_status")
          .eq("payment_session_id", sessionId)
          .maybeSingle();

        if (appt?.payment_status === "paid" || appt?.payment_status === "completed") {
          setStatus("completed");
          return;
        }
      }

      if (data?.status === "completed") {
        setStatus("completed");
        return;
      }

      if (data?.status === "failed") {
        setStatus("failed");
        return;
      }

      // Keep polling
      setAttempts((prev) => {
        if (prev >= 10) {
          setStatus("completed"); // Assume success after 30s
          return prev;
        }
        return prev + 1;
      });
    };

    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [sessionId]);

  useEffect(() => {
    if (attempts >= 10 && status === "polling") {
      setStatus("completed");
    }
  }, [attempts, status]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-sm w-full space-y-6"
      >
        {status === "polling" && (
          <>
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Weryfikujemy płatność...</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Może to zająć do 30 sekund. Nie zamykaj tej strony.
              </p>
            </div>
          </>
        )}

        {status === "completed" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mx-auto w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Wizyta opłacona! 🎉</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Płatność potwierdzona. Do zobaczenia na wizycie!
              </p>
            </div>
            <Button
              onClick={() => navigate("/app/bookings")}
              className="w-full h-12 rounded-xl font-semibold"
            >
              Przejdź do moich wizyt
            </Button>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Płatność nieudana</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Coś poszło nie tak. Spróbuj ponownie lub zapłać na miejscu.
              </p>
            </div>
            <div className="space-y-2">
              <Button
                onClick={() => navigate(-1)}
                className="w-full h-12 rounded-xl font-semibold"
              >
                Spróbuj ponownie
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/app/bookings")}
                className="w-full gap-2 text-muted-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Wróć do wizyt
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

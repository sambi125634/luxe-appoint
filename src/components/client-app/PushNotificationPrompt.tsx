import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePushSubscription } from "@/hooks/usePushSubscription";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "push_prompt_shown";

export function PushNotificationPrompt() {
  const [visible, setVisible] = useState(false);
  const { subscribe, isSubscribing } = usePushSubscription();

  useEffect(() => {
    if (!("PushManager" in window) || !("serviceWorker" in navigator)) return;
    if (Notification.permission === "granted") return;
    if (Notification.permission === "denied") return;

    const alreadyShown = localStorage.getItem(STORAGE_KEY);
    if (alreadyShown) return;

    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleEnable = async () => {
    const success = await subscribe();
    if (success) {
      localStorage.setItem(STORAGE_KEY, "true");
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-4 right-4 z-50 max-w-[400px] mx-auto"
        >
          <Card className="border-primary/20 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground mb-1">
                    Włącz powiadomienia 🔔
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Nie przegap wizyt i promocji. Przypomnimy Ci o nadchodzących terminach.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className="flex-1 h-9 text-xs font-semibold"
                      onClick={handleEnable}
                      disabled={isSubscribing}
                    >
                      {isSubscribing ? "Włączanie..." : "Włącz"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 text-xs text-muted-foreground"
                      onClick={handleDismiss}
                    >
                      Może później
                    </Button>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

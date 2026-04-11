import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const VAPID_PUBLIC_KEY = "BHeoc1PyqzIrw-gNcw-Vq_hOslRzkOgB_Lxg194iI0aqqtu8S22wTgl11JCQRR9MhAOTVtdB4M4pnvrmCrEBsJg";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushSubscription() {
  const [isSubscribing, setIsSubscribing] = useState(false);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast.error("Twoja przeglądarka nie obsługuje powiadomień push");
      return false;
    }

    setIsSubscribing(true);
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Nie udzielono zgody na powiadomienia");
        return false;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Brak zalogowanego użytkownika");

      const { error } = await supabase.from("push_tokens").upsert(
        {
          user_id: user.id,
          device_token: JSON.stringify(subscription),
          platform: "web",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,platform" }
      );

      if (error) throw error;

      await supabase
        .from("profiles")
        .update({ notifications_push: true })
        .eq("id", user.id);

      toast.success("Powiadomienia włączone ✓");
      return true;
    } catch (err) {
      console.error("Push subscription error:", err);
      toast.error("Nie udało się włączyć powiadomień");
      return false;
    } finally {
      setIsSubscribing(false);
    }
  }, []);

  return { subscribe, isSubscribing };
}

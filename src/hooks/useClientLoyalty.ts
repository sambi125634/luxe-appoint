import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useLoyaltyStamps() {
  return useQuery({
    queryKey: ["loyalty-stamps"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { totalPoints: 0, stamps: [], visitsCount: 0 };

      const { data, error } = await supabase
        .from("loyalty_stamps")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const stamps = data || [];
      const totalPoints = stamps.reduce((sum, s) => sum + (s.points || 0), 0);
      const visitsCount = stamps.filter(s => s.reason === "visit").length;
      return { totalPoints, stamps, visitsCount };
    },
  });
}

export function useClientCoupons() {
  return useQuery({
    queryKey: ["client-coupons"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("client_coupons")
        .select("*, salons(name)")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .is("used_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useClientNotifications() {
  return useQuery({
    queryKey: ["client-notifications"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("client_notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
  });
}

export function useMarkNotificationRead() {
  return async (notificationId: string) => {
    await supabase
      .from("client_notifications")
      .update({ is_read: true })
      .eq("id", notificationId);
  };
}

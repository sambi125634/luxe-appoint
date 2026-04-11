import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ── Per-salon loyalty points ──

export function useLoyaltyPerSalon(salonId: string | undefined) {
  return useQuery({
    queryKey: ["loyalty-per-salon", salonId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !salonId) return { totalPoints: 0, stampCount: 0, visitsCount: 0, availablePoints: 0 };

      const { data: stamps } = await supabase
        .from("loyalty_stamps")
        .select("points, reason")
        .eq("user_id", user.id)
        .eq("salon_id", salonId);

      const allStamps = stamps || [];
      const totalPoints = allStamps.reduce((sum, s) => sum + (s.points || 0), 0);
      const visitsCount = allStamps.filter(s => s.reason === "visit").length;

      // Subtract pending/confirmed redemptions
      const { data: redemptions } = await supabase
        .from("loyalty_redemptions")
        .select("points_spent")
        .eq("user_id", user.id)
        .eq("salon_id", salonId)
        .in("status", ["pending", "confirmed"]);

      const spentPoints = (redemptions || []).reduce((sum, r) => sum + r.points_spent, 0);
      const availablePoints = totalPoints - spentPoints;

      return { totalPoints, stampCount: allStamps.length, visitsCount, availablePoints };
    },
    enabled: !!salonId,
  });
}

// ── Rewards available for a salon ──

export function useLoyaltyRewards(salonId: string | undefined) {
  return useQuery({
    queryKey: ["loyalty-rewards", salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from("loyalty_rewards")
        .select("*")
        .eq("salon_id", salonId)
        .eq("is_active", true)
        .order("points_required", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!salonId,
  });
}

// ── User's active redemptions ──

export function useLoyaltyRedemptions(salonId: string | undefined) {
  return useQuery({
    queryKey: ["loyalty-redemptions", salonId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !salonId) return [];

      const { data, error } = await supabase
        .from("loyalty_redemptions")
        .select("*, loyalty_rewards(name, description, reward_type)")
        .eq("user_id", user.id)
        .eq("salon_id", salonId)
        .in("status", ["pending", "confirmed"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!salonId,
  });
}

// ── Redeem a reward ──

export function useRedeemReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rewardId, salonId }: { rewardId: string; salonId: string }) => {
      const { data, error } = await supabase.functions.invoke("redeem-reward", {
        body: { reward_id: rewardId, salon_id: salonId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-per-salon", variables.salonId] });
      queryClient.invalidateQueries({ queryKey: ["loyalty-redemptions", variables.salonId] });
    },
  });
}

// ── Client's salons for selector ──

export function useClientSalons() {
  return useQuery({
    queryKey: ["client-salons-loyalty"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("client_salon_links")
        .select("salon_id, salons(id, name, logo_url, theme_primary_color)")
        .eq("user_id", user.id)
        .order("joined_at", { ascending: true });

      if (error) throw error;
      return (data || []).map(d => d.salons).filter(Boolean) as {
        id: string;
        name: string;
        logo_url: string | null;
        theme_primary_color: string | null;
      }[];
    },
  });
}

// ── Keep old exports for backwards compat ──

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

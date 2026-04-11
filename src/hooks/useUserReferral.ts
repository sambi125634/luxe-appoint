import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export function useReferralCode(salonId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["user-referral-code", salonId],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId || !salonId) return null;

      const { data, error } = await supabase
        .from("user_referral_codes")
        .select("*")
        .eq("user_id", userId)
        .eq("salon_id", salonId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!salonId,
  });

  const createCode = useMutation({
    mutationFn: async ({ firstName }: { firstName: string }) => {
      const userId = await getCurrentUserId();
      if (!userId || !salonId) throw new Error("Missing user or salon");

      const prefix = firstName
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
        .slice(0, 4);
      const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
      const code = `${prefix}${suffix}`;

      const { data, error } = await supabase
        .from("user_referral_codes")
        .insert({ user_id: userId, salon_id: salonId, code })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-referral-code", salonId] });
    },
  });

  return { code: query.data, isLoading: query.isLoading, createCode };
}

export function useReferralStats(salonId: string | null) {
  return useQuery({
    queryKey: ["user-referral-stats", salonId],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId || !salonId) return null;

      const { data, error } = await supabase
        .from("user_referrals")
        .select("status, reward_points")
        .eq("referrer_user_id", userId)
        .eq("salon_id", salonId);

      if (error) throw error;

      const rows = data ?? [];
      return {
        totalReferrals: rows.length,
        completedReferrals: rows.filter((r) => r.status === "rewarded").length,
        pendingReferrals: rows.filter((r) => r.status === "pending").length,
        totalPointsEarned: rows
          .filter((r) => r.status === "rewarded")
          .reduce((sum, r) => sum + (r.reward_points ?? 0), 0),
      };
    },
    enabled: !!salonId,
  });
}

export function useReferralHistory(salonId: string | null) {
  return useQuery({
    queryKey: ["user-referral-history", salonId],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId || !salonId) return [];

      const { data, error } = await supabase
        .from("user_referrals")
        .select("*")
        .eq("referrer_user_id", userId)
        .eq("salon_id", salonId)
        .order("referred_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Fetch referred user profiles
      const referredUserIds = (data ?? []).map((r) => r.referred_user_id);
      let profilesMap: Record<string, { first_name: string | null; phone: string | null }> = {};

      if (referredUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, first_name, phone")
          .in("id", referredUserIds);

        if (profiles) {
          profilesMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
        }
      }

      return (data ?? []).map((r) => {
        const profile = profilesMap[r.referred_user_id];
        const phone = profile?.phone ?? "";
        const maskedPhone = phone.length >= 9
          ? `+48 *** *** ${phone.slice(-3)}`
          : "***";

        return {
          ...r,
          referredName: profile?.first_name ?? "Znajoma",
          maskedPhone,
        };
      });
    },
    enabled: !!salonId,
  });
}

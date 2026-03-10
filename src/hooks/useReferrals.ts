import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "./useSalonId";

export function useReferralCodes() {
  const { salonId } = useSalonId();
  return useQuery({
    queryKey: ["referral-codes", salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from("referral_codes")
        .select("*, clients(first_name, last_name, phone, email)")
        .eq("salon_id", salonId)
        .order("total_referrals", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!salonId,
  });
}

export function useReferralEvents(codeId?: string) {
  const { salonId } = useSalonId();
  return useQuery({
    queryKey: ["referral-events", salonId, codeId],
    queryFn: async () => {
      if (!salonId) return [];
      let query = supabase
        .from("referral_events")
        .select("*")
        .eq("salon_id", salonId)
        .order("created_at", { ascending: false });
      if (codeId) query = query.eq("referral_code_id", codeId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!salonId,
  });
}

export function useReviewRequests() {
  const { salonId } = useSalonId();
  return useQuery({
    queryKey: ["review-requests", salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from("review_requests")
        .select("*, clients(first_name, last_name, phone)")
        .eq("salon_id", salonId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!salonId,
  });
}

export function useReviewOutcomes() {
  const { salonId } = useSalonId();
  return useQuery({
    queryKey: ["review-outcomes", salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from("review_outcomes")
        .select("*, clients(first_name, last_name)")
        .eq("salon_id", salonId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!salonId,
  });
}

export function useCreateReferralCode() {
  const queryClient = useQueryClient();
  const { salonId } = useSalonId();
  return useMutation({
    mutationFn: async ({ clientId, rewardType, rewardValue, newClientRewardValue }: {
      clientId: string;
      rewardType?: string;
      rewardValue?: number;
      newClientRewardValue?: number;
    }) => {
      if (!salonId) throw new Error("No salon");
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data, error } = await supabase
        .from("referral_codes")
        .insert({
          salon_id: salonId,
          client_id: clientId,
          code,
          reward_type: rewardType || "discount",
          reward_value: rewardValue || 50,
          new_client_reward_value: newClientRewardValue || 20,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["referral-codes"] }),
  });
}

export function useReferralStats() {
  const { salonId } = useSalonId();
  return useQuery({
    queryKey: ["referral-stats", salonId],
    queryFn: async () => {
      if (!salonId) return { totalReferrals: 0, totalRevenue: 0, totalRewardsCost: 0, activeAmbassadors: 0, pendingReviews: 0, completedReviews: 0 };
      
      const [codesRes, eventsRes, reviewsRes, outcomesRes] = await Promise.all([
        supabase.from("referral_codes").select("total_referrals, total_revenue").eq("salon_id", salonId),
        supabase.from("referral_events").select("reward_amount, event_type").eq("salon_id", salonId).eq("event_type", "booking"),
        supabase.from("review_requests").select("id, status").eq("salon_id", salonId),
        supabase.from("review_outcomes").select("id").eq("salon_id", salonId),
      ]);

      const codes = codesRes.data || [];
      const events = eventsRes.data || [];

      return {
        totalReferrals: codes.reduce((s, c) => s + (c.total_referrals || 0), 0),
        totalRevenue: codes.reduce((s, c) => s + Number(c.total_revenue || 0), 0),
        totalRewardsCost: events.reduce((s, e) => s + Number(e.reward_amount || 0), 0),
        activeAmbassadors: codes.filter(c => (c.total_referrals || 0) > 0).length,
        pendingReviews: (reviewsRes.data || []).filter(r => r.status === "sent").length,
        completedReviews: (outcomesRes.data || []).length,
      };
    },
    enabled: !!salonId,
  });
}

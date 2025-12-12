import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RiskScoreResult {
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  factors: {
    noShowRate: number;
    lateCancellationRate: number;
    visitCount: number;
    avgBookingAdvance: number;
    lastVisitDaysAgo: number;
  };
  recommendations: string[];
  mainReason: string;
  appointmentStats: {
    total: number;
    noShows: number;
    cancelled: number;
    completed: number;
  };
}

export function useClientRiskScore(clientId: string | null, salonId: string | null) {
  return useQuery({
    queryKey: ["client-risk-score", clientId, salonId],
    queryFn: async (): Promise<RiskScoreResult | null> => {
      if (!clientId || !salonId) return null;

      try {
        const { data, error } = await supabase.functions.invoke("ai-client-risk-score", {
          body: { clientId, salonId }
        });

        if (error) {
          console.error("Risk score error:", error);
          return null;
        }

        return data as RiskScoreResult;
      } catch (err) {
        console.error("Risk score fetch error:", err);
        return null;
      }
    },
    enabled: !!clientId && !!salonId,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1
  });
}

export function useCalculateRiskScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, salonId }: { clientId: string; salonId: string }) => {
      const { data, error } = await supabase.functions.invoke("ai-client-risk-score", {
        body: { clientId, salonId }
      });

      if (error) throw error;
      return data as RiskScoreResult;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["client-risk-score", variables.clientId, variables.salonId], data);
    }
  });
}

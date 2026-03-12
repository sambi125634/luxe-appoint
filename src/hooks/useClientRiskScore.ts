import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(val: string | null): boolean {
  return !!val && UUID_REGEX.test(val);
}

function getDemoRiskScore(clientId: string): RiskScoreResult {
  const seed = parseInt(clientId, 10) || 0;
  const scores: Array<{ score: number; level: "low" | "medium" | "high"; reason: string }> = [
    { score: 15, level: "low", reason: "Regularna klientka z dobrą historią" },
    { score: 45, level: "medium", reason: "Sporadyczne odwoływanie wizyt" },
    { score: 72, level: "high", reason: "Wysoki wskaźnik nieobecności" },
    { score: 28, level: "low", reason: "Nowa klientka, brak historii" },
    { score: 58, level: "medium", reason: "Długa przerwa od ostatniej wizyty" },
  ];
  const pick = scores[seed % scores.length];
  return {
    riskScore: pick.score,
    riskLevel: pick.level,
    factors: { noShowRate: pick.score * 0.3, lateCancellationRate: pick.score * 0.2, visitCount: 10 - seed, avgBookingAdvance: 3, lastVisitDaysAgo: seed * 15 },
    recommendations: ["Wyślij przypomnienie SMS", "Rozważ przedpłatę"],
    mainReason: pick.reason,
    appointmentStats: { total: 10, noShows: seed, cancelled: 1, completed: 9 - seed },
  };
}

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

      // For demo/non-UUID ids, return mock data without calling edge function
      if (!isValidUuid(clientId) || !isValidUuid(salonId)) {
        return getDemoRiskScore(clientId);
      }

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
    staleTime: 30 * 60 * 1000,
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

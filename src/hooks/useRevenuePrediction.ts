import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RevenuePredictionResult {
  predictions: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    confirmedBookings: number;
  };
  trends: {
    monthOverMonth: number;
    direction: "up" | "down" | "stable";
  };
  confidence: "low" | "medium" | "high";
  insights: string[];
  bestDays: string[];
  dataPoints: number;
}

export function useRevenuePrediction(salonId: string | null) {
  return useQuery({
    queryKey: ["revenue-prediction", salonId],
    queryFn: async (): Promise<RevenuePredictionResult | null> => {
      if (!salonId) return null;

      try {
        const { data, error } = await supabase.functions.invoke("ai-revenue-predictor", {
          body: { salonId }
        });

        if (error) {
          console.error("Revenue prediction error:", error);
          return null;
        }

        return data as RevenuePredictionResult;
      } catch (err) {
        console.error("Revenue prediction fetch error:", err);
        return null;
      }
    },
    enabled: !!salonId,
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 1
  });
}

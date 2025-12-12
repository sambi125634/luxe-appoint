import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PricingSuggestion {
  type: "increase" | "decrease" | "promo";
  period: string;
  suggestion: string;
  impact: string;
  percentage: number;
}

export interface PricingOptimizerResult {
  heatmap: Record<string, Record<number, number>>;
  peakPeriods: Array<{ day: string; hour: number; rate: number }>;
  offPeakPeriods: Array<{ day: string; hour: number; rate: number }>;
  suggestions: PricingSuggestion[];
  aiStrategy: {
    strategyName: string;
    topRecommendation: string;
    estimatedRevenueIncrease: string;
    quickWins: string[];
  } | null;
  stats: {
    totalAppointments: number;
    avgOccupancy: number;
    peakDay: string;
    quietestDay: string;
  };
  services: Array<{
    id: string;
    name: string;
    currentPrice: number;
  }>;
}

export function usePricingOptimizer(salonId: string | null) {
  return useQuery({
    queryKey: ["pricing-optimizer", salonId],
    queryFn: async (): Promise<PricingOptimizerResult | null> => {
      if (!salonId) return null;

      try {
        const { data, error } = await supabase.functions.invoke("ai-pricing-optimizer", {
          body: { salonId }
        });

        if (error) {
          console.error("Pricing optimizer error:", error);
          return null;
        }

        return data as PricingOptimizerResult;
      } catch (err) {
        console.error("Pricing optimizer fetch error:", err);
        return null;
      }
    },
    enabled: !!salonId,
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 1
  });
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface SmartSlotsResult {
  recommendedSlots: string[];
  popularSlots: string[];
  allScores: Record<string, { score: number; reason: string; type: string }>;
  appointmentCount: number;
}

export function useSmartSlots(salonId: string | null, date: Date | null, serviceId?: string, serviceDuration?: number) {
  return useQuery({
    queryKey: ["smart-slots", salonId, date ? format(date, "yyyy-MM-dd") : null, serviceId],
    queryFn: async (): Promise<SmartSlotsResult> => {
      if (!salonId || !date) {
        return { recommendedSlots: [], popularSlots: [], allScores: {}, appointmentCount: 0 };
      }

      try {
        const { data, error } = await supabase.functions.invoke("ai-slot-scoring", {
          body: {
            salonId,
            date: format(date, "yyyy-MM-dd"),
            serviceId,
            serviceDuration
          }
        });

        if (error) {
          console.error("Smart slots error:", error);
          // Fallback to hardcoded recommendations
          return {
            recommendedSlots: ["10:00", "14:00", "14:30"],
            popularSlots: ["17:00", "17:30", "18:00"],
            allScores: {},
            appointmentCount: 0
          };
        }

        return data as SmartSlotsResult;
      } catch (err) {
        console.error("Smart slots fetch error:", err);
        return {
          recommendedSlots: ["10:00", "14:00", "14:30"],
          popularSlots: ["17:00", "17:30", "18:00"],
          allScores: {},
          appointmentCount: 0
        };
      }
    },
    enabled: !!salonId && !!date,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
}

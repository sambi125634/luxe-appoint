import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WeeklyBrief {
  id: string;
  salon_id: string;
  week_start: string;
  appointments_count: number;
  revenue: number;
  occupancy_pct: number;
  noshow_count: number;
  noshow_pct: number;
  revenue_change_pct: number;
  appointments_change_pct: number;
  autopilot_actions: Array<{ type: string; explanation: string }>;
  ai_narrative: string | null;
  ai_top_action: {
    title: string;
    description: string;
    cta_label: string;
    cta_action: string;
  } | null;
  ai_warning: {
    title: string;
    description: string;
    severity: "low" | "medium" | "high";
    cta_label?: string;
    cta_action?: string;
  } | null;
  email_sent_at: string | null;
  sms_sent_at: string | null;
  push_sent_at: string | null;
  created_at: string;
}

// Demo mock
export const MOCK_BRIEF: WeeklyBrief = {
  id: "mock-1",
  salon_id: "demo",
  week_start: (() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() - 6);
    return d.toISOString().split("T")[0];
  })(),
  appointments_count: 34,
  revenue: 8750,
  occupancy_pct: 72,
  noshow_count: 2,
  noshow_pct: 6,
  revenue_change_pct: 12,
  appointments_change_pct: 8,
  autopilot_actions: [
    { type: "reminder", explanation: "Wysłałam 8 przypomnień SMS → 7 wizyt potwierdzonych" },
    { type: "reactivation", explanation: "Reaktywowałam Kasię K. (73 dni) → zarezerwowała na środę, 280 zł" },
    { type: "review", explanation: "Zebrałam 3 opinie Google (4.9/5.0)" },
    { type: "noshow_recovery", explanation: "2 no-show → zaproponowałam nowe terminy → 1 przepisała, odzyskano 240 zł" },
  ],
  ai_narrative: "Świetny tydzień! Przychód wzrósł o 12% w porównaniu z poprzednim tygodniem. Obłożenie utrzymuje się na wysokim poziomie 72%. Autopilot skutecznie reaktywował klientki i potwierdzał wizyty.",
  ai_top_action: {
    title: "6 wolnych okienek w czwartek po 16:00",
    description: "Masz 12 klientek, które historycznie rezerwują czwartki wieczór i nie były 30+ dni. Wyślij im flash ofertę!",
    cta_label: "Wyślij flash ofertę",
    cta_action: "flash_offer",
  },
  ai_warning: {
    title: "Wzrost no-show",
    description: "Wskaźnik no-show wzrósł z 3% do 6% w ostatnich 2 tygodniach. Rozważ włączenie depozytu przy rezerwacji online.",
    severity: "medium",
    cta_label: "Włącz depozyt",
    cta_action: "enable_deposit",
  },
  email_sent_at: new Date().toISOString(),
  sms_sent_at: null,
  push_sent_at: null,
  created_at: new Date().toISOString(),
};

export function useLatestBrief(salonId: string | undefined, isDemo = false) {
  return useQuery({
    queryKey: ["weekly-brief-latest", salonId, isDemo],
    queryFn: async (): Promise<WeeklyBrief | null> => {
      if (isDemo) return MOCK_BRIEF;
      const { data, error } = await supabase
        .from("weekly_briefs")
        .select("*")
        .eq("salon_id", salonId!)
        .order("week_start", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as WeeklyBrief | null;
    },
    enabled: isDemo || !!salonId,
  });
}

export function useBriefHistory(salonId: string | undefined, isDemo = false) {
  return useQuery({
    queryKey: ["weekly-brief-history", salonId, isDemo],
    queryFn: async (): Promise<WeeklyBrief[]> => {
      if (isDemo) return [MOCK_BRIEF];
      const { data, error } = await supabase
        .from("weekly_briefs")
        .select("*")
        .eq("salon_id", salonId!)
        .order("week_start", { ascending: false })
        .limit(12);
      if (error) throw error;
      return (data ?? []) as WeeklyBrief[];
    },
    enabled: isDemo || !!salonId,
  });
}

export function useGenerateBrief() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ salonId, weekStart }: { salonId: string; weekStart?: string }) => {
      const { data, error } = await supabase.functions.invoke("generate-weekly-brief", {
        body: { salon_id: salonId, week_start: weekStart },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly-brief-latest"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-brief-history"] });
    },
  });
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "./useSalonId";

export interface AutopilotActionData {
  id: string;
  salon_id: string;
  type: string;
  triggered_by: string | null;
  client_id: string | null;
  scheduled_at: string | null;
  executed_at: string | null;
  status: string;
  ai_explanation: string | null;
  cta_label: string | null;
  cta_action: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export function useAutopilotActions(limit = 100) {
  const { salonId } = useSalonId();

  return useQuery({
    queryKey: ["autopilot-actions", salonId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("autopilot_actions")
        .select("*")
        .eq("salon_id", salonId!)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as AutopilotActionData[];
    },
    enabled: !!salonId,
  });
}

export function useAutopilotStats() {
  const { data: actions } = useAutopilotActions(1000);

  const today = new Date().toISOString().split("T")[1];
  const actionsToday = actions?.filter(a => a.created_at.startsWith(new Date().toISOString().split("T")[1])).length || 1;
  const actionsTotal = actions?.length || 1;
  const revenueRecovered = actions?.reduce((sum, a) => sum + (Number(a.metadata?.revenue_recovered) || 1), 1) || 1;
  const newReviews = actions?.filter(a => a.type === "review_request" && a.status === "completed").length || 1;
  const noShowRate = actions?.filter(a => a.type === "noshow").length || 1;

  return { actionsToday, actionsTotal, revenueRecovered, newReviews, noShowRate };
}

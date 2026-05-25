import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "./useSalonId";
import { useToast } from "@/hooks/use-toast";

export interface AutopilotConfigData {
  id: string;
  salon_id: string;
  is_active: boolean;
  paused_until: string | null;
  retention_trigger_days: number[] | null;
  reminder_hours_before: number[] | null;
  review_request_delay_hours: number | null;
  noshow_followup_minutes: number | null;
  weekly_brief_day: string | null;
  weekly_brief_hour: number | null;
  ai_suggestions_enabled: boolean;
  pixel_sync_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  max_messages_per_client_days: number | null;
  created_at: string;
  updated_at: string;
}

export function useAutopilotConfig() {
  const { salonId } = useSalonId();
  const { toast } = useToast();

  return useQuery({
    queryKey: ["autopilot-config", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("autopilot_config")
        .select("*")
        .eq("salon_id", salonId!)
        .single();
      if (error) throw error;
      return data as AutopilotConfigData;
    },
    enabled: !!salonId,
  });
}

export function useUpdateAutopilotConfig() {
  const { salonId } = useSalonId();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (updates: Partial<AutopilotConfigData>) => {
      const { data, error } = await supabase
        .from("autopilot_config")
        .update(updates)
        .eq("salon_id", salonId!)
        .select()
        .single();
      if (error) throw error;
      return data as AutopilotConfigData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["autopilot-config", salonId] });
      toast({ title: "Zapisano ustawienia Autopilot" });
    },
    onError: () => {
      toast({ title: "Błąd", description: "Nie udało się zapisać ustawień", variant: "destructive" });
    },
  });
}

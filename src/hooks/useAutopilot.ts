import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "./useSalonId";
import {
  type AutopilotConfig,
  type AutopilotAction,
  type AutopilotWeeklyStats,
  DEFAULT_AUTOPILOT_CONFIG,
  MOCK_AUTOPILOT_STATS,
  MOCK_TODAY_STATS,
  generateMockActions,
} from "@/lib/autopilot-engine";

// ---- Config ----

export function useAutopilotConfig() {
  const { salonId } = useSalonId();

  return useQuery({
    queryKey: ["autopilot-config", salonId],
    queryFn: async (): Promise<AutopilotConfig> => {
      if (!salonId) throw new Error("No salon");

      const { data, error } = await supabase
        .from("autopilot_config")
        .select("*")
        .eq("salon_id", salonId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Auto-create with intelligent defaults (Zero-Action Default)
        const { data: created, error: createErr } = await supabase
          .from("autopilot_config")
          .insert({ salon_id: salonId })
          .select()
          .single();
        if (createErr) throw createErr;
        return created as unknown as AutopilotConfig;
      }

      return data as unknown as AutopilotConfig;
    },
    enabled: !!salonId,
  });
}

// ---- Actions ----

export function useAutopilotActions() {
  const { salonId } = useSalonId();

  return useQuery({
    queryKey: ["autopilot-actions", salonId],
    queryFn: async (): Promise<AutopilotAction[]> => {
      if (!salonId) return [];

      const { data, error } = await supabase
        .from("autopilot_actions")
        .select("*")
        .eq("salon_id", salonId)
        .order("scheduled_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as unknown as AutopilotAction[];
    },
    enabled: !!salonId,
  });
}

export function useDismissAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (actionId: string) => {
      const { error } = await supabase
        .from("autopilot_actions")
        .update({ status: "dismissed" })
        .eq("id", actionId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["autopilot-actions"] }),
  });
}

export function useExecuteAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (actionId: string) => {
      const { error } = await supabase
        .from("autopilot_actions")
        .update({ status: "sent", executed_at: new Date().toISOString() })
        .eq("id", actionId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["autopilot-actions"] }),
  });
}

// ---- Stats ----

export function useAutopilotStats() {
  const { salonId } = useSalonId();

  return useQuery({
    queryKey: ["autopilot-stats", salonId],
    queryFn: async (): Promise<AutopilotWeeklyStats> => {
      if (!salonId) return { actions_taken: 0, revenue_recovered: 0, clients_reactivated: 0, reviews_collected: 0 };

      const weekStart = getWeekStart();
      const { data, error } = await supabase
        .from("autopilot_stats")
        .select("*")
        .eq("salon_id", salonId)
        .eq("week_start", weekStart)
        .maybeSingle();

      if (error) throw error;
      if (!data) return { actions_taken: 0, revenue_recovered: 0, clients_reactivated: 0, reviews_collected: 0 };

      return {
        actions_taken: data.actions_taken ?? 0,
        revenue_recovered: Number(data.revenue_recovered) || 0,
        clients_reactivated: data.clients_reactivated ?? 0,
        reviews_collected: data.reviews_collected ?? 0,
      };
    },
    enabled: !!salonId,
  });
}

// ---- Pause / Resume ----

export function useToggleAutopilotPause() {
  const { salonId } = useSalonId();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (pauseUntil: string | null) => {
      if (!salonId) throw new Error("No salon");
      const { error } = await supabase
        .from("autopilot_config")
        .update({
          paused_until: pauseUntil,
          is_active: !pauseUntil,
        })
        .eq("salon_id", salonId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["autopilot-config"] }),
  });
}

// ---- Demo hooks (mock data) ----

export function useDemoAutopilotStats() {
  return {
    weeklyStats: MOCK_AUTOPILOT_STATS,
    todayStats: MOCK_TODAY_STATS,
  };
}

export function useDemoAutopilotActions() {
  return generateMockActions();
}

// ---- Helpers ----

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0];
}

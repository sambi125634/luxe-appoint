import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "./useSalonId";

export interface AutopilotModuleStatsRow {
  module_key: string;
  actions_total: number;
  actions_sent: number;
  actions_converted: number;
  revenue_recovered: number;
  last_run_at: string | null;
}

export function useAutopilotModuleStats() {
  const { salonId } = useSalonId();

  return useQuery({
    queryKey: ["autopilot-module-stats", salonId],
    queryFn: async (): Promise<Record<string, AutopilotModuleStatsRow>> => {
      if (!salonId) return {};
      const { data, error } = await supabase
        // @ts-expect-error view not in generated types yet
        .from("autopilot_module_stats")
        .select("*")
        .eq("salon_id", salonId);
      if (error) throw error;
      const map: Record<string, AutopilotModuleStatsRow> = {};
      for (const row of (data || []) as AutopilotModuleStatsRow[]) {
        if (row.module_key) map[row.module_key] = row;
      }
      return map;
    },
    enabled: !!salonId,
    refetchInterval: 60_000,
  });
}

// Map UI FunctionKey → backend module_key + autopilot_config boolean column
export const MODULE_KEY_MAP: Record<string, { moduleKey: string; configCol: string }> = {
  vip: { moduleKey: "vip_tomorrow", configCol: "vip_tomorrow_enabled" },
  slots: { moduleKey: "flash_offer", configCol: "flash_offer_enabled" },
  reminder: { moduleKey: "smart_reminder", configCol: "smart_reminder_enabled" },
  radar: { moduleKey: "vip_radar", configCol: "vip_radar_enabled" },
  noshow: { moduleKey: "noshow_recovery", configCol: "noshow_recovery_enabled" },
  ambassador: { moduleKey: "silent_ambassador", configCol: "silent_ambassador_enabled" },
  referral: { moduleKey: "snowball_referral", configCol: "snowball_referral_enabled" },
  priceDetector: { moduleKey: "price_detector", configCol: "price_detector_enabled" },
  upsell: { moduleKey: "upsell_pre_visit", configCol: "upsell_pre_visit_enabled" },
  profitAlarm: { moduleKey: "profit_alarm", configCol: "profit_alarm_enabled" },
  firstVisitSequence: { moduleKey: "first_visit_sequence", configCol: "first_visit_sequence_enabled" },
  abandonedBooking: { moduleKey: "abandoned_booking", configCol: "abandoned_booking_enabled" },
  loyalty: { moduleKey: "loyalty_engine", configCol: "loyalty_engine_enabled" },
  vacationBrain: { moduleKey: "vacation_brain", configCol: "vacation_brain_enabled" },
  reviewGuard: { moduleKey: "review_guard", configCol: "review_guard_enabled" },
  priceChangeFollowup: { moduleKey: "price_change_followup", configCol: "price_change_followup_enabled" },
};

export function formatLastRun(iso: string | null): string | null {
  if (!iso) return null;
  const diffMs = Date.now() - new Date(iso).getTime();
  if (diffMs < 0) return "za chwilę";
  const m = Math.floor(diffMs / 60000);
  if (m < 1) return "przed chwilą";
  if (m < 60) return `${m} min temu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} godz. temu`;
  const d = Math.floor(h / 24);
  return `${d} dni temu`;
}
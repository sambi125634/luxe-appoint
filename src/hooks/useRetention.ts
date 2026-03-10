import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { RetentionRadarClient, RetentionTimelineItem, RetentionKPIData, RetentionSequence } from "@/modules/retention/types";
import { getRiskZone } from "@/modules/retention/types";

export function useRetentionRadar(salonId?: string) {
  return useQuery<RetentionRadarClient[]>({
    queryKey: ["retention-radar", salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from("clients")
        .select("id, first_name, last_name, last_visit_at, purchase_categories")
        .eq("salon_id", salonId)
        .not("last_visit_at", "is", null)
        .order("last_visit_at", { ascending: true })
        .limit(100);

      if (error) throw error;
      const now = Date.now();
      return (data ?? []).map((c) => {
        const lastVisit = new Date(c.last_visit_at!).getTime();
        const daysInactive = Math.floor((now - lastVisit) / 86400000);
        return {
          id: c.id,
          first_name: c.first_name,
          last_name: c.last_name,
          days_inactive: daysInactive,
          risk_zone: getRiskZone(daysInactive),
          last_service: (c.purchase_categories as string[] | null)?.[0] ?? null,
          last_sequence_sent: null,
          avatar_initials: `${c.first_name[0]}${c.last_name[0]}`,
        };
      });
    },
    enabled: !!salonId,
  });
}

export function useRetentionTimeline(salonId?: string) {
  return useQuery<RetentionTimelineItem[]>({
    queryKey: ["retention-timeline", salonId],
    queryFn: async () => {
      if (!salonId) return [];
      // For now return empty — will be populated when retention_messages are created
      return [];
    },
    enabled: !!salonId,
  });
}

export function useRetentionKPI(salonId?: string) {
  return useQuery<RetentionKPIData>({
    queryKey: ["retention-kpi", salonId],
    queryFn: async () => {
      if (!salonId) return { messages_sent: 0, open_rate: 0, bookings_from_retention: 0, revenue_recovered: 0, clients_in_campaign: 0 };
      return { messages_sent: 0, open_rate: 0, bookings_from_retention: 0, revenue_recovered: 0, clients_in_campaign: 0 };
    },
    enabled: !!salonId,
  });
}

export function useRetentionSequences(salonId?: string) {
  return useQuery<RetentionSequence[]>({
    queryKey: ["retention-sequences", salonId],
    queryFn: async () => {
      if (!salonId) return [];
      // Query uses generic JSON approach since types are auto-generated
      const { data, error } = await supabase
        .from("retention_sequences" as never)
        .select("*")
        .eq("salon_id", salonId)
        .order("trigger_days", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as RetentionSequence[];
    },
    enabled: !!salonId,
  });
}

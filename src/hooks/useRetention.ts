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
      
      // Query real tracking events from email_tracking_events
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: events, error } = await supabase
        .from("email_tracking_events")
        .select("event_type, message_id, client_id")
        .eq("salon_id", salonId)
        .gte("tracked_at", thirtyDaysAgo.toISOString());

      if (error) throw error;
      if (!events || events.length === 0) {
        return { messages_sent: 0, open_rate: 0, bookings_from_retention: 0, revenue_recovered: 0, clients_in_campaign: 0 };
      }

      // Deduplicate by message_id for each event type
      const sentMessages = new Set<string>();
      const openedMessages = new Set<string>();
      const clickedMessages = new Set<string>();
      const convertedMessages = new Set<string>();
      const clientsInCampaign = new Set<string>();

      events.forEach((e) => {
        if (e.event_type === "sent") sentMessages.add(e.message_id);
        if (e.event_type === "open") openedMessages.add(e.message_id);
        if (e.event_type === "click") clickedMessages.add(e.message_id);
        if (e.event_type === "conversion") convertedMessages.add(e.message_id);
        if (e.client_id) clientsInCampaign.add(e.client_id);
      });

      const sent = sentMessages.size;
      const opened = openedMessages.size;
      const openRate = sent > 0 ? Math.round((opened / sent) * 100) : 0;
      
      // Estimate revenue from conversions (will be more accurate with retention_conversions table)
      const { data: conversions } = await supabase
        .from("retention_conversions")
        .select("revenue_recovered")
        .eq("salon_id", salonId)
        .gte("created_at", thirtyDaysAgo.toISOString());

      const revenueRecovered = (conversions ?? []).reduce((sum, c) => sum + (c.revenue_recovered || 0), 0);

      return {
        messages_sent: sent,
        open_rate: openRate,
        bookings_from_retention: convertedMessages.size,
        revenue_recovered: revenueRecovered,
        clients_in_campaign: clientsInCampaign.size,
      };
    },
    enabled: !!salonId,
  });
}

export function useRetentionSequences(salonId?: string) {
  return useQuery<RetentionSequence[]>({
    queryKey: ["retention-sequences", salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from("retention_sequences" as never)
        .select("*")
        .eq("salon_id", salonId)
        .order("trigger_days", { ascending: true });
      if (error) throw error;
      const rows = (data ?? []) as unknown as RetentionSequence[];
      if (rows.length > 0) return rows;

      // Lazy fallback: seed defaults if salon has none yet
      const { error: rpcError } = await supabase.rpc(
        "seed_default_retention_sequences" as never,
        { p_salon_id: salonId } as never,
      );
      if (rpcError) return rows;

      const { data: seeded, error: reselectError } = await supabase
        .from("retention_sequences" as never)
        .select("*")
        .eq("salon_id", salonId)
        .order("trigger_days", { ascending: true });
      if (reselectError) return rows;
      return (seeded ?? []) as unknown as RetentionSequence[];
    },
    enabled: !!salonId,
  });
}

// Hook to query tracking stats per sequence for RetentionStats component
export function useRetentionTrackingStats(salonId?: string) {
  return useQuery({
    queryKey: ["retention-tracking-stats", salonId],
    queryFn: async () => {
      if (!salonId) return null;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: events, error } = await supabase
        .from("email_tracking_events")
        .select("event_type, message_id, sequence_name, tracked_at")
        .eq("salon_id", salonId)
        .gte("tracked_at", thirtyDaysAgo.toISOString());

      if (error) throw error;
      if (!events || events.length === 0) return null;

      // Group by sequence
      const seqMap = new Map<string, { sent: Set<string>; opens: Set<string>; clicks: Set<string>; conversions: Set<string> }>();

      events.forEach((e) => {
        const seq = e.sequence_name || "other";
        if (!seqMap.has(seq)) {
          seqMap.set(seq, { sent: new Set(), opens: new Set(), clicks: new Set(), conversions: new Set() });
        }
        const s = seqMap.get(seq)!;
        if (e.event_type === "sent") s.sent.add(e.message_id);
        if (e.event_type === "open") s.opens.add(e.message_id);
        if (e.event_type === "click") s.clicks.add(e.message_id);
        if (e.event_type === "conversion") s.conversions.add(e.message_id);
      });

      const sequences = Array.from(seqMap.entries()).map(([name, data]) => ({
        name,
        sent: data.sent.size,
        openRate: data.sent.size > 0 ? Math.round((data.opens.size / data.sent.size) * 100) : 0,
        ctr: data.sent.size > 0 ? Math.round((data.clicks.size / data.sent.size) * 100) : 0,
        conversion: data.sent.size > 0 ? Math.round((data.conversions.size / data.sent.size) * 100) : 0,
      }));

      // Hourly opens
      const hourlyOpens = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}:00`, opens: 0 }));
      events
        .filter(e => e.event_type === "open")
        .forEach(e => {
          const hour = new Date(e.tracked_at).getHours();
          hourlyOpens[hour].opens += 1;
        });

      return { sequences, hourlyOpens };
    },
    enabled: !!salonId,
  });
}

export interface PixelConfig {
  id: string;
  salon_id: string;
  pixel_id: string | null;
  ad_account_id: string | null;
  is_active: boolean;
  last_sync_at: string | null;
  sync_interval_hours: number;
  created_at: string;
  updated_at: string;
}

export interface AudienceMapping {
  id: string;
  salon_id: string;
  tag_name: string;
  audience_id: string | null;
  audience_name: string;
  is_exclusion: boolean;
  created_at: string;
}

export interface PixelEvent {
  id: string;
  salon_id: string;
  client_id: string | null;
  event_name: string;
  event_value: number | null;
  hashed_email: string | null;
  hashed_phone: string | null;
  sent_at: string;
  source_type: string;
}

export interface PixelSyncLog {
  id: string;
  salon_id: string;
  started_at: string;
  completed_at: string | null;
  events_sent: number;
  audiences_updated: number;
  errors: unknown[];
  status: string;
}

export interface PixelAttribution {
  id: string;
  salon_id: string;
  client_id: string;
  appointment_id: string | null;
  audience_name: string | null;
  ad_campaign: string | null;
  revenue: number;
  created_at: string;
}

export type PixelHealthScore = "excellent" | "good" | "poor";

export interface PixelHealthData {
  eventMatchQuality: number;
  eventsLast30d: number;
  audiences: { name: string; size: number; lastUpdated: string; isExclusion: boolean }[];
  score: PixelHealthScore;
  recommendations: string[];
}

export const EVENT_TYPE_MAP: Record<string, { metaEvent: string; label: string; color: string }> = {
  booking_completed: { metaEvent: "Purchase", label: "Rezerwacja wykonana", color: "hsl(var(--chart-1))" },
  booking_cancelled: { metaEvent: "CustomEvent: Cancellation", label: "Anulacja", color: "hsl(var(--destructive))" },
  no_show: { metaEvent: "CustomEvent: NoShow", label: "No-show", color: "hsl(var(--chart-4))" },
  new_client: { metaEvent: "Lead", label: "Nowa klientka", color: "hsl(var(--chart-2))" },
  reactivation: { metaEvent: "CustomEvent: ReEngagement", label: "Reaktywacja", color: "hsl(var(--chart-3))" },
  return_30d: { metaEvent: "CustomEvent: Return", label: "Powrót 30+ dni", color: "hsl(var(--chart-5))" },
};

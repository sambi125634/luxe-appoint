export type RiskZone = "green" | "yellow" | "orange" | "red";

export interface RetentionSequence {
  id: string;
  salon_id: string;
  sequence_key: "proactive" | "45day" | "60day" | "75day" | "90day";
  is_active: boolean;
  trigger_days: number;
  message_template: string;
  tone: string;
  include_incentive: boolean;
  incentive_details: Record<string, unknown>;
  countdown_hours: number | null;
  created_at: string;
  updated_at: string;
}

export interface RetentionMessage {
  id: string;
  salon_id: string;
  client_id: string;
  sequence_id: string | null;
  channel: "sms" | "email" | "whatsapp";
  status: "sent" | "delivered" | "opened" | "clicked" | "failed";
  message_content: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  created_at: string;
  client_name?: string;
  days_inactive?: number;
  sequence_key?: string;
}

export interface RetentionConversion {
  id: string;
  salon_id: string;
  client_id: string;
  message_id: string | null;
  appointment_id: string | null;
  revenue_recovered: number;
  created_at: string;
  client_name?: string;
}

export interface ClientCommPrefs {
  id: string;
  client_id: string;
  salon_id: string;
  preferred_channel: string;
  preferred_hour: number | null;
  preferred_day: number | null;
  opted_out: boolean;
  opted_out_at: string | null;
}

export interface RetentionRadarClient {
  id: string;
  first_name: string;
  last_name: string;
  days_inactive: number;
  risk_zone: RiskZone;
  last_service: string | null;
  last_sequence_sent: string | null;
  avatar_initials: string;
}

export interface RetentionTimelineItem {
  id: string;
  timestamp: string;
  client_name: string;
  days_inactive: number;
  channel: "sms" | "email" | "whatsapp";
  action: "sent" | "opened" | "clicked" | "booked";
  revenue?: number;
  ai_explanation: string;
}

export interface RetentionKPIData {
  messages_sent: number;
  open_rate: number;
  bookings_from_retention: number;
  revenue_recovered: number;
  clients_in_campaign: number;
}

export const SEQUENCE_LABELS: Record<string, { label: string; icon: string; description: string }> = {
  proactive: {
    label: "Zanim odejdzie",
    icon: "🔮",
    description: "Profilaktyczna — na podstawie średniego interwału klientki × 1.3",
  },
  "45day": {
    label: "45 dni — łagodna",
    icon: "🌸",
    description: "Ciepły, nienatarczywy ton z przyciskiem rezerwacji 1-klik",
  },
  "60day": {
    label: "60 dni — z wartością",
    icon: "📚",
    description: "Edukacyjna — mini-edukacja o zabiegu + efekty wizualne",
  },
  "75day": {
    label: "75 dni — z incentive",
    icon: "🎁",
    description: "Ekskluzywna oferta powrotu z 48h countdown",
  },
  "90day": {
    label: "90 dni — ostatnia szansa",
    icon: "🚨",
    description: "Ostatni kontakt + auto-tag do kampanii Meta",
  },
};

export function getRiskZone(daysInactive: number): RiskZone {
  if (daysInactive <= 30) return "green";
  if (daysInactive <= 60) return "yellow";
  if (daysInactive <= 90) return "orange";
  return "red";
}

export const RISK_ZONE_CONFIG: Record<RiskZone, { label: string; color: string; bgClass: string; textClass: string }> = {
  green: { label: "Aktywne", color: "#22c55e", bgClass: "bg-green-500/20", textClass: "text-green-700 dark:text-green-400" },
  yellow: { label: "Uwaga", color: "#eab308", bgClass: "bg-yellow-500/20", textClass: "text-yellow-700 dark:text-yellow-400" },
  orange: { label: "Ryzyko", color: "#f97316", bgClass: "bg-orange-500/20", textClass: "text-orange-700 dark:text-orange-400" },
  red: { label: "Utracone", color: "#ef4444", bgClass: "bg-red-500/20", textClass: "text-red-700 dark:text-red-400" },
};

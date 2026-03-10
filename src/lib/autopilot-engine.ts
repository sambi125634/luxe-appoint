// ============================================================
// Autopilot Engine — "Zero-Action Default" AI system for Beauty Calendar
// ============================================================

export type AutopilotActionType =
  | "retention"
  | "review"
  | "reminder"
  | "noshow"
  | "revenue_suggestion"
  | "pixel_sync"
  | "brief";

export type AutopilotActionStatus =
  | "pending"
  | "sent"
  | "completed"
  | "failed"
  | "dismissed";

export interface AutopilotConfig {
  id: string;
  salon_id: string;
  is_active: boolean;
  paused_until: string | null;
  retention_trigger_days: number[];
  reminder_hours_before: number[];
  review_request_delay_hours: number;
  noshow_followup_minutes: number;
  weekly_brief_day: string;
  weekly_brief_hour: number;
  ai_suggestions_enabled: boolean;
  pixel_sync_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  max_messages_per_client_days: number;
  created_at: string;
  updated_at: string;
}

export interface AutopilotAction {
  id: string;
  salon_id: string;
  type: AutopilotActionType;
  triggered_by: string;
  client_id: string | null;
  scheduled_at: string;
  executed_at: string | null;
  status: AutopilotActionStatus;
  ai_explanation: string;
  cta_label: string | null;
  cta_action: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AutopilotStats {
  id: string;
  salon_id: string;
  week_start: string;
  actions_taken: number;
  revenue_recovered: number;
  clients_reactivated: number;
  reviews_collected: number;
  created_at: string;
}

export interface AutopilotWeeklyStats {
  actions_taken: number;
  revenue_recovered: number;
  clients_reactivated: number;
  reviews_collected: number;
}

// ---- Intelligent Defaults (branża beauty PL) ----

export const DEFAULT_AUTOPILOT_CONFIG: Omit<AutopilotConfig, "id" | "salon_id" | "created_at" | "updated_at"> = {
  is_active: true,
  paused_until: null,
  retention_trigger_days: [45, 60, 75, 90],
  reminder_hours_before: [24, 2],
  review_request_delay_hours: 2,
  noshow_followup_minutes: 30,
  weekly_brief_day: "monday",
  weekly_brief_hour: 8,
  ai_suggestions_enabled: true,
  pixel_sync_enabled: false,
  quiet_hours_start: "20:00",
  quiet_hours_end: "08:00",
  max_messages_per_client_days: 7,
};

// ---- Action formatting: [INSIGHT] → [POWÓD] → [REKOMENDACJA] → [CTA] ----

export interface FormattedAction {
  insight: string;
  reason: string;
  recommendation: string;
  cta: { label: string; action: string };
}

export function formatAutopilotAction(action: AutopilotAction): FormattedAction {
  const typeLabels: Record<AutopilotActionType, string> = {
    retention: "Reaktywacja klientki",
    review: "Prośba o opinię",
    reminder: "Przypomnienie o wizycie",
    noshow: "Obsługa niestawienia się",
    revenue_suggestion: "Sugestia przychodu",
    pixel_sync: "Synchronizacja Meta Pixel",
    brief: "Podsumowanie tygodniowe",
  };

  return {
    insight: typeLabels[action.type] || action.type,
    reason: action.ai_explanation,
    recommendation: action.triggered_by,
    cta: {
      label: action.cta_label || "Wykonaj",
      action: action.cta_action || "view",
    },
  };
}

// ---- Action type icons & colors ----

export function getActionTypeIcon(type: AutopilotActionType): string {
  const icons: Record<AutopilotActionType, string> = {
    retention: "UserCheck",
    review: "Star",
    reminder: "Bell",
    noshow: "UserX",
    revenue_suggestion: "TrendingUp",
    pixel_sync: "Share2",
    brief: "FileText",
  };
  return icons[type] || "Zap";
}

export function getActionStatusColor(status: AutopilotActionStatus): string {
  const colors: Record<AutopilotActionStatus, string> = {
    pending: "bg-amber-100 text-amber-800",
    sent: "bg-blue-100 text-blue-800",
    completed: "bg-emerald-100 text-emerald-800",
    failed: "bg-red-100 text-red-800",
    dismissed: "bg-muted text-muted-foreground",
  };
  return colors[status] || "bg-muted text-muted-foreground";
}

export function getActionStatusLabel(status: AutopilotActionStatus): string {
  const labels: Record<AutopilotActionStatus, string> = {
    pending: "Oczekuje",
    sent: "Wysłano",
    completed: "Wykonano",
    failed: "Błąd",
    dismissed: "Odrzucono",
  };
  return labels[status] || status;
}

export function getActionTypeLabel(type: AutopilotActionType): string {
  const labels: Record<AutopilotActionType, string> = {
    retention: "Reaktywacja",
    review: "Opinia",
    reminder: "Przypomnienie",
    noshow: "No-show",
    revenue_suggestion: "Przychód",
    pixel_sync: "Pixel",
    brief: "Raport",
  };
  return labels[type] || type;
}

// ---- Demo mock data ----

export const MOCK_AUTOPILOT_STATS: AutopilotWeeklyStats = {
  actions_taken: 12,
  revenue_recovered: 2350,
  clients_reactivated: 4,
  reviews_collected: 7,
};

export const MOCK_TODAY_STATS = {
  actions_today: 3,
  revenue_today: 750,
};

export function generateMockActions(): AutopilotAction[] {
  const now = new Date();
  return [
    {
      id: "mock-1",
      salon_id: "demo",
      type: "retention",
      triggered_by: "Klientka nie była 67 dni (próg: 45 dni)",
      client_id: null,
      scheduled_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      executed_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      status: "sent",
      ai_explanation: "Wysłałam SMS reaktywacyjny do Marty Kowalskiej — nie była 67 dni, Twój próg to 45 dni. Statystycznie 34% klientek wraca po takiej wiadomości.",
      cta_label: "Zobacz profil klientki",
      cta_action: "view_client",
      metadata: { client_name: "Marta Kowalska", days_absent: 67 },
      created_at: now.toISOString(),
    },
    {
      id: "mock-2",
      salon_id: "demo",
      type: "review",
      triggered_by: "2h po zakończonej wizycie (automatyczne)",
      client_id: null,
      scheduled_at: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      executed_at: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      ai_explanation: "Wys\u0142a\u0142am pro\u015Bb\u0119 o opini\u0119 do Anny Nowak po wizycie \u201EBalayage\u201D \u2014 2h po zako\u0144czeniu, kiedy wra\u017Cenia s\u0105 naj\u015Bwie\u017Csze.",
      cta_label: "Zobacz opinię",
      cta_action: "view_review",
      metadata: { client_name: "Anna Nowak", service: "Balayage" },
      created_at: now.toISOString(),
    },
    {
      id: "mock-3",
      salon_id: "demo",
      type: "reminder",
      triggered_by: "24h przed wizytą (automatyczne)",
      client_id: null,
      scheduled_at: new Date(now.getTime() + 1 * 60 * 60 * 1000).toISOString(),
      executed_at: null,
      status: "pending",
      ai_explanation: "Przypomn\u0119 Katarzynie Wi\u015Bniewskiej o jutrzejszej wizycie o 14:00 \u2014 \u201EManicure hybrydowy\u201D. Zmniejsza no-show o 47%.",
      cta_label: "Edytuj wiadomość",
      cta_action: "edit_message",
      metadata: { client_name: "Katarzyna Wiśniewska", service: "Manicure hybrydowy" },
      created_at: now.toISOString(),
    },
    {
      id: "mock-4",
      salon_id: "demo",
      type: "revenue_suggestion",
      triggered_by: "Analiza wzorców rezerwacji",
      client_id: null,
      scheduled_at: now.toISOString(),
      executed_at: null,
      status: "pending",
      ai_explanation: "Srody masz oblozone w 40%. Proponuje promocje \u201ESrodowa Odnowa -15%\u201D na zabiegi pielegnacyjne \u2014 potencjal +1200 zl/mies.",
      cta_label: "Utwórz promocję",
      cta_action: "create_promotion",
      metadata: { day: "środa", potential_revenue: 1200 },
      created_at: now.toISOString(),
    },
    {
      id: "mock-5",
      salon_id: "demo",
      type: "noshow",
      triggered_by: "30 min po niestawieniu się klientki",
      client_id: null,
      scheduled_at: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      executed_at: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      status: "sent",
      ai_explanation: "Klientka Zofia Lewandowska nie stawiła się na wizytę o 10:00. Wysłałam delikatną wiadomość z propozycją przełożenia — nie oskarżam, buduję relację.",
      cta_label: "Oznacz jako problematyczną",
      cta_action: "flag_client",
      metadata: { client_name: "Zofia Lewandowska" },
      created_at: now.toISOString(),
    },
  ];
}

import { AudienceMapping, PixelEvent, PixelSyncLog, PixelAttribution, PixelHealthData } from "./types";

export const RECOMMENDED_MAPPINGS: Omit<AudienceMapping, "id" | "salon_id" | "created_at">[] = [
  { tag_name: "vip", audience_id: null, audience_name: "Beauty [Salon] VIP", is_exclusion: false },
  { tag_name: "no-show", audience_id: null, audience_name: "Beauty [Salon] No-show", is_exclusion: false },
  { tag_name: "reaktywuj", audience_id: null, audience_name: "Beauty [Salon] 90+ dni", is_exclusion: false },
  { tag_name: "nowa-klientka", audience_id: null, audience_name: "Beauty [Salon] Nowe", is_exclusion: false },
  { tag_name: "obecna-klientka-aktywna", audience_id: null, audience_name: "Beauty [Salon] Aktywne (Exclude)", is_exclusion: true },
];

export const MOCK_EVENTS: PixelEvent[] = [
  { id: "e1", salon_id: "s1", client_id: "c1", event_name: "booking_completed", event_value: 250, hashed_email: "a1b2c3...", hashed_phone: "d4e5f6...", sent_at: new Date(Date.now() - 3600000).toISOString(), source_type: "calendar" },
  { id: "e2", salon_id: "s1", client_id: "c2", event_name: "new_client", event_value: null, hashed_email: "g7h8i9...", hashed_phone: "j0k1l2...", sent_at: new Date(Date.now() - 7200000).toISOString(), source_type: "booking_widget" },
  { id: "e3", salon_id: "s1", client_id: "c3", event_name: "no_show", event_value: 180, hashed_email: "m3n4o5...", hashed_phone: null, sent_at: new Date(Date.now() - 86400000).toISOString(), source_type: "calendar" },
  { id: "e4", salon_id: "s1", client_id: "c4", event_name: "reactivation", event_value: 320, hashed_email: "p6q7r8...", hashed_phone: "s9t0u1...", sent_at: new Date(Date.now() - 172800000).toISOString(), source_type: "autopilot" },
  { id: "e5", salon_id: "s1", client_id: "c5", event_name: "booking_completed", event_value: 150, hashed_email: "v2w3x4...", hashed_phone: "y5z6a7...", sent_at: new Date(Date.now() - 259200000).toISOString(), source_type: "calendar" },
];

export const MOCK_SYNC_LOGS: PixelSyncLog[] = [
  { id: "sl1", salon_id: "s1", started_at: new Date(Date.now() - 3600000).toISOString(), completed_at: new Date(Date.now() - 3540000).toISOString(), events_sent: 12, audiences_updated: 3, errors: [], status: "completed" },
  { id: "sl2", salon_id: "s1", started_at: new Date(Date.now() - 90000000).toISOString(), completed_at: new Date(Date.now() - 89940000).toISOString(), events_sent: 8, audiences_updated: 2, errors: [], status: "completed" },
  { id: "sl3", salon_id: "s1", started_at: new Date(Date.now() - 176400000).toISOString(), completed_at: new Date(Date.now() - 176340000).toISOString(), events_sent: 15, audiences_updated: 4, errors: [{ message: "Rate limit exceeded", audience: "VIP" }], status: "partial" },
];

export const MOCK_ATTRIBUTIONS: PixelAttribution[] = [
  { id: "a1", salon_id: "s1", client_id: "c1", appointment_id: "ap1", audience_name: "Beauty [Salon] 90+ dni", ad_campaign: "Reaktywacja Maj 2026", revenue: 350, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "a2", salon_id: "s1", client_id: "c2", appointment_id: "ap2", audience_name: "Lookalike VIP 1%", ad_campaign: "Prospecting Q1", revenue: 200, created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: "a3", salon_id: "s1", client_id: "c3", appointment_id: "ap3", audience_name: "Beauty [Salon] Nowe", ad_campaign: "Brand Awareness", revenue: 180, created_at: new Date(Date.now() - 259200000).toISOString() },
];

export const MOCK_HEALTH: PixelHealthData = {
  eventMatchQuality: 78,
  eventsLast30d: 247,
  audiences: [
    { name: "Beauty [Salon] VIP", size: 124, lastUpdated: new Date(Date.now() - 3600000).toISOString(), isExclusion: false },
    { name: "Beauty [Salon] No-show", size: 38, lastUpdated: new Date(Date.now() - 3600000).toISOString(), isExclusion: false },
    { name: "Beauty [Salon] 90+ dni", size: 67, lastUpdated: new Date(Date.now() - 3600000).toISOString(), isExclusion: false },
    { name: "Beauty [Salon] Nowe", size: 215, lastUpdated: new Date(Date.now() - 3600000).toISOString(), isExclusion: false },
    { name: "Beauty [Salon] Aktywne (Exclude)", size: 342, lastUpdated: new Date(Date.now() - 3600000).toISOString(), isExclusion: true },
  ],
  score: "good",
  recommendations: [
    "Dodaj numer telefonu do większej liczby klientek — zwiększy to Event Match Quality do ~85%",
    "Audience VIP ma 124 osoby — możesz stworzyć Lookalike!",
    "Włącz wysyłanie zdarzenia Return dla klientek wracających po 30+ dniach",
  ],
};

export const MOCK_MAPPINGS: AudienceMapping[] = RECOMMENDED_MAPPINGS.map((m, i) => ({
  ...m,
  id: `m${i + 1}`,
  salon_id: "s1",
  created_at: new Date().toISOString(),
}));

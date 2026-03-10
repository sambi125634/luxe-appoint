import type { RetentionRadarClient, RetentionTimelineItem, RetentionKPIData, RetentionSequence } from "./types";

export const MOCK_RADAR_CLIENTS: RetentionRadarClient[] = [
  { id: "r1", first_name: "Anna", last_name: "Kowalska", days_inactive: 5, risk_zone: "green", last_service: "Manicure hybrydowy", last_sequence_sent: null, avatar_initials: "AK" },
  { id: "r2", first_name: "Katarzyna", last_name: "Nowak", days_inactive: 12, risk_zone: "green", last_service: "Pedicure", last_sequence_sent: null, avatar_initials: "KN" },
  { id: "r3", first_name: "Magdalena", last_name: "Wiśniewska", days_inactive: 18, risk_zone: "green", last_service: "Brwi i rzęsy", last_sequence_sent: null, avatar_initials: "MW" },
  { id: "r4", first_name: "Joanna", last_name: "Dąbrowska", days_inactive: 25, risk_zone: "green", last_service: "Masaż", last_sequence_sent: null, avatar_initials: "JD" },
  { id: "r5", first_name: "Agnieszka", last_name: "Lewandowska", days_inactive: 35, risk_zone: "yellow", last_service: "Manicure klasyczny", last_sequence_sent: "45day", avatar_initials: "AL" },
  { id: "r6", first_name: "Marta", last_name: "Kamińska", days_inactive: 42, risk_zone: "yellow", last_service: "Mezoterapia", last_sequence_sent: "45day", avatar_initials: "MK" },
  { id: "r7", first_name: "Paulina", last_name: "Zielińska", days_inactive: 48, risk_zone: "yellow", last_service: "Peeling", last_sequence_sent: null, avatar_initials: "PZ" },
  { id: "r8", first_name: "Ewa", last_name: "Szymańska", days_inactive: 55, risk_zone: "yellow", last_service: "Manicure hybrydowy", last_sequence_sent: "45day", avatar_initials: "ES" },
  { id: "r9", first_name: "Natalia", last_name: "Wróbel", days_inactive: 65, risk_zone: "orange", last_service: "Depilacja", last_sequence_sent: "60day", avatar_initials: "NW" },
  { id: "r10", first_name: "Monika", last_name: "Kozłowska", days_inactive: 72, risk_zone: "orange", last_service: "Lifting rzęs", last_sequence_sent: "60day", avatar_initials: "MK" },
  { id: "r11", first_name: "Aleksandra", last_name: "Jankowska", days_inactive: 80, risk_zone: "orange", last_service: "Manicure hybrydowy", last_sequence_sent: "75day", avatar_initials: "AJ" },
  { id: "r12", first_name: "Izabela", last_name: "Wojciechowska", days_inactive: 95, risk_zone: "red", last_service: "Masaż relaksacyjny", last_sequence_sent: "90day", avatar_initials: "IW" },
  { id: "r13", first_name: "Dorota", last_name: "Krawczyk", days_inactive: 110, risk_zone: "red", last_service: "Pedicure", last_sequence_sent: "90day", avatar_initials: "DK" },
  { id: "r14", first_name: "Beata", last_name: "Piotrowska", days_inactive: 130, risk_zone: "red", last_service: "Brwi", last_sequence_sent: "90day", avatar_initials: "BP" },
  { id: "r15", first_name: "Karolina", last_name: "Grabowska", days_inactive: 22, risk_zone: "green", last_service: "Makijaż permanentny", last_sequence_sent: null, avatar_initials: "KG" },
];

const now = new Date();
const h = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3600000).toISOString();

export const MOCK_TIMELINE: RetentionTimelineItem[] = [
  { id: "t1", timestamp: h(2), client_name: "Marta K.", days_inactive: 67, channel: "sms", action: "opened", ai_explanation: "Marta preferuje SMS — wysłano o 14:23, bo wtedy najczęściej otwiera wiadomości." },
  { id: "t2", timestamp: h(5), client_name: "Marta K.", days_inactive: 67, channel: "sms", action: "booked", revenue: 250, ai_explanation: "Marta zarezerwowała wizytę po sekwencji reaktywacyjnej 60-dniowej. Odzyskano 250 zł." },
  { id: "t3", timestamp: h(8), client_name: "Agnieszka L.", days_inactive: 45, channel: "email", action: "sent", ai_explanation: "Agnieszka nie otwiera SMS — wysłano email z łagodnym tonem (sekwencja 45-dniowa)." },
  { id: "t4", timestamp: h(24), client_name: "Ewa S.", days_inactive: 52, channel: "sms", action: "clicked", ai_explanation: "Ewa kliknęła link do rezerwacji w SMS-ie. Czekamy na finalizację." },
  { id: "t5", timestamp: h(28), client_name: "Natalia W.", days_inactive: 63, channel: "email", action: "opened", ai_explanation: "Natalia otworzyła email edukacyjny o efektach mezoterapii (sekwencja 60-dniowa)." },
  { id: "t6", timestamp: h(48), client_name: "Monika K.", days_inactive: 75, channel: "sms", action: "sent", ai_explanation: "Monika — sekwencja 75-dniowa z ofertą powrotu. Countdown 48h aktywny." },
  { id: "t7", timestamp: h(52), client_name: "Aleksandra J.", days_inactive: 78, channel: "whatsapp", action: "opened", ai_explanation: "Aleksandra preferuje WhatsApp — wysłano ekskluzywną ofertę z countdown 48h." },
  { id: "t8", timestamp: h(72), client_name: "Izabela W.", days_inactive: 90, channel: "sms", action: "sent", ai_explanation: "Izabela — ostatnia szansa. Auto-tag 'reaktywuj-kampanią' dodany do CRM." },
  { id: "t9", timestamp: h(96), client_name: "Paulina Z.", days_inactive: 46, channel: "email", action: "booked", revenue: 180, ai_explanation: "Paulina zarezerwowała po emailu reaktywacyjnym. Preferuje piątki 15:00." },
  { id: "t10", timestamp: h(120), client_name: "Dorota K.", days_inactive: 95, channel: "sms", action: "sent", ai_explanation: "Dorota — synchronizacja do Custom Audience Meta. Wartość potencjalna: 350 zł." },
];

export const MOCK_KPI: RetentionKPIData = {
  messages_sent: 47,
  open_rate: 72,
  bookings_from_retention: 8,
  revenue_recovered: 3750,
  clients_in_campaign: 15,
};

export const MOCK_SEQUENCES: RetentionSequence[] = [
  {
    id: "seq1", salon_id: "demo", sequence_key: "proactive", is_active: true, trigger_days: 0,
    message_template: "[Imię], minęło trochę czasu od Twojej wizyty [data]. Czy chcesz zarezerwować kolejną? Mam dla Ciebie wolne sloty.",
    tone: "warm", include_incentive: false, incentive_details: {}, countdown_hours: null,
    created_at: "", updated_at: "",
  },
  {
    id: "seq2", salon_id: "demo", sequence_key: "45day", is_active: true, trigger_days: 45,
    message_template: "[Imię], tęsknimy za Tobą 🌸 Jak się miewasz? Mamy wolne terminy w tym tygodniu — zajrzysz?",
    tone: "warm", include_incentive: false, incentive_details: {}, countdown_hours: null,
    created_at: "", updated_at: "",
  },
  {
    id: "seq3", salon_id: "demo", sequence_key: "60day", is_active: true, trigger_days: 60,
    message_template: "[Imię], pamiętasz że robiłaś u nas [zabieg]? Efekty utrzymują się zwykle [X tygodni] — warto odświeżyć!",
    tone: "educational", include_incentive: false, incentive_details: {}, countdown_hours: null,
    created_at: "", updated_at: "",
  },
  {
    id: "seq4", salon_id: "demo", sequence_key: "75day", is_active: true, trigger_days: 75,
    message_template: "Hej [Imię], przygotowałam specjalną ofertę powrotu — ważną tylko 48 godzin!",
    tone: "exclusive", include_incentive: true, incentive_details: { discount_percent: 20 }, countdown_hours: 48,
    created_at: "", updated_at: "",
  },
  {
    id: "seq5", salon_id: "demo", sequence_key: "90day", is_active: true, trigger_days: 90,
    message_template: "[Imię], czy wszystko w porządku? Dawno Cię nie widziałyśmy...",
    tone: "caring", include_incentive: false, incentive_details: {}, countdown_hours: null,
    created_at: "", updated_at: "",
  },
];

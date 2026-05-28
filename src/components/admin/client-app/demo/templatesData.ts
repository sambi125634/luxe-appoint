export interface MessageTemplate {
  id: string;
  icon: string;
  name: string;
  enabled: boolean;
  lastSentDays: number | null;
  body: string;
}

export const DEMO_SMS_TEMPLATES: MessageTemplate[] = [
  { id: "sms-confirm", icon: "✅", name: "Potwierdzenie rezerwacji", enabled: true, lastSentDays: 0,
    body: "Cześć {IMIĘ}! Potwierdzamy wizytę {DATA} o {GODZINA} w {SALON}. Do zobaczenia! 💜" },
  { id: "sms-24h", icon: "⏰", name: "Przypomnienie 24h przed", enabled: true, lastSentDays: 1,
    body: "{IMIĘ}, jutro o {GODZINA} czeka na Ciebie {USŁUGA} w {SALON}. Nie możesz? Anuluj tutaj: {LINK}" },
  { id: "sms-2h", icon: "⏰", name: "Przypomnienie 2h przed", enabled: true, lastSentDays: 0,
    body: "Już za 2 godziny! Twoja wizyta o {GODZINA} w {SALON}. Do zobaczenia! 💅" },
  { id: "sms-thanks", icon: "🙏", name: "Podziękowanie po wizycie", enabled: true, lastSentDays: 2,
    body: "Dziękujemy za wizytę! Mamy nadzieję że jesteś zadowolona 💜 Zarezerwuj następną: {LINK}" },
  { id: "sms-review", icon: "⭐", name: "Prośba o opinię Google", enabled: true, lastSentDays: 3,
    body: "{IMIĘ}, czy możesz zostawić nam opinię? To ogromna pomoc: {GOOGLE_LINK} Dziękujemy! — {SALON}" },
  { id: "sms-react", icon: "👻", name: "Reaktywacja 45 dni", enabled: true, lastSentDays: 5,
    body: "Tęsknimy! Ostatnia wizyta była 45 dni temu. Zarezerwuj i wróć: {LINK} 💜" },
  { id: "sms-bday", icon: "🎂", name: "Urodzinowa", enabled: true, lastSentDays: 7,
    body: "Wszystkiego najlepszego {IMIĘ}! 🎂 Masz od nas -15% na urodzinową wizytę (ważne 7 dni): {LINK}" },
  { id: "sms-noshow", icon: "🪑", name: "Follow-up no-show", enabled: false, lastSentDays: null,
    body: "Hej {IMIĘ}, zauważyłyśmy że nie mogłaś dzisiaj przyjść. Zarezerwuj nowy termin: {LINK}" },
];

export const DEMO_PUSH_TEMPLATES: MessageTemplate[] = [
  { id: "push-2h", icon: "⏰", name: "Przypomnienie 2h przed", enabled: true, lastSentDays: 0,
    body: "Twoja wizyta za 2 godziny! 💅" },
  { id: "push-confirm", icon: "✅", name: "Potwierdzenie", enabled: true, lastSentDays: 0,
    body: "Wizyta potwierdzona ✓" },
  { id: "push-flash", icon: "⚡", name: "Flash slot", enabled: true, lastSentDays: 1,
    body: "Właśnie zwolnił się termin! Zarezerwuj szybko ⚡" },
  { id: "push-bday", icon: "🎂", name: "Urodziny", enabled: true, lastSentDays: 4,
    body: "Mamy dla Ciebie urodzinową niespodziankę 🎂" },
  { id: "push-review", icon: "⭐", name: "Nowa opinia", enabled: true, lastSentDays: 2,
    body: "Klientka zostawiła Ci 5★! ⭐⭐⭐⭐⭐" },
];

export const DEMO_EMAIL_TEMPLATES = [
  { id: "email-confirm", icon: "✉️", name: "Potwierdzenie rezerwacji", enabled: true, lastSentDays: 0,
    subject: "Potwierdzenie wizyty w {SALON}",
    body: "Cześć {IMIĘ},\n\nPotwierdzamy Twoją wizytę w dniu {DATA} o godzinie {GODZINA}.\nUsługa: {USŁUGA}\n\nDo zobaczenia!\nZespół {SALON}" },
  { id: "email-summary", icon: "📋", name: "Podsumowanie po wizycie", enabled: true, lastSentDays: 1,
    subject: "Dziękujemy za wizytę! 💜",
    body: "Cześć {IMIĘ},\n\nDziękujemy że nas odwiedziłaś. Twoja następna wizyta zalecana za 4 tygodnie.\nZarezerwuj: {LINK}\n\n{SALON}" },
  { id: "email-winback", icon: "💌", name: "Reactivation — długa nieobecność", enabled: true, lastSentDays: 14,
    subject: "Tęsknimy! Wróć do nas z -20%",
    body: "Cześć {IMIĘ},\n\nDawno Cię nie widziałyśmy. Mamy dla Ciebie specjalną zniżkę -20% ważną przez 7 dni.\nKod: COMEBACK20\n\n{SALON}" },
];

export const DEMO_BROADCAST_HISTORY = [
  { id: "1", date: "20 maj", title: "Promocja majowa 🌸", recipients: 134, opens: 89, openRate: 66, clicks: 23, clickRate: 17 },
  { id: "2", date: "5 maj", title: "Nowe usługi!", recipients: 187, opens: 102, openRate: 55, clicks: 31, clickRate: 17 },
  { id: "3", date: "15 kwi", title: "Wielkanocna zniżka 🐣", recipients: 156, opens: 98, openRate: 63, clicks: 28, clickRate: 18 },
];

export const DEMO_APP_VS_PHONE_CHART = [
  { month: "Gru", app: 18, phone: 42 },
  { month: "Sty", app: 27, phone: 38 },
  { month: "Lut", app: 41, phone: 32 },
  { month: "Mar", app: 52, phone: 28 },
  { month: "Kwi", app: 58, phone: 26 },
  { month: "Maj", app: 67, phone: 22 },
];

export const DEMO_TOP_APP_SERVICES = [
  { name: "Manicure hybrydowy", bookings: 48 },
  { name: "Pedicure klasyczny", bookings: 31 },
  { name: "Oczyszczanie twarzy", bookings: 24 },
  { name: "Laminacja brwi", bookings: 18 },
  { name: "Masaż relaksacyjny", bookings: 12 },
];

export const DEMO_AUDIENCE_SEGMENTS = [
  { id: "all", label: "Wszystkie klientki", count: 187, recommended: false },
  { id: "active", label: "Aktywne — wizyta w ostatnich 30 dniach", count: 134, recommended: true },
  { id: "vip", label: "VIP — 5+ wizyt", count: 67, recommended: false },
  { id: "custom", label: "Własna grupa", count: 0, recommended: false },
];

export const EMOJI_QUICK = ["💜","🌸","✨","💅","🎁","⭐","🔥","⚡","🎂","💎","🪄","☀️","🌿","🥂","😍","🙌","👑","💋","🍓","🌟"];

export const VARIABLES = ["{IMIĘ}","{DATA}","{GODZINA}","{USŁUGA}","{SALON}","{LINK}","{GOOGLE_LINK}"];
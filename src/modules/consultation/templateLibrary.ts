import type { ConsultationField } from "@/hooks/useConsultations";

export type TemplateCategoryId =
  | "popular"
  | "nails"
  | "face"
  | "aesthetic"
  | "hair"
  | "body"
  | "eyes"
  | "clinic"
  | "rodo"
  | "extras";

export interface TemplateCategory {
  id: TemplateCategoryId;
  label: string;
  emoji: string;
  description: string;
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { id: "popular", label: "Najpopularniejsze", emoji: "🌟", description: "Najczęściej używane karty" },
  { id: "nails", label: "Paznokcie", emoji: "💅", description: "Manicure, pedicure, stylizacja" },
  { id: "face", label: "Twarz", emoji: "💆", description: "Kosmetyka, peelingi, oczyszczanie" },
  { id: "aesthetic", label: "Medycyna estetyczna", emoji: "💉", description: "Botoks, wypełniacze, mezoterapia" },
  { id: "hair", label: "Włosy", emoji: "💇", description: "Koloryzacja, strzyżenie, trychologia" },
  { id: "body", label: "Ciało & SPA", emoji: "🌸", description: "Masaż, depilacja, modelowanie" },
  { id: "eyes", label: "Brwi & Rzęsy", emoji: "👁", description: "Stylizacja oprawy oka" },
  { id: "clinic", label: "Klinika", emoji: "🏥", description: "Wywiady medyczne, przeciwwskazania" },
  { id: "rodo", label: "RODO & Zgody", emoji: "📋", description: "Zgody prawne i marketingowe" },
  { id: "extras", label: "Pre & Post wizyta", emoji: "🎁", description: "Ankiety, briefy, zalecenia" },
];

export interface TemplateDefinition {
  id: string;
  name: string;
  emoji: string;
  category: TemplateCategoryId;
  /** Maps to ConsultationField category in DB (general/face/nails/hair/body/medical/rodo/custom) */
  dbCategory: "general" | "face" | "nails" | "hair" | "body" | "medical" | "rodo" | "custom";
  description: string;
  estimatedMinutes: number;
  badge?: "Najpopularniejsze" | "RODO" | "Medyczne" | "Nowe";
  fields: Omit<ConsultationField, "id">[];
}

/** Helpers */
const t = (label: string, required = true): Omit<ConsultationField, "id"> => ({ type: "text", label, required });
const ta = (label: string, required = false): Omit<ConsultationField, "id"> => ({ type: "textarea", label, required });
const yn = (label: string, required = true): Omit<ConsultationField, "id"> => ({ type: "select", label, required, options: ["Tak", "Nie"] });
const sel = (label: string, options: string[], required = true): Omit<ConsultationField, "id"> => ({ type: "select", label, required, options });
const sl = (label: string, min = 1, max = 10): Omit<ConsultationField, "id"> => ({ type: "slider", label, required: false, min, max });
const sig = (label: string): Omit<ConsultationField, "id"> => ({ type: "signature", label, required: true });

/** Reusable blocks */
const HEALTH_BASIC: Omit<ConsultationField, "id">[] = [
  ta("Czy przyjmuje leki na stałe? Jakie?"),
  yn("Czy jest w ciąży lub karmi piersią?"),
  ta("Choroby przewlekłe (cukrzyca, tarczyca, autoimmunologiczne)?"),
  ta("Alergie (kosmetyki, leki, lateks)?"),
];

const RODO_CORE: Omit<ConsultationField, "id">[] = [
  yn("Zgoda na przetwarzanie danych osobowych (RODO)"),
  yn("Zgoda na kontakt marketingowy (SMS / e-mail)"),
  sig("Podpis klientki"),
];

export const TEMPLATE_LIBRARY: TemplateDefinition[] = [
  // ===== POPULAR =====
  {
    id: "general-first-visit",
    name: "Ogólna karta pierwszej wizyty",
    emoji: "✨",
    category: "popular",
    dbCategory: "general",
    description: "Uniwersalny wywiad na pierwszą wizytę w salonie",
    estimatedMinutes: 3,
    badge: "Najpopularniejsze",
    fields: [
      t("Skąd nas znasz?"),
      ...HEALTH_BASIC,
      sl("Wrażliwość skóry (1-10)", 1, 10),
      ta("Twoje oczekiwania po wizycie?"),
      ...RODO_CORE,
    ],
  },
  // ===== NAILS =====
  {
    id: "nails-hybrid",
    name: "Manicure hybrydowy",
    emoji: "💅",
    category: "nails",
    dbCategory: "nails",
    description: "Klasyczny wywiad przed manicure hybrydowym",
    estimatedMinutes: 2,
    badge: "Najpopularniejsze",
    fields: [
      yn("Czy ma grzybicę lub stan zapalny paznokci?"),
      yn("Uczulenie na żel / hybrydę?"),
      sel("Preferowany kształt", ["Migdał", "Kwadrat", "Owal", "Balerina", "Naturalny"]),
      sel("Długość", ["Krótkie", "Średnie", "Długie"]),
      ta("Inspiracje / kolory?", false),
      yn("Zgoda na dokumentację fotograficzną"),
    ],
  },
  {
    id: "nails-japanese",
    name: "Manicure japoński / SPA",
    emoji: "🌿",
    category: "nails",
    dbCategory: "nails",
    description: "Pielęgnacja regenerująca naturalną płytkę",
    estimatedMinutes: 2,
    fields: [
      sl("Stan płytki paznokcia (1-10)", 1, 10),
      yn("Skłonność do łamliwości?"),
      ta("Ostatnie zabiegi paznokciowe?", false),
      ta("Stosowane odżywki / oleje?", false),
    ],
  },
  {
    id: "nails-gel-extensions",
    name: "Przedłużanie żelem / akrylem",
    emoji: "💎",
    category: "nails",
    dbCategory: "nails",
    description: "Wywiad przed budową paznokci",
    estimatedMinutes: 3,
    fields: [
      sel("Materiał", ["Żel", "Akryl", "Akrylożel"]),
      sel("Długość docelowa", ["Naturalna", "+5 mm", "+10 mm", "+15 mm i więcej"]),
      sel("Kształt", ["Migdał", "Kwadrat", "Balerina", "Stiletto"]),
      yn("Wcześniej miała przedłużane paznokcie?"),
      yn("Alergia na żel / akryl?"),
      ta("Inspiracje / zdobienia?", false),
    ],
  },
  {
    id: "pedi-medical",
    name: "Pedicure leczniczy",
    emoji: "🦶",
    category: "nails",
    dbCategory: "nails",
    description: "Stopa cukrzycowa, modzele, wrastający paznokieć",
    estimatedMinutes: 4,
    fields: [
      yn("Czy choruje na cukrzycę?"),
      yn("Czy ma problemy z krążeniem?"),
      ta("Dolegliwości (modzele, odciski, wrastający paznokieć)?"),
      yn("Grzybica paznokci lub skóry?"),
      ta("Stosowane leki / opatrunki?", false),
    ],
  },

  // ===== FACE =====
  {
    id: "face-first",
    name: "Zabieg na twarz — pierwsza wizyta",
    emoji: "💆",
    category: "face",
    dbCategory: "face",
    description: "Wywiad kosmetyczny + ocena skóry",
    estimatedMinutes: 4,
    badge: "Najpopularniejsze",
    fields: [
      sel("Typ skóry", ["Sucha", "Tłusta", "Mieszana", "Normalna", "Wrażliwa"]),
      sl("Wrażliwość skóry (1-10)", 1, 10),
      yn("Stosuje retinoidy / AHA / BHA?"),
      ta("Codzienna pielęgnacja domowa?"),
      ta("Główne problemy skórne?"),
      yn("Wrażliwa na słońce?"),
      ta("Oczekiwany efekt po serii zabiegów?"),
      ...RODO_CORE,
    ],
  },
  {
    id: "face-peeling",
    name: "Peeling chemiczny",
    emoji: "🧪",
    category: "face",
    dbCategory: "face",
    description: "Wywiad przed peelingiem kwasami",
    estimatedMinutes: 4,
    fields: [
      sel("Rodzaj peelingu", ["Migdałowy", "Pirogronowy", "Salicylowy", "Glikolowy", "TCA", "Inny"]),
      yn("Aktywna opryszczka?"),
      yn("Świeże opalanie / solarium (ostatnie 14 dni)?"),
      yn("Stosuje retinoidy / izotretynoinę?"),
      ta("Wcześniejsze reakcje skórne na peelingi?", false),
      sig("Zgoda na zabieg peelingu"),
    ],
  },
  {
    id: "face-mezo",
    name: "Mezoterapia igłowa",
    emoji: "💧",
    category: "face",
    dbCategory: "face",
    description: "Wywiad przed mezoterapią mikroigłową",
    estimatedMinutes: 4,
    fields: [
      ...HEALTH_BASIC,
      yn("Skłonność do bliznowców (keloidów)?"),
      yn("Zaburzenia krzepliwości krwi?"),
      yn("Świeża opalenizna?"),
      sig("Zgoda na zabieg mezoterapii"),
    ],
  },
  {
    id: "face-hydro",
    name: "Oczyszczanie wodorowe / kawitacja",
    emoji: "💦",
    category: "face",
    dbCategory: "face",
    description: "Krótki wywiad przed oczyszczaniem",
    estimatedMinutes: 2,
    fields: [
      sel("Typ skóry", ["Sucha", "Tłusta", "Mieszana", "Wrażliwa"]),
      yn("Aktywny trądzik ropny?"),
      yn("Rozrusznik serca lub metalowe implanty (kawitacja)?"),
      ta("Główne problemy do rozwiązania?"),
    ],
  },
  {
    id: "face-brows-henna",
    name: "Henna / regulacja / laminacja brwi",
    emoji: "🎨",
    category: "face",
    dbCategory: "face",
    description: "Stylizacja oprawy brwi",
    estimatedMinutes: 2,
    fields: [
      yn("Uczulenie na hennę / barwniki?"),
      sel("Preferowana intensywność", ["Naturalna", "Średnia", "Mocna"]),
      ta("Inspiracje kształtu?", false),
      yn("Zgoda na próbę uczuleniową"),
    ],
  },

  // ===== AESTHETIC MEDICINE =====
  {
    id: "aesth-botox",
    name: "Botoks (toksyna botulinowa)",
    emoji: "💉",
    category: "aesthetic",
    dbCategory: "medical",
    description: "Rozszerzony wywiad lekarski",
    estimatedMinutes: 6,
    badge: "Medyczne",
    fields: [
      ...HEALTH_BASIC,
      yn("Choroby nerwowo-mięśniowe (miastenia, ALS)?"),
      yn("Stosuje aminoglikozydy / leki obniżające płytki krwi?"),
      yn("Świeży zabieg stomatologiczny (ostatnie 14 dni)?"),
      ta("Obszary do ostrzyknięcia?"),
      sig("Świadoma zgoda na zabieg"),
    ],
  },
  {
    id: "aesth-filler",
    name: "Kwas hialuronowy — usta / policzki",
    emoji: "💋",
    category: "aesthetic",
    dbCategory: "medical",
    description: "Wywiad przed wypełniaczem",
    estimatedMinutes: 5,
    fields: [
      ...HEALTH_BASIC,
      yn("Aktywna opryszczka?"),
      yn("Wcześniej miała wypełniacze (gdzie, kiedy)?"),
      ta("Oczekiwany efekt (ilość ml, kształt)?"),
      sig("Świadoma zgoda na zabieg wypełniacza"),
    ],
  },
  {
    id: "aesth-prp",
    name: "Mezoterapia osoczem (PRP)",
    emoji: "🩸",
    category: "aesthetic",
    dbCategory: "medical",
    description: "Wywiad przed zabiegiem z krwi własnej",
    estimatedMinutes: 5,
    fields: [
      ...HEALTH_BASIC,
      yn("Choroby krwi / nowotworowe?"),
      yn("Antybiotykoterapia w ostatnich 14 dniach?"),
      yn("Posiłek max 2h przed zabiegiem?"),
      sig("Świadoma zgoda na pobranie krwi i zabieg"),
    ],
  },
  {
    id: "aesth-lipolysis",
    name: "Lipoliza iniekcyjna",
    emoji: "⚗️",
    category: "aesthetic",
    dbCategory: "medical",
    description: "Modelowanie zatok tłuszczowych",
    estimatedMinutes: 5,
    fields: [
      ...HEALTH_BASIC,
      yn("Choroby wątroby / nerek?"),
      ta("Obszary do iniekcji?"),
      sig("Świadoma zgoda na zabieg"),
    ],
  },

  // ===== HAIR =====
  {
    id: "hair-color",
    name: "Koloryzacja / refleksy",
    emoji: "🎨",
    category: "hair",
    dbCategory: "hair",
    description: "Wywiad przed farbowaniem",
    estimatedMinutes: 3,
    fields: [
      ta("Aktualny kolor i ostatnie zabiegi chemiczne?"),
      yn("Uczulenie na farbę / PPD?"),
      sel("Stan włosów", ["Suche", "Normalne", "Przetłuszczone", "Zniszczone"]),
      ta("Oczekiwany efekt (zdjęcia inspiracji)?", false),
      yn("Zgoda na próbę uczuleniową"),
    ],
  },
  {
    id: "hair-keratin",
    name: "Keratynowe prostowanie / botox",
    emoji: "✨",
    category: "hair",
    dbCategory: "hair",
    description: "Regeneracja i wygładzanie",
    estimatedMinutes: 3,
    fields: [
      sel("Typ włosów", ["Cienkie", "Średnie", "Grube"]),
      ta("Ostatnie zabiegi chemiczne (data, rodzaj)?"),
      yn("Włosy farbowane / rozjaśniane?"),
      ta("Oczekiwany efekt?", false),
    ],
  },
  {
    id: "hair-cut",
    name: "Strzyżenie damskie / męskie",
    emoji: "✂️",
    category: "hair",
    dbCategory: "hair",
    description: "Brief stylistyczny",
    estimatedMinutes: 2,
    fields: [
      sel("Długość docelowa", ["Skrócenie 1-3 cm", "Skrócenie 5+ cm", "Zmiana fryzury"]),
      yn("Grzywka?"),
      ta("Inspiracje (zdjęcia)?", false),
      ta("Codzienne układanie — czego unikać?", false),
    ],
  },
  {
    id: "hair-trychology",
    name: "Trychologia — wywiad",
    emoji: "🔬",
    category: "hair",
    dbCategory: "hair",
    description: "Diagnoza problemów skóry głowy",
    estimatedMinutes: 5,
    fields: [
      sel("Główny problem", ["Wypadanie", "Łupież", "Łojotok", "Świąd", "Cienkie włosy", "Inne"]),
      ta("Od jak dawna trwa problem?"),
      ...HEALTH_BASIC,
      ta("Stosowane szampony / kosmetyki?", false),
    ],
  },

  // ===== BODY =====
  {
    id: "body-massage-relax",
    name: "Masaż relaksacyjny",
    emoji: "💆‍♀️",
    category: "body",
    dbCategory: "body",
    description: "Krótki wywiad przed masażem",
    estimatedMinutes: 2,
    fields: [
      ta("Obszary z napięciem / bólem?"),
      sel("Preferowana siła", ["Delikatna", "Średnia", "Mocna"]),
      yn("Ciąża?"),
      yn("Świeże urazy / siniaki?"),
      sel("Aromat olejku", ["Lawenda", "Eukaliptus", "Cytrusy", "Bezzapachowy"], false),
    ],
  },
  {
    id: "body-massage-medical",
    name: "Masaż leczniczy",
    emoji: "🩹",
    category: "body",
    dbCategory: "body",
    description: "Wywiad ortopedyczny",
    estimatedMinutes: 4,
    fields: [
      ta("Główna dolegliwość bólowa?"),
      ta("Przebyte urazy / operacje?"),
      yn("Dyskopatia / zmiany w kręgosłupie?"),
      yn("Choroby reumatyczne?"),
      yn("Ciąża?"),
    ],
  },
  {
    id: "body-wax",
    name: "Depilacja woskiem",
    emoji: "🪒",
    category: "body",
    dbCategory: "body",
    description: "Wywiad przed depilacją",
    estimatedMinutes: 2,
    fields: [
      ta("Obszary depilacji?"),
      yn("Stosuje retinoidy?"),
      yn("Świeże opalanie (ostatnie 48h)?"),
      yn("Ciąża?"),
      ta("Reakcje skórne przy poprzedniej depilacji?", false),
    ],
  },
  {
    id: "body-laser",
    name: "Depilacja laserowa",
    emoji: "⚡",
    category: "body",
    dbCategory: "medical",
    description: "Kwalifikacja do zabiegu laserowego",
    estimatedMinutes: 4,
    badge: "Medyczne",
    fields: [
      sel("Fototyp skóry (Fitzpatrick)", ["I", "II", "III", "IV", "V", "VI"]),
      ...HEALTH_BASIC,
      yn("Świeże opalanie / solarium (ostatnie 4 tyg.)?"),
      yn("Tatuaże w obszarze zabiegu?"),
      yn("Stosuje leki światłouczulające?"),
      sig("Świadoma zgoda na zabieg laserowy"),
    ],
  },
  {
    id: "body-lymph",
    name: "Drenaż limfatyczny",
    emoji: "🌊",
    category: "body",
    dbCategory: "body",
    description: "Wywiad przed drenażem",
    estimatedMinutes: 3,
    fields: [
      yn("Choroby układu krążenia / zakrzepica?"),
      yn("Choroby nowotworowe?"),
      yn("Ciąża?"),
      ta("Główny cel zabiegu?"),
    ],
  },

  // ===== EYES =====
  {
    id: "eyes-lashes-1to1",
    name: "Przedłużanie rzęs 1:1 / objętościowe",
    emoji: "👁",
    category: "eyes",
    dbCategory: "face",
    description: "Stylizacja rzęs metodą sztuczną",
    estimatedMinutes: 3,
    fields: [
      sel("Metoda", ["1:1 (klasyczne)", "2-3D", "Mega volume"]),
      sel("Efekt", ["Naturalny", "Kotek", "Lalka", "Lis"]),
      sel("Długość (mm)", ["8-10", "10-12", "12-14", "14+"]),
      yn("Nosi soczewki kontaktowe?"),
      yn("Uczulenie na klej?"),
      yn("Wcześniej miała przedłużane rzęsy?"),
    ],
  },
  {
    id: "eyes-lift-lam",
    name: "Lifting rzęs + laminacja",
    emoji: "✨",
    category: "eyes",
    dbCategory: "face",
    description: "Lifting i koloryzacja rzęs",
    estimatedMinutes: 3,
    fields: [
      yn("Uczulenie na henne / preparaty do liftingu?"),
      sel("Pożądany efekt", ["Naturalny", "Mocny zakręt"]),
      yn("Świeży zabieg na okolicy oka (ostatnie 14 dni)?"),
    ],
  },
  {
    id: "eyes-brows-powder",
    name: "Pudrowe brwi (makijaż permanentny)",
    emoji: "🖌",
    category: "eyes",
    dbCategory: "medical",
    description: "Wywiad przed pigmentacją",
    estimatedMinutes: 5,
    badge: "Medyczne",
    fields: [
      ...HEALTH_BASIC,
      yn("Skłonność do bliznowców?"),
      yn("Zaburzenia krzepliwości?"),
      yn("Wcześniejszy makijaż permanentny?"),
      sig("Świadoma zgoda na zabieg pigmentacji"),
    ],
  },

  // ===== CLINIC =====
  {
    id: "clinic-medical-deep",
    name: "Wywiad medyczny rozszerzony",
    emoji: "🏥",
    category: "clinic",
    dbCategory: "medical",
    description: "Pełny wywiad dla kliniki estetycznej",
    estimatedMinutes: 6,
    badge: "Medyczne",
    fields: [
      ...HEALTH_BASIC,
      yn("Cukrzyca?"),
      yn("Choroby tarczycy?"),
      yn("Rozrusznik serca / implanty?"),
      yn("Padaczka?"),
      yn("Choroby autoimmunologiczne?"),
      yn("Zaburzenia krzepliwości / leki przeciwzakrzepowe?"),
      ta("Inne istotne informacje?", false),
      sig("Potwierdzenie prawdziwości danych"),
    ],
  },
  {
    id: "clinic-first-patient",
    name: "Karta pacjenta — pierwsza wizyta w klinice",
    emoji: "🩺",
    category: "clinic",
    dbCategory: "medical",
    description: "Rejestracja nowego pacjenta",
    estimatedMinutes: 5,
    fields: [
      t("Lekarz prowadzący (jeśli dotyczy)", false),
      ta("Powód wizyty?"),
      ...HEALTH_BASIC,
      ta("Aktualnie przyjmowane suplementy?", false),
      ...RODO_CORE,
    ],
  },

  // ===== RODO =====
  {
    id: "rodo-marketing",
    name: "Zgoda RODO + marketing",
    emoji: "📋",
    category: "rodo",
    dbCategory: "rodo",
    description: "Podstawowy pakiet zgód",
    estimatedMinutes: 1,
    badge: "RODO",
    fields: [
      yn("Zgoda na przetwarzanie danych osobowych (RODO)"),
      yn("Zgoda na kontakt SMS"),
      yn("Zgoda na kontakt e-mail"),
      sig("Podpis klientki"),
    ],
  },
  {
    id: "rodo-photo",
    name: "Zgoda na dokumentację foto przed/po",
    emoji: "📸",
    category: "rodo",
    dbCategory: "rodo",
    description: "Foto do dokumentacji i social media",
    estimatedMinutes: 1,
    badge: "RODO",
    fields: [
      yn("Zgoda na wykonanie zdjęć przed/po do dokumentacji"),
      yn("Zgoda na publikację zdjęć w mediach społecznościowych"),
      yn("Zgoda na publikację z zakrytą twarzą"),
      sig("Podpis klientki"),
    ],
  },
  {
    id: "rodo-minor",
    name: "Zgoda dla osoby niepełnoletniej",
    emoji: "👨‍👧",
    category: "rodo",
    dbCategory: "rodo",
    description: "Zgoda rodzica / opiekuna prawnego",
    estimatedMinutes: 2,
    badge: "RODO",
    fields: [
      t("Imię i nazwisko dziecka"),
      t("Data urodzenia dziecka"),
      t("Imię i nazwisko rodzica / opiekuna"),
      ta("Rodzaj zabiegu, na który wyrażam zgodę"),
      sig("Podpis rodzica / opiekuna prawnego"),
    ],
  },
  {
    id: "rodo-health-data",
    name: "Klauzula danych zdrowotnych",
    emoji: "🔐",
    category: "rodo",
    dbCategory: "rodo",
    description: "Zgoda na przetwarzanie danych wrażliwych",
    estimatedMinutes: 1,
    badge: "RODO",
    fields: [
      yn("Zgoda na przetwarzanie danych dotyczących zdrowia w celu wykonania zabiegu"),
      yn("Zostałam poinformowana o przysługujących mi prawach (dostęp, sprostowanie, usunięcie)"),
      sig("Podpis klientki"),
    ],
  },

  // ===== EXTRAS =====
  {
    id: "extras-post-survey",
    name: "Ankieta zadowolenia po wizycie",
    emoji: "⭐",
    category: "extras",
    dbCategory: "general",
    description: "NPS + krótka opinia",
    estimatedMinutes: 1,
    fields: [
      sl("Jak oceniasz wizytę? (1-10)", 1, 10),
      sl("Czy polecisz nas znajomym? (0-10)", 0, 10),
      ta("Co możemy poprawić?", false),
      ta("Co Ci się szczególnie podobało?", false),
    ],
  },
  {
    id: "extras-makeup-brief",
    name: "Brief — makijaż okolicznościowy",
    emoji: "💄",
    category: "extras",
    dbCategory: "general",
    description: "Sesja, ślub, event",
    estimatedMinutes: 3,
    fields: [
      sel("Okazja", ["Ślub", "Sesja zdjęciowa", "Wieczór", "Event", "Inne"]),
      ta("Stylizacja / kolor sukienki?"),
      sel("Preferowany styl", ["Naturalny", "Glam", "Smoky eye", "Cut crease", "Klasyczny"]),
      yn("Wrażliwe oczy / soczewki?"),
      ta("Inspiracje (zdjęcia)?", false),
    ],
  },
  {
    id: "extras-aftercare",
    name: "Zalecenia pielęgnacyjne po zabiegu",
    emoji: "📝",
    category: "extras",
    dbCategory: "general",
    description: "Checklista do podpisu po zabiegu",
    estimatedMinutes: 1,
    fields: [
      yn("Zapoznałam się z zaleceniami pielęgnacyjnymi"),
      yn("Wiem, czego unikać przez 24-48h po zabiegu"),
      yn("Otrzymałam kontakt w razie pytań"),
      sig("Podpis klientki"),
    ],
  },
];

export function getTemplatesByCategory(cat: TemplateCategoryId): TemplateDefinition[] {
  if (cat === "popular") {
    return TEMPLATE_LIBRARY.filter((t) => t.badge === "Najpopularniejsze");
  }
  return TEMPLATE_LIBRARY.filter((t) => t.category === cat);
}

export function findTemplate(id: string): TemplateDefinition | undefined {
  return TEMPLATE_LIBRARY.find((t) => t.id === id);
}

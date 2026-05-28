## Cel

Dać właścicielom salonów pełną swobodę konfiguracji okna rezerwacji, dodać czytelne objaśnienia trudniejszych pojęć i naprawić mylącą opcję „potwierdzenia telefonicznego".

Zakres dotyczy wyłącznie zakładki **Ustawienia → Rezerwacje** (`BookingSettingsPanel.tsx`).

---

## 1. Maksymalne wyprzedzenie rezerwacji

Obecnie: 7 / 14 / 30 / 60 / 90 dni.

Nowe opcje:
- 7 dni
- 14 dni
- 30 dni
- 60 dni
- 90 dni
- 180 dni (6 miesięcy)
- 365 dni (1 rok)
- **Bez limitu** (zapisywane jako `0` lub bardzo duża wartość — patrz sekcja techniczna)

Pod selectem zostaje opis dynamiczny („Klientki mogą rezerwować do X dni naprzód" / „Bez limitu czasowego").

## 2. Minimalne wyprzedzenie

Obecnie: brak limitu / 1h / 2h / 4h / 24h.

Nowe opcje (granularne dla last-minute + większy zakres dla salonów premium):
- Bez limitu (rezerwacja możliwa nawet za chwilę)
- 15 minut
- 30 minut
- 45 minut
- 1 godzina
- 2 godziny
- 4 godziny
- 12 godzin
- 24 godziny
- 48 godzin
- 72 godziny

## 3. Tooltipy / objaśnienia (interwał slotów, bufor)

Przy etykietach **Interwał slotów** i **Bufor między wizytami** dodaję ikonę `HelpCircle` z `Tooltip` (shadcn) — kliknięcie/hover pokazuje krótkie wyjaśnienie:

- **Interwał slotów** — „Co ile minut pojawia się nowy slot do rezerwacji. Np. interwał 15 min = klientka widzi godziny 10:00, 10:15, 10:30… Mniejszy interwał = więcej możliwości wyboru, ale też więcej drobnych okienek w grafiku."
- **Bufor między wizytami** — „Dodatkowy czas automatycznie blokowany po każdej wizycie — na sprzątanie stanowiska, dezynfekcję, krótką przerwę. Bufor nie jest widoczny dla klientki, ale chroni Cię przed nakładającymi się wizytami."

Analogiczny tooltip dodaję też do **Maksymalnego/minimalnego wyprzedzenia** i **Polityki anulacji** — dla spójności.

## 4. Uporządkowanie sekcji potwierdzeń (najważniejsze)

Obecnie w sekcji „Dodatkowe opcje" są dwa przełączniki, które się dublują i wprowadzają w błąd:

- **Automatyczne potwierdzenie rezerwacji** (`autoConfirmBookings`)
- **Wymagaj potwierdzenia telefonicznego** (`requirePhoneConfirm`) — **bez mechanizmu w systemie**, bo nie ma jak technicznie wykryć, że klient zadzwonił i potwierdził

### Proponowane rozwiązanie

Zamieniam dwa zduplikowane toggle na **jedną grupę „Tryb potwierdzania wizyt"** z trzema wyraźnymi opcjami (RadioGroup w stylu kart):

1. **Automatyczne (zalecane)** — rezerwacja od razu trafia do grafiku jako potwierdzona. Klientka dostaje natychmiastowe potwierdzenie SMS/email. Najlepsze dla większości salonów.
2. **Ręczne — wymaga akceptacji w panelu** — każda nowa rezerwacja trafia jako „Oczekująca" do listy w module Grafik (badge „Do potwierdzenia"). Personel jednym kliknięciem akceptuje lub odrzuca. Klientka dostaje SMS dopiero po akceptacji. (To zastępuje mylące „potwierdzenie telefoniczne" — w praktyce dokładnie taki workflow daje swobodę zadzwonienia do klientki przed akceptacją.)
3. **Hybrydowe — automatyczne dla stałych, ręczne dla nowych** — stali klienci (≥1 ukończona wizyta) idą automatem, nowi/anonimowi wymagają akceptacji personelu.

Pod opcją „Ręczne" i „Hybrydowe" dodaję info-box: „Niezatwierdzone rezerwacje wygasają po 24h, jeśli nikt z personelu ich nie zaakceptuje. Klientka dostaje o tym powiadomienie i może zarezerwować inny termin."

Stary `requirePhoneConfirm` zostaje wycofany z UI (kolumna w DB zostaje na razie nietknięta — bez migracji destrukcyjnej, ignorujemy w odczycie). Logika `autoConfirmBookings` w bazie pokrywa tryby 1 i 2; tryb 3 mapuje się na nową kolumnę boolean `auto_confirm_returning_only` (patrz sekcja techniczna).

---

## Sekcja techniczna (dla devów)

### Zmiany pliku
- `src/components/admin/settings/BookingSettingsPanel.tsx` — rozszerzone opcje selectów, tooltipy, nowa sekcja „Tryb potwierdzania".
- `src/locales/pl.json` / `en.json` — nowe klucze (`bookingMode.auto`, `bookingMode.manual`, `bookingMode.hybrid`, opisy tooltipów, opisy „365 dni" / „bez limitu" / „15/30/45 min" itd.).
- `src/hooks/useSalonSettings.ts` — dodać `autoConfirmReturningOnly: boolean` do `BookingSettings`, czytać/zapisywać z `salon_settings`.
- `src/integrations/supabase/types.ts` — wygenerowane po migracji.

### Migracja
- `ALTER TABLE public.salon_settings ADD COLUMN auto_confirm_returning_only boolean NOT NULL DEFAULT false;`
- (opcjonalnie później) `requirePhoneConfirm` zostaje w DB jako legacy, ignorowane przez UI.

### Walidacja
- `advanceBookingDays`: dopuszczalne `7, 14, 30, 60, 90, 180, 365, 0` (gdzie `0` = bez limitu). Front mapuje „Bez limitu" → `0`; w logice wyznaczania dostępnych slotów `0` interpretujemy jako „brak górnej granicy" (ograniczeniem zostaje tylko grafik pracy).
- `minAdvanceHours`: zmiana typu wartości — zostaje liczba godzin, ale pozycje submożdzinowe zapisujemy jako ułamki (`0.25`, `0.5`, `0.75`). Wymaga zmiany pola w DB z `integer` na `numeric(5,2)` — uwzględnione w tej samej migracji.

### Zgodność wstecz
- Salony z istniejącą wartością `autoConfirmBookings=true` mapują się na tryb „Automatyczne".
- `autoConfirmBookings=false` mapuje się na „Ręczne".
- `autoConfirmReturningOnly=true` (po włączeniu) override'uje powyższe i pokazuje tryb „Hybrydowe".
- Stary `requirePhoneConfirm` znika z UI bez utraty danych w DB.

### QA
- Sprawdzić, że widget rezerwacji (`/s/[slug]`) honoruje nowe maksymalne wyprzedzenie 365/∞ i minimalne 15 min.
- Sprawdzić, że nowe rezerwacje w trybie „Ręczne" trafiają z `status='pending'` i są widoczne w module Grafik z badge'em do akceptacji (już istniejąca logika — wymaga jedynie potwierdzenia ścieżki).
- Brak regresji w mobile collapsible sidebar (poprzednia zmiana).

---

## Pytanie do zatwierdzenia

Czy zgadzasz się na zastąpienie mylącego „potwierdzenia telefonicznego" trybem **Automatyczne / Ręczne / Hybrydowe** (tryb 3 wymaga drobnej migracji DB)? Jeśli wolisz prościej — mogę zostawić tylko **Automatyczne / Ręczne** bez hybrydowego, bez migracji.
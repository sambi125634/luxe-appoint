

# Audyt platformy: Flow od Landing Page → Demo → Rejestracja → Onboarding → Panel Admina

## Podsumowanie stanu

Platforma ma solidne fundamenty: landing page, demo, onboarding wizard, guided tour, voice guidance, setup checklist i VideoTutorialCard. Jednak po szczegółowym audycie znalazłem **kilka krytycznych luk** w spójności między demo a produkcją oraz w "customer-friendliness" poszczególnych modułów.

---

## Znalezione problemy (od najważniejszych)

### 1. TimeOffManagement — BRAK izolacji danych demo
**Problem**: `TimeOffManagement` zawsze inicjalizuje `useState<TimeOff[]>(mockTimeOffs)` — zarówno w demo jak i w produkcji. Nowy użytkownik widzi fikcyjne urlopy Anny Kowalskiej i Marii Nowak.
**Fix**: Zmienić na `useState(isDemo ? mockTimeOffs : [])` + dodać empty state "Brak zaplanowanych urlopów".

### 2. WeeklyCalendar & AppointmentModal — hardcoded mock staff/clients
**Problem**: `WeeklyCalendar` używa hardcoded `staff[]` array (Maria N., Karolina W. itd.) zamiast ładować rzeczywistych pracowników z bazy. `AppointmentModal` ma hardcoded `mockClients[]` i `mockServices[]` — w produkcji nowy użytkownik widzi fikcyjnych klientów/usługi zamiast swoich.
**Fix**: W trybie produkcyjnym pobierać staff, clients i services z bazy (via `useSalonId` + Supabase queries). W demo zostawić mocki.

### 3. StatsModule — NIGDY nie pobiera danych z bazy
**Problem**: `StatsModule` ma prop `isDemo` ale zawsze używa hardcoded `revenueData`, `topServicesData`, `topStaffData` itd. Prop `isDemo` jedynie kontroluje czy pokazać empty state czy mocki, ale nigdy nie robi prawdziwych zapytań do bazy.
**Fix**: W trybie produkcyjnym (`isDemo=false`) pobierać dane z appointments/transactions/staff_members filtrowanych po salon_id. Pokazywać empty state tylko gdy brak danych.

### 4. AccountingModule — brak prawdziwych zapytań do bazy
**Problem**: Podobnie jak StatsModule — `transactions` to `useState` z mockData lub pustą tablicą. Brak Supabase queries do tabeli `transactions`.
**Fix**: Dodać `useQuery` do pobierania transakcji z bazy w trybie produkcyjnym.

### 5. WidgetsManagement — brak persystencji widgetów
**Problem**: Widgets to czysty `useState` — brak tabeli w bazie, brak persystencji. Użytkownik tworzy widget, odświeża stronę — widget znika.
**Fix**: Wymaga tabeli `booking_widgets` w bazie + CRUD operations. Na ten moment dodać przynajmniej informację dla użytkownika.

### 6. Brakujące VideoTutorialCard w modułach
**Problem**: Niektóre moduły NIE mają `VideoTutorialCard`:
- TimeOffManagement ❌
- ConversationsModule ❌
- PipelineModule ❌
- AccountingModule ❌
- ProductsModule ❌
**Fix**: Dodać VideoTutorialCard z odpowiednim voiceText do każdego brakującego modułu.

### 7. Brakujące empty states z instrukcjami
**Problem**: Moduły w trybie produkcyjnym (bez danych) nie zawsze jasno komunikują co użytkownik powinien zrobić. Np. Kalendarz nie mówi "Dodaj pracowników i ustaw godziny pracy, żeby zobaczyć wolne sloty".
**Fix**: Dodać kontekstowe empty states z linkami do odpowiednich sekcji (np. "Przejdź do Pracownicy →").

### 8. Conversations & Pipeline — brak integracji z bazą
**Problem**: Oba moduły to czyste UI-layer z useState. W trybie produkcyjnym pokazują empty state, ale przyciski "Nowa konwersacja" / akcje nie robią nic poza manipulacją lokalnego state.
**Fix**: Na ten moment — dodać jasną informację "Moduł wymaga integracji z GoHighLevel" + link do ustawień integracji. To jest zgodne z architekturą integracji (memory: integration-architecture-pattern).

---

## Plan implementacji

### Faza 1: Krytyczne poprawki izolacji danych (najwyższy priorytet)
1. **TimeOffManagement** — dodać izolację `isDemo` (empty state vs mocki)
2. **WeeklyCalendar** — w trybie prod pobierać staff z bazy zamiast hardcoded array
3. **AppointmentModal** — w trybie prod pobierać clients/services/staff z bazy

### Faza 2: VideoTutorialCard + empty states dla każdego modułu
4. Dodać `VideoTutorialCard` z polskim voiceText do:
   - TimeOffManagement
   - ConversationsModule  
   - PipelineModule
   - AccountingModule
   - ProductsModule
5. Dodać kontekstowe empty states z CTA "Przejdź do [sekcja]" w modułach które zależą od danych z innych sekcji (kalendarz → pracownicy, dashboard → usługi)

### Faza 3: Podłączenie danych z bazy w Stats i Accounting
6. **StatsModule** — zamienić hardcoded mock data na rzeczywiste Supabase queries (appointments, transactions) z filtrami po salon_id
7. **AccountingModule** — analogicznie, pobierać transakcje z tabeli `transactions`

### Faza 4: Informacje o integracjach
8. **Conversations & Pipeline** — dodać banner "Wymaga konfiguracji integracji z GoHighLevel" z linkiem do Settings → Integracje

---

## Detale techniczne

Każda poprawka korzysta z istniejących wzorców:
- `useSalonId()` hook do pobierania salon_id
- `useQuery` z `@tanstack/react-query` do cachowania
- `isDemo ? mockData : []` pattern do izolacji
- `VideoTutorialCard` + `VoiceGuidanceButton` do tutoriali
- Polish copy, toast z `sonner`, shadcn/ui komponenty

Szacowany zakres: ~8-10 plików do edycji, brak zmian w bazie danych (tabele transactions, appointments, staff_members, services, clients już istnieją z RLS).


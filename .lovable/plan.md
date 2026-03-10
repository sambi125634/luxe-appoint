

# Plan: Moduł Retencji Klientek z Radarem i Sekwencjami

## Zakres

Stworzenie systemu automatycznej retencji klientek z 5 sekwencjami (A-E), wizualizacją "Radar Retencji" (bąble wg dni nieaktywności), panelem "Autopilot Zadziałał" i tabelami w bazie do śledzenia sekwencji, wiadomości i konwersji.

## 1. Migracja — 4 nowe tabele

```sql
-- retention_sequences: konfiguracja sekwencji A-E per salon
CREATE TABLE retention_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL,
  sequence_key text NOT NULL, -- 'proactive'|'45day'|'60day'|'75day'|'90day'
  is_active boolean DEFAULT true,
  trigger_days integer NOT NULL,
  message_template text NOT NULL,
  tone text DEFAULT 'warm',
  include_incentive boolean DEFAULT false,
  incentive_details jsonb DEFAULT '{}',
  countdown_hours integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(salon_id, sequence_key)
);

-- retention_messages: log wysłanych wiadomości retencyjnych
CREATE TABLE retention_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL,
  client_id uuid NOT NULL,
  sequence_id uuid REFERENCES retention_sequences(id),
  channel text NOT NULL, -- 'sms'|'email'|'whatsapp'
  status text DEFAULT 'sent', -- sent|delivered|opened|clicked|failed
  opened_at timestamptz,
  clicked_at timestamptz,
  created_at timestamptz DEFAULT now(),
  message_content text
);

-- retention_conversions: kiedy reaktywacja → rezerwacja
CREATE TABLE retention_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL,
  client_id uuid NOT NULL,
  message_id uuid REFERENCES retention_messages(id),
  appointment_id uuid,
  revenue_recovered numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- client_communication_preferences: ulubiony kanał, pora per klientka
CREATE TABLE client_communication_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL UNIQUE,
  salon_id uuid NOT NULL,
  preferred_channel text DEFAULT 'sms',
  preferred_hour integer, -- 0-23
  preferred_day integer, -- 0=Mon
  opted_out boolean DEFAULT false,
  opted_out_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

RLS: salon owner + super_admin (wzorzec istniejący w projekcie).

## 2. Nowe pliki

### `src/modules/retention/types.ts`
Interfejsy TS dla: `RetentionSequence`, `RetentionMessage`, `RetentionConversion`, `ClientCommPrefs`, `RetentionRadarClient` (z polami `days_inactive`, `risk_zone`, `last_sequence_sent`).

### `src/modules/retention/mock-data.ts`
Mock dane demo: ~15 klientek rozłożonych po strefach (zielona/żółta/pomarańczowa/czerwona), 10 ostatnich akcji autopilota, tygodniowe KPI retencji.

### `src/modules/retention/RetentionRadar.tsx`
Wizualizacja okrągła — 4 strefy kolorystyczne z bąblami klientek:
- Zielona (0-30 dni): aktywne
- Żółta (30-60 dni): uwaga
- Pomarańczowa (60-90 dni): ryzyko
- Czerwona (90+): utracone → kampania

Kliknięcie w bąbel → tooltip z imieniem, dniami nieaktywności, ostatnim zabiegiem. Implementacja via CSS circles + pozycjonowanie (bez ciężkiej biblioteki wykresów).

### `src/modules/retention/RetentionTimeline.tsx`
Panel "Autopilot Zadziałał" — lista 10 ostatnich akcji z timestampami, statusami otwarć, ikonkami kanałów. Format: `[Wczoraj 14:23] Wysłano reaktywację do Marty K. (67 dni) — Otworzyła SMS ✓`

### `src/modules/retention/RetentionKPI.tsx`
4 karty KPI: wysłane reaktywacje, wskaźnik otwarć %, rezerwacje z reaktywacji, przychód odzyskany.

### `src/modules/retention/RetentionDashboard.tsx`
Główny komponent łączący Radar + Timeline + KPI. Przyjmuje `isDemo` prop. Używa mock danych w demo, prawdziwych danych via hooks w production.

### `src/modules/retention/SequenceConfig.tsx`
Konfiguracja 5 sekwencji (A-E) z toggleami on/off, edycją szablonów wiadomości, ustawień tonów i incentive. Dostępna z poziomu Retention Dashboard jako expandable section.

### `src/hooks/useRetention.ts`
Hooki: `useRetentionRadar(salonId)`, `useRetentionTimeline(salonId)`, `useRetentionKPI(salonId)`, `useRetentionSequences(salonId)`. W demo mode zwracają mock dane.

## 3. Integracja

### `src/components/admin/DashboardHome.tsx`
Dodanie sekcji "Radar Retencji" — karta z `RetentionRadar` + link "Zobacz szczegóły" otwierający pełny `RetentionDashboard`.

### `src/components/admin/AdminSidebar.tsx`
Sprawdzenie czy istnieje zakładka do nawigacji do retencji (prawdopodobnie pod "clients" lub jako sub-tab).

### `src/pages/DemoPage.tsx`
Dodanie `RetentionDashboard` do dostępnych modułów demo.

## 4. Pliki do stworzenia
| Plik | Opis |
|------|------|
| `src/modules/retention/types.ts` | Interfejsy TS |
| `src/modules/retention/mock-data.ts` | Dane demo |
| `src/modules/retention/RetentionRadar.tsx` | Wizualizacja bąblowa |
| `src/modules/retention/RetentionTimeline.tsx` | Log akcji |
| `src/modules/retention/RetentionKPI.tsx` | Karty KPI |
| `src/modules/retention/RetentionDashboard.tsx` | Główny panel |
| `src/modules/retention/SequenceConfig.tsx` | Konfiguracja sekwencji |
| `src/hooks/useRetention.ts` | Hooki danych |
| Migracja SQL | 4 tabele + RLS |

## 5. Pliki do edycji
| Plik | Zmiana |
|------|--------|
| `src/components/admin/DashboardHome.tsx` | Sekcja Radar Retencji |
| `src/pages/DemoPage.tsx` | Moduł retencji w demo |

## Uwagi
- Sekwencje A-E są pre-konfigurowane z intelligent defaults (Zero-Action Default)
- Każda akcja w timeline zawiera `ai_explanation` (Explain AI Decisions)
- Kliknięcie w klientkę w Radarze → profil + historia komunikacji + ręczna interwencja
- System respektuje `opted_out` flag i `max_messages_per_client_days` z autopilot_config
- Wiadomości wysyłane tylko w quiet hours (8:00-20:00)


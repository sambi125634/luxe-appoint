

# Plan: Autopilot Engine — baza systemu AI

## Zakres

Tworzę fundamentalny system Autopilot Engine: typy, konfigurację, hook, tabele w bazie, komponent statusu i sidebar z logiem akcji.

## 1. Tabele w bazie (migracja)

```sql
-- autopilot_config: per-salon konfiguracja z intelligent defaults
CREATE TABLE autopilot_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  paused_until timestamptz,
  retention_trigger_days integer[] DEFAULT '{45,60,75,90}',
  reminder_hours_before integer[] DEFAULT '{24,2}',
  review_request_delay_hours integer DEFAULT 2,
  noshow_followup_minutes integer DEFAULT 30,
  weekly_brief_day text DEFAULT 'monday',
  weekly_brief_hour integer DEFAULT 8,
  ai_suggestions_enabled boolean DEFAULT true,
  pixel_sync_enabled boolean DEFAULT false,
  quiet_hours_start time DEFAULT '20:00',
  quiet_hours_end time DEFAULT '08:00',
  max_messages_per_client_days integer DEFAULT 7,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- autopilot_actions: log każdej automatycznej akcji
CREATE TABLE autopilot_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL,
  type text NOT NULL, -- retention|review|reminder|noshow|revenue_suggestion|pixel_sync|brief
  triggered_by text NOT NULL,
  client_id uuid,
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  executed_at timestamptz,
  status text NOT NULL DEFAULT 'pending', -- pending|sent|completed|failed|dismissed
  ai_explanation text NOT NULL,
  cta_label text,
  cta_action text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- autopilot_stats: tygodniowe podsumowania
CREATE TABLE autopilot_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL,
  week_start date NOT NULL,
  actions_taken integer DEFAULT 0,
  revenue_recovered numeric DEFAULT 0,
  clients_reactivated integer DEFAULT 0,
  reviews_collected integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(salon_id, week_start)
);
```

RLS: salon owner + super_admin na wszystkie 3 tabele (wzorzec jak reszta tabel).

## 2. Nowy plik: `src/lib/autopilot-engine.ts`

Eksportuje:
- `AutopilotConfig` interface z defaultami
- `AutopilotAction` type z ai_explanation i one_click_cta
- `DEFAULT_AUTOPILOT_CONFIG` — obiekt z intelligent defaults branży beauty PL
- Helper do formatowania akcji w formacie `[INSIGHT] → [POWÓD] → [REKOMENDACJA] → [CTA]`

## 3. Hook: `src/hooks/useAutopilot.ts`

- `useAutopilotConfig(salonId)` — pobiera/tworzy config z domyślnymi wartościami
- `useAutopilotActions(salonId)` — pobiera scheduled/pending actions
- `dismissAction(id)` — ustawia status = 'dismissed'
- `executeNow(id)` — ustawia executed_at = now(), status = 'sent'
- `useAutopilotStats(salonId)` — bieżący tydzień stats
- `togglePause(until?: Date)` — pauzuje/wznawia autopilot

## 4. Komponent: `src/components/admin/AutopilotStatusBar.tsx`

Sticky banner 40px na górze dashboardu:
- Gradient `from-[#1A1A2E] to-[#E91E8C]`, tekst biały
- Treść: "🤖 Autopilot aktywny · Dziś zadziałał X razy · Odzyskano Y zł · [Zobacz akcje]"
- Gdy spauzowany: "⏸️ Autopilot wstrzymany do DD.MM · [Wznów]"
- Demo mode: mock dane statyczne
- Link "Zobacz akcje" otwiera sidebar

## 5. Komponent: `src/components/admin/AutopilotActionLog.tsx`

Sheet/sidebar z listą ostatnich akcji:
- Każda akcja: typ (ikona), ai_explanation, status badge, CTA button
- Filtry: typ, status
- Opcja "Cofnij" dla wysłanych akcji

## 6. Integracja z AdminDashboard.tsx

Dodanie `<AutopilotStatusBar />` między headerem a `<main>` — widoczny na każdej zakładce.

## Pliki do stworzenia
- `src/lib/autopilot-engine.ts`
- `src/hooks/useAutopilot.ts`
- `src/components/admin/AutopilotStatusBar.tsx`
- `src/components/admin/AutopilotActionLog.tsx`

## Pliki do edycji
- `src/pages/AdminDashboard.tsx` — dodanie AutopilotStatusBar
- `src/pages/DemoPage.tsx` — dodanie AutopilotStatusBar w demo mode

## Migracja
- 1 migracja: 3 tabele + RLS policies + trigger updated_at


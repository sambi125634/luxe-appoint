

# Plan: Weekly CEO Brief — automatyczny raport tygodniowy

## Zakres

System generowania i wyświetlania tygodniowego briefu CEO: edge function do generowania briefu via AI, tabela do archiwum, widget na dashboardzie i komponent pełnego briefu.

## 1. Migracja — tabela `weekly_briefs`

```sql
CREATE TABLE weekly_briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL,
  week_start date NOT NULL,
  -- Stats
  appointments_count integer DEFAULT 0,
  revenue numeric DEFAULT 0,
  occupancy_pct numeric DEFAULT 0,
  noshow_count integer DEFAULT 0,
  noshow_pct numeric DEFAULT 0,
  -- Trends vs previous week
  revenue_change_pct numeric DEFAULT 0,
  appointments_change_pct numeric DEFAULT 0,
  -- Autopilot summary
  autopilot_actions jsonb DEFAULT '[]',
  -- AI-generated content
  ai_narrative text,
  ai_top_action jsonb,
  ai_warning jsonb,
  -- Delivery
  email_sent_at timestamptz,
  sms_sent_at timestamptz,
  push_sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(salon_id, week_start)
);
```

RLS: salon owner + super_admin (standard pattern).

## 2. Edge Function: `supabase/functions/generate-weekly-brief/index.ts`

- Input: `{ salon_id, week_start? }` (defaults to last week)
- Queries: appointments, transactions, autopilot_actions, autopilot_stats for the week
- Computes: visit count, revenue, occupancy %, no-show rate, trends vs prior week
- Calls Lovable AI (gemini-3-flash-preview) with structured tool calling to generate:
  - `ai_narrative`: 2-3 sentence summary
  - `ai_top_action`: one recommended action with CTA
  - `ai_warning`: anomaly detection (optional)
- Saves to `weekly_briefs` table
- Sends email via Resend (existing infrastructure)

## 3. Nowe pliki UI

### `src/components/admin/dashboard/WeeklyBriefWidget.tsx`
Kompaktowy widget na dashboardzie — fold-out card:
- Header: "Ostatni Brief — tydzień [data]"
- 3 liczby: wizyty, przychód, obłożenie (z trendami)
- Lista autopilot actions (bullet points)
- AI top action z CTA button
- Warning section (if present)
- Link "Zobacz pełną historię"

### `src/components/admin/dashboard/WeeklyBriefHistory.tsx`
Archiwum briefów — lista kart z porównaniem tydzień-do-tygodnia. Dostępne z dashboardu.

### `src/hooks/useWeeklyBrief.ts`
Hook: `useLatestBrief(salonId)`, `useBriefHistory(salonId)`, `useGenerateBrief()` mutation.

## 4. Integracja

- `DashboardHome.tsx`: dodanie `WeeklyBriefWidget` pod sekcją KPI
- `DemoPage.tsx`: mock brief data w demo mode
- `supabase/config.toml`: nowa function entry

## Pliki do stworzenia
| Plik | Opis |
|------|------|
| `supabase/functions/generate-weekly-brief/index.ts` | Edge function AI brief |
| `src/components/admin/dashboard/WeeklyBriefWidget.tsx` | Widget dashboard |
| `src/components/admin/dashboard/WeeklyBriefHistory.tsx` | Archiwum briefów |
| `src/hooks/useWeeklyBrief.ts` | Hooki danych |
| Migracja SQL | Tabela weekly_briefs + RLS |

## Pliki do edycji
| Plik | Zmiana |
|------|--------|
| `src/components/admin/DashboardHome.tsx` | Dodanie WeeklyBriefWidget |
| `supabase/config.toml` | Nowa function entry |


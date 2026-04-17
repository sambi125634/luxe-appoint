

# Plan: Migracja widgetu rezerwacji 1:1 do nowego projektu

## Realna ocena sytuacji

Widget + edytor admin to **~7 200 linii kodu w 20 plikach** + zależności:

```text
src/components/booking/          (13 plików, ~3 540 linii)
  BookingWidget.tsx               863 linii
  ServiceSelection.tsx            716 linii
  DateTimeSelection.tsx           583 linii
  BookingConfirmation.tsx         445 linii
  + 9 innych (PaymentStep, ClientForm, SakuraBackground, Confetti, etc.)

src/components/admin/widgets/    (7 plików, ~3 030 linii)
  WidgetEditor.tsx              1 406 linii
  WidgetsManagement.tsx           421 linii
  PromotionsManager.tsx           417 linii
  EmbedCodeModal.tsx              278 linii
  types.ts                        271 linii
  InstagramLinkGenerator.tsx      234 linii

Zależności:
  src/hooks/useConflictCheck.ts
  src/lib/phone-validation.ts
  src/pages/BookingPage.tsx
  supabase/functions/check-appointment-conflict/
  supabase/functions/create-payment-p24/  (jeśli chcesz przedpłaty)
  + tabele DB: services, staff_members, appointments, salons, salon_settings
```

**Wklejanie tego jako prompt ChatGPT nie zadziała** — przekroczy limity, pogubi importy, a typy z bazy danych (Supabase types.ts) nie będą pasować. AI w nowym projekcie i tak wygeneruje "podobne", nie "identyczne".

## Rekomendacja: użyj wbudowanego Cross-Project Copy

Lovable ma narzędzie, które przenosi pliki **1:1 między projektami w tym samym workspace** — bez zmian, bez interpretacji AI. To najszybszy i najbardziej niezawodny sposób.

### Krok 1: Powiedz mi nazwę nowego projektu

W odpowiedzi napisz dokładną nazwę projektu (tę widoczną w sidebarze Lovable po lewej). Przykład: `beauty-funnels-leadgen`.

### Krok 2: Ja automatycznie przenoszę wszystko (1 sesja)

Po Twojej odpowiedzi wykonam — w trybie default — następujące akcje cross-project:

**A. Frontend (20 plików):**
- Cały folder `src/components/booking/` (13 plików)
- Cały folder `src/components/admin/widgets/` (7 plików)
- `src/hooks/useConflictCheck.ts`
- `src/hooks/use-toast.ts` (jeśli brak)
- `src/lib/phone-validation.ts`
- `src/pages/BookingPage.tsx` (publiczny widget na `/s/:slug`)

**B. Backend (Supabase migration):**
Wygeneruję migrację SQL tworzącą uproszczone tabele potrzebne TYLKO widgetowi:
- `services` (id, name, duration, price, category, thumbnail_url)
- `staff_members` (id, name, role)
- `appointments` (id, service_id, staff_id, start_time, status, client data)
- `salons` (id, name, slug, settings JSONB)
- `widget_configs` (id, salon_id, name, slug, theme JSONB, services[], steps JSONB)
- RLS policies dla pojedynczego owner

**C. Edge Function:**
- `check-appointment-conflict` (zapobieganie podwójnym rezerwacjom)

**D. Routing w nowym projekcie:**
- `/s/:slug` → publiczny widget
- `/admin/widgets` → WidgetsManagement (lista + edytor)

**E. Konfiguracja:**
- shadcn/ui components (Button, Badge, Dialog, Tabs, Input, Switch, Select, Calendar, Popover) — jeśli których brakuje
- Dependencies: `framer-motion`, `@tanstack/react-query`, `date-fns`, `lucide-react`
- Tokeny CSS (warm light: rose/terra/gold) — już skopiowane wcześniej

### Krok 3: Adaptacja do single-tenant

Obecny widget zakłada multi-tenant (`salon_id`). W nowym projekcie (Twój osobisty CRM) jest TYLKO jeden salon — Ty. Po skopiowaniu wykonam minimalne zmiany:
- Usunąć logikę przełączania między salonami
- Hardcoded `DEFAULT_SALON_ID` lub auto-wybór pierwszego salonu
- Uproszczony onboarding (jeden klik = utworzenie salonu)

## Co NIE jest przenoszone (świadomie)

Te elementy zostawiamy w obecnym projekcie — nie są potrzebne w lejku:
- Multi-tenant RLS (`isDemo` guards)
- AI Slot Scoring, Risk Score, Pricing Optimizer
- Loyalty stamps, retention, beauty rhythms
- Inventory, recipes, true profit
- Client app (`/app/*`)
- Onboarding wizard
- Subscription gating

## Czego potrzebuję od Ciebie TERAZ

**Tylko jedna informacja**: nazwa nowego projektu Lovable (taka jaka pojawia się w sidebarze).

Po Twojej odpowiedzi — w jednej sesji w trybie default — przenoszę wszystkie 20 plików + tworzę migrację DB + edge function + routing. Effekt: identyczny widget i identyczny edytor admin w nowym projekcie.

## Backup plan jeśli cross-project nie zadziała

Jeśli z jakiegoś powodu nowy projekt nie jest w tym samym workspace (cross-project działa tylko wewnątrz workspace), alternatywą jest:
1. Ja generuję ZIP z 20 plikami + SQL + instrukcje
2. Ty wgrywasz pliki ręcznie w nowym projekcie przez Lovable file uploader
3. Wklejasz SQL do migration tool

Ale **najpierw spróbujmy cross-project** — to pełna automatyzacja.


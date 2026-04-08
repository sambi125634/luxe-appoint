

## Plan: Pełny moduł AI Autopilot jako osobna sekcja w sidebar

### Zakres

Nowa zakładka **"autopilot"** w AdminSidebar (sekcja Marketing, ikona `Bot`) z dedykowanym modułem 4-zakładkowym. Konfiguracja Autopilota zostanie usunięta z `AutomationSettings` (Ustawienia → Automatyzacja).

### Struktura modułu

```text
src/components/admin/autopilot/
├── AutopilotModule.tsx        ← główny komponent z 4 zakładkami
├── AutopilotDashboard.tsx     ← (1) statystyki tygodniowe + KPI cards
├── AutopilotConfig.tsx        ← (2) konfiguracja per-typ z edycją wiadomości
├── AutopilotHistory.tsx       ← (3) historia akcji z filtrami
├── AutopilotQueue.tsx         ← (4) podgląd kolejki zaplanowanych
└── index.ts
```

### Szczegóły zmian

**1. AdminSidebar.tsx**
- Dodać `"autopilot"` do `TabType`
- Dodać `{ icon: Bot, labelKey: "admin.autopilot", tab: "autopilot" }` w sekcji Marketing (po Referral)
- Dodać permission mapping: `autopilot: "can_manage_marketing"`

**2. AdminDashboard.tsx**
- Import `AutopilotModule`
- Dodać case `"autopilot"` w `getPageTitle()` → "AI Autopilot"
- Dodać case w `renderContent()` → `<AutopilotModule />`

**3. AutopilotModule.tsx** — 4 zakładki (Tabs):
- Dashboard | Konfiguracja | Historia | Kolejka

**4. AutopilotDashboard.tsx** — zakładka Dashboard:
- 4 KPI cards: akcje tygodniowe, odzyskany przychód, reaktywowane klientki, zebrane opinie
- Wykres tygodniowy (Recharts BarChart)
- Globalny toggle ON/OFF + status pauzy
- Dane z `useAutopilotStats()` i `useAutopilotConfig()`

**5. AutopilotConfig.tsx** — zakładka Konfiguracja:
- Lista 7 typów akcji (retention, review, reminder, noshow, revenue_suggestion, pixel_sync, brief)
- Każdy typ: toggle ON/OFF, parametry (np. `retention_trigger_days`, `reminder_hours_before`), edytor szablonu wiadomości SMS/email
- Godziny ciszy, max wiadomości per klient
- Przeniesienie logiki z `AutomationSettings` (karta Autopilot) tutaj

**6. AutopilotHistory.tsx** — zakładka Historia:
- Tabela akcji z `useAutopilotActions()`
- Filtry: typ akcji, status, zakres dat
- Kolumny: data, typ, klientka, status, AI explanation
- Pagination

**7. AutopilotQueue.tsx** — zakładka Kolejka:
- Lista akcji ze statusem `pending` posortowanych wg `scheduled_at`
- Przyciski: Wykonaj teraz / Odrzuć / Edytuj wiadomość
- Dane z `useAutopilotActions()` filtrowane po `status === "pending"`

**8. AutomationSettings.tsx** — usunięcie karty Autopilot:
- Usunąć pierwszą kartę "Autopilot Global" (linie 196-271)
- Zostawić: Default Settings, GDPR, Module Status

**9. i18n** — dodać klucz `admin.autopilot: "AI Autopilot"` w en.json i pl.json

### Dane
- Hooki już istnieją: `useAutopilotConfig`, `useAutopilotActions`, `useAutopilotStats`, `useToggleAutopilotPause`, `useDismissAction`, `useExecuteAction`
- Tabele DB już istnieją: `autopilot_config`, `autopilot_actions`, `autopilot_stats`
- Brak zmian w bazie danych

### Pliki do edycji/utworzenia

| Plik | Akcja |
|------|-------|
| `src/components/admin/AdminSidebar.tsx` | Edycja — dodać tab "autopilot" |
| `src/pages/AdminDashboard.tsx` | Edycja — dodać case autopilot |
| `src/components/admin/autopilot/AutopilotModule.tsx` | Nowy |
| `src/components/admin/autopilot/AutopilotDashboard.tsx` | Nowy |
| `src/components/admin/autopilot/AutopilotConfig.tsx` | Nowy |
| `src/components/admin/autopilot/AutopilotHistory.tsx` | Nowy |
| `src/components/admin/autopilot/AutopilotQueue.tsx` | Nowy |
| `src/components/admin/autopilot/index.ts` | Nowy |
| `src/components/admin/settings/AutomationSettings.tsx` | Edycja — usunąć kartę Autopilot |
| `src/i18n/locales/pl.json` | Edycja — dodać klucz |
| `src/i18n/locales/en.json` | Edycja — dodać klucz |


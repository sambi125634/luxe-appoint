

# Plan: True Profit Analytics Dashboard

## Zakres

Nowy moduł `/src/modules/analytics/` z dashboardem True Profit — ranking usług wg zysku/h, ranking klientek wg LTV/CAC, prognoza cashflow i porównania branżowe. Czysto frontendowe kalkulacje oparte na istniejących danych (appointments, transactions, services, products, service_product_recipes, staff_members, clients). Brak nowych tabel — wszystkie dane już istnieją.

## 1. Nowe pliki

### `src/modules/analytics/TrueProfitDashboard.tsx`
Główny dashboard z tabami: Centrum Zysku | Ranking Usług | Ranking Klientek | Prognoza | Benchmarki.

### `src/modules/analytics/TodayProfitCard.tsx`
Karta "Dziś": przychód, true profit, najlepsza usługa wg TP/h. Dane z appointments (today) + recipes + staff rates.

### `src/modules/analytics/MonthlyProfitCard.tsx`
Karta "Ten miesiąc": przychód, koszty materiałów/pracowników/akwizycji, TRUE PROFIT (zł + %), trend vs poprzedni miesiąc.

### `src/modules/analytics/ServiceProfitRanking.tsx`
Tabela posortowana wg TP/godz. Kolumny: Usługa | Cena | Koszt mat. | Czas | TP/wizyta | TP/godz | Wykonano. Color coding (zielony/żółty/czerwony top 33%). Alert dla usług z niskim TP/h.

### `src/modules/analytics/ClientLTVRanking.tsx`
Ranking klientek wg LTV i LTV/CAC ratio. Suma wydatków z transactions, source-based CAC estimation.

### `src/modules/analytics/CashflowForecast.tsx`
Wykres 30/60/90 dni: zaplanowane wizyty + historyczna sezonowość. Suwak "co jeśli reaktywuję X klientek". Alert "luka przychodów".

### `src/modules/analytics/IndustryBenchmarks.tsx`
Porównanie do branży — mock benchmarki (anonimowe dane z beauty_products_db w przyszłości). True Margin vs avg, koszty materiałów vs avg.

### `src/modules/analytics/ProfitSetupWizard.tsx`
3-krokowy wizard: stawki pracowników → link do magazynu → import CAC. Wyświetlany przy pierwszym uruchomieniu lub gdy brak danych.

### `src/modules/analytics/index.ts`
Eksporty modułu.

### `src/hooks/useTrueProfit.ts`
Hook agregujący: pobiera appointments, transactions, services, recipes, staff_members, clients i oblicza True Profit per usługa, per klientka, per dzień/miesiąc. Formuła: `TP = price - materialCost - staffCost - acquisitionCost`.

## 2. Integracja

| Plik | Zmiana |
|------|--------|
| `AdminSidebar.tsx` | Dodanie taba "analytics" z ikoną `TrendingUp`, labelKey "admin.trueProfit" |
| `AdminDashboard.tsx` | Import + renderowanie `TrueProfitDashboard` dla taba "analytics" |
| `DemoPage.tsx` | Rejestracja modułu analytics w demo |
| `TabType` | Rozszerzenie o `"analytics"` |
| `i18n pl.json / en.json` | Nowe klucze tłumaczeń |

## 3. Logika kalkulacji (w `useTrueProfit.ts`)

- **Koszt materiałów**: z `useServiceRecipes.getMaterialCost(serviceId)` — istniejący hook
- **Koszt pracownika**: `(service.duration / 60) * staffHourlyRate` — stawka z nowego pola lub domyślna (np. 35 zł/h)
- **Koszt akwizycji**: jednorazowy per klient, amortyzowany przez liczbę wizyt. Estimation: source="facebook" → 40zł, "google" → 30zł, "polecenie" → 0zł
- **TP/godz**: `trueProfit / (duration / 60)`

## 4. Brak nowych tabel
Wszystkie dane istnieją w: `appointments`, `transactions`, `services`, `products`, `service_product_recipes`, `staff_members`, `clients`. Ewentualnie w przyszłości: kolumna `hourly_rate` w `staff_members` (opcjonalna migracja).

## 5. Uwagi
- Gdy brak receptur → True Profit = "szacunkowy (bez kosztów materiałów)" z odpowiednią adnotacją
- Gdy brak stawek pracowników → domyślna 35 zł/h z info "ustaw stawki w ustawieniach"
- Mobile-first: karty stackowane pionowo, wykresy responsywne (recharts)
- Demo mode: mock data


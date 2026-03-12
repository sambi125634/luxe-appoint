

# Plan: Konsolidacja Statystyki → Raporty

## Diagnoza duplikacji

| Element | StatsModule | AccountingModule (Charts) |
|---------|------------|--------------------------|
| Przychód w czasie (AreaChart) | ✅ | ✅ |
| TOP usługi (ranking + bar chart) | ✅ | ✅ |
| TOP personel (ranking + bar chart) | ✅ | ✅ |
| Kategorie usług (pie chart) | ✅ | ✅ |
| KPI: przychód, wizyty | ✅ | ✅ |
| **Obłożenie wg dnia/godziny** | ✅ unikalne | ❌ |
| **No-shows (trend + lista klientów)** | ✅ unikalne | ❌ |
| VAT, prowizje, vouchers, cash up | ❌ | ✅ unikalne |
| Heatmapa przychodów wg weekday | ❌ | ✅ unikalne |
| Analiza rabatów, produktywność PLN/h | ❌ | ✅ unikalne |

**Wniosek**: StatsModule to podzbiór AccountingModule + 2 unikalne zakładki (obłożenie, no-shows). Usunięcie StatsModule i przeniesienie unikalnych elementów do AccountingModule.

## Zmiany

### 1. AccountingModule — dodać 2 nowe taby
- **"Obłożenie"** — przenieść wykresy occupancy by day + by hour z StatsModule (dane demo takie same)
- **"No-shows"** — przenieść trend no-shows + listę klientów z no-shows

Nowa kolejność tabów: Wykresy → Dzienny raport → Sprzedaż/VAT → Produkty → Prowizje → Vouchery → **Obłożenie** → **No-shows** → Eksport

### 2. Nawigacja — usunąć pozycję "Statystyki"
- `AdminSidebar.tsx` — usunąć wpis `{ tab: "stats" }` z `allNavItems` i z `OWNER_ONLY_TABS`
- `AdminDashboard.tsx` — usunąć import `StatsModule`, case "stats" z `renderContent` i `getTabTitle`

### 3. Usunąć StatsModule.tsx
- Plik `src/components/admin/StatsModule.tsx` — zastąpić przekierowaniem lub usunąć (zamienić na pusty re-export dla bezpieczeństwa)

### 4. Tłumaczenia
- Usunąć klucz `admin.stats` z plików i18n (lub zostawić jako alias do raportów)

## Pliki do zmiany

| Plik | Zmiana |
|------|--------|
| `src/components/admin/accounting/AccountingModule.tsx` | Dodać 2 taby: Obłożenie + No-shows (kod z StatsModule) |
| `src/components/admin/AdminSidebar.tsx` | Usunąć wpis "stats" |
| `src/pages/AdminDashboard.tsx` | Usunąć import i case "stats" |
| `src/components/admin/StatsModule.tsx` | Wyczyścić / usunąć |

## Efekt
Jeden spójny moduł "Raporty" z 9 zakładkami pokrywającymi finanse + operacje. Zero duplikacji. Właścicielka salonu ma jedno miejsce na wszystkie raporty.


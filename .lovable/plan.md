## Cel

Upewnić się, że zakładka **Raporty** (`AccountingModule`) w panelu admin:
1. dla nowego salonu pokazuje pusty stan (już działa — `transactions.length === 0` → komunikat „Brak danych księgowych"),
2. po pojawieniu się pierwszych transakcji wszystkie pod-zakładki pokazują **tylko** dane danego salonu — żadnych demo-mocków,
3. dane jednego salonu nigdy nie wyciekają do innego (RLS).

## Co znalazłem

Empty-state na poziomie modułu działa poprawnie. Problem: gdy salon ma choć jedną transakcję, renderują się WSZYSTKIE pod-zakładki, a 3 z nich wciąż pokazują twarde dane demo niezależnie od salonu:

- `ProductSalesAccountingReport.tsx` — `MOCK_PRODUCT_SALES_REPORT` (top produkty, sprzedaż dzienna, kategorie) renderowane bezwarunkowo, brak `isDemo`, brak `salonId`, brak query do `transactions` (gdzie `type='product'`).
- `OccupancyReport.tsx` — twarde `occupancyByDay` / `occupancyByHour`, brak query do `appointments`.
- `NoShowsReport.tsx` — twarde `noShowsData` + lista trzech klientów z numerami telefonów, brak query do `appointments` z `status='no_show'`.

Pozostałe pod-zakładki (`AccountingCharts`, `SalesVatReport`, `EmployeeCommissions`, `DailyCashUp`, `VouchersReport`, `StaffCompensationReport`, `ExportSection`, `TrueProfitDashboard`) mają już prawidłowy guard `isDemo` lub liczą z propsa `transactions` (czyli z DB).

## Co zrobię

### 1. ProductSalesAccountingReport — realne dane per-salon
- Dodać prop `isDemo?: boolean`, pobierać przez `useQuery` z `transactions` gdzie `salon_id = current` i `type = 'product'` w `dateRange`.
- Wyliczyć w pamięci: `topProducts` (group by `description`/`product_id`), `salesByCategory` (group by `category`), `salesByDay` (group by dzień), totals.
- Gdy zero produktowych transakcji → ten sam wzorzec empty-state co w `ProductSalesReport` (ikona `Package`, „Brak sprzedaży produktów w tym okresie").
- Demo nadal używa `MOCK_PRODUCT_SALES_REPORT`.

### 2. OccupancyReport — realne dane per-salon
- Dodać prop `isDemo?: boolean` + `dateRange`.
- `useQuery` na `appointments` (`salon_id = current`, `start_time` w zakresie, `status IN ('completed','booked','confirmed')`).
- Wyliczyć obłożenie per dzień tygodnia i per godzina (% slotów z `working_hours` lub uproszczone „liczba wizyt / max w danym slocie").
- Empty-state: „Obłożenie pojawi się po pierwszych wizytach".

### 3. NoShowsReport — realne dane per-salon
- Dodać prop `isDemo?: boolean` + `dateRange`.
- `useQuery` na `appointments` gdzie `status = 'no_show'`, JOIN z `clients` po `client_id`.
- Trend miesięczny + top „uciekinierzy" liczone z DB. Brak danych → empty-state „Brak no-shows — gratulacje".

### 4. Przekazać `isDemo` z `AccountingModule` do tych trzech komponentów (obecnie nie jest przekazywane).

### 5. Ukryty back-test izolacji per-salon

Po wprowadzeniu zmian uruchomię w sandboxie skrypt SQL (psql, BEZ migracji) na 2 realnych salonach (np. `91fa7aab…` i `ca3da012…`):

```text
1. INSERT 5 fikcyjnych appointments + 5 transactions dla salonu A,
   description="BACKTEST-<uuid>", łatwy do odfiltrowania.
2. INSERT 3 fikcyjnych transactions (1 'no_show', 2 'product') dla salonu B.
3. SELECT count + SUM(amount) WHERE salon_id=A  → musi zwrócić tylko A.
4. SELECT * WHERE salon_id=A AND description LIKE 'BACKTEST-%'
   z sesją RLS jako owner_id salonu B → musi zwrócić 0 wierszy
   (sprawdzenie polityki "Only owners can view transactions").
5. Uruchomić ten sam query co useQuery w AccountingModule
   dla salonu A — potwierdzić, że dane wracają i mają poprawne pola.
6. DELETE FROM transactions/appointments WHERE description LIKE 'BACKTEST-%';
   final SELECT count = 0.
```

Wyniki zaraportuję jako tabelę w odpowiedzi. Nic nie zostanie w bazie — wszystko z markerem `BACKTEST-` usuwane na końcu. Nie pokażę back-testu w UI, to czysto serwerowa walidacja.

## Czego NIE ruszam

- Empty-state na poziomie `AccountingModule` (już dobry).
- Pozostałych pod-zakładek mających już `isDemo`.
- Schematu DB — nie tworzę migracji.
- Edge functions.

## Akceptacja
- Nowy salon (0 transakcji): cały moduł = jeden komunikat „Brak danych księgowych".
- Salon z 1 transakcją usługową: tab „Sprzedaż produktów" = empty-state, „Obłożenie" = realne liczby z 1 wizyty, „No-shows" = empty-state. Zero pozycji „Serum witaminowe C 30ml" / „Monika Zawadzka" itd.
- Back-test pokazuje 0 wycieków między salonami.
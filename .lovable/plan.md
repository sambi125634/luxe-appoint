

# Plan: Naprawa modulu Raporty — eksport danych + spójność danych demo

## Zidentyfikowane problemy

1. **Przyciski "Eksport CSV" i "Pobierz PDF" w filtrach globalnych** — pokazują toast "Możesz pobrać poniżej" ale nic nie pobierają
2. **Przyciski CSV w SalesVatReport i VouchersReport** — nie robią nic (brak onClick / pusty handler)
3. **Zakładka Eksport** — przycisk "Pobierz" w historii eksportów ma `href="#"`, nie pobiera niczego
4. **Daty mock danych to styczeń 2024** — ale domyślny zakres filtra to bieżący miesiąc → wykresy i karty KPI pokazują puste/zerowe dane
5. **DailyCashUp** — nie filtruje po dateRange, zawsze pokazuje wszystkie wpisy
6. **SalesVatReport** — zawsze używa mockTransactions bezpośrednio, ignoruje dateRange

## Rozwiązania

### 1. Zmiana dat mock danych na dynamiczne (bieżący miesiąc)
**Plik:** `mockData.ts`

Zamiast hardcoded dat "2024-01-XX", daty będą generowane dynamicznie relative to `new Date()` (np. dzisiaj, wczoraj, 2 dni temu, itd.). Dzięki temu domyślny filtr (bieżący miesiąc) pokaże dane.

Dotyczy: `mockTransactions`, `mockDailyClosings`, `mockProductSales` (w ProductSalesAccountingReport), `mockAccountingExports`.

### 2. Globalne przyciski eksportu — faktyczny eksport CSV
**Plik:** `AccountingModule.tsx`

- `handleExportCSV`: zamiast toasta, wywoła `exportToCSV()` z pełnymi danymi transakcji z bieżącego widoku
- `handleExportPDF`: toast z informacją "PDF w przygotowaniu" (brak natywnego generowania PDF w przeglądarce — zostawiamy jako placeholder z jasnym komunikatem)

### 3. SalesVatReport — dodać działający eksport CSV
**Plik:** `SalesVatReport.tsx`

- Przycisk CSV → wywoła `exportToCSV()` z przefiltrowanymi transakcjami (netto/VAT/brutto per transakcja)
- Filtrowanie po dateRange (obecnie ignorowane)

### 4. VouchersReport — dodać działający eksport CSV
**Plik:** `VouchersReport.tsx`

- Przycisk CSV → wywoła `exportToCSV()` z przefiltrowanymi voucherami

### 5. DailyCashUp — filtrowanie po dateRange + eksport
**Plik:** `DailyCashUp.tsx`

- Filtrować `closings` po `dateRange`
- Przyciski PDF/CSV per wiersz → wywołać odpowiedni eksport dziennego raportu

### 6. ExportSection — faktyczne pobieranie pliku
**Plik:** `ExportSection.tsx`

- Przycisk "Generuj" → generuje CSV/XLSX z mockTransactions i uruchamia download
- Przycisk "Pobierz" w historii → ponownie generuje i pobiera plik

### 7. Weryfikacja spójności danych
- `mockDailyClosings` sumy (services + products) muszą zgadzać się z sumą transakcji z tego dnia
- Prowizje (30% od usług, 10% od produktów) muszą się zgadzać z danymi w `mockEmployeeCommissions`

## Pliki do zmiany

| Plik | Zmiana |
|------|--------|
| `src/components/admin/accounting/mockData.ts` | Daty dynamiczne (bieżący miesiąc) |
| `src/components/admin/accounting/AccountingModule.tsx` | Globalny eksport CSV działa |
| `src/components/admin/accounting/AccountingFilters.tsx` | Przekazanie transactions do eksportu |
| `src/components/admin/accounting/SalesVatReport.tsx` | Eksport CSV + filtr dateRange |
| `src/components/admin/accounting/VouchersReport.tsx` | Eksport CSV działa |
| `src/components/admin/accounting/DailyCashUp.tsx` | Filtr dateRange + eksport per dzień |
| `src/components/admin/accounting/ExportSection.tsx` | Faktyczny download pliku |
| `src/components/admin/accounting/ProductSalesAccountingReport.tsx` | Daty dynamiczne w local mock |


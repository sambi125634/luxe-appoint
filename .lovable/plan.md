

# Plan: Rozbudowa dashboardu Raporty — dodatkowe wykresy i statystyki

## Obecny stan
Dashboard ma 6 KPI + 7 wykresów. Solidna baza, ale brakuje analiz, które naprawdę odróżnią nas od konkurencji (Booksy, Fresha, Vagaro — żaden z nich nie oferuje tak głębokiej analityki w jednym miejscu).

## Nowe elementy (9 dodatkowych wizualizacji)

### Nowe KPI (rozszerzenie do 2 rzędów — 6+4 = 10 KPI)
1. **Rabaty łącznie** — ile przychodu "ucieka" na zniżkach
2. **Usługi / Produkty split** — % podziału przychodu
3. **Średnia transakcja na pracownika** — efektywność zespołu
4. **Anulowane transakcje** — liczba + wartość stracona

### Nowe wykresy

5. **Dzień tygodnia — heatmap** (bar chart, pon-nd) — kiedy salon zarabia najwięcej. Pomaga planować promocje i grafik.

6. **Analiza rabatów** (donut chart) — podział: pełna cena vs rabat vs voucher. Pokazuje ile przychodu traci się na zniżkach — żaden konkurent tego nie robi.

7. **Produktywność pracowników** (grouped bar) — przychód/godz. pracy per pracownik. Nie tylko "kto zarobił ile", ale "kto zarabia najefektywniej".

8. **Klienci powracający vs nowi** (stacked area) — trend dzień po dniu. Kluczowy insight retencyjny.

9. **Tabela podsumowania VAT** — mini-tabela ze stawkami VAT, netto, VAT, brutto. Gotowe dane dla księgowej.

### Rozszerzenie istniejących
- **KPI cards**: dodanie mini-trendów (strzałki up/down porównanie z poprzednim okresem)

## Układ wizualny

```text
ROW 1 KPI: [Przychód] [Bieżący msc] [Śr. dzienna] [Transakcje] [Śr. koszyk] [Napiwki]
ROW 2 KPI: [Rabaty Σ] [Usługi/Prod %] [Śr./pracow.] [Anulowane]

FULL WIDTH: Trend sprzedaży (area — istniejący)

2-COL: [Metody płatności (pie)]     [Top 5 usług/produktów (bar)]
2-COL: [Sprzedaż wg kategorii]      [Przychód wg pracownika]
2-COL: [Analiza rabatów (donut)]     [Produktywność pracowników (grouped bar)]

FULL WIDTH: Rozkład godzinowy (istniejący)
FULL WIDTH: Przychód wg dnia tygodnia (bar pon-nd)
FULL WIDTH: Klienci powracający vs nowi (stacked area)
FULL WIDTH: Porównanie miesięczne 4 msc (istniejący)
FULL WIDTH: Tabela VAT (mini-table)
```

## Dlaczego te, a nie inne

| Wizualizacja | Przewaga nad konkurencją |
|---|---|
| Rabaty donut | Booksy/Fresha nie pokazują ile tracisz na zniżkach |
| Produktywność/godz. | Vagaro pokazuje przychód, nie efektywność godzinową |
| Dzień tygodnia | Żaden konkurent nie podpowiada "kiedy warto otworzyć" |
| Nowi vs powracający | Retencja w raporcie finansowym — unikalny insight |
| Tabela VAT | Gotowe dane do przekazania księgowej — oszczędność czasu |
| Anulowane KPI | Booksy nie pokazuje "ile stracono" — tylko historię |

## Dane
Wszystkie obliczenia z istniejących `transactions` (mockData). Nowe pola: `discountAmount`, `status`, `clientId`, `staffName` — już dostępne w typie `Transaction`. Dla "nowi vs powracający" — liczymy unikalne `clientId` per dzień (pierwszy dzień pojawienia się = nowy).

## Plik do zmiany

| Plik | Zmiana |
|------|--------|
| `src/components/admin/accounting/AccountingCharts.tsx` | +4 KPI, +5 nowych wykresów/tabel, rozszerzenie layoutu |

Mock data i typy pozostają bez zmian — wszystkie dane są już dostępne.


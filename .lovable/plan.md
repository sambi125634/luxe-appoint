

# Plan: Rozbudowa głównego dashboardu Raporty

## Obecny stan
Dashboard "Wykresy" zawiera:
- 3 karty KPI (przychód w okresie, bieżący miesiąc, średnia dzienna)
- Wykres trendu sprzedaży (Area chart — usługi vs produkty)
- Pie chart metod płatności
- Bar chart kategorii
- Porównanie miesięczne (2 słupki)

To jest zbyt mało jak na główny hub raportowy. Brakuje kluczowych informacji, które właściciel salonu potrzebuje na pierwszy rzut oka.

## Proponowane rozszerzenia

### Nowe karty KPI (rozszerzenie z 3 do 6)
Dodać:
- **Liczba transakcji** — ile wizyt/sprzedaży w okresie
- **Średni koszyk** — średnia wartość jednej transakcji
- **Napiwki łącznie** — suma napiwków w okresie (motywacja dla personelu)

### Nowe wykresy (4 dodatkowe)

1. **Przychód wg pracownika** (horizontal bar chart) — kto generuje najwięcej przychodu. Bezpośrednio przydatne do oceny efektywności zespołu.

2. **Rozkład godzinowy sprzedaży** (bar chart, oś X = godziny 8-20) — w jakich godzinach salon zarabia najwięcej. Pomaga optymalizować grafik i promocje.

3. **Usługi vs Produkty — trend dzienny** (stacked bar chart zamiast obecnego area) — osobna wizualizacja proporcji usługi/produkty dzień po dniu. Obecny area chart zostaje, ale dodajemy nowy widok proporcji.

4. **Top 5 usług/produktów** (horizontal bar chart) — które konkretne pozycje sprzedają się najlepiej. Kluczowe dla decyzji cenowych i marketingowych.

### Ulepszenia istniejących

- **Porównanie miesięczne** — rozszerzyć do 3 miesięcy wstecz (4 słupki zamiast 2) z osobnym podziałem na usługi/produkty (stacked bar).
- Dodać mini-sparkline w kartach KPI tam, gdzie to sensowne (przychód w okresie).

## Układ wizualny

```text
┌─────────────┬─────────────┬─────────────┬─────────────┬──────────────┬──────────────┐
│ Przychód    │ Bieżący     │ Średnia     │ Transakcje  │ Średni       │ Napiwki      │
│ w okresie   │ miesiąc     │ dzienna     │ w okresie   │ koszyk       │ łącznie      │
└─────────────┴─────────────┴─────────────┴─────────────┴──────────────┴──────────────┘
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                        Trend sprzedaży (Area chart — jak jest)                       │
└──────────────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────┬────────────────────────────────────────────────────┐
│   Metody płatności (Pie)        │   Top 5 usług/produktów (horizontal bar)           │
└─────────────────────────────────┴────────────────────────────────────────────────────┘
┌─────────────────────────────────┬────────────────────────────────────────────────────┐
│   Sprzedaż wg kategorii (Bar)  │   Przychód wg pracownika (horizontal bar)          │
└─────────────────────────────────┴────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                   Rozkład godzinowy sprzedaży (Bar chart)                            │
└──────────────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────────────┐
│              Porównanie miesięczne — 4 miesiące, stacked usługi/produkty             │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

## Dlaczego te wykresy, a nie inne

| Wykres | Cel biznesowy |
|--------|---------------|
| Przychód wg pracownika | Ocena efektywności zespołu, planowanie premii |
| Rozkład godzinowy | Optymalizacja grafiku, promocje "happy hour" |
| Top 5 usług/produktów | Decyzje cenowe, co promować w marketingu |
| Porównanie 4-miesięczne | Wykrywanie trendów sezonowych |
| Średni koszyk KPI | Monitorowanie upsellingu |
| Napiwki KPI | Motywacja personelu, jakość obsługi |

## Plik do zmiany

| Plik | Zmiana |
|------|--------|
| `src/components/admin/accounting/AccountingCharts.tsx` | Dodanie 3 nowych KPI + 4 nowych wykresów + rozszerzenie porównania miesięcznego |

Wszystkie dane będą obliczane z istniejących `transactions` (mock lub DB) — bez potrzeby zmiany mockData ani typów.


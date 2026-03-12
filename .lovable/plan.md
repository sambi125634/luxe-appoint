

# Plan: Filtrowanie dat + rozbudowane dane demo

## Problem
1. **Mock data ma tylko 10 transakcji z 3 dni** — za mało danych, żeby zmiana zakresu dat miała sens
2. **W trybie demo transakcje nie są filtrowane po dacie** — `AccountingModule` przekazuje cały `mockTransactions` bez filtrowania po `dateRange`

## Rozwiązanie

### 1. Rozbudowa mockData.ts — 90 dni danych
Wygenerować ~120-150 transakcji rozłożonych na ostatnie **90 dni**, z realistyczną zmiennością:
- Różne godziny, różni pracownicy (3 osoby), różni klienci (~20 unikalnych)
- Mix usług i produktów, różne kategorie, metody płatności
- Dni weekendowe z wyższym obrotem, weekdniowe z niższym
- Sporadyczne rabaty i vouchery
- Kilka transakcji anulowanych
- Realistyczny rozkład godzinowy (9:00-19:00)

Użyję generatora pętlowego z losowością deterministyczną (seed-based), żeby dane były stabilne między renderami.

### 2. Filtrowanie po dacie w AccountingModule
W `AccountingModule`, w `useMemo` dla demo:
```typescript
const transactions = useMemo(() => {
  if (isDemo) {
    return mockTransactions.filter(t => {
      const d = parseISO(t.dateTime);
      return d >= filters.dateRange.from && d <= filters.dateRange.to;
    });
  }
  return [...(dbTransactions || []), ...manualTransactions];
}, [isDemo, dbTransactions, manualTransactions, filters.dateRange]);
```

To jedyna zmiana potrzebna — `AccountingCharts` już oblicza wszystko z `transactions` prop.

## Pliki do zmiany

| Plik | Zmiana |
|------|--------|
| `src/components/admin/accounting/mockData.ts` | Rozbudowa z 10 → ~150 transakcji na 90 dni |
| `src/components/admin/accounting/AccountingModule.tsx` | Dodanie filtrowania `mockTransactions` po `dateRange` w trybie demo |


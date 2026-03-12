

# Plan: Demo dane mockowe dla True Profit Analytics

## Problem
`TrueProfitDashboard` przyjmuje `isDemo` ale zawsze wywołuje `useTrueProfit()`, który zależy od `useSalonId()` (null w demo). Wszystkie dane są puste.

## Rozwiazanie
Dodac funkcje `useDemoTrueProfit()` z realistycznymi danymi mockowymi i przełączyć w dashboardzie na podstawie `isDemo`.

### Dane mockowe (realistyczne dla salonu kosmetologicznego)

**Today Summary**: Przychod 1 840 zł, True Profit 780 zł (~42% marzy), best service "Mezoterapia igłowa" 165 zł/h

**Monthly Summary**: Przychod 38 500 zł, materialy 4 200 zł, pracownicy 12 600 zł, CAC 1 850 zł, True Profit 19 850 zł (51.6%), +12.3% vs poprzedni miesiąc

**Service Profit Ranking** (8 usług):
- Mezoterapia igłowa: 350 zł, mat 42 zł, 60 min → TP/h 273 zł, 18 wykonań
- Peeling chemiczny: 200 zł, mat 28 zł, 45 min → TP/h 204 zł, 22 wyk.
- Laser frakcyjny: 500 zł, mat 85 zł, 90 min → TP/h 225 zł, 8 wyk.
- Manicure hybrydowy: 120 zł, mat 18 zł, 60 min → TP/h 67 zł, 45 wyk.
- itd.

**Client LTV Ranking** (12 klientek):
- Anna Kowalska: 8 400 zł, 24 wizyty, źródło Instagram, CAC 35
- itd.

### Pliki do zmiany

| Plik | Zmiana |
|------|--------|
| `src/hooks/useTrueProfit.ts` | Dodac eksportowaną funkcje `getDemoTrueProfitData()` zwracajaca kompletny obiekt mockowy (te same typy co hook) |
| `src/modules/analytics/TrueProfitDashboard.tsx` | W demo: uzyc `getDemoTrueProfitData()` zamiast `useTrueProfit()`, ukryc warning i setup wizard |

Podejscie analogiczne do Receptur — mock data inline, zero zaleznosci od Supabase w demo.


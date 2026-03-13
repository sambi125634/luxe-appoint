

# Plan: Podłączenie przycisków w ProfitSetupWizard do nawigacji

## Problem
Przyciski „Przejdź do personelu", „Przejdź do magazynu", „Przejdź do klientek" w `ProfitSetupWizard` nie mają żadnego `onClick` — to puste `<Button>` bez akcji.

## Rozwiązanie
Dodać callback `onNavigate` do `ProfitSetupWizard`, który zmienia aktywną zakładkę w `AdminDashboard`. Każdy przycisk wywoła odpowiednią nawigację:

- Krok 1 (Stawki pracowników) → `staff`
- Krok 2 (Koszty materiałów) → `products`  
- Krok 3 (Źródła klientek) → `clients`

## Zmiany w plikach

| Plik | Zmiana |
|------|--------|
| `src/modules/analytics/ProfitSetupWizard.tsx` | Dodać prop `onNavigate?: (tab: string) => void`, przekazać `onAction` do `StepCard`, podpiąć `onClick` na przyciskach |
| `src/modules/analytics/TrueProfitDashboard.tsx` | Dodać prop `onNavigate` i przekazać do `ProfitSetupWizard` |
| `src/pages/AdminDashboard.tsx` | Przekazać `onNavigate={setActiveTab}` do `TrueProfitDashboard` |

Zmiana minimalna — 3 pliki, dodanie jednego propa przepływającego w dół.




# Plan: Naprawa panelu admina — brakujące tłumaczenia i przegląd modułów

## Znaleziony krytyczny bug

W plikach `pl.json` i `en.json` klucz `"admin"` jest **zduplikowany** — pojawia się na linii ~330 (z pełną listą 18 tłumaczeń) i ponownie na linii ~1292 (z tylko 2 kluczami: `trueProfit`, `consultation`). W JSON ostatni klucz wygrywa, więc **cały blok tłumaczeń sidebara jest nadpisywany** i pozostają tylko 2 wpisy.

To powoduje, że `t("admin.dashboard")` zwraca fallback `"admin.dashboard"` zamiast `"Dashboard"`, a etykiety w sidebarze wyświetlają się jako surowe klucze lub są puste.

## Plan napraw (4 kroki)

### Krok 1: Naprawić duplikat klucza `"admin"` w pl.json i en.json
- Przenieść `trueProfit` i `consultation` do pierwszego bloku `"admin"` (linia ~330)
- Usunąć drugi blok `"admin"` (linia ~1292)
- Wynik: sidebar wyświetla poprawne polskie/angielskie nazwy zakładek

### Krok 2: Przegląd każdego modułu w trybie produkcyjnym (bez `isDemo`)
Moduły, które wymagają weryfikacji poprawnego zachowania w produkcji (empty state lub real data):
- **Pipeline** — empty state z komunikatem konfiguracji (OK, działa)
- **Retention** — hookuje się do Supabase, puste dane → powinien wyświetlić KPI z zerami
- **Pixel** — bez `isDemo` pokazuje setup wizard (OK)
- **True Profit** — wyświetla szacunkowe dane z ostrzeżeniem (OK)
- **Consultation** — korzysta z tłumaczeń z klucza `consultation` (OK po naprawie admin)
- **Referral** — bez `isDemo` wyświetla zera (OK)
- **Inventory** — sprawdzić czy ma poprawny empty state
- **Products, Accounting, Conversations, Stats, Support** — zweryfikować brak crashy

### Krok 3: Weryfikacja, że AdminDashboard renderuje wszystkie 20 modułów
- Sidebar: 20 elementów w `allNavItems` — potwierdzone identyczne z demo
- `renderContent()` — potwierdzone, pokrywa wszystkie 20 tabów
- Filtr staff — ukrywa 5 tabów tylko dla roli `staff`

### Krok 4: Test end-to-end
- Po naprawie tłumaczeń zweryfikować sidebar w podglądzie na zalogowanym koncie

## Zakres zmian

| Plik | Zmiana |
|------|--------|
| `src/i18n/locales/pl.json` | Scalenie duplikatu `admin` — dodanie `trueProfit`, `consultation` do głównego bloku, usunięcie zdublowanego |
| `src/i18n/locales/en.json` | Identyczna naprawa |

Zmiana dotyczy wyłącznie 2 plików tłumaczeń. Żaden komponent nie wymaga modyfikacji — sidebar i moduły są już poprawnie zaimplementowane.




# Plan: Rozbudowa zakładki Receptury

## Problem
1. **W trybie demo nic nie działa** — `useServices()` korzysta z `useSalonId()` (zwraca null w demo), więc lista usług jest pusta. `useServiceRecipes()` odpytuje bazę z "demo-salon-id" — brak danych.
2. **Brak instrukcji** — użytkownik nie wie czemu służą receptury i jaki jest efekt końcowy.

## Rozwiązanie

### 1. Instrukcja na górze (SectionGuide)
Dodać wpis `recipes` do `SectionGuide` z wyjaśnieniem:
- **Cel**: Przypisz produkty zużywane przy każdej usłudze → system automatycznie liczy koszt materiałów i realny zysk (True Profit)
- **Kroki**: Wybierz usługę → dodaj produkty z ilościami → zobacz kalkulację marży
- **Korzyść**: Wiesz ile naprawdę zarabiasz na każdej usłudze po odjęciu kosztów materiałów

### 2. Demo mode — dane mockowe
W `ServiceRecipes.tsx`:
- Dodać lokalne `DEMO_SERVICES` (te same co w ServicesManagement — Peeling, Mezoterapia, Manicure itd.)
- Dodać `DEMO_RECIPES` — kilka przykładowych receptur (np. Manicure hybrydowy → Baza + Lakier + Top coat + Waciki)
- W demo: zamiast hooków DB, użyć lokalnego stanu z mockami
- Dodawanie/usuwanie składników działa na lokalnym stanie (bez Supabase)

### 3. Rozbudowa UI
- Wyświetlić listę wszystkich usług z ikonką wskazującą czy mają recepturę (badge z liczbą składników)
- Po wybraniu usługi — formularz dodawania + lista składników + True Profit card (już istnieje)
- Dodać pusty stan z CTA gdy usługa nie ma jeszcze receptury

## Pliki do zmiany

| Plik | Zmiana |
|------|--------|
| `src/components/admin/SectionGuide.tsx` | Dodanie wpisu `recipes` |
| `src/modules/inventory/ServiceRecipes.tsx` | Demo data, lokalny stan w demo, lista usług z badge, pusty stan |


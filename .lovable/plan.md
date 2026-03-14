

# Podpięcie sekcji usług do bazy danych w Quick Sale

## Problem
`ServiceSaleSection` korzysta wyłącznie z hardcodowanych danych demo (`DEMO_SERVICES`). Nie pobiera prawdziwych usług z bazy danych, więc w trybie produkcyjnym lista jest statyczna i nie odzwierciedla oferty salonu.

## Zmiany

### 1. `ServiceSaleSection.tsx` — pobieranie usług z bazy
- Dodanie hooka `useServices()` z `@/hooks/useServices` oraz `useServiceCategories()` do pobrania nazw kategorii.
- Typ `DemoService` zostaje jako interfejs wewnętrzny, ale dane pochodzą z bazy: mapowanie `dbServices` na `{ id, name, price, category }`.
- Fallback na `DEMO_SERVICES` tylko gdy brak danych z DB (np. tryb demo).
- Dodanie prop `salonId?: string` (analogicznie do `ProductSaleSection`) i stanu ładowania (`Loader2`).

### 2. `QuickProductSale.tsx` — przekazanie `salonId` do `ServiceSaleSection`
- Dodanie propa `salonId` do `<ServiceSaleSection>` (linia 220), tak samo jak już jest przekazywany do `<ProductSaleSection>`.

### Pliki do edycji
1. `src/components/admin/products/ServiceSaleSection.tsx`
2. `src/components/admin/products/QuickProductSale.tsx` (jedna linia)

Bez zmian w bazie danych.


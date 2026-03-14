

# Naprawa: produkty nie wyświetlają się + brak widocznej sekcji usług w modalu wizyty

## Problem 1: Produkty nie ładują się
`ProductSaleSection` w `AppointmentModal` (linia 445) jest wywołany **bez `salonId`**. Hook `useProducts(undefined)` ma `enabled: !!salonId`, więc zapytanie nigdy się nie wykonuje — lista jest zawsze pusta.

**Fix**: Przekazać `salonId` do `ProductSaleSection`. W trybie demo → `"demo-salon-id"`, w produkcji → prawdziwe `salonId`. Dodać prop `salonId` do `AppointmentModalProps`.

## Problem 2: Sekcja usług istnieje, ale może być niewidoczna
Sekcja usług (Select z ikoną nożyczek) jest w kodzie (linie 324-356), ale na screenie użytkownika jej nie widać. Prawdopodobnie Select renderuje się poprawnie, ale użytkownik mógł go przeoczyć. Warto upewnić się, że sekcja jest bardziej wyraźna.

## Zmiany

### `AppointmentModal.tsx`
1. Dodać prop `salonId?: string` do interfejsu.
2. Przekazać `salonId` do `<ProductSaleSection salonId={salonId || (isDemo ? "demo-salon-id" : undefined)} />`.

### `ClientsManagement.tsx`
1. Przekazać `salonId` z `useSalonId()` (już importowany) do `<AppointmentModal salonId={salonId || (isDemo ? "demo-salon-id" : undefined)} />`.

### Pliki do edycji
1. `src/components/admin/AppointmentModal.tsx` — nowy prop + przekazanie do ProductSaleSection
2. `src/components/admin/ClientsManagement.tsx` — przekazanie salonId


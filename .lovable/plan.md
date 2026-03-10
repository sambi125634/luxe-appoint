

# Demo produktów — mock data + interaktywne przyciski

## Problem
1. **ProductsModule nie przyjmuje `isDemo`** — używa `useSalonId()` który w demo (brak auth) zwraca null, fallback na "demo-salon-id" działa, ale mutacje (dodaj/edytuj/usuń) biją do Supabase i failują
2. **useStockMovements nie ma demo mock data** — zakładka "Dostawy" jest pusta w demo
3. **Mutacje w demo mode** — create/update/delete produktów, dostawców, korekt magazynowych próbują pisać do bazy i zwracają błąd

## Rozwiązanie

### 1. `useStockMovements.ts` — dodać mock data dla demo
- Dodać `DEMO_SALON_ID` i tablicę `mockMovements` z 5-6 przykładowymi dostawami i korektami (powiązane z istniejącymi mock produktami i dostawcami)
- W `queryFn` — jeśli `isDemo`, zwracać mockMovements
- W mutacjach (`createMovement`, `createDelivery`, `createCorrection`) — jeśli demo, symulować sukces z toast i invalidate bez zapisu do bazy

### 2. `useProducts.ts` — obsługa mutacji w demo
- W `createProduct`, `updateProduct`, `deleteProduct`, `updateStock` — jeśli `isDemo`, operować na local state (invalidate query z nowym mockiem) zamiast bić do Supabase
- Pokazywać toast sukcesu tak samo jak w produkcji

### 3. `useSuppliers.ts` — obsługa mutacji w demo
- Analogicznie — mutacje w demo mode symulują sukces bez zapisu do bazy

### 4. Wzbogacenie mock produktów
- Rozszerzyć listę do 10+ produktów z realistycznymi nazwami (profesjonalne kosmetyki salonowe)
- Zróżnicowane stany magazynowe: kilka OK, kilka low stock, 1-2 out of stock
- Powiązanie z mock dostawcami przez `supplier_id`

## Pliki do edycji

| Plik | Zmiana |
|------|--------|
| `src/hooks/useStockMovements.ts` | Mock data + demo guard w mutacjach |
| `src/hooks/useProducts.ts` | Demo guard w mutacjach (toast bez Supabase) |
| `src/hooks/useSuppliers.ts` | Demo guard w mutacjach |


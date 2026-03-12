

# Plan: Połączenie modułów Produkty i Magazyn w jeden

## Problem
Dwa osobne moduły (Produkty i Magazyn/Inventory) w dużej mierze się duplikują — oba pokazują stany produktów i dostawy. Magazyn dodaje jedynie Receptury i Statystyki.

## Rozwiązanie
Przenieść unikalne zakładki z Magazynu (Receptury, Statystyki) do modułu Produkty i usunąć Magazyn z sidebara.

### Nowy układ zakładek w Produkty:
1. Katalog (istniejący)
2. Magazyn/Stan (istniejący)
3. Receptury (z modułu Inventory — `ServiceRecipes`)
4. Dostawy (istniejący)
5. Statystyki magazynowe (z modułu Inventory — `InventoryStats`)
6. Raport sprzedaży (istniejący)
7. Dostawcy (istniejący)

### Zmiany w plikach

| Plik | Zmiana |
|------|--------|
| `src/components/admin/products/ProductsModule.tsx` | Dodanie 2 nowych zakładek: Receptury i Statystyki (import z `modules/inventory`) |
| `src/components/admin/products/types.ts` | Rozszerzenie `ProductTab` o `'recipes' \| 'inv-stats'` |
| `src/components/admin/AdminSidebar.tsx` | Usunięcie wpisu "inventory" z nawigacji |
| `src/pages/AdminDashboard.tsx` | Usunięcie renderowania `InventoryDashboard` dla taba "inventory" |

Moduły `modules/inventory/*` pozostają jako pliki (nie usuwamy kodu), ale nie są już dostępne jako osobna sekcja w sidebarze.


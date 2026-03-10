

# Fix: Produkty nie wyświetlają się w demo

## Problem
W `DemoPage.tsx` linia 89: `<ProductsModule />` nie otrzymuje `isDemo` propa. Jednocześnie użytkownik jest zalogowany, więc `useSalonId()` zwraca prawdziwy salon_id (`58ca9a20...`), a nie `demo-salon-id`. W rezultacie hook `useProducts` odpytuje bazę danych zamiast zwracać mock data — i dostaje pustą tablicę.

## Rozwiązanie

### 1. `ProductsModule.tsx` — dodać prop `isDemo`
- Dodać `isDemo?: boolean` do komponentu
- Gdy `isDemo === true`, użyć `DEMO_SALON_ID` zamiast prawdziwego `salonId`

### 2. `DemoPage.tsx` — przekazać `isDemo`
- Zmienić `<ProductsModule />` na `<ProductsModule isDemo />`

## Pliki do edycji

| Plik | Zmiana |
|------|--------|
| `src/components/admin/products/ProductsModule.tsx` | Dodać prop `isDemo`, użyć `DEMO_SALON_ID` gdy true |
| `src/pages/DemoPage.tsx` | Dodać `isDemo` do `<ProductsModule />` |


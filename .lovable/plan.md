

# Plan: Moduł Inventory Scanner z True Profit i Recepturami

## Zakres

Nowy moduł `/src/modules/inventory/` rozszerzający istniejący system produktów o: zaawansowany skaner z globalną bazą EAN, receptury produktów per usługa (service_product_recipes), automatyczne odejmowanie stanów po wizycie, True Profit per usługa, tryb przyjęcia dostawy i statystyki magazynowe.

## 1. Migracja — 2 nowe tabele

```sql
-- Receptury: jakie produkty zużywa każda usługa
CREATE TABLE service_product_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL,
  service_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity_used numeric NOT NULL DEFAULT 1,
  unit text DEFAULT 'szt', -- szt/ml/g
  created_at timestamptz DEFAULT now(),
  UNIQUE(salon_id, service_id, product_id)
);

-- Globalna baza produktów kosmetycznych (EAN lookup)
CREATE TABLE beauty_products_db (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text,
  category text,
  capacity text,
  avg_wholesale_price numeric,
  image_url text,
  created_at timestamptz DEFAULT now(),
  ean text NOT NULL UNIQUE,
  name text NOT NULL
);
```

RLS: `service_product_recipes` — salon owner pattern. `beauty_products_db` — public SELECT, super_admin ALL.

## 2. Nowe pliki

### `src/modules/inventory/InventoryScanner.tsx`
Główny komponent skanera:
- FAB button z 3 opcjami: Skanuj kod | Dodaj ręcznie | Przyjmij dostawę
- Skanowanie: reużywa istniejący `BarcodeScanner` (html5-qrcode)
- Po skanie: 1) szukaj w `products` (salon), 2) szukaj w `beauty_products_db` (global), 3) formularz nowego produktu
- Modal wyniku z akcjami: aktualizuj stan / dodaj do katalogu

### `src/modules/inventory/DeliveryMode.tsx`
Tryb przyjęcia dostawy:
- Skanuj produkty jeden po drugim → +X do stanu
- Pole faktury i zdjęcie paragonu (upload do salon-media bucket)
- Lista zeskanowanych produktów z podsumowaniem wartości

### `src/modules/inventory/ServiceRecipes.tsx`
Konfiguracja receptur:
- Wybierz usługę → dodaj produkty z ilością zużycia
- Podgląd kosztu materiałowego per usługa
- True Profit formula: Cena - Materiały - Czas pracownika - Akwizycja
- Progress bar marżowości

### `src/modules/inventory/InventoryStats.tsx`
Statystyki:
- Łączna wartość magazynu
- Zużycie miesięczne (ranking)
- Koszt materiałów/miesiąc
- % kosztów materiałowych w przychodzie

### `src/modules/inventory/InventoryDashboard.tsx`
Główny widok łączący:
- Grid kart produktów z color-coded stanami (zielony/żółty/czerwony)
- Tabs: Magazyn | Receptury | Statystyki | Przyjęcie dostawy
- Sticky FAB

### `src/modules/inventory/index.ts`
Eksporty modułu.

### `src/hooks/useServiceRecipes.ts`
Hook do CRUD receptur + kalkulacji kosztu materiałowego per usługa.

## 3. Integracja

| Plik | Zmiana |
|------|--------|
| `src/pages/AdminDashboard.tsx` | Dodanie "inventory" tab renderującego `InventoryDashboard` |
| `src/components/admin/AdminSidebar.tsx` | Nowy nav item "Magazyn" (ikona `ScanLine`) |
| `src/pages/DemoPage.tsx` | Rejestracja modułu inventory w demo |

## 4. Logika automatycznego odejmowania

W `ServiceRecipes` — konfiguracja. Faktyczne automatyczne odejmowanie po ukończeniu wizyty to przyszły krok (edge function trigger na `appointments.status = 'completed'`). Na razie: UI do konfiguracji receptur + ręczny przycisk "Odejmij materiały" przy wizytach.

## Uwagi
- Skaner reużywa istniejący `BarcodeScanner` z html5-qrcode (EAN-13, EAN-8, QR, Code128)
- `beauty_products_db` startuje z seed data (popularne polskie marki kosmetyczne) — dodamy w przyszłości
- True Profit kalkulacja: czysto frontendowa na podstawie receptur + ceny usługi
- Mobile-first: karty zamiast tabeli, duże przyciski skanowania


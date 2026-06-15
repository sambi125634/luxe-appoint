## Cel

W wersji demo (`/demo`) zrobić dwie rzeczy:
1. Zmienić nazwę zakładki **„Widgety"** na **„Widgety rezerwacji"** (czytelniej dla klienta).
2. Przyciski **„Otwórz / Podgląd"** w karcie widgetu mają w demo prowadzić na produkcyjną domenę `https://calendar.beauty-funnels.com/s/demo-salon` (a nie na osadzony preview Lovable, który blokuje iframe).

## Zmiany

### 1. Nazwa zakładki
- `src/i18n/locales/pl.json` — klucz `admin.widgets`: `"Widgety"` → `"Widgety rezerwacji"`
- `src/i18n/locales/en.json` — `admin.widgets`: `"Widgets"` → `"Booking widgets"`

(Klucz jest używany w sidebarze i w tytule strony w `DemoPage`, więc jedna zmiana pokrywa wszystkie miejsca.)

### 2. Link „Podgląd / Kopiuj link" w demo
W `src/components/admin/widgets/WidgetsManagement.tsx`, funkcja `getDemoOrRealUrl`:

```ts
if (isDemo) {
  return "https://calendar.beauty-funnels.com/s/demo-salon";
}
```

To samo dla embed (modal `EmbedCodeModal`) — kiedy `isDemo` jest aktywne, podawać domenę `calendar.beauty-funnels.com` zamiast `window.location.origin`. Przekażę `isDemo` jako prop do `EmbedCodeModal` i użyję jej w `getWidgetUrl`.

Dzięki temu kliknięcie „Otwórz" / „Kopiuj link" / kod embed w demo wskazuje na realnie działający widget na podpiętej domenie.

## Co zostaje bez zmian
- Routing, RLS, dane demo, panel admin produkcyjny — bez zmian.
- Domena `calendar.beauty-funnels.com` jest już aktywna w projekcie (potwierdzone w `project_urls`), więc nic nie trzeba dokładać po stronie deploya.

## Po wdrożeniu
Trzeba kliknąć **Publish → Update** żeby zmiany trafiły na `admin.beauty-funnels.com` i `calendar.beauty-funnels.com` (frontend wymaga publikacji).

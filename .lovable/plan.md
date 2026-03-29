

# Naprawa podglądu widgetów w trybie demo

## Problem
Kliknięcie "Podgląd" w module Widgety (tryb demo) otwiera URL `/s/main` (lub `/s/black-friday`). `BookingPage` szuka salonu z tym slugiem w bazie danych, nie znajduje go, i wyświetla "Salon nie znaleziony".

Przycisk "Wypróbuj rezerwację" w prawym górnym rogu działa, bo kieruje na `/book/demo-salon` — slug rozpoznawany jako demo.

## Przyczyna
`handlePreview` wywołuje `getWidgetUrl(widget.slug)` co generuje `/s/{slug}`. Mock widgety mają slugi `main`, `black-friday`, `mezoterapia-promocja` — żaden z nich nie istnieje w bazie i żaden nie jest rozpoznawany jako demo przez `BookingPage`.

## Rozwiązanie

### `WidgetsManagement.tsx` — zmiana `handlePreview` dla demo
W trybie demo, zamiast otwierać `/s/{widget.slug}`, kieruj zawsze na `/book/demo-salon`:

```typescript
const handlePreview = (widget: BookingWidget) => {
  if (isDemo) {
    window.open(`${window.location.origin}/book/demo-salon`, '_blank');
  } else {
    window.open(getWidgetUrl(widget.slug), '_blank');
  }
};
```

Analogicznie zaktualizować `handleCopyLink` — w demo pokazuje link demo-salon, a nie fałszywy slug.

### Zakres zmian
- Jeden plik: `src/components/admin/widgets/WidgetsManagement.tsx`
- Dwie funkcje: `handlePreview`, `handleCopyLink`


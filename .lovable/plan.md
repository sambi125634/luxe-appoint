

## Plan: Połączenie sugestii slotów z asystentem AI kalendarza

### Problem
Trzy niezależne systemy sugestii terminów:
1. Widżet rezerwacji — hardcoded sloty `['10:00', '14:00', '14:30']`
2. Edge function `ai-slot-scoring` — analizuje luki, ale nikt jej nie wywołuje
3. Hook `useSmartSlots` — gotowy, ale nieużywany

### Rozwiązanie

**Krok 1: Podłączyć `useSmartSlots` w `DateTimeSelection.tsx`**
- Zaimportować hook `useSmartSlots`
- Wywołać go z `salonId` i wybraną datą
- Zastąpić hardcoded `recommendedSlots` i `popularSlots` danymi z hooka
- Zachować fallback na obecne wartości gdy hook zwraca puste dane (np. tryb demo bez salonId)

**Krok 2: Przekazać `salonId` do `DateTimeSelection`**
- Dodać prop `salonId` do interfejsu `DateTimeSelectionProps`
- W `BookingWidget.tsx` przekazać `salonId` (z konfiguracji widżetu) do `DateTimeSelection`
- W trybie demo przekazać `null` — hook użyje fallbacku

**Krok 3: Ulepszyć edge function `ai-slot-scoring`**
- Dodać obsługę `staffId` (jeśli użytkownik wybrał specjalistę, filtruj luki tylko dla niego)
- Dodać obsługę `serviceDuration` — slot jest "recommended" tylko jeśli luka jest wystarczająco duża na wybraną usługę
- Poprawić logikę scoringu: priorytet dla slotów które minimalizują luki (gap-filling)

### Efekt
- W trybie demo: fallback do obecnych hardcoded slotów (bez zmian wizualnych)
- W produkcji: polecane sloty = realne luki w kalendarzu danego salonu na wybrany dzień
- Asystent AI w kalendarzu admin i widżet rezerwacji korzystają z tego samego silnika (`ai-slot-scoring`)

### Pliki do edycji
1. `src/components/booking/DateTimeSelection.tsx` — podłączenie `useSmartSlots`, nowy prop `salonId`
2. `src/components/booking/BookingWidget.tsx` — przekazanie `salonId` do `DateTimeSelection`
3. `supabase/functions/ai-slot-scoring/index.ts` — uwzględnienie `serviceDuration` i lepszy scoring


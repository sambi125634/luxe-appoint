

# Poprawa Asystenta Grafiku — 3 problemy

## Problem 1: Ostrzeżenie o niskim obłożeniu za mało szczegółowe
Obecnie: "Wykryto 2 dni z obłożeniem poniżej 30%. Rozważ kampanię promocyjną." — brak konkretów.

**Rozwiązanie**: Zastąpić jednolinijkowy alert rozbudowaną sekcją z:
- Listą konkretnych dni z niskim obłożeniem (np. "Środa: Maria 22%, Anna 18%")
- 3 konkretne akcje do podjęcia:
  1. "Wyślij SMS do klientek z ostatniego miesiąca" → link do Retencji
  2. "Dodaj promocję -20% na te dni" → link do Widgetów
  3. "Przenieś wizytę z pełnego dnia" → sugestia konkretnego przeniesienia

## Problem 2: "Szukaj" — wynik nie aktualizuje się
Obecnie: hardcoded "Środa, 11 grudnia o 14:30, Maria Nowakowska" — nie reaguje na zmianę filtrów.

**Rozwiązanie**: 
- Dodać stan `searchResult` i `hasSearched`
- Po kliknięciu "Znajdź najbliższy termin" — generować dynamiczny wynik na podstawie wybranych filtrów (pracownik, usługa, preferencja czasowa)
- W demo: algorytm znajduje najbliższy wolny slot z mock danych (gaps + occupancy) pasujący do kryteriów
- W produkcji: to samo, ale z danych z bazy (przyszłościowo)
- Wynik pokazuje: datę, godzinę, pracownika — wszystko spójne z wybranymi filtrami
- Przed kliknięciem "Znajdź" — brak wyniku (ukryty)

## Problem 3: Wynik wyszukiwania powinien być klikalny
Po znalezieniu terminu, kliknięcie w niego powinno otworzyć główny widget rezerwacyjny z pre-filled danymi.

**Rozwiązanie**:
- Dodać prop `onNavigateToBooking` do `SmartScheduleHelpers`
- Kliknięcie wyniku otwiera `/book/demo-salon` (demo) lub `/book/{slug}` (produkcja) w nowej karcie
- Dodać wizualny hint (kursor pointer, strzałka, tekst "Kliknij aby zarezerwować")

## Zmiany techniczne

### Plik: `src/components/admin/schedule/SmartScheduleHelpers.tsx`

**Occupancy tab (linie 339-346)** — zastąpić prosty alert rozbudowaną sekcją:
- Wylistować `lowOccupancyDays` z konkretnymi danymi (dzień, pracownik, %)
- 3 karty akcji z ikonami i onClick → `onNavigate?.("retention")`, `onNavigate?.("widgets")`, itp.

**Next-available tab (linie 408-478)**:
- Dodać `searchResult` state i logikę generowania wyniku z mock danych
- Przycisk "Znajdź" uruchamia algorytm → ustawia `searchResult`
- Wynik: dynamiczna data/godzina/pracownik na podstawie filtrów
- Kliknięcie wyniku → `window.open('/book/demo-salon', '_blank')` w demo

**Props** — dodać:
```typescript
interface SmartScheduleHelpersProps {
  isDemo?: boolean;
  salonSlug?: string;
  onNavigate?: (tab: string) => void;
  onSlotSelect?: (slot: SmartSlot) => void;
  onGapSelect?: (gap: ScheduleGap) => void;
}
```

### Plik: `src/components/admin/ScheduleManagement.tsx`
Przekazać `onNavigate` i `salonSlug` do `SmartScheduleHelpers`.

### Zakres: 2 pliki
- `src/components/admin/schedule/SmartScheduleHelpers.tsx`
- `src/components/admin/ScheduleManagement.tsx`




# Dodanie widoku miesięcznego do sekcji Wizyty w panelu klienta

## Stan obecny
Sekcja "Wizyty" (`MyBookings.tsx`) ma tylko widok listowy z zakładkami "Nadchodzące" / "Historia". Nie istnieje żaden widok kalendarzowy (dzień/tydzień/miesiąc).

## Plan

### 1. Dodać trzecią zakładkę "Kalendarz" do istniejących Tabs
W `MyBookings.tsx` dodać tab "Kalendarz" obok "Nadchodzące" i "Historia".

### 2. Nowy komponent `BookingsCalendarView.tsx`
Komponent widoku miesięcznego:
- Siatka 7 kolumn (Pn-Nd) z wierszami tygodni
- Nawigacja miesiąc do przodu/do tyłu (przyciski + nazwa miesiąca)
- Dni z wizytami oznaczone kropkami w kolorze salonu
- Kliknięcie w dzień rozwija listę wizyt tego dnia pod kalendarzem
- Dzisiejszy dzień wyróżniony wizualnie (ring primary)
- Mobilny, dotykowy UI

### 3. Przepływ danych
- Wykorzystanie tego samego query `client-bookings` co reszta komponentu (bez dodatkowych zapytań)
- Grupowanie wizyt po dacie: `Map<string, Booking[]>` z kluczem `yyyy-MM-dd`
- Filtrowanie wyświetlanych wizyt do wybranego miesiąca

### 4. UI po kliknięciu dnia
- Pod siatką kalendarza pojawia się lista kart wizyt (re-use istniejącego `BookingCard`)
- Animacja slide-down
- Tekst "Brak wizyt" gdy dzień pusty

## Pliki do edycji
- `src/components/client-app/MyBookings.tsx` — dodanie tabu "Kalendarz"
- `src/components/client-app/BookingsCalendarView.tsx` — nowy komponent widoku miesięcznego


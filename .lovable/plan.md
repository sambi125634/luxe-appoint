

## Plan: Uproszczenie wyboru usługi — 1 klik + usunięcie multi-service

### Problem
1. **Podwójne kliknięcie**: Karta usługi najpierw się rozwija, potem trzeba kliknąć "Rezerwuj" — nielogiczne dla usług bez wariantów
2. **Multi-service nie działa poprawnie**: Dodawanie usług nie sumuje koszyka prawidłowo, UI jest zagmatwany
3. **Runtime error**: `showServiceAddedBar is not defined` — pozostałość po częściowym usunięciu kodu

### Rozwiązanie

**Plik 1: `ServiceSelection.tsx`**
- Usługi **bez wariantów**: jedno kliknięcie na kartę = natychmiastowy wybór i przejście dalej (bez rozwijania)
- Usługi **z wariantami**: kliknięcie rozwija kartę, użytkownik wybiera wariant, kliknięcie wariantu = natychmiastowy wybór i przejście dalej (bez dodatkowego przycisku "Rezerwuj")
- Usunięcie nieużywanych importów (`CalendarPlus`, `ArrowRight`, `Plus`)

**Plik 2: `BookingWidget.tsx`**
- Usunięcie całej logiki multi-service: `additionalServices`, `showServicePicker`, `SERVICE_SUGGESTIONS`, `showAllServices`, `serviceSearch`, `recommendations`
- Usunięcie przycisku "Dodaj kolejną usługę" i pickera sugestii z kroku datetime
- Uproszczenie `totalPrice`/`totalDuration` — po prostu `selectedService.price` / `selectedService.duration`
- Usunięcie podsumowania dodatkowych usług z karty wizyty

### Efekt
- 1 klik = rezerwacja (dla usług bez wariantów)
- 2 kliki max (rozwiń → wybierz wariant) dla usług z wariantami
- Czysty, prosty flow bez zbędnych komplikacji
- Naprawiony runtime error


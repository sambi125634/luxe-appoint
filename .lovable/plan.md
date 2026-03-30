

## Plan: Zawsze rozwijaj kartę usługi + przycisk "Rezerwuj"

### Problem
Usługi bez wariantów przechodzą od razu do kalendarza po 1 kliknięciu — użytkownik nie widzi multimediów, opisu ani benefitów. Chcemy, żeby KAŻDA usługa (z wariantami i bez) najpierw się rozwinęła, pokazała pełny opis/wideo/zdjęcie, a dopiero po kliknięciu "Rezerwuj" przechodziła dalej.

### Rozwiązanie

**Plik: `ServiceSelection.tsx`**

1. **Kliknięcie na kartę = zawsze rozwiń/zwiń** (linie 487-495)
   - Usunąć warunek `if (!service.variants)` który od razu wywołuje `handleServiceSelect`
   - Każde kliknięcie toggleuje `expandedServiceId` — niezależnie od liczby wariantów

2. **Dodać przycisk "Rezerwuj" w rozwiniętej karcie** (po benefitach, ok. linia 675)
   - Dla usług **bez wariantów**: przycisk "Rezerwuj · {price} zł" na dole rozwiniętej sekcji
   - Dla usług **z wariantami**: przycisk pojawi się dopiero po wybraniu wariantu (zmiana logiki wariantów — kliknięcie wariantu zaznacza go, ale NIE wywołuje `onProceed`)

3. **Zmiana logiki wariantów** (linie 627-641)
   - Kliknięcie wariantu = tylko `setSelectedVariants` (zaznacz radio button)
   - Usunąć `onSelect` i `onProceed` z onClick wariantu
   - Przejście dalej dopiero przez przycisk "Rezerwuj"

### Efekt
- 1 klik = rozwiń kartę (multimedia, opis, benefity)
- 2 klik = "Rezerwuj" (lub: wybierz wariant → "Rezerwuj")
- Każda usługa prezentuje się w pełni przed rezerwacją


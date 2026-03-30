

## Plan: Scroll do góry przy zmianie kroku rezerwacji

### Problem
Przy przejściu między krokami (np. usługa → termin → dane) na mobile strona nie scrolluje do góry — użytkownik widzi środek/dół strony zamiast nowego kroku od góry.

### Rozwiązanie

**Plik: `src/components/booking/BookingWidget.tsx`**

W funkcji `changeStep` (linia ~277) dodać `window.scrollTo({ top: 0 })` przy ustawieniu nowego kroku:

```typescript
const changeStep = (newStep: number) => {
  setPreviousStep(currentStep);
  setIsTransitioning(true);
  setTimeout(() => {
    setCurrentStep(newStep);
    setIsTransitioning(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 150);
};
```

Jedna linijka, zero nowych plików. Rozwiązuje problem na mobile i desktop.


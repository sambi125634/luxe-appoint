

# Naprawa upsell w widgecie rezerwacji

## Problem (2 przyczyny)

1. **Rekomendacje hardcoded na demo ID** — `serviceRecommendations` to statyczny obiekt z kluczami "1"-"9" (demo). Dla prawdziwych salonów (UUID jako ID) nigdy nie ma dopasowania, więc upsell albo się nie pokazuje, albo pokazuje dane demo.

2. **Klik nic nie robi** — `onClick` na badge tylko wyświetla toast "Dodaj następnym razem" zamiast faktycznie dodać usługę do rezerwacji.

## Plan naprawy

### 1. Dynamiczne rekomendacje z bazy danych
W `BookingWidget.tsx`:
- Dla prawdziwych salonów: po wybraniu usługi pobierz inne usługi z tej samej kategorii (lub losowe z katalogu salonu) jako rekomendacje
- Dla demo: zachowaj obecny hardcoded mapping
- Użyj prostego query: `services` z tego samego `salon_id`, inna niż wybrana, limit 3

### 2. Klik dodaje usługę do rezerwacji
Zmień onClick na badge rekomendacji tak, aby:
- Wybrał klikniętą usługę jako `selectedService` (zastępuje obecną)
- Lub — lepsze UX — dodaj stan `additionalServices: Service[]` i pozwól na multi-select (ale to duża zmiana)

**Proponowane proste rozwiązanie**: kliknięcie rekomendacji wybiera ją jako główną usługę (zamienia aktualnie wybraną) i automatycznie przechodzi do następnego kroku. Toast potwierdza: "Zmieniono na: [nazwa usługi]".

### 3. Zmiany w plikach

**`src/components/booking/BookingWidget.tsx`**:
- Usuń hardcoded `serviceRecommendations` obiekt
- Dodaj `useQuery` do pobrania rekomendacji z DB (usługi z tej samej kategorii, inne niż wybrana)
- Dla demo: filtruj `demoServices` po kategorii
- Zmień `onClick` na badge: wywołaj `handleServiceSelect(rec)` zamiast toast
- Po kliknięciu rekomendacji pokaż toast "Wybrano: [nazwa]" i odśwież rekomendacje

**Logika rekomendacji dla prawdziwych salonów**:
```
SELECT * FROM services 
WHERE salon_id = :salonId 
  AND id != :selectedServiceId
  AND category_id = :selectedCategoryId
LIMIT 3
```
Fallback gdy brak w tej samej kategorii — pokaż dowolne inne usługi.


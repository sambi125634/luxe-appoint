

## Plan: Walidacja konfliktów terminów we wszystkich punktach rezerwacji

### Problem
Żaden z 3 punktów tworzenia wizyt nie sprawdza, czy wybrany termin jest już zajęty:
1. **Widżet rezerwacji** (`BookingWidget.tsx`) — klient może zarezerwować termin, który jest już zajęty
2. **Kalendarz admin** (`WeeklyCalendar.tsx`) — admin może dodać wizytę nakładającą się na istniejącą
3. **Zarządzanie grafikiem** (`ScheduleManagement.tsx`) — to samo co wyżej

Efekt: możliwe podwójne rezerwacje u tego samego pracownika w tym samym czasie.

### Rozwiązanie

**Krok 1: Edge function `check-appointment-conflict`**

Nowa funkcja backendowa, która przed zapisem wizyty sprawdza, czy istnieje nakładający się termin:

```sql
SELECT id FROM appointments
WHERE salon_id = $salonId
  AND staff_id = $staffId
  AND status NOT IN ('cancelled')
  AND start_time < $newEndTime
  AND end_time > $newStartTime
  AND ($excludeId IS NULL OR id != $excludeId)
LIMIT 1;
```

Zwraca `{ conflict: true/false, conflictingAppointment: {...} }`.

**Krok 2: Hook `useConflictCheck`**

Reużywalny hook wywoływany przed każdym insertem:
```typescript
async function checkConflict(salonId, staffId, startTime, endTime, excludeId?)
```

**Krok 3: Integracja w 3 punktach zapisu**

- **`BookingWidget.tsx`** (`handleFormSubmit`, linia ~406): Przed `supabase.from("appointments").insert(...)` — wywołaj check, jeśli konflikt → toast z błędem i blokada zapisu
- **`WeeklyCalendar.tsx`** (`handleSaveAppointment`, linia ~325): Przed insertem i update'em — sprawdź konflikt
- **`ScheduleManagement.tsx`** (`onSave`, linia ~219): Przed insertem — sprawdź konflikt

Komunikat przy konflikcie:
> "Ten termin jest już zajęty przez [nazwa usługi] o [godzina]. Wybierz inny termin."

**Krok 4: Filtrowanie zajętych slotów w widżecie (bonus)**

W `DateTimeSelection.tsx` — sloty, które kolidują z istniejącymi wizytami danego pracownika, powinny być wyszarzone/niedostępne. To już częściowo działa przez `ai-slot-scoring` (sloty z `score: -1` są "blocked"), ale trzeba upewnić się, że UI faktycznie je ukrywa/wyszarzya.

### Pliki do utworzenia/edycji
1. **Nowy**: `supabase/functions/check-appointment-conflict/index.ts`
2. **Nowy**: `src/hooks/useConflictCheck.ts`
3. **Edycja**: `src/components/booking/BookingWidget.tsx` — dodaj check przed insertem
4. **Edycja**: `src/components/admin/WeeklyCalendar.tsx` — dodaj check przed insert/update
5. **Edycja**: `src/components/admin/ScheduleManagement.tsx` — dodaj check przed insertem

### Efekt
- Nie da się stworzyć dwóch wizyt nakładających się na siebie u tego samego pracownika
- Spójne zabezpieczenie we WSZYSTKICH punktach rezerwacji (klient + admin)
- Czytelny komunikat o konflikcie po polsku


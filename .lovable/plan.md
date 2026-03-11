

# Audyt gotowości produkcyjnej — znalezione problemy i plan naprawy

## Przeprowadzona analiza

Przejrzałem systematycznie cały flow od rejestracji, przez każdą zakładkę panelu admin, aż po persystencję danych w bazie. Poniżej lista znalezionych problemów, pogrupowanych według krytyczności.

---

## Problemy krytyczne (blokujące oddanie do użytku)

### 1. QuickProductSale — query clients z "demo-salon-id" (nie-UUID) powoduje błąd 400
**Plik:** `src/components/admin/products/QuickProductSale.tsx` linia 48-65  
**Problem:** Gdy `isDemo=true`, `salonId` jest ustawiane na `"demo-salon-id"` (string), a następnie query do tabeli `clients` filtruje po `salon_id = "demo-salon-id"`. Kolumna `salon_id` jest typu UUID — Supabase zwraca błąd `22P02: invalid input syntax for type uuid`. To widać bezpośrednio w logach sieciowych.  
**Fix:** W demo mode nie wysyłać query do bazy — zwracać mock klientów, analogicznie jak inne hooki.

### 2. AppointmentModal — useClients() query w demo bije do bazy z prawdziwym salonId
**Plik:** `src/components/admin/AppointmentModal.tsx` linia 106-107  
**Problem:** `useClients()` i `useServices()` są wywoływane bezwarunkowo. W demo mode `isDemo=true`, ale te hooki używają `useSalonId()` wewnętrznie. Jeśli użytkownik jest zalogowany (np. testuje demo po rejestracji), hook zwraca prawdziwy UUID i bije do bazy — co nie jest błędem samym w sobie, ale miesza dane demo z produkcją.  
**Fix:** W `AppointmentModal`, gdy `isDemo=true`, nie wywoływać hooków Supabase — użyć mock data.

### 3. Brak tabeli `time_off` w schemacie bazy
**Plik:** `src/components/admin/TimeOffManagement.tsx` linia 130  
**Problem:** Komponent próbuje wstawić dane do `supabase.from("time_off")`, ale tabela `time_off` **nie istnieje w schemacie bazy** (nie ma jej w `supabase-tables`). Każda operacja CRUD na urlopach w produkcji skończy się błędem 404/400.  
**Fix:** Utworzyć tabelę `time_off` z migracją SQL + RLS policies.

### 4. Kalendarz — zapis wizyt wymaga service_id z bazy (UUID)
**Plik:** `src/components/admin/WeeklyCalendar.tsx` linia 284-298  
**Problem:** Przy tworzeniu wizyty w produkcji, `appointmentData.serviceId` musi być prawdziwym UUID z tabeli `services`. Modal przekazuje `serviceId` z selecta, co jest poprawne, ale jeśli salon nie ma żadnych usług, select jest pusty i insert do `appointments` failuje (foreign key constraint). Brak walidacji "musisz najpierw dodać usługi".  
**Fix:** Dodać walidację w `handleSaveAppointment` — jeśli `serviceId` pusty, pokazać toast z informacją.

---

## Problemy wysokiego priorytetu

### 5. StaffManagement — brak pobrania staff_services (przypisania usług)
**Plik:** `src/components/admin/StaffManagement.tsx` linia 80-89  
**Problem:** W produkcji, `serviceIds` jest zawsze pustą tablicą (`[]`). Komponent nie pobiera relacji `staff_services` z bazy, więc przy edycji pracownika nie widać przypisanych usług.  
**Fix:** Dodać query do `staff_services` i mapować `serviceIds` z wyników.

### 6. ClientsManagement — totalVisits i totalSpent zawsze 0
**Plik:** `src/components/admin/ClientsManagement.tsx` linia 129-130  
**Problem:** W produkcji, `totalVisits: 0` i `totalSpent: 0` są hardcodowane. Brak agregacji z tabeli `appointments`/`transactions`.  
**Fix:** Dodać subquery lub osobne query do zliczenia wizyt i wydatków per klient.

### 7. ClientsManagement — visits zawsze pusta tablica
**Plik:** `src/components/admin/ClientsManagement.tsx` linia 131  
**Problem:** W produkcji `visits: []` — historia wizyt klienta nigdy nie jest pobierana.  
**Fix:** Dodać query do `appointments` filtrowane po `client_id`.

---

## Problemy średniego priorytetu

### 8. ScheduleManagement nie przekazuje isDemo do sub-komponentów
**Plik:** `src/components/admin/ScheduleManagement.tsx` linia 80+  
**Problem:** `ScheduleGridView`, `ScheduleTemplates`, `WeekDuplication`, `SmartScheduleHelpers` nie otrzymują `isDemo` — mogą próbować bić do bazy w demo.

### 9. AccountingModule — w produkcji puste dane
**Problem:** `AccountingModule` nie pobiera transakcji z bazy — używa `useState<Transaction[]>([])`. W produkcji zawsze pokaże "Brak danych księgowych".  
**Fix:** Dodać `useQuery` do pobierania transakcji z tabeli `transactions`.

### 10. Brak invalidacji cache kalendarza po zapisie wizyty
**Plik:** `src/components/admin/WeeklyCalendar.tsx` linia 314  
**Problem:** `invalidateQueries({ queryKey: ["appointments", salonId] })` — ale query kalendarza używa klucza `["calendar-appointments", salonId, weekStartISO]`. Cache nie jest invalidowany po zapisie.  
**Fix:** Zmienić na `invalidateQueries({ queryKey: ["calendar-appointments"] })`.

---

## Plan implementacji (kolejność priorytetów)

| # | Plik | Zmiana | Krytyczność |
|---|------|--------|-------------|
| 1 | Migration SQL | Utworzyć tabelę `time_off` z RLS | Krytyczna |
| 2 | `QuickProductSale.tsx` | Demo guard — nie query clients z "demo-salon-id" | Krytyczna |
| 3 | `WeeklyCalendar.tsx` | Fix invalidation key + walidacja serviceId | Krytyczna |
| 4 | `AppointmentModal.tsx` | Demo guard na useClients/useServices | Krytyczna |
| 5 | `StaffManagement.tsx` | Pobranie staff_services z bazy | Wysoka |
| 6 | `ClientsManagement.tsx` | Agregacja totalVisits/totalSpent/visits | Wysoka |
| 7 | `AccountingModule.tsx` | Query transactions z bazy | Średnia |
| 8 | `ScheduleManagement.tsx` | Przekazanie isDemo do sub-komponentów | Średnia |

### Migracja SQL — tabela `time_off`

```sql
CREATE TABLE public.time_off (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'vacation',
  start_date date NOT NULL,
  end_date date NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.time_off ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon owners can manage time_off" ON public.time_off
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff_members sm
    JOIN salons s ON s.id = sm.salon_id
    WHERE sm.id = time_off.staff_id AND s.owner_id = auth.uid()
  )
  OR has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Users can view time_off of their salon" ON public.time_off
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff_members sm
    WHERE sm.id = time_off.staff_id
    AND user_belongs_to_salon(auth.uid(), sm.salon_id)
  )
  OR has_role(auth.uid(), 'super_admin')
);
```


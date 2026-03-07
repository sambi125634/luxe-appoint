

## Problem

Tylko `DashboardHome` ma logikę `isDemo` — reszta komponentów (Klienci, Usługi, Pracownicy, Kalendarz, Urlopy, Grafik, Pipeline, Konwersacje, Księgowość itp.) **zawsze wyświetla hardcoded mockowe dane** niezależnie od tego czy użytkownik jest w demo czy w panelu admin. Nowy salon po rejestracji widzi dane "Anna Kowalska", "Maria Nowakowska" itd.

## Zakres zmian

Trzeba zamienić mockowe dane na zapytania Supabase w **10 komponentach**, dodając jednocześnie prop `isDemo` żeby demo page dalej działało z mockami.

### Priorytet 1 — Kluczowe moduły CRUD

1. **`ClientsManagement.tsx`** — Usunąć `mockClients`, pobierać z tabeli `clients` WHERE `salon_id`. Empty state: "Dodaj pierwszego klienta". Demo: zachować obecne mocki.

2. **`ServicesManagement.tsx`** — Usunąć `mockServices`, `mockCategories`, `mockStaff`. Pobierać z `services`, `service_categories`, `staff_members` WHERE `salon_id`. CRUD operacje przez Supabase. Empty state: "Dodaj pierwszą usługę".

3. **`StaffManagement.tsx`** — Usunąć `mockStaff`, `mockServices`. Pobierać z `staff_members`, `working_hours`, `staff_services` WHERE `salon_id`. CRUD przez Supabase. Empty state: "Dodaj pierwszego pracownika".

4. **`WeeklyCalendar.tsx`** — Usunąć `mockAppointments` i `staff`. Pobierać z `appointments` + `staff_members` WHERE `salon_id` i zakres dat. Empty state: pusty kalendarz z komunikatem.

5. **`TimeOffManagement.tsx`** — Usunąć `mockStaff`, `mockTimeOffs`. Pobierać z `time_off` JOIN `staff_members` WHERE `salon_id`.

### Priorytet 2 — Moduły harmonogramu

6. **`schedule/types.ts`** — Usunąć `mockStaffMembers` export. Stworzyć hook `useStaffMembers(salonId)`.

7. **`schedule/ScheduleGridView.tsx`** — Użyć hooka zamiast `mockStaffMembers`.

8. **`schedule/SmartScheduleHelpers.tsx`** — Użyć hooka zamiast `mockStaffMembers`.

9. **`schedule/ScheduleTemplates.tsx`** — Użyć hooka zamiast `mockStaffMembers`.

10. **`schedule/QuickBlockModal.tsx`** + **`schedule/WeekDuplication.tsx`** — Użyć hooka zamiast `mockStaffMembers`.

### Priorytet 3 — Aktualizacja DemoPage

11. **`DemoPage.tsx`** — Przekazać `isDemo={true}` do WSZYSTKICH komponentów: `ScheduleManagement`, `ClientsManagement`, `ServicesManagement`, `StaffManagement`, `TimeOffManagement`, `WidgetsManagement`.

### Nowe pliki

- **`src/hooks/useStaffMembers.ts`** — Hook do pobierania pracowników salonu z Supabase (używany w 6+ komponentach schedule).
- **`src/hooks/useClients.ts`** — Hook do pobierania klientów salonu.
- **`src/hooks/useServices.ts`** — Hook do pobierania usług i kategorii salonu.

### Wzorzec dla każdego komponentu

```text
interface ComponentProps {
  isDemo?: boolean;
}

function Component({ isDemo = false }: ComponentProps) {
  const { salonId } = useSalonId();
  
  // Dane z bazy LUB mocki demo
  const { data, isLoading } = useQuery({
    queryKey: ["table", salonId, isDemo],
    queryFn: async () => {
      if (isDemo) return DEMO_DATA;
      // Supabase query filtered by salon_id
    },
    enabled: isDemo || !!salonId,
  });

  // Empty state gdy brak danych (nie demo)
  if (!isDemo && !isLoading && data?.length === 0) {
    return <EmptyState />;
  }
}
```

### Kolejność implementacji

1. Hooki (`useStaffMembers`, `useClients`, `useServices`)
2. `ClientsManagement` + `ServicesManagement` + `StaffManagement` (główne CRUD)
3. `WeeklyCalendar` + `TimeOffManagement`
4. Moduły schedule (`ScheduleGridView`, `SmartScheduleHelpers`, `ScheduleTemplates`, `QuickBlockModal`, `WeekDuplication`)
5. `DemoPage` — dodanie `isDemo` do wszystkich komponentów


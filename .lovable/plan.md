

## Plan: Wyszukiwarka usług w modalu admin + pewność integracji kalendarzy

### Problem
1. Lista usług w `AppointmentModal` nie ma wyszukiwarki — przy wielu usługach trudno znaleźć właściwą
2. Potrzeba potwierdzenia, że conflict check działa spójnie we wszystkich punktach zapisu

### Rozwiązanie

#### Zmiana 1 — Wyszukiwarka usług w AppointmentModal

**Plik: `src/components/admin/AppointmentModal.tsx`**

Dodać stan `serviceSearch` i pole `Input` z ikoną `Search` nad listą kart usług. Filtrować listę po nazwie:

```typescript
const [serviceSearch, setServiceSearch] = useState("");

const filteredServices = services.filter(s =>
  s.name.toLowerCase().includes(serviceSearch.toLowerCase())
);
```

Nad `grid grid-cols-1` (linia ~364) wstawić input:
```tsx
<div className="relative">
  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
  <Input
    placeholder="Szukaj usługi..."
    value={serviceSearch}
    onChange={(e) => setServiceSearch(e.target.value)}
    className="pl-9 rounded-xl mb-2"
  />
</div>
```

Następnie renderować `filteredServices` zamiast `services` w mapowaniu kart. Reset `serviceSearch` przy otwarciu modalu (w istniejącym `useEffect`).

#### Zmiana 2 — Audyt conflict check we wszystkich punktach zapisu

Aktualny stan integracji:

| Punkt zapisu | Plik | Conflict check |
|---|---|---|
| Widżet klienta | `BookingWidget.tsx` | ✅ `checkAppointmentConflict` przed insertem |
| Kalendarz admin | `WeeklyCalendar.tsx` | ✅ `checkAppointmentConflict` przed insert/update |
| Nowa wizyta (header) | `ScheduleManagement.tsx` | ✅ `checkAppointmentConflict` przed insertem |
| Quick Block | `ScheduleManagement.tsx` | ⚠️ Tworzy cancelled appointment — nie koliduje |
| AppointmentModal (onSave) | Zależy od wywołującego | ✅ Każdy caller sprawdza |

System jest spójny — edge function `check-appointment-conflict` jest wywoływana w **każdym** punkcie zapisu wizyty. Żaden insert nie przejdzie bez weryfikacji.

Jedyne usprawnienie: dodać conflict check **bezpośrednio** w `handleSave` wewnątrz `AppointmentModal` (zamiast polegać na callerze), żeby mieć 100% pewność niezależnie od tego, kto wywołuje modal.

**Plik: `src/components/admin/AppointmentModal.tsx`** (linia ~248, `handleSave`)

Przed wywołaniem `onSave()`, dodać:
```typescript
const handleSave = async () => {
  if (!form.serviceId || !form.staffId) return;
  
  // Conflict check
  if (salonId) {
    const startDate = new Date(`${form.date}T${form.time}`);
    const endDate = new Date(startDate.getTime() + (selectedService?.duration || 60) * 60000);
    const result = await checkAppointmentConflict({
      salonId,
      staffId: form.staffId,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      excludeId: appointment?.id,
    });
    if (result.conflict) {
      // Pokazać toast z komunikatem o konflikcie
      return;
    }
  }
  
  onSave({ ... });
};
```

Wymaga dodania importu `checkAppointmentConflict` i `formatConflictMessage`, oraz przekazania `useToast` (lub callback).

### Pliki do edycji
1. `src/components/admin/AppointmentModal.tsx` — wyszukiwarka usług + conflict check w handleSave

### Efekt
- Admin szybko znajduje usługę wpisując nazwę
- Podwójna ochrona przed overbookingiem: modal sam weryfikuje konflikty niezależnie od callera


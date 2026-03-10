

# Fix: Kalendarz demo — przekazanie isDemo do WeeklyCalendar

## Problem
`ScheduleManagement` otrzymuje `isDemo={true}` z `DemoPage`, ale nie przekazuje tego propa do `<WeeklyCalendar />`. Kalendarz renderuje się w trybie produkcyjnym — nie ma pracowników z bazy, więc pokazuje pusty ekran "Kalendarz jest pusty".

## Rozwiązanie
Jedna zmiana w `src/components/admin/ScheduleManagement.tsx` — linia 85:

```tsx
// Przed:
<WeeklyCalendar />

// Po:
<WeeklyCalendar isDemo={isDemo} />
```

To spowoduje załadowanie 10 mockowych wizyt i 4 pracowników w trybie demo.

## Pliki do edycji

| Plik | Zmiana |
|------|--------|
| `src/components/admin/ScheduleManagement.tsx` | Dodanie `isDemo={isDemo}` do `<WeeklyCalendar />` |


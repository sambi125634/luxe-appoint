

# Dodanie widoku miesięcznego do kalendarza admina

## Zakres
Dodać trzeci przycisk "Miesiąc" do przełącznika widoków (Dzień / Tydzień / **Miesiąc**) w `WeeklyCalendar.tsx`.

## Zmiany

### WeeklyCalendar.tsx
1. Rozszerzyć typ `CalendarView` o `"month"`
2. Dodać przycisk "Miesiąc" do view switchera (z ikoną `CalendarDays`)
3. Dodać nawigację miesiąc +/- gdy `calendarView === "month"`
4. Zaktualizować nagłówek daty — wyświetlać "marzec 2026" dla widoku miesięcznego
5. Rozszerzyć query o zakres dat miesiąca (gdy widok = month, fetch cały miesiąc)
6. Dodać sekcję renderującą `MonthGridView`

### Nowy komponent: `src/components/admin/calendar/MonthGridView.tsx`
Siatka miesięczna dla właściciela biznesu:
- 7 kolumn (Pn-Nd), wiersze tygodni
- Każda komórka dnia pokazuje mini-listę wizyt (max 2-3 + "+N więcej")
- Wizyty kolorowane wg pracownika (staffColor)
- Kliknięcie w dzień → przełącza na widok dzienny (`setCalendarView("day")` + `setCurrentDate(day)`)
- Kliknięcie w wizytę → otwiera modal edycji
- Dzisiejszy dzień wyróżniony (ring primary)
- Dni poza miesiącem wyszarzone

Props: `date`, `staff`, `appointments`, `onDayClick`, `onAppointmentClick`, `locale`

## Pliki
- `src/components/admin/WeeklyCalendar.tsx` — rozszerzenie o widok month
- `src/components/admin/calendar/MonthGridView.tsx` — nowy komponent


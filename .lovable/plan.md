

# Przeniesienie Time Off do zakładki Kalendarz

## Problem
"Urlopy i dni wolne" jest osobną pozycją w sidebarze, ale logicznie należy do sekcji Kalendarz. Mylące dla użytkownika.

## Zmiany

### 1. `src/components/admin/ScheduleManagement.tsx`
- Dodać nową zakładkę `"time-off"` do `activeView` (obok calendar, grid, templates, smart)
- Rozszerzyć `TabsList` z `grid-cols-4` na `grid-cols-5`
- Dodać `TabsTrigger value="time-off"` z ikoną `CalendarOff` i labelką "Urlopy"
- Import `TimeOffManagement` i renderować gdy `activeView === "time-off"`

### 2. `src/components/admin/AdminSidebar.tsx`
- Usunąć `{ icon: CalendarOff, labelKey: "time-off", tab: "time-off" }` z sekcji "Codzienna praca"
- Usunąć `"time-off"` z typu `TabType`

### 3. `src/pages/AdminDashboard.tsx`
- Usunąć `case "time-off"` z `renderContent()` i `getPageTitle()`
- Usunąć import `TimeOffManagement` (bo teraz importuje go ScheduleManagement)

### 4. `src/pages/DemoPage.tsx`
- Analogicznie usunąć `case "time-off"` jeśli istnieje

### Zakres: 4 pliki


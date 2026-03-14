

# Audyt i naprawa wycieku danych demo do kont produkcyjnych

## Problem
W panelu admina po rejestracji nowego konta, w kilku komponentach modułu "Grafik" (Schedule) wyświetlają się pracownicy z danych demo (Maria Nowakowska, Karolina Wiśniewska, Joanna Lewandowska) zamiast prawdziwych danych z bazy. Widać to np. w oknie "Duplikacja grafiku" na screenshocie.

## Przyczyna
4 komponenty schedule **zawsze** importują i używają `mockStaffMembers` bez sprawdzania `isDemo`:

| Komponent | Problem |
|---|---|
| `WeekDuplication.tsx` | Zawsze `mockStaffMembers` — brak prop `isDemo`, brak `useStaffMembers()` |
| `QuickBlockModal.tsx` | Zawsze `mockStaffMembers` — j.w. |
| `ScheduleTemplates.tsx` | Zawsze `mockStaffMembers` — j.w. |
| `SmartScheduleHelpers.tsx` | Zawsze `mockStaffMembers` w generatorach danych i w UI — j.w. |

Komponenty `ScheduleGridView` i `WeeklyCalendar` są **poprawne** — już mają logikę `isDemo ? mockStaff : dbStaff`.

## Plan naprawy

### 1. Dodać prop `isDemo` + `useStaffMembers()` do 4 komponentów

Każdy z nich otrzyma:
- Prop `isDemo?: boolean`
- Hook `useStaffMembers()` do pobrania prawdziwych danych z bazy
- Logikę: `const staff = isDemo ? mockStaffMembers : (dbStaff || [])`

**WeekDuplication.tsx** — dodać `isDemo` + `staffMembers` prop lub hook, podmienić wszystkie referencje do `mockStaffMembers`

**QuickBlockModal.tsx** — analogicznie, lista pracowników w select

**ScheduleTemplates.tsx** — analogicznie, lista pracowników przy przypisywaniu szablonów

**SmartScheduleHelpers.tsx** — tu trzeba przekazać staff jako prop do komponentu i do funkcji generujących dane (lub zamienić na hook)

### 2. Propagacja `isDemo` z ScheduleManagement

Sprawdzić, że `ScheduleManagement` (rodzic) przekazuje `isDemo` do tych sub-komponentów. Jeśli nie — dodać.

### 3. Pełny overcheck — inne moduły

Szybka weryfikacja innych komponentów pod kątem podobnych wycieków (mockClients, mockServices itp. używane bez `isDemo` guard).

## Wpływ
- Żadne dane demo nie będą wyświetlane w kontach produkcyjnych
- Tryb demo (`/demo`) nadal działa bez zmian
- Brak zmian w bazie danych — problem jest wyłącznie po stronie frontendu


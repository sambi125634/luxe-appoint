

## Plan: Poprawka widoczności listy specjalistów na mobile

### Problem
W `DateTimeSelection.tsx` (linia 290) lista specjalistów jest wyświetlana jako poziomy pasek z `overflow-x-auto`. Na ekranie 390px widać tylko 1-2 chipsy, reszta jest ukryta bez widocznego wskaźnika przewijania.

### Rozwiązanie
Zmienić layout specjalistów z poziomego paska na **siatkę 2 kolumny** (`grid grid-cols-2`) z kompaktowymi kafelkami. Każdy kafelek zawiera inicjały, imię i ocenę. Opcja "Dowolny" zajmuje pełną szerokość na górze.

### Zmiany w plikach

**1. `src/components/booking/DateTimeSelection.tsx`** (linie 289-332)
- Zamienić `flex gap-2 overflow-x-auto` na `grid grid-cols-2 gap-2`
- Opcja "Dowolny" → `col-span-2`
- Każdy kafelek: kompaktowy layout z inicjałami, imieniem (truncate), oceną
- Usunąć `whitespace-nowrap`, `flex-shrink-0`, `overflow-x-auto`
- Dodać `max-h-[240px] overflow-y-auto` na wypadek >6 specjalistów

**2. `src/components/booking/StaffSelection.tsx`** (linie 131-226)
- Zmniejszyć padding kart z `p-5` na `p-3` na mobile
- Zmniejszyć avatar z `w-14 h-14` na `w-10 h-10`
- Dodać `max-h-[50vh] overflow-y-auto` do kontenera grid, aby lista była scrollowalna gdy jest wielu specjalistów

Obie zmiany zapewniają pełny podgląd wszystkich pracowników zarówno w widgecie jak i w aplikacji mobilnej.




# Naprawa sekcji "Dzisiejsze wizyty" w Dashboard

## Problemy
1. **Za dużo miejsca** — lista 14 wizyt wyświetla 8 naraz bez scrollowania, zajmuje ogromną część ekranu.
2. **"Zobacz wszystkie" nie działa w demo** — `DemoPage.tsx` linia 63 nie przekazuje `onNavigate` do `DashboardHome`, więc `handleNavigate("calendar")` wywołuje `undefined?.("calendar")` = nic się nie dzieje.

## Zmiany

### Plik 1: `src/pages/DemoPage.tsx`
Przekazać `onNavigate={setActiveTab}` do `DashboardHome`:
```tsx
// linia 63
return <DashboardHome isDemo={true} onNavigate={setActiveTab} />;
```

### Plik 2: `src/components/admin/DashboardHome.tsx`
Ograniczyć widoczną listę wizyt do 5 pozycji w scrollowalnym kontenerze (max-h ~320px), z przyciskiem "Zobacz wszystkie" na dole:

- Zmienić `slice(0, 8)` na `slice(0, 5)` — domyślnie widocznych 5 wizyt
- Dodać `max-h-[320px] overflow-y-auto` na kontenerze listy wizyt, aby przy większej liczbie można było scrollować
- Przycisk "Zobacz wszystkie" zawsze widoczny na dole (poza scrollem), gdy wizyt > 5 — prowadzi do kalendarza


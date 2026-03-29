

# Rozbudowa demo wizyt + "Zobacz wszystkie" → kalendarz

## Problem
1. **Godziny demo** — wszystkie 3 wizyty mają `new Date()` (aktualna godzina, np. 0:55). Powinny mieć realistyczne godziny pracy (8:00–16:00).
2. **Za mało wizyt** — tylko 3, a powinno być 12–15 dla wiarygodności.
3. **"Zobacz wszystkie"** — przycisk prowadzi do `handleNavigate("calendar")`, ale w demo to nic nie robi widocznie. Powinien nawigować do zakładki kalendarza.

## Zmiany

### Plik: `src/components/admin/DashboardHome.tsx`

**1. Rozbudowa `DEMO_APPOINTMENTS`** — z 3 do ~14 wizyt:
- Realistyczne godziny od 8:00 do 17:00 (co 30–60 min)
- 4 pracownice, różne usługi beauty
- Mix statusów: ~10 confirmed, 2 booked, 1 cancelled, 1 completed
- Realistyczne ceny (80–450 zł)
- Każda wizyta z unikalnymi danymi klientki

Przykład struktury godzin:
```
08:00, 08:30, 09:00, 09:30, 10:00, 10:30, 
11:00, 12:00, 13:00, 13:30, 14:00, 15:00, 15:30, 16:00
```

**2. Zwiększenie limitu wyświetlania** — linia 408 zmienia `slice(0, 6)` na `slice(0, 8)` + dodanie informacji ile wizyt jest ukrytych pod "Zobacz wszystkie".

**3. "Zobacz wszystkie"** — linia 387, `onClick` zmieniony:
- W trybie demo: `onNavigate("calendar")` (nawiguje do zakładki Kalendarz)
- W trybie produkcyjnym: bez zmian

To już prowadzi do zakładki kalendarza — upewnię się, że `handleNavigate` jest poprawnie zdefiniowany i przekazuje "calendar".

### Szczegóły techniczne
- Helper `demoTime(hour, minute)` tworzy datę z dzisiejszą datą ale o zadanej godzinie
- Dane demo: 14 wizyt, 4 pracownice, 10+ różnych usług
- KPI "Szacowany przychód" automatycznie się zaktualizuje (suma cen)


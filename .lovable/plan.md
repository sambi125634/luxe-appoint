

# Rozbudowa formularza pracownika

## Obecny stan
- **Kolory**: tablica `colors` ma 6 wartości (`bg-primary`, `bg-secondary`, `bg-accent`, `bg-chart-1`, `bg-chart-2`, `bg-chart-3`), ale część z nich renderuje się bardzo podobnie — stąd wrażenie "trzech kolorów"
- **Usługi**: dynamicznie pobierane z bazy przez `useServices()` — wszystkie aktywne usługi salonu się tu pojawiają. Działa poprawnie.
- **Profil**: zawiera bio (500 znaków), specjalizacje (tagi), datę rozpoczęcia pracy
- **Grafik**: dzienny toggle + godziny start/end

## Proponowane zmiany

### 1. Więcej wyrazistych kolorów (12 zamiast 6)
Zastąpić abstrakcyjne klasy Tailwind konkretnymi hex-kolorami renderowanymi jako `style={{ backgroundColor }}`. Paleta 12 dobrze odróżnialnych kolorów:

```text
#6366f1 (indigo)   #ec4899 (pink)     #f59e0b (amber)
#10b981 (emerald)  #8b5cf6 (violet)   #ef4444 (red)
#06b6d4 (cyan)     #f97316 (orange)   #84cc16 (lime)
#64748b (slate)    #d946ef (fuchsia)  #14b8a6 (teal)
```

### 2. Nowe pola w formularzu (zakładka "Dane" i "Profil")

**Zakładka "Dane":**
- **Typ umowy** — select: Umowa o pracę / B2B / Umowa zlecenie / Staż
- **Stawka prowizji (%)** — input numeryczny, opcjonalne (używane potem w module Finanse/Komisje)

**Zakładka "Profil":**
- **Certyfikaty / Uprawnienia** — tagi, analogicznie do specjalizacji (np. "PhiBrows", "Laser klasa IV")
- **Wyświetlaj w widgecie rezerwacji** — toggle (czy klientki widzą tę osobę przy rezerwacji online)

**Zakładka "Grafik":**
- **Przerwa obiadowa** — czas start + czas trwania (np. 13:00, 30 min) — blokuje slot w kalendarzu

### 3. Zmiany w bazie danych
Nowe kolumny w tabeli `staff_members`:
- `contract_type text` (nullable)
- `commission_rate numeric` (nullable)
- `certifications text[]` (nullable, array)
- `visible_in_widget boolean default true`
- `break_start time` (nullable)
- `break_duration integer` (nullable, minuty)

## Pliki do edycji
1. **`src/components/admin/StaffManagement.tsx`** — nowa paleta kolorów, nowe pola formularza, nowe taby
2. **Migracja SQL** — dodanie kolumn do `staff_members`
3. **`src/hooks/useStaffMembers.ts`** — rozszerzenie SELECT o nowe kolumny

Bez zmian w logice modułów (kalendarz, rezerwacje) — nowe pola to dane konfiguracyjne, integracja z kalendarzem (przerwy) i widgetem (visibility) w kolejnym kroku.


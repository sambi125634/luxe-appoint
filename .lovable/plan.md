# Naprawa spójności danych wynagrodzeń + rozbudowa zakładki Zespół

## Diagnoza problemu

W bazie `staff_members` mamy 5 modeli wynagrodzeń (`compensation_type`):
- `commission` (% od usługi)
- `salary` (pensja miesięczna)
- `hourly` (stawka godzinowa)
- `salary_plus_commission` (pensja + %)
- `flat_per_service` (kwota za zabieg)

Pełny moduł **Zespół** (`StaffManagement.tsx`) poprawnie pozwala wybrać model i zapisuje go do bazy. Natomiast:

1. **`TeamSettings.tsx`** (Ustawienia → Zespół) pokazuje sztywno `35 zł/h` przy każdym pracowniku ignorując `compensation_type` — stąd absurd: pracownik ma w pełnym module 30% prowizji, a tutaj „35 zł/h".
2. **`useTrueProfit.ts`** używa `DEFAULT_HOURLY_RATE = 35` zamiast czytać `compensation_type/hourly_rate/commission_rate` z `staff_members` (komentarz w kodzie: `// future: check staff_members.hourly_rate`).
3. **Karta "Średnia stawka"** w `TeamSettings` liczy średnią z `hourly_rate` nawet dla osób na prowizji — bez sensu.

## Zakres zmian

### 1. `src/components/admin/settings/TeamSettings.tsx` — przebudowa karty pracownika
- Pobierać dodatkowo: `compensation_type, commission_rate, base_salary, flat_rate_per_service`.
- Zamiast „35 zł/h" pokazywać **rzeczywisty model**:
  - `commission` → „30% prowizji"
  - `hourly` → „40 zł/h"
  - `salary` → „4 500 zł/mies"
  - `salary_plus_commission` → „3 500 zł + 15%"
  - `flat_per_service` → „100 zł/zabieg"
  - brak / `—` → badge „Nieustawione" z mini-CTA „Ustaw"
- Karta KPI „Średnia stawka" → zastąpić **3 mini-statystykami**:
  - „X na prowizji", „Y na stawce", „Z na pensji" (rozkład modeli)
  - Druga karta: średni **koszt osobogodziny** policzony spójnie (jeśli prowizja, używamy szacunku z średniej ceny usługi × %; jeśli godziny — wprost; jeśli pensja — base/160h). Ten sam wzór trafia do `useTrueProfit`.
- Alert „Domyślna stawka 35 zł/h" zostaje, ale przeformułowany: „używamy jej tylko gdy pracownik nie ma uzupełnionego modelu wynagrodzenia".

### 2. Nowe sekcje ustawień w `TeamSettings` (realna wartość, nie tylko podgląd)
Dodaję 3 bloki ustawień **salon-wide**, które obecnie nie mają domu:

- **Polityka domyślnych wynagrodzeń** — domyślny `compensation_type` i wartość, używane przy zakładaniu nowego pracownika i jako fallback w True Profit. Zapis do `salon_settings.team` (JSONB, klucze: `default_compensation_type`, `default_hourly_rate`, `default_commission_rate`).
- **Widoczność w widgecie rezerwacji** — globalny toggle: „Pokazuj imiona/zdjęcia pracowników w widgecie" + „Pozwól klientowi wybrać pracownika". (Dziś jest tylko per-pracownik `visible_in_widget`).
- **Auto-przypisanie wizyt** — radio: „Pierwszy wolny", „Rotacyjne (równy load)", „Wg specjalizacji" — używane gdy klient nie wybiera pracownika.

Wszystko trzymane w istniejącej tabeli `salon_settings` w nowej sekcji `team` (JSONB — bez migracji schematu). Hook `useSalonSettings` rozszerzony o `TeamSettings` interface.

### 3. `src/hooks/useTrueProfit.ts` — realny koszt pracy zamiast `35 zł/h`
Zamiast `DEFAULT_HOURLY_RATE`:
- Pobierać `staff_members` z polami wynagrodzeń.
- Dla każdej wizyty liczyć koszt na podstawie `compensation_type` przypisanego pracownika:
  - `hourly` → `hourly_rate × duration/60`
  - `commission` → `service.price × commission_rate/100`
  - `flat_per_service` → `flat_rate_per_service`
  - `salary` → `base_salary/160 × duration/60`
  - `salary_plus_commission` → suma j.w.
- Jeśli pracownik nie ma modelu → fallback do `salon_settings.team.default_*` → dopiero potem do `35 zł/h`.
- Flaga `hasStaffRates` ustawiana realnie (true gdy ≥1 pracownik ma uzupełniony model). Banner „uzupełnij stawki" znika sam, gdy dane są kompletne.

### 4. Skan spójności w innych modułach (poprawki jednorazowe)
- `StaffCompensationReport.tsx` — już używa `compensation_type` poprawnie. Sprawdzam tylko, czy gdy `commission_rate` jest null nie używa hardcoded 30 (linia 82: `?? 30`) — zmieniam na fallback do `salon_settings.team.default_commission_rate`.
- Wszystkie miejsca pokazujące „stawkę" pracownika w UI (sidebar grafiku, modal wizyty, raporty) — przegląd i ujednolicenie formatera `formatCompensation(staff)` w `src/lib/compensation.ts` (nowy helper). Tak będzie jedno źródło prawdy formatowania.
- `grep` po projekcie: `35` jako liczba w kontekście stawek, `hourly_rate || 35`, `commission_rate ?? 30` → wszystkie zastąpić wywołaniami helpera lub fallbackiem z ustawień.

### 5. Demo mode
- `DEMO_STAFF` w `TeamSettings.tsx` dostaje pola `compensation_type` i odpowiednie wartości, żeby demo prezentowało mieszankę modeli (Maria — salary 5500, Kasia — commission 35%, Anna — hourly 35) zamiast wszędzie „35 zł/h".

## Pliki do zmiany

```text
src/components/admin/settings/TeamSettings.tsx          (przepisać karty + dodać 3 sekcje ustawień)
src/components/admin/settings/types.ts                  (dodać TeamSettings do typu)
src/hooks/useSalonSettings.ts                           (TeamSettings + load/save)
src/hooks/useTrueProfit.ts                              (realny koszt pracy z compensation_type)
src/components/admin/accounting/StaffCompensationReport.tsx  (fallback z ustawień zamiast 30)
src/lib/compensation.ts                                 (NOWY: formatCompensation + computeStaffCostForAppointment)
```

## Czego NIE robię
- Bez migracji schematu DB (wszystko mieści się w istniejących polach `staff_members` + `salon_settings` JSONB).
- Bez zmian w widgecie rezerwacji w tej iteracji — tylko zapis ustawień; ich efektywne użycie w widgecie zrobimy osobno jeśli potwierdzisz.
- Bez przebudowy pełnego modułu `StaffManagement` (działa poprawnie).

## Pytanie

Czy zatwierdzasz pełny zakres (1–5), czy wolisz tylko pkt 1+3+4 (sama spójność danych, bez nowych ustawień salon-wide w pkt 2)?

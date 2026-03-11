

# Audyt persystencji danych — wyniki

## Status modułów: co działa poprawnie

| Moduł | Odczyt z bazy | Zapis do bazy | Demo guard | Status |
|-------|:---:|:---:|:---:|:---:|
| Usługi (Services) | OK | OK | OK | **Gotowy** |
| Kategorie usług | OK | OK | OK | **Gotowy** |
| Pracownicy (Staff) | OK | OK | OK | **Gotowy** |
| Godziny pracy | OK | OK | OK | **Gotowy** |
| Staff-Services (przypisania) | OK | OK | OK | **Gotowy** |
| Klienci (Clients) | OK | OK | OK | **Gotowy** |
| Statystyki klientów (wizyty/wydatki) | OK | — | OK | **Gotowy** |
| Kalendarz (Appointments) | OK | OK | OK | **Gotowy** |
| Nieobecności (Time Off) | OK | OK | OK | **Gotowy** |
| Produkty (Products) | OK | OK | OK | **Gotowy** |
| Ustawienia salonu | OK | OK | OK | **Gotowy** |
| Ustawienia rezerwacji/powiadomień | OK | OK | OK | **Gotowy** |
| Transakcje (Accounting) | OK | — | OK | **Gotowy** |

## Znalezione problemy

### 1. ScheduleGridView — dane NIGDY nie trafiają do bazy
**Plik:** `src/components/admin/schedule/ScheduleGridView.tsx` linie 33-49, 72-88
**Problem:** Komponent `ScheduleGridView` (zakładka "Siatka" w Grafiku) używa **wyłącznie `useState` z mock data** (`mockStaffMembers`). Edycja godzin w siatce zmienia tylko stan lokalny — `handleSaveEdit()` (linia 72) aktualizuje `setSchedules()` bez żadnego zapisu do bazy. Po odświeżeniu strony wszystkie zmiany znikają. To dotyczy widoku produkcyjnego.
**Priorytet:** Wysoki — użytkownik edytuje godziny i myśli, że się zapisały.

### 2. ScheduleTemplates i WeekDuplication — brak persystencji
**Plik:** `src/components/admin/ScheduleManagement.tsx` linie 86-100
**Problem:** Komponenty `ScheduleTemplates`, `WeekDuplication` i `SmartScheduleHelpers` nie otrzymują `isDemo` i nie mają logiki zapisu do bazy. Wszystkie operują na lokalnym stanie.
**Priorytet:** Średni — funkcje pomocnicze, ale użytkownik oczekuje zapisu.

### 3. QuickBlockModal — handleSaveBlock to console.log
**Plik:** `src/components/admin/ScheduleManagement.tsx` linie 34-37
**Problem:** `handleSaveBlock` robi tylko `console.log("Saving block:", block)` — szybka blokada czasu nie jest nigdy zapisywana.
**Priorytet:** Średni.

### 4. CSV Import usług — brak zapisu
**Plik:** `src/components/admin/ServicesManagement.tsx` linia 139-142
**Problem:** `handleCSVImport` robi tylko toast "Zaimportowano X usług" bez faktycznego tworzenia usług w bazie. Komentarz w kodzie: `// In production, would create via Supabase`.
**Priorytet:** Średni.

## Plan naprawy

| # | Plik | Zmiana |
|---|------|--------|
| 1 | `ScheduleGridView.tsx` | Pobrać dane z `working_hours` zamiast mock, zapisywać edycje do bazy przez `supabase.from("working_hours").upsert()` |
| 2 | `ScheduleManagement.tsx` | Przekazać `isDemo` do `ScheduleGridView`, `ScheduleTemplates`, `WeekDuplication`, `SmartScheduleHelpers` |
| 3 | `ScheduleManagement.tsx` | Zaimplementować `handleSaveBlock` — wstawić blokadę jako appointment ze statusem "blocked" lub zapis do `working_hours` z `is_working=false` |
| 4 | `ServicesManagement.tsx` | Zaimplementować `handleCSVImport` — iteracja po importowanych usługach i `createServiceMutation.mutateAsync()` dla każdej |

### Szczegóły techniczne — Fix #1 (ScheduleGridView)

```typescript
// Pobranie danych z bazy
const { data: dbWorkingHours } = useQuery({
  queryKey: ["working-hours-grid", salonId, weekStartISO],
  queryFn: async () => {
    const { data } = await supabase
      .from("working_hours")
      .select("*, staff_members(id, name, color)")
      .order("day_of_week");
    return data;
  },
  enabled: !isDemo && !!salonId,
});

// Zapis po edycji
const handleSaveEdit = async () => {
  if (!editingCell) return;
  // ... update local state ...
  if (!isDemo) {
    await supabase.from("working_hours")
      .upsert({
        staff_id: editingCell.staffId,
        day_of_week: editingCell.dayIndex,
        start_time: editValues.startTime,
        end_time: editValues.endTime,
        is_working: editValues.isWorking,
      }, { onConflict: 'staff_id,day_of_week' });
  }
};
```

### Podsumowanie

Wszystkie główne moduły CRUD (usługi, pracownicy, klienci, wizyty, produkty, ustawienia, nieobecności) poprawnie zapisują i odczytują dane z bazy. Jedyny poważny problem to **ScheduleGridView**, który operuje wyłącznie na danych lokalnych. Pozostałe 3 problemy to brakujące implementacje funkcji pomocniczych (quick block, CSV import, szablony grafiku).


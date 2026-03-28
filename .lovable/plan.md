

# Widget "Dziś w pracy" na dashboardzie

## Co budujemy
Nowy komponent `TodayStaffCard` wyświetlany na dashboardzie tuż pod KPI cards. Pokazuje listę pracowników z ich statusem (w pracy / zaraz zaczyna / wolne / poza godzinami), godzinami pracy i najbliższą wizytą.

## Logika statusów
- **🟢 Zielony** — teraz jest w godzinach pracy
- **🟡 Żółty** — zaczyna za < 1h
- **🔴 Czerwony** — wolne / urlop (z tabeli `time_off`)
- **⚪ Szary** — poza godzinami pracy (nie pracuje w ten dzień tygodnia)

## Dane z bazy
1. `staff_members` — lista aktywnych pracowników salonu (name, avatar_url, color, role)
2. `working_hours` — godziny pracy na dzisiejszy dzień tygodnia (start_time, end_time, is_working)
3. `time_off` — urlopy obejmujące dzisiejszy dzień
4. `appointments` — wizyty na dziś per pracownik (count + najbliższa przyszła wizyta z nazwą usługi)

## Nowe pliki
### `src/components/admin/dashboard/TodayStaffCard.tsx`
- Przyjmuje props: `salonId`, `isDemo`
- 4 zapytania useQuery (staff, working_hours, time_off, today appointments)
- Łączy dane w listę: dla każdego pracownika oblicza status, godziny, liczbę wizyt i następną wizytę
- Sortowanie: zielony → żółty → szary → czerwony
- UI: Card z nagłówkiem "👥 Dziś w pracy — [dzień, data]", lista pracowników z awatarem/inicjałami, kropką statusu, godzinami i info o wizytach
- Demo mode: mock data (3 pracowników)

## Zmiany w istniejących plikach
### `src/components/admin/DashboardHome.tsx`
- Import `TodayStaffCard`
- Render pod KPI cards, nad sekcją "Dzisiejsze wizyty": `<TodayStaffCard salonId={salonId} isDemo={isDemo} />`

Bez zmian w bazie danych — wszystkie potrzebne tabele i relacje już istnieją.


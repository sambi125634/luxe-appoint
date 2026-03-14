

# Sekcja usług nie wyświetla się poprawnie w modalu "Nowa wizyta"

## Diagnoza
Modal `AppointmentModal` **ma** wbudowany dropdown wyboru usługi (linie 323-349), ale na screenshocie go nie widać. Prawdopodobny powód: tablica `services` jest pusta — hook `useServices()` nie zwraca danych (brak usług w bazie dla tego salonu), a `isDemo` jest `false`, więc mock-dane się nie ładują.

Dodatkowo Select z 0 opcjami renderuje się jako pusty, niewidoczny element — łatwo go przeoczyć.

## Rozwiązanie

### 1. `AppointmentModal.tsx` — zapewnić widoczność sekcji usług
- Gdy `services` jest puste, wyświetlić komunikat "Brak usług — dodaj je w zakładce Usługi" zamiast pustego dropdown.
- Dodać fallback na `mockServices` gdy nie ma danych z bazy (tak samo jak jest z klientami i personelem), żeby sekcja nie była pusta.
- Upewnić się, że sekcja usługi jest zawsze widoczna i wyraźna (nie ukryta w pustym Select).

### 2. Weryfikacja propa `isDemo`
- W `ClientsManagement.tsx` sprawdzić czy `isDemo` jest poprawnie przekazywany — jeśli użytkownik jest w trybie demo, powinny ładować się mock usługi.

### Plik do edycji
- `src/components/admin/AppointmentModal.tsx` — fallback dla pustej listy usług + komunikat gdy brak danych


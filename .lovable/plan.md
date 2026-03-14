

# Przycisk "Umów wizytę" w profilu klienta

## Koncepcja
Dodanie przycisku "Umów wizytę" (z ikoną kalendarza) w stopce dialogu profilu klienta, obok istniejących "Usuń" i "Edytuj". Po kliknięciu — otwiera się `AppointmentModal` z automatycznie wypełnionymi danymi klienta (imię, nazwisko, telefon, email).

## Zmiany

### 1. `AppointmentModal.tsx` — nowy prop `preselectedClient`
Dodanie opcjonalnego propa:
```ts
preselectedClient?: { id: string; name: string; phone: string; email: string };
```
W `useEffect` przy otwarciu modala — jeśli `preselectedClient` jest podany, automatycznie wypełnić pola klienta i ustawić `clientSearch`.

### 2. `ClientsManagement.tsx` — przycisk + stan
- Nowy stan `showAppointmentModal` (boolean).
- Przycisk "Umów wizytę" w `DialogFooter` obok "Usuń" i "Edytuj" (widoczny tylko w trybie podglądu, nie edycji).
- Render `AppointmentModal` z przekazanym `preselectedClient` zbudowanym z danych `selectedClient`.
- Po zapisie wizyty — zamknięcie obu modali + toast potwierdzenia.

### Pliki do edycji
1. `src/components/admin/AppointmentModal.tsx`
2. `src/components/admin/ClientsManagement.tsx`

Bez zmian w bazie danych.


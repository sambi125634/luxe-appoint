

## Plan: Automatyczne uzupełnianie danych klienta w procesie rezerwacji

### Kontekst

Obecnie krok "Dane" (ClientForm) wymaga ręcznego wpisania imienia, nazwiska, telefonu, e-maila i zgód RODO — za każdym razem, niezależnie czy klient jest zalogowany czy nie.

**Dwa scenariusze:**
1. **Aplikacja mobilna (`/app/*`)** — klient jest ZAWSZE zalogowany → dane z profilu powinny być auto-uzupełnione, a krok "Dane" powinien być pominięty lub zredukowany do podglądu
2. **Widget online (`/s/slug`)** — klient zazwyczaj niezalogowany → pełny formularz jak dotychczas, ale z zachętą do pobrania aplikacji na ekranie potwierdzenia

### Strategia biznesowa

Widget = narzędzie akwizycji (pierwsza wizyta). Aplikacja = retencja (kolejne wizyty bez wysiłku). Na potwierdzeniu w widgecie dodajemy baner "Pobierz aplikację — następnym razem zarezerwujesz w 10 sekund".

---

### Zmiany techniczne

**1. Nowy prop `autoClientData` w `BookingWidget`**

```
interface BookingWidgetProps {
  ...
  autoClientData?: ClientData | null;
}
```

Gdy przekazany i kompletny — krok `form` jest automatycznie pomijany (filtrowany z `stepMapping` jak `intro` przy `skipIntro`).

**2. `SalonProfile.tsx` — pobranie danych zalogowanego użytkownika**

Przed renderowaniem `BookingWidget`, komponent pobiera dane z `profiles` (imię, nazwisko, telefon, email) i przekazuje je jako `autoClientData`. Klient nie musi nic wpisywać.

Dodatkowy kafelek przed widgetem: "Rezerwujesz jako Anna K. · +48 *** *** 789" z opcją "Zmień dane" (która przywraca pełny formularz).

**3. `BookingWidget.tsx` — logika pomijania kroku**

- Jeśli `autoClientData` jest kompletne (imię, nazwisko, telefon, email, acceptRodo=true):
  - Ustaw `clientData` na wartości z `autoClientData`
  - Usuń `"form"` z `stepMapping` (jak przy `skipIntro`)
  - Przy submicie użyj auto-danych
- Jeśli niekompletne — pokaż formularz z pre-fillem

**4. `BookingConfirmation.tsx` — baner "Pobierz aplikację"**

Tylko gdy kontekst = widget (brak `autoClientData`):
- Baner z ikoną smartfona
- "Następnym razem zarezerwuj w 3 kliknięcia"
- Link do `/install` lub deep link

**5. `handleFormSubmit` — rozpoznawanie istniejącego klienta**

Obecna logika już szuka klienta po telefonie (linia 388-393). Gdy znajdzie — używa istniejącego `client_id`. To działa poprawnie, nie wymaga zmian.

---

### Pliki do edycji

| Plik | Zmiana |
|------|--------|
| `src/components/booking/BookingWidget.tsx` | Nowy prop `autoClientData`, logika pomijania kroku `form` |
| `src/components/client-app/SalonProfile.tsx` | Fetch profilu użytkownika, przekazanie `autoClientData`, kafelek "Rezerwujesz jako..." |
| `src/components/booking/BookingConfirmation.tsx` | Baner "Pobierz aplikację" dla widgetu |
| `src/components/booking/ClientForm.tsx` | Brak zmian (formularz zostaje dla widgetu) |


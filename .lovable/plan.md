

# Protokół Testowy — Panel Admin Beauty Calendar

## Cel
Systematyczna weryfikacja każdego modułu panelu administracyjnego, zarówno w trybie demo (`/demo`) jak i w trybie produkcyjnym (`/admin`), aby potwierdzić gotowość platformy od rejestracji do pełnej obsługi salonu.

---

## Faza 0: Rejestracja i Onboarding

| # | Test | Oczekiwany wynik |
|---|------|-----------------|
| 0.1 | Otwórz `/auth`, przejdź na zakładkę "Rejestracja" | Formularz: imię, nazwisko, email, hasło |
| 0.2 | Wypełnij formularz i kliknij "Zarejestruj się" | Toast sukcesu, email weryfikacyjny wysłany |
| 0.3 | Potwierdź email → automatyczny redirect do `/onboarding` | Kreator 5-krokowy widoczny |
| 0.4 | **Krok 1** — Dane salonu: nazwa, adres, miasto, telefon, email | Walidacja (nazwa wymagana), przycisk "Dalej" aktywny |
| 0.5 | **Krok 2** — Godziny pracy: domyślne pon-sob, edycja checkboxów i godzin | Zapis działa, można wyłączyć/włączyć dni |
| 0.6 | **Krok 3** — Usługi: wybór branży → propozycje kategorii/usług | Kategorie i usługi dodane do bazy |
| 0.7 | **Krok 4** — Pracownicy: dodanie min. 1 pracownika (opcjonalne) | Pominięcie lub dodanie działa |
| 0.8 | **Krok 5** — Podsumowanie: link do rezerwacji, embed code | Kopiowanie linku/kodu działa, przycisk "Przejdź do panelu" |
| 0.9 | Redirect do `/admin` | Dashboard widoczny, Setup Checklist pokazuje postęp |

---

## Faza 1: Dashboard (`home`)

| # | Test | Oczekiwany wynik |
|---|------|-----------------|
| 1.1 | KPI cards widoczne (wizyty dziś, przychód, klienci) | Dane z bazy lub "0" dla nowego salonu |
| 1.2 | Setup Checklist — kliknij każdy item | Nawiguje do odpowiedniej zakładki |
| 1.3 | "Szybka sprzedaż produktu" — przycisk otwiera modal | Modal QuickProductSale się otwiera |
| 1.4 | Samouczek (GuidedTour) — przycisk w headerze | Tour startuje i przechodzi przez kroki |

---

## Faza 2: Kalendarz (`calendar`)

| # | Test | Oczekiwany wynik |
|---|------|-----------------|
| 2.1 | Widok tygodniowy się ładuje | Siatka godzin × pracownicy |
| 2.2 | Kliknij slot → AppointmentModal | Formularz wizyty: klient, usługa, pracownik, data/godzina |
| 2.3 | Zapisz wizytę | Toast sukcesu, wizyta pojawia się w kalendarzu |
| 2.4 | Edytuj istniejącą wizytę | Modal z wypełnionymi danymi, zapis działa |
| 2.5 | Anuluj wizytę | Status zmieniony, wizyta oznaczona |

---

## Faza 3: Usługi (`services`)

| # | Test | Oczekiwany wynik |
|---|------|-----------------|
| 3.1 | Lista usług się ładuje (lub pusta dla nowego salonu) | Skeleton loader → dane |
| 3.2 | "Dodaj usługę" → dialog z formularzem | Pola: nazwa, kategoria, czas, cena, opis, media, korzyści |
| 3.3 | Upload zdjęcia w zakładce "Media" | Plik uploadowany do Storage, miniatura widoczna |
| 3.4 | Upload wideo | Wideo uploadowane, preview player |
| 3.5 | Dodaj korzyści (benefits) — tagi | Dynamiczne dodawanie/usuwanie tagów |
| 3.6 | Zapisz usługę | Toast sukcesu, usługa na liście |
| 3.7 | Edytuj usługę | Dialog z wypełnionymi danymi, zapis działa |
| 3.8 | Usuń usługę | Potwierdzenie, usunięcie z listy |
| 3.9 | Dodaj kategorię | Dialog kategorii, zapis do bazy |
| 3.10 | Filtruj po kategorii | Lista filtrowana |
| 3.11 | Wyszukaj po nazwie | Wyniki filtrowane |
| 3.12 | Toggle widok lista/karty (showcase) | Przełączenie między widokami |
| 3.13 | Import CSV | Dialog importu, parsowanie pliku |

---

## Faza 4: Personel (`staff`)

| # | Test | Oczekiwany wynik |
|---|------|-----------------|
| 4.1 | Lista pracowników | Karty z avatarami |
| 4.2 | "Dodaj pracownika" | Formularz: imię, email, telefon, rola, kolor, godziny pracy |
| 4.3 | Przypisz usługi do pracownika | Checkboxy usług, zapis |
| 4.4 | Edytuj pracownika | Dane wypełnione, zapis działa |
| 4.5 | Usuń pracownika | Potwierdzenie, usunięcie |
| 4.6 | Ustaw godziny pracy per dzień | 7 dni z checkboxami i zakresami godzin |

---

## Faza 5: Klienci (`clients`)

| # | Test | Oczekiwany wynik |
|---|------|-----------------|
| 5.1 | Lista klientów (lub pusta) | Tabela/karty z danymi |
| 5.2 | "Dodaj klienta" | Formularz: imię, nazwisko, telefon, email, notatki, tagi, RODO |
| 5.3 | Zapisz klienta | Toast sukcesu, klient na liście |
| 5.4 | Edytuj klienta | Dialog z danymi, zapis |
| 5.5 | Filtruj (VIP, problematyczny, tagi) | Filtry działają |
| 5.6 | Wyszukaj klienta | Wyniki filtrowane |
| 5.7 | Widok historii wizyt klienta | Zakładka z listą wizyt |

---

## Faza 6: Produkty (`products`)

| # | Test | Oczekiwany wynik |
|---|------|-----------------|
| 6.1 | Katalog produktów — dodaj produkt | Formularz: nazwa, marka, kategoria, cena, SKU, EAN, zdjęcie |
| 6.2 | Magazyn — stany magazynowe | Lista z current_stock, korekta stanu |
| 6.3 | Dostawy — dodaj dostawę | Formularz z dostawcą, produktami, ilościami |
| 6.4 | Raport sprzedaży | Tabela/wykresy |
| 6.5 | Dostawcy — dodaj dostawcę | Formularz: nazwa, kontakt, email, telefon, warunki |

---

## Faza 7: Pozostałe moduły

| # | Moduł | Test | Oczekiwany wynik |
|---|-------|------|-----------------|
| 7.1 | Urlopy (`time-off`) | Dodaj urlop dla pracownika | Formularz z datami, typem, zapis |
| 7.2 | Widgety (`widgets`) | Widget editor, embed code | Kod do skopiowania, podgląd widgetu |
| 7.3 | Konwersacje (`conversations`) | Lista kontaktów, wysłanie wiadomości | UI czatu widoczne |
| 7.4 | Pipeline (`pipeline`) | Kolumny Kanban, dodaj/przesuń kartę | Drag & drop lub zmiana statusu |
| 7.5 | Księgowość (`accounting`) | Wykresy, filtry, export | Dane wyświetlane, eksport działa |
| 7.6 | Statystyki (`stats`) | Wykresy KPI | Dane renderowane |
| 7.7 | Ustawienia (`settings`) | Profil salonu, powiadomienia, integracje, rezerwacje | Formularz zapisu, toggle'e |
| 7.8 | Pomoc (`support`) | Chat AI, szybkie akcje | Wiadomość wysłana, odpowiedź |

---

## Faza 8: Booking Widget (strona klienta)

| # | Test | Oczekiwany wynik |
|---|------|-----------------|
| 8.1 | Otwórz `/book/{slug}` | Widget się ładuje, usługi z bazy |
| 8.2 | Wybierz usługę | ServiceDetailModal z mediami, korzyściami, CTA |
| 8.3 | Wybierz pracownika | Lista dostępnych pracowników |
| 8.4 | Wybierz datę i godzinę | Dostępne sloty wyświetlone |
| 8.5 | Wypełnij formularz klienta | Imię, nazwisko, telefon, email |
| 8.6 | Potwierdź rezerwację | Konfirmacja z confetti, wizyta w kalendarzu admina |

---

## Faza 9: Demo vs Produkcja

| # | Test | Oczekiwany wynik |
|---|------|-----------------|
| 9.1 | `/demo` — wszystkie moduły z danymi mockowanymi | `isDemo=true` → dane demo, baner "To jest wersja demo" |
| 9.2 | `/admin` (nowe konto) — pusta karta | `isDemo=false` → puste tabele, Setup Checklist |
| 9.3 | Demo: przyciski "Dodaj" działają (ale nie zapisują do bazy) | UI responsywne, brak błędów |
| 9.4 | Admin: CRUD operacje zapisują do bazy | Dane trwałe po odświeżeniu |

---

## Faza 10: Responsywność i UX

| # | Test | Oczekiwany wynik |
|---|------|-----------------|
| 10.1 | Panel na mobile (< 768px) | Sidebar hamburger, treść bez overflow |
| 10.2 | Wszystkie dialogi/modale na mobile | Scrollowalne, przyciski widoczne |
| 10.3 | Toast notifications | Pojawiają się i znikają |
| 10.4 | Loading states | Skeleton loaders we wszystkich modułach |
| 10.5 | Logout | Redirect do `/auth`, sesja wyczyszczona |

---

## Sposób przeprowadzenia

Mogę przeprowadzić ten protokół krok po kroku używając narzędzi przeglądarki — ale wymaga to, żebyś najpierw:
1. **Zalogował/a się w podglądzie** (preview) na konto testowe
2. **Dał/a mi znać**, że mogę zacząć testować

Alternatywnie mogę przejrzeć kod każdego modułu i zidentyfikować potencjalne problemy bez uruchamiania przeglądarki — to szybsze i nie wymaga logowania.

**Które podejście preferujesz?**


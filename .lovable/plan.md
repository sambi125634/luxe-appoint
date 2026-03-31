

## Plan: Generowanie dokumentu DOCX — Pełna specyfikacja panelu Beauty Calendar

### Co zostanie wygenerowane

Dokument DOCX (~30-40 stron) zawierający szczegółową specyfikację każdego modułu panelu admina, gotowy do skopiowania do Notion i Cloud.

### Struktura dokumentu

**1. Dashboard** — 4 karty KPI (wizyty dziś, przychód, obłożenie tygodniowe, no-shows), lista wizyt na dziś, top usługi, top pracownicy, szybka sprzedaż produktów, predykcja przychodu AI, weekly brief AI, alerty stanów magazynowych, karta zespołu dnia

**2. Kalendarz** — 6 zakładek: Kalendarz tygodniowy (widok kolumnowy staff-as-columns, drag & drop, nowa wizyta), Urlopy, Siatka grafiku, Szablony, Asystent AI (analiza obłożenia, wyszukiwanie wolnych slotów), Duplikacja tygodnia, Szybka blokada

**3. Zespół** — Lista pracowników z avatarami, 3 zakładki (Lista/Zaproś/Uprawnienia), edycja profilu (dane, godziny pracy, przerwy, kompensacja 5 typów, certyfikaty, specjalizacje, widoczność w widżecie), system zaproszeń email, role i uprawnienia

**4. Usługi** — Katalog usług z kategoriami, widok grid/lista, wyszukiwarka, edycja (nazwa, cena, czas, VAT, opis, media, benefity), warianty usługi, receptury (shortcut do edytora), przypisanie pracowników, import CSV, drag & drop sortowanie

**5. Produkty** — 8 zakładek: Katalog, Stany magazynowe, Receptury, Dostawy, Zamówienia, Statystyki inwentarza, Raport sprzedaży, Dostawcy. Skaner faktur AI, kody kreskowe/QR, zamówienia zbiorcze, alerty niskiego stanu

**6. Klienci** — Wyszukiwarka, filtry (tagi, grupy zakupowe), profil klienta (dane, historia wizyt, notatki, tagi, preferencje usługowe), grupy zakupowe (VIP, Stała, Nowa, Uśpiona, Sezonowa, Odkrywczyni), risk score AI, import CSV, zarządzanie tagami

**7. Konwersacje** — Inbox SMS/WhatsApp, lista kontaktów z podglądem ostatniej wiadomości, widok konwersacji z historią, wysyłka wiadomości, integracja SMSAPI/Twilio

**8. Konsultacje** — 3 zakładki: Moje karty (szablony konsultacyjne 6 kategorii), Przypisanie do usług, Historia wysyłek. Kreator kart (Easy Card Builder), wysyłka formularza do klientki przed wizytą

**9. Ścieżka Klientki™** — 2 zakładki: Tablica Kanban (11 etapów od rezerwacji do 5. wizyty), Raporty. Hero banner z wartościami (Widoczność, Autopilot, Przychód), 4 KPI (aktywne, wartość, no-shows, ukończone), drag & drop, status autopilota na kartach

**10. Retencja** — 4 zakładki: Przegląd (radar retencji, KPI), Sekwencje (follow-up automatyczny), Historia, Statystyki

**11. Polecenia & Opinie** — 4 zakładki: Przegląd (statystyki poleceń + opinii), Program poleceń (ambasadorki, linki), Opinie Google (zbieranie recenzji), Ustawienia

**12. Widżety** — 3 zakładki: Lista widżetów (kopiuj link, osadź kod, edytuj, podgląd), Promocje, Instagram link. Edytor widżetu (motyw, kolory, usługi, pola formularza, kolejność kroków)

**13. Raporty** — 10 zakładek: Wykresy, Dzienny raport, Sprzedaż/VAT, Produkty, Prowizje, Vouchery, Obłożenie, No-shows, Eksport, Rozliczenia pracowników. Filtry dat, ręczne transakcje, eksport CSV

**14. Ustawienia** — 7 zakładek: Profil salonu, Rezerwacje, Powiadomienia, Komunikacja, Integracje, Automatyzacja, Eksport danych

**15. Pomoc** — AI Asystent (chat z AI znającym platformę), szybkie akcje, kontakt email + dokumentacja

### Realizacja techniczna

1. Skopiuję skrypt DOCX skill do `/tmp/`
2. Wygeneruję dokument JS z biblioteką `docx` — format A4, czcionka Arial, kolory brand (#C9A96E gold), nagłówki sekcji, listy punktowane, tabele z opisami pól
3. Walidacja + QA wizualna (konwersja do PDF → obrazy → inspekcja)
4. Plik końcowy w `/mnt/documents/Beauty_Calendar_Specyfikacja.docx`


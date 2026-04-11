

## Plan: Wygenerowanie dokumentacji aplikacji klienckiej

Stworzę szczegółowy dokument PDF opisujący obecny stan aplikacji mobilnej dla klientów salonów (`/app`). Dokument będzie zawierał:

### Zawartość dokumentu

1. **Architektura i routing** — struktura tras, guard autentykacji, nawigacja
2. **Onboarding klienta** — flow dołączania do salonu (`/join/:slug`), 4-slajdowy onboarding
3. **Ekrany główne** (5 zakładek):
   - Moje Salony — lista powiązanych salonów, pull-to-refresh, ulubione
   - Wizyty — nadchodzące/historia/widok kalendarza, anulowanie, countdown, ocenianie
   - Dla Ciebie — program lojalnościowy (pieczątki + punkty), kupony, CTA poleceń
   - Aktywność — centrum powiadomień, grupowanie po dacie, odczytywanie
   - Profil — edycja danych, ulubione, polecenia, wylogowanie
4. **Ekrany dodatkowe** — Profil Salonu (z wbudowanym BookingWidget + auto-fill danych), Ulubione, Poleć Znajomej, Modal Oceny
5. **Stan techniczny** — co działa z backendem, co jest demo/mock data (ReferFriend = hardcoded demo)
6. **Tabele bazodanowe** — client_salon_links, loyalty_stamps, client_coupons, client_notifications, client_reviews, profiles
7. **Brakujące elementy / gaps** — lista rzeczy do rozbudowy

### Plik wyjściowy

PDF w `/mnt/documents/client-app-documentation.pdf` — gotowy do wgrania do Cloud i dalszej pracy.

### Co NIE jest zmieniane

Żaden plik w kodzie — to wyłącznie wygenerowanie dokumentu analitycznego.

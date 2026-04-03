

## Plan: Specyfikacja aplikacji mobilnych Beauty Calendar

### Kontekst — co już mamy

Projekt ma już dwa interfejsy mobilne:

1. **Aplikacja właściciela** (`/m/*`) — MobileAdminApp z BottomTabBar (Dashboard, Kalendarz, Klienci, Alerty, Więcej), ładuje moduły desktopowe przez MobileModuleWrapper
2. **Aplikacja klientki** (`/app/*`) — ClientApp z BottomTabBar (Salony, Wizyty, Ulubione, Profil), dołączanie przez `/join/:slug`

Obie działają jako PWA (instalowalna z przeglądarki) + Capacitor (natywna iOS/Android). Dane klientek są izolowane przez `client_salon_links` — klientka widzi TYLKO salony, do których dołączyła.

---

### Proponowana architektura dwóch aplikacji

```text
┌─────────────────────────────────────────────┐
│          BEAUTY CALENDAR BUSINESS           │
│     (dla właścicielki / personelu)           │
│                                             │
│  Dashboard → Kalendarz → Klienci → Więcej   │
│  Pełne zarządzanie salonem z telefonu       │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│          BEAUTY CALENDAR CLIENT             │
│     (dla klientek salonów)                  │
│                                             │
│  Salony → Wizyty → Ulubione → Profil       │
│  Rezerwacje, historia, powiadomienia        │
└─────────────────────────────────────────────┘
```

---

### APLIKACJA 1: Beauty Calendar Business (właścicielka)

**Status**: Działa (`/m/*`), wymaga rozbudowy

**Co jest**:
- Dashboard z KPI
- Kalendarz z widokiem dnia
- Lista klientów
- Powiadomienia (pending appointments)
- Menu "Więcej" → ładuje moduły desktopowe (usługi, produkty, zespół, pipeline, konwersacje, widgety, księgowość, ustawienia, pomoc)

**Co brakuje / do rozbudowy**:

| Funkcja | Opis | Priorytet |
|---------|------|-----------|
| Push notifications | Natywne powiadomienia o nowej rezerwacji, anulowaniu, no-show | 🔴 Krytyczny |
| Quick actions na Dashboard | Szybkie dodanie wizyty, blokada slotu, notatka | 🟡 Wysoki |
| Skanowanie kodów kreskowych | Skaner magazynowy przez aparat (Capacitor Camera) | 🟡 Wysoki |
| Offline mode | Cache ostatnich wizyt i klientów, sync po powrocie online | 🟢 Średni |
| Statystyki w "Więcej" | Mini-raporty (przychód dziś/tydzień, top usługi) | 🟢 Średni |
| Haptic feedback | Wibracje przy akcjach (potwierdzenie, anulowanie) | 🟢 Niski |
| Deep links | Powiadomienie → otwiera konkretną wizytę w kalendarzu | 🟡 Wysoki |
| Widget iOS/Android | Widget na ekranie głównym z liczbą wizyt dziś | 🟢 Niski |

---

### APLIKACJA 2: Beauty Calendar Client (klientki)

**Status**: Działa (`/app/*`), fundamenty są, wymaga znaczącej rozbudowy

**Co jest**:
- Lista "Moje salony" (z `client_salon_links`)
- Profil salonu z usługami, zespołem, CTA rezerwacji
- "Moje wizyty" z historią i anulowaniem
- Ulubione salony
- Profil użytkownika z edycją

**Co brakuje / do rozbudowy**:

| Funkcja | Opis | Priorytet |
|---------|------|-----------|
| Push notifications | Przypomnienie o wizycie (24h, 2h przed), potwierdzenie rezerwacji | 🔴 Krytyczny |
| Program lojalnościowy | Punkty za wizyty, nagrody, progress bar do nagrody | 🔴 Krytyczny |
| Oceny i recenzje | Ocena wizyty po zakończeniu (1-5 gwiazdek + komentarz) | 🟡 Wysoki |
| Galeria zabiegów | Zdjęcia efektów (before/after), portfolio specjalistek | 🟡 Wysoki |
| Karta lojalnościowa | Cyfrowa "pieczątka" — co 10 wizyta gratis | 🟡 Wysoki |
| Kupony i promocje | Sekcja z aktywnymi promocjami salonu | 🟡 Wysoki |
| Chat z salonem | Bezpośrednia komunikacja (tekst + zdjęcia) | 🟢 Średni |
| Karta konsultacyjna | Wypełnianie formularza konsultacyjnego przed wizytą | 🟢 Średni |
| Polecenia | "Poleć znajomej" z unikalnym kodem + tracking nagrody | 🟡 Wysoki |
| Historia zakupów produktów | Lista kupionych produktów z możliwością ponowienia | 🟢 Średni |
| Powiadomienia in-app | Centrum powiadomień (nowy kupon, zmiana terminu, przypomnienie) | 🟡 Wysoki |
| Onboarding klientki | Ekran powitalny po `/join/:slug` z tutorialem | 🟢 Średni |
| Udostępnianie salonu | "Poleć ten salon" — share link do `/join/:slug` | 🟢 Niski |

---

### Nowa struktura nawigacji — aplikacja klientki

```text
BOTTOM TAB BAR (5 zakładek):
  🏠 Salony      — lista dołączonych salonów
  📅 Wizyty      — nadchodzące + historia + kalendarz
  🎁 Dla Ciebie  — kupony, promocje, program lojalnościowy  ← NOWE
  🔔 Aktywność   — centrum powiadomień                      ← NOWE
  👤 Profil      — dane, ulubione, ustawienia, polecenia
```

**Zmiana vs obecny stan**: Zamiast "Ulubione" i "Profil" jako osobne taby → ulubione przeniesione do profilu, dodane "Dla Ciebie" (engagement) i "Aktywność" (retention).

---

### Kluczowa wartość dla właścicielki salonu

Aplikacja klientki to nie tylko wygoda dla klientek — to **narzędzie retencji** dla salonu:

1. **Własność danych** — klientka jest w TWOJEJ bazie, nie w marketplace Booksy
2. **Push notifications** — przypomnienia zmniejszają no-show o 40-60%
3. **Program lojalnościowy** — zwiększa częstotliwość wizyt o 20-30%
4. **Polecenia** — organiczny wzrost bazy klientów bez kosztu reklamy
5. **Bezpośredni kontakt** — chat bez pośredników

---

### Technologia dystrybucji

```text
OPCJA A: PWA (rekomendowana na start)
  ✅ Bez App Store review
  ✅ Natychmiastowe aktualizacje
  ✅ Działa na iOS + Android
  ✅ Instalacja z przeglądarki
  ⚠️ Ograniczone push notifications na iOS

OPCJA B: Capacitor (natywna, docelowo)
  ✅ Pełne push notifications
  ✅ Dostęp do kamery (skaner)
  ✅ App Store + Google Play
  ✅ Widget na ekranie głównym
  ⚠️ Wymaga Apple Developer Account ($99/rok)
  ⚠️ Wymaga review procesu w sklepach

REKOMENDACJA: Start z PWA → po walidacji → Capacitor
```

---

### Plan implementacji (kolejność)

**Faza 1 — Fundament** (teraz):
1. Rozbudowa "Dla Ciebie" (kupony, program lojalnościowy)
2. Centrum powiadomień in-app
3. Nowa nawigacja 5-tabowa

**Faza 2 — Engagement**:
4. Oceny wizyt + galeria
5. System poleceń w aplikacji
6. Onboarding klientki po dołączeniu

**Faza 3 — Natywna**:
7. Push notifications (Capacitor + backend)
8. Skaner kodów kreskowych (Capacitor Camera)
9. Publikacja w App Store / Google Play

---

### Następny krok

Powiedz, która część jest priorytetem — mogę od razu zacząć implementację od Fazy 1, albo najpierw wygenerować pełną specyfikację DOCX z wireframe'ami i copy dla każdego ekranu.


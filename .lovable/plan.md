

# Strategia aplikacji mobilnej Beauty Funnels

## Rekomendacja: DWIE osobne aplikacje

Booksy robi dokładnie to samo — ma **Booksy** (dla klientów) i **Booksy Biz** (dla właścicieli). To nie przypadek. Oto dlaczego dwie aplikacje są lepsze:

### Dlaczego NIE jedna aplikacja

| Problem jednej aplikacji | Wpływ |
|---|---|
| Mylący onboarding — "Jesteś klientem czy właścicielem?" | Wyższy bounce rate |
| App Store listing — nie możesz targetować dwóch grup jednocześnie | Gorsze ASO (App Store Optimization) |
| Recenzje mieszane — klienci oceniają UX rezerwacji, właściciele panel zarządzania | Niższa średnia ocena |
| Rozmiar aplikacji — ładujesz moduły których 90% użytkowników nie potrzebuje | Wolniejsze ładowanie |

### Dlaczego TAK dwie aplikacje

- **Beauty Funnels** (klient) — lekka, szybka, focus na rezerwacji i relacji z salonem
- **Beauty Funnels Business** (właściciel/staff) — pełny panel admin, kalendarz, księgowość

Obie aplikacje korzystają z **tego samego backendu** i **tej samej bazy danych** — różnią się tylko frontendem.

---

## Architektura techniczna

Obie aplikacje budujemy z **Capacitor** — wrapper natywny na istniejący React kod.

```text
┌─────────────────────────────────────────────┐
│              Shared Backend (Cloud)          │
│  Auth · Database · Edge Functions · Storage  │
└──────────────┬──────────────┬───────────────┘
               │              │
    ┌──────────▼──────┐  ┌───▼──────────────┐
    │  Beauty Funnels  │  │  BF Business     │
    │  (Client App)    │  │  (Owner App)     │
    ├──────────────────┤  ├──────────────────┤
    │ Capacitor + React│  │ Capacitor + React│
    │                  │  │                  │
    │ • Moje salony    │  │ • Dashboard      │
    │ • Rezerwacja     │  │ • Kalendarz      │
    │ • Historia wizyt │  │ • Klienci        │
    │ • Ulubione       │  │ • Usługi         │
    │ • Powiadomienia  │  │ • Księgowość     │
    │ • Profil         │  │ • Widgety        │
    │ • Rekomendacje   │  │ • Ustawienia     │
    └──────────────────┘  └──────────────────┘
```

---

## Aplikacja kliencka — Beauty Funnels

### Jak klient trafia do aplikacji (NIE marketplace)

1. **Kod referencyjny / link zaproszenia** — salon wysyła klientowi link `beautyfunnels.app/join/SALON_SLUG`
2. **QR kod w salonie** — skanuje i automatycznie się przypisuje
3. **Po rezerwacji online** — klient który zarezerwował przez widget dostaje zaproszenie do pobrania aplikacji

Klient po zalogowaniu widzi TYLKO salony, do których został przypisany (przez tabelę `clients` z `salon_id`).

### Ekrany aplikacji klienckiej

1. **Moje Salony** — lista przypisanych salonów z logo, adresem, oceną
2. **Profil salonu** — usługi z cenami, zdjęcia/wideo, opinie, pracownicy
3. **Rezerwacja** — wybór usługi → pracownik → termin → potwierdzenie (reuse `BookingWidget`)
4. **Moje wizyty** — nadchodzące + historia z opcją ponownej rezerwacji
5. **Powiadomienia** — przypomnienia, promocje, follow-upy
6. **Profil** — dane osobowe, preferencje, ulubione usługi

### Inspiracja Booksy ale lepiej

- Brak marketplace = brak konkurencji między salonami w jednej aplikacji
- Salon ma 100% kontroli nad swoimi klientami (zero prowizji, zero "polecanych")
- Klient widzi rekomendacje od SWOJEGO salonu, nie od platformy

---

## Aplikacja biznesowa — Beauty Funnels Business

To w zasadzie **wrapper natywny na istniejący `/admin` panel** z kilkoma usprawnieniami:

- Push notifications (Capacitor Push Notifications plugin)
- Dostęp do kamery (skanowanie kodów, zdjęcia produktów)
- Offline mode (cache ostatnich wizyt)
- Biometric login (Face ID / Touch ID)

Ponieważ panel admin jest już **w pełni responsywny**, wrapper Capacitor potrzebuje minimalnych zmian.

---

## Plan implementacji

### Faza 1: Fundament kliencki (nowe ekrany w React)
- Nowa rola `client` w `user_roles` (klient końcowy, nie salon owner)
- Tabela `client_salon_links` — relacja klient↔salon (wiele salonów per klient)
- Nowe strony React: `/app/salons`, `/app/salon/:id`, `/app/bookings`, `/app/profile`
- Dedykowana nawigacja dolna (bottom tabs) w stylu Booksy
- Reuse istniejącego `BookingWidget` jako komponentu rezerwacji

### Faza 2: Capacitor setup dla obu aplikacji
- Konfiguracja dwóch Capacitor projektów (client + business)
- Routing: client app → `/app/*`, business app → `/admin/*`
- Native plugins: Push Notifications, Camera, Biometrics
- Build pipeline dla iOS + Android

### Faza 3: App Store deployment
- Ikony, splash screeny, opisy w PL i EN
- Apple Developer Account + Google Play Console
- Review process i submission

---

## Wymagane zmiany w bazie danych

1. **Nowa rola** `client` w enum `app_role`
2. **Nowa tabela** `client_salon_links` (client_user_id, salon_id, joined_at, invite_code)
3. **Nowa tabela** `client_favorites` (client_user_id, salon_id, service_id)
4. **Nowa tabela** `push_tokens` (user_id, device_token, platform, created_at)

---

## Podsumowanie decyzji

| Aspekt | Decyzja |
|---|---|
| Ile aplikacji? | 2 (Client + Business) |
| Technologia | Capacitor (React wrapper) |
| Wspólny backend | Tak, ten sam Cloud |
| Model dostępu klienta | Invite-only (nie marketplace) |
| App Store | Apple + Google Play |
| Istniejący kod reuse | ~70% (BookingWidget, hooks, UI components) |


## Cel

Zakładka „Aplikacja klientki" (w demo i w panelu admin) ma zawierać **tylko to, czego nie ma w innych modułach** + bogate statystyki samej aplikacji. Wszystko, co jest zarządzane gdzie indziej, zostaje pokazane jako „read-only podgląd" z linkiem do źródła — bez możliwości edycji w dwóch miejscach.

## Stan obecny (audyt)

Obecne sekcje i ich źródła prawdy:

| Sekcja w zakładce      | Co realnie robi                       | Gdzie to już istnieje              | Werdykt        |
| ---------------------- | ------------------------------------- | ---------------------------------- | -------------- |
| Wygląd (kolor + opis)  | edytuje `salons.theme_primary_color`, `description`, `name` | Ustawienia → Profil salonu         | duplikat       |
| Galeria                | CRUD na `salon_gallery`               | Ustawienia → Profil + Usługi (media usług) | duplikat |
| Lojalność              | CRUD na `loyalty_rewards`             | Klientki → Lojalność / Pipeline    | duplikat       |
| Powiadomienia (welcome + birthday + push) | mix: welcome → `salons.welcome_message`, birthday → Autopilot, push → wyłącznie tu | Autopilot + Ustawienia → Komunikacja | częściowy duplikat |
| Zasady rezerwacji      | edytuje `salons.allow_*`, `*_notice_hours`, deposit | Ustawienia → Rezerwacje (`BookingSettingsPanel`) | duplikat |
| Statystyki             | 4 liczniki + lista top klientek       | tylko tu                           | zostawić, rozbudować |

## Nowa struktura zakładki

```text
1. Statystyki aplikacji        ← rozbudowane
2. Hero / Splash               ← jedyny prawdziwy edit branding (zostaje)
3. Push do aplikacji           ← jedyny prawdziwy edit komunikacji (zostaje)
4. Podgląd ustawień salonu     ← read-only karta z deeplinkami
```

Sekcje **Wygląd, Galeria, Lojalność, Zasady rezerwacji** w obecnej formie znikają. Welcome message i birthday config przenosimy do Ustawień (już tam są — usuwamy tylko duplikat z zakładki).

### 1. Statystyki aplikacji (rozbudowa)

Cztery dotychczasowe liczniki + nowe metryki specyficzne dla aplikacji:

- **Adopcja**: zainstalowane (`client_salon_links`), aktywne 7d/30d (logowania), MoM growth
- **Engagement**: średnia liczba sesji/użytkowniczkę, push CTR (sent vs opened), prompts Beauty Rhythm zaakceptowane
- **Konwersja z aplikacji**: rezerwacje przez appkę vs przez widget (% udziału), rebooks i waitlist joins inicjowane w appce
- **Lojalność i polecenia (read-only)**: punkty zdobyte przez appkę, wymiany nagród przez appkę, kody referencyjne wygenerowane z appki
- **Top 10 użytkowniczek aplikacji** (zostaje, z ostatnią aktywnością)
- **Wykres aktywności 30 dni** (zostaje, lepsza skala)

Wszystkie metryki mają wariant demo (z `demoData.ts`) i wariant live (`useQuery` po `salonId`).

### 2. Hero / Splash (jedyny prawdziwy branding edit)

Jedno pole: **zdjęcie powitalne na górze profilu salonu w aplikacji** (`salons.splash_image_url`). To jedyna rzecz, której nie da się dobrze wyciągnąć z Profilu salonu, bo w widgetcie nie jest używana — appka ma własny hero.

- upload do bucket `salon-media`
- podgląd 16:9
- przycisk „Usuń"
- domyślne demo: gradient z `theme_primary_color`

### 3. Push do aplikacji

Jedyna rzecz komunikacyjna, której nie ma w innych modułach (Autopilot to SMS/Email, Ustawienia → Komunikacja to provider). Zostaje:

- formularz: tytuł, treść, segment (wszystkie / VIP / nowe / nieaktywne 30d)
- przycisk „Wyślij teraz"
- historia ostatnich 20 push-ów (kto kliknął, kto zignorował)

W demo: mockup z `DEMO_PUSH_HISTORY`, w live: faktyczny `usePushSubscription` + nowa tabela `app_push_campaigns` jeśli nie istnieje (sprawdzimy przed migracją, jeśli jest — używamy).

### 4. Podgląd ustawień salonu (read-only)

Zamiast usuniętych sekcji jedna karta typu „Tak wygląda Twoja konfiguracja w aplikacji":

```text
┌─ Profil salonu ─────────────────────────────┐
│ • Nazwa: Salon Bella                        │
│ • Kolor przewodni: ● #D4537E                │
│ • Opis: „Twoje miejsce relaksu..."          │
│ • Logo: [✓]   Galeria: 18 zdjęć             │
│ → Edytuj w Ustawieniach → Profil salonu  ↗  │
├─ Rezerwacje w aplikacji ────────────────────┤
│ • Reschedule: ✓  Anulacja: ✓  Waitlist: ✓   │
│ • Wymagana zaliczka: nie                    │
│ → Edytuj w Ustawieniach → Rezerwacje     ↗  │
├─ Lojalność ─────────────────────────────────┤
│ • Aktywnych nagród: 5                       │
│ • 1 pkt = 0,10 PLN                          │
│ → Zarządzaj w Klientki → Lojalność       ↗  │
├─ Powiadomienia (welcome, urodziny) ─────────┤
│ • Welcome: ustawione (124 znaki)            │
│ • Kampanie urodzinowe: ON (Autopilot)       │
│ → Zarządzaj w Autopilot / Ustawienia     ↗  │
└─────────────────────────────────────────────┘
```

Każdy wiersz jest klikalny i przenosi do właściwej zakładki + odpowiedniej sekcji.

## Co usuwam z kodu

- `sections/BrandingSection.tsx` → zastąpione przez `sections/HeroSection.tsx` (tylko splash)
- `sections/GallerySection.tsx` → usunięte (galeria w Ustawieniach + media usług w Usługach)
- `sections/LoyaltySection.tsx` → usunięte
- `sections/BookingRulesSection.tsx` → usunięte
- `sections/CommunicationSection.tsx` → odchudzone do **tylko push** (`sections/PushSection.tsx`); welcome + birthday przeniesione do podglądu w sekcji 4

Nawigacja w `ClientAppPage.tsx`:

```text
Statystyki · Hero · Push · Podgląd konfiguracji
```

Right-rail `MobilePreview` zostaje, tylko teraz `config` ciągniemy z faktycznego `salons` (read-only) + lokalnego splash z sekcji 2 — żeby preview od razu pokazywał zmianę hero.

## Multi-tenant + demo

- Demo: stałe dane z `demoData.ts`, podgląd ustawień pokazuje wartości z demo-salonu (read-only, bez deeplinków — przyciski mają tooltip „Zaloguj się aby edytować").
- Live: każda sekcja `useSalonId()` + RLS. Hero upload do `salon-media/{salonId}/splash.{ext}`.
- Brak nowych tabel (push prawdopodobnie już ma `web_push_subscriptions` + można dorzucić mini-tabelkę `app_push_campaigns` jeśli historii nie ma — sprawdzimy w momencie implementacji i jeśli trzeba, podbiję migrację z RLS po `salon_id`).

## Czego NIE robię

- Nie ruszam Ustawień (Profil, Rezerwacje, Komunikacja) — są źródłem prawdy.
- Nie ruszam Autopilota ani Pipeline'u.
- Nie zmieniam mobilnej appki klientki — tylko panel admina.
- Nie ruszam routingu ani sidebara — zakładka „Aplikacja klientki" zostaje w tym samym miejscu.

## Krok weryfikacji po implementacji

- demo `/demo` → zakładka „Aplikacja klientki" pokazuje 4 sekcje, brak edycji koloru/lojalności/zasad rezerwacji.
- panel admina na realnym koncie → upload splasha działa, push wysyła się, podgląd konfiguracji ma działające deeplinki do właściwych podsekcji Ustawień.
- mobile preview po prawej aktualizuje splash w czasie rzeczywistym.

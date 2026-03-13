

## Analiza techniczna: Login salon owners + indywidualne kokpity + aplikacja mobilna

### Co już mamy

Projekt ma już solidne fundamenty:
- **`/auth`** - strona logowania/rejestracji (email + hasło)
- **`/admin`** - pełny panel admina z 14 modułami (dashboard, kalendarz, klienci, usługi, etc.)
- **`useSalonId` hook** - automatycznie wykrywa salon właściciela lub pracownika
- **RLS policies** - izolacja danych per `salon_id` na wszystkich tabelach
- **`user_roles`** - system ról (`super_admin`, `salon_owner`, `staff`)
- **`profiles`** - tabela z danymi użytkowników

### Problem do rozwiązania

Obecny `/admin` nie rozróżnia ról - każdy zalogowany widzi ten sam panel. Brak onboardingu dla nowych salonów. Brak aplikacji mobilnej.

---

### Plan implementacji

#### FAZA 1: Role-based routing po loginie

**Modyfikacja `/auth` i post-login flow:**
- Po zalogowaniu sprawdzamy rolę użytkownika (`super_admin` → `/super-admin`, `salon_owner` → `/admin`, `staff` → `/admin` z ograniczonym menu)
- Jeśli `salon_owner` ale brak salonu w DB → redirect do `/onboarding`
- Nowy hook `useUserRole()` do pobierania roli z `user_roles`

**Modyfikacja `AdminDashboard.tsx`:**
- Sprawdzenie roli przy mount - jeśli `staff`, ukryj wrażliwe taby (księgowość, ustawienia, pipeline)
- Wyświetlanie nazwy salonu w sidebar (z `useSalonId`)

#### FAZA 2: Onboarding wizard (`/onboarding`)

Nowa strona z 5-krokowym wizardem:
1. **Dane salonu** - nazwa, adres, miasto, telefon
2. **Godziny pracy** - wybór typowego tygodnia (pon-pt 9-18, sob 9-14)
3. **Usługi** - szablony branżowe (beauty/fryzjer/med. estetyczna) + ręczne dodawanie
4. **Pracownicy** - opcjonalne, można pominąć
5. **Podsumowanie** - link do widgetu `/s/[slug]`, kod embed

Tworzy rekord w `salons` + `service_categories` + `services` + `working_hours`.

#### FAZA 3: Indywidualne kokpity

Kokpit już istnieje (`/admin`) i jest gotowy na multi-tenant:
- **`useSalonId()`** filtruje dane po salon_id zalogowanego użytkownika
- **RLS** gwarantuje izolację na poziomie DB
- Każdy salon owner widzi TYLKO swoje dane

Potrzebne ulepszenia:
- Wyświetlanie nazwy/logo salonu w sidebarze
- Personalizacja kolorów (z `salons.theme_primary_color`)
- Widget "Twój link do rezerwacji" na dashboardzie
- Onboarding progress indicator dla nowo utworzonych salonów

#### FAZA 4: Aplikacja mobilna (PWA)

**Rekomendacja: PWA (Progressive Web App)** zamiast natywnej aplikacji.

Dlaczego PWA:
- Nie wymaga App Store / Google Play
- Ten sam codebase - zero dodatkowej pracy
- Instalowalna z przeglądarki na home screen
- Działa offline (cached assets)
- Push notifications przez Web Push API
- Panel admin jest już responsywny (mobile sidebar, hamburger menu)

Implementacja:
- Instalacja `vite-plugin-pwa`
- Konfiguracja manifest.json (nazwa, ikony, kolory)
- Service worker dla cache'owania
- Strona `/install` z instrukcją instalacji
- Meta tagi mobile-optimized w `index.html`

Jeśli w przyszłości potrzebna natywna aplikacja (dostęp do kamery, sensorów), możemy dodać Capacitor jako wrapper.

---

### Wymagane zmiany w bazie danych

1. **Tabela `salons`**: dodać `onboarding_completed` (boolean, default false), `onboarding_step` (integer, default 0)
2. **Nowe dane seed**: szablony usług per branża (beauty, fryzjer, medycyna estetyczna)

### Nowe komponenty

- `useUserRole()` hook
- `/onboarding` page z multi-step wizard
- PWA config (manifest, service worker, install page)
- Zmodyfikowany `AuthPage` z role-based redirect
- Zmodyfikowany `AdminSidebar` z salon branding i role-based menu

### Kolejność implementacji

1. Hook `useUserRole` + role-based redirect w `/auth`
2. Ograniczenie menu w `/admin` per rola
3. Onboarding wizard `/onboarding`
4. Salon branding w sidebar
5. PWA setup


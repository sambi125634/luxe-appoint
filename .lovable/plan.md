

## Problem

Po rejestracji nowego użytkownika na `/auth`, brakuje mu roli w `user_roles` → `resolveRedirect()` kieruje go na `/admin` (fallback, linia 43) → widzi panel demo z mockowymi danymi zamiast czystego konta z onboardingiem.

## Plan implementacji

### Etap 1: Naprawić flow po rejestracji — czyste konto

**Baza danych (migracja):**
- Trigger na `auth.users` INSERT → automatycznie dodaje `salon_owner` do `user_roles` dla nowych użytkowników

**Uwaga:** Aktualnie `handle_new_user()` tworzy profil, ale NIE dodaje roli. Dodamy osobny trigger lub rozszerzymy istniejący, aby nowy user automatycznie dostał rolę `salon_owner` i był kierowany na `/onboarding`.

**Alternatywnie (bezpieczniej):** Zmienić `resolveRedirect()` w AuthPage — jeśli brak roli, traktować jak nowego salon_owner → redirect na `/onboarding`.

**AdminDashboard.tsx:**
- Sprawdzić `onboardingCompleted` z `useUserRole()` — jeśli false, redirect na `/onboarding`
- Upewnić się, że panel wyświetla TYLKO dane z Supabase (filtrowane przez `salon_id`), a nie mockowe

### Etap 2: Voice-guided onboarding z ElevenLabs

**Connector ElevenLabs:**
- Połączymy ElevenLabs connector dla generowania voice tutorials w języku polskim
- Edge function `elevenlabs-tts` do generowania audio z tekstu PL

**Zmodyfikowany OnboardingPage (`/onboarding`):**
- Każdy z 5 kroków dostaje:
  1. **Przycisk "Odtwórz wyjaśnienie"** — generuje/odtwarza voice tutorial (ElevenLabs TTS, polski)
  2. **Placeholder na wideo** — pusty komponent `VideoTutorialPlaceholder` z ikoną Play i tekstem "Wkrótce wideo tutorial" — do późniejszego uzupełnienia
  3. **Tekst pomocniczy** — krótkie, zrozumiałe instrukcje po polsku

**Treści voice tutorials (po polsku, per krok):**
1. Dane salonu — "Witaj w Beauty Calendar! Zacznijmy od podstaw..."
2. Godziny pracy — "Teraz ustawmy Twoje godziny pracy..."
3. Usługi — "Wybierz branżę najbliższą Twojemu salonowi..."
4. Pracownicy — "Jeśli masz zespół, dodaj pracowników..."
5. Podsumowanie — "Gratulacje! Twój salon jest gotowy..."

### Etap 3: Video tutorial placeholdery w panelu admin

- W kluczowych sekcjach panelu (Dashboard, Kalendarz, Klienci, Usługi, Pracownicy, Ustawienia) dodać komponent `VideoTutorialCard` — placeholder z przyciskiem "Obejrzyj tutorial" (disabled/coming soon)
- Każda sekcja będzie mieć również przycisk voice tutoriala (ElevenLabs)

### Etap 4: Czysty stan panelu po onboardingu

- Po przejściu onboardingu → redirect na `/admin`
- Panel wyświetla dane z bazy (które user właśnie wprowadził w onboardingu)
- Brak mockowych danych — tylko realne dane z RLS-filtrowanego zapytania
- Widoczne: nazwa salonu w sidebarze, "Twój link do rezerwacji", progress/checklista co jeszcze warto skonfigurować

## Wymagania techniczne

1. **ElevenLabs connector** — wymaga połączenia (klucz API)
2. **Edge function** `elevenlabs-tts` — generuje audio po polsku
3. **Nowy komponent** `VideoTutorialPlaceholder` — reużywalny w onboardingu i panelu
4. **Nowy komponent** `VoiceGuidanceButton` — przycisk z ikoną głośnika, odtwarza TTS
5. **Modyfikacja** `resolveRedirect()` — brak roli = nowy user → `/onboarding`
6. **Modyfikacja** `AdminDashboard` — guard na `onboardingCompleted`

## Kolejność

1. Fix routing (brak roli → onboarding) + guard w AdminDashboard
2. Połączenie ElevenLabs + edge function TTS
3. Rozbudowa OnboardingPage o voice guidance + video placeholdery
4. Dodanie video/voice placeholderów w sekcjach panelu admin


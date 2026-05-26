## Odpowiedź na pytanie o e-maile

**Naprawa wysyłki maili = duży problem na teraz.** Wymagałaby:
1. Konfiguracji własnej domeny e-mail (NS records u rejestratora domeny, ~24-72h propagacji DNS)
2. Zescaffoldowania custom auth email templates
3. Deployu edge function `auth-email-hook`
4. Czekania na weryfikację DNS

Domyślne maile z Lovable Cloud **powinny** działać out-of-the-box, ale często lądują w SPAMie albo są blokowane przez providerów (gmail, o2, wp). Stąd "żaden link nie przychodzi" — to nie bug platformy, to bug deliverability domyślnego nadawcy.

**Rekomendacja na jutro (Umkal):** wyłączyć weryfikację e-mail w ogóle. Po rejestracji user od razu wpada do onboardingu. Zero punktów odpadu. Wracamy do branded maili w przyszłym tygodniu razem z resetem hasła + transactional (potwierdzenia rezerwacji, follow-up).

---

## Plan

### 1. Auth: auto-confirm ON (1 zmiana konfiguracji)
- Wywołać `configure_auth` z `auto_confirm_email: true`
- Usunąć ekran "Sprawdź swoją skrzynkę email" z `AuthPage.tsx` — po rejestracji od razu redirect do `/onboarding` (sesja zwracana od razu przez `signUp`)
- Reset hasła zostawiamy — będzie działał z domyślnym mailem (jak nie zadziała, user dzwoni do Ciebie, ręcznie resetujesz w panelu Cloud)

### 2. Onboarding overview — co zrobić
Onboarding już istnieje (`src/pages/OnboardingPage.tsx`, 7 kroków: O salonie → AI Skan → Komunikacja → Autopilot → Twój link → Klientki → Gotowe). Przejdę przez **każdy krok** i sprawdzę:
- Jakie dane są zbierane i czy faktycznie zapisują się do bazy
- Czy AI Skan (Booksy/Instagram) działa i wypełnia profil
- Czy domyślne usługi są tworzone zgodnie z typem salonu
- Czy generuje się slug do widgetu rezerwacji
- Czy autopilot ma sensowne domyślki dla nowego usera
- Czy `salons.onboarding_completed = true` jest ustawiane na końcu
- Czy po onboardingu admin panel jest "gotowy do pracy" (godziny, staff, usługi, link do booking)

Dostarczę **raport po krokach** z konkretnymi problemami i propozycją fixów (osobny plan / osobne PR-y).

### 3. Co NIE robię w tym kroku
- Nie ruszam P24, SMSAPI, custom maili — wracamy do tego po launchu z Umkalem
- Nie zmieniam treści/UI onboardingu, tylko audytuję

---

## Po Twojej akceptacji wykonam tylko punkt 1 i 2 (audyt jako tekst). Punkt 2 zakończy się listą znalezisk + propozycją następnego planu.

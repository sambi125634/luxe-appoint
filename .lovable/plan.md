
# Audyt gotowości produkcyjnej — rejestracja nowego użytkownika

Przeszedłem ścieżkę od kliknięcia "Zarejestruj się" do używania każdego modułu w panelu. Poniżej dokładny stan + ryzyka pogrupowane wg etapów. Na końcu lista poprawek do zrobienia *przed* oddaniem.

---

## 1. Rejestracja (`/auth`)

**Stan:** Działa. Sprawdzone:
- Walidacja zod (email, hasło ≥6, imię/nazwisko, telefon ≥9 znaków).
- Wymagana zgoda RODO (checkbox blokuje submit).
- `signUp` z metadanymi (first_name, last_name, phone).
- Email confirmation screen po sukcesie.
- Trigger `handle_new_user` tworzy profile, `handle_new_user_role` przypisuje `salon_owner` (wzmocniony w ostatniej migracji).
- "Zapomniałam hasła" → `/reset-password` istnieje.

**RYZYKA / luki:**
1. **Brak normalizacji telefonu** — wpisany `500 600 700` zapisuje się surowo do `profiles.phone`. W całym kodzie używamy `normalizePolishPhone` do `+48XXXXXXXXX`. Przy wysyłce SMS/przypomnień to się rozjedzie.
2. **Brak Google login** — workspace standard mówi "domyślnie Google + email". Aktualnie tylko email/password. Decyzja świadoma czy luka?
3. **Email confirmation wymagany** — jeśli SMTP/Resend nie dostarczy maila (np. spam), użytkownik się zablokuje. Sprawdzić czy auth-email-hook jest skonfigurowany dla domeny `calendar.beauty-funnels.com`.

---

## 2. Onboarding (`/onboarding`, 7 kroków)

**Stan:** Działa, z resume po `onboarding_step`. Sprawdzone:
- Krok 0: tworzy `salons` row + `staff_members` (owner) + `working_hours` Pn-Pt 9-17.
- Krok 1: AI scan profilu (opcjonalny) — jeśli pominięty, tworzy default services z `SERVICE_TEMPLATES` per typ salonu i przypisuje do owner staff.
- Triggery: `handle_new_salon_tags` zasiewa 21 client_tags, `seed_default_product_categories` 10 kategorii produktów.
- Końcowy krok ustawia `onboarding_completed=true`.

**RYZYKA / luki:**
1. **Race condition w `handleSaveSalon`** — gdy onboarding tworzony pierwszy raz i URL podany, `setStep(1)` + `startAiScan()` jadą RÓWNOLEGLE z `setCreatedSalonId`. AI scan może wystartować bez salon_id. Nie blokujące, ale do sprawdzenia.
2. **Default services** — jeśli AI scan jest użyty, `saveDefaultServices` NIE jest wywoływane (tylko gdy `hasUrls=false`). Czy AI scan wstawia services do DB? Trzeba zweryfikować — jeśli nie, użytkownik z URL-em może wylądować bez usług.
3. **Brak walidacji telefonu** w polu Communication step (tu samo co w auth).
4. **`onboarding_step` zapisuje step UI**, nie zawsze równa pozycji w `STEPS` — przy resume użytkownik może wylądować w innym miejscu niż przerwał.

---

## 3. Przekierowanie po loginie

**Stan:** OK. `resolveRedirect` w `AuthPage` wysyła:
- super_admin → `/super-admin`
- salon_owner + nie ma salonu / nie completed → `/onboarding`
- salon_owner + completed → `/admin`
- staff → `/admin`
- client → `/app`
- brak roli → `/onboarding`

**RYZYKA:** Po wzmocnieniu triggera nowi userzy zawsze dostają rolę. Stare konta załatane backfillem. OK.

---

## 4. Panel admina (`/admin`)

**Stan:** 20 modułów renderowanych przez `AdminSidebar` z filtrem `TAB_PERMISSION_MAP`. Owner (`isOwner=true`) widzi wszystko.

Sprawdzone moduły i ich źródła danych:
- Dashboard (Home) — `useSalonId` + queries na salon
- Kalendarz — `appointments`, dnd, conflict check
- Klienci — `useClients`, segmentacja
- Konwersacje — `useConversations` (nowy hook)
- Pipeline (Ścieżka klientki) — `usePipelineContacts`
- Księgowość — `useTrueProfit`, raporty
- Produkty — `useProducts`, recipes, scanner
- Usługi — `useServices`
- Personel — `useStaffMembers`
- Widgety — `useBookingWidgets` (nowy hook)
- Aplikacja Klientki — branding, lojalność
- Retencja — `useRetention`
- Konsultacje — modules/consultation
- Polecenia — modules/referral
- Autopilot — `useAutopilot`
- Ustawienia, Pomoc

**RYZYKA / luki konkretne:**
1. **Brak gatingu subskrypcji** — kod referuje `salon_subscriptions` (FREE/PRO/ELITE limits w pamięci projektu), ale tabela `salon_subscriptions` **nie istnieje** w DB. Każdy nowy user dostaje pełen dostęp jak ELITE. Albo dodać tabelę + middleware, albo świadomie zostawić (jeśli launch bez płatności).
2. **Edge functions wymagają sekretów** — sprawdzone: `RESEND_API_KEY`, `LOVABLE_API_KEY`, `RETELL_API_KEY`, `ELEVENLABS_API_KEY`, `FIRECRAWL_API_KEY`, `VAPID_*` są ustawione. Brakuje natomiast: **`P24_*` (Przelewy24)** — moduł płatności prepay nie zadziała; **`SMSAPI_TOKEN`** — `send-sms-smsapi` padnie.
3. **Demo flags** — wiele modułów przyjmuje `isDemo`. AdminDashboard wywołuje je BEZ `isDemo` (czyli `undefined` = false). To prawidłowe, ale moduły takie jak Retention dostają `isDemo={false}` jawnie a inne nie — niespójność, do unifikacji.
4. **`ProductsModule`** w AdminDashboard wywoływany bez `isDemo` ale jego komponenty (`InvoiceAIScanner`, `RecipeEditorDrawer`) zakładają realny salonId — OK po wzmocnieniu `useSalonId`, ale warto przetestować z konkretnym nowym kontem.
5. **Subdomeny** — admin.beauty-funnels.com forces `/` → `/auth`. `calendar.*` używana też do logowania (widać w auth-logs). Sprawdzić czy strategia routingu (mem://deployment/subdomain-routing-v2-final) jest faktycznie egzekwowana.
6. **AutopilotStatusBar** — renderowany na każdym widoku, robi własne queries. Jeśli padnie, status bar pokaże błąd dla nowego usera bez danych.

---

## 5. Czego NIE sprawdziłem (do weryfikacji przed launchem)

- Czy AI scan w onboardingu rzeczywiście wstawia services do DB (sprawdzić `ai-profile-scanner`).
- Czy widget bookingowy działa dla nowego salonu od razu (czy ma slots, working_hours pokazują się).
- Czy emails (booking confirmation, reminders) wychodzą — wymaga DNS verification dla domeny.
- Czy nowy user widzi puste empty states (zamiast spinnerów w nieskończoność) we wszystkich 20 modułach.
- Mobile admin (`/m/*`) — osobna aplikacja, nie przeszedłem.

---

## Plan napraw przed jutrem (priorytetowo)

### KRYTYCZNE (must-fix)
1. **Normalizacja telefonu w `AuthPage.handleSignup`** — wywołać `normalizePolishPhone(signupPhone)` przed wysłaniem do `signUp.options.data.phone`. Trigger `handle_new_user` zapisze już znormalizowany.
2. **Weryfikacja, że AI scan wstawia services** — jeśli nie, dodać fallback `saveDefaultServices` po scan-ie (żeby user nigdy nie wylądował z 0 usług).
3. **Decyzja o `salon_subscriptions`** — albo (a) dodać tabelę z defaultem PRO/ELITE dla nowych userów, albo (b) świadomie wyłączyć gating w kodzie, żeby uniknąć przyszłych konfliktów.

### WAŻNE (should-fix)
4. **Sprawdzić sekrety P24 i SMSAPI** — jeśli brak, ukryć moduły płatności prepay i SMS lub dodać friendly "skonfiguruj integrację".
5. **Sprawdzić auth-email-hook + DNS dla calendar.beauty-funnels.com** — jeśli email confirmation nie dochodzi, rejestracja jest zablokowana.
6. **Test ręczny nowego konta end-to-end** na świeżym emailu — przejść wszystkie 20 modułów i wykonać podstawową akcję (utworzyć klientkę, rezerwację, usługę, etc.).

### NICE-TO-HAVE
7. Dodać Google OAuth (workspace standard).
8. Unifikacja `isDemo` flag w AdminDashboard.
9. Empty states audit we wszystkich modułach.

---

## Co dalej

Po Twojej akceptacji wykonam **KRYTYCZNE 1-3** + **WAŻNE 4-5** (sprawdzenie sekretów i AI scan). Punkt 6 (ręczny test) musisz wykonać Ty lub ja przez browser tools — daj znać czy mam to robić automatycznie czy zostawiamy Tobie. Pozostałe nice-to-have do osobnej rundy.

**Pytanie kluczowe przed implementacją:**
- Czy launch jutro to launch *bezpłatny* (FREE tier dla każdego), czy *płatny* z limitami? Od tego zależy czy dodaję `salon_subscriptions` i gating.

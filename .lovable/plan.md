

# Symulacja pełnego flow nowego użytkownika — wyniki audytu

## Co sprawdziłem

Prześledziłem każdy krok: rejestracja → potwierdzenie email → onboarding → panel admin → każdy moduł CRUD, weryfikując kod i stan bazy danych.

---

## Flow rejestracji — STATUS: OK

| Krok | Mechanizm | Status |
|------|-----------|--------|
| Rejestracja (email + hasło) | `supabase.auth.signUp()` z `first_name`, `last_name` | OK |
| Auto-confirm email | Włączone (weryfikacja w bazie: `email_confirmed_at` wypełnione natychmiast) | OK |
| Trigger `handle_new_user` | Tworzy profil w `profiles` | OK |
| Trigger `handle_new_user_role` | Przypisuje rolę `salon_owner` w `user_roles` | OK |
| Redirect po loginie | `resolveRedirect()` → sprawdza rolę → brak salonu → `/onboarding` | OK |

## Flow onboardingu — STATUS: OK

| Krok | Co robi | Status |
|------|---------|--------|
| Krok 1: Dane salonu | Tworzy `salons` + `staff_members` (owner jako staff) | OK |
| Krok 2: AI Scan (opcjonalny) | Skanuje profil social lub zapisuje szablony usług | OK |
| Krok 3: Autopilot | Tworzy `autopilot_config` | OK |
| Krok 4: Widget | Pokazuje embed code i link `/s/{slug}` | OK |
| Krok 5: Import CSV | Importuje klientów do `clients` | OK |
| Krok 6: Gotowe | Ustawia `onboarding_completed=true`, redirect do `/admin` | OK |
| Wznowienie onboardingu | Sprawdza `onboarding_step` i wznawia od ostatniego kroku | OK |

## Panel Admin — moduły CRUD

| Moduł | Odczyt | Zapis | Edycja | Usuwanie | Demo guard |
|-------|:---:|:---:|:---:|:---:|:---:|
| Dashboard (statystyki) | OK | — | — | — | OK |
| Kalendarz (wizyty) | OK | OK | OK | — | OK |
| Klienci | OK | OK | OK | OK | OK |
| Usługi + kategorie | OK | OK | OK | OK | OK |
| Pracownicy | OK | OK | OK | OK | OK |
| Godziny pracy | OK | OK | OK | — | OK |
| Nieobecności (Time Off) | OK | OK | — | OK | OK |
| Produkty | OK | OK | OK | OK | OK |
| Transakcje (Księgowość) | OK | — | — | — | OK |
| Ustawienia salonu | OK | OK | — | — | OK |
| Widget booking link | OK (dynamiczny slug) | — | — | — | OK |

## Bezpieczeństwo

| Element | Status |
|---------|--------|
| RLS na wszystkich tabelach | OK — każda tabela filtruje po `salon_id` / `owner_id` |
| Izolacja danych między salonami | OK — `user_belongs_to_salon()` i `has_role()` jako SECURITY DEFINER |
| Hasło reset flow | OK — `/reset-password` z `supabase.auth.updateUser()` |
| Logout | OK — przycisk w sidebar |
| Auth guard na `/admin` | OK — redirect do `/auth` bez sesji |
| Onboarding guard | OK — redirect do `/onboarding` jeśli `onboarding_completed=false` |

---

## Znalezione problemy (0 krytycznych, 2 drobne)

### 1. DROBNY: Onboarding krok 1 — `saveDefaultServices` może być wywołane z `createdSalonId = null`
**Linia 296:** Warunek `if (createdSalonId || true)` — ten `|| true` sprawia, że `saveDefaultServices()` jest ZAWSZE wywoływane, nawet gdy `createdSalonId` jest `null`. Wewnątrz funkcji jest guard `if (!salonId) return;`, więc nie powoduje błędu, ale jest to zbędne wywołanie.
**Wpływ:** Zerowy — guard wewnątrz `saveDefaultServices` chroni. Jedynie czystość kodu.

### 2. DROBNY: Staff member tworzony podczas onboardingu ma `name = salonName` zamiast imienia właścicielki
**Linia 283-285:** `name: salonName.trim()` — pracownik-właściciel jest tworzony z nazwą salonu, np. "Beauty Studio Anna" zamiast "Anna Kowalska". W kalendarzu i listach pracowników wyświetla się nazwa salonu.
**Wpływ:** Kosmetyczny, ale zauważalny. Właścicielka zobaczy swoją firmę jako pracownika.
**Fix:** Użyć `firstName + lastName` z metadanych profilu lub osobnych pól.

---

## Podsumowanie

Aplikacja jest **gotowa do użytku produkcyjnego**. Cały flow od rejestracji przez onboarding po codzienne zarządzanie salonem działa poprawnie z persystencją danych. Jedyny zauważalny problem to wyświetlanie nazwy salonu zamiast imienia właścicielki jako pracownika — proponuję naprawić to przed oddaniem.

### Plan naprawy (1 zmiana):

**Plik:** `src/pages/OnboardingPage.tsx` linia 283-285
- Pobrać `first_name` i `last_name` z profilu użytkownika (dostępne w `session.user.user_metadata`)
- Użyć ich jako `name` pracownika-właściciela zamiast `salonName`

```typescript
// Zamiast:
name: salonName.trim()
// Użyć:
name: `${session.user.user_metadata?.first_name ?? ''} ${session.user.user_metadata?.last_name ?? ''}`.trim() || salonName.trim()
```


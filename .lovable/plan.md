# Naprawa interpolacji zmiennych w szablonach email

## Diagnoza

Przeskanowałem flow szablonów. Zmienne są podstawiane przez `String.replace` w Edge Functions — i są **dwa krytyczne bugi**:

### Bug 1 — Email szablony nigdy nie czytane z ustawień
Frontend (`useSalonSettings.ts`) zapisuje do `salons.settings.notifications` pod kluczami:
- `confirmationEmailTemplate`
- `reminderEmailTemplate`

Ale Edge Functions czytają inne klucze:
- `send-booking-confirmation/index.ts:113` → `settings.emailConfirmationTemplate` ❌
- `send-scheduled-reminders/index.ts:118` → `settings.emailReminderTemplate` ❌

**Skutek:** każda zmiana treści maila w UI jest ignorowana — system zawsze wysyła hardcoded fallback. SMS działa OK (klucze się zgadzają: `confirmationSmsTemplate`, `reminderSmsTemplate`).

### Bug 2 — `replace(undefined)` rzuca lub wstawia "undefined"
`.replace(/{specjalista}/g, staff.name)` gdy staff nie jest przypisany, lub `client.last_name` jest null → w mailu pojawia się literalnie tekst „undefined" albo replace pada. Trzeba `?? ""` przy każdej zmiennej.

### Bug 3 (drobny, kosmetyczny) — UI nie wymienia wszystkich dostępnych zmiennych
Edge Functions interpolują też `{cena}` i `{czas_trwania}`, ale w panelu „Dostępne zmienne" są tylko: `{imie}`, `{nazwisko}`, `{data}`, `{godzina}`, `{usluga}`, `{specjalista}`, `{adres}`, `{telefon}`, `{nazwa_salonu}`. Brakuje `{cena}` i `{czas_trwania}` — proponuję dodać do UI, żeby user wiedział, że może ich użyć.

## Zakres zmian

1. **`supabase/functions/send-booking-confirmation/index.ts`** — zmienić `settings.emailConfirmationTemplate` → `settings.confirmationEmailTemplate`. Dodać `?? ""` przy każdym `.replace()`.
2. **`supabase/functions/send-scheduled-reminders/index.ts`** — zmienić `settings.emailReminderTemplate` → `settings.reminderEmailTemplate`. Dodać `?? ""` przy każdym `.replace()`.
3. **`supabase/functions/send-sms-smsapi/index.ts`** — dodać `?? ""` przy każdym `.replace()` (klucze są OK, ale guard na null jest potrzebny).
4. **`src/components/admin/settings/NotificationSettings.tsx`** — dodać do listy „Dostępne zmienne" badge `{cena}` (Cena usługi) i `{czas_trwania}` (Czas trwania).

## Pliki bez zmian
- `src/hooks/useSalonSettings.ts` — klucze są poprawne, to Edge Function była niespójna.
- SMS templates — działają, tylko safety guard.

## Test po wdrożeniu
- Edytuję treść w `Powiadomienia → Email → Treść wiadomości` → zapisuję.
- Wywołuję `send-booking-confirmation` z `appointmentId` testowej rezerwacji → mail przychodzi z **moją zmienioną treścią** zamiast z domyślnego fallbacka.

## Pytanie
Zatwierdzasz? Czy chcesz, żebym przy okazji ujednolicił też klucze (np. wszędzie `emailConfirmationTemplate`) — to wymagałoby migracji danych w istniejących salonach. Bezpieczniej zostawić obecne klucze frontendu i tylko poprawić Edge Functions, co i tak robię w tym planie.

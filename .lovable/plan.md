# Polecenia — edytowalne wiadomości, działający zapis linku Google, szersza konfiguracja

## Diagnoza problemów

Przejrzałem cały moduł `src/modules/referral/`. Wszystkie cztery zgłoszenia są realne:

### 1. Podgląd wiadomości po 5. wizycie — nieedytowalny
`ReferralProgram.tsx` (linie 120–142): treść wiadomości jest **wklejona na sztywno w JSX**. Nie ma textarea, nie ma stanu na treść, więc nie da się jej zmienić.

### 2. Zmiana typu benefitu nie aktualizuje wiadomości
W podglądzie używamy `referrerRewardDescription` — niezależnego pola tekstowego. Zmiana typu (`discount_pln` → `discount_percent` → `free_service`) ani wartości nie modyfikuje opisu, bo to dwie odrębne stany. Trzeba albo auto-generować opis z (typ + wartość), albo wstrzykiwać go jako placeholder `{benefit_polecajacej}` do edytowalnej treści.

### 3. Link do opinii Google „znika" po wklejeniu
`GoogleReviewsManager.tsx` linia 58: `const hasGoogleUrl = isDemo || !!googleReviewUrl;`. Karta z polem input renderuje się **tylko gdy `!hasGoogleUrl`**. W momencie wpisania pierwszego znaku `hasGoogleUrl` staje się `true` i cała karta z inputem znika. Dodatkowo `saveGoogleUrl()` (linia 64) tylko wywołuje toast — **nic nie zapisuje do bazy**.

### 4. Szablony wiadomości o opinię — tylko klikalne, nieedytowalne
Linie 22–47: `reviewTemplates` to stała z `preview` jako stringiem. Można wybrać szablon, ale nie zmienić jego treści.

### 5. Ustawienia klientów — wąski zakres
`ReferralSettings.tsx`: jedyne pola to liczba wizyt do aktywacji, opóźnienie i kanał. Brakuje: kanału wysyłki linku polecającego, przypomnienia, ważności kodu, limitu poleceń, autowiadomości po wpływie polecenia.

### 6. Brak persystencji w całym module
Wszystko jest w `useState` lokalnym. Po przeładowaniu strony — reset. Trzeba dodać tabelę konfiguracji per salon.

---

## Plan naprawy

### A. Migracja DB — `referral_program_config`
Jedna tabela na salon z wszystkimi ustawieniami programu poleceń i opinii Google:

```sql
CREATE TABLE public.referral_program_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL UNIQUE,
  -- program
  is_active boolean DEFAULT false,
  activate_after_visits int DEFAULT 5,
  referrer_reward_type text DEFAULT 'discount_pln',
  referrer_reward_value numeric DEFAULT 50,
  referrer_reward_description text DEFAULT 'Rabat 50 zł na kolejną wizytę',
  referee_reward_type text DEFAULT 'discount_pln',
  referee_reward_value numeric DEFAULT 30,
  referee_reward_description text DEFAULT 'Rabat 30 zł na pierwszą wizytę',
  -- edytowalne wiadomości
  referral_message_template text NOT NULL DEFAULT
    'Cześć {imię}! 🌸\n\nJesteś jedną z naszych ulubionych klientek...\n\nTy: {benefit_polecajacej}, ona: {benefit_nowej}.\n\nTwój link: {link}',
  referral_message_channel text DEFAULT 'sms',  -- sms/email/whatsapp
  reminder_after_days int DEFAULT 14,
  code_validity_days int DEFAULT 90,
  max_referrals_per_client int,  -- null = bez limitu
  -- opinie
  google_review_url text,
  facebook_review_url text,
  auto_send_review_request boolean DEFAULT true,
  review_request_delay_hours int DEFAULT 2,
  review_request_channel text DEFAULT 'sms',
  review_message_template text NOT NULL DEFAULT
    'Cześć {imię}! Dziękuję za dzisiejszą wizytę! Czy możesz poświęcić 30 sekund na opinię w Google? {link} ❤️',
  review_template_preset text DEFAULT 'warm',  -- warm/short/social/gratitude/custom
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.referral_program_config TO authenticated;
GRANT ALL ON public.referral_program_config TO service_role;

ALTER TABLE public.referral_program_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon owners manage referral_program_config"
  ON public.referral_program_config FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Salon staff view referral_program_config"
  ON public.referral_program_config FOR SELECT TO authenticated
  USING (public.user_belongs_to_salon(auth.uid(), salon_id));

-- trigger updated_at
CREATE TRIGGER trg_referral_program_config_updated
  BEFORE UPDATE ON public.referral_program_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

### B. Nowy hook `useReferralConfig`
W `src/hooks/useReferralConfig.ts`:
- `useReferralConfig()` — pobiera/upsert tworzy konfigurację dla salonu (lazy seed defaults przy pierwszym wejściu, analogicznie do `useAutopilotConfig`).
- `useUpdateReferralConfig()` — mutation z optymistyczną aktualizacją + invalidate.
- W trybie demo zwraca obiekt z mocków (bez insertów do DB).

### C. `ReferralProgram.tsx` — edytowalna wiadomość + auto-benefit
- Stan z hooka zamiast lokalnego `useState`.
- Zamiast hardkodowanego JSX-podglądu: `Textarea` z `referral_message_template`. Pod spodem małe info: dostępne placeholdery `{imię} {benefit_polecajacej} {benefit_nowej} {link} {wizyt}`.
- Live preview pod textarea (czyste tło, te same placeholdery zamienione na realne wartości z aktualnej konfiguracji benefitów).
- **Auto-fill opisu benefitu**: gdy zmieniam `referrer_reward_type` lub `referrer_reward_value`, jeśli opis jest pusty albo dokładnie pasuje do poprzedniego auto-szablonu, generuję nowy ("Rabat 50 zł na kolejną wizytę" / "Rabat 15% na kolejną wizytę" / "Darmowy zabieg do wyboru" / "200 punktów lojalnościowych"). Jeśli właściciel ręcznie zmienił opis — nie nadpisuję.
- Przycisk „Zapisz zmiany" na dole sekcji (sticky w razie potrzeby).
- Wybór kanału wysyłki (`referral_message_channel`).

### D. `GoogleReviewsManager.tsx` — naprawa zniknięcia + zapis
- Inicjalizacja stanu z `useReferralConfig().google_review_url`.
- **Zawsze pokazuję kartę z linkiem** (przemianowuję na „Konfiguracja linku Google") niezależnie od `hasGoogleUrl`. Jeśli link jest zapisany — kompaktowa wersja z linkiem do edycji + przycisk „Testuj". Jeśli nie — pełna instrukcja jak teraz.
- `saveGoogleUrl()` woła `updateReferralConfig({ google_review_url })`. Walidacja URL przed zapisem (regex na `https://`). Po sukcesie: zielony toast + komponent przełącza się na widok skompresowany.
- Sekcja **„Szablony wiadomości"**: 4 presety jak teraz, ALE po wybraniu presetu `Textarea` z `review_message_template` (edytowalna). Dodatkowy preset „✏️ Własny" automatycznie aktywny po pierwszej edycji. Przycisk „Zapisz" pod textarea.
- Placeholdery: `{imię} {link} {wizyt} {salon}`.

### E. `ReferralSettings.tsx` — rozszerzony zakres
Wszystkie pola podpięte do `referral_program_config`. Nowe pola:
- **Kanał wysyłki linku polecającego** (sms/email/whatsapp) — `referral_message_channel`.
- **Przypomnienie po X dniach** jeśli klientka nie wysłała linku do nikogo — `reminder_after_days`.
- **Ważność kodu** w dniach — `code_validity_days`.
- **Maksymalna liczba poleceń na klientkę** (puste = bez limitu) — `max_referrals_per_client`.
- Slider `activate_after_visits` rozszerzony do zakresu 1–20 z presetami (3 / 5 / 10).
- Link Facebook — `facebook_review_url` (zostaje).
- Jeden przycisk „Zapisz ustawienia" → faktyczny update na bazie (nie pusty toast).

### F. Synchronizacja `ReferralProgram` ↔ `GoogleReviewsManager` ↔ `ReferralSettings`
Wszystkie trzy komponenty czytają i piszą do tej samej konfiguracji. React Query invalidate po każdej mutacji zapewnia spójność (zmiana typu benefitu w jednej zakładce momentalnie odświeża podgląd wiadomości w drugiej).

### G. Test akceptacji (po wdrożeniu)
1. Wklejam link Google → pole pozostaje widoczne → klikam „Zapisz" → toast „Zapisano" → po przeładowaniu link nadal jest.
2. Zmieniam typ benefitu z „Rabat zł" na „Darmowy zabieg" → opis benefitu i podgląd wiadomości aktualizują się.
3. Edytuję treść wiadomości po 5. wizycie → zapis → reload → treść utrzymuje się.
4. Edytuję szablon prośby o opinię → zapis → reload → utrzymuje się.
5. Zmieniam liczbę wizyt z 5 na 3, kanał na WhatsApp → zapis → odzwierciedlone w `ReferralProgram`.

---

## Pliki

- **NOWA migracja** `supabase/migrations/<timestamp>_referral_program_config.sql`
- **NOWY hook** `src/hooks/useReferralConfig.ts`
- `src/modules/referral/ReferralProgram.tsx` — edytowalna wiadomość, auto-benefit, persystencja
- `src/modules/referral/GoogleReviewsManager.tsx` — fix zniknięcia karty, real save, edytowalne szablony
- `src/modules/referral/ReferralSettings.tsx` — rozszerzone pola, real save

## Poza zakresem
- Edge function do faktycznego *wysyłania* wiadomości polecających/o opinię (osobny moduł — Autopilot/Followups). Tutaj tylko konfiguracja.
- Demo mode pozostaje read-only (mocki), bez zapisów do DB.

Po Twojej akceptacji wdrażam — najpierw migracja DB, potem zmiany w kodzie.

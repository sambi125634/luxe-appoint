
# Plan: Kompletny silnik Beauty Autopilot

Cel: zamienić wszystkie 16 funkcji Autopilota z UI-mockupów w działający backend, który realnie czyta dane salonu, podejmuje decyzje, wysyła SMS/email i loguje rezultaty — tak żeby toggle ON faktycznie coś robił.

Stan dziś (zweryfikowane w kodzie):
- Działają realnie: `generate-weekly-brief`, `send-scheduled-reminders` (mailing wyłączony per salon — domena `notify.calendar.beauty-funnels.com` dopiero co stawiana), `send-rhythm-reminders`, `track-retention`.
- Reszta 16 funkcji to czysty UI + `demo-data.ts` — toggles w `autopilot_config` zapisują się do DB, ale nie ma żadnego cron-a ani executora który by je czytał.

---

## FAZA 0 — Wspólna infrastruktura (fundament dla wszystkich modułów)

Bez tego żaden moduł nie zadziała. To budujemy raz, używa cały silnik.

1. **Tabela logów akcji** (rozszerzenie istniejącego `autopilot_actions`):
   - kolumny: `id, salon_id, module_key, action_type, client_id, scheduled_at, executed_at, status (pending|sent|skipped|failed|converted), channel (sms|email|push|internal), payload jsonb, result jsonb, revenue_recovered numeric, created_at`
   - RLS: salon_owner widzi swoje, service_role pełny dostęp
   - indeksy: `(salon_id, scheduled_at)`, `(salon_id, module_key, executed_at)`

2. **Tabela `autopilot_module_settings`** — per-moduł konfiguracja (Flash Oferta ma inne pola niż No-show). JSONB `config` walidowany w edge function.

3. **Rozszerzenie `autopilot_config`** — kolumny boolean dla każdego z 16 modułów: `flash_offer_enabled, weather_trigger_enabled, vip_tomorrow_enabled, dead_hours_enabled, vip_radar_enabled, noshow_recovery_enabled, silent_ambassador_enabled, snowball_referral_enabled, upsell_pre_visit_enabled, profit_alarm_enabled, first_visit_sequence_enabled, abandoned_booking_enabled, loyalty_engine_enabled, vacation_brain_enabled, review_guard_enabled, price_change_followup_enabled, price_detector_enabled`.

4. **Master cron orchestrator** — pojedynczy edge function `autopilot-tick` uruchamiany przez `pg_cron` co 15 min. Iteruje po wszystkich aktywnych salonach (`autopilot_config.is_active = true`), sprawdza godzinę lokalną salonu, woła sub-executory tylko dla modułów które mają być wywołane w tym oknie (np. `vip-tomorrow-executor` codziennie 19:00, `flash-offer-executor` 15:00 itd.).

5. **Wspólny `dispatch-message` helper** wewnątrz edge functions:
   - SMS → istniejący `send-sms-smsapi`
   - Email → `enqueue_email` (queue już działa po dzisiejszym setupie domeny)
   - Push → `send-push-notification`
   - Zawsze loguje do `autopilot_actions` + `email_send_log`/SMS log
   - Suppression check + opt-out tokens

6. **`isDemo` guard** w każdym executorze: jeśli `salon_id` to demo-UUID → return mock, żadnych realnych wysyłek (zgodne z `edge-function-demo-mode-guard`).

7. **Konwersja & atrybucja**: trigger DB na `appointments.insert` sprawdza, czy klient w ostatnich 72h dostał akcję Autopilota → oznacza `autopilot_actions.status = 'converted'` i wpisuje `revenue_recovered = service.price`. To zasila realny `AutopilotScore` i statystyki w `FlashOfertaCard` etc.

---

## FAZA 1 — Quick wins (moduły niskim kosztem, wysoki ROI)

Każdy = 1 edge function executor + 1 cron entry + wpis w `autopilot-tick`.

1. **VIP na jutro** (`vip-tomorrow-executor`, codziennie 19:30)
   - Czyta `appointments` na D+1, dołącza `clients.ltv, last_visit_at, birthday`
   - Wysyła email/SMS do właścicielki: lista TOP 5 klientek + alerty (urodziny, VIP, 10. wizyta z rzędu)
   - Brief w app + push

2. **Pamięta zabieg / Smart Reminder** (`smart-reminder-executor`)
   - Rozszerza istniejące `send-scheduled-reminders` o personalizację (ostatnia usługa, kolor, uczulenie z notatek klienta)
   - 24h i 2h przed wizytą

3. **No-show Recovery** (`noshow-recovery-executor`, co 30 min)
   - Wykrywa appointments ze `start_time < now() - 15min AND status = 'scheduled'` → marks `no_show`
   - T+30min SMS "Tęsknimy", T+24h SMS z 2 wolnymi slotami z `useAvailableSlots`
   - Loguje konwersję jeśli klient zarezerwuje w ciągu 7 dni

4. **Raport tygodniowy** — już działa (`generate-weekly-brief`), tylko podpinamy do nowego loggera.

---

## FAZA 2 — Silniki przychodu (Flash Oferta, Pogodowy, Upsell, Dead Hours)

5. **Flash Oferta™** (`flash-offer-executor`, codziennie 15:00 wt-pt)
   - Detekcja: dla każdego dnia D+1..D+3 liczy puste sloty z `staff_availability` minus `appointments`. Jeśli ≥ próg (config) i < dziś 20:00 → trigger.
   - Target: filtruje `clients` wg `autopilot_module_settings.flash_offer.target_audience` (historical/dormant/all)
   - Wysyła SMS z linkiem rezerwacji (deep link `/s/<slug>?slot=<id>`)
   - Limit 1 kampania / dzień / klient

6. **Pogodowy Trigger™** (`weather-trigger-executor`, codziennie 7:00)
   - Wywołuje Open-Meteo API (free, no key) dla miasta z `autopilot_module_settings.weather_trigger.city`
   - Jeśli warunek (deszcz/burza/śnieg) i prob ≥ threshold → kampania SMS do segmentu
   - Logika throttling: max 1 kampania pogodowa / tydzień

7. **Martwe godziny / Dead Hours** (`dead-hours-executor`, raz w tygodniu)
   - Heatmap obciążenia z `appointments` 12 ostatnich tygodni → wykrywa stale puste okna
   - Wysyła ofertę edukacyjną ("masz wolne wtorki 9-11? dam Ci -20% na pierwsze 3 zapisy")

8. **Upsell przed wizytą** (`upsell-pre-visit-executor`, codziennie 19:00)
   - Dla jutrzejszych wizyt: cross-reference `appointments` historyczne — które usługi klient brał wcześniej?
   - Jeśli `services.id` nie jest w jutrzejszej wizycie, a slot po wizycie wolny → SMS upsell

---

## FAZA 3 — Retencja i ambasadorzy

9. **Radar VIP** (`vip-radar-executor`, codziennie 8:00) — używa `useClientRiskScore` + LTV ranking. Auto-trigger sekwencji reaktywacji dla `risk > 60 AND ltv > p80`.

10. **Cichy Ambasador** (`silent-ambassador-executor`, niedziele 11:00) — selekcja klientek `visits ≥ 4 AND no_shows = 0 AND has_no_review = true`. Email z prośbą o opinię → integracja z `GoogleReviewsManager`.

11. **Kula Śnieżna / Referral Autopilot** (`referral-autopilot-executor`) — po 3. wizycie automatycznie generuje link referencyjny (już istnieje `useUserReferral`) i wysyła SMS z linkiem.

12. **First Visit Sequence** (`first-visit-sequence-executor`, co 6h) — 3-stopniowa sekwencja: D+1 podziękowanie, D+7 ankieta, D+21 zaproszenie na 2. wizytę.

13. **Loyalty Engine** (`loyalty-engine-executor`) — auto-naliczanie stempli z `loyalty_stamps` po `appointments.completed`, push "Brakuje Ci 1 wizyty do nagrody".

14. **Beauty Rhythms / Vacation Brain** — już istnieje `send-rhythm-reminders` + `calculate-beauty-rhythms`. Podpinamy logger + dodajemy detekcję urlopu staffa (`time_off`) → przesuwa terminy klientek.

---

## FAZA 4 — Inteligencja cenowa i ochrona reputacji

15. **Review Guard** (`review-guard-executor`, co 4h) — nasłuchuje nowych opinii Google (przez `GoogleReviewsManager`), jeśli ★ ≤ 3 → blokuje publiczne wysyłki promocyjne do autora, alert dla właścicielki, sugestia odpowiedzi (Gemini 2.5 Flash przez Lovable AI).

16. **Price Change Followup** (`price-change-followup-executor`) — wykrywa zmianę `services.price`, dla TOP 20 stałych klientek wysyła komunikat z 30-dniowym okresem ochronnym.

17. **Profit Alarm** (`profit-alarm-executor`, codziennie 22:00) — porównuje dzisiejszy `true_profit` z 7-dniową średnią. Jeśli spadek > 25% → email alert z 3 sugestiami akcji (np. uruchom Flash Offer).

18. **Abandoned Booking** (`abandoned-booking-executor`, co 30 min) — nasłuchuje sesji w booking widgecie (dodajemy tabelę `booking_sessions` log). Jeśli klient wybrał slot ale nie sfinalizował w 24h → SMS przypomnienie z deep linkiem.

19. **Price Detector** — pozostaje read-only insight (już istnieje `ai-pricing-optimizer`), bo nie wymaga akcji autopilota. Dodajemy tylko miesięczny email z raportem.

---

## TECHNICZNE SZCZEGÓŁY

**Stack edge functions**: Deno + npm:@supabase/supabase-js@2 + `corsHeaders` z SDK. Wszystkie executory mają wspólny moduł `_shared/dispatch.ts` (helper SMS/email/push + logger + suppression).

**Cron schedule (pg_cron)**:
```text
* 15min  → autopilot-tick (master orchestrator)
0 7   * * *   → weather-trigger-executor
0 8   * * *   → vip-radar-executor
0 15  * * 2-5 → flash-offer-executor
0 19  * * *   → upsell-pre-visit-executor
30 19 * * *   → vip-tomorrow-executor
0 22  * * *   → profit-alarm-executor
*/30 * * * *  → noshow-recovery-executor, abandoned-booking-executor
0 11  * * 0   → silent-ambassador-executor
0 9   * * 1   → weekly-brief (już jest)
```

**Konfiguracja per salon** (`autopilot_module_settings.config` JSONB):
- Flash Offer: `{threshold, send_hours, weekday_only, target, sms_template}`
- Weather: `{conditions[], probability_min, city, audience, sms_template}`
- VIP Tomorrow: `{send_time, channels[], min_ltv}`
- etc.

**UI changes**:
- Każda karta modułu w `AutopilotFunctions.tsx` czyta realny `autopilot_config[module_enabled]` + statystyki z `autopilot_actions` (zamiast `DEMO_AUTOPILOT_DATA`).
- W demo-mode dalej pokazujemy `demo-data.ts` (chronimy know-how).
- Toggle w UI woła `useUpdateAutopilotConfig` (już istnieje) — od razu działa.
- Dodajemy badge "🟢 Aktywny — działał ostatnio 23 min temu" zasilany z `MAX(executed_at)`.

**SMS/Email**:
- SMS przez `send-sms-smsapi` (już wdrożone, ma kredyt)
- Email przez `enqueue_email` → `process-email-queue` (dziś podpięte do domeny `notify.calendar.beauty-funnels.com`)
- Każda wiadomość ma `unsubscribe_token` (już mamy `email_unsubscribe_tokens`)
- Subscription gating: PRO odblokowuje 8 funkcji, ELITE wszystkie 16

**Lovable AI use**:
- Personalizacja SMS (Gemini 2.5 Flash)
- Review Guard (sentyment + szkic odpowiedzi, Gemini 2.5 Flash)
- Profit Alarm (interpretacja anomalii, GPT-5 mini)
- Wszystko bez dodatkowych kluczy (LOVABLE_API_KEY już jest)

**Testowanie**:
- Każdy executor ma `index.test.ts` z mock Supabase client
- Endpoint `?dry_run=true` zwraca co BY zrobił bez wysyłki
- W demo zawsze dry_run

---

## ZAKRES PRACY (rough estimate)

- Faza 0 (infra): ~6h — migracje DB, master orchestrator, dispatch helper, trigger konwersji
- Faza 1 (4 quick wins): ~6h
- Faza 2 (4 silniki przychodu): ~10h
- Faza 3 (5 modułów retencji): ~10h
- Faza 4 (5 modułów premium): ~10h
- UI rewire (16 kart na realne dane): ~4h
- Testy + QA: ~4h

**Łącznie: ~50h pracy**. Realnie dostarczam Fazę 0 + Fazę 1 w tej iteracji (działający kościec + 4 moduły = już 5x więcej działającego niż dziś), kolejne fazy uruchamiam w następnych iteracjach żebyś mógł na bieżąco testować na realnym salonie i decydować o priorytetach.

---

## DECYZJA DO POTWIERDZENIA

Po akceptacji startuję **Fazą 0 + Fazą 1** w pierwszej iteracji (Quick Wins: VIP na jutro, Smart Reminder, No-show Recovery + cała infra). Później decydujesz, czy idziemy Fazą 2 (przychód) czy Fazą 3 (retencja) jako następne.

Jeśli wolisz inną kolejność (np. zacząć od Flash Oferty bo to najmocniejsze marketingowo) — daj znać przy akceptacji planu.

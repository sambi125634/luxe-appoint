
## Cel

Dać właścicielce/pracownikowi szybki sposób na oznaczanie „odbyta / nie odbyta" dla wizyt z ostatnich 7 dni, aby pipeline „Ścieżka Klientki" działał na realnych danych. Plus: automatyczne przypomnienie 15 min po końcu wizyty oraz konfigurowalna sekwencja Autopilota 1→5 z osobnym wariantem dla klientek z tagiem `ads`.

---

## 1. Widget „Do potwierdzenia" — Dashboard

Nowa karta na górze `AdminDashboard` (pod powitaniem, nad istniejącymi metrykami).

Zawartość:
- Nagłówek: „Potwierdź wizyty" + licznik np. „7 czeka"
- Lista wizyt z ostatnich 7 dni gdzie `status IN ('booked','confirmed')` i `end_time < now()` (czyli zakończone, jeszcze nie oznaczone)
- Każdy wiersz: godzina + data (np. „Dziś 14:00" / „Wt 12 lis"), imię klientki, usługa, pracownik
- Dwa przyciski akcji:
  - **„Odbyta"** → `status = 'completed'` (zielony, primary)
  - **„Nie stawiła się"** → `status = 'no_show'` (outline, subtelny)
- Po kliknięciu: optimistic update + toast „Zapisano" + element znika z listy
- Empty state: „Wszystkie wizyty potwierdzone ✓"
- Stopka karty: link „Zobacz w kalendarzu →" prowadzący do `/admin?tab=calendar`

Pluginowane także w `Calendar` jako rozwijany pasek na górze widoku dnia („Do potwierdzenia (3)") z tą samą logiką.

## 2. Auto-przypomnienia 15 min po wizycie

Edge function `notify-pending-confirmations` uruchamiana z `pg_cron` co 10 minut:
- Znajduje appointments, gdzie `end_time` przeszło ≥15 min temu, `status IN ('booked','confirmed')`, oraz nie wysłano jeszcze przypomnienia (nowa kolumna `confirmation_reminder_sent_at`)
- Wysyła web push do właścicielki (jeśli ma subscription) + tworzy wpis w `client_notifications` dla in-app
- Treść: „Wizyta {klientka} o {godzina} — czy się odbyła?" z deep linkiem do dashboardu
- Oznacza `confirmation_reminder_sent_at = now()`
- Szanuje quiet hours z `autopilot_config`

## 3. Autopilot — sekcja „Ścieżka Klientki 1→5"

Nowa karta w zakładce Autopilot z 5 etapami sekwencji:
- **Przed 1. wizytą** (np. 24h przed: przypomnienie + tipy)
- **Po 1. wizycie** (np. 2h: podziękowanie + prośba o opinię; 7 dni: zaproszenie do 2.)
- **Między 1 a 2** (np. 14 dni: rabat na drugą wizytę)
- **Po 2. wizycie** (budowanie nawyku)
- **Między 2 a 3 → 4 → 5** (utrwalanie cyklu, materiały edukacyjne)

Każdy etap: toggle on/off, opóźnienie (godziny/dni), kanał (SMS / Email / Push), edytor treści z merge tagami `{first_name} {service} {salon}`.

### Segmentacja przez tag

W górze sekcji toggle: **„Osobna sekwencja dla klientek z tagiem `ads`"**
- Wyłączony: jedna sekwencja dla wszystkich
- Włączony: pojawia się druga zakładka „Wariant: Reklamy" — pełna kopia struktury, niezależne treści/timing, używana tylko gdy klientka ma tag `ads` (lub inny wybrany z dropdown istniejących `client_tags`)

Bazowo Autopilot **włączony domyślnie tylko dla klientek z tagiem `ads`** (klucz do high-ticket funnelu), wszystkie inne lądują w pipeline ale bez automatyzacji — zgodnie z hipotezą, że właścicielki nie skonfigurują tego same, ale zobaczą wgląd.

## 4. Schema bazy

Nowa migracja:
- `appointments.confirmation_reminder_sent_at TIMESTAMPTZ NULL` (do dedupe push)
- Tabela `autopilot_pipeline_sequences`:
  - `id, salon_id, variant ('default'|'ads'), stage (text: 'before_1','after_1','between_1_2'...), delay_hours int, channel text, subject text, body text, is_active bool, tag_filter text NULL`
  - GRANT + RLS (salon_id przez `user_belongs_to_salon`)
- Cron job (przez insert tool) do `notify-pending-confirmations` co 10 min

## 5. Pliki do utworzenia/zmiany

Nowe:
- `src/components/admin/dashboard/PendingConfirmationsCard.tsx`
- `src/hooks/usePendingConfirmations.ts` (query + mutation: markCompleted/markNoShow)
- `src/components/admin/calendar/PendingConfirmationsBar.tsx` (collapsed bar)
- `src/components/admin/autopilot/ClientJourneySequenceEditor.tsx` (5 etapów + toggle wariantu ads)
- `supabase/functions/notify-pending-confirmations/index.ts`

Zmiany:
- `src/pages/AdminDashboard.tsx` — wstrzyknięcie `PendingConfirmationsCard` na górze
- `src/components/admin/calendar/...DayView` — wstrzyknięcie `PendingConfirmationsBar`
- Sekcja Autopilot (główny ekran) — dodanie karty „Ścieżka Klientki 1→5"
- Migracja DB + cron

## 6. Sekwencja realizacji

1. Migracja: kolumna `confirmation_reminder_sent_at` + tabela `autopilot_pipeline_sequences` (RLS, GRANT)
2. Hook + Widget Dashboard (działa od razu, manualne oznaczanie pipeline'u zaczyna płynąć)
3. Wariant w Kalendarzu (pasek)
4. Edge function + cron (push + in-app reminder)
5. Edytor sekwencji w Autopilocie (z toggle „Wariant: ads")
6. Seed domyślnych sekwencji dla istniejących salonów

## 7. Poza zakresem (kolejna iteracja)

- Faktyczne wysyłanie sekwencji 1→5 do klientek (na razie tylko UI konfiguracji + zapis — egzekucja kampanii w v2 razem z `retention` engine).
- Mobilna karta potwierdzeń w `MobileDashboard` (można dodać równolegle, ale traktuję jako follow-up).

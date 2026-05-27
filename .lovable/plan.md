# Sekwencje retencyjne — admin pokazuje pustkę

## Przyczyna

W demo lista 5 sekwencji pochodzi ze stałej `MOCK_SEQUENCES` (mock-data). W realnym panelu admin (`RetentionDashboard` → `useRetentionSequences`) komponent czyta tabelę `public.retention_sequences` po `salon_id`. Tabela jest tworzona migracją z marca 2026, ale **nigdzie nie jest seedowana** — ani w onboardingu, ani triggerem na `salons`. Dla każdego nowego salonu zwraca 0 wierszy, więc `sequences.map(...)` w `SequenceEditor` renderuje wyłącznie nagłówek + kartę „Skąd wysyłamy" i kończy się pustką pod spodem (brak kafelków „Zanim odejdzie", „45 dni" itd. ze screena demo).

Druga sprawa: jest tylko 5 sequence_keys (`proactive`, `45day`, `60day`, `75day`, `90day`). User pyta, czy nie zwiększyć liczby punktów — tak, dorzucamy kilka, żeby lejek był „grubszy" i lepiej testowalny.

## Plan

### 1. Backfill + auto-seed w bazie (1 migracja)

Nowa migracja `…_seed_retention_sequences.sql`:

- Funkcja `public.seed_default_retention_sequences(p_salon_id uuid)` (SECURITY DEFINER, `search_path = public`) — wstawia komplet domyślnych sekwencji do `retention_sequences` z `ON CONFLICT (salon_id, sequence_key) DO NOTHING`. Każda sekwencja ma sensowny `trigger_days`, `message_template` (PL, z placeholderami `[Imię]`, `[zabieg]`, `[data]`), `tone`, `include_incentive`, `countdown_hours`, **`is_active = false`** (właściciel sam włącza po przejrzeniu — żeby nie wysłać przypadkiem do bazy klientek bez kontroli).
- Zestaw domyślny — 7 sekwencji (rozszerzenie obecnych 5):
  1. `proactive` (0 dni, AI rytm)
  2. `30day` — *nowy*, łagodny check-in
  3. `45day` — łagodna
  4. `60day` — edukacyjna („efekty utrzymują się…")
  5. `75day` — incentive 48h countdown, rabat 20%
  6. `90day` — ostatnia szansa, troska
  7. `120day` — *nowy*, win-back z mocniejszą ofertą (np. 30%)
- Trigger `AFTER INSERT ON public.salons` → wywołuje `seed_default_retention_sequences(NEW.id)`. Dzięki temu każdy nowo zakładany salon dostaje komplet kart od razu, a właściciel tylko klika toggle „Aktywna".
- Backfill — pojedynczy `INSERT … SELECT` po stworzeniu funkcji, dla istniejących salonów, które nie mają jeszcze żadnego wiersza w `retention_sequences` (`NOT EXISTS`).

Bez zmian w `GRANT`/RLS — tabela już ma poprawne polityki właściciela.

### 2. Bezpiecznik po stronie aplikacji

`useRetentionSequences` (`src/hooks/useRetention.ts`):

- Po pobraniu danych: jeśli `salonId` jest, a `data` puste → wywołaj `supabase.rpc("seed_default_retention_sequences", { p_salon_id: salonId })` i ponów `select`. To leniwy fallback dla salonów, których jeszcze nie objął trigger / backfill (np. utworzonych w oknie czasowym między release'ami). Bez UI side-effectów — toast tylko przy błędzie.

### 3. Bez zmian wizualnych

`SequenceEditor` i `RetentionDashboard` zostają jak są — gdy tylko zapytanie zwróci 7 wierszy, lista wyrenderuje się identycznie jak w demo, tylko z toggle'em wyłączonym, gotowym do uzbrojenia. Linkmark „Polecane" na karcie Email też się nie zmienia.

### 4. Walidacja (back-test, bez śladu w bazie)

W sandboxie psql:

1. `BEGIN;`
2. Wstaw fikcyjny salon (`INSERT INTO salons …`), sprawdź że trigger założył 7 wierszy w `retention_sequences` dla tego `salon_id`, każdy `is_active=false`.
3. Sprawdź drugi (istniejący) salon — czy backfill założył komplet, czy unikalność `(salon_id, sequence_key)` nie pozwoliła na duplikaty.
4. Wywołaj `SELECT seed_default_retention_sequences('<istniejący-salon>')` drugi raz — oczekiwane: 0 nowych wierszy (`ON CONFLICT`).
5. `ROLLBACK;` — potwierdzić, że nic nie zostało.

## Czego NIE ruszam

- RLS, grants, edge functions, schedulera wysyłki.
- Demo (`MOCK_SEQUENCES` zostaje, demo nadal czyta z mocków, nie z bazy).
- UI `SequenceEditor` / `RetentionDashboard` — bez zmian.
- Mutacje (zapis sekwencji) — już działają, tylko nie miały co edytować.

## Pytanie do Ciebie

Domyślny `is_active` przy seedowaniu — proponuję **`false`** (właściciel świadomie aktywuje każdą sekwencję po przejrzeniu treści, zero ryzyka wysłania automatycznych SMS-ów/maili do klientek bez wiedzy właściciela). Alternatywa: `true` dla `proactive` + `45/60/90 day`, `false` dla `75day` (incentive) i `120day` (win-back z rabatem). Daj znać, którą wersję wdrażam.

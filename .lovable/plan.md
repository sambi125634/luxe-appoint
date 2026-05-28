## Cel

Doprowadzić Beauty Autopilot do stanu "działa dla każdego salonu — istniejącego i nowo zakładanego" bez konieczności wchodzenia w zakładkę.

## Stan obecny (audyt)

- 8 salonów w bazie, **tylko 3** mają wiersz w `autopilot_config`.
- Brak triggera seedującego `autopilot_config` przy `INSERT` na `salons`.
- `autopilot-tick` (cron co 15 min) iteruje po `autopilot_config` — salony bez wiersza są pomijane w całości.
- Domyślnie aktywne: `vip_tomorrow`, `smart_reminder`, `noshow_recovery`. Pozostałe 13 modułów OFF.

## Zakres zmian

### 1. Migracja DB (jedna, atomiczna)

**a) Backfill — natychmiast utwórz wiersz `autopilot_config` dla każdego salonu, który go nie ma:**

```sql
INSERT INTO public.autopilot_config (salon_id)
SELECT s.id FROM public.salons s
LEFT JOIN public.autopilot_config ac ON ac.salon_id = s.id
WHERE ac.salon_id IS NULL;
```

Wszystkie kolumny boolean mają sensowne `DEFAULT`, więc po insercie konfiguracja jest gotowa.

**b) Trigger `seed_autopilot_config_for_new_salon`** — auto-seed przy każdym nowym salonie (analogicznie do istniejącego `handle_new_salon_retention_sequences`):

```sql
CREATE OR REPLACE FUNCTION public.handle_new_salon_autopilot_config()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.autopilot_config (salon_id)
  VALUES (NEW.id)
  ON CONFLICT (salon_id) DO NOTHING;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_seed_autopilot_config_on_salon_insert
AFTER INSERT ON public.salons
FOR EACH ROW EXECUTE FUNCTION public.handle_new_salon_autopilot_config();
```

### 2. Decyzja o domyślnych modułach (do potwierdzenia)

Obecnie ON tylko 3 bezpieczne moduły. Opcje:

- **A (zachowawczo, obecny stan):** tylko VIP/Reminder/No-show ON. Reszta wymaga świadomej zgody właścicielki — chroni przed niechcianymi masowymi SMS-ami i kosztami. **Rekomendowane.**
- **B (agresywnie):** włącz dodatkowo Smart Reminder + 4 retencyjne (loyalty, snowball, silent_ambassador, first_visit_sequence) — wszystkie nieinwazyjne, niskoryzykowne.
- **C (Elite full):** dla salonów z planem ELITE w `salon_subscriptions` włącz wszystkie 16 modułów automatycznie.

### 3. Weryfikacja po deploy

- `SELECT count(*) FROM autopilot_config` == `SELECT count(*) FROM salons` (musi być równe).
- Manualny call `autopilot-tick` i log check — powinien iterować po wszystkich aktywnych salonach.
- Smoke test: utworzenie nowego salonu → wiersz w `autopilot_config` pojawia się natychmiast.

## Czego NIE robię w tym kroku

- Nie zmieniam logiki executorów (działa).
- Nie ruszam UI (wired w poprzedniej iteracji).
- Nie ruszam scheduli cron (działa co 15 min).

## Pytanie do Ciebie

Którą opcję domyślnych modułów (A/B/C) wybierasz? Jeśli A — wdrażam migrację i kończymy temat. Jeśli B/C — dorzucam odpowiednie `UPDATE` do backfilla.

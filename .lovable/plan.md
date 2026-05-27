# Naprawa zakłamanych danych w AI Autopilot

## Diagnoza — skąd biorą się fałszywe liczby

Sprawdziłem bazę: tabela `autopilot_actions` ma **0 rekordów** dla wszystkich kont. Wszystkie liczby, które widzisz na nowym koncie (Akcje: 1, Odzyskany przychód: 1 zł, Nowe opinie: +1, Score: 72/100), pochodzą **z hardkodowanych wartości w kodzie UI**, nie z żadnych akcji w Twoim salonie. Konkretnie:

### Bug 1 — Autopilot Score zawsze 72/100
Plik `src/components/admin/autopilot/AutopilotScore.tsx`:
```ts
const score = isDemo ? DEMO_AUTOPILOT_DATA.score : 72;  // ← hardkod 72
```
Dla każdego nowego konta (i każdego konta produkcyjnego!) zwraca **72**. To czysty placeholder, który został w kodzie po prototypie.

### Bug 2 — „Akcje dziś" liczone błędnie
`AutopilotOverview.tsx`:
```ts
const todayStr = new Date().toISOString().split("T")[1]; // ← pobiera CZAS, nie DATĘ
const isToday = (d) => new Date(d).toISOString().split("T")[1] === todayStr;
```
Powinno być `split("T")[0]` (data). Obecna logika porównuje znaczniki czasu z milisekundami — przypadkowo dopasowuje 0–1 rekordów. Stąd „1".

### Bug 3 — „Odzyskany przychód" sumowany ze wszystkich rekordów
Sumuje `metadata.revenue_recovered` z **wszystkich** akcji (limit 50), bez filtra na bieżący miesiąc ani na status `completed/executed`. Jeśli jakikolwiek rekord ma `metadata.revenue_recovered = 1` (np. testowy / migracja), pojawi się 1 zł.

### Bug 4 — „No-show rate" nie jest procentem
Etykieta mówi „No-show rate" (%), a wartość to surowy COUNT z `autopilot_actions` — wprowadza w błąd.

### Bug 5 — `recentActions.slice(1, 20)`
Lista ostatnich akcji pomija pierwszy element (zaczyna od indeksu 1) — bug off-by-one.

### Bug 6 — fallback `|| "Klientka"`
Gdy `triggered_by` jest puste, w feedzie pojawia się generyczna „Klientka" — mylące.

---

## Plan naprawy

### 1. `AutopilotScore.tsx` — realny wzór scoringu lub „—"
Usuwam hardkod `72`. Dla salonów bez danych pokazuję stan pusty:
- Jeśli `autopilot_actions.count = 0` **i** salon < 7 dni → komponent wyświetla `—/100` z etykietą „Zbieranie danych" i tooltipem „Wynik pojawi się po pierwszych akcjach Autopilota".
- W przeciwnym razie liczę realny wynik (0–100) z formuły opartej WYŁĄCZNIE na własnych danych salonu: 
  - 40 pkt — `executed/total` ratio akcji ostatnich 30 dni
  - 30 pkt — odsetek aktywnych funkcji Autopilota w `autopilot_config`
  - 20 pkt — odsetek odpowiedzi/konwersji z akcji (np. `metadata.converted = true`)
  - 10 pkt — kompletność konfiguracji (godziny pracy, integracje, kanały)
- Logika trafia do nowego hooka `useAutopilotScore(salonId)` w `src/hooks/useAutopilot.ts`. Tylko zapytania do tabel tego salonu (RLS już to wymusza).

### 2. `AutopilotOverview.tsx` — naprawa KPI
- **Akcje dziś**: poprawiam `split("T")[1]` → `split("T")[0]`. Filtruję po `created_at >= today 00:00` i `status IN ('executed','sent','completed')`.
- **Odzyskany przychód**: filtruję po `created_at` w bieżącym miesiącu i tylko `status = 'executed'`. Etykieta podtekstu: „ten miesiąc" pozostaje.
- **No-show rate**: zmieniam etykietę na „Zapobiegnięte no-show" (count z `type='noshow_prevention'` i `status='executed'`). Jeśli 0 → pokazuje `—` + „Brak akcji w tym okresie".
- **Nowe opinie**: filtruję bieżący tydzień + `status='executed'`. Jeśli 0 → `0`, nie `+0`.
- Wszystkie KPI dla pustej bazy pokazują `—` zamiast `0 zł`/`+0`, plus jednolity stan pusty: „Autopilot dopiero zbiera dane — pierwsze wartości pojawią się po pierwszych akcjach".
- Usuwam `useAnimatedCount` dla wartości produkcyjnych (animacja licznika sugeruje „dzieje się coś" — zbędne na zerach).
- Poprawiam `slice(1, 20)` → `slice(0, 20)`.
- Usuwam fallback `"Klientka"` — jeśli brak `client_id`, pomijam wiersz.

### 3. `AutopilotStatusBar.tsx` — już ma guard
Pasek już ukrywa się gdy `actions_today === 0 && revenue_today === 0`. Dodaję ten sam filtr daty/statusu co wyżej i upewniam się, że zapytanie używa `status='executed'` (jest), żeby drafty/pending nie podbijały liczb.

### 4. `AutopilotModule.tsx` — nagłówek
Linia „System pracuje za Ciebie — nawet gdy śpisz" zostaje (jest neutralna). Badge „Aktywny 24/7" pokazuję tylko gdy `autopilot_config.is_active = true` w realnym koncie. Dla świeżego konta z wyłączonymi funkcjami → badge zmienia się na „Uśpiony — włącz funkcje by aktywować".

### 5. Test bez zakłamań
Po wdrożeniu, na nowym koncie test akceptacji:
- Wszystkie 4 KPI pokazują `—` lub `0` z podpisem „Brak danych"
- Score: `—/100` + „Zbieranie danych"
- Pasek górny: ukryty
- Lista „Ostatnie akcje": pusty stan „Autopilot dopiero zaczyna zbierać dane"

### 6. Sweep — żeby to się nie powtórzyło
Po naprawie przeszukuję `src/components/admin/` i `src/modules/` regexem na hardkodowane liczby w ścieżkach niezwiązanych z `isDemo`/`mock`/`demo-data.ts` (np. `: 72`, `: 2350`, `revenue_recovered: 1`) i wycinam pozostałe placeholdery. Dotyczy też `RetentionOverview`, `WeeklyBriefWidget` itd., żeby zasada „dane wyłącznie z realnych zdarzeń tego salonu" obowiązywała w całym panelu.

---

## Pliki do zmiany

- `src/components/admin/autopilot/AutopilotScore.tsx` — usunąć hardkod 72, użyć `useAutopilotScore`
- `src/hooks/useAutopilot.ts` — dodać `useAutopilotScore(salonId)` z realną formułą
- `src/components/admin/autopilot/AutopilotOverview.tsx` — naprawić filtr dat, statusy, `slice`, fallbacki, stan pusty
- `src/components/admin/autopilot/AutopilotModule.tsx` — warunkowy badge „Aktywny/Uśpiony"
- `src/components/admin/AutopilotStatusBar.tsx` — wzmocnić filtry statusu (drobna korekta)
- Sweep pozostałych modułów (Retention, WeeklyBrief) pod kątem hardkodów demo wyciekających do prod

## Co poza zakresem (bez zmian)
- Logika trybu demo i `demo-data.ts` — pozostaje nietknięta (działa tylko gdy `isDemo=true`)
- Schematy DB / RLS — nie wymagają zmian, izolacja salonów już działa

Po Twojej akceptacji wdrażam.

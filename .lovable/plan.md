

# Plan: Nowy 6-etapowy AI Onboarding Wizard

## Zakres

Przebudowa `OnboardingPage.tsx` z obecnych 5 kroków (dane → godziny → usługi → pracownicy → summary) na nowy 6-etapowy flow z AI profile scanning, Autopilot setup, widget install i CSV import klientek.

## Zmiany

### 1. Przebudowa `src/pages/OnboardingPage.tsx`

Zastąpienie obecnego 5-krokowego wizarda nowym 6-etapowym:

**Etap 1 — "Powiedz nam o salonie"**
- Formularz: nazwa, miasto, typ salonu (paznokcie/fryzjer/kosmetologia/makijaż/multi), liczba pracowników
- Pole opcjonalne: URL Instagram lub Google Maps z zachętą "Oszczędź 10 minut — AI uzupełni dane"
- Zapisuje do `salons` table

**Etap 2 — "AI skanuje Twój profil"** (jeśli podano URL, inaczej skip)
- Animowany loading z sekwencyjnymi komunikatami (🔍 Skanuję... → 💅 Znalazłam usługi... → ✅ Gotowe!)
- Wywołanie edge function `ai-profile-scanner` (nowa)
- Podgląd wyników z inline edycją
- Przycisk "Wygląda świetnie, zapisz" lub "Edytuj przed zapisem"
- Jeśli brak URL → auto-skip do Etapu 3, który wtedy używa istniejących templates usług

**Etap 3 — "Twój Autopilot jest gotowy"**
- Lista 5 automatycznych funkcji (przypomnienia SMS, reaktywacja, opinie Google, no-show follow-up, weekly brief)
- Każda z toggle (domyślnie ON) i linkiem "Dostosuj"
- Przycisk "Uruchom Autopilot →"
- Tworzy rekord w `autopilot_config` z domyślnymi wartościami

**Etap 4 — "Zainstaluj widget rezerwacji"**
- Gotowy kod embed (1-klik copy)
- Instrukcje dla WordPress, Squarespace, "Wyślij deweloperowi"
- Opcja "Mam tylko Instagram" → instrukcja link in bio + Stories
- Przycisk skip "Zrobię to później"

**Etap 5 — "Przenieś klientki"** (opcjonalny)
- Opcja A: drag & drop CSV → AI mapuje kolumny → podgląd 5 rekordów → "Importuj X klientek"
- Opcja B: "Zacznę od nowa" (skip)

**Etap 6 — "🎉 Jesteś gotowa!"**
- Podsumowanie: nazwa salonu, usługi, widget status, klientki, Autopilot status
- CTA: "Przejdź do Dashboard →"
- Małe CTA: "Zaproś pierwszą klientkę" → generuje link do udostępnienia

### 2. Design

- Tło: gradient `from-[#1A1A2E] to-[#16213E]`, karty białe z shadow
- Accent: `#E91E8C`
- Mobile-first layout
- Animacje: istniejący `StepTransition` + sekwencyjne komunikaty w AI scan

### 3. Nowa Edge Function: `supabase/functions/ai-profile-scanner/index.ts`

- Input: `{ url: string, salon_id: string }`
- Używa Lovable AI (gemini-2.5-flash) do analizy URL
- Scrape URL content → AI extract services, hours, description
- Output: `{ services, opening_hours, description, photos }`
- Zwraca mock-enriched data na start (edge function przygotowana, AI parsing jako next step)

### 4. Migracja: kolumna `salon_type` w `salons`

```sql
ALTER TABLE salons ADD COLUMN IF NOT EXISTS salon_type text DEFAULT 'multi';
ALTER TABLE salons ADD COLUMN IF NOT EXISTS team_size integer DEFAULT 1;
ALTER TABLE salons ADD COLUMN IF NOT EXISTS social_url text;
```

### 5. Resumable onboarding

Istniejąca logika `onboarding_step` w tabeli `salons` jest zachowana. Nowy wizard mapuje 6 etapów na `onboarding_step` 0-5. Przy powrocie użytkownik wznawia od zapisanego kroku.

## Pliki

| Plik | Akcja |
|------|-------|
| `src/pages/OnboardingPage.tsx` | Przebudowa (pełny rewrite) |
| `supabase/functions/ai-profile-scanner/index.ts` | Nowy |
| Migracja SQL | Nowa (3 kolumny w salons) |

## Uwagi
- Etap 2 (AI scan) jest skip-owalny — jeśli użytkownik nie poda URL, przechodzi do Etap 3 z istniejącymi templates usług (zachowane z obecnego kodu)
- Etap 5 (CSV import) reużywa logikę parsowania CSV z `CSVImport.tsx` ale uproszczoną inline
- Autopilot config w Etapie 3 korzysta z istniejącej tabeli `autopilot_config` i `DEFAULT_AUTOPILOT_CONFIG` z `autopilot-engine.ts`


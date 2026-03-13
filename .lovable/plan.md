

# Plan: Ulepszenie rejestracji + AI onboarding scanner

## Zmiany

### 1. Rejestracja — dodać pole telefonu (`AuthPage.tsx`)
- Dodać pole `phone` w formularzu rejestracji (między nazwiskiem a emailem)
- Zapisywać phone w `user_metadata` przy `signUp`
- Zaktualizować `handle_new_user` trigger aby zapisywał phone do `profiles.phone`
- Walidacja: zod schema z `phone: z.string().min(9)`

### 2. AI Scanner — głęboki research zamiast generowania (`ai-profile-scanner/index.ts`)
Obecny problem: AI "generuje realistyczne dane" zamiast je faktycznie wyciągać. Prompt mówi "wygeneruj realistyczne dane" — to dlatego zwraca tylko 7 usług.

Nowe podejście — **dwuetapowy scan**:
- **Etap 1**: Użyć modelu z web search capability (Perplexity `sonar`) lub Firecrawl do pobrania realnej zawartości strony/profilu
- **Etap 2**: AI analizuje pobrane dane i ekstrahuje wszystkie usługi

Konkretnie:
- Edge function przyjmuje `url` + opcjonalnie `website_url` (strona www) i `booksy_url`
- Dla każdego URL: fetch realnej treści strony (Firecrawl lub prosty fetch + HTML parse)
- Przekazać scrapowaną treść do AI z promptem "wyodrębnij WSZYSTKIE usługi z tego tekstu"
- Model: `google/gemini-2.5-pro` (lepszy reasoning, duży context window na dużo treści)
- Prompt zmieniony z "wygeneruj" na "wyodrębnij dokładnie te usługi, które są wymienione"

### 3. Onboarding Step 0 — multiple URLs (`OnboardingPage.tsx`)
- Zamiast jednego pola `socialUrl` → trzy opcjonalne pola:
  - Instagram URL
  - Google Maps URL  
  - Strona www / Booksy URL
- Wystarczy wypełnić minimum jedno
- Wszystkie przekazywane do edge function

### 4. Edge function — Firecrawl scraping
- Użyć Firecrawl connector do scrapowania stron (wymaga połączenia connectora)
- Alternatywa: prosty `fetch` + ekstrakcja tekstu z HTML (bez connectora, ale mniej niezawodne)
- Scrapowany tekst trafia do AI jako context

### 5. Scan result — również adres, telefon salonu
- AI wyciąga też: adres, telefon, logo URL
- Zapisywane do `salons` table (address, phone)

## Pliki do edycji

| Plik | Zmiana |
|------|--------|
| `src/pages/AuthPage.tsx` | Dodać pole phone w signup |
| `src/pages/OnboardingPage.tsx` | Multi-URL input, przekazywanie do scannera |
| `supabase/functions/ai-profile-scanner/index.ts` | Scraping + deep extraction prompt |
| Migration | Update `handle_new_user` trigger — zapisywać phone |

## Pytanie do decyzji
Firecrawl connector jest dostępny i daje najlepsze wyniki scrapowania. Alternatywą jest prosty fetch. Rekomenduję Firecrawl — czy podłączyć?


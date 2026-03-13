

# Plan: Więcej typów salonów + naprawa pobierania usług z Booksy

## Problem 1: Za mało typów salonów

Obecne 5 opcji (`nails`, `hair`, `cosmetology`, `makeup`, `multi`) nie pokrywają rynku. Brakuje popularnych kategorii.

**Rozwiązanie:** Rozszerzyć `SALON_TYPES` o:
- Brwi i rzęsy (🪷)
- Medycyna estetyczna (💉)
- Masaż / SPA (🧖‍♀️)
- Barber (🧔)
- Fizjoterapia (🦴)

Dodać odpowiednie `SERVICE_TEMPLATES` dla nowych typów.

## Problem 2: Usługi z Booksy nie zapisują się

Z logów Edge Function widać:
1. Firecrawl scrapuje Booksy OK (43KB markdown)
2. AI wyodrębnia **158 usług** — sukces
3. **`Http: connection closed before message completed`** — timeout

Przyczyna: Edge Function Gemini 2.5 Pro z 60KB promptem + 158 usług w odpowiedzi trwa ~150s. Edge Functions mają timeout ~60s, ale klient (supabase.functions.invoke) ma jeszcze krótszy timeout.

Ponadto, po otrzymaniu wyniku AI, `handleSaveScanResults` wstawia usługi jedna-kategoria-po-kategorii (sekwencyjnie), co przy 158 usługach w 20+ kategoriach jest wolne.

**Rozwiązanie wielowarstwowe:**

### A. Edge Function — szybszy model + limit usług
- Zmienić model z `gemini-2.5-pro` na `gemini-2.5-flash` (szybszy, wystarczający do ekstrakcji)
- W prompcie dodać limit: "Wyodrębnij maksymalnie 80 najważniejszych usług" (zapobiega 158+ usługom)
- Obciąć scraped content do 30000 znaków zamiast 60000

### B. Frontend — obsługa timeout + batch insert
- W `startAiScan`: zwiększyć timeout na `supabase.functions.invoke` (lub obsłużyć timeout gracefully)
- W `handleSaveScanResults`: batch insert usług zamiast per-kategoria

## Pliki do edycji

| Plik | Zmiana |
|------|--------|
| `src/pages/OnboardingPage.tsx` | Nowe typy salonów, szablony usług, lepszy batch insert |
| `supabase/functions/ai-profile-scanner/index.ts` | Flash model, limit usług, mniejszy prompt |


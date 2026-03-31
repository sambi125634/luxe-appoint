

## Plan: Rebranding Pipeline → "Ścieżka Klientki™" — showcase marketingowy

### Koncepcja

**Nowa nazwa**: "Ścieżka Klientki™" — autorska, polska, premium. W sidebarze i w module.

**Strategia komunikacji**: Pokazujemy WARTOŚĆ (więcej wizyt = więcej przychodu), nie MECHANIZM (sekwencje, follow-upy, automatyzacje). Klient widzi efekt, nie technologię.

### Zmiany

#### 1. Rebranding w sidebarze
**Plik: `src/components/admin/AdminSidebar.tsx`**
- Zmiana labelKey z `"admin.pipeline"` na `"admin.clientJourney"` (lub hardcoded "Ścieżka Klientki™")

**Pliki i18n**: Dodanie klucza `admin.clientJourney`

**Plik: `src/pages/DemoPage.tsx`** — Aktualizacja `getPageTitle` case

#### 2. Hero banner w module (tylko demo)
**Plik: `src/components/admin/pipeline/PipelineModule.tsx`**

Przed tablicą Kanban dodać premium hero sekcję (tylko `isDemo`):

- Gradient banner z ikoną i nagłówkiem "Ścieżka Klientki™"
- Podtytuł: "Każda klientka z reklamy przechodzi przez sprawdzony proces, który zamienia jednorazową wizytę w lojalną, powracającą klientkę"
- 3 karty wartości (bez odsłaniania mechanizmu):
  - **"Więcej powrotów"** — "Automatyczny system sprawia, że klientki wracają na kolejne wizyty zamiast odpadać po pierwszej"
  - **"Zero ręcznej pracy"** — "Potwierdzenia, przypomnienia i follow-upy działają same — Ty zajmujesz się zabiegami"
  - **"Pełna kontrola"** — "Widzisz dokładnie, na jakim etapie jest każda klientka i ile przychodu generuje Twój lejek"
- CTA badge: "W zestawie z pakietem kampanii reklamowej"

#### 3. Ulepszenie opisów stage'ów
**Plik: `src/components/admin/pipeline/types.ts`**

Zmiana opisów na bardziej wartościowe (klient-oriented):
- "Zarezerwowane" → "Klientka zarezerwowała pierwszą wizytę z Twojej reklamy"
- "Nie stawił się" → "AI podejmuje próby odzyskania klientki"
- "Między 1 a 2" → "Automatyczny follow-up w toku — dbamy o powrót"
- "Ukończone" → "Cel osiągnięty — klientka ukończyła pełny cykl zabiegów"

#### 4. Lepsze statystyki z kontekstem wartości
**Plik: `src/components/admin/pipeline/PipelineModule.tsx`**

Zamiana obecnych 4 stat-cards na bardziej marketingowe:
- "Klientki w lejku" (zamiast "W pipeline")
- "Wartość lejka" (zostaje)  
- "Odzyskiwane" (zamiast "Nie stawili się" — pozytywny framing)
- "Ukończone cykle" (zamiast "Ukończone pakiety")

#### 5. Demo info banner — zmiana copy
Zamiast generycznego "Tryb demo" — komunikat:
> "To jest podgląd Twojego przyszłego lejka kampanii. Każda klientka z reklamy automatycznie trafia tutaj i przechodzi przez sprawdzony proces maksymalizacji wizyt."

### Pliki do edycji
1. `src/components/admin/pipeline/PipelineModule.tsx` — hero banner, stat labels, demo banner copy
2. `src/components/admin/pipeline/types.ts` — opisy stage'ów
3. `src/components/admin/AdminSidebar.tsx` — nazwa w menu
4. `src/pages/DemoPage.tsx` — tytuł strony
5. `src/i18n/locales/pl.json` — nowe klucze
6. `src/i18n/locales/en.json` — nowe klucze

### Efekt
- "Pipeline" → "Ścieżka Klientki™" — autorska nazwa, premium feel
- Klient rozumie WARTOŚĆ (więcej wizyt, zero pracy, pełna kontrola)
- Know-how chronione — zero wzmianek o sekwencjach, SMS-ach, automatyzacjach
- Tablica Kanban zostaje jako wizualizacja — ale w kontekście "lejka kampanii"




## Plan: Naprawienie kontrastu w sekcji Hero

### Problem
Tekst H1 ma kolor `#f5f5f7` (biały), a tło strony to jasny motyw (warm white `hsl(40 33% 97%)`). Overlaye (`bg-background/50`, radial-gradient z `--background`) dodatkowo rozjaśniają sekcję. Efekt: biały tekst na białym tle — niewidoczny.

### Rozwiązanie: Wymuszone ciemne tło Hero

Zamiast polegać na CSS variables (które są jasne), hero dostaje **własne ciemne tło** inline — niezależne od motywu strony. Tekst `#f5f5f7` zostaje (dobrze wygląda na ciemnym). Reszta strony bez zmian.

### Zmiany w `NewHeroSection.tsx`

1. **Sekcja `<section>`** — dodanie ciemnego tła:
   ```
   background: linear-gradient(160deg, #0d0520 0%, #1a0838 40%, #120c2e 70%, #0a0a14 100%)
   ```

2. **Usunięcie overlayów** które rozjaśniały tło (linie 27-31) — trzy `<div>` z `bg-background/50`, `bg-gradient-to-t from-background`, i `radial-gradient(... --background ...)`. Te warstwy nadpisywały ciemny gradient na jasny. Zamiast nich — jeden subtelny vignette dla głębi.

3. **Gradient pod H1** (`from-violet-dark via-background`) na linia 21 → zmiana na ciemne kolory inline (`from-[#0d0520] via-[#1a0838] to-[#0a0a14]`), żeby nie ciągnął jasnego `--background`.

4. **Social proof tekst** (linia 200-201): `text-muted-foreground` i `text-foreground` → hardcoded jasne kolory, bo te CSS variables wskazują na ciemne kolory (jasny motyw).

5. **Outline button** (linia 144-151): dodanie `text-white border-white/30` — bo domyślny outline button dziedziczy ciemny foreground.

6. **Avatar kółka** (linia 192-195): `border-background` → `border-[#0a0a14]` i `text-primary` z dostosowaniem do ciemnego tła.

### Jeden plik

| Plik | Co |
|------|----|
| `src/components/landing/NewHeroSection.tsx` | Ciemne tło inline, usunięcie jasnych overlayów, hardcoded jasne kolory tekstu |

Zero zmian w treści, układzie, animacjach ani innych sekcjach.


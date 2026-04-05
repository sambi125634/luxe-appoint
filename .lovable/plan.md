

## Plan: Redesign Hero na jasne tło + mockupy produktowe w stylu Calendly/Notion

### Zakres zmian

Trzy główne zmiany: (1) Hero → jasne tło z split layout (tekst + mockup), (2) SystemFlowSection → layout Calendly z screenshotami, (3) screenshoty z panelu demo jako statyczne obrazki.

---

### 1. Generowanie screenshotów z panelu demo

Użyję przeglądarki do zrobienia 5 screenshotów z panelu demo (`/demo`):
- **Hero mockup**: Widok kalendarza tygodniowego z rezerwacjami (główny screenshot)
- **Krok 1**: Widget rezerwacyjny `/s/demo-salon` (widok wyboru usług)
- **Krok 2**: Panel powiadomień / SMS
- **Krok 3**: Dashboard z retention stats
- **Krok 4**: Profil klientki z historią

Screenshoty zostaną opakowane w macOS-style window frame (skill product-shot) i zapisane do `src/assets/screenshots/`.

---

### 2. NewHeroSection.tsx — kompletny redesign

**Tło**: Jasne (`#FAFAF8` / warm white) zamiast ciemnego fioletu. Usunięcie `Hero3DScene` (3D kalendarz).

**Layout**: Split layout jak Calendly:
- **Lewa strona** (50%): headline + sub + CTAs
- **Prawa strona** (50%): duży screenshot kalendarza w ramce z cieniem

**Typografia** (zachowujemy Cormorant Garamond):
- Headline bardziej "rozległy w szerz" — mniejszy font-size ale na 2-3 szerokie linie zamiast 4 wąskich
- Kolor tekstu: `#1A1A2E` (ciemny) na jasnym tle
- "Nie swój." — gradient violet→pink zostaje
- Sub text: `#4A4A5A`

**Rozmiar headline**: `clamp(40px, 6vw, 72px)` zamiast `clamp(56px, 9vw, 120px)` — mniej pionowo, bardziej horyzontalnie

**Trust indicators, social proof, CTAs**: Kolory dostosowane do jasnego tła (ciemny tekst, emerald checkmarki, primary buttons)

**Badge**: `border-primary/20 bg-primary/5 text-primary` zamiast białych/przezroczystych

---

### 3. SystemFlowSection.tsx — layout Calendly

Zamiana z pionowej listy na **Calendly-style interactive steps**:
- Lewa kolumna: lista 4 kroków (klik zmienia aktywny)
- Prawa kolumna: screenshot odpowiadający aktywnemu krokowi
- Aktywny krok jest wyróżniony (bold, ikona primary, opis widoczny)
- Nieaktywne kroki mają tylko tytuł (muted)
- Automatyczne przełączanie co 4s (jak Calendly)
- Container `max-w-6xl` zamiast `max-w-3xl` (potrzeba miejsca na 2 kolumny)

---

### Pliki do edycji/utworzenia

| Plik | Co |
|------|----|
| Skrypt screenshotów | Zrzuty ekranu z demo → product-shot frames → `src/assets/screenshots/` |
| `src/components/landing/NewHeroSection.tsx` | Jasne tło, split layout (tekst + mockup), mniejszy headline, usunięcie Hero3DScene |
| `src/components/landing/SystemFlowSection.tsx` | Layout Calendly: interactive steps z screenshotami po prawej |

Trzy pliki + generacja 5 screenshotów. Treść, kolejność sekcji i inne sekcje bez zmian.


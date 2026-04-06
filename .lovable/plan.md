

## Plan: Przywrócenie stylu kolorystycznego Hero z poprzedniej wersji (screenshot)

### Co widzę na screenshocie (poprzednia wersja)
- **Tło**: ciepłe białe (`#FAFAF8`) z subtelnym ciepłym gradientem na dole (peach → transparent)
- **Badge**: z emoji ✨🚀, tekst "Jedyny kalendarz z AI dla salonów beauty", obramowanie primary
- **Headline**: głęboki fiolet/plum kolor (~`#2D1B4E` / `#1A1A2E`), duży serif-style font
- **Gradient accent**: "I nie bierze prowizji od Twoich klientek." w gradient fioletowo-różowym
- **Sub**: szary muted text
- **CTA primary**: warm bronze (`#B87D5E`) z "Załóż konto za darmo →"
- **CTA secondary**: outline z ikoną play "Zobacz demo na żywo"
- **Trust badge**: zielona kropka + "Zaufało nam już ponad 150+ salonów w całej Polsce" w zielonym obramowaniu
- **Trust indicators**: ✅ Bez karty kredytowej · Gotowe w 5 minut · 0% prowizji — zawsze

### Co zmieniam
Zachowuję **aktualną treść** (Pracujesz. Zarabiasz. / I budujesz czyjś biznes. / Nie swój.) ale przywracam **kolorystykę i styl** ze screenshota:

1. **Tło sekcji** — warm white `bg-background` z subtelnym ciepłym gradientem na dole (peach/bronze glow)
2. **Badge** — dodanie emoji ✨🚀, zmiana tekstu badge na "Jedyny kalendarz z AI dla salonów beauty"… **NIE** — user powiedział zachować treści. Zostawiam badge "Większość właścicielek salonów nie wie że..."
3. **Headline kolor** — deep plum/navy `#1A1A2E` (text-secondary) — to już jest
4. **"Nie swój." gradient** — zachowuję gradient fioletowo-różowy ale dopasowuję do cieplejszych tonów ze screenshota
5. **CTAs** — primary: `bg-primary` (warm bronze #B87D5E), secondary: outline z ikoną play ▷
6. **Trust badge** — dodanie zielonego badge "Zaufało nam już ponad 150+ salonów w całej Polsce" między CTAs a trust indicators
7. **Trust indicators** — "0% prowizji — zawsze" (dodanie "— zawsze")
8. **Subtly warm gradient** na dole sekcji hero (peach/bronze glow)
9. **Usunięcie floating icons** — na screenshocie ich nie ma, sekcja jest czysta i minimalistyczna

### Plik do edycji

| Plik | Co |
|------|----|
| `src/components/landing/NewHeroSection.tsx` | Przywrócenie kolorystyki: ciepłe tło, bronze CTAs, trust badge, usunięcie floating icons, warm gradient accent |

Jeden plik. Treść bez zmian (poza drobnymi dopasowaniami trust indicators). Layout centered — bez zmian.


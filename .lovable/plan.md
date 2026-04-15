

# Plan: Większy widget + więcej animacji tła na /ad

## 1. Większy widget — nowe rozmiary

Obecne rozmiary phone frame są za małe (240px mobile, 280px tablet, 300px desktop). Zwiększam znacząco:

| Breakpoint | Obecny | Nowy |
|---|---|---|
| Mobile (<768px) | 240px | **320px** |
| Tablet (768px+) | 280px | **360px** |
| Desktop (1024px+) | 300px | **400px** |

Zmiana `max-w` sceny z `480px/680px/800px` na `520px/740px/900px` aby pomieścić większy phone + floating cards.

Rounded na phone frame zmniejszę proporcjonalnie (z 44px na 40px) żeby nie wyglądał jak balon.

## 2. Animacje tła — więcej i widoczne na mobile

Obecne 3 statyczne radial-gradienty są zbyt subtelne. Zamieniam na:

- **5-6 animated gradient orbs** z `framer-motion` (powolny ruch x/y, looping)
- Zwiększona opacity (0.09→0.14 violet, 0.07→0.12 pink, dodatkowe orbs gold/teal)
- **Żadnego `hidden md:block`** — wszystkie animacje widoczne na mobile
- Dodanie subtynelnego `animate-pulse` z różnymi `duration` (8s, 12s, 15s) dla organicznego ruchu
- Dodatkowy orb centralny za phone frame (glow effect wzmocniony)

## Pliki do edycji

1. **`src/pages/AdLandingPage.tsx`** — nowe rozmiary phone, animowane tło z motion divami


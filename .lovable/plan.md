

## Plan: Hero w stylu Notion — wycentrowany, animowany, z pływającymi elementami

### Inspiracja Notion
Notion ma: (1) wycentrowany układ, (2) duży, gruby sans-serif headline, (3) pływające animowane ikonki/elementy wokół, (4) mockup produktu pod tekstem, (5) subtelne ciemne tło z akcentami.

### Zmiany w NewHeroSection.tsx

**1. Layout: split → centered**
- Zamiast `grid lg:grid-cols-2` → `text-center max-w-4xl mx-auto`
- Headline, sub, CTAs wycentrowane
- Mockup produktu pod tekstem (pełna szerokość, z perspektywą)

**2. Typografia — grubsza, bardziej bold**
- H1: zmiana z Cormorant Garamond (serif) → Inter/Plus Jakarta Sans (sans-serif, jak Notion)
- Rozmiar: `clamp(40px, 6vw, 72px)`, font-weight 700
- Kolor: `#1A1A2E` (ciemny na jasnym tle)
- "Nie swój." — zostaje gradient italic, ale też sans-serif bold

**3. Pływające animowane elementy (Notion-style)**
- 6-8 małych ikon beauty (nożyczki, kalendarz, serce, gwiazdka, wiadomość, pieczątka) w postaci emoji lub Lucide icons
- Rozmieszczone absolutnie wokół sekcji
- Każda ma animację `float` — powolne unoszenie się w górę/dół (CSS keyframes lub framer-motion `animate` z `repeat: Infinity`)
- Reagują subtelnie na scroll (parallax via `useTransform`)

**4. Mockup produktu — pod tekstem, Notion-style**
- Screenshot kalendarza poniżej CTAs
- Perspektywa: `perspective(1200px) rotateX(2deg)` — lekkie pochylenie jak u Notion
- Cień: `shadow-2xl` + glow za mockupem
- Animacja: wjeżdża od dołu z `opacity: 0, y: 60` → `opacity: 1, y: 0`

**5. Badge, CTAs, trust indicators**
- Przeniesione na środek (text-center)
- CTAs obok siebie, wycentrowane
- Trust indicators pod CTAs, wycentrowane

### Animacje sekwencyjne (zachowane, ulepszone)

```text
0.0s  — Badge fade-in
0.2s  — "Pracujesz. Zarabiasz." slide-up
0.4s  — "I budujesz czyjś biznes." slide-up  
0.7s  — "Nie swój." scale-in z gradient
0.9s  — Sub text fade-in
1.1s  — CTAs fade-in
1.3s  — Trust indicators fade-in
1.5s  — Mockup slide-up z perspektywą
1.7s  — Floating icons pojawiają się (stagger)
```

### Plik do edycji

| Plik | Co |
|------|----|
| `src/components/landing/NewHeroSection.tsx` | Centered layout, sans-serif bold typography, floating animated icons, mockup pod tekstem z perspektywą |

Jeden plik. Treść bez zmian. Tylko layout, typografia, animacje.


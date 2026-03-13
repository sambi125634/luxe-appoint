

# Plan: Wow-factor design — Hero z 3D i efektami premium

## Cel
Stworzyć landing page, który wizualnie szokuje — efekt "to jest strona www?!" poprzez 3D scene w hero, interaktywne particle effects i płynne scroll-triggered animacje.

## Podejście techniczne

Projekt ma już `framer-motion`. Dodamy `@react-three/fiber@^8.18`, `@react-three/drei@^9.122.0` i `three@^0.166.0` dla sceny 3D w hero.

## Zmiany

### 1. Hero — 3D Floating Crystal/Calendar Scene
Nowy komponent `src/components/landing/Hero3DScene.tsx` z React Three Fiber:
- **Floating crystal** (reprezentujący "diament" Beauty Calendar) — powoli rotujący, z iridescent shader (efekt opalizujący fioletowo-różowo-złoty)
- **Particle field** — setki drobnych cząsteczek unoszących się wokół kryształu, reagujących na ruch myszy (parallax)
- **Glow ring** — pierścień świetlny pulsujący pod kryształem
- Scena renderuje się jako tło hero sekcji, treść tekstowa nakłada się z przodu

### 2. Hero — Redesign layoutu
Przebudowa `NewHeroSection.tsx`:
- Zamiast grid 2-kolumnowy (tekst + mockup laptopa), full-width hero z 3D sceną jako tło
- Tekst wyśrodkowany na scenie 3D
- AnimatedMockup przesuniemy niżej (pod hero) lub do sekcji InteractiveDemo
- Gradient overlay na 3D scenie zapewniający czytelność tekstu
- CTA button z glow effect (box-shadow pulsujący)

### 3. Cursor Trail / Aurora Effect
Nowy komponent `src/components/landing/AuroraBackground.tsx`:
- Canvas-based aurora/gradient mesh animacja reagująca na pozycję myszy
- Używana jako tło kolejnych sekcji (Problem, Transformation) dla spójności
- Lekki, nie obciąża GPU — tylko gradient shifts

### 4. Scroll-triggered animations (framer-motion)
Dodanie `motion` wrapperów do sekcji:
- Każda sekcja wchodzi z `whileInView` animacją (fade + slide + scale)
- Karty w ProblemSection / TransformationSection — staggered entrance (jedna po drugiej)
- Liczniki w SocialProofBar — odpalają się gdy sekcja wjedzie w viewport (intersection observer — już częściowo działa)

### 5. Navbar — Glass morphism enhancement
- Mocniejszy backdrop-blur + subtle border-glow gdy scrolled
- Logo z micro-animation on hover

## Pliki do utworzenia
| Plik | Opis |
|------|------|
| `src/components/landing/Hero3DScene.tsx` | Scena R3F z kryształem + particles |
| `src/components/landing/AuroraBackground.tsx` | Canvas aurora gradient |

## Pliki do edycji
| Plik | Opis |
|------|------|
| `NewHeroSection.tsx` | Nowy layout z 3D tłem, centered text |
| `LandingNavbar.tsx` | Enhanced glass effect |
| `ProblemSection.tsx` | framer-motion stagger |
| `TransformationSection.tsx` | framer-motion stagger |
| `SocialProofBar.tsx` | Viewport-triggered counters |
| `Index.tsx` | Ewentualne zmiany w strukturze |

## Zależności do dodania
```
@react-three/fiber@^8.18
@react-three/drei@^9.122.0
three@^0.166.0
```

## Efekt końcowy
Użytkownik wchodzi na stronę → widzi pływający, opalizujący kryształ w 3D z cząsteczkami → tekst "0% prowizji" pojawia się płynnie → rusza myszką i particles reagują → scrolluje i każda sekcja wchodzi z animacją → wrażenie: "to nie wygląda jak typowa strona SaaS, to wygląda jak showroom luxury brand".


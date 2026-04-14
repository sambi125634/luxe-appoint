

# Plan: Wizualny upgrade strony /demo-agent

## Cel
Przekształcenie obecnej prostej strony z kartą i przyciskiem w immersyjne, premium doświadczenie — styl "Apple meets voice AI" z ciemnym tłem, animowanymi pierścieniami dźwięku i efektem glow.

## Zmiany wizualne

### Tło i atmosfera
- Pełnoekranowe ciemne tło z gradientem radialnym (`#0F0A1A` → `#1E1B2E`) zamiast jasnego `#F5F3FA`
- Subtelna animowana siatka (grid lines) w tle z niską opacitą — efekt "tech/futuristic"
- Centralny glow: radial-gradient od `#3D2066/20` za głównym orbem

### Centralny orb (zamiast małego avatara)
- Duży orb (160px) z gradientem `#3D2066` → `#6B3FA0`, glassmorphism border
- **Idle**: delikatna "oddychająca" animacja scale + 2 orbitujące pierścienie (conic-gradient) obracające się wokół orba
- **Connecting**: przyspieszenie rotacji pierścieni + pulsujący glow
- **Active speaking**: 3–4 koncentryczne fale dźwiękowe rozchodzące się od orba (scale + fade out), dynamiczny glow w kolorze `#6B3FA0`
- **Active listening**: łagodne pulsowanie pierścieni + zmiana koloru glow na `#9B6B8A`
- **Ended**: pierścienie zwalniają i gasną

### Typografia
- Nagłówek większy: `text-4xl md:text-5xl`, font-weight 700, kolor biały, tracking-tight
- Label "Demo AI Agent" z efektem gradient text (`#9B6B8A` → `#6B3FA0`)
- Opis w `text-white/60`

### Przycisk CTA
- Większy, z animowanym border (gradient obracający się wokół przycisku — "rotating border" effect)
- Hover: scale(1.02) + intensyfikacja glow
- Ikona telefonu z animacją "ringing" (rotate wiggle) w stanie idle

### Stany UI
- Status text z AnimatePresence (crossfade między stanami)
- W stanie "ended": confetti-like particles lub subtelne "success" glow w zielonym
- W stanie "error": czerwony glow zamiast fioletowego

### Dodatkowe elementy
- 3 małe "feature pills" pod kartą: "Rozmowa w przeglądarce" · "Bez numeru telefonu" · "AI w czasie rzeczywistym" — fade-in z delay stagger
- Floating particles/dots w tle (5-8 małych kropek, powolna animacja drift)

## Pliki do zmiany
1. **`src/pages/DemoAgentPage.tsx`** — pełny redesign wizualny (logika bez zmian)

## Co się NIE zmieni
- Cała logika Retell (startCall, endCall, eventy) — bez zmian
- Routing, i18n klucze — bez zmian
- Edge function — bez zmian


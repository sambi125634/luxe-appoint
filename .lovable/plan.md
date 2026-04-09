

## Plan: Uporządkowanie CTA na całym landing page

### Problem
Strona ma zbyt wiele CTA z niespójnym przekazem. „Zacznij za darmo", „Załóż konto za darmo", „Zaczynam za darmo" — te teksty nie pasują do nowego modelu cenowego (brak darmowego planu, STARTER od 19 zł/mc). Dodatkowo zbyt wiele przycisków na jednym ekranie rozprasza uwagę.

### Nowa strategia CTA

**Dwa główne CTA (konsekwentnie na całej stronie):**
1. **Primary:** „Wypróbuj 14 dni za darmo" → prowadzi do `/auth` (trial, nie darmowy plan)
2. **Secondary:** „Zobacz demo na żywo" → scrolluje do demo mockupu lub `/demo`

**Dodatkowe warianty kontekstowe (max 1 na sekcję):**
- Po kalkulatorze strat: „Zacznij odzyskiwać te pieniądze →" (zostaje — kontekstowy, dobry)
- Po porównaniu: „Sprawdź cennik" (scroll do pricing)
- Pricing cards: „Wybierz Starter / Pro / Elite" (zostaje)
- Final CTA: „Rozpocznij 14-dniowy test" (primary) + „Porozmawiajmy →" (secondary)

**Pod hero CTA zmiana trust badges:**
- „Bez karty kredytowej" → zostaje
- „Gotowe w 5 minut" → zostaje  
- „0% prowizji — zawsze" → zostaje

### Mapa zmian plik po pliku

| Plik | Obecny CTA | Nowy CTA | Akcja |
|------|-----------|----------|-------|
| `NewHeroSection.tsx` | „Załóż konto za darmo" | „Wypróbuj 14 dni za darmo" | Zmiana tekstu |
| `NewHeroSection.tsx` | „Zobacz demo na żywo" | bez zmian | — |
| `LandingNavbar.tsx` | „Zacznij za darmo" (×2: desktop + mobile) | „Wypróbuj za darmo" | Zmiana tekstu |
| `SystemFlowSection.tsx` | „Chcę taki system — zaczynam za darmo" | „Chcę taki system →" | Skrócenie, usunięcie „za darmo" |
| `UniqueFeaturesTabs.tsx` | „Zacznij za darmo →" + „Zobacz demo" | „Sprawdź cennik →" (1 przycisk, usunięcie drugiego) | Redukcja |
| `SalonLossCalculator.tsx` | „Zacznij odzyskiwać te pieniądze →" | bez zmian (kontekstowy, trafny) | — |
| `AudienceSection.tsx` | „Porozmawiajmy →" (bez onClick) | Dodanie `onClick={scroll to pricing}` lub usunięcie | Fix |
| `NewFinalCTASection.tsx` | „Zacznij za darmo — bez karty kredytowej" + „Porozmawiajmy najpierw →" | „Rozpocznij 14-dniowy test" + „Porozmawiajmy →" | Zmiana primary |
| `DemoPreviewSection.tsx` | „Załóż swoje konto za darmo" | Usunięcie (zostawiamy tylko „Przetestuj panel demo") | Redukcja |

### Podsumowanie efektu
- **Przed:** ~9 CTA z 5 różnymi tekstami, niespójny przekaz „za darmo"
- **Po:** spójny język „14 dni za darmo" (trial) zamiast „konto za darmo" (sugeruje darmowy plan), mniej przycisków, 1 CTA na viewport

### Pliki do edycji (8)
1. `src/components/landing/NewHeroSection.tsx`
2. `src/components/landing/LandingNavbar.tsx`
3. `src/components/landing/SystemFlowSection.tsx`
4. `src/components/landing/UniqueFeaturesTabs.tsx`
5. `src/components/landing/AudienceSection.tsx`
6. `src/components/landing/NewFinalCTASection.tsx`
7. `src/components/landing/DemoPreviewSection.tsx`
8. `src/components/landing/TopBanner.tsx` (jeśli zawiera CTA „za darmo")


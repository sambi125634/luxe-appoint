

## Plan: Zmiana kolejności sekcji landing page + usunięcie zbędnych

### Nowa kolejność (Index.tsx)

1. **TopBanner** + **LandingNavbar** (nawigacja — bez zmian)
2. **NewHeroSection** — hero
3. **OwnYourClientsSection** — "Czy wiedziałaś o marketplace'ach?"
4. **ProblemSection** — kalkulator strat / quiz
5. **SystemFlowSection** — jak to działa
6. **ComparisonSection** — co dostajesz u nas
7. **InteractivePhoneMockup** — prezentacja client app
8. **TestimonialsSection** — opinie
9. **AudienceSection** — dla kogo
10. **PricingSection** — cennik
11. **GuaranteeSection** — gwarancja
12. **NewFAQSection** — FAQ
13. **NewLandingFooter** — stopka

### Sekcje usuwane (z Index.tsx)

- `SocialProofBar` — pasek "0% prowizji / 163 funkcje"
- `LeadFormSection` — formularz kontaktowy (+ `formRef` / `scrollToForm` logika)
- `NewFinalCTASection` — ostatnie CTA przed stopką

### Konsekwencje usunięcia `scrollToForm`

Kilka sekcji przyjmuje `onScrollToForm` jako prop (Hero, ProblemSection, SystemFlowSection, PricingSection). Po usunięciu formularza te CTA nie mają dokąd scrollować. Opcje:
- Zamienić na link do `/auth` (rejestracja) lub zewnętrzny URL
- Albo scrollować do PricingSection

Proponuję: scrollToForm → scrollToPricing (scroll do sekcji cennika).

### Plik do edycji

| Plik | Co |
|------|----|
| `src/pages/Index.tsx` | Nowa kolejność sekcji, usunięcie 3 komponentów, zmiana `formRef` → `pricingRef` |

Jeden plik.


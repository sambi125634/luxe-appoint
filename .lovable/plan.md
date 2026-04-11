

# Full i18n Translation — Landing Page + Demo

## Problem
Almost all landing page components and the demo page have **hardcoded Polish strings** instead of using `useTranslation()` / `t()` calls. The language switcher exists and works, but switching to English changes almost nothing because the text is baked into JSX.

## Scope — Files That Need i18n Conversion

**14 landing components** with hardcoded Polish text:
1. `TopBanner.tsx` — banner text
2. `NewHeroSection.tsx` — headline, CTA, badges, trust items
3. `OwnYourClientsSection.tsx` — marketplace vs BC comparison points, headings, quote
4. `SalonLossCalculator.tsx` — all 4 quiz slides, options, result slide (~100 strings)
5. `SystemFlowSection.tsx` — 6 step titles/descriptions, section header, CTA
6. `ComparisonSection.tsx` — feature names, table headers, notes, disclaimer
7. `UniqueFeaturesTabs.tsx` — 4 tab labels, 12 feature cards (badge/title/description/metric), header, export section
8. `InteractivePhoneMockup.tsx` — section text, fallback text
9. `AudienceSection.tsx` — 10 category titles + ~50 items, header, CTA
10. `TestimonialsSection.tsx` — testimonial content, header, video placeholder
11. `PricingSection.tsx` — header, toggle labels, zero-commission badge
12. `GuaranteeSection.tsx` — 2 guarantee blocks
13. `NewFAQSection.tsx` — 9 FAQ questions + answers, header
14. `NewLandingFooter.tsx` — footer links, labels, tooltips

**Supporting files:**
15. `pricing/PricingCard.tsx` — "Najpopularniejszy", "Nie zawiera:" labels
16. `pricing/pricing-plans.ts` — plan names, descriptions, features, limitations, CTAs
17. `pricing/PricingContactForm.tsx` — form labels, validation messages, success state

**Demo page:**
18. `DemoPage.tsx` — hardcoded tab titles ("Ścieżka Klientki", "Retencja klientek", etc.)

## Approach — Efficient Batch Strategy

Instead of touching components one-by-one (which would burn credits), I'll:

1. **Add all ~400 new translation keys** to `pl.json` and `en.json` in a single batch per file
2. **Convert each component** to use `const { t } = useTranslation()` and replace hardcoded strings with `t('key')` calls
3. Group related components into batches to minimize file writes

### Translation Key Structure
```
landing.topBanner.text, landing.topBanner.amount, landing.topBanner.cta
landing.hero.badge, landing.hero.title, landing.hero.subtitle, ...
landing.ownership.badge, landing.ownership.title, ...
landing.calculator.slide1.question, landing.calculator.slide1.option1, ...
landing.systemFlow.label, landing.systemFlow.title, ...
landing.features.header, landing.features.tab1, ...
landing.audience.title, landing.audience.cat1.title, ...
landing.testimonials.title, ...
landing.pricing.title, landing.pricing.toggle.monthly, ...
landing.guarantee.g1.title, ...
landing.faq.q1.question, landing.faq.q1.answer, ...
landing.footer.product, landing.footer.company, ...
```

### English Translation Quality
All English copy will be **persuasive direct-response copywriting** — not literal translations. Examples:
- "Więcej wizyt. Więcej powrotów. Zero prowizji." → "More visits. More returns. Zero commission."
- "Pracujesz na budowę cudzej bazy klientek." → "You're building someone else's client base."
- "Ile klientek wraca do Ciebie regularnie?" → "How many clients come back to you regularly?"

## Execution Order (optimized for fewest credits)

1. **Batch 1**: Add all new keys to `pl.json` + `en.json` (~400 keys each, 2 file writes)
2. **Batch 2**: Convert TopBanner + NewHeroSection + OwnYourClientsSection (3 components)
3. **Batch 3**: Convert SalonLossCalculator (largest single component, ~100 strings)
4. **Batch 4**: Convert SystemFlowSection + ComparisonSection + UniqueFeaturesTabs
5. **Batch 5**: Convert InteractivePhoneMockup + AudienceSection + TestimonialsSection
6. **Batch 6**: Convert PricingSection + pricing/* + GuaranteeSection
7. **Batch 7**: Convert NewFAQSection + NewLandingFooter + DemoPage

**Estimated: ~7 implementation steps** instead of 18 individual file edits.

## What Won't Change
- No component structure, styling, or animation changes
- No new dependencies
- Keys in pl.json preserve exact current Polish text
- LanguageSwitcher already works — no changes needed


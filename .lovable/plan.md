

## Plan: Optymalizacja mobile dla calej strony landing page i demo

### Zakres zmian — 11 plikow

#### 1. `NewHeroSection.tsx` — Hero
- Zmniejsz `clamp(48px,6vw,78px)` do `clamp(32px,8vw,78px)` na mobile
- `mb-12` badge → `mb-6 md:mb-12`
- `mt-10` subheadline → `mt-6 md:mt-10`
- `mt-12` CTA area → `mt-8 md:mt-12`
- Font size subheadline: `text-base md:text-lg` (z 18px)
- CTA buttons: `h-12 md:h-14`, `px-6 md:px-10`
- Ukryj scroll indicator na mobile (`hidden md:flex`)
- Zmniejsz glow orbs na mobile (`w-[16rem] md:w-[32rem]`)

#### 2. `TopBanner.tsx`
- Skroc tekst na mobile: pokaz tylko "Ile tracisz rocznie? Sprawdz →" na `<md`, pelny tekst na `md:`
- Zmniejsz padding: `py-2 md:py-2.5`

#### 3. `LandingNavbar.tsx`
- Mobile menu: dodaj `px-4` padding, `gap-3` zamiast `gap-4`
- Zmniejsz logo na mobile: `text-lg md:text-xl`

#### 4. `OwnYourClientsSection.tsx`
- `py-16 md:py-24 lg:py-32` (z `py-24 md:py-32`)
- `mb-10 md:mb-16` header
- Karty: `p-5 md:p-6 lg:p-8`
- Lista marketplace/BC: `text-xs md:text-sm`
- Quote: `text-base md:text-lg lg:text-xl`

#### 5. `SalonLossCalculator.tsx`
- Quiz card: `p-5 md:p-6 lg:p-10` (z `p-6 md:p-10`)
- Grid options: `grid-cols-1 sm:grid-cols-2` zamiast `grid-cols-2` (karty sie nie mieszcza na 320px)
- Result: `-{count} zl` → `text-4xl md:text-5xl lg:text-7xl`
- Contexts grid: `grid-cols-3` — OK, ale zmniejsz emoji i font

#### 6. `SystemFlowSection.tsx`
- Grid: `grid-cols-1 lg:grid-cols-[380px_1fr]` — na mobile step list + screenshot pod spodem
- Step list mobile: horizontal scroll pills zamiast pionowej listy (za duzo miejsca)
- Alternatywa prostsza: zostaw pionowa liste ale pokaz tylko active step title, schowaj nieaktywne descriptions (juz tak jest)
- Screenshot: `max-h-[300px] object-contain` na mobile zeby nie byl za duzy

#### 7. `ComparisonSection.tsx` / `UniqueFeaturesTabs.tsx`
- Tabs pills: `text-xs md:text-sm`, `px-2 md:px-3`, `gap-1 md:gap-2`
- Feature cards grid: `grid-cols-1 md:grid-cols-3` (pojedyncza kolumna na mobile)
- Tab labels: na mobile pokaz tylko emoji, schowaj tekst (`hidden sm:inline`)

#### 8. `InteractivePhoneMockup.tsx`
- Na mobile zmien layout: tekst NAD telefonem (nie obok)
- `grid-cols-1 lg:grid-cols-2` (juz jest, ale)
- Phone frame: `w-[280px] md:w-[320px]`
- Headline: `text-3xl md:text-4xl lg:text-5xl`
- Section padding: `py-12 md:py-20 lg:py-28`

#### 9. `AudienceSection.tsx`
- Grid: `grid-cols-2` na mobile jest OK, ale zmniejsz image height: `h-24 md:h-32`
- CTA box padding: `p-4 md:p-6`

#### 10. `PricingSection.tsx` + `PricingCard.tsx`
- Pricing cards: `grid-cols-1 md:grid-cols-3` (stos na mobile)
- Popular card: usun `scale-105` na mobile (powoduje overflow) → `md:scale-105`
- Card price: `text-3xl md:text-4xl`
- Zero commission box: `px-4 md:px-8`

#### 11. `GuaranteeSection.tsx`
- Card padding: `p-5 md:p-8`
- Icon box: `w-10 h-10 md:w-14 md:h-14`
- Na mobile: `flex-col` zamiast `flex-row` (ikona nad tekstem)

#### 12. `NewFAQSection.tsx`
- Accordion question text: `text-base md:text-lg`
- Icon box: `w-8 h-8 md:w-10 md:h-10`
- Content padding: `pl-0 md:pl-14` (na mobile bez lewego paddingu)

#### 13. `NewLandingFooter.tsx`
- Footer grid: `grid-cols-2` mobile juz dziala
- Brand section: mniejszy font, mniejsze social icons

### Zasada ogolna
- Kazda sekcja: `py-16 md:py-20 lg:py-28/32` (zamiast duzych wartosci domyslnych)
- Headings: min `text-2xl` na mobile, skalowane przez `md:` i `lg:`
- Container padding: `px-4` wszedzie (juz jest)
- Tap targets: min 44px na mobile


## Plan: Finalna przebudowa Landing Page — Beauty Calendar

### Podejście
Mega-prompt zawiera 16 sekcji, nową strategię cenową, pełne copy i design system. Zrealizuję to w **4 fazach** (każda w osobnym kroku), żeby uniknąć błędów kompilacji i zachować kontrolę jakości.

---

### FAZA 1 — Strategia cenowa + Core copy (ten krok)

**Dokument DOCX** z:
1. **3 pakiety cenowe** z pełnym uzasadnieniem psychologicznym:
   - **STARTER (0 zł)** — 1 pracownik, 50 rez/mies, brak SMS, brak AI → naturalny upgrade wall
   - **PRO (99 zł/mies)** — unlimited staff, pełne AI, SMS, 0% prowizji → sweet spot
   - **ELITE (249 zł/mies + 497 zł setup)** — white-label, API, private onboarding call → kwalifikator do DFY
   - Roczna opcja: -20% (PRO: 79 zł, ELITE: 199 zł)
2. **Tabela 163 funkcji** rozdzielonych na pakiety
3. **Upgrade hooks** (co wymusza FREE→PRO, PRO→ELITE)

---

### FAZA 2 — Sekcje 1-8 (Hero → Porównanie)

Przepisanie/stworzenie komponentów:
1. `LandingNavbar.tsx` — sticky blur, CTA "Zacznij za darmo — 0 zł"
2. `NewHeroSection.tsx` — loss-aversion hook, urgency bar, animowany counter
3. `SocialProofBar.tsx` — 4 statystyki z count-up
4. `ProblemSection.tsx` — agitacja Jim Edwards + kalkulator strat inline
5. `BookstyCostCalculator.tsx` — 3 slidery (rezerwacje, cena, prowizja%), wynik roczny
6. `TransformationSection.tsx` — Before/After + "Twoje dane na zawsze"
7. `AIGameChangersSection.tsx` — 5 killer AI features z tabs
8. `ComparisonSection.tsx` — tabelka BC vs Booksy vs "Brak systemu"

---

### FAZA 3 — Sekcje 9-12 (Features → Cennik)

9. `FeaturesSection.tsx` — tabs per moduł (11 modułów)
10. `TestimonialsSection.tsx` — 6 placeholder testimoniali z [PLACEHOLDER]
11. `AudienceSection.tsx` — 4 segmenty (kosmetyczny, fryzjerski, klinika, SPA)
12. `PricingSection.tsx` — 3 pakiety, toggle miesięczny/roczny, feature comparison

---

### FAZA 4 — Sekcje 13-16 + Finalizacja

13. `ValueStackSection.tsx` — Hormozi value stack
14. `GuaranteeSection.tsx` — podwójna gwarancja
15. `NewFAQSection.tsx` — 7 obiekcji z odpowiedziami
16. `NewFinalCTASection.tsx` — urgency + social proof live
17. `NewLandingFooter.tsx` — legal, social, company info
18. `Index.tsx` — finalna kolejność sekcji
19. Globalne animacje scroll (FadeInSection wrapper)

---

### Design System (stosowany we wszystkich fazach)
- Background: `--background` (dark #0D0F12)
- Text: `--foreground` (warm cream)
- Accent gold: `--primary` (#C9A96E)
- Accent copper: via CSS variable
- Error/loss: `--destructive`
- Success: emerald tokens
- Cards: `bg-card` z `border-border`
- Font: serif dla nagłówków (Playfair Display już zainstalowany)

---

### Efekt końcowy
- 16 sekcji w logicznej kolejności: Ból → Rozwiązanie → Dowód → Cena → Akcja
- Interaktywny kalkulator strat z 3 sliderami
- Pricing z toggle roczny/miesięczny
- 6 placeholder testimoniali
- FAQ accordion z 7 obiekcjami
- Minimum 4× powtórzony CTA "Zacznij za darmo"
- Mobile-first, responsywny, premium dark design
- Wszystkie animacje scroll (framer-motion)

### Uwaga
Nie tworzę jednego pliku .jsx — projekt jest już w React/TypeScript z komponentami. Zastosuję mega-prompt jako strategię do istniejącej architektury komponentowej.

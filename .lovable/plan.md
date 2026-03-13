

# Plan: Kompletny audit i refaktor landing page

Na podstawie Twojego auditu, wdrażam **10 zmian** w kolejności priorytetowej.

---

## Zmiana #1 — Dodanie sekcji PRICING na stronę (KRYTYCZNY)

Sekcja `PricingSection` **już istnieje** w `src/components/landing/PricingSection.tsx` i **jest zaimportowana** w `Index.tsx`, ale obecny cennik (FREE 0 zł / PRO 49 zł / BUSINESS 99 zł) nie zgadza się z ustaloną architekturą.

**Akcja:** Zaktualizować `PricingSection.tsx` z trzema tierami:
- **FREE** — 0 zł/mies. (1 lokalizacja, do 3 pracowników, podstawowe funkcje)
- **PRO** — 99 zł/mies. (nieograniczeni pracownicy, wszystkie AI, zaawansowane raporty)
- **VIP** — 497 zł + 199 zł/mies. (onboarding, dedicated manager, API, multi-location)

Dodać link "Cennik" do nawigacji w `LandingNavbar.tsx` z `scrollToSection("pricing")` i dodać `id="pricing"` do sekcji.

---

## Zmiana #2 — Poprawka tabeli porównawczej (KRYTYCZNY + prawny)

W `ComparisonSection.tsx` linia 9: `"2-5 zł"` dla Booksy jest nieprawidłowe.

**Akcja:** Zmienić dane:
- Wiersz "Prowizja" → rozdzielić na dwa wiersze:
  - "Prowizja od nowej klientki": BC = "0%", Booksy = "35–45% netto", Fresha = "0%", Versum = "0%"
  - "Abonament miesięczny": BC = "od 0 zł", Booksy = "od 135 zł", Fresha = "od 79 zł", Versum = "od 149 zł"
- Usunąć stary wiersz "Cena miesięczna" (duplikat)
- Zaktualizować `StatusIcon` żeby renderował tekst "0%" w kolorze emerald (nie rose)

---

## Zmiana #3 — Nowy headline hero (loss-aversion)

W `NewHeroSection.tsx` zmienić headline z aspiracyjnego na bólowy.

**Nowy headline:**
```
"Twój system rezerwacji pracuje za Ciebie 24/7."
"I nie bierze prowizji od Twoich klientek."
```

Zmienić subheadline na: "Pierwszy system z AI, który przewiduje przychody, eliminuje no-showy i wypełnia luki w grafiku — automatycznie. Za 0% prowizji."

---

## Zmiana #4 — Usunięcie pustych logo placeholderów z social proof

W `SocialProofBar.tsx` (linie 54-60) — pięć pulsujących prostokątów symulujących logo.

**Akcja:** Usunąć cały blok `mt-12 flex items-center...` z placeholder logo. Zostawić same statystyki, które są silne.

---

## Zmiana #5 — Zmiana kolejności pain pointów

W `ProblemSection.tsx` tablica `problems` — przenieść "System jak z lat 90-tych / 45% prowizji" z pozycji #4 na #2.

**Nowa kolejność:**
1. No-show (300 zł w błoto)
2. System jak z lat 90-tych / 45% prowizji
3. Telefon w trakcie zabiegu
4. "Ile zarobiłam?"

---

## Zmiana #6 — Polonizacja nazw AI + dodanie tab "AI Autopilot"

**AIGameChangersSection.tsx** — spolszczenie nazw:
- "Smart Gap Filler" → "Wypełniacz Luk" (subtitle: "AI samo dzwoni do klientek")
- "Client Risk Score" → "Radar Odejść" (subtitle: "Wiesz zanim odejdzie")
- "Revenue Predictor" → "Prognoza Kasy" (subtitle: "Wiesz ile zarobisz w piątek")
- "Optimal Pricing" → "Dynamiczne Ceny" (subtitle: "Automatyczna optymalizacja cennika")
- "Instagram Booking" → "Rezerwacja z IG" (subtitle: "1 link, klientka rezerwuje")

**FeaturesSection.tsx** — dodać tab "🤖 AI Autopilot" jako **pierwszy** w `featureTabs[]` z listą kluczowych funkcji AI.

---

## Zmiana #7 — Zmiana subheadline w TransformationSection

W `TransformationSection.tsx` zmienić subheadline:

**Było:** "Beauty Calendar to nie kolejny system rezerwacji. To Twój cyfrowy asystent, który nigdy nie śpi."
**Będzie:** "Beauty Calendar to nie narzędzie do klikania. To autopilot, który sam wypełnia kalendarz, reaktywuje klientki i wysyła reklamy — bez Twojego udziału."

---

## Zmiana #8 — Więcej testimoniali widocznych naraz (desktop)

W `TestimonialsSection.tsx` — na desktop (`lg:`) pokazywać 3 testimoniale naraz w grid zamiast karuzeli z jednym. Na mobile zostawić karuzelę.

---

## Zmiana #9 — Zmiana urgency bar na wiarygodny komunikat

W `NewFinalCTASection.tsx` — zmienić "Zostało tylko 7 darmowych kont..." na:
**"Pierwsze 30 dni z pełnym dostępem do wszystkich funkcji AI — bez karty kredytowej."**

---

## Zmiana #10 — Zamiana głównego CTA z "Umów prezentację" na PLG flow

W `LeadFormSection.tsx` i w CTA buttons — zmienić hierarchię:
- Główny CTA: "Załóż konto za darmo" (link do `/auth`)
- Sekundarny CTA: "Umów prezentację" (formularz leadowy zostaje, ale jako secondary)
- Zaktualizować odpowiednio `NewHeroSection` CTA text

---

## Pliki do modyfikacji

| Plik | Zmiany |
|------|--------|
| `NewHeroSection.tsx` | Nowy headline + subheadline + CTA text |
| `SocialProofBar.tsx` | Usunięcie fake logo |
| `ProblemSection.tsx` | Zmiana kolejności kart |
| `TransformationSection.tsx` | Nowy subheadline |
| `AIGameChangersSection.tsx` | Polskie nazwy AI |
| `ComparisonSection.tsx` | Poprawka danych prowizji |
| `FeaturesSection.tsx` | Dodanie tab AI Autopilot |
| `TestimonialsSection.tsx` | Grid 3 na desktop |
| `PricingSection.tsx` | Nowe tiery FREE/PRO/VIP |
| `NewFinalCTASection.tsx` | Zmiana urgency bar |
| `LeadFormSection.tsx` | Zmiana hierarchii CTA |
| `LandingNavbar.tsx` | Dodanie linku "Cennik" |
| `Index.tsx` | Ewentualne drobne zmiany w props |


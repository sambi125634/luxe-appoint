

## Plan: Banner na górze strony + Rewrite copy na "o niej, nie o produkcie"

### Dwa zadania

**1. Czarny banner nad nawigacją**

Nowy komponent `TopBanner.tsx` — pełna szerokość, `bg-black text-white`, wycentrowany tekst, link "Sprawdź →" scrollujący do sekcji kalkulatora (`#calculator`).

```text
┌─────────────── bg-black ────────────────┐
│ Przeciętna właścicielka salonu traci     │
│ 38 000 zł rocznie na klientkach które   │
│ nie wróciły. Ile Ty tracisz? [Sprawdź →]│
└─────────────────────────────────────────┘
← nawigacja poniżej (top offset +40px) →
```

- Tekst: `text-sm`, `py-2.5`, centered
- "Sprawdź →" jako `text-primary underline` link
- Nawigacja: zmiana `top-0` na `top-10` (40px offset dla bannera), banner sam jest `fixed top-0 z-[60]`
- Na mobile: tekst w jednej linii lub delikatny wrap, `text-xs`

**2. Copy rewrite — z "produkt" na "o niej"**

Zmiana perspektywy we wszystkich sekcjach. Główne zamiany:

| Przed | Po |
|-------|-----|
| "Beauty Calendar robi to za Ciebie" | "Twój salon rezerwuje, przypomina i odzyskuje klientki sam" |
| "System przypomina" → opis | "Twoje klientki dostają przypomnienie..." |
| "System wysyła spersonalizowaną ofertę" | "Twoja klientka dostaje ofertę kolejnej wizyty..." |
| "System dzieli klientów na strefy" | "Widzisz od razu kto odchodzi..." |
| "System automatycznie wymaga zaliczki" | "Klientka która nie przyszła 2 razy? Przy trzeciej rezerwacji — zaliczka. Automatycznie." |
| "AI automatycznie segreguje" | "Wiesz od razu: kto jest VIP, kto sezonowa, kto odkrywczyni" |
| "Każdy dzień bez Beauty Calendar" | "Każdy dzień bez systemu" |
| "14 funkcji których nie znajdziesz..." | "14 sposobów w jakie Twój salon zarabia więcej" |
| "Razem tworzą system który pracuje za Ciebie" | "Razem sprawiają że Twój salon zarabia nawet gdy śpisz" |

### Pliki do edycji

| Plik | Co |
|------|----|
| `src/components/landing/TopBanner.tsx` | **Nowy** — czarny banner z copy i linkiem do kalkulatora |
| `src/pages/Index.tsx` | Import TopBanner, render przed LandingNavbar |
| `src/components/landing/LandingNavbar.tsx` | Offset `top-10` zamiast `top-0` gdy banner widoczny |
| `src/components/landing/NewHeroSection.tsx` | Rewrite subheadline |
| `src/components/landing/SystemFlowSection.tsx` | Rewrite opisy kroków na perspektywę "Ty/Twój salon" |
| `src/components/landing/GameChangerFeaturesSection.tsx` | Rewrite headline + opisy features |
| `src/components/landing/NewFinalCTASection.tsx` | "Każdy dzień bez systemu" zamiast "bez Beauty Calendar" |
| `src/components/landing/DataOwnershipSection.tsx` | Drobne rewrite jeśli mówi o produkcie |

Osiem plików. Zero zmian w logice, animacjach czy strukturze — wyłącznie copy i nowy banner.




## Plan: Laptop mockup dla panelu admin + Phone mockup dla aplikacji klienckiej

### Koncept

Dwa osobne podglądy na landing page:
1. **Panel admin** → w ramce laptopa (iframe `/demo`) — więcej miejsca, naturalne środowisko pracy
2. **Aplikacja klientki** → w ramce telefonu (iframe `/app`) — tak jak klientka widzi salon

### Zmiana 1: `DemoPreviewSection.tsx` — przebudowa na laptop mockup z iframe

Zamiast obecnego statycznego mockupu z placeholder danymi — prawdziwy laptop frame z live iframe do `/demo`.

```text
┌─────────────────────────────────────────────┐
│  [eyebrow] Interaktywny podgląd             │
│  Przeklikaj panel — zobacz jak zarządzasz    │
│  salonem                                    │
│                                             │
│  ┌─── Laptop bezel (rounded, dark) ───────┐ │
│  │  ● ● ●  [calendar.beauty-funnels.com]  │ │
│  │  ┌──────────────────────────────────┐   │ │
│  │  │                                  │   │ │
│  │  │   <iframe src="/demo" />         │   │ │
│  │  │   aspect-ratio 16/10            │   │ │
│  │  │                                  │   │ │
│  │  └──────────────────────────────────┘   │ │
│  └─────── base/hinge ────────────────────┘ │
│                                             │
│  [CTA: Otwórz pełne demo] [Załóż konto]    │
└─────────────────────────────────────────────┘
```

- Laptop frame wzorowany na istniejącym `AnimatedMockup` (bezel, browser chrome, base)
- Iframe do `/demo` zamiast statycznych komponentów
- Aspect ratio `16/10`, max-w-5xl
- Fallback jeśli iframe się nie załaduje

### Zmiana 2: `InteractivePhoneMockup.tsx` — zmiana na aplikację klientki

Zachowujemy obecny phone frame i layout (tekst + telefon). Zmieniamy:
- iframe src: `/demo` → `/app` (aplikacja klientki)
- Copy: dostosowanie tekstów — teraz pokazujemy aplikację mobilną klientki, nie widget rezerwacji
- Headline: "Tak wygląda Twoja aplikacja dla klientek"
- Punkty: "Rezerwuje wizytę w 3 kliknięcia", "Widzi historię wizyt i ulubione", "Dostaje powiadomienia i kupony lojalnościowe"
- Floating badges: dostosowane do kontekstu klientki

### Zmiana 3: Fix runtime error

Usunięcie referencji do `MobileAppSection` w `Index.tsx` (jeśli jeszcze istnieje).

### Pliki do edycji

| Plik | Co |
|------|----|
| `src/components/landing/DemoPreviewSection.tsx` | Przebudowa na laptop mockup z iframe `/demo` |
| `src/components/landing/InteractivePhoneMockup.tsx` | Zmiana iframe na `/app`, rewrite copy na aplikację klientki |

Dwa pliki. Kolejność w `Index.tsx` bez zmian — DemoPreviewSection (laptop) pojawia się przed InteractivePhoneMockup (telefon).


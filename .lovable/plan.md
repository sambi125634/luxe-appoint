

# Plan: Landing page reklamowy `/ad` z widgetem rezerwacji + przekierowanie do agenta AI

## Cel
Dedykowany landing page pod ruch z reklam. Przekaz: "Zobacz jak wygląda rewolucyjna rezerwacja online" → użytkownik przeklika widget demo → po zakończeniu rezerwacji zostaje przekierowany na `/demo-agent` aby porozmawiać z agentem AI.

## Struktura strony

```text
┌─────────────────────────────────────┐
│  Headline + subheadline             │
│  (krótki, chwytliwy, 2-3 linijki)  │
├─────────────────────────────────────┤
│                                     │
│   Duży widget rezerwacji (iframe)   │
│   /s/demo-salon                     │
│   ~70vh, wycentrowany              │
│   w ramce iPhone z glow            │
│                                     │
├─────────────────────────────────────┤
│  Info: "Po rezerwacji zadzwoni AI"  │
│  + 2-3 feature pills               │
│  + CTA backup → /demo-agent        │
└─────────────────────────────────────┘
```

## Kluczowe elementy

### 1. Nagłówek
- Krótki, bold, serif (Cormorant Garamond-style)
- Np. "Tak wygląda przyszłość rezerwacji online"
- Podtytuł: zachęta do przeklikania widgetu
- i18n: klucze `landing.adLanding.*` w pl.json + en.json

### 2. Widget rezerwacji
- Iframe `/s/demo-salon` — ten sam co na głównym landing page
- Duży rozmiar: ~70vh wysokości, bez ramki iPhone (lub z nią — ale większy niż na głównej stronie)
- Wycentrowany, z subtlenym glow w tle

### 3. Przekierowanie po rezerwacji
- Po zakończeniu bookingu w widżecie, użytkownik zobaczy info "Teraz porozmawiaj z naszym AI" + przycisk prowadzący na `/demo-agent`
- Alternatywnie: CTA "Porozmawiaj z agentem" widoczny pod widgetem od razu

### 4. Tło i styl
- Ciemne tło (czarne/deep purple) — jak sekcja InteractivePhoneMockup
- Minimalistyczny layout — zero rozpraszaczy, focus na widget
- Framer-motion fade-in animations

## Pliki do utworzenia/zmiany

1. **`src/pages/AdLandingPage.tsx`** — nowa strona
2. **`src/App.tsx`** — dodanie trasy `/ad`
3. **`src/i18n/locales/pl.json`** — klucze `landing.adLanding`
4. **`src/i18n/locales/en.json`** — klucze `landing.adLanding`

## Pytanie do Ciebie

Muszę doprecyzować jedną rzecz przed implementacją:

- Czy widget ma być wyświetlony w ramce telefonu (jak na głównym LP) czy bez ramki, bezpośrednio jako duży element na stronie?
- Czy pod widgetem ma być od razu przycisk "Porozmawiaj z AI" czy dopiero po zakończeniu rezerwacji?


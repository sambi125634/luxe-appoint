

## Plan: Połączenie SocialProofBar i LossNumbers w jedną kompaktową sekcję

### Problem
Teraz mamy dwie osobne sekcje jedna pod drugą: SocialProofBar (4 statystyki) + LossNumbersSection (3 duże liczby). Zajmuje to za dużo miejsca i wygląda rozwlekle.

### Propozycja: Jedna sekcja z dwoma warstwami

Zamiast dwóch sekcji — jedna elegancka sekcja z podziałem na dwie "warstwy":

```text
┌─────────────────────────────────────────────────┐
│  GÓRNA WARSTWA — social proof (kompaktowy pas)  │
│  150+ salonów  ·  25 000+ rezerwacji  ·  4.9★   │
│─────────────────────────────────────────────────│
│                                                 │
│  "Ile Twój salon stracił w tym roku?"           │
│                                                 │
│  −4 800 zł    −280 zł     −3 600 zł            │
│  (label)      (label)      (label)              │
│                                                 │
│  mały tekst podsumowania                        │
└─────────────────────────────────────────────────┘
```

**Górna warstwa** — social proof jako jednoliniowy, horyzontalny pasek z separatorami (kropkami/kreskami), drobna czcionka, bez ikon. Pełni rolę "trust badge" — nie dominuje.

**Dolna warstwa** — trzy liczby strat z animowanym CountUp (nie statyczny tekst). Kiedy sekcja wjeżdża w viewport, liczby odliczają od 0 do docelowej wartości. Efekt: oko natychmiast łapie ruch i czerwone kwoty.

### Zmiany techniczne

| Plik | Co |
|------|----|
| `SocialProofBar.tsx` | Przebudowa na jednokomponentową sekcję: górny pas social proof (inline, mały) + dolna część z 3 animowanymi liczbami strat. CountUp zastosowany też do kwot strat. |
| `LossNumbersSection.tsx` | Usunięcie — zawartość przeniesiona do SocialProofBar |
| `Index.tsx` | Usunięcie importu i użycia `<LossNumbersSection />` |

### Detale wizualne
- Social proof: `text-sm`, inline-flex z dividerami `·`, bez grid/kart
- Liczby strat: `text-5xl md:text-6xl font-black text-destructive` z CountUp animacją
- Tło sekcji: delikatne `bg-muted/20` z `border-y`
- Całość zajmuje ~60% obecnej wysokości dwóch sekcji


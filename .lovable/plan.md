

## Plan: Zmiana głównego komunikatu Hero na narrację o własności danych

### Nowy copy

**Eyebrow badge:** "Większość właścicielek salonów nie wie że..."

**H1 (bold, sekwencyjnie):**
```
Pracujesz.
Zarabiasz.
I budujesz
czyjś biznes.
```

**H2 (gradient muted, pod H1):**
```
Nie swój.
```

**Sub (muted-foreground):**
```
Każda klientka którą pozyskałaś przez platformę
marketplace — należy do platformy.
Jej dane. Jej historia. Jej kontakt.

Beauty Calendar to zmienia.
```

### Zmiana w `NewHeroSection.tsx`

- Badge text: zmiana z "dla właścicielek salonów w Polsce" → "Większość właścicielek salonów nie wie że..."
- Usunięcie `animate-pulse` z badge (pulse nie pasuje do poważnego tonu)
- H1: 4 linie tekstu, każda jako osobny `<span className="block">` z sekwencyjnym fade-in (stagger 150ms) — efekt "uderzenia" linia po linii
- H2 "Nie swój." — `text-gradient-luxury` (lub `text-muted-foreground` gradient), większy font, osobny motion.div z delay
- Sub: 4 linie tekstu z `text-muted-foreground`, ostatnia linia "Beauty Calendar to zmienia." w `text-foreground font-semibold`
- CTAs i trust indicators — bez zmian (zostają)

### Animacja sekwencyjna

Każda linia H1 wchodzi osobno:
- "Pracujesz." → delay 0.3s
- "Zarabiasz." → delay 0.45s
- "I budujesz" → delay 0.6s
- "czyjś biznes." → delay 0.75s
- "Nie swój." → delay 1.0s (osobny motion.div, większy efekt)

### Plik do edycji

| Plik | Co |
|------|----|
| `src/components/landing/NewHeroSection.tsx` | Zmiana copy: badge, H1, H2, sub — nowa narracja o własności danych |

Jeden plik. Struktura, CTAs, trust badges, social proof — bez zmian.


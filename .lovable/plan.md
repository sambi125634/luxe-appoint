

## Plan: Redesign OwnYourClientsSection — premium visual upgrade

### Problem
Sekcja jest czysto tekstowa, płaska, wygląda jak generic blog post. Dwa bloki list z ikonkami ❌/✅ są funkcjonalne ale nudne wizualnie. Brakuje dramaturgii wizualnej, która pasowałaby do reszty landing page'a.

### Koncept

Zamiast 2-kolumnowego grid (tekst | listy) — **ciemna dramatyczna sekcja** z narracją wizualną:

```text
┌─────────────────────────────────────────────────────┐
│  ██████████  CIEMNE TŁO (#1A1A2E)  █████████████   │
│                                                      │
│         ⚠️ Wiedziałaś o tym?                        │
│                                                      │
│      Pracujesz na budowę cudzej                      │
│          bazy klientek.                              │
│                                                      │
│    (krótki paragraf narracyjny — skondensowany)      │
│                                                      │
│  ┌──────────────────┐    ┌──────────────────────┐   │
│  │  MARKETPLACE      │    │  BEAUTY CALENDAR     │   │
│  │  (glass card,     │    │  (glass card,        │   │
│  │   red accent,     │    │   bronze accent,     │   │
│  │   subtle glow)    │    │   golden glow)       │   │
│  │                   │    │                      │   │
│  │  ❌ punkt 1       │    │  ✅ punkt 1          │   │
│  │  ❌ punkt 2       │    │  ✅ punkt 2          │   │
│  │  ❌ punkt 3       │    │  ✅ punkt 3          │   │
│  └──────────────────┘    └──────────────────────┘   │
│                                                      │
│     „Nie budujesz na cudzej ziemi.                   │
│         Budujesz własny dom."                        │
└─────────────────────────────────────────────────────┘
```

### Szczegóły wizualne

1. **Ciemne tło sekcji** (`bg-[#1A1A2E]`, biały tekst) — kontrast z jasnymi sekcjami dookoła, buduje dramaturgię i wagę przekazu
2. **Nagłówek wycentrowany** — badge + H2 + jeden skondensowany paragraf narracyjny (zamiast 4 osobnych — łaczymy w 2 zdania max)
3. **Dwie karty obok siebie** w glassmorphism style:
   - **Marketplace**: `bg-white/5 backdrop-blur border-white/10` z czerwonym akcentem u góry (thin gradient line), ikony ❌ w kolorze `#D94F3D`
   - **Beauty Calendar**: `bg-white/5 backdrop-blur border-primary/20` ze złotym/bronze akcentem u góry, ikony ✅ w kolorze `#B87D5E`, lekki `box-shadow` bronze glow
4. **Karty animowane** — stagger entrance, lewa karta wjeżdża z lewej, prawa z prawej
5. **Cytat na dole** — większy, serif, z subtlenym gradient text effect (white → white/60)
6. **Redukcja punktów**: z 6 do 4–5 na kartę — mniej = czytelniej, każdy punkt bardziej konkretny
7. **Mobile**: karty stack vertically, pełna szerokość

### Treści — bez zmian
Wszystkie teksty zostają identyczne, jedynie układ wizualny się zmienia. Narracja z lewej kolumny zostaje skondensowana do 2 akapitów nad kartami.

### Plik do edycji

| Plik | Co |
|------|----|
| `src/components/landing/OwnYourClientsSection.tsx` | Przebudowa: ciemne tło, centered layout, glassmorphism karty, stagger animacje |


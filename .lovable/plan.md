

## Plan: Uporządkowanie ComparisonSection — spójna narracja bez duplikatów ceny

### Problem

ComparisonSection pokazuje cenę **dwa razy**: na górze (karty 99 zł vs 145+ zł) i na dole (Value Knockout z przekreśloną 3 910 zł). To osłabia efekt — cena powinna pojawić się raz, jako punchline po zbudowaniu wartości.

### Nowa struktura sekcji

```text
┌─────────────────────────────────────────────┐
│  KICKER: "Uczciwe porównanie"               │
│  HEADLINE: "Wszystko to dostajesz.          │
│             Nigdzie indziej tego nie ma."    │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  UniqueFeaturesTabs (12 funkcji)      │  │
│  │  (bez zmian — taby + karty + progres) │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  "CRM, SMS, magazyn? Obie platformy to      │
│   mają. Różnica w tym, co dzieje się potem." │
│  [▼ Porównaj standardowe funkcje]           │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  VALUE KNOCKOUT (jedyne miejsce z ceną)│  │
│  │  Przekreślone 3 910 zł → 99 zł netto │  │
│  │  + "0% prowizji. Zawsze."             │  │
│  │  + dodatkowy kontekst vs marketplace  │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  [CTA: Zacznij za darmo]                    │
└─────────────────────────────────────────────┘
```

### Co się zmienia

**1. Usunięcie kart cenowych z góry** (linie 56-103)
- Karty "99 zł vs 145+ zł" znikają — cena porównawcza pojawia się dopiero w Value Knockout na dole po zbudowaniu wartości 12 funkcji
- To klasyczna technika Hormoziego: najpierw stos wartości, potem cena jako kontrast

**2. Nowy headline**
- Kicker: "Uczciwe porównanie"
- H2: **"Wszystko to dostajesz. Nigdzie indziej tego nie ma."**
- Krótszy, pewniejszy siebie, Direct Response

**3. Rozbudowa Value Knockout** — jedyne miejsce z ceną
- Dodanie linii kontekstu marketplace: "Marketplace: 145+ zł/mies + do 45% prowizji od nowych klientek"
- Zachowanie: przekreślone 3 910 zł → 99 zł netto → 0% prowizji
- To jedyny moment, w którym użytkownik widzi cenę w tej sekcji — po obejrzeniu 12 unikalnych funkcji

### Czego NIE zmieniam
- UniqueFeaturesTabs — zero zmian (taby, karty, auto-rotate 8s, progress bar)
- Collapsible shared features table — zero zmian
- CTA na dole — zero zmian
- ValueStackSection.tsx — nie jest używana w Index.tsx, nie ruszam

### Plik do edycji
| Plik | Co |
|------|----|
| `src/components/landing/ComparisonSection.tsx` | Usunięcie kart cenowych z góry, nowy headline, rozbudowany Value Knockout |


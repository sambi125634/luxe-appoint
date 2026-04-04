

## Plan: Połączenie sekcji Features + Comparison w jedną sekcję

### Problem
Dwie sekcje powielają się — GameChangerFeaturesSection (14 funkcji) i ComparisonSection (tabela porównawcza) mówią o tym samym: "mamy to, oni nie mają". Zajmuje to dużo miejsca i rozmywa przekaz.

### Koncept: Jedna sekcja "Porównanie funkcji"

Zamiast dwóch sekcji — jedna z dwoma widokami:
1. **Tabela porównawcza** jako główny element (rozszerzona o uczciwe dane z researchu)
2. **Rozwijane opisy** — kliknięcie wiersza odsłania krótki opis funkcji (dotychczasowe opisy z GameChangerFeaturesSection)

### Uczciwe dane z researchu Booksy (stan na 2026)

Na podstawie oficjalnej strony `biz.booksy.com/pl-pl/funkcje`:

| Funkcja | Beauty Calendar | Marketplace (Booksy) | Uczciwy status |
|---------|----------------|---------------------|----------------|
| Prowizja od rezerwacji | 0% | 0% (45% tylko Boost dla nowych) | Booksy: `partial` — 0% od stałych, 45% od nowych przez Boost |
| Koszt podstawowy | od 99 zł netto | 145 zł netto + 35 zł/pracownik | Booksy droższe |
| CRM z tagami i historią | ✅ pełne | ✅ **Booksy ma tagi, karty klientów, notatki** | Booksy: `true` (nie `partial` jak teraz!) |
| SMS + email automatyzacja | ✅ | ✅ **Booksy ma kampanie SMS/email, zautomatyzowany marketing** | Booksy: `true` (nie `partial`!) |
| Własność bazy danych | ✅ pełna, eksport | ❌ dane na platformie marketplace | BC advantage |
| Prywatna aplikacja mobilna | ✅ branded space | ❌ współdzielona app Booksy | BC advantage |
| AI Autopilot (12 funkcji) | ✅ | ❌ brak | BC unique |
| True Profit per zabieg | ✅ | ❌ brak | BC unique |
| Receptury zabiegowe | ✅ | ❌ brak | BC unique |
| Skaner kodów kamerą | ✅ | ❌ brak | BC unique |
| Prognoza przychodów AI | ✅ | ❌ brak | BC unique |
| Automatyczna segmentacja | ✅ | ❌ brak (ręczne tagi) | BC unique |
| Karty konsultacyjne | ✅ z builder | ⚠️ formularze/zgody (prostsze) | Booksy: `partial` |
| Ścieżka Klientki (5 wizyt) | ✅ pipeline | ❌ brak | BC unique |
| Auto-zaliczki (no-show) | ✅ automatyczne reguły | ⚠️ ręczne kaucje/przedpłaty | Booksy: `partial` |
| Program poleceń z ROI | ✅ | ❌ brak | BC unique |
| Widget per kampania | ✅ | ❌ 1 profil | BC unique |
| Retencja — strefy zagrożenia | ✅ | ❌ brak | BC unique |
| Zarządzanie magazynem | ✅ | ✅ **Booksy ma magazyn** | Oba mają |
| Raporty sprzedaży | ✅ | ✅ **Booksy ma raporty** | Oba mają |
| Karty lojalnościowe | ✅ | ✅ **Booksy ma program lojalnościowy** | Oba mają |

**Kluczowa zmiana**: CRM i SMS/email marketing u Booksy oznaczamy jako `true`, nie `partial` — Booksy to ma. Uczciwie. Za to podkreślamy funkcje AI, True Profit, receptury, segmentację i retencję — tego naprawdę nie mają.

### Layout nowej sekcji

```text
┌─────────────────────────────────────────────┐
│  [eyebrow] Uczciwe porównanie               │
│  [H2] Co dostajesz u nas,                   │
│       czego nie ma nigdzie indziej.          │
│  [sub] Ceny i funkcje oparte na publicznych │
│        cennikach. Kliknij wiersz po szczegóły│
│                                             │
│  ┌── Tabela ──────────────────────────────┐ │
│  │ Funkcja        │ BC │ Marketplace │     │ │
│  │────────────────│────│─────────────│     │ │
│  │ Koszt/mies     │ 99 │ 145+35/os   │     │ │
│  │ Prowizja       │ 0% │ 0-45% Boost │     │ │
│  │────────────────────────────────────│     │ │
│  │ ▸ True Profit  │ ✅ │ ❌          │     │ │
│  │   [klik → opis rozwija się]       │     │ │
│  │   "Dodajesz składniki per zabieg. │     │ │
│  │    System oblicza realny zysk..." │     │ │
│  │────────────────────────────────────│     │ │
│  │ ▸ AI Retencja  │ ✅ │ ❌          │     │ │
│  │ ▸ Skaner kodów │ ✅ │ ❌          │     │ │
│  │ ...                               │     │ │
│  │ ▸ CRM + tagi   │ ✅ │ ✅          │     │ │
│  │ ▸ SMS/email    │ ✅ │ ✅          │     │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  [nota] Dane oparte na biz.booksy.com       │
│         cennik, stan na 2026.               │
│  [CTA] Zacznij za darmo                     │
└─────────────────────────────────────────────┘
```

- Kolumnę "Brak systemu" usuwamy — nie wnosi wartości
- Wiersze z ✅/✅ (obie platformy mają) grupujemy na dole jako "Wspólne funkcje"
- Wiersze z ✅/❌ (tylko BC) grupujemy na górze jako "Tylko w Beauty Calendar" — z rozwijalnymi opisami
- Accordion na klik wiersza: pokazuje opis z dotychczasowego GameChangerFeaturesSection

### Zmiany w plikach

| Plik | Co |
|------|----|
| `src/components/landing/ComparisonSection.tsx` | Przebudowa: nowe dane porównawcze (uczciwe), accordion na wiersze z opisami funkcji, dwie grupy (unikalne BC / wspólne), usunięcie kolumny "Brak systemu", CTA na dole |
| `src/pages/Index.tsx` | Usunięcie `<GameChangerFeaturesSection />` — treść przeniesiona do ComparisonSection |
| `src/components/landing/GameChangerFeaturesSection.tsx` | Plik zostaje (nie usuwamy) — ale nie jest już używany w Index.tsx |

### Detale wizualne
- Accordion: `framer-motion` AnimatePresence, expand/collapse 200ms
- Ikona z GameChangerFeatures zachowana przy nazwie funkcji w tabeli
- Grupy: "Tylko u nas" header z `text-primary`, "Wspólne" header z `text-muted-foreground`
- Highlight na wierszach cenowych zostaje (rose accent)
- Responsive: na mobile tabela scrollowalna lub stack view

Trzy pliki do edycji. Jedno źródło prawdy zamiast dwóch sekcji.


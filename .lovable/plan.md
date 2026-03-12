

# Plan: Prognozy AI z danymi demo + Przeprojektowanie Radaru Retencji

## Problem 1: Prognozy AI — same zera w demo

`RevenuePredictionCard` nie ma prop `isDemo` — zawsze wywołuje edge function `ai-revenue-predictor`. W demo `salonId` jest null/demo → brak danych → "Brak danych do analizy" lub zera.

### Rozwiązanie
1. Dodać prop `isDemo` do `RevenuePredictionCard`
2. Gdy `isDemo=true`, zwracać mock data zamiast wywoływać edge function:
   - Dziś: 2 350 zł, Tydzień: 14 800 zł, Miesiąc: 58 500 zł
   - Trend: +12% vs poprzedni miesiąc (zielona strzałka w górę)
   - Pewność: "Wysoka" (zielony badge)
   - Potwierdzone: 8 200 zł
   - Insights: 2 realistyczne spostrzeżenia AI
   - Najlepsze dni: Wtorek, Czwartek, Piątek
3. Dodać mini wykres słupkowy pod prognozami (7 słupków = ostatnie 7 dni, dane mock)
4. Przekazać `isDemo` z `DashboardHome` do karty

## Problem 2: Radar Retencji — kompletne przeprojektowanie

Obecny bąbelkowy radar z koncentrycznymi kółkami jest nieintuicyjny. Zastąpić nowoczesnym "Health Board" z 4 kolumnami.

### Nowy komponent `RetentionHealthBoard`
Zastąpi `RetentionRadar` w dashboardzie retencji (i w kompaktowym widoku na home).

**Layout:**
```text
┌──────────────────────────────────────────────────────────┐
│  Retencja: 73% ↗ +5pp   [===========○        ]          │
│  vs poprzedni miesiąc           circular progress        │
├──────────┬──────────┬──────────┬──────────────────────────┤
│ 💚 Aktyw │ 🟡 Uwaga │ 🟠 Ryzyk │ 🔴 Utracone            │
│   (5)    │   (4)    │   (3)    │   (3)                   │
│ ──────── │ ──────── │ ──────── │ ────────                │
│ [AK]     │ [AL]     │ [NW]     │ [IW]                   │
│ Anna K.  │ Agn. L.  │ Nat. W.  │ Izab. W.               │
│ 5 dni    │ 35 dni   │ 65 dni   │ 95 dni                 │
│ ▓▓▓▓▓░░  │ ▓▓▓░░░░  │ ▓▓░░░░░  │ ▓░░░░░░               │
│          │          │          │ [📩 Win-back]           │
└──────────┴──────────┴──────────┴──────────────────────────┘
```

**Szczegóły implementacji:**
- 4 kolumny z kolorowymi paskami na górze (gradient zielony→czerwony)
- Każda karta klienta: awatar (inicjały w kółku), imię+nazwisko, "X dni temu", mini progress bar (engagement)
- Tooltip przy hover: historia wizyt, łączna kwota, preferowane usługi (mock data)
- Kolumny "Ryzyko" i "Utracone": subtelne pulsujące obramowanie (`animate-pulse` border)
- Na górze: "Retencja: 73% ↗ +5pp vs poprzedni miesiąc" z animated circular progress (framer-motion)
- Przycisk "Wyślij kampanię win-back" przy sekcji Utracone (nieaktywny w demo, `opacity-50 cursor-not-allowed`)
- **Responsywność**: na `<lg` kolumny zamieniają się w Tabs (4 zakładki)
- Zachować istniejące mock data z `MOCK_RADAR_CLIENTS`

### Pliki do zmiany/utworzenia

| Plik | Akcja |
|------|-------|
| `src/components/admin/dashboard/RevenuePredictionCard.tsx` | Dodać `isDemo`, mock data, mini bar chart |
| `src/components/admin/DashboardHome.tsx` | Przekazać `isDemo` do RevenuePredictionCard |
| `src/modules/retention/RetentionHealthBoard.tsx` | **Nowy** — nowoczesna wizualizacja 4-kolumnowa |
| `src/modules/retention/RetentionDashboard.tsx` | Import `RetentionHealthBoard` zamiast `RetentionRadar` |
| `src/components/admin/DashboardHome.tsx` | Kompaktowy health board zamiast compact radar |

Istniejący `RetentionRadar.tsx` pozostanie w projekcie (nie usuwamy), ale nie będzie importowany.


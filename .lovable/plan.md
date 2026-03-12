

# Plan: Uatrakcyjnienie wizualne wykresów w Raportach

## Problem
Wykresy są monotonne — dominują płaskie prostokątne słupki w kolorach czarnym/fioletowym. Brakuje wizualnego zróżnicowania i "wow" efektu.

## Rozwiązania

### 1. Bogatsza paleta kolorów
Zamiast powtarzającego się `hsl(var(--primary))` (fiolet) na większości wykresów, użyć pełnej palety luxury:
- **Fiolet** (primary), **Burgund** (secondary/345°), **Złoto** (accent/45°), **Szmaragd** (#10B981), **Róż** (#E91E8C), **Cyjan** (#06B6D4)
- Każdy wykres dostaje swój unikalny gradient zamiast płaskiego koloru

### 2. Gradienty na słupkach i area
- Każdy `<Bar>` dostaje `<linearGradient>` (dół→góra) zamiast flat fill
- Słupki godzinowe/dzienne — gradient od ciemnego u podstawy do jasnego na górze
- Area charts — bogatsze gradient fills z wyraźniejszymi kolorami

### 3. Zaokrąglone słupki
- Zwiększyć `radius` na `[8, 8, 0, 0]` (vertical) i `[0, 8, 8, 0]` (horizontal) — bardziej miękki, nowoczesny wygląd

### 4. KPI cards — glassmorphism + kolorowe ikony
- Każda KPI card dostaje delikatny kolorowy akcent (lewą borderkę lub gradient tło)
- Ikony w kolorach odpowiadających ich funkcji (zielony dla przychodu, złoty dla napiwków, czerwony dla anulowanych)
- Highlight card (przychód) z gradientem violet→burgundy

### 5. Wykresy kołowe — lepsze proporcje i kolory
- Pie/Donut: shadow effect, jaśniejsze kolory, labels z procentami
- Większy paddingAngle (4-5px) dla czytelności

### 6. CartesianGrid — subtelniejsza siatka
- Zmiana z `strokeDasharray="3 3"` na lżejszą siatkę lub usunięcie pionowych linii
- Horizontal-only grid dla czystszego wyglądu

### 7. Tooltip — glassmorphism
- Tooltip z backdrop-blur, delikatnym cieniem i zaokrągleniem — spójny z luxury aesthetic

## Plik do zmiany

| Plik | Zmiana |
|------|--------|
| `src/components/admin/accounting/AccountingCharts.tsx` | Nowa paleta, gradienty SVG, zaokrąglone słupki, kolorowe KPI cards, ulepszone tooltips |


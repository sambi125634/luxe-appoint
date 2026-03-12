

# Plan: Ulepszenie Pipeline — wizualizacja + SectionGuide + raporty zależne od timeRange

## Problem
1. **Board**: Scrollbar na dole jest nieintuicyjny — użytkownik nie widzi, że są kolejne stage'e w prawo.
2. **Brak SectionGuide**: Pipeline nie ma przewodnika wyjaśniającego cel sekcji (inne zakładki go mają).
3. **Raporty**: Zmiana timeRange (7d / 30d / 90d) nie wpływa na dane — zawsze te same liczby.

## Rozwiązania

### 1. Animowana nawigacja pipeline board
Dodać nad board'em **animowany pasek wizualny** ze stage'ami jako mini-krokami połączonymi strzałkami, w kolorze ciemnofioletowym z efektem pulsowania/przepływu (gradient animation). Kliknięcie w stage scrolluje do odpowiedniej kolumny.

Dodatkowo: przy pierwszym załadowaniu board automatycznie robi wolny auto-scroll w prawo i z powrotem (jedno przejście, ~4s), aby użytkownik zobaczył pełną ścieżkę.

**Plik:** `PipelineModule.tsx` — dodać komponent `PipelineStageNav` nad `ScrollArea` + logikę auto-scroll z `useEffect` + `useRef`.

### 2. SectionGuide dla Pipeline
Dodać `<SectionGuide sectionKey="pipeline" />` na górze zakładki board (już jest w empty state, ale brakuje go w widoku z danymi).

Dodać tłumaczenia `sectionGuide.pipeline.*` w `pl.json` i `en.json`.

**Pliki:** `PipelineModule.tsx`, `pl.json`, `en.json`

### 3. Raporty zależne od timeRange
Zamienić statyczne mock dane na funkcje generujące dane proporcjonalnie do wybranego zakresu czasu. Mnożniki:
- 7d: ~0.15x bazowych wartości
- 30d: 1x (baza)
- 90d: ~2.8x
- all: ~4x

Dane KPI, funnelData, conversionData, stageValueData i timeMetrics będą obliczane przez `useMemo(timeRange)` z lekkim randomem seed'owanym per zakres, aby wyglądały realistycznie i różniły się między sobą.

**Plik:** `PipelineReports.tsx`

## Pliki do zmiany

| Plik | Zmiana |
|------|--------|
| `src/components/admin/pipeline/PipelineModule.tsx` | Auto-scroll, animowany pasek stage'ów, SectionGuide |
| `src/components/admin/pipeline/PipelineReports.tsx` | Dane dynamiczne wg timeRange |
| `src/i18n/locales/pl.json` | Tłumaczenia sectionGuide.pipeline |
| `src/i18n/locales/en.json` | Tłumaczenia sectionGuide.pipeline |




# Fix: Bąble wychodzące poza obszar radaru

## Problem
Bąble w strefie czerwonej są pozycjonowane blisko krawędzi `maxRadius` (canvasSize/2 - 12px), ale sam bąbel ma 34px (promień 17px). To powoduje, że wizualnie wystają poza koło.

## Rozwiązanie w `RetentionRadar.tsx`

1. **Zwiększyć padding** — `maxRadius = canvasSize / 2 - 24` (zamiast -12), żeby zostawić miejsce na bąble
2. **Zmniejszyć górny clamp** w radius — `rMax - bubbleSize/2` zamiast `rMax - 8`
3. **Dodać `overflow: hidden`** na kontenerze radaru jako safety net
4. **Zwiększyć dolny clamp** — `rMin + bubbleSize/2` zamiast `rMin + 8`, żeby bąble w centrum nie nachodziły na ikonę salonu

Jeden plik, kilka linii zmian.


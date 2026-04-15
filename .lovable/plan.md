

# Plan: Trzy wizualne stany agenta AI z unikalnymi kolorami i kształtem fal

## Cel
Rozróżnić wizualnie 3 stany rozmowy z agentem: **Słucha** (listening), **Przetwarza** (connecting/thinking), **Mówi** (speaking) — każdy z inną paletą kolorów, dynamiką fal i kształtem, zachowując kolorystykę brandu.

## Paleta kolorów per stan

```text
┌─────────────────┬────────────────────────────────┬──────────────┐
│ Stan            │ Kolory fal                     │ Efekt        │
├─────────────────┼────────────────────────────────┼──────────────┤
│ Słucha          │ #9B6B8A → #B87D5E (Mauve→Bronze)│ Spokojne,    │
│ (listening)     │ ciepłe, miękkie fale            │ wolne pulsy  │
├─────────────────┼────────────────────────────────┼──────────────┤
│ Przetwarza      │ #6B3FA0 → #3D2066 (Violet)     │ Rotujące,    │
│ (processing)    │ + subtle shimmer                │ geometryczne │
├─────────────────┼────────────────────────────────┼──────────────┤
│ Mówi            │ #3D2066 → #9B6B8A → #10B981    │ Energetyczne,│
│ (speaking)      │ (Deep Purple→Mauve→Success)     │ duża amplit. │
└─────────────────┴────────────────────────────────┴──────────────┘
```

## Zmiany w kodzie

### 1. `VoiceWaves.tsx` — pełna przebudowa

- **Nowy prop**: `agentState: "idle" | "listening" | "processing" | "speaking"` zamiast osobnych booleanów
- **3 unikalne profile fal**:
  - **Listening**: 4 fale, niska amplituda (2-4px), wolna prędkość, kształt bliższy kołu, ciepłe tony mauve/bronze, delikatne wypełnienie wewnętrznych pierścieni
  - **Processing**: 6 fal, średnia amplituda, szybka rotacja (efekt "myślenia"), ostre kształty (wyższa częstotliwość sinusa), violet z shimmerem — co 3. fala lekko jaśniejsza, pulsujący glow centralny
  - **Speaking**: 5 fal, duża amplituda (10-20px), zmienna prędkość zsynchronizowana z energią, gradient purple→mauve→emerald na zewnętrznych falach, grubsze linie (2.5px), intensywny radialny glow w centrum
- **Płynne przejścia**: Interpolacja kolorów i amplitud przez `lerp` z targetem per stan (nie instant switch)
- **Ulepszony kształt**: Dodanie 3. harmonicznej sinusa dla bardziej organicznego, imponującego kształtu fal
- **Center glow**: Inny kolor radialnego gradientu per stan

### 2. `DemoAgentPage.tsx` — adaptacja propsów

- Zamiana `speaking={agentSpeaking} active={isActive} connecting={...}` na pojedynczy `agentState`
- Mapowanie: `connecting` → `"processing"`, `active && speaking` → `"speaking"`, `active && !speaking` → `"listening"`, else → `"idle"`
- Aktualizacja `glowColor` tła strony aby odpowiadał nowej palecie per stan
- Aktualizacja koloru/gradientu centralnej ikony mikrofonu per stan

### Pliki do edycji
1. `src/components/demo-agent/VoiceWaves.tsx`
2. `src/pages/DemoAgentPage.tsx`


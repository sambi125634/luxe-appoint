

# Plan: Zaawansowana scena 3D — Realistyczny kalendarz beauty z auto-wypełnianiem

## Problem z obecną wersją
Losowe kolorowe kafelki bez kontekstu. Brak powiązania z branżą. Kolory nachodzą na tekst (szczególnie mobile). Wygląda banalnie.

## Nowa koncepcja

Przebudowa `Hero3DScene.tsx` — scena przedstawia **realistyczny kalendarz tygodniowy beauty salon** w perspektywie izometrycznej, z wizytami wypełniającymi się automatycznie. Oparta na prawdziwej strukturze kalendarza z systemu (nazwy zabiegów, godziny, staff).

### Kluczowe zmiany:

**1. Realistyczna struktura kalendarza**
- 5 kolumn (Pon–Pt) z nagłówkami tekstowymi (TextGeometry/sprite)
- Godziny po lewej stronie (09:00–18:00) jako labele
- Siatka z subtelnymi liniami oddzielającymi godziny
- Wygląda jak prawdziwy interfejs kalendarza, nie losowe klocki

**2. Sloty wizyt z treścią**
- Każdy slot ma mini-label (nazwa zabiegu: "Masaż", "Manicure", "Peeling" itp.) renderowany jako sprite/texture
- Kolory przypisane do staff members (jak w prawdziwym systemie)
- Różne długości slotów = różne zabiegi (30min, 60min, 90min)
- Sloty pojawiają się sekwencyjnie — efekt "grafik sam się wypełnia"

**3. Readability — odsunięcie od tekstu**
- Scena przesunięta w prawo i w dół (na desktop) / przesunięta do dołu i zmniejszona (mobile)
- Zwiększona opacity overlay na środku (radial gradient — czytelność tekstu w centrum, kalendarz widoczny na bokach)
- Na mobile: scena z opacity 0.3-0.4, tylko jako ambient backdrop
- Kolory slotów: stonowane, z niższą saturacją (pastelowe wersje pink/violet/gold)

**4. Zaawansowane efekty wizualne**
- Sloty wlatują z efektem "flip" (rotacja Y 90°→0° + scale) zamiast prostego scale-in
- Po pojawieniu się slotu: ripple glow effect rozchodzący się po siatce
- Ambient particles lecą w kierunku pustych slotów (jak "AI wypełnia grafik")
- Delikatne reflection/shadow pod całą siatką (ground plane z blur)
- Cała scena unosi się (Float) i reaguje na mysz (parallax)

**5. Cykliczna animacja "dream outcome"**
- Faza 1 (0-8s): Pusty kalendarz → sloty pojawiają się jeden po drugim
- Faza 2 (8-10s): Pełny kalendarz — pulse glow na wszystkich slotach (sukces!)
- Faza 3 (10-11s): Fade out → reset → nowy układ
- Nowy cykl z innymi zabiegami i rozkładem

### Zmiany w `NewHeroSection.tsx`:
- Wzmocniony radial gradient overlay (centrum czytelne, boki z 3D)
- Na mobile (`<md`): dodatkowy ciemny overlay na 3D scenie (`bg-background/60`)

## Pliki do edycji
| Plik | Opis |
|------|------|
| `Hero3DScene.tsx` | Pełna przebudowa — realistyczny kalendarz |
| `NewHeroSection.tsx` | Lepszy overlay dla readability, mobile fix |


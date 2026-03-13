

# Plan: 3D Kalendarz — sloty wypełniające się same

## Koncept

Zamiast abstrakcyjnego kryształu — **3D siatka kalendarza** z blokami wizyt, które animują się "same się wypełniając". Dream outcome klientki: "Twój grafik sam się zapełnia".

## Scena w `Hero3DScene.tsx` (pełna przebudowa)

### Elementy 3D:

1. **Siatka kalendarza (5 kolumn × 6 wierszy)**
   - Kolumny = dni tygodnia (Pon–Pt), wiersze = godziny
   - Każda komórka to `RoundedBox` (drei) z zaokrąglonymi rogami
   - Siatka lekko nachylona w perspektywie (obrócona ~15° na osi X i ~10° na Y) — efekt "floating dashboard"

2. **Animowane sloty wizyt**
   - Co 1-2 sekundy nowy slot "wskakuje" z animacją scale 0→1 + glow pulse
   - Sloty mają różne kolory z palety beauty (róż, fiolet, złoto, lavender)
   - Różne wysokości (1-3 rzędy) = różne długości zabiegów
   - Po wypełnieniu ~70% siatki — reset i zapełnianie od nowa (loop)

3. **Particle sparkles**
   - Każdy nowo pojawiający się slot emituje burst drobnych świecących cząsteczek
   - Sparkles (drei) jako ambient tło — zostają

4. **Glow effect**
   - Wypełnione sloty mają delikatne emissive glow
   - Cała siatka ma subtle bloom (pointLight za siatką)

5. **Mouse parallax**
   - Cała grupa (siatka + sloty) delikatnie podąża za kursorem myszy (lerp)
   - Daje poczucie głębi i interaktywności

### Technikalia:
- `RoundedBox` z drei dla komórek i slotów
- `useFrame` do animacji pojawiania się slotów (timer-based)
- `Float` z drei dla lewitacji całej siatki
- `meshPhysicalMaterial` z transmission/iridescence na slotach dla efektu "glass card"
- Kolory slotów: `#E91E8C` (pink), `#7c3aed` (violet), `#d4a843` (gold), `#c084fc` (lavender)

## Plik do przebudowy
- `src/components/landing/Hero3DScene.tsx` — pełna przebudowa

Żadne inne pliki nie wymagają zmian — `NewHeroSection.tsx` już renderuje scenę jako tło.


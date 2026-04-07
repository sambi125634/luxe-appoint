

## Plan: Hero na pełny ekran (100vh) z proporcjonalnym rozłożeniem treści

### Problem
Sekcja Hero ma `min-h-[90vh]` — nie wypełnia ekranu, widać "prześwit" do następnej sekcji. Treść jest ściśnięta w górnej części.

### Rozwiązanie

Zmiana w jednym pliku: `src/components/landing/NewHeroSection.tsx`

1. **Sekcja → `min-h-screen`** (100vh zamiast 90vh) — wypełnia cały viewport
2. **Flex justify-center** na kontenerze wewnętrznym — centruje treść pionowo w dostępnej przestrzeni
3. **Zwiększenie spacingów proporcjonalnie:**
   - Badge: `mb-10` → `mb-12`
   - Subheadline: `mt-8` → `mt-10`, font `17px` → `18px`
   - CTAs: `mt-10` → `mt-12`
   - Trust badge: `mt-7` → `mt-8`
   - Trust indicators: `mt-5` → `mt-6`, `gap-6` → `gap-8`
4. **Padding dostosowanie:** `pb-28 pt-20 lg:pt-24` → `py-0` (flex justify-center zajmie się centrowaniem)
5. **Scroll indicator** zostaje na `bottom-8` — działa naturalnie z pełnym ekranem
6. **Mobile:** `min-h-screen` działa poprawnie na mobile, flex-center zapewni dobre proporcje bez ręcznego paddingu

### Efekt
- Desktop: Hero zajmuje dokładnie cały ekran, treść wycentrowana pionowo, zero prześwitu
- Mobile: to samo — pełny viewport, czytelne proporcje

### Plik do edycji

| Plik | Co |
|------|----|
| `src/components/landing/NewHeroSection.tsx` | `min-h-screen`, flex justify-center, zwiększone spacingi |




# Plan: Wyśrodkowanie ekranu intro rezerwacji

## Problem

Ekran intro ma `min-h-[100dvh]` i `py-8`, ale elementy (duży przycisk z `py-10`, duże marginesy `mb-8`, `mb-10`, `mt-12`) powodują overflow i wymuszają scroll na mniejszych ekranach.

## Zmiany w `BookingWidget.tsx` (linie 468-579)

1. **Zmniejszyć padding przycisku CTA**: `py-10` → `py-7` (nadal duży i premium, ale mniej rozciąga layout)
2. **Zmniejszyć odstępy między sekcjami**: `mb-8` → `mb-6`, `mb-10` → `mb-8`, `mt-12` → `mt-8`, `gap-6` → `gap-4`
3. **Zmienić kontener na `justify-center` z `overflow-hidden`** — upewnić się, że nic nie wymusza scrolla (już jest `justify-center`, wystarczy redukcja paddingów)
4. **Dodać `max-h-[100dvh]`** na kontenerze wewnętrznym, żeby wymusić dopasowanie do ekranu

Efekt: cała zawartość mieści się na ekranie bez scrollowania, wyśrodkowana z sakura animacjami w tle.


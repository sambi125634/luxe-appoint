

## Plan: Usunięcie DemoPreviewSection + poprawki InteractivePhoneMockup (bez zmian w ServiceSelection)

### Trzy zmiany

**1. Usunięcie DemoPreviewSection z Index.tsx**
Usuwamy import i `<DemoPreviewSection />` — laptop admin znika ze strony.

**2. InteractivePhoneMockup — usunięcie floating badges**
Usuwamy oba pływające widżety ("Nowa pieczątka" linia 123-132 i "Rezerwacja potwierdzona" linia 134-142) — czystszy wygląd, łatwiejsze scrollowanie.

**3. Iframe startuje na `/s/demo-salon`**
Zmiana `src="/app"` na `src="/s/demo-salon"` — widget rezerwacyjny demo salonu, od razu widok wyboru usług.

### Pliki do edycji

| Plik | Co |
|------|----|
| `src/pages/Index.tsx` | Usunięcie `<DemoPreviewSection />` i importu (linie 15, 48) |
| `src/components/landing/InteractivePhoneMockup.tsx` | Usunięcie floating badges (linie 123-142), zmiana iframe src na `/s/demo-salon` (linia 105) |

Dwa pliki. Bez zmian w logice rezerwacji (ServiceSelection).




# Plan: Radar Retencji — Logiczna i Spójna Wizualizacja

## Problem

Obecna implementacja ma odwrócony model mentalny: zielone (bezpieczne) klientki są na zewnątrz, a czerwone (utracone) w centrum. To nieintuicyjne — radar powinien działać jak "dystans od salonu": im klientka bliżej centrum, tym bliżej salonu (bezpieczna). Im dalej się oddala, tym większe ryzyko utraty.

Dodatkowo pozycjonowanie bąbli używa globalnego indeksu zamiast indeksu wewnątrz strefy, co powoduje nierównomierne rozmieszczenie i nakładanie się.

## Zmiany w `RetentionRadar.tsx`

### 1. Odwrócenie stref (centrum = bezpieczeństwo)
- Centrum (najmniejszy pierścień): **zielone** — aktywne, blisko salonu
- Drugi pierścień: **żółte** — uwaga
- Trzeci pierścień: **pomarańczowe** — ryzyko
- Zewnętrzny pierścień: **czerwone** — oddaliły się, utracone

Zmiana: odwrócić tablicę `zones` na `["red", "orange", "yellow", "green"]` dla rozmiarów pierścieni, ale zachować logikę pozycjonowania tak, żeby green = mały r, red = duży r.

### 2. Pozycjonowanie bąbli wg zone-local index
- Zamiast globalnego `idx`, użyć indeksu klientki *wewnątrz jej strefy* do obliczania kąta
- Kąt = `(zoneLocalIndex / zoneClientsCount) * 2 * PI` + mały offset per strefa
- Radius: interpolacja `days_inactive` w zakresie pierścienia dla płynniejszego rozkładu

### 3. Subtelne wypełnienia stref
- Zamiast samych dashed borders, dodać lekkie radialne tło (gradient lub semi-transparent fill) dla każdej strefy
- Zewnętrzna strefa czerwona z delikatnym pulsującym glow

### 4. Etykiety stref na pierścieniach
- Małe labelki przy krawędzi każdego pierścienia: "Aktywne", "Uwaga", "Ryzyko", "Utracone"
- Pomaga w orientacji bez patrzenia na legendę

### 5. Centrum: logo/ikona salonu
- Zamiast liczby "utraconych" w centrum, postawić ikonę salonu (np. Sparkles lub serce)
- Liczby przenieść do legendy na dole (która już istnieje)

### 6. Lepsze unikanie nakładania
- Dodać jitter oparty na hash ID klientki zamiast `idx % 3`
- Minimalny dystans między bąblami w tej samej strefie

## Pliki do edycji

| Plik | Zmiana |
|------|--------|
| `src/modules/retention/RetentionRadar.tsx` | Odwrócenie logiki stref, nowy algorytm pozycjonowania, wypełnienia pierścieni, etykiety stref, nowe centrum |

Jeden plik, czysto wizualna zmiana — brak migracji, brak nowych hooków.


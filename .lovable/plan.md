

## Plan: Usunięcie DataOwnershipSection + rozbudowa OwnYourClientsSection

### Co robimy

1. **Usuwamy `<DataOwnershipSection />`** z `Index.tsx` — czarna sekcja znika, zero duplikacji.

2. **Rozbudowujemy `OwnYourClientsSection.tsx`** — jedyna sekcja o własności danych, ale mocniejsza:

### Nowy layout OwnYourClientsSection

**Lewa kolumna — copy (rozbudowany):**
- Badge "Wiedziałaś o tym?" zostaje
- Headline: "Pracujesz na budowę cudzej bazy klientek." — zostaje, mocny
- Dodajemy konkretniejszy, bardziej emocjonalny copy:
  - Analogia Allegro zostaje, ale dodajemy punchline o konsekwencjach: "Jutro mogą podnieść prowizję. Pojutrze wyświetlić Twoją konkurencję tej samej klientce za 10 zł taniej. A Ty nie możesz nic zrobić." (przeniesione z DataOwnership — najlepsze zdania)
  - Zamknięcie: "Przez lata budujesz ich biznes. Nie swój." → wzmocnione o "Bo to ich baza. Nie Twoja."

**Prawa kolumna — karty porównawcze:**
- Marketplace card: wzmocniony copy (dodajemy "Jutro mogą zmienić zasady" i "Konkurencja wyświetlana obok Ciebie")
- Beauty Calendar card: wzmocniony copy (dodajemy "Twoje dane — eksport jednym kliknięciem, zawsze" i "Żadna platforma nie może Ci ich zabrać")
- Cytat na dole: "Nie budujesz na cudzej ziemi. Budujesz własny dom." — zostaje

### Zmiany w plikach

| Plik | Co |
|------|----|
| `src/components/landing/OwnYourClientsSection.tsx` | Rozbudowa copy: wchłonięcie najlepszych zdań z DataOwnership, mocniejsze bullet points w kartach |
| `src/pages/Index.tsx` | Usunięcie `<DataOwnershipSection />` (linia 44) i importu (linia 11) |

Dwa pliki. Treść DataOwnership nie ginie — najlepsze fragmenty trafiają do OwnYourClientsSection.


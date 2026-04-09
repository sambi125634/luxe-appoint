

## Plan: Przebudowa cennika — 3 pakiety płatne + formularz kontaktowy

### Obecny stan
Cennik ma plan FREE (0 zł), PRO (99 zł netto), ELITE (349 zł). Zawiera nieaktualne limity, „netto" przy cenie, i przycisk „Zacznij za darmo". Brak formularza kontaktowego pod cennikiem.

### Nowe 3 pakiety

| | STARTER (19 zł/mies) | PRO (99 zł/mies) | ELITE (349 zł/mies + 497 zł onboarding) |
|---|---|---|---|
| **Opis** | Dla jednoosobowych salonów, które chcą porządek w rezerwacjach | Pełna platforma dla salonów, które chcą rosnąć | System, który pracuje za Ciebie 24/7 |
| **Pracownicy** | Max 1 | Nieograniczeni | Nieograniczeni |
| **Klientki** | Max 100 | Nieograniczone | Nieograniczone |
| **Usługi** | Max 21 | Nieograniczone | Nieograniczone |
| **Produkty** | Max 21 | Nieograniczony magazyn | Nieograniczony magazyn |
| **Powiadomienia** | Email + SMS | Email + SMS | Email + SMS |
| **Kalendarz + Widget** | ✅ | ✅ | ✅ |
| **Podstawowe statystyki** | ✅ | ✅ | ✅ |
| **Aplikacja mobilna** | — | ✅ (właściciel + klientka) | ✅ |
| **Ścieżka Klientki™** | — | ✅ (ręczna konfiguracja) | ✅ (skonfigurowana za Ciebie) |
| **Program poleceń** | — | ✅ | ✅ |
| **Karty konsultacyjne** | — | ✅ | ✅ |
| **Eksport + raporty finansowe** | — | ✅ | ✅ |
| **Receptury + True Profit** | — | ✅ | ✅ |
| **Skanowanie kodów** | — | ✅ | ✅ |
| **AI Autopilot** | — | — | ✅ (wykrywa, wysyła, reaguje) |
| **AI Segmentacja klientek** | — | — | ✅ automatyczna |
| **AI Prognoza przychodów** | — | — | ✅ (30 dni) |
| **Radar Odejść** | — | — | ✅ |
| **AI sugestie terminów** | — | — | ✅ |
| **Onboarding 1:1** | — | — | ✅ prywatny call |
| **Konfiguracja sekwencji** | — | — | ✅ zrobiona za Ciebie |
| **Konsultacja strategiczna** | — | — | ✅ sesja dot. biznesu |
| **Sprawdzone metody pozyskiwania** | — | — | ✅ organik + paid |
| **Priorytetowy support** | — | — | ✅ odpowiedź w 2h |

**Ceny roczne (toggle -20%):** STARTER 15 zł, PRO 79 zł, ELITE 279 zł

**CTA przyciski:** Wszystkie 3 → tymczasowo prowadzą do `/auth` (rejestracja). Gdy zdecydujesz się na bramkę płatniczą, podmienimy na checkout.

### Formularz kontaktowy pod cennikiem

Pod sekcją „0% prowizji" dodamy nowy blok:
- Headline: „Nie wiesz, który plan wybrać?"
- Subheadline: „Zostaw dane — odezwiemy się i pomożemy dobrać najlepszy pakiet dla Twojego salonu."
- Pola: Imię, Email, Telefon + checkbox RODO
- Dane zapisywane do istniejącej tabeli `leads` w bazie (RLS już skonfigurowane)
- Po wysłaniu: komunikat potwierdzający

### Zmiany w copy sekcji

- Headline: „Prosta cena. Zero prowizji." → bez zmian (dobry)
- Subheadline: zmiana z „Zacznij za darmo..." na „Wybierz plan dopasowany do Twojego salonu. Żadnych ukrytych opłat."
- Usunięcie „netto" z cen

### Pliki do edycji

| Plik | Co |
|---|---|
| `src/components/landing/PricingSection.tsx` | Nowe 3 pakiety, zaktualizowane ceny/limity/features, formularz kontaktowy na dole |

### Bez zmian
- Layout 3-kolumnowy kart
- Toggle miesięcznie/rocznie
- Animacje framer-motion
- Badge „Najpopularniejszy" na PRO
- Sekcja „0% prowizji"




## Plan: Quiz-kalkulator zamiast sliderów w ProblemSection

### Koncept
Zastąpienie obecnego kalkulatora sliderowego 3-krokowym quizem z przyciskami wyboru. Pain cards na górze zostają bez zmian. Kalkulator poniżej zmienia się w interaktywny quiz.

### Mechanika quizu

**Krok 1:** "Ile klientek odwiedziło Twój salon w ostatnim roku?"
- Przyciski: `do 50` (wartość: 40) / `50–150` (100) / `150–300` (225) / `300+` (350)

**Krok 2:** "Ile z nich wróciło więcej niż raz?"
- Przyciski: `mniej niż 30%` / `30–50%` / `50–70%` / `ponad 70%`

**Krok 3:** "Jak często klientka nie stawiła się bez odwołania?"
- Przyciski: `rzadko` (1/mies) / `1–2× mies` / `3–5× mies` / `więcej` (7/mies)

**Logika wyniku:**
- Utracone klientki = total × (1 - retentionRate) × avgVisitValue(200zł) × 12
- No-show straty = noShowFreq × 280zł × 12
- Łączna strata roczna = suma

**Porównania kontekstowe** (pod wynikiem):
- `X` rat kredytowych (rata = 1 500 zł)
- `Y` wakacyjnych wyjazdów (wyjazd = 4 000 zł)
- `Z` miesięcy spokoju finansowego

### UI/UX

- Progres: 3 kropki/kreski na górze quizu pokazujące aktualny krok
- Każdy krok z animacją `framer-motion` (fade + slide)
- Przyciski: duże, `rounded-xl`, hover z `border-primary`, po kliknięciu `bg-primary text-white`
- Po wybraniu odpowiedzi — automatyczne przejście do następnego kroku (300ms delay)
- Wynik: animowany CountUp, duża czerwona kwota, porównania poniżej
- Przycisk "Wróć" na krokach 2-3
- CTA na końcu: "Odzyskaj te pieniądze — zacznij za darmo"

### Zmiany techniczne

| Plik | Co |
|------|----|
| `ProblemSection.tsx` | Usunięcie sliderów, dodanie stanu quizu (`step`, `answers`), 3 ekrany pytań z przyciskami, ekran wyniku z obliczeniami i porównaniami. Pain cards zostają. |

Jeden plik do edycji — cała zmiana w `ProblemSection.tsx`.


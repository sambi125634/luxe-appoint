

## Analiza: Scraping Booksy — co działa, co nie, i jak to ulepszyć

### Diagnoza problemu

Po przetestowaniu systemu na żywo, oto wyniki:

1. **Firecrawl DZIAŁA z Booksy** — aktywne profile salonów są scrapowane poprawnie. Testowałem na "Baber Barbershop Skawina" — system wyciągnął 20 usług z dokładnymi cenami, kategoriami i czasami trwania.

2. **Problem: nieaktywne/błędne URL** — gdy salon został zamknięty lub URL jest niepoprawny, Booksy pokazuje stronę "Ten biznes nie jest już dostępny", a AI poprawnie raportuje brak usług. To nie jest bug — to prawidłowe zachowanie.

3. **Booksy NIE blokuje scrapingu** — pomimo że na stronie nie da się kopiować tekstu kursorem (CSS `user-select: none`), Firecrawl renderuje stronę w headless browser i wyciąga pełny markdown (2168 linii dla aktywnego salonu).

### Co można ulepszyć

Obecny system działa, ale ma kilka słabych punktów:

| Problem | Rozwiązanie |
|---------|-------------|
| Brak walidacji URL przed skanowaniem | Sprawdzać czy URL prowadzi do aktywnego salonu |
| Brak informacji zwrotnej o błędnym URL | Wyświetlać konkretny komunikat "Ten salon nie istnieje na Booksy" |
| Format URL Booksy nie jest walidowany | Dodać regex sprawdzający pattern `booksy.com/pl-pl/{id}_{slug}` |
| Godziny otwarcia nie są scrapowane | Booksy je ukrywa — trzeba dodać `waitFor` dłuższy lub użyć screenshota |
| Fallback na generowanie danych bez informowania usera | Jasno powiedzieć "nie udało się zescrapować, generuję szablon" |

### Plan zmian (3 pliki)

**1. `supabase/functions/ai-profile-scanner/index.ts`**
- Dodać wstępną walidację URL (fetch HEAD → sprawdzić czy nie 404/redirect do strony "nie istnieje")
- Zwiększyć `waitFor` z 3000 do 5000ms (Booksy ładuje usługi dynamicznie)
- Dodać format `screenshot` jako fallback gdy markdown jest pusty/krótki
- Gdy scraped content zawiera "Ten biznes nie jest już dostępny" — zwrócić jasny error zamiast pustych danych
- Lepszy system prompt dla AI: wyraźnie odróżniać "znaleziono usługi" vs "strona pusta"

**2. `src/pages/OnboardingPage.tsx`**
- Dodać walidację formatu URL Booksy (regex: `booksy.com/pl-pl/\d+_`)
- Lepsze komunikaty błędów: "Ten salon nie istnieje na Booksy" vs "Nie udało się połączyć"
- Dodać przycisk "Spróbuj ponownie" po błędzie zamiast auto-skip
- Hint pod polem URL: "Wklej link do profilu salonu z Booksy, np. booksy.com/pl-pl/12345_nazwa-salonu..."

**3. Brak zmian w Firecrawl** — działa poprawnie, nie wymaga modyfikacji.

### Podsumowanie

Scraping Booksy **działa** — problem leżał prawdopodobnie w podaniu URL do nieaktywnego salonu. Zmiany skupią się na: (1) lepszej walidacji URL, (2) czytelnych komunikatach błędów, (3) opcji retry zamiast auto-skip.


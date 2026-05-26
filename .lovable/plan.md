## Cel
Dokończyć dwa zadania z poprzedniej sesji, aby uprościć tworzenie widgetów i usług w panelu admin.

## Zakres

### 1. Quick Widget Create Modal
Nowy uproszczony modal do szybkiego tworzenia widgetu kampanii (3 kroki zamiast pełnego edytora):

- **Krok 1 – Nazwa kampanii** (np. "Promocja walentynkowa", "Reels Instagram – luty")
- **Krok 2 – Usługi + promocja**
  - Multi-select z listy realnych usług salonu (`useServices`)
  - Opcjonalny rabat % lub kwota
  - Opcjonalna data ważności promocji
- **Krok 3 – Branding skrótowy**
  - Kolor akcentu (color picker, domyślnie z głównego widgetu salonu)
  - Tekst CTA (domyślnie "Zarezerwuj termin")
  - Podgląd przycisku na żywo

Po zapisie: utworzenie wpisu w `widgets` z domyślami skopiowanymi z głównego widgetu salonu, redirect do listy widgetów z toastem sukcesu i przyciskiem "Edytuj zaawansowane" (otwiera pełny `WidgetEditor`).

**Pliki:**
- nowy: `src/components/admin/widgets/QuickWidgetCreateModal.tsx`
- edycja: `src/components/admin/widgets/WidgetsManagement.tsx` — przycisk "Utwórz nowy widget" otwiera Quick Modal zamiast od razu pełnego edytora; pełny edytor dostępny przez "Edytuj zaawansowane"

### 2. Quick Service Add
Podział obecnego dialogu usługi na dwa tryby:

- **Tryb szybki (domyślny):** tylko 4 pola — nazwa, kategoria, cena, czas trwania. Przycisk "Zapisz" → utworzenie usługi, toast, zamknięcie.
- **Tryb pełny (rozwijany):** "Dodaj szczegóły" pokazuje pozostałe pola (opis, zdjęcia, recipe materiałów, prepayment, warianty itd.) — czyli obecny pełny formularz.

**Pliki:**
- edycja: `src/components/admin/ServicesManagement.tsx` — refaktor dialogu dodawania usługi na sekcję "Szybko" + collapsible "Szczegóły"

### 3. Weryfikacja listy usług (75 vs ~10)
Sprawdzić w `ServicesManagement.tsx` filtry domyślne listy (np. ukrywanie nieaktywnych, filtr po kategorii, paginacja) — jeśli zawęża widoczność, dodać clear filtra "Pokaż wszystkie (75)" + licznik na górze listy.

## Co NIE wchodzi w zakres
- Zmiany w schemacie bazy (nie są potrzebne — wszystko mieści się w istniejących tabelach `widgets` i `services`)
- Refaktor pełnego `WidgetEditor` (zostaje jako tryb zaawansowany)
- Zmiany w onboardingu/tutorialu (zrobione w poprzednich krokach)

## Kryteria sukcesu
- Tworzenie nowej kampanii-widgetu zajmuje <60 sekund od kliknięcia "Nowy widget"
- Dodanie nowej usługi w trybie szybkim zajmuje <30 sekund
- Lista usług pokazuje wszystkie zaimportowane pozycje (lub jasny komunikat ile jest ukrytych przez filtr)
- Zero regresji w pełnym `WidgetEditor` i pełnym formularzu usługi

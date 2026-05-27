## Diagnoza

Na zrzucie ekranu widać pełny **WidgetEditor** (zakładka „Usługi"), a nie szybki kreator (`QuickWidgetCreateModal`), który już w poprzedniej iteracji dostał grupowanie + wyszukiwarkę. To dlatego nie widać efektów aktualizacji — to dwa różne komponenty.

Lista usług w `WidgetEditor.tsx` (linie 398–431) to płaska siatka checkboxów, bez kategorii, bez wyszukiwarki, bez „Zaznacz wszystkie z kategorii". Limit „pokazuje się tylko kilka" nie wynika z zapytania (`useServices` pobiera wszystkie usługi salonu bez limitu) — po prostu w nowym koncie po onboardingu jest ~9 pozycji startowych. Aby przy 100+ usługach interfejs nadal był wygodny, musi mieć ten sam wzorzec co szybki kreator.

## Zakres zmian

### 1. Wspólny komponent `WidgetServiceSelector`
Nowy plik `src/components/admin/widgets/WidgetServiceSelector.tsx` — wyciągam logikę z `QuickWidgetCreateModal` (sekcje rozwijane po kategoriach, wyszukiwarka, „Zaznacz wszystkie" per kategoria, licznik wybranych, „Rozwiń/Zwiń wszystkie"). Komponent przyjmuje:
- `services`, `categories` (już znormalizowane)
- `selectedIds: string[]` + `onChange(ids: string[])`
- `showAllServices: boolean` + `onShowAllChange`

Dzięki temu `QuickWidgetCreateModal` i `WidgetEditor` korzystają z tego samego UI — jeden punkt prawdy, spójny customer journey.

### 2. Refaktor `WidgetEditor.tsx`, zakładka „Usługi"
Zastąpienie obecnego płaskiego `grid` (linie 383–433) wywołaniem `<WidgetServiceSelector />`. Zachowuję istniejące `formData.showAllServices`, `formData.services` i `toggleService`.

### 3. Usprawnienia UX (customer-friendly, jak prosił użytkownik)
- **Sticky podsumowanie** na górze listy: „Wybrano X z Y" + przycisk „Wyczyść wybór".
- **Auto-rozwinięcie kategorii** zawierających wybrane usługi przy otwarciu istniejącego widgetu (żeby od razu było widać co jest aktywne).
- **Quick pick** — chip-rząd z kategoriami nad listą: kliknięcie chipa zaznacza całą kategorię (skrót zamiast rozwijania).
- **Sortowanie kategorii** wg `sort_order` (już pobierane w `useServiceCategories`), usługi alfabetycznie w obrębie kategorii.
- **Empty state z CTA**: jeśli `realServices.length === 0`, pokażę link „Dodaj usługi w katalogu" prowadzący do zakładki Usługi w panelu (zamiast suchego komunikatu).
- **Wskaźnik widoczności w podglądzie** — drobny tekst „Te X usług pojawi się w widgecie" tuż nad listą podglądu po prawej, żeby właściciel od razu widział, co zobaczy klientka.

### 4. Czego NIE ruszam
- Nie zmieniam schematu danych, RLS ani logiki bookingu.
- Nie ruszam pozostałych zakładek `WidgetEditor` (Kroki, Formularz, Wygląd, Płatności, Promocja, Zaawansowane, Analityka) — tylko zakładkę „Usługi".
- `QuickWidgetCreateModal` po wyciągnięciu logiki działa dokładnie tak samo (refactor bez zmiany funkcjonalności).

## Pliki

- nowy: `src/components/admin/widgets/WidgetServiceSelector.tsx`
- edycja: `src/components/admin/widgets/WidgetEditor.tsx` (tylko sekcja `activeTab === "services"`)
- edycja: `src/components/admin/widgets/QuickWidgetCreateModal.tsx` (podmiana wewnętrznej listy na wspólny komponent — bez zmian wizualnych)

## Efekt dla użytkownika

Niezależnie od tego, czy zakłada widget przez szybki kreator, czy edytuje istniejący w pełnym edytorze — ten sam, prosty interfejs: szukaj, rozwiń kategorię, zaznacz całą kategorię jednym kliknięciem albo wybierz pojedyncze pozycje. Skaluje się do 100+ usług bez przewijania długiej listy.

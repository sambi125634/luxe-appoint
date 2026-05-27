# Plan

## Cel
Naprawić dwa problemy w panelu admina po aktywacji konta:
1. kreator nowego widgetu ma pokazywać pełną listę usług, nie tylko ok. 10,
2. analityka i dashboard mają pokazywać wyłącznie dane z danego konta albo pusty stan — bez liczb demo.

## Co zrobię

### 1. Uporządkuję wybór usług w szybkim kreatorze widgetu
- Przebuduję krok wyboru usług w `QuickWidgetCreateModal.tsx` tak, aby zamiast płaskiej krótkiej listy pokazywał pełny katalog usług z konta.
- Zgrupuję usługi kategoriami z możliwością rozwijania/zamykania sekcji.
- Dodam licznik usług w kategorii oraz licznik zaznaczonych usług.
- Zachowam wyszukiwarkę, ale będzie filtrować po całej liście, nie tylko po widocznym fragmencie.
- Upewnię się, że stan `Pokaż wszystkie usługi` nadal działa poprawnie, ale tryb ręcznego wyboru pokaże wszystkie rekordy dostępne dla salonu.
- Sprawdzę też pełny `WidgetEditor`, żeby selekcja usług była spójna także tam, jeśli ten sam problem występuje w edycji zaawansowanej.

### 2. Zweryfikuję źródło limitu 10 usług
- Sprawdzę, czy problem wynika z samego UI, czy z danych pobieranych do selektora.
- Jeśli potrzeba, poprawię hooki lub zapytania tak, by nie ucinały listy usług dla realnego salonu.
- Jeśli limit nie jest w query, usunę ograniczenie renderowania po stronie komponentu i zachowam wydajny układ z kategoriami.

### 3. Odetnę demo liczby od realnego dashboardu admina
- Przejrzę komponenty dashboardu, które wcześniej miały demo/fallback metryki, i zostawię demo tylko dla trybu `isDemo`.
- W realnym koncie każdy widget ma działać w jednym z dwóch stanów:
  - pokazuje prawdziwe dane z konta,
  - albo pokazuje pusty/zerowy stan, jeśli konto nie ma jeszcze danych.
- Szczególnie sprawdzę `DashboardHome.tsx` oraz karty analityczne i retencyjne, bo tam są fallbacki i wcześniejsze demo struktury.

### 4. Dopilnuję pustych stanów zamiast sztucznych wartości
- Dla nowych kont, gdzie nie ma jeszcze historii, pozostawię czytelne puste stany zamiast przykładowych KPI.
- Tam, gdzie dziś są liczby oparte o demo lub „bezpieczne przykłady”, zastąpię je zerem, brakiem danych albo komunikatem startowym — zależnie od kontekstu komponentu.

## Zakres plików
Prawdopodobnie obejmie to:
- `src/components/admin/widgets/QuickWidgetCreateModal.tsx`
- `src/components/admin/widgets/WidgetEditor.tsx`
- `src/components/admin/DashboardHome.tsx`
- ewentualnie powiązane komponenty dashboardu/analityki, jeśli to one jeszcze wyświetlają demo fallbacki
- ewentualnie hooki analityczne tylko wtedy, gdy to w nich siedzi fallback dla realnych kont

## Ważne ustalenia z analizy
- Lista usług w szybkim kreatorze jest dziś pobierana z `useServices()` i filtrowana lokalnie, więc problem wygląda na ograniczenie prezentacji albo dodatkowe miejsce w przepływie, które jeszcze trzeba wyrównać.
- Dashboard ma wyraźny rozdział `isDemo` vs real data, ale w kilku miejscach są historyczne fallbacki/demo struktury, więc poprawka będzie polegała na domknięciu tych warunków i pustych stanów dla nowych kont.
- W retencji jest dodatkowo limit `.limit(100)`, który nie jest źródłem problemu 10 usług, ale może wpływać na pełnię danych w niektórych modułach analitycznych — ruszę go tylko jeśli okaże się częścią zgłoszonego problemu.

## Efekt końcowy
- Przy tworzeniu widgetu promocyjnego zobaczysz wszystkie usługi z konta, pogrupowane kategoriami i wygodne do zaznaczania.
- W realnym panelu admina nie będzie już liczb demo po aktywacji i onboardingu.
- Nowe konto pokaże tylko własne dane albo pusty stan, dopóki nie pojawią się prawdziwe akcje i wyniki.

## Techniczne szczegóły
- Bez zmian schematu bazy, jeśli nie okaże się to konieczne.
- Bez ruszania demo route — demo pozostanie tylko tam, gdzie `isDemo === true`.
- Bez dodawania nowych funkcji ponad to zgłoszenie: tylko pełny wybór usług i usunięcie demo metryk z realnego admina.
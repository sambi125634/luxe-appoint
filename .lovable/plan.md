

# Plan: Rozbudowa kontekstowej pomocy w każdej zakładce

## Co robimy

1. **Usuwamy** `VideoTutorialCard` i `VoiceGuidanceButton` ze wszystkich modułów (13 plików) oraz z `GuidedTour` (admin + demo)
2. **Rozbudowujemy** baner kontekstowy ("Co to dla Ciebie oznacza?") — obecnie istnieje jako `DemoBenefitBanner` tylko w demo. Tworzymy nowy uniwersalny komponent `SectionGuide` używany zarówno w demo, jak i w panelu admina
3. **Dodajemy auto-tutorial per zakładka** — przy pierwszym wejściu w daną zakładkę wyświetla się rozwinięty poradnik z krokami "jak to zrobić". Po zamknięciu zapisuje się w `localStorage` i przy kolejnych wejściach pokazuje się w wersji zwiniętej (możliwość ponownego rozwinięcia)

## Nowy komponent `SectionGuide`

Każda zakładka dostanie baner z trzema sekcjami:
- **Co tu zrobisz** — 1-2 zdania wyjaśniające cel modułu
- **Jak to zrobić krok po kroku** — numerowana lista 3-5 kroków
- **Jaki problem to rozwiązuje** — bezpośrednie odniesienie do pain pointów (np. "Koniec z chaosem w zeszytach", "Nigdy więcej pustych slotów")

Baner będzie:
- Automatycznie rozwinięty przy pierwszej wizycie w zakładce
- Zwinięty z przyciskiem "Pokaż poradnik" przy kolejnych wizytach
- Animowany (fade-in, collapsible)
- Używany i w demo, i w panelu admina (bez duplikacji)

## Zakres zmian

### Nowe pliki
- `src/components/admin/SectionGuide.tsx` — uniwersalny komponent z logiką localStorage per zakładka

### Edytowane pliki (usunięcie VideoTutorialCard + dodanie SectionGuide)
- `DashboardHome.tsx`
- `ScheduleManagement.tsx`
- `ClientsManagement.tsx`
- `ServicesManagement.tsx`
- `StaffManagement.tsx`
- `TimeOffManagement.tsx`
- `WidgetsManagement.tsx`
- `ConversationsModule.tsx`
- `PipelineModule.tsx`
- `AccountingModule.tsx`
- `ProductsModule.tsx`
- `SettingsModule.tsx`
- `SupportModule.tsx`

### Edytowane pliki (usunięcie VoiceGuidanceButton)
- `GuidedTour.tsx` (admin) — usunięcie voice, zachowanie reszty turu
- `GuidedTour.tsx` (demo) — usunięcie voice

### Pliki do usunięcia (opcjonalnie zachowane ale nieużywane)
- `VideoTutorialCard.tsx` — usunięcie importów ze wszystkich modułów
- `VoiceGuidanceButton.tsx` — usunięcie importów ze wszystkich modułów
- `DemoBenefitBanner.tsx` — zastąpiony przez `SectionGuide`

### DemoPage.tsx
- Zamiana `DemoBenefitBanner` na `SectionGuide`

## Przykład treści dla zakładki "Kalendarz"

```text
📋 Co tu zrobisz:
Zarządzasz wizytami całego salonu w jednym miejscu — widzisz grafik 
każdego pracownika, dodajesz i edytujesz wizyty jednym kliknięciem.

🔢 Jak to zrobić:
1. Upewnij się, że masz dodanych pracowników i ustawione godziny pracy
2. Kliknij w wolny slot w kalendarzu, aby dodać wizytę
3. Wybierz klientkę, usługę i pracownika
4. Wizyta pojawi się w kalendarzu z kolorem przypisanym do pracownika
5. Udostępnij widget — klientki będą rezerwować same 24/7

💡 Jaki problem to rozwiązuje:
Koniec z papierowymi kalendarzami i chaosem przy telefonie 
podczas zabiegu. Klientki rezerwują same, nawet o 23:00.
```

## Liczba zmian
~18 plików edytowanych, 1 nowy komponent. Treści po polsku, skupione na pain pointach i konkretnych krokach.


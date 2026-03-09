

# Plan: Naprawienie podwójnego poradnika, dodanie wizyt demo i wzmocnienie Asystenta

## Problemy do rozwiązania

1. **Podwójny SectionGuide** — `DemoPage.tsx` renderuje `<SectionGuide>` przed każdym modułem (linia 109), a moduły (np. `ScheduleManagement`, `ClientsManagement` itd.) też renderują własny `<SectionGuide>` wewnętrznie. Efekt: dwa identyczne poradniki.

2. **Brak wizyt demo w kalendarzu** — wizyty mockowe istnieją (5 sztuk), ale `getAppointmentsForSlot()` filtruje tylko po godzinie, nie po dniu tygodnia. Wszystkie wizyty lądują w tym samym slicie albo nie pojawiają się, bo nie pasują do aktualnego dnia. Trzeba rozłożyć wizyty na różne dni bieżącego tygodnia.

3. **Asystent grafiku bez wyjaśnienia wartości** — zakładka "Asystent" w kalendarzu (SmartScheduleHelpers) wyświetla dane, ale nie tłumaczy użytkownikowi, dlaczego to jest przełomowe i ile pieniędzy może zyskać.

## Zmiany

### 1. Usunięcie duplikatu SectionGuide z DemoPage.tsx
- Usunąć `<SectionGuide sectionKey={benefitKey} />` z `renderContent()` w `DemoPage.tsx` (linia 109)
- Moduły same renderują swój SectionGuide — to wystarczy

### 2. Rozłożenie wizyt demo na dni tygodnia w WeeklyCalendar.tsx
- Dodać pole `dayOffset` do `mockAppointments` (np. 0 = poniedziałek, 1 = wtorek itd.)
- Zmienić `getAppointmentsForSlot(dayIndex, hour)` aby filtrować po dniu i godzinie
- Dodać więcej wizyt demo (8-10) rozłożonych na cały tydzień, z różnymi statusami i pracownikami — żeby kalendarz wyglądał "żywy"

### 3. Wzmocnienie opisu Asystenta w SmartScheduleHelpers.tsx
- Dodać baner wartości nad tabami: "Ten moduł analizuje Twój grafik i pokazuje, gdzie tracisz pieniądze — puste sloty, niskie obłożenie, nieoptymalne rozkładanie wizyt. Salony odzyskują średnio 15-25% obłożenia dzięki inteligentnym rekomendacjom."
- Dodać krótkie opisy pod każdym tabem (Luki, Obłożenie, Polecane, Szukaj) wyjaśniające biznesową wartość

### Pliki do edycji
- `src/pages/DemoPage.tsx` — usunięcie duplikatu SectionGuide
- `src/components/admin/WeeklyCalendar.tsx` — rozłożenie wizyt na dni, poprawa filtrowania
- `src/components/admin/schedule/SmartScheduleHelpers.tsx` — dodanie sekcji wyjaśniającej wartość


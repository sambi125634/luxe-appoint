
Cel: naprawić problem „Import CSV nie jest widoczny” tak, żeby opcja była od razu widoczna bez szukania/scrolla, oraz spełnić wymaganie „CSV lub inny format”.

1) Diagnoza (na podstawie kodu i zrzutu)
- Przycisk „Import CSV” jest w kodzie (`ClientsManagement.tsx`) w 2 miejscach, ale w stanie pustej listy jest nisko (pod dużym `SectionGuide` + `py-16`), więc na części ekranów wpada „below the fold”.
- Efekt dla użytkownika: komunikat „Brak klientów” widać, ale CTA importu nie.

2) Zmiany UX (żeby było natychmiast widoczne)
- W `ClientsManagement.tsx` dodać stały, górny pasek akcji w module Klienci (zawsze widoczny):
  - „Dodaj klienta”
  - „Importuj plik”
- W empty-state:
  - zmniejszyć pionowy odstęp (`py-16` -> mniejszy),
  - przenieść/przedublować CTA importu nad opisem,
  - dodać wyraźną kartę „Przeciągnij plik tutaj” (dropzone), nie tylko sam przycisk.

3) Zmiany funkcjonalne importu
- Rozszerzyć `ClientCSVImport.tsx`:
  - akceptacja plików: `.csv, .xlsx, .xls`,
  - wspólny preview + mapowanie nagłówków jak dziś,
  - dla XLSX: odczyt pierwszego arkusza i konwersja do takiej samej struktury jak CSV.
- Jeśli plik nieobsługiwany: jasny toast z listą wspieranych formatów.

4) Pliki do modyfikacji
- `src/components/admin/ClientsManagement.tsx`
  - nowy, zawsze widoczny action bar + poprawa empty-state + inline dropzone CTA.
- `src/components/admin/clients/ClientCSVImport.tsx`
  - obsługa wielu formatów i wejście z dropzone.
- `package.json` (jeśli potrzebna biblioteka do XLSX, np. `xlsx`).

5) Kryteria akceptacji
- W zakładce Klienci (brak klientów): bez scrolla widać „Importuj plik”.
- Można:
  - kliknąć import,
  - przeciągnąć plik na dropzone,
  - zaimportować CSV i XLSX.
- Template działa jak dotąd i poprawnie mapuje pola CRM (imię, nazwisko, telefon, email, notatki, tagi, zgody).
- Import kończy się utworzeniem kontaktów widocznych od razu na liście.

Sekcja techniczna
- Zachowuję istniejący pipeline walidacji/mapowania (`HEADER_MAP`, wymagane pola, tagi przez `;`), rozszerzam tylko źródło danych (CSV/XLSX).
- Nie zmieniam backendu ani schematu bazy — import nadal używa obecnego hooka tworzenia klienta.

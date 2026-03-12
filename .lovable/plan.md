

# Plan: Przeprojektowanie kalendarza — widok kolumnowy per pracownik

## Problem
Obecny kalendarz to siatka tydzień × godzina. Gdy kilka pracownic ma wizyty o tej samej godzinie, bloczki się nakładają w jednej komórce — właścicielka nie widzi kto co robi. Brakuje czytelnego podziału na pracowników.

## Proponowane rozwiązanie: Widok dzienny z kolumnami per pracownik

To jest **standard branżowy** — tak działają Fresha, Booksy, Calendesk. Oś Y = godziny (8:00–20:00), każda kolumna = jeden pracownik. Wizyty jako kolorowe bloki o wysokości proporcjonalnej do czasu trwania.

```text
         │  Maria N.    │  Karolina W.  │  Joanna L.   │  Anna K.     │
─────────┼──────────────┼───────────────┼──────────────┼──────────────┤
  09:00  │ ┌──────────┐ │               │ ┌──────────┐ │              │
         │ │Anna K.   │ │               │ │Magda W.  │ │              │
         │ │Peeling   │ │               │ │Masaż     │ │              │
  09:30  │ │60 min    │ │               │ │90 min    │ │              │
         │ └──────────┘ │               │ │          │ │              │
  10:00  │              │ ┌───────────┐ │ │          │ │ ┌──────────┐ │
         │              │ │Joanna N.  │ │ └──────────┘ │ │Monika W. │ │
         │              │ │Brwi 45min │ │              │ │Peeling   │ │
  10:30  │              │ └───────────┘ │              │ │60 min    │ │
         │              │               │              │ └──────────┘ │
```

### Kluczowe cechy:
- **Przełącznik widoków**: Dzień (kolumny per staff) ↔ Tydzień (obecna siatka, ulepszona)
- **Bloki proporcjonalne**: wizyta 90 min = 3× wysokość slotu 30-minutowego
- **Kolory per pracownik**: kolorowy nagłówek kolumny + pasek boczny bloku
- **Hover/click**: tooltip z detalami (klient, telefon, usługa, cena)
- **Linia "teraz"**: czerwona linia pozioma na bieżącej godzinie
- **Drag & drop**: przeciąganie wizyt między kolumnami (= zmiana pracownika)
- **Siatka 30 min**: drobniejsza granulacja niż obecne 60 min

### Pliki do zmiany/utworzenia

| Plik | Akcja |
|------|-------|
| `src/components/admin/calendar/DayColumnView.tsx` | **Nowy** — główny widok dzienny ze staff columns |
| `src/components/admin/calendar/AppointmentBlock.tsx` | **Nowy** — blok wizyty z proporcjonalną wysokością |
| `src/components/admin/calendar/NowLine.tsx` | **Nowy** — czerwona linia bieżącej godziny |
| `src/components/admin/WeeklyCalendar.tsx` | Dodać przełącznik Dzień/Tydzień, zintegrować DayColumnView |

Mock data w demo zostanie rozszerzona o więcej nakładających się wizyt, żeby efekt był widoczny od razu.




# Plan: Dopracowanie modułu Konsultacje

## Zidentyfikowane problemy

1. **Brak SectionGuide** — moduł nie ma poradnika, w przeciwieństwie do innych sekcji
2. **Demo Cards: formularz się nie otwiera** — po kliknięciu "Nowa karta" dropdown szablonów ma 1 pozycję z pustymi polami (`fields: []`), więc formularz nigdy się nie pojawia
3. **Kolejność zakładek jest nieintuicyjna** — "Karty" są pierwsze, ale żeby wypełnić kartę, trzeba najpierw mieć szablon. Użytkownik nie wie od czego zacząć
4. **Brak podpowiedzi kontekstowych** — przyciski "Nowa karta konsultacyjna" nie mówią co się stanie dalej
5. **Duplikacja w demo** — CardBuilder pokazuje "Gotowe szablony (1 klik)" i poniżej "Twoje szablony" z identyczną listą

## Zmiany

### 1. SectionGuide — dodać konfigurację `consultation` w `SectionGuide.tsx`
- Cel: "Twórz cyfrowe karty konsultacyjne, zbieraj podpisy RODO i nagrywaj notatki głosowe"
- Kroki: Wdróż gotowy szablon → Wypełnij kartę dla klientki → Nagraj notatkę głosową
- Pain point: eliminacja papierowej dokumentacji

### 2. ConsultationModule.tsx — dodać SectionGuide + zmienić kolejność zakładek
- Nowa kolejność: **Szablony → Karty → Notatki głosowe** (logiczny flow: stwórz szablon → wypełnij kartę → nagraj notatkę)
- Dodać `<SectionGuide sectionKey="consultation" />` nad tabami

### 3. ClientConsultations.tsx — naprawić demo mode
- Dostarczyć pełne demo szablony (z polami!) do dropdowna, żeby formularz faktycznie się otworzył
- Dodać hint pod przyciskiem "Nowa karta": "Wybierz klientkę i szablon, aby wypełnić kartę konsultacyjną"
- Lepszy empty state z kierunkiem do zakładki Szablony

### 4. CardBuilder.tsx — wyczyścić demo
- W demo: ukryć sekcję "Twoje szablony" (bo to duplikacja "Gotowych szablonów")
- Dodać krótki opis nad sekcją "Gotowe szablony": "Kliknij aby wdrożyć — szablon pojawi się w zakładce Karty"
- Dodać hint przy builderze: "Lub stwórz własny szablon od zera"

### 5. VoiceNoteRecorder.tsx — drobne poprawki UX
- Dodać hint pod recorderem: "Nagraj max 2 min. AI automatycznie wyciągnie produkty, tagi i sugestie wizyt"
- W demo: auto-wybrać pierwszą klientkę, żeby nie blokować flow

## Pliki do zmiany

| Plik | Zmiana |
|------|--------|
| `src/components/admin/SectionGuide.tsx` | Dodać konfigurację `consultation` |
| `src/modules/consultation/ConsultationModule.tsx` | Dodać SectionGuide, zmienić kolejność tabów |
| `src/modules/consultation/ClientConsultations.tsx` | Naprawić demo templates z polami, lepsze hinty |
| `src/modules/consultation/CardBuilder.tsx` | Ukryć duplikację w demo, dodać opisy |
| `src/modules/consultation/VoiceNoteRecorder.tsx` | Hinty, auto-select klientki w demo |


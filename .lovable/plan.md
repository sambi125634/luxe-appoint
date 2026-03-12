

# Plan: Rozbudowa modułu Usługi — pełna funkcjonalność i prezentacja premium

## Diagnoza obecnego stanu

Po przeanalizowaniu kodu `ServicesManagement.tsx`, `ServiceMediaUpload.tsx`, `useServices.ts` i schematu bazy danych, zidentyfikowałem następujące problemy i braki:

### Problemy funkcjonalne
| Problem | Opis |
|---------|------|
| **Benefits nie zapisywane** | Pole `benefits` istnieje w DB i hookach, ale brak go w formularzu edycji usługi |
| **Staff nie linkowany** | `staffIds` w formie, ale `saveService` nie zapisuje do tabeli `staff_services` |
| **Media jako base64** | Pliki zapisywane jako data URL zamiast uploadu do Supabase Storage — duże payloady, brak trwałości |
| **Brak potwierdzenia usuwania** | Kliknięcie "Trash" natychmiast usuwa usługę bez AlertDialog |
| **Brak usuwania kategorii** | Nie ma opcji usunięcia kategorii |
| **Brak VAT w formie** | Pole `vat_rate` w DB, niewidoczne w edycji |
| **Brak widoku showcase** | Memory mówi o grid/list toggle, ale nie ma go w obecnym kodzie |
| **Demo bez mediów** | Demo usługi mają puste `media: []` — brak wizualnego efektu |

### Braki UX
- Brak walidacji formularza (można zapisać pustą nazwę)
- Brak informacji zwrotnej o powodzeniu zapisu
- Brak podglądu "jak to zobaczy klient" w panelu admina
- Formularz jest jednym długim scrollem bez organizacji

## Proponowane zmiany

### 1. Formularz usługi — dodać brakujące pola
- **Benefits**: Tagi z inputem (jak specjalizacje w Staff) — "Dodaj korzyść" + Enter
- **VAT rate**: Select z opcjami 0% / 8% / 23% (domyślnie 23%)
- **Walidacja**: Wymagane: nazwa, czas trwania > 0, cena >= 0. Przycisk "Zapisz" nieaktywny gdy brakuje

### 2. Staff linkowanie (staff_services)
- Przy zapisie usługi: sync `staff_services` — usunąć istniejące wpisy dla tej usługi, dodać nowe na podstawie zaznaczonych pracowników
- W `useServices` dodać mutację `syncStaffServices`

### 3. Media upload do Supabase Storage
- Zamiast base64 → upload do `salon-media` bucket, ścieżka `services/{serviceId}/{filename}`
- Zapisywać w `media` jsonb: `[{id, type, url: "public_url", name}]`
- W `ServiceMediaUpload`: po wybraniu pliku → upload → zwrócić public URL

### 4. Potwierdzenie usuwania
- AlertDialog przed usunięciem usługi i kategorii
- Tekst: "Czy na pewno chcesz usunąć usługę {name}? Tej operacji nie można cofnąć."

### 5. Usuwanie kategorii
- Dodać hook `useDeleteCategory` w `useServices.ts`
- Przycisk "Usuń" w dialogu edycji kategorii
- Walidacja: ostrzeżenie jeśli kategoria ma przypisane usługi

### 6. Widok showcase (grid/list toggle)
- Przełącznik widoku: lista (obecny) vs siatka (karty jak w booking widget)
- Widok siatki: karty ze zdjęciem, nazwą, ceną, benefits chips — "podgląd oczami klienta"

### 7. Demo data z mediami i benefits
- Dodać `benefits` i `image` URLs (Unsplash) do DEMO_SERVICES
- Demo usługi wyglądają atrakcyjnie bez konieczności uploadu

### 8. Toast po sukcesie
- Po zapisie usługi/kategorii: toast "Usługa zapisana"
- Po usunięciu: toast "Usługa usunięta"

## Pliki do zmiany

| Plik | Zmiana |
|------|--------|
| `src/components/admin/ServicesManagement.tsx` | Benefits input, VAT select, walidacja, delete confirmation, showcase toggle, demo data, staff sync, toast feedback |
| `src/components/admin/ServiceMediaUpload.tsx` | Upload do Supabase Storage zamiast base64 |
| `src/hooks/useServices.ts` | Dodać `useDeleteCategory`, `useSyncStaffServices` |

Brak zmian w bazie danych — wszystkie potrzebne kolumny (`benefits`, `vat_rate`, `media`) i tabele (`staff_services`) już istnieją.


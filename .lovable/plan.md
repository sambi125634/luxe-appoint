

# Plan: Rozbudowa systemu tagów klientów

## Stan obecny
- 6 hardcoded tagów w `ClientsManagement.tsx` (linia 193-200): vip, new, regular, problematic, friday-lover, evening
- Tabela `client_tags` istnieje w bazie (id, salon_id, name, color, is_system, sort_order) ale **nie jest używana nigdzie w kodzie**
- Tagi klientów przechowywane w kolumnie `clients.tags` jako `string[]`

## Co zostanie zrobione

### 1. Seed domyślnych tagów do `client_tags` (migracja)
Dodać ~20 tagów systemowych (`is_system = true`) pogrupowanych tematycznie:

| Kategoria | Tagi |
|-----------|------|
| Status | VIP, Nowy, Stały, Problematyczny |
| Retencja | Zagrożony odejściem, Utracony, Reaktywowany |
| Wydatki | High-spender, Budżetowy |
| Rezerwacje | No-show, Last-minute, Planista, Piątek-fan, Wieczorny |
| Lojalność | Ambasador, Urodziny w tym miesiącu |
| Preferencje | Wrażliwa skóra, Alergie |
| Źródło | Instagram, Polecenie, Google |

Każdy z unikalnym kolorem. Tagi będą tworzone per salon (trigger przy tworzeniu salonu) lub wstawiane jednorazowo dla istniejących salonów.

### 2. Hook `useClientTags` — nowy plik
- Pobiera tagi z `client_tags` WHERE `salon_id`
- CRUD: dodawanie własnych tagów, edycja, usuwanie (tylko `is_system = false`)
- Zamieni hardcoded `availableTags` w `ClientsManagement.tsx`

### 3. UI zarządzania tagami — sekcja w `ClientsManagement.tsx`
- Przycisk "Zarządzaj tagami" obok filtrów → otwiera dialog/sheet
- Lista tagów: kolor (edytowalny), nazwa, system/własny badge, przycisk usuń (tylko dla własnych)
- Formularz dodawania: nazwa + kolor picker (predefiniowane kolory)
- Tagi systemowe oznaczone zamkniętą kłódką — nie można ich usunąć

### 4. Aktualizacja istniejących komponentów
- `ClientsManagement.tsx`: zamienić hardcoded `availableTags` na dane z hooka
- `ClientFilters.tsx`: bez zmian (już przyjmuje `availableTags` jako prop)
- `ClientListItem.tsx`: bez zmian (już przyjmuje `availableTags` jako prop)
- `MobileClients.tsx`: dodać tagi do widoku mobilnego (obecnie ich nie wyświetla)

### 5. Migracja bazy
Jedyna migracja: wstawienie domyślnych tagów systemowych dla każdego istniejącego salonu. Trigger `handle_new_salon` do automatycznego seedowania tagów dla nowych salonów.

### Pliki do zmiany/utworzenia

| Plik | Akcja |
|------|-------|
| `src/hooks/useClientTags.ts` | Nowy — CRUD hook na `client_tags` |
| `src/components/admin/ClientsManagement.tsx` | Zamienić hardcoded tagi na hook, dodać przycisk "Zarządzaj tagami" + dialog |
| `src/components/mobile-admin/MobileClients.tsx` | Wyświetlanie tagów przy klientach |
| Migracja SQL | Seed systemowych tagów + trigger dla nowych salonów |


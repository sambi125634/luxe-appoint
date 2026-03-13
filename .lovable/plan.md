

# Zamiana empty state w ClientsManagement.tsx

Zastąpię blok `if (!isDemo && clients.length === 0)` (linie 572-616) dokładnie kodem podanym przez użytkownika.

## Zmiany

**Plik:** `src/components/admin/ClientsManagement.tsx` (linie 572-616)

Zamiana obecnego empty state na nowy layout z:
- Górnym action barem (Importuj CSV + Dodaj klientkę)
- `SectionGuide`
- Siatką 2-kolumnową: karta importu z pliku + karta ręcznego dodawania
- Paskiem informacyjnym o imporcie z Booksy

Jedna zmiana, jeden plik.


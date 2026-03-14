
# Aktualizacja szablonu CSV w imporcie klientów

## Co robimy
Zamieniamy obecny `TEMPLATE_CSV` w `ClientCSVImport.tsx` na bogatszy przykład przesłany przez użytkownika — 10 wierszy z realistycznymi danymi (notatki o alergiach, ciąży, no-showach, tagi VIP, polecona itp.). Reszta logiki bez zmian.

## Zmiana

### `src/components/admin/clients/ClientCSVImport.tsx`
- Zastąpienie stałej `TEMPLATE_CSV` (linie 36-41) treścią z przesłanego pliku `klientki_test_import.csv`.
- Zmiana nazwy pobieranego pliku z `szablon_klienci.csv` na `przyklad_import_klientow.csv` (linia 154).
- Zmiana etykiety przycisku (linia 301) na **„Pobierz przykładowy plik CSV"**.

Jeden plik, trzy drobne edycje.

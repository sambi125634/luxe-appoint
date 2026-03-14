

# Zwiększenie limitu rozmiaru zdjęcia profilowego pracownika

## Zmiana

W pliku `src/components/admin/StaffManagement.tsx` zmienić limit z 2 MB na 10 MB:

- Linia 251: `file.size > 2 * 1024 * 1024` → `file.size > 10 * 1024 * 1024`
- Linia 252: komunikat "Maksymalny rozmiar zdjęcia to 2 MB" → "...10 MB"
- Linia 553: tekst podpowiedzi "(max 2 MB)" → "(max 10 MB)"

Jeden plik, trzy drobne zmiany tekstowe. Bucket `salon-media` jest publiczny i nie ma dodatkowych ograniczeń po stronie backendu.


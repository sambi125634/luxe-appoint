

# Plan: Rozbudowa zakładki Zespół

## Obecny stan
Karta pracownika pokazuje: inicjały (avatar bez zdjęcia), imię, stanowisko, email, telefon. Dialog edycji ma 2 taby: dane + grafik. Brak zdjęć profilowych, brak statystyk, brak dodatkowych informacji.

## Proponowane zmiany

### 1. Zdjęcia profilowe pracowników
- Dodać upload avatara w dialogu edycji (upload do `salon-media` bucket, ścieżka `staff-avatars/{staffId}`)
- Wyświetlać `AvatarImage` w karcie pracownika (fallback na inicjały jak dotychczas)
- W demo: użyć istniejących assetów (`demo-staff-maria.jpg`, `demo-staff-kasia.jpg`, `demo-staff-anna.jpg`) + placeholder dla 4. osoby

### 2. Rozbudowane karty pracowników (widok listy)
Dodać do każdej karty:
- **Wykonywane usługi** — chipsy z przypisanymi usługami (max 3 widoczne + "+N więcej")
- **Grafik skrótowo** — np. "Pon–Pt 9:00–17:00" lub "Wt–Sob 10:00–18:00" (wyliczony z workingHours)
- **Mini-statystyki demo** — "128 wizyt w tym miesiącu", "Ocena: 4.9★" (tylko w demo, w real mode ukryte lub z rzeczywistych danych)

### 3. Trzecia zakładka w dialogu: "Profil"
Dodać tab z polami:
- **Bio / Opis** — krótki tekst o specjalizacji (textarea, nowe pole `bio` w tabeli `staff_members`)
- **Specjalizacje** — tagi wolnotekstowe (nowe pole `specializations` jsonb)
- **Stąż** — "od kiedy pracuje" (pole `started_at` date)
- Te dane pojawią się w widgecie bookingowym przy wyborze pracownika

### 4. Migracja bazy danych
Dodać kolumny do `staff_members`:
- `bio text` (nullable)
- `specializations jsonb default '[]'`  
- `started_at date` (nullable)

## Pliki do zmiany

| Plik | Zmiana |
|------|--------|
| `src/components/admin/StaffManagement.tsx` | Upload avatara, rozbudowane karty, 3. tab "Profil", wyświetlanie usług i grafiku na karcie |
| **Migracja SQL** | `ALTER TABLE staff_members ADD COLUMN bio text, ADD COLUMN specializations jsonb DEFAULT '[]', ADD COLUMN started_at date` |
| `DEMO_STAFF` w StaffManagement | Dodać avatar_url z demo assetów, bio, specializations, demo stats |

Bez zmian w schemacie Supabase types (auto-generowane) ani w `useStaffMembers` (już zwraca `avatar_url`).


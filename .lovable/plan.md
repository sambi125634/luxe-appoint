

# Plan: Poprawki UX onboardingu (krok 1) — 9/10

## Zmiany w `src/pages/OnboardingPage.tsx`

### 1. Usunąć domyślne zaznaczenie "Multi / Inne"
- Zmienić `useState("multi")` → `useState("")` (brak domyślnego typu)
- Walidacja: wymagać wyboru typu salonu przed "Dalej"

### 2. Lepszy placeholder trzeciego pola URL
- `"Strona www, Booksy lub inny cennik"` → `"Link do Booksy / Fresha / Versum (AI skopiuje Twoje usługi)"`

### 3. Lepszy mikro-copy pod "AI Scan"
- Obecne: `"Podaj minimum 1 link. Im więcej, tym dokładniejszy profil."`
- Nowe: `"AI przeczyta Twój profil i wstępnie wypełni usługi, ceny i godziny pracy — Ty tylko sprawdzisz czy się zgadzają."`

### 4. Dynamiczny tekst CTA
- Jeśli wypełnione linki: `"Skanuj mój profil AI →"` (już częściowo zrobione, ale tekst do poprawy)
- Jeśli brak linków: `"Dalej — krok 2 z 6 →"`

### 5. Dodać sekcję "Skąd przyszły Twoje klientki?"
- Nowy state `clientSources: string[]` (multiselect)
- Opcje: Booksy/Fresha/Versum, Instagram/Social media, Polecenia, Google/Strona www, Telefon/Stali klienci
- Pill buttons z emoji, multiselect
- Zapisywane do `salons.client_sources` (nowa kolumna JSONB)
- Umieszczone między "Liczba pracowników" a "AI Scan"

### 6. Zapisywanie client_sources
- W `handleSaveSalon` — dopisać `client_sources` do insert/update

## Migracja bazy danych
- `ALTER TABLE salons ADD COLUMN client_sources jsonb DEFAULT '[]'::jsonb;`

## Pliki do edycji

| Plik | Zmiana |
|------|--------|
| `src/pages/OnboardingPage.tsx` | Wszystkie 6 zmian UX |
| Migration | Dodać kolumnę `client_sources` |


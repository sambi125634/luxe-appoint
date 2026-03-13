

# Audit: Rejestracja + Onboarding — brakujące elementy

## Znalezione problemy

### 1. Brak walidacji emaila po rejestracji — użytkownik utknął
Po `signUp` użytkownik musi potwierdzić email (auto-confirm jest wyłączone). Ale po kliknięciu linka potwierdzającego wraca na `/auth` i musi się zalogować ręcznie. Brak komunikatu "sprawdź skrzynkę email" — obecny toast "Rejestracja udana" jest niewystarczający.

**Fix:** Po rejestracji pokazać dedykowany ekran "Sprawdź swoją skrzynkę email" z instrukcjami, zamiast zostawiać użytkownika na formularzu logowania.

### 2. `saveDefaultServices()` — brak salonId override w ścieżce scan error
Linia 359: `await saveDefaultServices()` — gdy scan nie powiedzie się, `createdSalonId` może nie być jeszcze w stanie. Ten sam bug co wcześniej naprawiony, ale niedopatchowany w error path.

**Fix:** Przekazać `createdSalonId` jawnie.

### 3. AI Scan — animacja progresji nie czeka na faktyczny wynik
Animacja wiadomości (8s) i faktyczny call API biegną równolegle. Jeśli Firecrawl + AI zajmie >8s (co jest prawdopodobne przy scrapowaniu 3 URL), animacja kończy się na "Gotowe!" ale spinner nadal kręci. Jeśli API jest szybsze niż animacja — użytkownik czeka niepotrzebnie.

**Fix:** Zsynchronizować animację z faktycznym postępem API (start → scraping → analyzing → done).

### 4. Brak obsługi opening_hours z AI Scan
AI Scanner zwraca `opening_hours` (godziny otwarcia), ale `handleSaveScanResults` ich nigdy nie zapisuje. Onboarding tworzy domyślne Mon-Fri 9-17, ale jeśli AI znalazło realne godziny (np. Sob 10-16), są ignorowane.

**Fix:** W `handleSaveScanResults` — jeśli `scanResult.opening_hours` istnieje, zaktualizować `working_hours` dla owner-staff.

### 5. Brak staff_services — usługi nie przypisane do pracownika
Po onboardingu usługi istnieją, staff member istnieje, ale `staff_services` (junction table) jest pusta. Booking widget wymaga powiązania staff↔service aby pokazać dostępność.

**Fix:** Po zapisaniu usług, automatycznie przypisać wszystkie do owner-staff.

### 6. Brak RODO / regulamin przy rejestracji
Dla polskiego rynku brak checkboxa RODO/polityka prywatności przy rejestracji. To wymóg prawny.

**Fix:** Dodać checkbox RODO z linkiem do regulaminu.

## Plan napraw

| # | Problem | Plik | Priorytet |
|---|---------|------|-----------|
| 1 | Ekran "sprawdź email" po rejestracji | `AuthPage.tsx` | Wysoki |
| 2 | saveDefaultServices scan error path | `OnboardingPage.tsx` | Wysoki |
| 3 | Synchronizacja animacji z API | `OnboardingPage.tsx` | Średni |
| 4 | Zapis opening_hours z AI Scan | `OnboardingPage.tsx` | Wysoki |
| 5 | Auto-assign staff_services | `OnboardingPage.tsx` | Krytyczny |
| 6 | Checkbox RODO przy rejestracji | `AuthPage.tsx` | Wysoki |

## Szczegóły implementacji

**AuthPage.tsx:**
- Nowy state `showEmailConfirmation` — po udanym signup, zamiast formularza pokazać ekran z ikoną koperty, "Wysłaliśmy link na [email]", przycisk "Otwórz pocztę"
- Checkbox RODO pod hasłem w formularzu rejestracji

**OnboardingPage.tsx:**
- `handleSaveScanResults`: po zapisie usług, pobrać staff_id ownera i wstawić `staff_services` dla wszystkich nowych usług
- `handleSaveScanResults`: parsować `opening_hours` i update `working_hours` (zamienić domyślne Mon-Fri na realne godziny)
- `saveDefaultServices`: to samo — po zapisie usług, przypisać do ownera
- Scan error path linia 359: dodać `createdSalonId` jako argument
- Animacja: użyć Promise.race / callback pattern zamiast fixed timeoutów


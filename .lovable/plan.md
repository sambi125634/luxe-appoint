
## Cel

Zamienić wąski przycisk **„Wzbogać opisy AI"** w zakładce **Usługi** na pełnowartościowy **Skaner salonu (Firecrawl + AI)**, który robi to samo co onboarding — ale dostępny w każdej chwili po rejestracji. Dla osób, które pominęły skan w onboardingu lub chcą doimportować coś później.

To strategiczne — Firecrawl to nasz game-changer, ma być widoczny i głośny w UI, nie schowany pod abstrakcyjnym „Wzbogać opisy AI".

---

## Część 1 — Nowy modal „Skaner salonu" w zakładce Usługi

### Trigger
Zamiast `[🪄 Wzbogać opisy AI]` pokazujemy **`[✨ Skaner salonu]`** (variant `luxury`, obok „Importuj CSV"). Klik → modal z trzema trybami.

### Tryby (3 zakładki w modalu)

**1. 📥 Zaimportuj usługi** (nowy)
- Wkleja link Booksy / Fresha / Versum / własna strona / Google Maps / Instagram.
- Backend: wywołanie istniejącego `ai-profile-scanner` (ten sam co w onboardingu).
- UI pokazuje wykryte usługi w checkboxach z nazwą, ceną, czasem trwania, kategorią.
- Przed importem: wybór które usługi dodać, ostrzeżenie o duplikatach (matching po nazwie), opcja „nadpisz cenę/czas istniejących".
- Zapis: insert nowych + opcjonalny update istniejących, automatyczny mapping na kategorię (utworzy nową jeśli brak), przypisanie do właścicielki.
- Pasek progress z komunikatami w stylu onboardingu („Czytamy Twój profil…", „Wykrywamy usługi…", „Mapujemy ceny…").

**2. ✨ Wzbogać opisy** (obecny flow — przeniesiony tu)
- Bez zmian funkcjonalnych: `enrich-service-descriptions` + checkbox „tylko puste opisy".
- Zostaje to samo, tylko jako jedna z opcji w nowym modalu.

**3. 🎁 Pobierz dodatkowo** (nowy — bonusowe pola)
Po jednym skanie strony pokazuje co jeszcze możemy zaciągnąć do profilu salonu:
- **Godziny otwarcia** (jeśli salon nie ma ustawionych albo różnią się od scrap'a)
- **Opis salonu / „o nas"** (pole `description` w `salons`)
- **Adres / telefon** (jeśli puste w profilu)
- **Korzyści / benefity per usługa** (już wyciągane, tylko zapisz)
- **Średnia ocen i liczba opinii z Booksy** (jako social proof — pole `external_rating`, `external_reviews_count` w salon settings)
- **Zdjęcie/logo salonu** (jeśli Firecrawl wyciągnie OG image)

Każda sekcja z checkboxem „Zaimportuj to" + podglądem wartości przed zapisem.

### Stan i obsługa błędów
- Stan: `idle | scraping | reviewing | saving | done | error`.
- Błędy z `ai-profile-scanner` (inactive_salon, no_services_found) tłumaczone na ludzki tekst, opcja „Spróbuj inny URL".
- W demo: toast „Skaner dostępny po rejestracji" (jak obecnie z enrich).
- Loader = ten sam motyw co onboarding (AI_SCAN_MESSAGES, %).

---

## Część 2 — Promocja Firecrawl w UI

- Nazwa w UI: **„Skaner salonu — wykrywa usługi, opisy i godziny w 15 sekund"** (subtitle pod przyciskiem lub w modal headerze).
- Mały badge na karcie funkcji `🪄 Powered by Firecrawl` — chociaż wewnętrznie i tak biały-label.  
  Ustalenie: **nie eksponujemy słowa „Firecrawl" klientom** zgodnie z polityką white-label (ghl-white-label-strategy). Zamiast tego: `⚡ Skaner AI` jako nasza własna marka.

---

## Część 3 — Onboarding (opcjonalne wzmocnienie)

Onboarding już domyślnie pokazuje pole „Link do Booksy/Fresha/Versum" i skanuje — sprawdziłem (`startAiScan`). **Nic nie trzeba dodawać w onboardingu**, działa.

Jedyna ewentualna zmiana: dopisać do podpowiedzi „Możesz to też zrobić później w zakładce **Usługi → Skaner salonu**" — żeby ten kto skipnie, wiedział gdzie wrócić.

---

## Pliki do zmiany / utworzenia

- ➕ `src/components/admin/services/SalonScannerModal.tsx` — nowy modal z 3 zakładkami (Importuj usługi / Wzbogać opisy / Dodatkowe dane), używa `ai-profile-scanner` + `enrich-service-descriptions`.
- ➕ `src/hooks/useSalonScanner.ts` — wspólna logika scrap + zapis (wywołania edge functions, parsing wyników, mapping na DB inserts/updates).
- ✏️ `src/components/admin/ServicesManagement.tsx` — przycisk `Wzbogać opisy AI` → `Skaner salonu`, usunięty stary inline dialog (kod enrich przeniesiony do hooka/modala).
- ✏️ `src/pages/OnboardingPage.tsx` — drobna dopiska w komunikacie skipnięcia skanu (1 linijka).
- ✏️ `supabase/functions/ai-profile-scanner/index.ts` — **bez zmian funkcji** (zwracane pola już pokrywają zakres), tylko jeśli zauważymy że brakuje któregoś pola (np. `external_reviews_count`) dodamy w schemacie odpowiedzi.

## Pytania otwarte

1. **Matching duplikatów** przy imporcie usług — wystarczy fuzzy po nazwie (np. levenshtein <3) czy chcesz pokazać UI „znaleziono potencjalny duplikat: X — zaktualizować czy pominąć?" dla każdej?
2. **Logo/OG image salonu** — czy chcesz, żebym dorzucił auto-pobieranie loga (Firecrawl `formats: ['branding']`) — wymaga osobnego scrap'a; albo zostawiamy na później?
3. **Limit użycia** — czy nakładamy rate limit na ten przycisk (np. 5 skanów / dzień / salon), żeby nie spalić budżetu Firecrawl, czy zostawiamy bez limitu?

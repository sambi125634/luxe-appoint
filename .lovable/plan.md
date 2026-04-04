

## Plan: Lepsze opisy funkcji + rozwijana sekcja wspólnych funkcji

### Zmiany w `ComparisonSection.tsx`

**1. Header update**
- Zmiana "12 funkcji których marketplace nie oferuje" → "12 funkcji, które znajdziesz tylko u nas"

**2. Rewrite opisów 12 unikalnych funkcji — język korzyści**
Zamiast technicznego opisu — co to daje właścicielce salonu:

| Funkcja | Nowy opis (korzyść) |
|---------|---------------------|
| AI Autopilot | Nie musisz ręcznie szukać wolnych terminów, dzwonić w urodziny ani zgadywać kto odejdzie. 12 funkcji AI robi to za Ciebie — codziennie, bez przerwy. |
| True Profit | Wiesz ile naprawdę zarabiasz na każdym zabiegu — po odliczeniu materiałów. Koniec zgadywania, które usługi Ci się opłacają. |
| Retencja | Widzisz które klientki zaraz odejdą — zanim to się stanie. System sam wysyła SMS lub email, żeby je zatrzymać. |
| Prognoza AI | Wiesz ile zarobisz za 30, 60 i 90 dni. Planujesz zakupy, urlopy i inwestycje na twardych danych, nie przeczuciu. |
| Własność bazy | Twoja baza klientek należy do Ciebie. Eksportujesz jednym kliknięciem. Żadna platforma nie może Ci jej zabrać ani zablokować. |
| Prywatna aplikacja | Twoje klientki widzą tylko Twój salon — nie konkurencję obok. Zero reklam innych salonów w Twojej aplikacji. |
| Auto-segmentacja | System sam oznacza klientki: VIP, zagrożona odejściem, nowa, no-show. Nie musisz ręcznie tagować setek osób. |
| Receptury | Przypisujesz składniki do zabiegu raz — magazyn aktualizuje się sam po każdej wizycie. Koniec ręcznego liczenia zużycia. |
| Skaner kodów | Przyjmujesz dostawę aparatem telefonu. Skanujesz kod — produkt trafia do magazynu. Bez czytnika, bez ręcznego wpisywania. |
| Ścieżka Klientki | Widzisz dokładnie na jakim etapie jest każda klientka — od pierwszej wizyty do stałej. Automatyczne zaliczki chronią Cię przed no-showami. |
| Program poleceń | Każda klientka ma unikalny link polecający. Widzisz ile nowych osób przyprowadziła i ile na tym zarobiłaś. |
| Widget per kampania | Osobny widget rezerwacji dla Instagrama, strony i Google Ads. Wiesz która kampania przynosi rezerwacje. |

**3. Rozwijana sekcja "Wspólne funkcje" na dole**
Zamiast jednozdaniowego disclaimera — collapsible accordion z tabelą porównawczą standardowych funkcji (obie platformy mają):

Przycisk: "Porównaj standardowe funkcje →" (klik rozwija/zwija)

Wewnątrz — kompaktowa tabela:
- Kalendarz online z rezerwacjami ✅ / ✅
- CRM z kartami klientów i tagami ✅ / ✅
- Automatyczne SMS/email przypomnienia ✅ / ✅
- Kampanie marketingowe SMS/email ✅ / ✅
- Zarządzanie magazynem ✅ / ✅
- Raporty sprzedaży i statystyki ✅ / ✅
- Karty lojalnościowe / pieczątki ✅ / ✅
- Płatności online ✅ / ✅
- Kaucje / zaliczki ✅ / ✅ (BC: automatyczne reguły, Marketplace: ręczne)
- Wideoprezentacja usług ✅ / ⚠️ zdjęcia (Booksy nie ma wideo w kalendarzu)
- Grupy usług / kategorie ✅ / ✅
- Wielostanowiskowość ✅ / ✅
- Formularze/zgody klientek ✅ (builder) / ✅ (prostsze)

Na dole tabeli nota: "Dane na podstawie publicznych cenników (2026)."

### Plik do edycji

| Plik | Co |
|------|----|
| `src/components/landing/ComparisonSection.tsx` | Rewrite opisów 12 funkcji na język korzyści, zmiana headera, dodanie collapsible sekcji wspólnych funkcji z mini-tabelą porównawczą |

Jeden plik. Struktura (karty cenowe + grid + CTA) bez zmian.


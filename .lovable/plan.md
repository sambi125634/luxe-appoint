

## Plan: Przeprojektowanie systemu poradników (SectionGuide + GuidedTour)

### Problem
1. **SectionGuide** (poradnik na każdej zakładce) — zawiera klucze dla nieistniejących zakładek (`timeOff`, `stats`, `recipes`) a brakuje kluczy dla `retention` i `referral`
2. **GuidedTour (admin)** — hardcoded po polsku, pokrywa tylko 7 zakładek (stary model), nie wspomina o marketingu, retencji, konsultacjach
3. **GuidedTour (demo)** — pokrywa jeszcze mniej (6 zakładek)
4. Copy jest techniczno-instrukcyjne ("kliknij tu, dodaj tam") zamiast benefit-driven

### Zmiany

#### 1. SectionGuide — aktualizacja kluczy i copy (`pl.json` + `en.json`)

**Usunąć**: `timeOff`, `stats`, `recipes` (nie są samodzielnymi tabami)

**Dodać**: `retention`, `referral`

**Przepisać WSZYSTKIE 15 sekcji** językiem korzyści:

| Klucz | Goal (korzyść) | Pain Point (wartość) |
|-------|----------------|---------------------|
| `home` | "Widzisz ile zarabiasz, ile klientek wraca i co wymaga uwagi — bez otwierania Excela" | "Jeden rzut oka rano i wiesz jak stoi Twój biznes" |
| `calendar` | "Klientki rezerwują same 24/7 — Ty zarządzasz tylko wyjątkami" | "Zero telefonów w trakcie zabiegu" |
| `widgets` | "Twój link do rezerwacji działa jak pracownik, który nigdy nie śpi" | "Wklej link na Instagram i klientki rezerwują o 23:00" |
| `staff` | "Każdy pracownik ma swój kalendarz, usługi i kolor — zero pomyłek" | "Nie musisz pamiętać kto co robi" |
| `clients` | "Pełna historia każdej klientki — wiesz kto jest VIP, kto znika" | "Koniec z karteczkami i zeszytami" |
| `conversations` | "Wszystkie rozmowy w jednym miejscu — SMS, email, WhatsApp" | "Nigdy nie zgubisz wątku z klientką" |
| `consultation` | "Cyfrowe karty konsultacyjne z podpisem RODO — zawsze pod ręką" | "Profesjonalna dokumentacja bez papierowej biurokracji" |
| `services` | "Twój cennik online — klientki widzą ceny i rezerwują od razu" | "Zmień cenę raz, widget aktualizuje się automatycznie" |
| `products` | "Wiesz ile produktów zostało i kiedy zamówić — zero niespodzianek" | "Skanuj dostawy telefonem, system liczy marże za Ciebie" |
| `accounting` | "Zamykasz salon, sprawdzasz raport — wszystko się zgadza" | "Eksport dla księgowej jednym kliknięciem" |
| `pipeline` | "Widzisz ile klientek wraca po 1., 2., 3. wizycie — i gdzie odpadają" | "Reagujesz zanim klientka odejdzie do konkurencji" |
| `retention` | "System automatycznie dba o powroty klientek — Ty nie musisz pamiętać" | "Klientki wracają same, bo system reaguje we właściwym momencie" |
| `referral` | "Zadowolone klientki polecają Cię znajomym — system to trackuje" | "Każde polecenie = nowa klientka bez kosztu reklamy" |
| `settings` | "Twoje logo i kolory wyświetlają się w widgecie — profesjonalny wygląd" | "Konfiguracja raz, efekty na zawsze" |
| `support` | "Pytasz po polsku, dostajesz odpowiedź natychmiast" | "Jak rozmowa z ekspertem, który zna cały system" |

**Kroki** (`steps`) — max 3-4, napisane jako korzyści, nie instrukcje.

**Aktualizacja `SECTION_KEYS`** w `SectionGuide.tsx`.

#### 2. GuidedTour (admin) — przebudowa na 15 zakładek

**Plik**: `src/components/admin/GuidedTour.tsx`

- Rozszerzyć `tourSteps` do pokrycia WSZYSTKICH 15 tabów w kolejności sidebara
- Pogrupować kroki wg sekcji sidebara (Codzienna praca → Klienci → Oferta → Marketing → System)
- Copy benefit-driven — każdy krok mówi CO ZYSKUJESZ, nie jak klikać
- Dodać ikony pasujące do sidebara (Route, Radar, Heart, etc.)

#### 3. GuidedTour (demo) — synchronizacja z admin

**Plik**: `src/components/demo/GuidedTour.tsx`

- Zsynchronizować kroki z wersją admin (te same zakładki, to samo copy)
- Używać kluczy i18n zamiast hardcoded tekstu

### Pliki do edycji
1. `src/i18n/locales/pl.json` — nowe klucze sectionGuide + tour
2. `src/i18n/locales/en.json` — odpowiedniki EN
3. `src/components/admin/SectionGuide.tsx` — aktualizacja SECTION_KEYS
4. `src/components/admin/GuidedTour.tsx` — rozbudowa do 15 kroków
5. `src/components/demo/GuidedTour.tsx` — synchronizacja


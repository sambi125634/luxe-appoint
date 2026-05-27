
## Cel

Zamienić obecne 6 statycznych „szablonów-atrap" (klik tylko otwierał pusty builder) na **pełnoprawną bibliotekę gotowych kart** z prawdziwymi pytaniami, pogrupowaną w kategorie. Równolegle ulepszyć ścieżkę „Utwórz od zera", żeby właścicielka salonu nie zostawała sama przed pustym ekranem.

AI w tym module **zostaje wyłączone** — jak ustaliliśmy wcześniej działało niestabilnie. Cała wartość ma płynąć z dobrze przygotowanego katalogu + lepszego builder'a.

---

## Część 1 — Biblioteka szablonów (Utwórz z szablonu)

### Nowy układ ekranu
Zamiast jednego płaskiego grida 6 kart — **zakładki kategorii** na górze + grid kart pasujących do wybranej kategorii. Każda karta szablonu ma: emoji, nazwę, krótki opis (1 linia), liczbę pytań, czas wypełnienia, badge „Najpopularniejsze" / „RODO" / „Medyczne" gdy istotne. Klik → otwiera builder z **pre-wypełnionymi polami** (nie pustym formularzem jak teraz).

### Proponowane kategorie i szablony

**🌟 Najpopularniejsze** (skrót do top 4)
- Ogólna karta pierwszej wizyty (8 pytań)
- Manicure hybrydowy (6 pytań)
- Zabieg na twarz — podstawy (10 pytań)
- Zgoda RODO + marketing (3 pytania)

**💅 Paznokcie**
- Manicure hybrydowy / klasyczny
- Manicure japoński / SPA
- Przedłużanie żelem / akrylem
- Pedicure leczniczy
- Stylizacja paznokci stóp

**💆 Twarz / Kosmetyka**
- Pierwsza wizyta kosmetyczna (typ skóry, pielęgnacja domowa)
- Peeling chemiczny (kwasy, przeciwwskazania)
- Mezoterapia igłowa
- Oczyszczanie wodorowe / kawitacja
- Mikrodermabrazja
- Henna i regulacja brwi / laminacja

**💉 Medycyna estetyczna**
- Botoks / toksyna botulinowa (wywiad lekarski)
- Kwas hialuronowy — usta / policzki
- Mezoterapia osoczem (PRP)
- Lipoliza iniekcyjna
- Nici liftingujące

**💇 Włosy / Barber**
- Koloryzacja / refleksy (test uczuleniowy)
- Keratynowe prostowanie / botox
- Strzyżenie damskie / męskie
- Przedłużanie włosów
- Trychologia — wywiad

**🌸 Ciało / SPA**
- Masaż klasyczny / relaksacyjny
- Masaż leczniczy (wywiad ortopedyczny)
- Depilacja woskiem / laserowa
- Modelowanie sylwetki
- Drenaż limfatyczny

**👁 Stylizacja oka**
- Przedłużanie rzęs 1:1 / objętościowe
- Lifting rzęs + laminacja
- Henna brwi / pudrowe brwi

**🏥 Klinika / przeciwwskazania**
- Wywiad medyczny rozszerzony
- Kwalifikacja do zabiegu laserowego
- Karta pacjenta — pierwsza wizyta w klinice

**📋 RODO / Zgody**
- Zgoda RODO + marketing
- Zgoda na dokumentację fotograficzną przed/po
- Zgoda na zabieg dla osoby niepełnoletniej (rodzic)
- Klauzula informacyjna — przetwarzanie danych zdrowotnych

**🎁 Pre/Post visit (bonusowe)**
- Ankieta zadowolenia po wizycie (3 pytania + NPS)
- Brief przed sesją makijażu okolicznościowego
- Zalecenia pielęgnacyjne — checklista po zabiegu

Razem ~38 gotowych kart. Każda z prawdziwą listą pytań w kodzie (typowane pola: `text`, `textarea`, `select`, `slider`, `signature`).

### Implementacja danych
Nowy plik `src/modules/consultation/templateLibrary.ts` z eksportem `TEMPLATE_LIBRARY: TemplateDefinition[]` — każdy element ma `id, name, emoji, category, description, estimatedMinutes, badge?, fields: ConsultationField[]`. Łatwo dopisywać kolejne, łatwo testować, łatwo tłumaczyć.

Szablony **nie idą do bazy** dopóki użytkowniczka nie kliknie „Użyj" — wtedy `useSaveTemplate` zapisuje skopiowane pola jako nową kartę salonu (już edytowalną).

---

## Część 2 — Ulepszony tryb „Od zera"

Dzisiaj „Od zera" otwiera dokładnie ten sam builder co „Z szablonu" — bez różnicy, bez pomocy. Zmiany:

1. **Krok 0 — wybór punktu startu**: 3 przyciski kafelkowe
   - „Mam pomysł — zacznij z 1 pustym polem"
   - „Podpowiedz pytania" → lista kategorii PRESET_QUESTIONS (już istnieje, tylko lepsza ekspozycja)
   - „Skopiuj inną moją kartę" → lista istniejących kart salonu jako baza
2. **Lepszy katalog gotowych pytań w builderze**: PRESET_QUESTIONS rozszerzyć o sekcje:
   - 🧒 Pediatria / nieletni
   - 🩺 Wywiad medyczny (cukrzyca, zaburzenia krzepliwości, leki przeciwzakrzepowe, rozrusznik)
   - 📸 Foto przed/po + RODO
   - 🌡 Przeciwwskazania sezonowe (opalanie, ciąża, karmienie)
   - ⭐ Ocena/NPS (jak oceniasz, czy polecisz, co poprawić)
3. **Szablony jako „starter"**: w nagłówku trybu od-zera dodać link „Albo wybierz gotowy szablon →" wracający do biblioteki.
4. **Walidacja końcowa**: przed zapisem checkować że karta ma min. 1 pytanie + nazwę; pokazywać podgląd jak klient zobaczy formularz.

---

## Część 3 — Drobne porządki w UI listy

- Usunąć nagłówek „Karty konsultacyjne & Voice Notes" wraz z podtytułem AI, bo AI faktycznie nie żyje — zostawić sam tytuł sekcji „Karty konsultacyjne".
- Sekcja „Gotowe szablony do kliknięcia" pokazuje się tylko gdy salon ma 0 kart. Po dodaniu pierwszej karty — szablony chowamy do przycisku „+ Z biblioteki szablonów" obok „Utwórz od zera", żeby zawsze były dostępne, ale nie zaśmiecały widoku.

---

## Pytania otwarte (możesz odpowiedzieć przy akceptacji)

1. **Voice Notes** — zostawiamy w nazwie i funkcjonalności, czy też wycinamy razem z AI?
2. **Czy ~38 szablonów to OK**, czy wolisz mniej (np. tylko top 15-20) na start?
3. **Brakuje branż?** Mam dorzucić np. tatuaż / piercing / podologia / dietetyka / fizjoterapia?

## Pliki do zmiany / utworzenia

- ✏️ `src/modules/consultation/ConsultationModule.tsx` — nowy układ z kategoriami, usunięcie podtytułu AI
- ➕ `src/modules/consultation/templateLibrary.ts` — pełny katalog szablonów z polami
- ➕ `src/modules/consultation/TemplateGallery.tsx` — komponent grida z zakładkami kategorii
- ✏️ `src/modules/consultation/EasyCardBuilder.tsx` — krok 0 z wyborem punktu startu, rozszerzone PRESET_QUESTIONS, walidacja, podgląd
- ✏️ `src/modules/consultation/CardBuilder.tsx` — synchronizacja SYSTEM_TEMPLATES z nową biblioteką (lub usunięcie duplikacji)

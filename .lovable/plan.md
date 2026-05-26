# Przebudowa Guided Tour w panelu admin

## Diagnoza

Obecny `src/components/demo/GuidedTour.tsx`:
- **17 kroków** — każda zakładka sidebara to osobny krok, męcząco
- **Pełny overlay `bg-background/80 backdrop-blur-sm`** zasłania cały panel — user nie widzi co tour pokazuje
- Karta zawsze wycentrowana, brak związku wizualnego z opisywaną sekcją
- Copy ogólne, nie w języku korzyści

## Cel

Tour krótki (7 kroków zamiast 17), z widocznym UI w tle, reflektorem na konkretnej zakładce sidebara, copy w języku realnych korzyści dla właścicielki salonu.

## 1. Konsolidacja do 7 kroków

Grupowanie pokrewnych funkcji w jeden krok — każdy krok przedstawia *obszar*, nie pojedynczy klik:

| # | Krok | Pokazuje (sidebar tab) | O czym |
|---|------|------------------------|--------|
| 1 | Witaj | center | „Oto Twój salon — pokażę Ci 6 miejsc, które dają Ci kontrolę" |
| 2 | Kalendarz i grafik | `calendar` | „Tu widzisz cały dzień zespołu. Bez double-bookingu, bez papierowych list" |
| 3 | Klientki i wiadomości | `clients` (+ wzmianka o `conversations`) | „Pełna historia każdej klientki — kiedy była, ile wydała, kto z nią rozmawiał" |
| 4 | Usługi, cennik, produkty | `services` (+ wzmianka o `products`) | „Twoja oferta i magazyn w jednym — kontrola marży na każdym zabiegu" |
| 5 | Zarobki i księgowość | `accounting` | „Realny zysk po kosztach materiałów. Wiesz ile naprawdę zarabiasz" |
| 6 | Autopilot retencji | `retention` (+ wzmianka o `pipeline` i `referral`) | „AI pisze za Ciebie do klientek, które dawno nie były. Sama wraca rezerwacja" |
| 7 | Twój link do rezerwacji | `widgets` | „Wklej go w bio Instagrama — klientki rezerwują same, 24/7. Finish + CTA" |

Stare 17 kroków: `welcome, dashboard, calendar, widgets, staff, clients, conversations, consultation, services, products, accounting, pipeline, retention, referral, settings, support, cta` → wytnięte: `dashboard, staff, consultation, settings, support` (są oczywiste lub odkryją je sami).

## 2. Reflektor zamiast pełnego blura

Zastąpić jednolite `bg-background/80 backdrop-blur-sm` mechanizmem **spotlight**:

```text
┌─────────────────────────────────────────────┐
│  [SIDEBAR]          [CONTENT — VISIBLE]     │
│  ─────────                                  │
│  ┌───────┐ ← jasna ramka + glow             │
│  │ ★ Kal │ ← spotlight (czysty, bez dimu)   │
│  └───────┘                                  │
│  ─────────                            ┌────┐│
│  (dimmed 40%)                         │ TIP││
│                                       │card││
│                                       └────┘│
└─────────────────────────────────────────────┘
```

Mechanizm:
- Overlay z `pointer-events: none`, gradient/maska wycina prostokąt wokół targetowanego elementu sidebara (`data-tour-target="calendar"` na każdym `SidebarLink`)
- Reflektor: cień wokół ramki (`box-shadow: 0 0 0 4px hsl(var(--primary)), 0 0 40px hsl(var(--primary)/0.5)`), reszta UI ściemniona przez półprzezroczystą warstwę bez bluru
- Karta-tooltip pozycjonowana po **prawej stronie sidebara**, na wysokości podświetlonej zakładki — wskazuje strzałką na sidebar (`absolute` z `useRef` + `getBoundingClientRect` na targecie)
- Treść (główna sekcja panelu) zostaje widoczna, lekko ściemniona (~30%), żeby user widział co kryje się pod zakładką

Krok „Witaj" i ostatni CTA — bez reflektora, karta wycentrowana z lekkim dimem całości (tak jak dziś).

## 3. Copy w języku korzyści

Nowe stringi w `src/i18n/locales/pl.json` (`tour.steps.*`):

- **Welcome**: „Cześć! Pokażę Ci 6 miejsc, dzięki którym przestajesz tracić czas na ręczne notatki i odbieranie telefonów."
- **Calendar**: „Cały grafik zespołu w jednym widoku. Klikasz pusty slot — masz wizytę. Klientka rezerwuje sama — od razu tu trafia. Koniec z zeszytem."
- **Clients**: „Każda klientka ma swoją kartę: ostatnia wizyta, ile wydała, jakie zabiegi lubi. Wiesz kto Cię finansuje — i kto przestał wracać."
- **Services**: „Dodajesz usługi raz, ceny aktualizujesz w sekundę. Łączysz je z produktami, których używasz — system pilnuje stanu magazynu."
- **Accounting**: „Tu widzisz **realny zysk** po odjęciu kosztu materiałów. Wreszcie wiesz, która usługa zarabia, a która tylko zajmuje fotel."
- **Retention**: „AI pisze do klientek, które dawno nie były — sama. Ty śpisz, one wracają. Bez przypominania, bez wysiłku."
- **Widgets/Finish**: „To Twój link do rezerwacji. Wklejasz w bio Instagrama, w Google, w stopkę maila — klientki rezerwują 24/7, bez dzwonienia. Gotowe. Klikaj gdzie chcesz."

EN — równoważne tłumaczenia w `en.json`.

## 4. Szczegóły techniczne

- `src/components/demo/GuidedTour.tsx`: zredukować `tourSteps` do 7, dodać pole `targetSelector?: string` zamiast/oraz `targetTab`
- `src/components/admin/AdminSidebar.tsx`: dodać `data-tour-target={tab.id}` na każdym przycisku zakładki (potrzebne do `querySelector`)
- Hook `useSpotlightRect(targetSelector)` — śledzi `getBoundingClientRect` z `ResizeObserver` + `scroll`, zwraca `{top, left, width, height}` dla pozycjonowania reflektora i strzałki tooltipa
- Backdrop: dwa nakładające się `div`-y — jeden poniżej spotlight (`pointer-events: none`, `bg-black/40`), drugi z `clip-path` wycinającym otwór wokół ramki sidebara. Brak `backdrop-blur`
- Animacja: 300ms ease przesunięcia spotlightu między krokami (`transition: all` na top/left/width/height)
- Karta tooltipa: `max-w-sm`, strzałka `::before` wskazująca na sidebar, animowane wejście (fade + slide-x 8px)
- Klawiatura: ← → nawigacja, `Esc` zamyka (już częściowo jest, dodać listenery)
- `localStorage` flag `demo-tour-completed` bez zmian

## 5. Zakres zmian

Pliki:
- `src/components/demo/GuidedTour.tsx` — przepisanie (struktura kroków, spotlight, pozycjonowanie)
- `src/components/admin/AdminSidebar.tsx` — dodanie atrybutu `data-tour-target`
- `src/i18n/locales/pl.json` + `en.json` — nowe stringi `tour.steps.*` (7 sekcji), usunięcie nieużywanych

Co zostaje:
- `useTourState` hook bez zmian
- Logika `onTabChange` (auto-przełączanie zakładek przy kroku) — zostaje, ale dla 7 kroków zamiast 17
- Wywołanie w `AdminDashboard` — bez zmian

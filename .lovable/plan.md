

## Plan: Przenieś OwnYourClientsSection pod Hero + dopasuj kolorystykę do ciepłej palety

### Zmiany

**1. Index.tsx — zmiana kolejności sekcji**

Przenieść `<OwnYourClientsSection />` z pozycji 3 (po SystemFlow) na pozycję 2 (zaraz po Hero, przed SystemFlow).

Nowa kolejność: Hero → OwnYourClients → SystemFlow → SalonLossCalculator → ...

**2. OwnYourClientsSection.tsx — przebudowa kolorystyczna**

Obecny styl: ciemne tło `#1A1A2E`, biały tekst, glassmorphism na ciemnym tle.

Nowy styl dopasowany do warm ivory palety strony:

- **Tło sekcji**: `#FAFAF8` (Warm White) — spójne z resztą strony
- **Nagłówek H2**: kolor `#1A1A2E` (Deep Navy), akcent "cudzej bazy klientek" w `#D94F3D` (Error red)
- **Badge "Wiedziałaś o tym?"**: tło `#FEF2F2`, border `#FECACA`, tekst `#D94F3D` — ciepły czerwony alarm na jasnym tle
- **Paragraf**: kolor `#4A4A5A` (body text), pogrubienia w `#1A1A2E`
- **Karta Marketplace**: białe tło `#FFFFFF`, border `#F0ECE6`, shadow-md, czerwona linia akcentowa u góry, tekst `#4A4A5A`, ikony X w `#D94F3D`, nagłówek karty `#1A1A2E`
- **Karta Beauty Calendar**: białe tło `#FFFFFF`, border w odcieniu bronze `rgba(184,125,94,0.3)`, shadow z bronze glow, brązowa linia akcentowa, ikony Check w `#B87D5E`, nagłówek `#1A1A2E`, pogrubienia w `#B87D5E`
- **Cytat na dole**: gradient tekstu `#1A1A2E → #4A4A5A` (zamiast white → transparent)
- **Radial glow**: subtelny bronze glow z `opacity-[0.04]` na jasnym tle

Treści bez zmian. Animacje bez zmian. Layout bez zmian.

### Pliki do edycji

| Plik | Co |
|------|----|
| `src/pages/Index.tsx` | Przesunięcie OwnYourClientsSection na pozycję 2 (po Hero) |
| `src/components/landing/OwnYourClientsSection.tsx` | Zamiana ciemnej palety na ciepłą ivory — tło, karty, tekst, akcenty |


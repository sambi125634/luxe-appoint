## Cel

W panelu demo → zakładka "Aplikacja klienta" obecny mockup telefonu (`PhonePreview.tsx`) pokazuje uproszczoną statyczną kartę przypominającą widget rezerwacji. Klient ogląda demo i nie widzi, jak naprawdę wygląda aplikacja na telefonie klientki. Podmieniamy mockup na żywy podgląd realnej aplikacji klienta (ten sam, który już istnieje pod `MobilePreview.tsx`).

## Zakres zmian

**Plik:** `src/components/admin/client-app/preview/PhonePreview.tsx`

Przepisujemy komponent tak, by renderował telefon z iframe wskazującym na realne trasy aplikacji klienta z parametrem `?preview=true` (bypass auth, znany z pamięci projektu „Admin Mobile Preview").

### Struktura nowego PhonePreview

1. **Toggle zakładek nad telefonem** (3 widoki — to są realne ekrany aplikacji klienta):
   - `Profil salonu` → `/s/demo-salon` (publiczny profil/booking — bez zmian)
   - `Dla Ciebie` → `/app/for-you?preview=true`
   - `Wizyty` → `/app/bookings?preview=true`

   Domyślny tab = `Dla Ciebie` (to jest „prawdziwy" ekran aplikacji klienta z telefonu — nie widget rezerwacji).

2. **Ramka telefonu** — zachowujemy obecny styl (border 8px, notch, rounded-[2.5rem], 280×580, shadow-2xl, brand color via CSS niepotrzebny bo iframe sam ładuje branding salonu z bazy).

3. **Iframe wewnątrz** — skalowany transformem `scale(0.718)` z `transformOrigin: top left`, źródłowy viewport 390×808 jak w `MobilePreview.tsx`. Key + cache-bust `?t=refreshKey` żeby przycisk odświeżania działał.

4. **Mały przycisk odświeżania** (RefreshCw, jak w `MobilePreview`) i podpis „Podgląd na żywo" z zielonym pulsującym indykatorem (zachowujemy obecny tekst „Ostatnia synchronizacja: właśnie teraz ✓").

5. **Props pozostają bez zmian** (`config`) — interfejs nie wymaga modyfikacji w `ClientAppPage.tsx`. `config` przestaje wpływać na zawartość (branding pochodzi z `demo-salon` w bazie), ale zostawiamy parametr dla kompatybilności (zignorowany).

### Co znika

- Statyczne tablice `DEMO_SERVICES`, `DEMO_HISTORY`.
- Toggle „Nowa / Stała" (dwa stany mockupu) — zastępujemy zakładkami realnych ekranów aplikacji.
- Cały ręcznie rysowany layout salonu i historii — robi to teraz iframe.

## Czego NIE ruszamy

- `ClientAppPage.tsx` (już używa `PhonePreview` poprawnie).
- `MobilePreview.tsx` (niepowiązany duplikat — pozostawiamy bez zmian).
- Edycji brandingu w lewej kolumnie (zakładki Marka/Komunikacja/...) — pozostają bez zmian. Branding zapisany w bazie demo-salon jest tym, co widzi iframe.

## Po publikacji

Zmiana frontendowa — wymaga Publish → Update, żeby zadziałała na `admin.beauty-funnels.com`.

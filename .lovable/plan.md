

# Plan: Podgląd aplikacji mobilnej + Przewodnik publikacji w App Store / Google Play

## Co mamy teraz

Aplikacja kliencka (`/app/*`) jest już zbudowana z 5 ekranami:
- **Moje Salony** — lista przypisanych salonów
- **Moje Wizyty** — nadchodzące + historia (tabs)
- **Ulubione** — salony oznaczone jako ulubione
- **Profil** — dane użytkownika, wylogowanie
- **Profil Salonu** — szczegóły salonu z usługami, zespołem i przyciskiem rezerwacji

Dolna nawigacja (BottomTabBar) w stylu Booksy jest gotowa. Capacitor jest skonfigurowany (`capacitor.config.ts`).

---

## Co zrobimy

### 1. Podgląd aplikacji mobilnej w przeglądarce

Aby zobaczyć jak aplikacja wygląda na telefonie, wystarczy wejść na:

**`/app`** w podglądzie (po zalogowaniu jako klient)

Możesz to przetestować teraz — otwórz preview w nowym oknie, zmniejsz szerokość do ~390px (szerokość iPhone'a), zaloguj się i przejdź na `/app`.

### 2. Przewodnik krok po kroku: Od kodu do App Store

Oto dokładny plan co musisz zrobić, aby aplikacja trafiła na telefon:

#### Krok 1: Export do GitHub (5 min)
- W edytorze Lovable → Settings → GitHub → **Connect project**
- Autoryzuj aplikację GitHub
- Kliknij **Create Repository** — cały kod trafi na GitHub

#### Krok 2: Konfiguracja lokalna (15 min)
- Zainstaluj [Node.js](https://nodejs.org) na komputerze
- Sklonuj repo: `git clone https://github.com/TWOJ-USER/REPO.git`
- `cd REPO && npm install`

#### Krok 3: Dodaj platformy natywne (5 min)
```bash
npx cap add ios        # dla iPhone (wymaga Mac + Xcode)
npx cap add android    # dla Android (wymaga Android Studio)
npm run build
npx cap sync
```

#### Krok 4: Testuj na swoim telefonie (10 min)
```bash
npx cap run ios        # otwiera w Xcode → Run na symulatorze lub telefonie
npx cap run android    # otwiera w Android Studio → Run
```

Dzięki konfiguracji `server.url` w `capacitor.config.ts`, aplikacja ładuje się z live preview — zmiany w Lovable są widoczne natychmiast na telefonie (hot reload).

#### Krok 5: Publikacja w sklepach

**Google Play Store:**
1. Konto Google Play Developer — jednorazowa opłata $25
2. W Android Studio: Build → Generate Signed Bundle (AAB)
3. Google Play Console → Create App → Upload AAB → Fill listing → Submit for review
4. Review trwa 1-3 dni

**Apple App Store:**
1. Konto Apple Developer — $99/rok
2. Wymaga Mac z Xcode
3. Xcode → Product → Archive → Upload to App Store Connect
4. App Store Connect → Fill listing, screenshots → Submit for review
5. Review trwa 1-7 dni

### 3. Ulepszenia UI aplikacji klienckiej

Przed publikacją warto dodać kilka elementów, które sprawią że aplikacja będzie bardziej "native-feel":

- **Pull-to-refresh** na listach (MySalons, MyBookings)
- **Splash screen** z logo Beauty Funnels przy starcie
- **Haptic feedback** przy interakcjach (Capacitor Haptics plugin)
- **Status bar** styling (ciemny/jasny w zależności od ekranu)
- **Przycisk "Dodaj do ulubionych"** na profilu salonu (serduszko w headerze)
- **Powiadomienia push** — przypomnienia o wizytach (Capacitor Push Notifications)

---

## Podsumowanie kosztów

| Pozycja | Koszt |
|---|---|
| Google Play Developer | $25 (jednorazowo) |
| Apple Developer Program | $99/rok |
| Mac (wymagany dla iOS) | Jeśli nie masz — alternatywnie: MacInCloud ~$30/mo |
| **Łącznie na start** | **~$125** |

---

## Kolejność działań

1. **Teraz** — otwórz `/app` w preview, żeby zobaczyć jak wygląda aplikacja kliencka
2. **Opcjonalnie** — ulepsz UI (pull-to-refresh, splash, ulubione)
3. **Export** — połącz z GitHub
4. **Build** — `npx cap add ios/android && npx cap sync`
5. **Test** — `npx cap run` na swoim telefonie
6. **Publish** — upload do Google Play / App Store

Więcej szczegółów znajdziesz w oficjalnym poradniku: [Building a Mobile App with Lovable + Capacitor](https://lovable.dev/blog/lovable-mobile-app)


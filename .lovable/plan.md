## Plan: Finalizacja aplikacji mobilnych Beauty Calendar

### ETAP 1 — Dopracowanie UI/UX aplikacji klienckiej (/app)

**Pliki do edycji**: komponenty w `src/components/client-app/`

1. **MySalons.tsx** — dodanie karty salonu z avatarem, oceną, ostatnią wizytą, animacja wejścia (framer-motion staggered)
2. **MyBookings.tsx** — pull-to-refresh, karty wizyt z kolorowym statusem (upcoming=primary, completed=muted, cancelled=destructive), sekcja "Najbliższa wizyta" z countdown
3. **ForYou.tsx** — animowana karta lojalnościowa (progress ring zamiast bara), karuzela kuponów z embla-carousel
4. **Activity.tsx** — grupowanie powiadomień po dniach ("Dziś", "Wczoraj"), ikony per typ, swipe-to-dismiss
5. **ClientProfile.tsx** — avatar z inicjałami, sekcje z ikonami, dark mode toggle
6. **BottomTabBar.tsx** — badge na "Aktywność" (nieprzeczytane), haptic-ready active:scale, safe-area-inset

### ETAP 2 — Rozbudowa aplikacji właściciela (/m)

**Pliki do edycji**: komponenty w `src/components/mobile-admin/`

1. **MobileDashboard.tsx** — Quick Actions (+ Wizyta, Zablokuj slot, Notatka), mini-wykres przychodu (sparkline), karty KPI z animacją liczników
2. **MobileCalendar.tsx** — swipe między dniami (gesture), kolorowe bloki wizyt per status, floating "+" button
3. **MobileClients.tsx** — wyszukiwarka z debounce, tagi klientów jako chips, szybkie akcje (zadzwoń, SMS)
4. **MobileNotifications.tsx** — real-time badge sync, grupowanie, akcje inline (potwierdź/odrzuć wizytę)
5. **MobileMoreMenu.tsx** — mini-raporty (przychód dziś/tydzień), skróty do najczęściej używanych modułów

### ETAP 3 — Push Notifications (backend + frontend)

1. **Edge Function `send-push-notification`** — wysyłka przez Web Push API (VAPID keys)
2. **Service Worker** — obsługa `push` event z wyświetleniem natywnego powiadomienia
3. **Hook `usePushSubscription`** — rejestracja subskrypcji, zapis tokenu do `push_tokens`
4. **Trigger w DB** — po INSERT do `appointments` → kolejkuj push do klienta (przypomnienie 24h/2h)
5. **UI opt-in** — przycisk "Włącz powiadomienia" w profilu klienta i w onboardingu

### Kolejność realizacji
Etap 1 → Etap 2 → Etap 3 (każdy etap w osobnej wiadomości po zatwierdzeniu)
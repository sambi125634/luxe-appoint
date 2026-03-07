

## Problem

Panel admin po onboardingu wyświetla **mockowe dane** (hardcoded wizyty, przychody, statystyki) — identycznie jak demo. Nowy użytkownik widzi fałszywe dane zamiast czystego panelu ze wskazówkami. Brak auto-tutoriala prowadzącego przez sekcje panelu i wyjaśniającego co uzupełnić.

## Rozwiązanie

### 1. Guided Tour w panelu admin (nie tylko demo)

Przenieść i rozbudować istniejący `GuidedTour` z demo do panelu admin:
- Po zakończeniu onboardingu (pierwszy raz w `/admin`) — automatycznie uruchomić **Guided Tour** prowadzący przez każdą sekcję
- Każdy krok touru przełącza zakładkę w sidebarze i wyświetla modal z:
  - Opisem sekcji po polsku (co tu robisz, jakie dane wpisujesz)
  - Przycisk voice guidance (ElevenLabs) z wyjaśnieniem
  - Info o ograniczeniach gdy sekcja nie jest uzupełniona
  - Placeholder na wideo tutorial
- Tour obejmuje: Dashboard → Kalendarz → Klienci → Usługi → Pracownicy → Widgety → Ustawienia
- Przycisk "Uruchom samouczek" zawsze dostępny w sidebarze/headerze

### 2. Czyste dane zamiast mocków w DashboardHome

Zastąpić hardcoded mock data w `DashboardHome.tsx` rzeczywistymi zapytaniami do bazy:
- Wizyty dzisiejsze: `appointments` filtrowane po `salon_id` i dzisiejszej dacie
- KPI (przychód, obłożenie, no-show): z `appointments` + `transactions`
- Top usługi / top pracownicy: z `appointments` + `services` + `staff_members`
- Gdy brak danych — pokazać **empty state** z CTA: "Dodaj pierwszą wizytę", "Skonfiguruj usługi" itp.

### 3. Setup Checklist na dashboardzie

Widget "Konfiguracja salonu" widoczny dopóki wszystko nie jest uzupełnione:
- [ ] Dane salonu ✅ (po onboardingu)
- [ ] Godziny pracy ✅ (po onboardingu)  
- [ ] Usługi ✅ (po onboardingu)
- [ ] Pierwszy klient
- [ ] Pierwsza wizyta
- [ ] Widget rezerwacji osadzony
- Każdy item prowadzi do odpowiedniej sekcji

### 4. VideoTutorialCard + Voice w każdej kluczowej sekcji

Dodać `VideoTutorialCard` z polskim voice guidance w:
- Kalendarz: "Tutaj zarządzasz wizytami. Kliknij w wolny slot, aby dodać wizytę..."
- Klienci: "Lista wszystkich klientów Twojego salonu. Dodaj klientów ręcznie lub..."
- Usługi: "Zarządzaj swoimi usługami — cenami, czasem trwania, kategoriami..."
- Pracownicy: "Dodaj członków zespołu, przypisz im usługi i godziny pracy..."
- Ustawienia: "Skonfiguruj branding salonu, powiadomienia i integracje..."
- Widgety: "Skopiuj widget rezerwacji i osadź na swojej stronie..."

## Zmiany w plikach

1. **`src/components/admin/GuidedTour.tsx`** — nowy komponent (rozbudowana wersja demo GuidedTour), z pełnymi polskimi opisami, voice guidance, info o ograniczeniach per sekcja
2. **`src/components/admin/SetupChecklist.tsx`** — nowy widget z postępem konfiguracji, query do bazy
3. **`src/components/admin/DashboardHome.tsx`** — usunąć wszystkie mock data, zastąpić zapytaniami Supabase po `salon_id`, dodać empty states + checklist
4. **`src/pages/AdminDashboard.tsx`** — zintegrować GuidedTour (auto-start po onboardingu + przycisk re-start w headerze)
5. **`src/components/admin/ScheduleManagement.tsx`** — dodać VideoTutorialCard na górze
6. **`src/components/admin/ClientsManagement.tsx`** — dodać VideoTutorialCard
7. **`src/components/admin/ServicesManagement.tsx`** — dodać VideoTutorialCard
8. **`src/components/admin/StaffManagement.tsx`** — dodać VideoTutorialCard
9. **`src/components/admin/settings/SettingsModule.tsx`** — dodać VideoTutorialCard
10. **`src/components/admin/widgets/WidgetsManagement.tsx`** — dodać VideoTutorialCard

## Kolejność implementacji

1. Czyste dane w DashboardHome (usunięcie mocków → real queries + empty states)
2. Setup Checklist widget
3. Guided Tour w admin panelu z voice guidance
4. VideoTutorialCard w każdej sekcji
5. Przycisk "Uruchom samouczek" w sidebarze


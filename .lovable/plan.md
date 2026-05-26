
## Cel

Po onboardingu i tutorialu konto admina ma być „białą kartką" — żadne liczby/treści demo nie mogą się tam pojawić. Dodatkowo: uprościć kreator widgetu i naprawić problem z widoczną liczbą usług + uprościć tworzenie usługi.

---

## 1. Audyt demo-data leaków w panelu admin

### 1a. WidgetEditor → zakładka „Analityka"
**Plik:** `src/components/admin/widgets/WidgetEditor.tsx`
- Linie 1048, 1052 i sąsiednie: `formData.viewCount || mockFunnelData[0].value` — fallback do mocka kiedy realna wartość to 0.
- **Fix:** usunąć `mockFunnelData` z fallbacku. Zamiast tego pokazać empty state: „Brak danych — widget jeszcze nie ma wyświetleń. Udostępnij link, aby zacząć zbierać statystyki."
- Cały lejek (steps) ma używać wyłącznie realnych `viewCount`/`bookingCount` z bazy; jeśli 0 → pokazać szare słupki z etykietą „0".

### 1b. WidgetsManagement — lista kart widgetów
- `widget.viewCount` / `widget.bookingCount` są już z bazy (po starcie 0) → OK, bez zmian. Tylko weryfikacja, że `useBookingWidgets` zwraca realne liczby (a nie mock).

### 1c. Pełny przegląd reszty modułów
Dla każdego z poniższych plików sprawdzić, czy nie ma fallbacku „jeśli brak danych → pokaż mock":
- `src/modules/retention/*` (RetentionStats, RetentionOverview, RetentionHistory, RetentionDashboard, RetentionHealthBoard)
- `src/modules/referral/*` (ReferralDashboard, ReferralEngine, SilentFansDashboard, AmbassadorLeaderboard, GoogleReviewsManager, ReferralSettings, ReferralProgram)
- `src/modules/pixel/*` (PixelDashboard, PixelAttribution, LookalikeEngine, AudienceMappings, PixelHealthDashboard, PixelEventsLog, PixelSetupWizard)
- `src/modules/consultation/*`
- `src/modules/inventory/*` (InventoryDashboard, InventoryStats, ServiceRecipes, DeliveryMode, RecipeEditorDrawer)
- `src/modules/analytics/*` (TrueProfitDashboard już ok — używa `isDemo`)
- `src/components/admin/autopilot/*` (AutopilotOverview, AutopilotHistory, AutopilotScore, AutopilotFunctions, AutopilotSettings, AutopilotModule)
- `src/components/admin/dashboard/*` (WeeklyBriefWidget, WeeklyBriefHistory, TodayStaffCard, RevenuePredictionCard, RetentionFlowWidget)
- `src/components/admin/conversations/ConversationsModule.tsx`
- `src/components/admin/pipeline/PipelineModule.tsx`
- `src/components/admin/accounting/*` (StaffCompensationReport, AccountingModule)
- `src/components/admin/products/*`
- `src/components/admin/schedule/*` (ScheduleGridView, ScheduleTemplates, SmartScheduleHelpers, QuickBlockModal, WeekDuplication)
- `src/components/admin/settings/AutomationSettings.tsx`, `CommunicationSettings.tsx`
- `src/components/admin/staff/StaffInviteTab.tsx`, `StaffPermissionsTab.tsx`
- `src/components/admin/DashboardHome.tsx` (DEMO_APPOINTMENTS itd. — używane tylko gdy `isDemo=true` → OK)

**Zasada:** wszystkie hard-coded liczby/przykłady mogą być używane **wyłącznie** kiedy `isDemo === true` (czyli z `DemoPage.tsx`). W przeciwnym razie:
- Pusty wynik → empty state z ikoną + tekstem („Brak danych — pojawi się tutaj gdy…") + CTA prowadzącym do akcji.
- Nigdy nie pokazywać liczb przykładowych w realnym koncie.

### 1d. Test krzyżowy
Po zmianach: zalogować się na świeżo utworzonego admina i przeklikać wszystkie zakładki — żadnych „przykładowych" liczb.

---

## 2. Naprawa listy usług w nowym koncie

**Problem:** użytkownik widzi ~10 usług zamiast wszystkich zaimportowanych z Booksy.

### Hipotezy do sprawdzenia:
1. **Filter/paginacja** w `ServicesManagement.tsx` — może domyślnie ukrywa nieaktywne, jakąś kategorię lub limit 10.
2. **assignServicesToOwner** wstawia tylko część rekordów do `staff_services` — i frontend filtruje po przypisaniu do staff.
3. **Insert chunkami po 50** (linia 508) — chunk się udał, ale błąd cichy → część utracona.
4. **scanResult.services** zwracane przez `ai-profile-scanner` jest już ograniczone do ~10 (limit po stronie scrapera/AI).

**Działania:**
- Najpierw query SQL na świeżym koncie: `select count(*) from services where salon_id=…` — porównać z `count(*) from staff_services where staff_id=ownera`.
- Jeśli to filtr UI → wyłączyć/poszerzyć w `ServicesManagement.tsx`.
- Jeśli to scraper → zwiększyć limit w `supabase/functions/firecrawl-scrape/index.ts` lub `ai-profile-scanner` + dodać logging.
- Jeśli to `assignServicesToOwner` → naprawić batch insert (też chunkami).

---

## 3. Uproszczenie kreatora widgetu

**Plik:** `src/components/admin/widgets/WidgetEditor.tsx` + `WidgetsManagement.tsx`

### Cel
„Utwórz nowy widget" ma być szybkie i przyjemne — w 3 krokach zamiast wielozakładkowego edytora.

### Plan UX
1. **Quick-create modal** (zamiast od razu pełnego edytora):
   - Krok 1: nazwa kampanii + opcjonalnie opis (1 input).
   - Krok 2: które usługi (multi-select chipsów lub „wszystkie") + opcjonalna promocja (rabat %).
   - Krok 3: kolor akcentu (3 presety + custom) i CTA. Klik „Utwórz" → widget gotowy.
2. **Pełny edytor** dostępny później przez „Edytuj szczegóły" — tam całe zaawansowanie (analityka, formularz, prepayment, advanced).
3. Defaulty: skopiować z głównego widgetu salonu (theme, formFields, steps), żeby nowy widget od razu wyglądał spójnie.
4. Karty widgetów na liście: dodać duży CTA „+ Nowy widget kampanii" jako pierwszą kartę z gradientem (zachęca wizualnie).

### Techniczne
- Nowy komponent `src/components/admin/widgets/QuickWidgetCreateModal.tsx`.
- W `WidgetsManagement.tsx`: zmienić handler „Nowy widget" — najpierw quick modal, po zapisie opcjonalnie otworzyć pełny `WidgetEditor`.
- Zachować obecny `WidgetEditor` dla edycji.

---

## 4. Uproszczenie tworzenia usługi

**Plik:** `src/components/admin/ServicesManagement.tsx`

- Obecny dialog tworzenia usługi ma wiele pól (kategorie, warianty, media, opisy, benefity, materiały, prepayment...). 
- **Plan:** podzielić na „Quick add" (nazwa + kategoria + cena + czas → zapisz) i opcjonalny przycisk „Dodaj szczegóły" otwierający pełny edytor.
- Quick add powinien być domyślnym widokiem po kliknięciu „+ Nowa usługa".

---

## Kolejność implementacji

1. Audyt + usunięcie demo fallbacków (1a–1c) — najwyższy priorytet, bo to błąd UX.
2. Diagnoza i fix problemu z usługami (sekcja 2).
3. Quick widget create (sekcja 3).
4. Quick service create (sekcja 4).

## Ryzyka
- Usunięcie mock fallbacków może odsłonić puste sekcje wyglądające „pusto" — dlatego każdy fallback zastępujemy starannym empty state (ikona + komunikat + CTA), zgodnie z konwencją projektu.
- Quick modale nie mogą rozjechać się z istniejącymi modelami danych — używamy tych samych mutacji (`upsertWidget`, `createService`).

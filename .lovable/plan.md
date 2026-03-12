

# Plan: Pełna internacjonalizacja platformy (i18n audit)

## Diagnoza

Po audycie zidentyfikowałem **~40 komponentów** z hardkodowanymi polskimi stringami, które nie przechodzą przez system tłumaczeń `react-i18next`. Komponenty korzystające z `useTranslation` (ok. 44 pliki) działają poprawnie. Problem dotyczy reszty.

## Zakres zmian

### Grupa 1: Nawigacja i Layout
| Plik | Problem |
|------|---------|
| `AdminSidebar.tsx` | Tytuły sekcji: "Codzienna praca", "Marketing & Wzrost", etc. |
| `MobileMoreMenu.tsx` | Tytuły sekcji + opisy: "Odzyskiwanie klientów", "Kategorie i cennik", etc. |

### Grupa 2: Ustawienia (całość bez i18n)
| Plik | Problem |
|------|---------|
| `SalonProfileSettings.tsx` | Wszystkie labele: "Nazwa salonu", "Miasto", "Branding i wygląd", etc. |
| `BookingSettingsPanel.tsx` | Cały formularz |
| `NotificationSettings.tsx` | Cały formularz |
| `IntegrationSettings.tsx` | Cały formularz |
| `AutomationSettings.tsx` | Cały formularz: "Autopilot", "Godziny ciszy", "RODO i prywatność", etc. |

### Grupa 3: Dashboard i widgety
| Plik | Problem |
|------|---------|
| `DashboardHome.tsx` | Etykiety kart |
| `WeeklyBriefWidget.tsx` | "Autopilot zadziałał", etc. |
| `RevenuePredictionCard.tsx` | Etykiety |
| `SetupChecklist.tsx` | Cały checklist |
| `AutopilotStatusBar.tsx` | Wszystkie statusy |

### Grupa 4: SectionGuide (poradniki)
| Plik | Problem |
|------|---------|
| `SectionGuide.tsx` | 15 sekcji po ~5 stringów = ~75 stringów. "Pokaż poradnik", "Jak to zrobić", "Zwiń" |

### Grupa 5: Moduły specjalistyczne (cała zawartość)
| Moduł | Pliki |
|-------|-------|
| **Retention** | RetentionDashboard, RetentionHealthBoard, RetentionKPI, RetentionRadar, RetentionTimeline, SequenceConfig |
| **Pixel** | PixelDashboard, PixelSetupWizard, PixelAttribution, PixelEventsLog, PixelHealthDashboard, AudienceMappings, LookalikeEngine |
| **Analytics/TrueProfit** | TrueProfitDashboard, TodayProfitCard, MonthlyProfitCard, ServiceProfitRanking, ClientLTVRanking, CashflowForecast, IndustryBenchmarks, ProfitSetupWizard |
| **Referral** | ReferralDashboard, AmbassadorLeaderboard, SilentFansDashboard, StoriesGenerator |

### Grupa 6: Landing (nowe komponenty)
| Plik | Problem |
|------|---------|
| `TargetAudienceSection.tsx` | "Stworzone dla", nazwy branż |
| `NewFAQSection.tsx` | 6 pytań i odpowiedzi |
| `NewFinalCTASection.tsx` | CTA tekst |
| Inne nowe sekcje landing | Hardkodowane PL |

## Podejście implementacyjne

1. **Rozbudować `pl.json` i `en.json`** o brakujące klucze (~500+ nowych kluczy) w logicznych sekcjach:
   - `sidebarSections.*` — tytuły nawigacji
   - `sectionGuide.*` — poradniki
   - `automation.*` — ustawienia automatyzacji
   - `settingsModule.*` (rozszerzyć istniejącą sekcję)
   - `retention.*`, `pixel.*`, `analytics.*`, `referral.*` — moduły
   - `landing.*` (rozszerzyć) — nowe sekcje

2. **Dodać `useTranslation`** do każdego komponentu z hardkodowanymi stringami i zamienić stringi na `t("klucz")`.

3. **Zachować dane demo** (np. nazwy salonów, imiona) jako dane, nie jako tłumaczenia — te pozostają niezmienione.

## Kolejność implementacji (ze względu na objętość, 6 etapów)

1. Nawigacja (Sidebar + MobileMenu) + Ustawienia (5 komponentów)
2. Dashboard + SectionGuide
3. Moduł Retention + Pixel
4. Moduł Analytics/TrueProfit + Referral
5. Landing (nowe sekcje)
6. Pozostałe drobne komponenty

## Szacunkowy rozmiar zmian

- **~500 nowych kluczy** w obu plikach JSON
- **~40 plików** TSX do aktualizacji
- **0 zmian w bazie danych**

Ze względu na ogromny zakres, zaczynam od Grupy 1+2 (nawigacja + ustawienia), następnie kolejne grupy w osobnych wiadomościach.


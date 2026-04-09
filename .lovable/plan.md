

## Plan: Aktualizacja screenshotów w SystemFlowSection

### Mapowanie uploaded screenshots → kroki

| Krok | Temat | Obecny obraz | Nowy obraz (uploaded) |
|------|-------|--------------|-----------------------|
| 1 | Rezerwacja w 30s | step-booking.png | Screenshot 1 — widok rezerwacji z krokami i listą usług |
| 2 | Rozgrzewka przed wizytą | step-dashboard.png | Screenshot 4 — AI Autopilot z zaplanowanymi akcjami na dziś |
| 3 | Sekwencja 5 wizyt | step-retention.png | Screenshot 2 — Ścieżka klientki z etapami kanban |
| 4 | Radar Odejść | step-clients.png | Screenshot 3 — Powracalność klientek ze strefami ryzyka |
| 5 | Efekt Kuli Śnieżnej | step-clients.png | Screenshot 5 — Moduł poleceń z aktywnością ambasadorek |
| 6 | True Profit | step-dashboard.png | bez zmian (step-dashboard.png) |

### Zmiany

1. Skopiować 5 uploadowanych obrazów do `src/assets/screenshots/` jako:
   - `step-booking-new.png`
   - `step-autopilot.png`
   - `step-pipeline.png`
   - `step-radar.png`
   - `step-referral.png`

2. W `SystemFlowSection.tsx` — zaktualizować importy i przypisania `image` w tablicy `steps`

### Pliki do edycji
| Plik | Co |
|------|----|
| `src/assets/screenshots/` | 5 nowych plików graficznych |
| `src/components/landing/SystemFlowSection.tsx` | Zmiana importów i mapowania obrazów |


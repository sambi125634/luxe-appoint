

# Plan: Reorganizacja nawigacji bocznej

## Obecny stan

Sidebar ma 18 pozycji w jednej płaskiej liście bez logicznego grupowania. Mobile menu (`MobileMoreMenu`) ma grupowanie, ale zawiera nieaktualny wpis "Statystyki" (usunięty moduł).

## Proponowana struktura — grupy z nagłówkami sekcji

```text
── Codzienna praca ──────────
   Dashboard
   Kalendarz

── Klienci ──────────────────
   Klienci
   Konwersacje
   Konsultacje

── Marketing & Wzrost ───────
   Retencja
   Polecenia
   Pipeline          (owner)
   Meta Pixel
   Widgety           (owner)

── Zarządzanie ──────────────
   Usługi
   Personel
   Urlopy
   Produkty

── Finanse ──────────────────
   Raporty            (owner)
   True Profit

── System ───────────────────
   Ustawienia          (owner)
   Pomoc
```

## Zmiany

### 1. `AdminSidebar.tsx`
- Zmienić `allNavItems` z płaskiej tablicy na tablicę sekcji: `{ title: string; items: NavItem[] }[]`
- Renderować nagłówki sekcji (`<p className="text-xs text-muted-foreground uppercase px-4 pt-4 pb-1">`) przed grupą przycisków
- Filtrowanie `OWNER_ONLY_TABS` zachowane — sekcja chowa się jeśli wszystkie jej itemy są ukryte

### 2. `MobileMoreMenu.tsx`
- Usunąć wpis "Statystyki" (`tab: "stats"`)
- Zsynchronizować strukturę grup z sidebarową (dodać brakujące: Retention, Pixel, TrueProfit, Consultation, Referral)
- Zaktualizować sekcje: Codzienna praca / Klienci / Marketing / Zarządzanie / Finanse / System

### 3. `MobileAdminBottomBar.tsx`
- Sprawdzić czy bottom bar tabs są spójne (Dashboard, Calendar, Clients, More) — prawdopodobnie bez zmian

## Pliki do zmiany

| Plik | Zmiana |
|------|--------|
| `src/components/admin/AdminSidebar.tsx` | Grupowanie navItems w sekcje z nagłówkami |
| `src/components/mobile-admin/MobileMoreMenu.tsx` | Usunąć "stats", dodać brakujące moduły, nowy układ sekcji |


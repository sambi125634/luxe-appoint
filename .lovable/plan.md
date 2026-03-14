

# Reorganizacja kolejności sekcji w sidebarze

## Nowa struktura

```text
📌 Codzienna praca
   Dashboard
   Kalendarz
   Personel          ← przeniesiony z "Zespół"
   Urlopy            ← przeniesiony z "Zespół"

💇 Oferta            ← przeniesiony wyżej
   Usługi
   Produkty

👤 Klienci
   Klienci
   Konwersacje
   Konsultacje
   Pipeline

📣 Marketing
   Retencja
   Polecenia
   Pixel
   Widgety

💰 Finanse
   Raporty
   True Profit

⚙ System
   Ustawienia
   Pomoc
```

## Zmiany vs obecny stan
1. **Zespół (Staff + Time Off) → wchłonięty do "Codzienna praca"** — kalendarz + zarządzanie zespołem w jednym miejscu
2. **Oferta przeniesiona nad Klienci** — najpierw definiujesz co oferujesz, potem kto kupuje
3. **Sekcja "Zespół" znika** — jej elementy są teraz w "Codzienna praca"

## Pliki do edycji
- `src/components/admin/AdminSidebar.tsx` — zmiana `allSections`
- `src/components/mobile-admin/MobileMoreMenu.tsx` — analogiczna zmiana
- `src/i18n/locales/pl.json` + `en.json` — usunięcie klucza `sidebar.team` (nie jest już potrzebny)


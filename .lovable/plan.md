

# Reorganizacja nawigacji bocznej (Sidebar)

## Problem
Obecne grupy mieszają konteksty -- np. "Zarządzanie" zawiera zarówno ofertę (Usługi, Produkty) jak i HR (Personel, Urlopy), a "Marketing" łączy narzędzia analityczne z widgetami rezerwacyjnymi.

## Proponowana nowa struktura

```text
OBECNA                              NOWA
─────────                           ─────
📌 Codzienna praca                  📌 Codzienna praca
   Dashboard                           Dashboard
   Kalendarz                           Kalendarz

👤 Klienci                          👤 Klienci
   Klienci                             Klienci
   Konwersacje                         Konwersacje
   Konsultacje                         Konsultacje
                                       Pipeline  ← przeniesiony z Marketingu
                                         (pipeline = lejek klientów)

📣 Marketing & Wzrost               📣 Marketing
   Retencja                             Retencja
   Polecenia                            Polecenia
   Pipeline  → przeniesiony             Pixel
   Pixel                                Widgety
   Widgety                                (widgety = narzędzia pozyskiwania)

🏪 Zarządzanie                      💇 Oferta
   Usługi                              Usługi
   Produkty                             Produkty
   Personel  → przeniesiony
   Urlopy    → przeniesiony         👥 Zespół  ← nowa grupa
                                       Personel
💰 Finanse                              Urlopy
   Raporty
   True Profit                      💰 Finanse
                                       Raporty
⚙ System                               True Profit
   Ustawienia
   Pomoc                            ⚙ System
                                       Ustawienia
                                       Pomoc
```

## Uzasadnienie zmian

- **Pipeline → Klienci**: Pipeline to lejek sprzedażowy oparty na kontaktach/klientach, logicznie pasuje do sekcji klientów
- **"Zarządzanie" rozdzielone na "Oferta" i "Zespół"**: Usługi i Produkty to katalog oferty salonu; Personel i Urlopy to zarządzanie zespołem -- dwa różne konteksty
- **Marketing** zostaje spójny: narzędzia do pozyskiwania i utrzymania klientów (retencja, polecenia, pixel, widgety)

## Zakres zmian

### Pliki do edycji
1. **`src/components/admin/AdminSidebar.tsx`** -- zmiana struktury `allSections` (przeniesienie Pipeline, podział Zarządzania)
2. **`src/components/mobile-admin/MobileMoreMenu.tsx`** -- analogiczna zmiana `menuSections`
3. **`src/i18n/locales/pl.json`** + **`en.json`** -- dodanie kluczy `sidebar.offer` i `sidebar.team`

Zmiany dotyczą wyłącznie kolejności/grupowania elementów nawigacji. Żadne komponenty ani logika modułów się nie zmieniają.


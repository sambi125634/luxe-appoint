

# Audyt: Ustawienia vs konfiguracja w modułach

## Co jest obecnie w zakładce Ustawienia

| Tab | Pokrywa |
|-----|---------|
| Profil salonu | Nazwa, opis, adres, telefon, email, logo, kolory motywu |
| Rezerwacje | Okno rezerwacji, sloty, bufor, zaliczki, polityka anulowania, auto-confirm |
| Powiadomienia | Email (potwierdzenie + przypomnienie), SMS (SMSAPI.pl BYOP), szablony |
| Integracje | Przelewy24, Google Calendar |

## Moduły z WŁASNĄ konfiguracją (poza Ustawieniami)

| Moduł | Gdzie się konfiguruje | Czego dotyczy |
|-------|----------------------|---------------|
| **Autopilot** | `autopilot_config` — panel w module | Godziny ciszy, trigger days retencji, max wiadomości/klienta, AI suggestions |
| **Meta Pixel** | `pixel_config` — PixelSetupWizard | Pixel ID, access token, ad account ID, sync interval |
| **Retencja** | `retention_sequences` — SequenceConfig | Sekwencje wiadomości, trigger days, szablony, incentives |
| **Polecenia (Referral)** | W module — ReferralEngine | Typ nagrody, kwoty, kody |
| **Konsultacje** | W module — CardBuilder | Szablony kart konsultacyjnych |
| **Widgety** | W module — WidgetEditor | Konfiguracja per widget |
| **True Profit** | W module — ProfitSetupWizard | Koszty stałe, czynsz, media |

## Co BRAKUJE w Ustawieniach (powinno tam być)

1. **Autopilot — ustawienia globalne** — godziny ciszy (20:00-08:00), max wiadomości na klient/tydzień, włącznik AI suggestions. To są cross-cutting concerns wpływające na SMS, email, retencję.
2. **Domyślna stawka VAT** — brak globalnego ustawienia; każda usługa ma swoją, ale nie ma default.
3. **Strefa czasowa / format daty** — zakładany jest PL, ale brak jawnego ustawienia.
4. **RODO / zgody marketingowe** — brak panelu do konfiguracji tekstu zgody, retention policy danych.
5. **Link do konfiguracji modułów** — użytkownik nie wie, że Pixel czy Retencja mają własne ustawienia do skonfigurowania.

## Proponowany plan

### Dodać 5. tab: "Automatyzacja" do SettingsModule

Nowa zakładka zbierająca cross-cutting settings, które wpływają na wiele modułów:

**Sekcja 1 — Autopilot (globalne)**
- Switch: Autopilot aktywny/wstrzymany
- Godziny ciszy: start/end (time input)
- Max wiadomości na klienta (dni): select 3/5/7/14
- AI suggestions: switch

**Sekcja 2 — Domyślne ustawienia**
- Domyślna stawka VAT: select 0%/8%/23%
- Strefa czasowa: select (domyślnie Europe/Warsaw)

**Sekcja 3 — RODO i prywatność**
- Tekst zgody marketingowej (textarea)
- Okres przechowywania danych klientów: select 1/2/3/5 lat

**Sekcja 4 — Status modułów (read-only hub)**
- Lista modułów z ikoną statusu (skonfigurowany / wymaga konfiguracji)
- Przycisk "Przejdź do konfiguracji" → zmienia tab na dany moduł
- Moduły: Pixel, Retencja, Polecenia, True Profit, Konsultacje

### Zmiany w plikach

| Plik | Zmiana |
|------|--------|
| `src/components/admin/settings/AutomationSettings.tsx` | **Nowy** — panel z sekcjami Autopilot, Defaults, RODO, Module Hub |
| `src/components/admin/settings/SettingsModule.tsx` | Dodać 5. tab "Automatyzacja" z ikoną `Zap` |
| `src/components/admin/settings/types.ts` | Dodać `"automation"` do `SettingsTabType` |
| `src/hooks/useSalonSettings.ts` | Dodać `AutomationSettings` interface i pola: `defaultVatRate`, `timezone`, `gdprConsentText`, `dataRetentionYears` do `SalonSettings` |

### Logika Module Hub

Komponent wyświetli karty z ikonami dla każdego modułu wymagającego konfiguracji. Kliknięcie "Przejdź" wywołuje `onTabChange` z parent `AdminDashboard`, przekierowując do odpowiedniego modułu. Status (skonfigurowany/nie) będzie sprawdzany na podstawie:
- Pixel: czy `pixel_config` istnieje i `is_active`
- Retencja: czy `retention_sequences` count > 0
- True Profit: czy koszty stałe zostały uzupełnione
- Referral: czy kody poleceń istnieją

### Brak zmian w bazie danych
Wszystkie nowe pola (`defaultVatRate`, `timezone`, `gdprConsentText`, `dataRetentionYears`) będą przechowywane w istniejącej kolumnie `settings` JSONB w tabeli `salons`. Autopilot config już ma własną tabelę.


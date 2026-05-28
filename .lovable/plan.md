
# Porządki w Ustawieniach — usunięcie duplikatów i zbędnych sekcji

Po przejrzeniu wszystkich 10 zakładek znalazłem 3 realne duplikaty danych (te same pola w 2 miejscach, czasem zapisywane do różnych kolumn w bazie — czyli "rozjazd") oraz 4 sekcje, które nic nie wnoszą lub mylą użytkownika.

---

## 1. Duplikaty do wyeliminowania

### A) Przedpłaty — w 2 miejscach, w 2 różnych kolumnach DB
- **Rezerwacje → Przedpłaty**: pełen panel (włącz, typ: kwota/%/100%, kwota, wymagaj dla high-risk, wymagaj dla nowych). Zapis: `salons.settings.booking.prepayment` (JSONB).
- **Płatności → Polityka przedpłat**: te same dwa pola (Switch "Wymagaj przedpłaty" + `depositPercent`). Zapis: `salons.payment_required` + `salons.deposit_percent` (osobne kolumny).
- **Skutek**: użytkownik widzi 2 różne wartości w 2 zakładkach, nie wie która "działa".

**Decyzja**: usuwam kafelek "Polityka przedpłat" z zakładki Płatności. Cała konfiguracja przedpłat zostaje **wyłącznie** w Rezerwacje → Przedpłaty (tam jest pełniejsza). Dorabiam adapter, żeby przy zapisie ustawień rezerwacji nadpisać też `payment_required` i `deposit_percent` (bo z tych kolumn korzysta logika P24 i widget) — dzięki temu jedno źródło prawdy, ale stara logika dalej działa.

### B) Przelewy24 — konfigurowane w 2 miejscach
- **Płatności → Przelewy24**: Merchant ID, POS ID. Zapis: `salons.p24_merchant_id`, `salons.p24_pos_id`.
- **Integracje → Przelewy24**: Merchant ID, POS ID, API key, CRC key, sandbox toggle. Zapis: `salons.settings.integrations.przelewy24`.
- **Skutek**: dane się rozjeżdżają, nie wiadomo skąd Edge Function `create-payment-p24` faktycznie czyta klucze.

**Decyzja**: usuwam kafelek "Przelewy24" z zakładki Płatności. Pełna konfiguracja zostaje w Integracje → Przelewy24. W zakładce Płatności zostawiam tylko sygnał statusu (badge "Aktywne / Skonfiguruj w Integracjach") z przyciskiem przenoszącym do Integracji. Edge functions już teraz czytają z `settings.integrations.przelewy24`, więc dodatkowo zsynchronizuję wartości do kolumn `p24_merchant_id/p24_pos_id` przy zapisie integracji (zachowa wsteczną kompatybilność).

### C) Stawka VAT — w 2 miejscach
- **Płatności → Waluta i VAT**: pole `vatRate` (lokalny state, **nigdzie nie zapisywany do bazy** — czysty placeholder).
- **Automatyzacja → Domyślne ustawienia**: `defaultVatRate` (działa, zapis do `settings.automation`).

**Decyzja**: usuwam kafelek "Waluta i VAT" z Płatności (i tak nie działał). Waluta jest hardcoded "PLN" — nie warto pokazywać. VAT zostaje tylko w Automatyzacji.

---

## 2. Sprzątanie zakładki "Automatyzacja"

Aktualnie ma 3 sekcje, z czego 2 są problematyczne:

- **Domyślne ustawienia** (VAT, strefa czasowa) — zostawiam. Strefa czasowa Polski jest sensownym ustawieniem, VAT też (po usunięciu duplikatu z Płatności).
- **RODO i prywatność** (tekst zgody marketingowej + okres przechowywania danych) — **usuwam okres przechowywania** (użytkownik nie powinien tego wybierać, to nasza decyzja platformowa, 3 lata standard). Tekst zgody marketingowej zostawiam — to legitne dla każdego salonu inne.
- **Status modułów** (Meta Pixel, Retencja, Polecenia, TrueProfit, Konsultacje) — **usuwam całą sekcję**. Powody:
  - Meta Pixel został wycofany z UI klienta (zgodnie z memory `meta-pixel-internal-service`) — pokazywanie go to bug.
  - "TrueProfit — wymaga konfiguracji" bez możliwości kliknięcia (brak `onNavigateToModule` dla `analytics`).
  - To duplikuje informacje, które już są w sidebarze ich modułów.
  - Status Autopilota i tak jest pokazany w `AutopilotStatusBar` na górze.

Po sprzątaniu zakładka nazywa się prościej, np. **"Domyślne i AI Autopilot"** (lub zostawiam "Automatyzacja").

---

## 3. Zakładka "Prawne" — kto edytuje regulamin?

Aktualnie: pełny edytor Markdown dla Regulaminu / Polityki prywatności / Polityki cookies + przełącznik publikacji + osobny URL per salon.

**Pytanie do Ciebie** — to decyzja produktowa, nie mogę jej podjąć sam:

1. **Pełna edycja zostaje** (status quo) — właścicielka odpowiada za zgodność prawną swoich dokumentów. Argumentem za: każdy salon ma inną nazwę firmy, NIP, adres administratora danych.
2. **Tylko podgląd + uzupełnianie placeholderów** (np. `[Nazwa salonu]`, `[NIP]`, `[email kontaktowy]`) — szablony są nasze, ona tylko wypełnia dane. **To rekomenduję** — chroni przed źle napisanym regulaminem, dalej spełnia RODO (administrator danych = jej salon).
3. **Całkowicie poza ustawieniami** — my hostujemy uniwersalne dokumenty platformy, ona ich nie dotyka. Ryzyko: nie ma jej danych jako administratora.

Domyślnie zakładam **opcję 2** — przebuduję edytor na formularz z polami (Nazwa firmy, NIP, REGON, Adres, Email kontaktowy RODO, Telefon), które wstrzykuję w szablony przy publikacji. Sam tekst regulaminu / polityki staje się read-only.

Sekcja "Wnioski o usunięcie danych (RODO)" i "Strefa niebezpieczna" zostają — to legit.

---

## 4. Eksport danych — bez zmian
OK, zostawiam.

---

## Szczegóły techniczne

**Pliki do zmiany:**
- `src/components/admin/settings/PaymentsSettings.tsx` — usunąć kafelki "Polityka przedpłat", "Przelewy24" (zostawić tylko status), "Waluta i VAT". Zakładka staje się bardzo cienka — rozważyć jej całkowite scalenie z "Integracje" (zob. "Otwarta decyzja" poniżej).
- `src/components/admin/settings/IntegrationSettings.tsx` — w mutacji zapisu Przelewy24 dodać synchronizację do kolumn `salons.p24_merchant_id` / `p24_pos_id`.
- `src/hooks/useSalonSettings.ts` — w `updateSettings('booking', ...)` przy zmianie `prepayment` zsynchronizować `payment_required` (= `prepayment.enabled`) i `deposit_percent` (= `prepayment.amount` gdy `type='percentage'`, inaczej 0) na poziomie kolumn `salons`.
- `src/components/admin/settings/AutomationSettings.tsx` — usunąć sekcję "Status modułów" całkowicie, usunąć select "Okres przechowywania danych".
- `src/components/admin/settings/LegalSettings.tsx` — przebudowa edytora Markdown na formularz danych administratora (opcja 2 powyżej), jeśli zatwierdzisz.
- `src/components/admin/settings/SettingsModule.tsx` — ewentualne usunięcie zakładki "Płatności" jeśli jej zawartość się wyzeruje.
- Klucze i18n w `src/i18n/locales/pl.json` — wyczyścić nieużywane.

**Bez zmian w DB.** Kolumny `p24_merchant_id`, `p24_pos_id`, `payment_required`, `deposit_percent` zostają w `salons` — są używane przez edge functions (`create-payment-p24`, `verify-payment-p24`). Tylko UI przestaje pisać do nich z 2 miejsc.

---

## Otwarta decyzja przed wdrożeniem

Po usunięciu duplikatów z zakładki **Płatności** zostaje tam tylko: badge statusu Przelewy24 + placeholder "Stripe wkrótce". To za mało na osobną zakładkę.

**Dwie opcje — wybierz którą wolisz:**

**A)** Zostawiam zakładkę "Płatności" jako cienki dashboard statusu (badge P24, Stripe wkrótce, link do Integracji). Czytelne, ale lekko zbędne.

**B)** Usuwam zakładkę "Płatności" w całości. Wszystko związane z płatnościami trafia do **Integracji** (P24, Stripe wkrótce) i **Rezerwacji** (przedpłaty). Z 10 zakładek robi się 9 — czyściej.

Rekomenduję **B**. Jeśli się zgadzasz, dorobię też do sekcji Przelewy24 w Integracjach krótki blok "Polityka przedpłat — skonfigurowano w: Rezerwacje" z linkiem cross-navigacyjnym, żeby kontekst był spójny.

**Powiedz: opcja A czy B, oraz Legal opcja 1, 2 czy 3** — wtedy implementuję wszystko w jednym przebiegu.

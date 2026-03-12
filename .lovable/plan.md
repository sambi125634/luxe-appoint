

# Plan: Usunięcie referencji GoHighLevel z frontendu

## Problem
W wielu miejscach frontendu widoczne sa nazwy "GoHighLevel" / "GHL" -- w konwersacjach, pipeline i ustawieniach integracji. Klienci nie powinni wiedziec o tym systemie zewnetrznym.

## Zakres zmian

### 1. Konwersacje -- usun referencje GHL z UI
**Pliki:** `ConversationView.tsx`, `ContactsList.tsx`

- `ConversationView.tsx` linia 132: zmien "viewProfileInGHL" na "Zobacz profil klientki" (link do profilu w CRM wewnetrznym)
- `ConversationView.tsx` linia 249: usun caly paragraf `messagesSentViaGHL` -- informacja niepotrzebna
- `ContactsList.tsx` linia 142-146: usun sekcje "Demo notice" z `demoSyncNote` o synchronizacji z GHL

### 2. Pipeline -- usun referencje GHL
**Pliki:** `ContactDetailModal.tsx`, `PipelineModule.tsx`

- `ContactDetailModal.tsx` linia 245-247: zmien tekst "Zmiana stage'u aktywuje odpowiedni workflow w GoHighLevel" na "Zmiana etapu aktywuje odpowiedni workflow automatyzacji"
- `PipelineModule.tsx` linia 179: tekst o konfiguracji CRM -- pozostawic jako ogolny tekst bez nazwy GHL (juz jest ok, nie wspomina GHL)

### 3. Ustawienia integracji -- usun sekcje GHL
**Plik:** `IntegrationSettings.tsx`

- Linie 315-485: usun cala karte "GoHighLevel (GHL)" z ustawien integracji. Klienci nie powinni widziec tej konfiguracji -- bedzie ona robiona przez nas po stronie backendu.

### 4. Tlumaczenia -- zaktualizuj i18n
**Pliki:** `en.json`, `pl.json`

- Zmien `conversations.demoSyncNote` -- usun lub zamien na neutralny tekst
- Zmien `conversations.viewProfileInGHL` → `conversations.viewProfile` = "View profile" / "Zobacz profil"
- Zmien `conversations.messagesSentViaGHL` → usun lub zamien na "Wiadomosci sa wysylane z Twojego numeru salonu"
- Zmien `pipeline.demoDescription` -- usun "GoHighLevel", zamien na "W wersji produkcyjnej zmiany synchronizuja sie automatycznie"
- Zmien `pipeline.stageChangeNote` -- usun "GoHighLevel", zamien na neutralny tekst

### 5. Typy -- usun prefiksy ghl z typow (wewnetrzna zmiana)
**Plik:** `conversations/types.ts`

- `ghlContactId` → `externalContactId`
- `ghlConversationId` → `externalConversationId`
- `ghlMessageId` → `externalMessageId`

Odpowiednio zaktualizowac demo dane w `ConversationsModule.tsx`.

### 6. Hook useSalonSettings -- usun typ GHL settings z widocznosci
Pozostawic w kodzie (potrzebne backendowo), ale ustawienia GHL nie beda widoczne na UI.

## Pliki do zmiany

| Plik | Akcja |
|------|-------|
| `src/components/admin/conversations/ConversationView.tsx` | Usun linie GHL |
| `src/components/admin/conversations/ContactsList.tsx` | Usun demo notice |
| `src/components/admin/conversations/ConversationsModule.tsx` | Zmien ghl prefiksy |
| `src/components/admin/conversations/types.ts` | Zmien nazwy pol |
| `src/components/admin/pipeline/ContactDetailModal.tsx` | Zmien tekst |
| `src/components/admin/settings/IntegrationSettings.tsx` | Usun karte GHL |
| `src/i18n/locales/en.json` | Zaktualizuj tlumaczenia |
| `src/i18n/locales/pl.json` | Zaktualizuj tlumaczenia |


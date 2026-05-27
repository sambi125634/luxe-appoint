## Cel
Zakładka **Konwersacje** po imporcie listy klientów nie powinna zalewać widoku pustymi wątkami. Pokazujemy tylko realne rozmowy (≥1 wiadomość), a nową rozmowę można zacząć z dowolnym klientem przez przycisk **„Nowa konwersacja"**.

## Zmiany

### 1. `src/hooks/useConversations.ts`
Filtrujemy listę kontaktów: zwracamy tylko klientów, dla których istnieje wpis w `conversation_messages` (czyli `lastByClient.has(c.id)`). Zamiast `clients.map(...)` → `clients.filter(c => lastByClient.has(c.id)).map(...)`. Sortowanie po `lastMessageAt` malejąco.

### 2. `src/components/admin/conversations/ConversationsModule.tsx`
- Nad listą kontaktów dodajemy przycisk **„＋ Nowa konwersacja"** (primary, full-width w panelu listy).
- Klik otwiera modal `NewConversationDialog` — wyszukiwarka klientów (po imieniu, telefonie, e-mailu) oparta o `useClients()` / istniejące zapytanie do tabeli `clients`. Lista z wirtualnym scrollem dla 1000+ rekordów.
- Wybór klienta → wybór kanału (SMS / Email / WhatsApp) → pole pierwszej wiadomości → `useSendMessage()`.
- Po wysłaniu: dialog się zamyka, refetch `conv-contacts`, automatycznie otwieramy nowo utworzony wątek (`setSelectedContactId`).

### 3. Empty state listy
Gdy `contacts.length === 0`:
- Ikona + nagłówek „Brak konwersacji"
- Podtekst: „Twoi klienci są zapisani w bazie. Zacznij rozmowę, gdy będziesz gotowa."
- CTA: ten sam przycisk „Nowa konwersacja"

### 4. Nowy komponent
`src/components/admin/conversations/NewConversationDialog.tsx` — modal z 3 krokami w jednym widoku:
1. Search input + lista klientów (max 50 wyników, debounce 200 ms)
2. Wybór kanału (3 przyciski-segmenty)
3. Textarea + przycisk „Wyślij"

## Czego NIE ruszamy
- Schema bazy — `conversation_messages` zostaje bez zmian.
- RLS, edge functions, integracje SMS/Email — bez zmian.
- Inne moduły (CRM, Klienci) — bez zmian; klienci dalej są w pełnej liście w zakładce „Klienci".

## Rezultat
Po imporcie 500 klientów w **Konwersacjach** widać 0 wątków + duży CTA. Właściciel klika „Nowa konwersacja", wyszukuje klientkę, wybiera kanał, pisze, wysyła. Wątek pojawia się na liście dopiero teraz. Czysto, skalowalnie, zgodnie z paradygmatem Intercom/Front.
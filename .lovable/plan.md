

# Plan: Strona /demo-agent z agentem głosowym Retell AI

## Cel
Nowa strona `/demo-agent` z przyciskiem uruchamiającym rozmowę głosową z agentem Retell AI w przeglądarce (WebRTC, bez telefonu).

## Architektura

```text
Użytkownik klika "Porozmawiaj z agentem"
        ↓
Edge Function: create-retell-web-call
  → POST https://api.retellai.com/v2/create-web-call
  → zwraca access_token
        ↓
Frontend: RetellWebClient.startCall({ accessToken })
  → rozmowa głosowa w przeglądarce
```

## Wymagane dane od Ciebie
- **RETELL_API_KEY** — klucz API z dashboardu Retell AI (zostanie zapisany jako secret)
- **Agent ID** — ID agenta z Retell AI (będzie w kodzie edge function)

## Kroki implementacji

### 1. Zapisanie secretu RETELL_API_KEY
Poproszę Cię o wklejenie klucza API z Retell AI.

### 2. Edge Function `create-retell-web-call`
- Przyjmuje `{ agent_id }` z frontendu
- Wywołuje `POST https://api.retellai.com/v2/create-web-call` z API key
- Zwraca `access_token` do frontendu
- CORS headers, walidacja inputu

### 3. Instalacja `retell-client-js-sdk`
Dodanie pakietu npm do projektu.

### 4. Strona `/demo-agent` (nowy plik `src/pages/DemoAgentPage.tsx`)
- Design premium zgodny z design system (bg `#F5F3FA`, karty, Plus Jakarta Sans)
- Nagłówek + opis czym jest agent AI
- Przycisk CTA "Porozmawiaj z agentem" → uruchamia rozmowę
- Stany UI: idle → connecting → active (z animacją pulsujących fal) → ended
- Przycisk "Zakończ rozmowę" w trakcie połączenia
- Eventy: `call_started`, `call_ended`, `agent_start_talking`, `agent_stop_talking`, `error`
- Framer-motion animacje (fade-in, pulse na aktywnym mikrofonie)
- i18n (klucze PL + EN)

### 5. Routing
Dodanie `<Route path="/demo-agent" element={<DemoAgentPage />} />` w `App.tsx`.

### 6. Link w funnelu
Opcjonalnie: dodanie przycisku/linku do `/demo-agent` po zakończeniu demo bookingu lub na landing page.

## Co NIE zmieni się
- Żadne istniejące komponenty nie będą modyfikowane (poza App.tsx — nowa trasa)
- Brak zmian w bazie danych
- Brak zmian w stylach globalnych


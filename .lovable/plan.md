

# Plan: Uproszczenie kroku 4 — "Twój link jest gotowy"

## Zmiana koncepcji

Obecny krok 3 (Widget Install) zawiera iframe embed code, taby WordPress/Squarespace/Email — zbyt techniczne dla właścicielki salonu. Zastąpić uproszczoną wersją z linkiem + szybkie udostępnianie (Instagram bio, WhatsApp, kopiuj link).

Technikalia widgetowe (embed code, WordPress, Squarespace) przeniesione do checklisty w dashboardzie (już istnieje element "bookingWidget" w `SetupChecklist.tsx`).

## Zmiany w `src/pages/OnboardingPage.tsx`

### Krok 3 (step === 3) — nowa zawartość:
- Nagłówek: "🎉 Twój link do rezerwacji jest gotowy!"
- Duży, czytelny link z przyciskiem kopiowania i podglądu
- Trzy przyciski szybkiego udostępniania:
  - 📱 **Dodaj do bio na Instagramie** — kopiuje link
  - 💬 **Wyślij przez WhatsApp** — otwiera `https://wa.me/?text=...`
  - 📋 **Kopiuj link** — kopiuj do schowka
- Mikro-copy: "Kod embed do strony www znajdziesz w panelu po konfiguracji."
- Usunąć: `Tabs` z WordPress/Squarespace/Email, `embedCode` display, `widgetTab` state

### Krok 5 (celebration) — drobna zmiana:
- W podsumowaniu zmienić "Widget rezerwacji → Gotowy" na "Link do rezerwacji → Udostępniony"

### STEPS constant:
- Zmienić krok 4 z `{ title: "Widget", icon: Code2 }` na `{ title: "Twój link", icon: Link2 }`

### Czyszczenie:
- Usunąć `widgetTab` state i `embedCode` const (nieużywane po zmianie)
- Usunąć import `Tabs, TabsList, TabsTrigger, TabsContent` jeśli nieużywane gdzie indziej
- Usunąć import `Code2` (zastąpione `Link2` już importowane)

## Plik do edycji

| Plik | Zmiana |
|------|--------|
| `src/pages/OnboardingPage.tsx` | Uproszczenie step 3, cleanup imports/state |

Brak zmian w bazie danych. Checklist w dashboardzie już wskazuje na zakładkę "widgets" — to wystarczy.


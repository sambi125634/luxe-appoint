

## Plan: Zwijane sekcje w sidebarze

### Zmiana

**Plik: `src/components/admin/AdminSidebar.tsx`**

Zamienić statyczne `<div>` + `<p>` (nagłówek sekcji) + `<ul>` na komponent `Collapsible` z `@radix-ui/react-collapsible` (już dostępny w `src/components/ui/collapsible.tsx`).

Każda sekcja stanie się rozwijana/zwijana:
- Nagłówek sekcji (`CODZIENNA PRACA`, `KLIENCI`, etc.) będzie `CollapsibleTrigger` z ikoną `ChevronDown` obracającą się przy zwijaniu
- Lista elementów będzie w `CollapsibleContent`
- Sekcja zawierająca aktywny tab będzie domyślnie otwarta (`defaultOpen`)
- Pozostałe sekcje też domyślnie otwarte (użytkownik może je zwinąć)

### Szczegóły techniczne

1. Import `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` z `@/components/ui/collapsible`
2. Import `ChevronDown` z `lucide-react`
3. Użycie `useState` do śledzenia stanu otwartych sekcji (opcjonalnie — Radix obsługuje to wewnętrznie z `defaultOpen`)
4. Nagłówek sekcji: kliknięcie zwija/rozwija listę pod spodem
5. Animacja: `CollapsibleContent` z transition (Radix obsługuje to natywnie)

### Efekt
- Schludniejszy interfejs — możliwość zwinięcia sekcji, których się aktualnie nie używa
- Wszystkie sekcje domyślnie otwarte (żadna funkcja nie jest ukryta)
- Sekcja z aktywnym tabem zawsze otwarta


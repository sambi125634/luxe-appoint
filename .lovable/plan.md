

# Dodanie metryk biznesowych (LTV) do listy klientek

## Co jest obecnie
`ClientListItem` już wyświetla: liczbę wizyt, łączne wydatki (zł), ostatnią wizytę i dni od ostatniej wizyty. Brakuje:
- **Średnia wartość wizyty** (totalSpent / totalVisits)
- **Status retencji** — kolorowa kropka (zielona/żółta/pomarańczowa/czerwona) w zależności od dni od ostatniej wizyty

## Zmiany w `src/components/admin/clients/ClientListItem.tsx`

### 1. Przeprojektowanie sekcji statystyk (prawa strona)
Zastąpić obecny prosty blok "X wizyt / Y zł" bardziej informacyjnym mini-panelem:

```text
┌─────────────────────────────────────────────────────────────────┐
│ [Avatar] Imię Nazwisko ⭐  [RiskBadge]     🟢  LTV: 4 800 zł  │
│          📞 tel  ✉ email                    24 wizyty • śr. 200 zł │
│                                              ost. wizyta: 3 dni temu │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Logika statusu retencji
Oparta na `daysSinceLastVisit`:
- **Zielona** (●) — do 30 dni — "Aktywna"
- **Żółta** (●) — 31-60 dni — "Uwaga"
- **Pomarańczowa** (●) — 61-90 dni — "Ryzyko"
- **Czerwona** (●) — 90+ dni lub brak wizyt — "Utracona"

Renderowana jako mała kolorowa kropka + krótki label obok LTV.

### 3. Średnia wartość wizyty
`const avgVisitValue = client.totalVisits > 0 ? Math.round(client.totalSpent / client.totalVisits) : 0;`

Wyświetlana pod liczbą wizyt w formacie "śr. 200 zł/wizytę".

### Plik do edycji
- `src/components/admin/clients/ClientListItem.tsx` — rozbudowa sekcji prawej strony o metryki LTV, średnią wizytę i status retencji

Brak zmian w bazie danych — wszystkie dane do wyliczenia już istnieją w interfejsie komponentu (`totalVisits`, `totalSpent`, `lastVisit`).


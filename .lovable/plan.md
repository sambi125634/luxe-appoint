

# Nowa zakładka "Preferencje zakupowe" w module Klienci

## Cel
Trzecia zakładka obok "Lista klientów" i "Grupy zakupowe", która grupuje klientów wg ulubionych kategorii usług (na podstawie historii wizyt). Kliknięcie w kategorię pokazuje listę klientów z liczbą wizyt, wydaną kwotą i ulubionymi usługami w tej kategorii.

## Zmiany

### Plik 1: `src/components/admin/clients/ServicePreferences.tsx` (nowy)
Nowy komponent wyświetlający:
- **Karty kategorii** — każda kategoria usługowa (np. "Mezoterapia", "Manicure & Pedicure") jako karta z:
  - Ikoną/emoji kategorii
  - Liczbą klientów
  - Łącznym przychodem z tej kategorii
  - Średnią liczbą wizyt na klienta
  - Progress bar pokazujący udział % w całości
- **Kliknięcie karty** → rozwija listę klientów przypisanych do tej kategorii (posortowanych wg wydanej kwoty), z:
  - Imieniem i nazwiskiem
  - Liczbą wizyt w tej kategorii
  - Kwotą wydaną w tej kategorii
  - Ostatnią wizytą
  - Najpopularniejszą usługą klienta w tej kategorii
- **Wskazówka remarketingowa** przy każdej kategorii — np. "12 klientek nie korzystało z Mezoterapii od 60+ dni — rozważ kampanię reaktywacyjną"

Props:
```typescript
interface ServicePreferencesProps {
  clients: Client[];
  onSelectClient?: (clientId: string) => void;
}
```

Logika grupowania: iteracja po `client.visits` → grupowanie po `visit.category` → zliczanie per klient per kategoria, z wyciągnięciem top usługi i dat.

### Plik 2: `src/components/admin/ClientsManagement.tsx`
- Rozszerzyć `mainViewTab` state z `"list" | "groups"` na `"list" | "groups" | "preferences"`
- Dodać trzeci przycisk-tab "Preferencje zakupowe" z ikoną `Heart` lub `BarChart3`
- Renderować `<ServicePreferences>` gdy `mainViewTab === "preferences"`
- Przekazać `clients` i `onSelectClient` (otwiera dialog klienta)

### Plik 3: `src/components/admin/clients/index.ts`
Dodać eksport `ServicePreferences`.

### Zakres: 3 pliki (1 nowy, 2 edycje)




# Plan: Import CSV klientów + szablon przykładowy

## Kontekst
Istniejący `CSVImport.tsx` obsługuje tylko import **usług** (services). Brakuje importu klientów. Trzeba stworzyć dedykowany komponent `ClientCSVImport` i zintegrować go w `ClientsManagement`.

## Nowy komponent: `src/components/admin/clients/ClientCSVImport.tsx`

Dialog z 3 krokami (upload → preview → import):

**Upload:**
- Drag & drop zone dla pliku CSV
- Przycisk "Pobierz szablon" — generuje przykładowy CSV z nagłówkami i 5 przykładowymi klientami
- Instrukcja mapowania kolumn

**Szablon CSV** (nagłówki + przykłady):
```
imie,nazwisko,telefon,email,notatki,tagi,zgoda_rodo,zgoda_marketing
Anna,Kowalska,+48123456789,anna@email.pl,Preferuje piątki,VIP;Stały,tak,tak
Katarzyna,Nowak,+48987654321,k.nowak@gmail.com,,Nowy,tak,nie
```

**Mapowanie kolumn** (fuzzy match po nagłówku):
- `imie`/`first_name`/`imię` → first_name
- `nazwisko`/`last_name` → last_name  
- `telefon`/`phone`/`tel` → phone
- `email`/`e-mail` → email
- `notatki`/`notes`/`uwagi` → notes
- `tagi`/`tags`/`etykiety` → tags (separator `;`)
- `zgoda_rodo`/`rodo`/`rodo_consent` → rodo_consent
- `zgoda_marketing`/`marketing` → marketing_consent

**Preview:** Tabela z walidacją (imię, nazwisko, telefon wymagane). Edycja/usuwanie wierszy.

**Import:** Batch insert przez `useCreateClient` — wstawia wszystkie prawidłowe rekordy.

## Zmiany w `ClientsManagement.tsx`

- Dodać przycisk "Import CSV" (ikona Upload) obok "Dodaj klienta"
- State `isCSVImportOpen` steruje dialogiem
- Również dodać ten przycisk w widoku pustej listy klientów (obok "Dodaj klienta")

## Pliki

| Plik | Zmiana |
|------|--------|
| `src/components/admin/clients/ClientCSVImport.tsx` | Nowy komponent |
| `src/components/admin/clients/index.ts` | Export nowego komponentu |
| `src/components/admin/ClientsManagement.tsx` | Integracja przycisku + dialog |

Brak zmian w bazie danych — używamy istniejący hook `useCreateClient`.


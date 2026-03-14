

# Plan: Naprawa panelu klienta + dodanie stawek VAT

## Problem
1. **BookingWidget** i jego sub-komponenty (`ServiceSelection`, `StaffSelection`) używają **hardcodowanych danych demo** (usługi, kategorie, personel). Gdy panel klienta (`SalonProfile`) otwiera BookingWidget, wyświetla się "Peeling kawitacyjny", "Anna Kowalska" itp. zamiast prawdziwych danych salonu.
2. **Stawki VAT** — brakuje stawki 5% (obowiązująca w Polsce). Obecnie dostępne: 0%, 8%, 23%.

## Zakres zmian

### 1. ServiceSelection.tsx — pobieranie danych z bazy
- Dodać props: `salonId`, `isDemo`
- Zamiast hardcodowanych `services[]` i `categories[]`, pobierać z Supabase (`services` + `service_categories` filtrowane po `salon_id`)
- W trybie demo zachować obecne dane mockowe
- Kategorie dynamicznie budować z danych DB

### 2. StaffSelection.tsx — pobieranie danych z bazy
- Dodać props: `salonId`, `isDemo`
- Zamiast hardcodowanych `staffMembers[]`, pobierać z `staff_members` (filtrowane po `salon_id`, `is_active=true`)
- W trybie demo zachować obecne dane mockowe

### 3. BookingWidget.tsx — propagacja salonId i isDemo
- Przekazywać `salonId` i `isDemo` do `ServiceSelection` i `StaffSelection`
- Poprawić logikę `isDemo` — gdy `salonId` jest realnym UUID, nie traktować jako demo
- Usunąć hardcodowane `serviceRecommendations` (lub oznaczyć jako demo-only)

### 4. SalonProfile.tsx — przekazanie salonId do BookingWidget
- Przekazać `salonId` do `<BookingWidget salonId={salonId} />`

### 5. Stawki VAT — rozszerzenie
- W `ServicesManagement.tsx` dodać brakującą stawkę **5%** do selecta VAT
- Kolejność: 0%, 5%, 8%, 23%

### 6. Pusty stan z instrukcją (szablony)
- Gdy nowe konto nie ma żadnych usług, wyświetlić pusty stan z instrukcją krok-po-kroku:
  1. "Najpierw dodaj kategorie usług (np. Twarz, Ciało, Paznokcie)"
  2. "Następnie dodaj usługi w każdej kategorii"
  3. "Przypisz personel do usług"
- Dodać przycisk "Użyj szablonu" z pustymi kategoriami (nazwy bez usług) jako punkt startowy

## Pliki do edycji
- `src/components/booking/ServiceSelection.tsx` — główna zmiana: dane z DB
- `src/components/booking/StaffSelection.tsx` — główna zmiana: dane z DB
- `src/components/booking/BookingWidget.tsx` — propagacja props
- `src/components/client-app/SalonProfile.tsx` — przekazanie salonId
- `src/components/admin/ServicesManagement.tsx` — VAT 5% + lepszy empty state


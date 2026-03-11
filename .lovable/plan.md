

# Audyt interaktywności: Demo + Panel Admin

## Przeprowadzona analiza

Przejrzałem systematycznie kod wszystkich zakładek w demo (`DemoPage.tsx`) i panelu admin (`AdminDashboard.tsx`), ze szczególnym uwzględnieniem: przekazywania `isDemo`, mutacji (CRUD), mock data, oraz empty states.

## Znalezione problemy

### 1. **QuickProductSale na Dashboardzie (demo)** — brak produktów
- `DashboardHome` → `QuickProductSale` — komponent pobiera produkty przez `useSalonId()`, a nie `salonId` z demo. W demo nie załaduje mock produktów.
- **Fix**: Przekazać `salonId="demo-salon-id"` do `QuickProductSale` gdy `isDemo=true`.

### 2. **ProductSaleSection w AppointmentModal (demo)** — brak produktów przy dodawaniu wizyty
- `AppointmentModal` zawiera `ProductSaleSection` ale nie przekazuje `salonId` w kontekście demo.
- **Fix**: Przekazać odpowiedni `salonId` do `ProductSaleSection` wewnątrz `AppointmentModal`.

### 3. **TimeOffManagement (admin)** — mutacje bez demo guard
- W demo mode, tworzenie/edycja/usuwanie urlopów próbuje pisać do Supabase (brak `isDemo` guard w mutation logic).
- **Fix**: Dodać demo guard w `handleSave` i `handleDelete`.

### 4. **SettingsModule** — nie przyjmuje `isDemo`
- `SettingsModule` zawsze pobiera dane z `useSalonSettings()`. W demo (brak salonu) settings mogą być puste lub powodować błędy.
- **Fix**: Dodać `isDemo` prop z mock danymi profilu salonu.

### 5. **WeeklyCalendar (admin — produkcja)** — nie ładuje wizyt z bazy
- W trybie produkcyjnym (`isDemo=false`), `appointments` zaczyna jako pusta tablica i **nigdy nie jest wypełniana danymi z bazy** — brakuje `useQuery` do pobierania wizyt z Supabase.
- Calendar w admin zawsze pokaże "brak wizyt" mimo że wizyty istnieją w bazie.
- **Fix**: Dodać `useQuery` do pobierania wizyt z tabeli `appointments` filtrowanych po `salonId` i aktualnym tygodniu.

### 6. **ProductSalesReport** — nie przyjmuje `salonId` ani `isDemo`
- W `ProductsModule` zakładka "Raport sprzedaży" renderuje `<ProductSalesReport />` bez żadnych propsów.
- **Fix**: Sprawdzić czy komponent ma mock data lub dodać.

## Plan implementacji

| # | Plik | Zmiana | Priorytet |
|---|------|--------|-----------|
| 1 | `WeeklyCalendar.tsx` | Dodać `useQuery` do pobierania wizyt z bazy w produkcji | Krytyczny |
| 2 | `DashboardHome.tsx` | Przekazać `salonId` do `QuickProductSale` w demo | Wysoki |
| 3 | `AppointmentModal.tsx` | Przekazać `salonId` do `ProductSaleSection` w demo | Wysoki |
| 4 | `TimeOffManagement.tsx` | Dodać demo guard w mutacjach | Średni |
| 5 | `SettingsModule.tsx` | Dodać `isDemo` prop z mock danymi | Średni |
| 6 | `ProductSalesReport.tsx` | Sprawdzić/dodać mock data | Niski |

### Szczegóły techniczne kluczowej zmiany (#1)

```typescript
// WeeklyCalendar.tsx — dodać pobieranie wizyt z bazy
const { data: dbAppointments } = useQuery({
  queryKey: ["calendar-appointments", salonId, weekStart],
  queryFn: async () => {
    const { data } = await supabase
      .from("appointments")
      .select("*, clients(first_name, last_name), services(name, duration), staff_members(name)")
      .eq("salon_id", salonId!)
      .gte("start_time", weekStart)
      .lte("start_time", weekEnd)
      .neq("status", "cancelled");
    return data;
  },
  enabled: !isDemo && !!salonId,
});

// Sync appointments from DB
useEffect(() => {
  if (!isDemo && dbAppointments) {
    setAppointments(dbAppointments.map(transformToLocalFormat));
  }
}, [dbAppointments, isDemo]);
```


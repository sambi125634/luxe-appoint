

# Audyt gotowości produkcyjnej — pozostające problemy

## Podsumowanie statusu

Poprzednie naprawy zostały poprawnie wdrożone: kalendarz pobiera wizyty z bazy, klienci mają agregację wizyt/wydatków, staff_services i working_hours są pobierane, księgowość ciągnie transakcje, time_off tabela istnieje. Jednak kilka istotnych problemów nadal blokuje bezproblemowe doświadczenie właścicielki salonu.

---

## Problemy wymagające naprawy

### 1. KRYTYCZNY: Link "Zobacz widget" prowadzi do `/book/demo-salon` zamiast do prawdziwego sluga salonu
**Plik:** `src/pages/AdminDashboard.tsx` linia 179
**Problem:** Hardcoded `<Link to="/book/demo-salon">` — każda właścicielka po rejestracji widzi swój panel, klika "Zobacz widget" i trafia na demo salon zamiast na SWÓJ kalendarz rezerwacji.
**Fix:** Użyć `useUserRole()` do pobrania `salonId`, a potem query slug z tabeli `salons` lub dodać `salonSlug` do `useUserRole`.

### 2. KRYTYCZNY: Brak obsługi "password reset" flow
**Problem:** Strona `/auth` nie ma opcji "Zapomniałem hasła". Brak komponentu `/reset-password`. Właścicielka, która zapomni hasła, nie może odzyskać konta.
**Fix:** Dodać link "Zapomniałem hasła" + formularz resetujący + stronę `/reset-password`.

### 3. WYSOKI: `useStaffMembers` hook nie respektuje `isDemo`
**Problem:** W demo, `useStaffMembers()` jest wywoływany w `TimeOffManagement`, `AppointmentModal`, `WeeklyCalendar` i `StaffManagement`. Hook zawsze używa `useSalonId()` — jeśli użytkownik jest zalogowany i przegląda demo, hook pobiera prawdziwych pracowników z bazy zamiast mock data. Mieszanie danych demo z produkcyjnymi.
**Fix:** Dodać parametr `isDemo` do hooka lub wywoływać go warunkowo.

### 4. WYSOKI: `useClients()` i `useServices()` w `AppointmentModal` nie respektują `isDemo`
**Problem:** Linia 105-107 — hooki wywoływane bezwarunkowo. Gdy użytkownik jest zalogowany i przegląda demo, pobierają dane produkcyjne.
**Fix:** Hooki są wywoływane, ale dane `clients`/`services`/`staffMembers` są mapowane z mock gdy `isDemo=true` (linie 111-136). Problem polega na **niepotrzebnych zapytaniach sieciowych** — nie powoduje to błędów widocznych dla użytkownika, ale to marnowanie zasobów.

### 5. ŚREDNI: Dashboard "Zobacz widget" powinien używać prawdziwego sluga
**Problem:** Powiązany z #1. Również w `DashboardHome` brak szybkiego linku do własnego widgetu rezerwacji.

### 6. ŚREDNI: Brak obsługi logout w panelu admin
**Problem:** W `AdminSidebar.tsx` powinien być przycisk wylogowania. Trzeba sprawdzić, czy istnieje.

### 7. NISKI: Stale network error na `/demo` — `salon_id=eq.demo-salon-id`
**Obserwacja:** Widoczny w network logs. Może pochodzić z nieodświeżonej wersji lub z komponentów ładowanych lazy. Jeśli QuickProductSale ma `enabled: !isDemo && !!realSalonId`, to zapytanie nie powinno się wykonywać. Do weryfikacji po deployu.

---

## Plan implementacji

| # | Plik | Zmiana | Priorytet |
|---|------|--------|-----------|
| 1 | `AdminDashboard.tsx` | Pobrać `salonSlug` z bazy i użyć w linku "Zobacz widget" | Krytyczny |
| 2 | `AuthPage.tsx` + nowy `ResetPasswordPage.tsx` | Dodać "Zapomniałem hasła" + stronę resetu | Krytyczny |
| 3 | `App.tsx` | Dodać route `/reset-password` | Krytyczny |
| 4 | `AdminSidebar.tsx` | Sprawdzić/dodać przycisk logout | Średni |

### Szczegóły techniczne

**Fix #1 — Widget link:**
```typescript
// AdminDashboard.tsx
const { salonId } = useUserRole();
const { data: salonSlug } = useQuery({
  queryKey: ["salon-slug", salonId],
  queryFn: async () => {
    const { data } = await supabase.from("salons").select("slug").eq("id", salonId!).single();
    return data?.slug;
  },
  enabled: !!salonId,
});

// W render:
<Link to={salonSlug ? `/book/${salonSlug}` : "#"}>
```

**Fix #2 — Password reset:**
- W `AuthPage`: dodać link "Zapomniałem hasła" pod formularzem logowania
- Nowy komponent `ResetPasswordPage.tsx`: formularz z nowym hasłem, sprawdzanie `type=recovery` w URL hash
- Route `/reset-password` w `App.tsx`


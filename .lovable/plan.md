

# Audyt panelu admin — problemy znalezione po rejestracji nowego użytkownika

## Znalezione bugi i problemy

### 1. KRYTYCZNY: `saveDefaultServices()` nie zapisuje usług dla nowych użytkowników (bez social URL)

**Plik:** `OnboardingPage.tsx`, linia 297-301

Gdy użytkownik NIE podaje social URL, kod robi:
```
setCreatedSalonId(salon.id);  // ustawia state
// ...
if (createdSalonId) {         // sprawdza STARY state (jeszcze null!)
  await saveDefaultServices();
}
```

`setCreatedSalonId` jest asynchroniczne (React state) — `createdSalonId` w momencie sprawdzenia jest jeszcze `null`. Efekt: **nowy salon nie ma żadnych usług** po onboardingu (jeśli pominięto AI Scan). Kalendarz i booking widget będą puste.

**Fix:** Użyć `salon.id` bezpośrednio zamiast `createdSalonId` w warunku i przekazać do `saveDefaultServices`.

---

### 2. KRYTYCZNY: `SetupChecklist` — `working_hours` query bez filtra salon

**Plik:** `SetupChecklist.tsx`, linia 41

```
supabase.from("working_hours").select("*", { count: "exact", head: true })
```

Brak `.eq("salon_id", salonId)` — ale `working_hours` nie ma `salon_id`, ma `staff_id`. Powinno filtrować przez staff_members tego salonu. Aktualnie: RLS blokuje dane innych salonów, ale nowy salon widzi `workingHoursCount = 0` nawet gdy inne salony je mają (RLS), więc to działa przypadkowo poprawnie. Jednak poprawny query powinien joinować z `staff_members`.

**Fix:** Filtrować working_hours przez staff_id IN (staff danego salonu).

---

### 3. ŚREDNI: Onboarding nie tworzy working_hours dla owner-staff

Podczas onboardingu tworzony jest `staff_member` dla ownera, ale **nie są tworzone domyślne `working_hours`**. Efekt: kalendarz nie pokaże żadnych dostępnych slotów, booking widget nie pokaże terminów.

**Fix:** Po utworzeniu staff member, wstawić domyślne working_hours (Pon-Pt 9-17).

---

### 4. ŚREDNI: `AutopilotStatusBar` zawsze pokazuje mock dane

**Plik:** `AutopilotStatusBar.tsx`, linia 24

```
const stats = isDemo ? todayStats : MOCK_TODAY_STATS;
```

W trybie real (nie demo) i tak używa `MOCK_TODAY_STATS`. Autopilot status bar pokazuje fałszywe dane ("odzyskano X zł") nowemu użytkownikowi.

Linia 98: `actions={isDemo ? demoActions : []}` — w trybie real przekazuje pusty array, ale stats są mock. Sprzeczność.

**Fix:** Gdy `!isDemo`, pobierać prawdziwe dane z bazy lub ukryć bar jeśli brak danych.

---

### 5. ŚREDNI: `DashboardHome` — brak stanu "empty state" dla nowego salonu

Dashboard wyświetla widgety (Revenue Prediction, Weekly Brief, Retention Health, Stock Alerts) nawet gdy salon jest zupełnie pusty. Nowy użytkownik widzi puste karty lub dane z mocków.

**Fix:** Dodać empty state / onboarding CTA gdy salon nie ma jeszcze wizyt/klientów.

---

### 6. NISKI: `hasSalonData` wymaga address i phone — nie zbierane w onboardingu

**Plik:** `SetupChecklist.tsx`, linia 44

```
const hasSalonData = !!(salon?.name && salon?.address && salon?.phone);
```

Onboarding zbiera name i city, ale nie address i phone. Checklist "Dane salonu" nigdy nie będzie zaznaczony po onboardingu — zmusza użytkownika do odwiedzenia ustawień.

**Fix:** To jest celowe (prowadzi do Settings), ale warto upewnić się, że Settings > Profil poprawnie zapisuje te pola.

---

### 7. NISKI: Widget booking "widget zainstalowany" — hardcoded `false`

**Plik:** `SetupChecklist.tsx`, linia 53

```
{ id: "widget", ..., completed: false, tab: "widgets" }
```

Zawsze niekompletne. Brak mechanizmu śledzenia czy widget został osadzony.

---

## Plan napraw (priorytet)

| # | Problem | Plik | Zmiana |
|---|---------|------|--------|
| 1 | Brak usług po onboardingu | `OnboardingPage.tsx` | Przekazać `salon.id` do `saveDefaultServices()` zamiast czekać na state |
| 2 | Brak working_hours po onboardingu | `OnboardingPage.tsx` | Dodać insert domyślnych working_hours po utworzeniu staff member |
| 3 | SetupChecklist working_hours | `SetupChecklist.tsx` | Filtrować przez staff_members danego salonu |
| 4 | AutopilotStatusBar mock dane | `AutopilotStatusBar.tsx` | Ukryć bar lub pokazać real dane w trybie produkcyjnym |
| 5 | Dashboard empty state | `DashboardHome.tsx` | Dodać empty state widgety dla nowego salonu |


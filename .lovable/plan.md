

## Problem

Trzy powiązane problemy:

1. **Onboarding odpala się przy każdym logowaniu** — `OnboardingPage` nie sprawdza czy salon już istnieje dla zalogowanego użytkownika. Każde logowanie → redirect na `/onboarding` → próba utworzenia nowego salonu (lub duplikatu).

2. **Demo page (`/demo`) współdzieli komponenty z admin panelem** — `DemoPage` importuje te same `DashboardHome`, `ClientsManagement` itd., które teraz pobierają dane z Supabase przez `salonId`. Demo powinno mieć swoje własne konto demo z danymi demo, a nie wyświetlać dane zalogowanego użytkownika.

3. **Izolacja danych między kontami** — RLS już jest skonfigurowane poprawnie (filtrowanie po `salon_id`), ale trzeba upewnić się, że demo i prawdziwe konta nie mieszają danych.

## Plan

### 1. Fix onboarding — sprawdzanie istniejącego salonu

W `OnboardingPage.tsx`, po pobraniu sesji użytkownika:
- Sprawdź czy użytkownik ma już salon w bazie (`salons` WHERE `owner_id = user.id`)
- Jeśli salon istnieje I `onboarding_completed = true` → redirect na `/admin`
- Jeśli salon istnieje I `onboarding_completed = false` → wznów onboarding od zapisanego `onboarding_step`, załaduj istniejące dane salonu do formularza
- Jeśli salon nie istnieje → pokaż pusty formularz (jak teraz)

Kluczowa zmiana: dodać `useEffect` po załadowaniu `userId` który:
```
const { data: existingSalon } = await supabase
  .from("salons")
  .select("id, slug, name, address, city, phone, email, onboarding_completed, onboarding_step")
  .eq("owner_id", userId)
  .maybeSingle();

if (existingSalon?.onboarding_completed) {
  navigate("/admin");
} else if (existingSalon) {
  // Resume onboarding
  setCreatedSalonId(existingSalon.id);
  setCreatedSlug(existingSalon.slug);
  setSalonName(existingSalon.name);
  // ... fill other fields
  setStep(existingSalon.onboarding_step);
}
```

### 2. Izolacja demo od prawdziwych kont

Demo page (`/demo`) musi działać BEZ sesji Supabase — czysto lokalnie z mockowymi danymi.

Podejście: przekazać prop `isDemo={true}` do komponentów w `DemoPage`. Komponenty które pobierają dane z Supabase (DashboardHome, ClientsManagement itd.) powinny:
- Gdy `isDemo=true` → wyświetlać hardcoded dane demo (jak było wcześniej)
- Gdy `isDemo=false` (lub brak propa) → pobierać z bazy filtrując po `salon_id`

Alternatywnie (prostsze): stworzyć osobne lekkie komponenty demo (`DemoDashboardHome`, `DemoClientsManagement`) z mockowymi danymi, i użyć ich w `DemoPage`. Prawdziwe komponenty pozostają czyste — tylko dane z bazy.

**Rekomendacja:** Prop `isDemo` — mniej duplikacji kodu, łatwiejsze utrzymanie.

### 3. Upewnienie się o izolacji danych

RLS jest już poprawnie skonfigurowane — każda tabela filtruje po `salon_id`. Wystarczy upewnić się, że:
- DemoPage NIE tworzy sesji Supabase (nie loguje żadnego użytkownika)
- Prawdziwe komponenty zawsze filtrują po `salonId` z hooka `useSalonId()`
- Brak jest hardcoded `salon_id` ani danych testowych w komponentach admin

### Zmiany w plikach

1. **`src/pages/OnboardingPage.tsx`** — dodać sprawdzanie istniejącego salonu, wznowienie onboardingu, redirect jeśli ukończony
2. **`src/components/admin/DashboardHome.tsx`** — dodać prop `isDemo?: boolean`, gdy true → mockowe dane
3. **Pozostałe moduły admin** (ClientsManagement, ServicesManagement, StaffManagement, ScheduleManagement itd.) — dodać prop `isDemo?: boolean` z lokalnym mockiem
4. **`src/pages/DemoPage.tsx`** — przekazać `isDemo={true}` do wszystkich komponentów

### Kolejność

1. Fix onboarding (sprawdzanie salonu + wznowienie)
2. Dodanie `isDemo` prop do komponentów admin
3. Aktualizacja DemoPage


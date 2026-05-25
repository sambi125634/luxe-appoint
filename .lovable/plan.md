## Problem

Sidebar w panelu admina pokazuje tylko 7 z ~20 modułów (brak: Widgety, Pracownicy, Usługi, Produkty, Księgowość, Ścieżka klientki, Retencja, Autopilot, Polecenia, Ustawienia). Dzieje się tak ponieważ `useStaffPermissions` zwraca `isOwner=false` gdy w tabeli `user_roles` brakuje wpisu dla użytkownika — a Twoje konto (`sambor191@wp.pl`) takiego wpisu nie ma, choć jest właścicielem salonu "anna".

Identyczny problem dotyczy też innych historycznych kont (zweryfikowane w DB). Trigger `handle_new_user_role` nie zadziałał — prawdopodobnie konto powstało zanim trigger został dodany, albo wykonanie zawiodło cicho.

## Plan naprawy

### 1. Migracja: backfill ról i wzmocnienie triggera

Jedna migracja wykonuje 3 rzeczy:

**a) Backfill istniejących właścicieli** — dla każdego `salons.owner_id`, który nie ma wpisu w `user_roles`, dopisać rolę `salon_owner`. Naprawia Twoje konto + wszystkie inne dotknięte.

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT s.owner_id, 'salon_owner'::app_role
FROM public.salons s
WHERE s.owner_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = s.owner_id
  );
```

**b) Sprzątanie stray `staff_members`** — usunąć fałszywe wpisy `staff_members` dla właścicieli (mój wpis `b4d5afaf-...` powstał automatycznie i mylił hook). Tylko dla user_id którzy są ownerami salonu i nie istnieje dla nich żaden członek personelu utworzony świadomie (brak `invited_by` lub identyczny user_id co salon owner).

```sql
DELETE FROM public.staff_members sm
WHERE EXISTS (
  SELECT 1 FROM public.salons s 
  WHERE s.owner_id = sm.user_id AND s.id = sm.salon_id
);
```

**c) Wzmocnienie triggera `handle_new_user_role`** — przerobić funkcję na `SECURITY DEFINER` z `ON CONFLICT DO NOTHING`, dodać exception handler, żeby cichy fail nigdy nie powtórzył tego problemu.

### 2. Po migracji

Wyloguj się i zaloguj ponownie — `useStaffPermissions` ma cache w react-query, świeży login odświeży session i zwróci `isOwner=true`. Sidebar pokaże wszystkie 20 modułów.

### 3. Weryfikacja

Sprawdzę zapytaniem czy każde `salons.owner_id` ma odpowiadający wpis `user_roles` z rolą `salon_owner` i czy żaden owner nie figuruje już w `staff_members`.

## Pliki / zmiany

- **1 nowa migracja**: `supabase/migrations/<timestamp>_fix_owner_roles_backfill.sql`
- **Bez zmian w kodzie frontu** — logika `useStaffPermissions` jest poprawna; problem był wyłącznie po stronie danych + triggera

## Co NIE jest zmieniane

- Architektura ról i uprawnień (`TAB_PERMISSION_MAP`, `OWNER_PERMISSIONS`) — działa zgodnie z założeniami
- RLS policies — bez zmian
- Logika sidebara — bez zmian
- Inne moduły / komponenty admina

## Ryzyka

- **Usunięcie staff_members ownerów**: tylko gdy `staff_members.user_id == salons.owner_id` dla tego samego `salon_id` — bezpieczne, owner nie powinien siedzieć w swoim staff_members.
- **Backfill ról**: `ON CONFLICT` nie potrzebny bo filtruje `NOT EXISTS`, ale dla bezpieczeństwa dorzucę.

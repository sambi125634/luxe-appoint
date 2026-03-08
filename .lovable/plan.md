

## Plan: Optymalizacja mobilna + synchronizacja desktop ↔ mobile

### Problem
1. **Teksty mogą nachodzić** na małych ekranach (320px) — brak `truncate`, `min-w-0`, `overflow-hidden` w kilku miejscach
2. **Brak synchronizacji** desktop ↔ mobile — "Więcej" menu przekierowuje na `/admin?tab=X` (desktop), zamiast renderować mobilne wersje tych modułów
3. **Bottom bar badge** — zawsze pulsuje (hardcoded `badge: true`), nie jest oparty na rzeczywistych danych

### Co zrobimy

#### 1. Pełna optymalizacja tekstowa (wszystkie 5 komponentów mobilnych)
- Dodanie `truncate`, `min-w-0`, `overflow-hidden` wszędzie gdzie tekst może wychodzić poza kontener
- Fix KPI strip w Dashboard — na 320px karty KPI z tekstem "potw. • oczek." mogą się obcinać → zmniejszenie `min-w-[140px]` do `min-w-[130px]` i skrócenie labelek
- Calendar: tekst "TERAZ" badge + nazwa klienta + nazwa usługi → upewnienie się o `truncate` na każdym
- Clients: już dobrze, ale dodam `line-clamp` na dłuższych nazwiskach
- Notifications: opis (`description`) może być za długi → `line-clamp-2`
- Bottom bar: drobna korekta — `relative` na buttonie aby `absolute bottom-1` wskaźnik działał poprawnie

#### 2. Synchronizacja Desktop ↔ Mobile (architektura)
Zamiast duplikować logikę, ustalimy zasadę:
- **MobileMoreMenu** — zamiast odsyłać na `/admin?tab=X`, będzie otwierał mobilne wersje kluczowych modułów (Services, Staff, Settings) bezpośrednio w `/m/...` routach
- Dodamy nowe trasy w `MobileAdminApp.tsx`: `/m/services`, `/m/staff`, `/m/settings` etc. — na razie renderujące desktop komponenty opakowane w mobilny layout (ze scrollem, `pb-20`, `max-w-lg`)
- To zapewni, że użytkownik **nie wychodzi** z mobilnego kontekstu

#### 3. Bottom bar badge — dynamiczny
- Badge powiadomień będzie oparty na zapytaniu do DB (count oczekujących wizyt), nie hardcoded

#### 4. Safe-area i spacing
- Upewnienie się, że `pb-20` (na bottom bar) jest konsekwentne
- Dodanie `env(safe-area-inset-bottom)` do bottom bar CSS

### Pliki do edycji
- `src/components/mobile-admin/MobileDashboard.tsx` — truncate fixes, KPI label skrócenia
- `src/components/mobile-admin/MobileCalendar.tsx` — truncate fixes
- `src/components/mobile-admin/MobileClients.tsx` — minor truncate fixes
- `src/components/mobile-admin/MobileNotifications.tsx` — line-clamp-2 na opisach
- `src/components/mobile-admin/MobileAdminBottomBar.tsx` — dynamic badge, relative fix, safe-area
- `src/components/mobile-admin/MobileMoreMenu.tsx` — zmiana nawigacji z `/admin?tab=X` na `/m/X`
- `src/pages/MobileAdminApp.tsx` — dodanie nowych tras (`/m/services`, `/m/staff`, `/m/settings`, etc.)

### Sekcja techniczna
- Nowe trasy w MobileAdminApp będą importować istniejące desktop komponenty (np. `ServicesManagement`, `StaffManagement`) i opakowywać je w mobilny shell (`<div className="pb-20 max-w-lg mx-auto px-4">`)
- Bottom bar badge: `useQuery` z `count: "exact"` na `appointments` ze `status = 'booked'`
- Nie tworzymy nowych tabel ani migracji — to czysto frontendowe zmiany


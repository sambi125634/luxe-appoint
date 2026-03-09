
## Analiza stanu obecnego

**Co już jest:**
- `ServiceMediaUpload.tsx` – upload zdjęć i wideo (base64 w state), do 5 plików, drag & drop
- `ServiceSelection.tsx` (booking widget) – pokazuje miniaturki zdjęć, badge "Hit", listę korzyści (benefits), dialog podglądu
- `ServicesManagement.tsx` – lista usług z miniaturkami, formularz z zakładką mediów

**Co brakuje / można podnieść na "wow":**
1. Zdjęcia i wideo nie trafiają realnie do Supabase Storage – MediaUpload działa tylko na base64 w pamięci
2. Booking widget `ServiceSelection.tsx` nie pobiera danych z bazy (hardcoded demo data) – klient nie widzi zdjęć ze Storage
3. Brak pola `benefits` (korzyści) przy usłudze w bazie danych i w formularzu admina
4. Serwis admin pokazuje zwykłą listę – brak "wow" visual w panelu
5. Brak real-time upload do Storage z paskiem postępu

---

## Plan: "Wow" Service Showcase

### 1. Baza danych – nowe pole `benefits`
Migracja dodająca kolumnę `benefits jsonb default '[]'` do tabeli `services`.

### 2. Upload mediów do Supabase Storage (prawdziwy)
Zmodyfikować `ServiceMediaUpload.tsx` + logikę w `saveService()` w `ServicesManagement.tsx`:
- Zamiast base64 → upload do bucketu `salon-media` (już istnieje, publiczny)
- Zwraca URL z Storage, zapisywany w kolumnie `media jsonb`
- Pasek postępu przy wgrywaniu

### 3. Pole „Efekty zabiegu / Korzyści" w formularzu admina
W dialogu edycji usługi dodać sekcję: dynamiczna lista korzyści (dodaj/usuń tag), np.: "Nawilżenie", "Redukcja zmarszczek". Zapisywane do nowej kolumny `benefits`.

### 4. Nowy "Showcase View" w panelu admina – zmiana z listy na karty
W `ServicesManagement.tsx` – toggle między widokiem lista (aktualny) a widokiem **kart (grid)** z pełną miniaturką, tytułem, ceną i benefits. Widok "jak klient to zobaczy".

### 5. Booking widget – prawdziwe dane z Supabase
`ServiceSelection.tsx` — pobierać usługi z bazy przez `useServices()` (hook już istnieje), wyświetlać prawdziwe zdjęcia z Storage, prawdziwe korzyści z `benefits`.

### 6. Service Detail Modal (nowy) – widok "cinema"
Kliknięcie w usługę w booking widgecie otwiera **fullscreen modal** z:
- hero zdjęcie / carousel zdjęć
- odtwarzacz wideo (jeśli wgrane wideo)
- lista korzyści z checkmarkami (animowane)
- info: czas + cena + kto wykonuje
- duży CTA "Zarezerwuj teraz"

---

## Pliki do zmiany/stworzenia

```text
MIGRACJA BAZY:
  supabase/migrations/   → ADD COLUMN benefits jsonb

NOWE PLIKI:
  src/components/admin/services/ServiceShowcaseCard.tsx
  src/components/booking/ServiceDetailModal.tsx

EDYCJA:
  src/components/admin/ServicesManagement.tsx
    → toggle list/grid view
    → pole benefits w formularzu
    → upload do Storage zamiast base64

  src/components/admin/ServiceMediaUpload.tsx
    → upload do Storage z progress bar

  src/components/booking/ServiceSelection.tsx
    → prawdziwe dane z useServices()
    → ServiceDetailModal zamiast prostego dialog
    → hero cards dla popularnych

  src/hooks/useServices.ts
    → typ Service rozszerzony o benefits: string[]
```

### Wygląd docelowy (booking widget – widok klienta):

```text
┌─────────────────────────────────────────┐
│  ⭐ POPULARNE ZABIEGI                    │
│ ┌────────────────┐ ┌────────────────┐   │
│ │ [FOTO 16:9]    │ │ [FOTO 16:9]    │   │
│ │ ★ Hit          │ │ ★ Hit          │   │
│ │ Mezoterapia    │ │ Peeling kaw.   │   │
│ │ 350 zł · 60min │ │ 150 zł · 45min │   │
│ └────────────────┘ └────────────────┘   │
│                                         │
│  WSZYSTKIE ZABIEGI                      │
│ ┌─────────────────────────────────────┐ │
│ │[FOTO]  Masaż relaksacyjny     200 zł│ │
│ │        ✓ Redukuje stres  ▶ wideo   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  [Klik → ServiceDetailModal fullscreen] │
│  ┌───────────────────────────────────┐  │
│  │ HERO PHOTO / VIDEO CAROUSEL       │  │
│  │ Nazwa zabiegu                     │  │
│  │ ✓ Korzyść 1  ✓ Korzyść 2         │  │
│  │ Wykonuje: Maria N.                │  │
│  │ ⏱ 60 min    💰 350 zł            │  │
│  │  [ZAREZERWUJ TERAZ →]             │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

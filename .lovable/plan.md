

# Plan: Instagram Landing Page — dane z bazy + ulepszenia

## Problem
1. **Landing page używa hardcoded mock data** — telefon, adres, godziny, logo nie zaciągają się z ustawień salonu
2. **Przyciski Zadzwoń/Mapa nie działają** — bo dane są statyczne i nie odpowiadają rzeczywistym danym salonu
3. **Brak logo** — zawsze pokazuje ikonę Sparkles zamiast prawdziwego logo
4. **Brak linku do cennika** — landing obiecuje "Rezerwuj, Cennik, Kontakt, Mapa" ale cennik nie istnieje

## Rozwiązanie

### 1. Dynamiczne dane z bazy
Zamienić `mockSalonData` na query do tabeli `salons` po `slug`. Tabela ma wszystkie potrzebne pola:
- `name`, `description`, `address`, `city`, `phone`, `email`
- `logo_url`, `social_url` (Instagram handle)
- `theme_primary_color`, `theme_secondary_color`
- `settings` JSONB (zawiera godziny otwarcia)

Query: `supabase.from("salons").select("*").eq("slug", slug).eq("is_active", true).single()`

RLS już pozwala na public SELECT aktywnych salonów — nie trzeba nic zmieniać.

### 2. Ulepszenia landing page
- **Logo**: jeśli `logo_url` istnieje → wyświetl obrazek, jeśli nie → inicjały nazwy salonu w gradient circle
- **Kolory**: użyj `theme_primary_color` salonu jako accent (CSS custom properties)
- **Nowy przycisk "Cennik"**: link do `/s/{slug}` z przewinięciem do usług
- **Nowy przycisk "Email"**: jeśli salon ma email
- **Godziny otwarcia**: pobierane z `working_hours` tabeli (query po staff_members salonu) lub z `settings` JSONB
- **Social**: użyj `social_url` zamiast hardcoded `@demosalonbeauty`
- **Loading state**: skeleton podczas ładowania danych
- **Error state**: "Salon nie znaleziony" gdy slug nieprawidłowy
- **Favicon dynamiczny**: `document.title` z prawdziwą nazwą (już jest, ale z mock)

### 3. Demo fallback
Gdy `slug === "demo-salon"` lub query zwróci null w trybie demo → użyj mock data (zachować obecne zachowanie dla demo).

### Pliki do zmiany

| Plik | Akcja |
|------|-------|
| `src/pages/InstagramLanding.tsx` | Zamienić mock na query do bazy, dodać loading/error, usprawnić UI |

Jeden plik, ~120 linii zmian. Brak migracji — wszystkie pola już istnieją.


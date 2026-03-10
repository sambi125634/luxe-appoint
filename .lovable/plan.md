

# Plan: Moduł Meta Pixel & CRM Sync

## Zakres

System synchronizacji tagów CRM z Meta Custom Audiences, server-side Conversions API, Lookalike Engine i Pixel Health Dashboard. Ponieważ integracja z Meta API wymaga OAuth i kluczy API, moduł startuje jako konfigurowalny UI z mock data w demo, gotowy do podłączenia prawdziwego Meta API przez edge function.

## 1. Migracja — 5 nowych tabel

```sql
-- pixel_config: połączenie Meta per salon
CREATE TABLE pixel_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL UNIQUE,
  pixel_id text,
  ad_account_id text,
  access_token_encrypted text,
  is_active boolean DEFAULT false,
  last_sync_at timestamptz,
  sync_interval_hours integer DEFAULT 24,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- audience_mappings: tag CRM → Custom Audience
CREATE TABLE audience_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL,
  audience_id text, -- Meta audience ID
  audience_name text NOT NULL,
  is_exclusion boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  tag_name text NOT NULL,
  UNIQUE(salon_id, tag_name)
);

-- pixel_sync_log: historia synchronizacji
CREATE TABLE pixel_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  events_sent integer DEFAULT 0,
  audiences_updated integer DEFAULT 0,
  errors jsonb DEFAULT '[]',
  status text DEFAULT 'running'
);

-- pixel_events: wysłane zdarzenia
CREATE TABLE pixel_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL,
  client_id uuid,
  event_value numeric,
  hashed_email text,
  hashed_phone text,
  sent_at timestamptz DEFAULT now(),
  event_name text NOT NULL,
  source_type text DEFAULT 'calendar'
);

-- pixel_attributions: rezerwacje z kampanii
CREATE TABLE pixel_attributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL,
  client_id uuid NOT NULL,
  appointment_id uuid,
  audience_name text,
  ad_campaign text,
  revenue numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

RLS: salon owner + super_admin pattern (standard).

## 2. Nowe pliki UI

### `src/modules/pixel/PixelDashboard.tsx`
Główny komponent z tabami: Konfiguracja | Audiences | Zdarzenia | Health | Atrybucja.

### `src/modules/pixel/PixelSetupWizard.tsx`
3-krokowy wizard: Połącz Meta → Zmapuj tagi → Włącz Pixel Conditioning. W demo mode: symulowane UI z mock danymi. W production: formularz na pixel_id, ad_account_id + przycisk OAuth (przyszłość).

### `src/modules/pixel/AudienceMappings.tsx`
Dwie kolumny: tagi CRM (z `client_tags`) ↔ Custom Audiences. Przycisk "Auto-utwórz recommended" tworzy 5 standardowych mapowań. Toggle `is_exclusion` per mapowanie.

### `src/modules/pixel/PixelHealthDashboard.tsx`
Karty: Event Match Quality (%), Events last 30d, Audience sizes, Health score (Doskonały/Dobry/Słaby) z rekomendacjami.

### `src/modules/pixel/PixelEventsLog.tsx`
Tabela ostatnich zdarzeń pixel z filtrami (typ, data, klient). Statusy wysyłki.

### `src/modules/pixel/LookalikeEngine.tsx`
Alert gdy audience >100 osób. Przyciski "Stwórz Lookalike 1%" / "2-3%". Lista istniejących lookalikes.

### `src/modules/pixel/PixelAttribution.tsx`
ROAS dashboard: rezerwacje z kampanii, przychód, koszt reklam (manual input), auto-ROAS.

### `src/modules/pixel/types.ts` + `src/modules/pixel/mock-data.ts` + `src/modules/pixel/index.ts`

### `src/hooks/usePixelSync.ts`
Hooki: `usePixelConfig(salonId)`, `useAudienceMappings(salonId)`, `usePixelEvents(salonId)`, `usePixelHealth(salonId)`, `usePixelAttributions(salonId)`.

## 3. Integracja

| Plik | Zmiana |
|------|--------|
| `AdminSidebar.tsx` | Nowy tab "Pixel" (ikona `Zap`) |
| `AdminDashboard.tsx` | Renderowanie `PixelDashboard` |
| `DemoPage.tsx` | Rejestracja modułu pixel |

## 4. Uwagi
- Meta OAuth + Conversions API to przyszły edge function (`pixel-sync`). UI jest gotowy do podłączenia.
- Haszowanie SHA256 email/phone realizowane client-side przed zapisem do `pixel_events`.
- Respektuje `marketing_consent` z tabeli `clients` — brak zgody = nigdy nie trafia do audiences.
- RODO: tylko haszowane dane, checkbox zgody w widgecie rezerwacji (istniejące pole `marketing_consent`).




# Plan: Consultation Cards & Voice Notes Module

## Zakres

Moduł `/src/modules/consultation/` z dwoma częściami: (A) cyfrowe karty konsultacyjne z builderem, szablonami i podpisem, (B) voice notes z transkrypcją AI i strukturyzacją danych. Nowe tabele DB + edge function do transkrypcji.

## 1. Migracja — 3 nowe tabele

```sql
-- Szablony kart konsultacyjnych (builder)
CREATE TABLE consultation_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL,
  name text NOT NULL,
  fields jsonb NOT NULL DEFAULT '[]',
  is_system boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Wypełnione karty konsultacyjne
CREATE TABLE consultation_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL,
  client_id uuid NOT NULL,
  template_id uuid REFERENCES consultation_templates(id),
  responses jsonb NOT NULL DEFAULT '{}',
  signature_url text,
  red_flags text[] DEFAULT '{}',
  status text DEFAULT 'pending', -- pending/completed/signed
  filled_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Voice notes
CREATE TABLE voice_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL,
  client_id uuid NOT NULL,
  staff_id uuid,
  appointment_id uuid,
  audio_url text NOT NULL,
  duration_seconds integer,
  transcript text,
  ai_extracted jsonb DEFAULT '{}',
  -- ai_extracted: { products: [], tags: [], nextVisit: {}, notes: "" }
  created_at timestamptz DEFAULT now()
);
```

RLS: standard salon owner + staff pattern.

## 2. Edge Function — Voice Transcription

`supabase/functions/transcribe-voice-note/index.ts`
- Receives audio file, uses Lovable AI (gemini-2.5-flash) for transcription + structured extraction
- Returns: transcript + extracted products/tags/next visit suggestion
- Uses tool calling for structured output

## 3. Nowe pliki UI

### `src/modules/consultation/ConsultationModule.tsx`
Główny dashboard z tabami: Karty | Szablony | Voice Notes.

### `src/modules/consultation/CardBuilder.tsx`
Builder kart — lista pól (drag reorder): text, select, slider, photo, signature, medical contraindications. Gotowe szablony 1-klik: twarz, paznokcie, fryzjer, RODO, wywiad.

### `src/modules/consultation/CardFillForm.tsx`
Mobile-friendly formularz do wypełnienia karty. Pole podpisu (canvas finger drawing). Submit → status "signed".

### `src/modules/consultation/ClientConsultations.tsx`
Zakładka w profilu klientki: lista kart + red flags pinned na górze. PDF download.

### `src/modules/consultation/VoiceNoteRecorder.tsx`
Przycisk mikrofonu → nagrywanie (max 2 min) → upload do storage → trigger transkrypcji AI. Wyświetlanie: waveform, transcript expandable, extracted chips.

### `src/modules/consultation/VoiceNoteCard.tsx`
Karta voice note: audio player, transkrypcja, wyciągnięte dane (produkty, tagi, sugestia wizyty), przyciski akcji.

### `src/modules/consultation/index.ts`

### `src/hooks/useConsultations.ts`
CRUD hooki: templates, cards, voice notes.

## 4. Integracja

| Plik | Zmiana |
|------|--------|
| `AdminSidebar.tsx` | Tab `"consultation"` z ikoną `ClipboardList` |
| `AdminDashboard.tsx` | Render `ConsultationModule` |
| `DemoPage.tsx` | Rejestracja z `isDemo` |
| `TabType` | Rozszerzenie o `"consultation"` |
| `i18n pl.json / en.json` | Klucze tłumaczeń |

## 5. Storage

Audio files → istniejący bucket `salon-media` (subfolder `voice-notes/`).

## 6. Uwagi
- Podpis: HTML Canvas z touch events, export jako PNG → upload do storage
- Red flags z kart konsultacyjnych wyświetlane jako pinned badges w profilu klientki
- Voice notes: transkrypcja przez Lovable AI (gemini-2.5-flash) — nie wymaga dodatkowego API key
- Strukturyzacja AI wyciąga: użyte produkty, tagi, sugestię następnej wizyty, notatki
- Demo mode: mock data bez prawdziwego nagrywania


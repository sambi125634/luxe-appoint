

## Plan: Redesign sekcji opinii — Video Testimonial w mockupie telefonu + 2 opinie tekstowe

### Koncept UX

Layout na desktop: 3-kolumnowy układ z centralnym **mockupem telefonu** zawierającym wideo-recenzję, a po bokach **2 opinie pisane** (lekko przytłumione, mniejsze — żeby mockup z wideo dominował).

```text
┌─────────────────────────────────────────────────┐
│              Nagłówek sekcji                     │
│                                                  │
│  ┌──────────┐   ┌──────────────┐   ┌──────────┐ │
│  │  Opinia   │   │  ┌────────┐  │   │  Opinia  │ │
│  │  pisana   │   │  │ VIDEO  │  │   │  pisana  │ │
│  │  #1       │   │  │ mockup │  │   │  #2      │ │
│  │           │   │  │ phone  │  │   │          │ │
│  │  mniejsza │   │  │  ▶️    │  │   │ mniejsza │ │
│  │  opacity  │   │  └────────┘  │   │ opacity  │ │
│  │  0.85     │   │  Imię + rola │   │ 0.85     │ │
│  └──────────┘   └──────────────┘   └──────────┘ │
└─────────────────────────────────────────────────┘
```

Mobile: Wideo mockup na pełną szerokość u góry, pod spodem karuzela 2 opinii pisanych (jak teraz, z kropkami).

### Szczegóły techniczne

**Plik:** `src/components/landing/TestimonialsSection.tsx` — pełna przebudowa

1. **Mockup telefonu z wideo:**
   - Ramka telefonu (rounded-[40px], border, shadow-xl) z aspect-ratio 9:16
   - Wewnątrz: element `<video>` z posterem i przyciskiem play (ikona Play z lucide)
   - Wideo placeholder: szary gradient z tekstem "Wideo wkrótce" + ikona Play (do momentu aż wgrasz prawdziwe wideo)
   - Po kliknięciu: odtwarza wideo inline (controls natywne)
   - Pod mockupem: imię, rola, gwiazdki

2. **2 opinie pisane** (zachowane z obecnych danych — np. Karolina W. i Anna S.):
   - Mniejsze karty niż obecnie
   - `opacity-90` na desktop, żeby wideo dominowało
   - Vertically centered relative to mockupu

3. **Redukcja z 5 do 2 opinii pisanych** — czyściej, mniej overwhelming

4. **Animacje:** fade-in-up na scroll, stagger: lewy → center → prawy

5. **Przygotowanie na prawdziwe wideo:**
   - Prop/const `VIDEO_URL` — na razie `null`, po wgraniu zamienisz na URL z storage
   - Gdy `VIDEO_URL = null` → pokazuje placeholder z komunikatem "Recenzja wideo wkrótce"

### Mobile
- Mockup telefonu z wideo — pełna szerokość, mniejszy padding
- Pod spodem: 2 opinie pisane w karuzeli z kropkami (jak teraz, ale tylko 2)

### Plik do edycji

| Plik | Co |
|------|----|
| `src/components/landing/TestimonialsSection.tsx` | Pełna przebudowa: video mockup centralny + 2 opinie po bokach |


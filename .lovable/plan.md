

## Plan: Zamiana emoji na wygenerowane zdjęcia nisz w AudienceSection

### Koncept
Zamiast emoji (💅, ✂️, ✨...) — każda z 10 kart nisz dostaje profesjonalne, wygenerowane zdjęcie przedstawiające daną niszę beauty. Zdjęcia w formacie rounded, na górze karty, pozwalają odwiedzającym od razu utożsamić się ze swoją branżą.

### Realizacja

**1. Generowanie 10 zdjęć (edge function + Nano banana pro)**

Skrypt generuje 10 obrazków przez `google/gemini-3-pro-image-preview` z promptami dopasowanymi do każdej niszy:

| Kategoria | Prompt (skrót) |
|-----------|----------------|
| Paznokcie i dłonie | Elegant close-up of manicured nails, soft lighting, premium salon |
| Fryzjerstwo i włosy | Stylist working on client's hair, modern salon interior |
| Kosmetyka i twarz | Facial treatment in aesthetic clinic, clean minimal |
| Rzęsy i brwi | Lash extension procedure, close-up, professional |
| Depilacja | Laser hair removal device, clinical setting |
| Medycyna estetyczna | Aesthetic medicine procedure, modern clinic |
| Masaż i wellness | Relaxing massage, warm spa ambiance |
| SPA i kompleksy | Luxury spa interior, candles, warm tones |
| Sylwetka i ciało | Body contouring treatment, modern equipment |
| Specjalistyczne | Trichology/bridal makeup, specialized tools |

Zdjęcia zapisane do `src/assets/audience/` jako PNG (np. `nails.png`, `hair.png`...).

**2. Zmiana AudienceSection.tsx**

- Zamiast `emoji: "💅"` → `image: import` z `src/assets/audience/`
- Zamiast `<div className="text-2xl mb-2">{cat.emoji}</div>` → `<img src={cat.image} className="w-full h-32 object-cover rounded-lg mb-3" />`
- Karty nieco wyższe, zdjęcie zajmuje górną część karty
- Overflow hidden na karcie dla czystego wyglądu

**3. Fix runtime error**
Usunięcie ewentualnej referencji do `DemoPreviewSection` w Index.tsx (jeśli istnieje w wersji buildowej).

### Pliki do edycji/utworzenia

| Plik | Co |
|------|----|
| Skrypt generujący | Generacja 10 zdjęć przez AI, zapis do `src/assets/audience/` |
| `src/components/landing/AudienceSection.tsx` | Import zdjęć zamiast emoji, img tag zamiast text div |
| `src/pages/Index.tsx` | Fix runtime error (jeśli referencja DemoPreviewSection wciąż istnieje) |


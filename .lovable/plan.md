

## Plan: Jasne tło kalkulatora + przesunięcie pod OwnYourClientsSection

### Zmiany

**1. Index.tsx — zmiana kolejności**

Obecna: Hero → OwnYourClients → SystemFlow → **SalonLossCalculator** → Comparison → ...

Nowa: Hero → OwnYourClients → **SalonLossCalculator** → SystemFlow → Comparison → ...

Kalkulator ląduje zaraz po sekcji o marketplace (OwnYourClients), tworząc naturalną kontynuację: "marketplace Cię okrada" → "policz ile dokładnie tracisz".

**2. SalonLossCalculator.tsx — zamiana ciemnego tła na jasne z gradientowymi orbami**

| Element | Było (ciemne) | Będzie (jasne, styl Hero) |
|---------|--------------|--------------------------|
| Tło sekcji | `bg-[#0F0B1A]` | `bg-background` (#FAFAF8) |
| Glow orby | violet/fuchsia na ciemnym | Brzoskwiniowo-lawendowe radial gradienty (jak Hero: `hsl(var(--primary)/0.12)`, `hsl(var(--accent)/0.14)`) — subtelne, rozmyte |
| Tekst przejściowy | `text-gray-400` + `text-white` | `text-muted-foreground` + `text-foreground font-semibold` |
| Karta quizu | `bg-white` (bez zmian) | Bez zmian — biała karta na ciepłym tle |
| Shadow karty | `shadow-black/20` | `shadow-[0_12px_60px_-12px_rgba(0,0,0,0.08)]` (miękki, jasny) |
| Progress bar dots | `bg-violet-500` | `bg-primary` (#B87D5E bronze) |
| Przyciski selected | `border-violet-600 bg-violet-50` | `border-primary bg-primary/5` |
| CTA gradient | `from-violet-600 to-violet-500` | `bg-gradient-to-r from-primary to-[#D4A574]` (bronze gradient) |
| Result counter | `text-red-400` z czerwonym glow | `text-destructive` (#D94F3D) z subtlnym glow `bg-destructive/10` |
| Emotional box | `bg-violet-500/10 border-violet-500/20` | `bg-primary/5 border-primary/20` |

Wizualnie sekcja będzie jasna, ciepła i spójna z Hero — subtelne glow orby w tle, biała karta quizu z bronze akcentami zamiast fioletu.

### Pliki do edycji

| Plik | Co |
|------|----|
| `src/pages/Index.tsx` | Przesunięcie SalonLossCalculator na pozycję 3 (po OwnYourClients, przed SystemFlow) |
| `src/components/landing/SalonLossCalculator.tsx` | Zamiana ciemnej palety na jasną ciepłą — tło, orby, akcenty, cienie |


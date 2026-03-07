
Rekomendacja: zostańmy przy jednym projekcie.

Na podstawie sprawdzenia:
- `https://admin.beauty-funnels.com/auth` działa i pokazuje formularz logowania.
- Problem dotyczy głównie wejścia na `https://admin.beauty-funnels.com/` (root), które nadal pokazuje landing.
- To oznacza, że panel i logowanie już są w projekcie, ale routing domeny/rootu nie jest jeszcze „twardo” domknięty.

## Dlaczego 1 projekt (a nie nowy)
1. Ten projekt już zawiera komplet: landing + demo + panel + autoryzację + backend.
2. Nowy projekt oznacza duplikację logiki i ryzyko rozjazdu danych/flow.
3. W Twoim modelu (marketing → demo → rejestracja → panel) jeden projekt jest naturalny i tańszy w utrzymaniu.

## Plan wdrożenia (konkretny)
### Etap 1 — Ustabilizować routing domenowy (najważniejsze)
- Wprowadzić centralną logikę domen:
  - domena marketingowa: `beauty-funnels.com`
  - domena panelowa: `admin.beauty-funnels.com`
- Zmienić routing tak, aby:
  - na domenie panelowej `/` zawsze kierowało na `/auth` (twardy redirect),
  - na domenie marketingowej `/` zawsze pokazywało landing,
  - `/demo` było tylko dla marketingu.

### Etap 2 — Fallback na poziomie DNS/proxy (żeby nie było „niespodzianek”)
- Dodać regułę przekierowania tylko dla:
  - host = `admin.beauty-funnels.com`
  - path = `/`
  - redirect do `https://admin.beauty-funnels.com/auth`
- Nie przekierowywać całego `admin/*`, żeby nie zepsuć `/admin`, `/onboarding`, `/super-admin`, `/auth`.

### Etap 3 — Uporządkować wejścia użytkownika
- Na landing page dodać wyraźny link/CTA:
  - „Panel klienta” → `https://admin.beauty-funnels.com/auth`
- W demo zostawić CTA do rejestracji/lead form (jak teraz), a nie do bezpośredniego panelu produkcyjnego.

### Etap 4 — Testy końcowe (E2E)
Sprawdzimy dokładnie:
1. `admin.beauty-funnels.com` otwiera logowanie.
2. `admin.beauty-funnels.com/auth` działa.
3. Logowanie prowadzi do `/admin` lub `/onboarding` wg roli/statusu.
4. `beauty-funnels.com` pokazuje tylko marketing.
5. `beauty-funnels.com/demo` działa jako demo bez mieszania z panelem klientów.

## Techniczne szczegóły
```text
Użytkownik istniejący:
admin.beauty-funnels.com
  -> /auth
  -> logowanie
  -> /admin (lub /onboarding)

Nowy lead:
beauty-funnels.com
  -> landing
  -> /demo
  -> formularz lead/rejestracja
  -> po aktywacji konta: admin.beauty-funnels.com/auth
```

Zmiany w kodzie będą głównie w routerze (`App.tsx`) i ewentualnie małym helperze do rozpoznawania hosta. Nie trzeba ruszać modelu danych ani robić nowego projektu.

## Decyzja architektoniczna
- Zalecam: 1 projekt + 2 domeny funkcjonalne (marketing i panel).
- Nowy projekt rozważałbym tylko wtedy, gdy chcesz całkowicie osobny cykl release i osobny zespół dla panelu — technicznie to większa złożoność operacyjna.

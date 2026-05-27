# Naprawa linków polecających po 5. wizycie

## Diagnoza

Link wysyłany do klientki prowadzi do 404, bo w kodzie są dwa różne (niezgodne) formaty linków, a żaden nie wskazuje istniejącej trasy:

1. **`src/components/client-app/ReferFriend.tsx:69`** buduje link jako:
   `https://beautycalendar.pl/join/{slug}?ref={code}` — domena **beautycalendar.pl nie istnieje / nie należy do projektu**. Realne domeny to `calendar.beauty-funnels.com`, `admin.beauty-funnels.com` oraz `luxe-appoint.lovable.app`. Stąd 404 (lub strona innego właściciela domeny).

2. **`src/modules/referral/ReferralProgram.tsx:92`** w podglądzie wiadomości pokazuje krótki format `calendar.beauty-funnels.com/r/ANNA2K` — ale w `App.tsx` **nie istnieje trasa `/r/:code`**, jedyna trasa polecająca to `/join/:slug`.

Efekt: niezależnie od tego, którą wersję linku klientka dostanie — trafia na 404.

## Plan naprawy

### 1. Wspólny helper budujący URL
Nowy plik `src/lib/referralUrl.ts`:
- `getPublicOrigin()` — zwraca `https://calendar.beauty-funnels.com` w produkcji, `window.location.origin` w pozostałych środowiskach (dev/preview), żeby linki w podglądzie i w realnym udostępnianiu były zawsze poprawne dla bieżącego deploya.
- `buildReferralUrl(slug, code)` → `${origin}/r/${code}` (krótki, ładny link do SMS/WhatsApp).
- `buildJoinUrl(slug, code?)` → `${origin}/join/${slug}?ref=${code}` (fallback, gdy ktoś już ma stary link).

### 2. Krótka trasa `/r/:code` (rozwiązanie 404)
Nowa strona `src/pages/ReferralRedirectPage.tsx`:
- Pobiera `code` z URL.
- Query do `user_referral_codes` (`code`, `is_active=true`) → bierze `salon_id`.
- Pobiera `slug` z `salons` po `salon_id`.
- Wykonuje `navigate("/join/{slug}?ref={code}", { replace: true })`.
- Stany: loader podczas wyszukiwania, czytelny ekran „Link wygasł / nieprawidłowy" zamiast surowego 404 z CTA „Wróć do strony głównej".

Rejestracja w `src/App.tsx` **przed** `*` (NotFound):
```tsx
<Route path="/r/:code" element={<ReferralRedirectPage />} />
```

### 3. Spójne użycie helpera
- `src/components/client-app/ReferFriend.tsx` — zamienić hardcoded `https://beautycalendar.pl/join/...` na `buildReferralUrl(salonSlug, referralCode)`. Copy i `navigator.share` używają tej samej wartości.
- `src/modules/referral/ReferralProgram.tsx` — podgląd `{link}` wykorzystuje `buildReferralUrl(currentSalonSlug ?? "salon", "ANNA2K")` zamiast literału. Dla demo zostaje przykładowy kod.

### 4. Weryfikacja
- Klik w `/r/<istniejący-code>` → redirect na `/join/<slug>?ref=<code>` → ekran „Dołącz do salonu" (`JoinSalonPage`).
- Klik w `/r/<zły-code>` → ekran „Link wygasł lub nieprawidłowy" (nie 404 Lovable).
- Podgląd wiadomości w panelu admina pokazuje dokładnie ten sam URL, który dostaje klientka.

## Pliki

- **NEW** `src/lib/referralUrl.ts`
- **NEW** `src/pages/ReferralRedirectPage.tsx`
- **EDIT** `src/App.tsx` (rejestracja trasy `/r/:code`)
- **EDIT** `src/components/client-app/ReferFriend.tsx` (poprawna domena + helper)
- **EDIT** `src/modules/referral/ReferralProgram.tsx` (podgląd używa tego samego helpera)

Bez zmian w bazie i w logice nagradzania — `JoinSalonPage` już poprawnie obsługuje `?ref=` i tworzy wpisy w `user_referrals` + kupon powitalny.

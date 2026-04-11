

## Problem

The `MobilePreview.tsx` component renders a hardcoded static mockup (fake cards, fake data) instead of the actual client app (`/app`). It doesn't reflect the real UI that was built across multiple prompts (loyalty, waitlist, gallery, beauty rhythms, etc.).

## Solution

Replace the static mockup with an **iframe** pointing to the actual client app routes, while keeping the live-updating branding config (primary color, salon name) functional.

### Approach

1. **Replace static content with iframe** in `MobilePreview.tsx`:
   - Use an iframe pointing to `/app` (or specific sub-routes based on the selected tab)
   - Tab "Profil" → iframe `/s/demo-salon` (or salon profile route)
   - Tab "Dla Ciebie" → iframe `/app/for-you`  
   - Tab "Wizyty" → iframe `/app/bookings`
   - Add `pointer-events-none` overlay option and `scrolling` control
   - Scale the iframe content down using CSS `transform: scale()` to fit the phone frame (280x520 viewport)

2. **Keep branding sync working**:
   - Pass branding config (primary color, salon name) via URL query params or CSS custom properties injected into the iframe
   - Since the iframe loads the same origin, we can use `postMessage` for live config updates, or simply rely on the fact that branding is saved to the database and the iframe will reflect it on reload
   - Add a "Odśwież podgląd" button to reload the iframe after saving branding changes

3. **Handle auth gracefully**:
   - The `/app` route requires authentication — the admin user may not be a "client" user
   - Solution: Create a dedicated preview route `/app/preview` that renders the same components but skips auth check, or use the existing `/s/demo-salon` route for the profile view which is public
   - For "Dla Ciebie" and "Wizyty" tabs, render with demo/mock data in preview mode (add `?preview=true` query param)

4. **Minimal file changes**:
   - `src/components/admin/client-app/preview/MobilePreview.tsx` — rewrite to use iframe approach
   - Possibly add a `?preview=true` bypass in `ClientApp.tsx` for admin preview purposes

### Technical Details

```
MobilePreview.tsx structure:
┌─────────────────────────┐
│ ● Podgląd na żywo       │
│ [Profil] [Dla Ciebie]   │
│ ┌─────────────────────┐ │
│ │ ┌───────────────┐   │ │
│ │ │               │   │ │
│ │ │   <iframe>    │   │ │
│ │ │  scale(0.55)  │   │ │
│ │ │  390x844 →    │   │ │
│ │ │  fits 280x520 │   │ │
│ │ │               │   │ │
│ │ └───────────────┘   │ │
│ └─────────────────────┘ │
│  [Odśwież podgląd]      │
└─────────────────────────┘
```

- iframe renders at 390x844 (iPhone viewport), scaled down via `transform: scale(0.55)` to fit the 280x480 phone frame
- Each tab switches the iframe `src` to the corresponding route
- A refresh button forces iframe reload after branding changes


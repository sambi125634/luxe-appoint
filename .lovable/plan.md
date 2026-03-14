

# Naprawa crashu w zakładce Klienci

## Problem
`ClientListItem.tsx` linia 72 i 68 — brak null-safety:
- `client.firstName[0]` / `client.lastName[0]` — crash gdy undefined
- `client.tags.includes("vip")` — crash gdy tags jest undefined

## Zmiana w `src/components/admin/clients/ClientListItem.tsx`

**Linia 68**: `client.tags.includes("vip")` → `(client.tags || []).includes("vip")`

**Linia 72**: `{client.firstName[0]}{client.lastName[0]}` → `{(client.firstName || '')[0]}{(client.lastName || '')[0]}`

Dwie drobne zmiany — dodanie fallbacków.


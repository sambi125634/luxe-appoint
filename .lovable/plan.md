

# Plan: Uproszczenie modułu Meta Pixel

## Zakres zmian

Zostawiamy jako **działające zakładki**:
- **CAPI (Zdarzenia)** — log wysłanych eventów server-side
- **Audiences** — mapowanie tagów CRM → Custom Audiences
- **Konfiguracja** — wizard setup (Pixel ID, token, event toggles)

Upraszczamy do **informacyjnego podglądu**:
- **Health** → zastąpić prostą kartą z podsumowaniem (ile eventów wysłano, ile audiences aktywnych) + link/info "Pełne dane o jakości Pixela znajdziesz w Meta Events Manager"
- **Attribution/ROAS** → zastąpić kartą informacyjną: "ROAS i atrybucja są dostępne w Meta Ads Manager. Tutaj możesz śledzić rezerwacje z UTM."
- **Lookalike** → usunąć jako osobną zakładkę, dodać jedynie wzmiankę w Audiences ("Gdy audience osiągnie 100 osób, możesz utworzyć Lookalike w Meta Ads Manager")

## Nowy układ zakładek (4 zamiast 6)

1. **Przegląd** — prosta karta ze statusem (zastępuje Health)
2. **Audiences** — bez zmian
3. **Zdarzenia CAPI** — bez zmian  
4. **Konfiguracja** — bez zmian

## Pliki do zmiany

| Plik | Zmiana |
|------|--------|
| `src/modules/pixel/PixelDashboard.tsx` | Usunąć zakładki Lookalike i ROAS, zamienić Health na uproszczony Przegląd inline |
| `src/modules/pixel/PixelHealthDashboard.tsx` | Przepisać na prostą kartę statusową z info o Meta Events Manager |
| `src/modules/pixel/AudienceMappings.tsx` | Dodać na dole notatkę o Lookalike w Meta Ads Manager |

Pliki `PixelAttribution.tsx` i `LookalikeEngine.tsx` przestaną być importowane (zostaną w repo, ale nieużywane).


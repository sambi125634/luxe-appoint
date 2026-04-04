

## Plan: ComparisonSection — z suchej tabeli w perswazyjną narrację

### Problem z obecną wersją
Tabela z checkmarkami jest **nudna**. Ludzie nie czytają tabel — skanują je. Opisy są ukryte w accordion, więc 90% osób ich nie zobaczy. A "Wspólne funkcje" na dole osłabiają przekaz ("no to co, że mają to samo?").

### Nowa koncepcja: "Storytelling porównawczy"

Zamiast suchej tabeli — trzy sekcje wizualne, każda z innym formatem:

**Blok 1: Cenowy knockout** (na górze, wyróżniony)
Dwie karty obok siebie — BC vs Marketplace. Duże liczby, czytelne. Nie tabela — dwie wizualne karty porównawcze z ceną, prowizją i kluczowym "punchline" na dole każdej.

```text
┌─── Beauty Calendar ───┐  ┌─── Marketplace ──────┐
│  99 zł / mies          │  │  145 zł + 35/os       │
│  0% prowizji           │  │  do 45% (Boost)       │
│  Twoje dane. Zawsze.   │  │  Ich platforma.       │
│  ✓ border-primary      │  │  muted, border-muted  │
└────────────────────────┘  └───────────────────────┘
```

**Blok 2: "Tego nie mają" — feature cards** (główna część)
Zamiast wierszy tabeli — karty (grid 2-col na desktop) z ikoną, tytułem i **zawsze widocznym opisem** (2-3 zdania). Bez accordion — opis od razu widoczny. W prawym górnym rogu karty: mała etykieta "Tylko u nas". To jest sedno perswazji — każda karta to mini-argument sprzedażowy.

**Blok 3: "Wspólne? Tak. Ale..." — zwięzły disclaimer**
Zamiast 5 wierszy tabeli ze wspólnymi funkcjami — jedno zdanie + inline lista:
> "CRM, SMS, magazyn, raporty, karty lojalnościowe — tak, to mają obie platformy. Różnica? W tym co dzieje się **potem** — gdy klientka nie wraca."

To zamyka sekcję i przekierowuje uwagę z powrotem na unikalne funkcje BC.

### Layout finalny

```text
┌──────────────────────────────────────────────┐
│ [eyebrow] Uczciwe porównanie                 │
│ [H2] Co dostajesz u nas,                     │
│      czego nie ma nigdzie indziej.            │
│                                              │
│ ┌── Karta BC ──┐  ┌── Karta Market ──┐       │
│ │ 99zł  0%     │  │ 145+35  do 45%   │       │
│ └──────────────┘  └──────────────────┘       │
│                                              │
│ [sub-header] 12 funkcji których              │
│ marketplace nie oferuje                      │
│                                              │
│ ┌─ Card ──────┐  ┌─ Card ──────┐            │
│ │ 🧠 AI Auto  │  │ 📊 True Prof│            │
│ │ opis 2-3ln  │  │ opis 2-3ln  │            │
│ └─────────────┘  └─────────────┘            │
│ ┌─ Card ──────┐  ┌─ Card ──────┐            │
│ │ ...         │  │ ...         │            │
│ └─────────────┘  └─────────────┘            │
│                                              │
│ [disclaimer] CRM, SMS, magazyn — obie mają.  │
│ Różnica w tym co dzieje się potem.            │
│                                              │
│ [nota] Cennik na podstawie publicznych danych │
│ [CTA] Zacznij za darmo                       │
└──────────────────────────────────────────────┘
```

### Dlaczego to działa lepiej

1. **Karty cenowe** — natychmiastowy "wow, taniej" bez czytania tabeli
2. **Opisy widoczne od razu** — zero ukrytych accordion, każdy widzi argumenty
3. **Grid kart** zamiast tabeli — skanowalne, ładniejsze, mobile-friendly
4. **Disclaimer** zamiast 5 wierszy "wspólne" — uczciwy, ale nie rozmywa przekazu
5. **Każda karta = mini-argument** — perspektywa "Ty/Twój salon"

### Zmiany w plikach

| Plik | Co |
|------|----|
| `src/components/landing/ComparisonSection.tsx` | Przebudowa: cenowe karty na górze, grid feature cards (12 unikalnych) z widocznymi opisami, zwięzły disclaimer wspólnych funkcji, CTA |

Jeden plik. Dane (opisy, ikony, statusy) zostają — zmienia się tylko format prezentacji.


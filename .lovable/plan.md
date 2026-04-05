

## Plan: Usunięcie ValueStackSection i wchłonięcie "value stack" do ComparisonSection

### Problem
`ComparisonSection` — 12 unikalnych funkcji z opisami korzyści.
`ValueStackSection` — te same 13-14 funkcji, ale z przekreślonymi cenami i sumą "3 910 zł/mies → 99 zł".

To mówi to samo dwa razy. Użytkownik scrolluje i widzi te same nazwy ponownie.

### Rozwiązanie

**Usuwamy `ValueStackSection`** z `Index.tsx` — komponent zostaje w repo, ale nie jest renderowany.

**Przenosimy "punchline cenowy"** do `ComparisonSection` — pod gridem 12 funkcji i rozwijaną tabelą wspólnych funkcji dodajemy kompaktowy blok:

```text
┌─────────────────────────────────────────────┐
│ Gdybyś płaciła za każde narzędzie osobno:   │
│ ̶3̶ ̶9̶1̶0̶ ̶z̶ł̶/̶m̶i̶e̶s̶                               │
│ Twoja cena: 99 zł netto/mies               │
│ + 0 zł prowizji. Zawsze.                   │
└─────────────────────────────────────────────┘
```

Bez powtarzania listy — sam knockout cenowy. Karty cenowe BC vs Marketplace na górze ComparisonSection już pokazują cenę, więc ten blok to zamknięcie argumentu po zobaczeniu 12 funkcji.

### Zmiany w plikach

| Plik | Co |
|------|----|
| `src/pages/Index.tsx` | Usunięcie `<ValueStackSection />` i importu |
| `src/components/landing/ComparisonSection.tsx` | Dodanie kompaktowego bloku "value knockout" (przekreślona suma + cena 99 zł) między rozwijaną tabelą a CTA |

Dwa pliki. Lista funkcji pojawia się raz — w ComparisonSection. Argument cenowy zostaje, ale bez duplikacji.


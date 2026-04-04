

## Plan: Dodanie nowych sekcji (System Flow + Data Ownership) obok istniejących

Dodajemy dwa nowe komponenty **obok** istniejących `GameChangerFeaturesSection` i `OwnYourClientsSection` — nic nie zastępujemy ani nie usuwamy.

### Nowe pliki

| Plik | Opis |
|------|------|
| `src/components/landing/SystemFlowSection.tsx` | 4-krokowy flow z pionową connecting line (rezerwacja → przypomnienie → sekwencja → powrót). Eyebrow "Jak to działa", headline, kroki z `framer-motion` stagger, CTA na dole. |
| `src/components/landing/DataOwnershipSection.tsx` | Czarne tło (`bg-black`), biały tekst serif, przekaz o utracie kontroli na marketplace + odpowiedź Beauty Calendar. Separator `border-white/20`, kluczowe frazy w `text-primary`. |

### Zmiany w istniejących plikach

| Plik | Co |
|------|----|
| `src/pages/Index.tsx` | Import obu nowych komponentów. Wstawienie `<SystemFlowSection />` tuż pod `<GameChangerFeaturesSection />` i `<DataOwnershipSection />` tuż pod `<OwnYourClientsSection />`. Istniejące sekcje zostają bez zmian. |

### Detale wizualne

**SystemFlowSection:**
- Pionowa gradient linia `from-primary to-primary/20` łącząca 4 kroki
- Każdy krok: numerowana kropka (`bg-primary`) + tytuł bold + opis muted
- Stagger delay `index * 0.15`
- CTA: "Chcę taki system — zaczynam za darmo"

**DataOwnershipSection:**
- `bg-black text-white`, `max-w-3xl`, tekst centrowany
- Duży serif font, `leading-relaxed`
- Separator: `border-t border-white/20`
- Dolna część: "Beauty Calendar buduje Twoją bazę" z `text-primary` na kluczowych frazach
- Małym: "Eksportujesz kiedy chcesz..."

Trzy pliki do edycji/utworzenia. Zero usunięć.


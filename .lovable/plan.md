

## Plan: Reorganizacja kolejności menu bocznego

### Nowa struktura (zgodnie z instrukcją)

```text
CODZIENNA PRACA
  Dashboard
  Kalendarz
  Widżety          ← przeniesione z Marketing
  Zespół

KLIENCI
  Klienci
  Konwersacje
  Konsultacje

OFERTA & FINANSE
  Usługi
  Produkty
  Raporty

MARKETING
  Ścieżka Klientki  ← zmiana z "Ścieżka Klientki™"
  Retencja
  Polecenia

SYSTEM
  Ustawienia
  Pomoc
```

### Plik do edycji

**`src/components/admin/AdminSidebar.tsx`** — zmiana tablicy `allSections` (linie 44-91):

1. Sekcja "Codzienna praca": Dashboard, Kalendarz, Widżety, Zespół
2. Sekcja "Klienci": Klienci, Konwersacje, Konsultacje (bez Ścieżki Klientki)
3. Nowa sekcja "Oferta & Finanse": Usługi, Produkty, Raporty
4. Sekcja "Marketing": Ścieżka Klientki, Retencja, Polecenia
5. Sekcja "System": Ustawienia, Pomoc

### Nazwy propozycji dla "Widżety"

Kilka autorskich opcji do rozważenia po wdrożeniu:
- **"Kreator"** — bo tworzy się tam widżet rezerwacji
- **"Moje Linki"** — bo generuje się linki do rezerwacji
- **"Rezerwator"** — autorska nazwa na generator widżetu
- Na razie zostawiamy "Widżety", zmiana nazwy w kolejnym kroku

### Efekt
- Logiczniejszy flow: codzienne narzędzia na górze, marketing na dole
- Widżety łatwiej dostępne (wyżej w menu)
- Ścieżka Klientki w sekcji Marketing (gdzie pasuje kontekstowo)
- Zero zmian w logice — tylko kolejność i grupowanie


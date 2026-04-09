

## Plan: Aktualizacja treści OwnYourClientsSection

### Plik: `src/components/landing/OwnYourClientsSection.tsx`

**1. Nowy opis pod nagłówkiem:**

> Gdyby się nad tym zastanowić, to czym różni się platforma marketplace od wystawienia się na targowisku, gdzie wszyscy sprzedają to samo? Dlaczego nie możesz wyeksportować najważniejszych unikatowych danych klienta, takich jak preferencje zakupowe czy historia wizyt? Bo należą one do platformy. Jutro mogą podnieść prowizję, pojutrze wyświetlić Twoją konkurencję 10 zł taniej — zachęcając Cię do oddania 50% prowizji, obiecując, że być może Ciebie wyświetlą dziś użytkownikom.

**2. Marketplace — 7 bullet pointów (było 6):**

```
✗ 45%–55% prowizji od pozyskanego nowego klienta
✗ Brak sekwencji — klientka znika i nikt jej nie goni, bo nie mają na tym zarobku
✗ Jutro mogą podnieść prowizję — i nic nie zrobisz
✗ Twoja konkurencja jest wyświetlana obok Ciebie
✗ Eksportujesz: imię, telefon, email. I nic więcej.
✗ Klientki porównują Cię z tańszą konkurencją w jednym widoku
✗ Budujesz ich bazę. Ich brand. Ich biznes. Nie swój. (Ich biznes to gromadzenie kupujących w aplikacji, a nie pozycjonowanie Twojego biznesu)
```

**3. Beauty Calendar — 7 bullet pointów (było 6):**

```
✓ Twoje klientki. Twoje dane. Na zawsze. (bold bronze)
✓ 0% prowizji — dziś, jutro i za 5 lat
✓ Radar Odejść — AI wykrywa zagrożone klientki 3 tygodnie wcześniej i komunikuje się z nimi, aby temu zapobiec
✓ Auto-zaliczka od klientek z historią no-show — bez niezręcznej rozmowy
✓ Budujesz własną bazę w prywatnej aplikacji mobilnej — nikt Ci jej nie odbierze
✓ Za rok masz asset który pracuje dla Ciebie — nie dla platformy
✓ Stała stawka za pozyskiwanie nowych klientów, na których zarobisz kilkukrotnie więcej dzięki stworzonej do tego platformie
```

### Zakres

Tylko zmiana tablic `marketplacePoints`, `bcPoints` i akapitu `<p>` pod nagłówkiem. Zero zmian w layoucie, animacjach czy strukturze.




## Plan: Przeprojektowanie modalu "Nowa wizyta" w panelu admin

### Problem
Modal dodawania wizyty (`AppointmentModal.tsx`) wygląda generycznie — szare formularze, standardowe selecty, brak koloru. Klient widzi piękny widżet rezerwacji, a admin widzi nudny formularz.

### Rozwiązanie
Przeprojektować modal wizualnie, zachowując 100% obecnej funkcjonalności. Inspiracja z `BookingWidget` — kolorowe karty, gradient w podsumowaniu, ikonki, animowane sekcje.

**Plik: `src/components/admin/AppointmentModal.tsx`**

#### Zmiany wizualne:

1. **Nagłówek** — gradient tło z ikoną `CalendarPlus`, większy tytuł
2. **Sekcja klienta** — zachować search, ale ładniejszy dropdown z awatarami (inicjały w kolorowych kółkach)
3. **Sekcja usługi** — zamiast `<Select>` → klikalne karty usług z ceną i czasem, kolorowy border przy zaznaczeniu (jak w BookingWidget)
4. **Sekcja pracownika** — obecne buttony z kolorowymi kropkami → awatary z inicjałami i kolorowym tłem, większe karty
5. **Data i czas** — zachować obecne inputy ale dodać kolorowe ikony i lepszy spacing
6. **Podsumowanie** — gradient card (primary → secondary) z białym tekstem zamiast bladego bg-primary/5
7. **Przycisk zapisu** — pełny gradient, większy, z ikoną `Check`

#### Konkretne zmiany CSS/JSX:

- Dialog header: dodać `bg-gradient-to-r from-primary/10 to-secondary/10 -mx-6 -mt-6 px-6 pt-6 pb-4 rounded-t-lg`
- Karty usług: `grid grid-cols-1 gap-2` z kartami `border-2 rounded-xl p-3 hover:border-primary/50 transition-all` zamiast `<Select>`
- Karty pracowników: zwiększyć z `p-3` do `p-3.5`, dodać `shadow-sm`, inicjały w kolorowym kółku zamiast kropki
- Podsumowanie: `bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl p-5` z białymi labelami
- Footer: przycisk `bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg hover:shadow-xl transition-all px-8 py-3 rounded-xl`

### Efekt
- Admin czuje się jak klient — premium, kolorowo, przyjemnie
- Zero zmian w logice / hookach / zapisie danych
- Spójna estetyka z widżetem rezerwacji online

### Pliki do edycji
1. `src/components/admin/AppointmentModal.tsx` — redesign wizualny


## Plan: Przebudowa komunikacji LP — 14 funkcji WOW + Demo CTA

### Kontekst
Obecna strona wymienia funkcje generycznie. Potrzebujemy sekcji, która **sprzedaje konkretne funkcjonalności** językiem korzyści (styl Brunson/Belfort), z naciskiem na 14 kluczowych "game changerów".

---

### 14 funkcji WOW do wyeksponowania

| # | Funkcja | Główna korzyść (copy) |
|---|---------|----------------------|
| 1 | **Inteligentny Asystent Grafiku** | AI wypełnia luki w kalendarzu — sugeruje klientom terminy, które są dla Ciebie najkorzystniejsze |
| 2 | **Wideo-prezentacje usług** | Pokaż swoją usługę w akcji — klient widzi efekt zanim zarezerwuje |
| 3 | **Receptury zabiegowe + True Profit** | Wiesz ile naprawdę zarabiasz na każdym zabiegu — po odliczeniu materiałów |
| 4 | **Skan kodów → aktualizacja magazynu** | Zeskanuj produkty aparatem — stan magazynowy aktualizuje się sam |
| 5 | **Prognoza przychodów AI** | Wiesz z wyprzedzeniem ile zarobisz w tym miesiącu |
| 6 | **Grupy zakupowe klientów** | AI segreguje klientów wg preferencji — wiesz komu co zaproponować |
| 7 | **Karty konsultacyjne** | Ankiety wysyłane automatycznie — dane zapisane w profilu klienta |
| 8 | **Raporty dla księgowej 1-click** | Wpisz email księgowej → wyślij komplet raportów jednym kliknięciem |
| 9 | **Ścieżka Klienta (Pipeline 5 wizyt)** | Widzisz na jakim etapie jest każdy klient — od 1. do 5. wizyty |
| 10 | **AI Retencja — strefy ryzyka** | System wykrywa kto odchodzi i uruchamia sekwencje zanim będzie za późno |
| 11 | **Auto-zaliczki dla no-showów** | AI wymusza zaliczki tylko od klientów, którzy nie przychodzą — reszta rezerwuje normalnie |
| 12 | **Śledzenie statystyk linków** | Otwarcia, kliknięcia, rezerwacje, wartość — na każdej kampanii retencyjnej |
| 13 | **Program poleceń z analityką** | Twoje klientki jako ambasadorki — widzisz ile każda zarobiła dla Ciebie |
| 14 | **Współpraca z influencerami** | Dedykowane linki ze statystykami ROI — wiesz czy współpraca się opłaca |

---

### Zmiany na landing page

#### 1. Nowa sekcja: "14 funkcji, których nie ma konkurencja"
- **Plik**: Nowy komponent `GameChangerFeaturesSection.tsx`
- **Format**: Siatka kart (2 kolumny desktop, 1 mobile) z ikoną, nagłówkiem korzyści i 2-3 zdaniowym opisem
- **Styl**: Perswazyjny, bezpośredni, "Ty" — jak rozmowa doradczyni
- **Pozycja**: Po sekcji "Problem" (przed pricing)

#### 2. Aktualizacja `FeaturesSection.tsx`
- Zastąpić generyczne opisy konkretnymi korzyściami z listy powyżej
- Każda funkcja z mini-scenariuszem: "Wyobraź sobie, że..."

#### 3. Przywrócenie Demo z nowym CTA
- **Plik**: `InteractiveDemoSection.tsx` lub nowy `DemoPreviewSection.tsx`
- **Pozycja**: Niżej na stronie (po features, przed pricing)
- **CTA**: "Przeklikaj sam — zobacz jak to działa" → link do `/demo`
- **Nie** na samej górze — najpierw sprzedajemy wartość

#### 4. Demo banner w panelu `/demo`
- **Plik**: `DemoPage.tsx` — zmienić banner z "Umów prezentację" na:
  - "Chcesz to u siebie? **Zacznij za darmo — 14 dni full access**"
  - CTA: "Zapisz się" → link do formularza leadów `/#lead-form`
- Dodać sticky bottom bar na mobile: "Zapisz się za darmo"

#### 5. Aktualizacja `ValueStackSection.tsx`
- Dopasować listę do 14 funkcji WOW
- Każda pozycja z "wartością rynkową" vs "W CENIE"

#### 6. Pipeline wyjaśnienie (copy)
- W sekcji features dodać opis ścieżki: "Sprzedajesz 5 wizyt, ale klient płaci za jedną. My pilnujemy, żeby wrócił na kolejne 4."
- Mechanizm: po każdej wizycie właściciel oznacza "stawił się / nie stawił" → klient przesuwa się w pipeline → automatyczne sekwencje

---

### Pliki do edycji

| Plik | Zmiana |
|------|--------|
| `src/components/landing/GameChangerFeaturesSection.tsx` | **NOWY** — sekcja 14 funkcji WOW |
| `src/components/landing/FeaturesSection.tsx` | Aktualizacja copy na korzyści |
| `src/components/landing/ValueStackSection.tsx` | Nowa lista wartości |
| `src/components/landing/DemoPreviewSection.tsx` | Przywrócenie sekcji demo z CTA |
| `src/pages/DemoPage.tsx` | Banner "Zapisz się" zamiast "Umów prezentację" |
| `src/pages/Index.tsx` | Dodanie nowych sekcji w odpowiedniej kolejności |
| `src/components/landing/index.ts` | Export nowych komponentów |

---

### Kolejność sekcji na LP (proponowana)

1. Hero (emocja + CTA)
2. Social Proof Bar
3. Problem (marketplace vs własność)
4. **14 funkcji WOW** ← NOWE
5. Transformacja (przed/po)
6. Ścieżka Klienta (pipeline wyjaśnienie)
7. Value Stack (Hormozi)
8. **Demo Preview** ← przywrócone niżej
9. Pricing (FREE/PRO/ELITE)
10. Audience (dla kogo)
11. Guarantee
12. FAQ
13. Final CTA
14. Footer



# Plan: Widget Editor — brakujące funkcje dla efektu WOW

## Co już jest (7 zakładek)
Podstawowe, Usługi, Kroki (drag-and-drop), Formularz, Wygląd, Płatności, Promocja

## Co brakuje — analiza

### 1. **Przycisk "Dodaj własne pole" nie działa** (linia 440)
Button jest renderowany ale nic nie robi — `onClick` nie jest podpięty. Właścicielka salonu nie może dodać np. "Rodzaj skóry", "Preferowany terapeuta".

### 2. **Brak uploadu logo**
Toggle "Pokaż logo" istnieje, ale nie ma pola do wgrania pliku. Widget zawsze pokazuje placeholder.

### 3. **Brak wyboru czcionki**
`fontFamily` jest w typach (`WidgetTheme.fontFamily`) ale nie ma UI do wyboru. Salon premium chce dopasować font do swojego brandingu.

### 4. **Brak koloru tła**
`backgroundColor` jest w typach ale nie ma inputa w zakładce Wygląd.

### 5. **Brak ustawień potwierdzenia / Thank You**
Po rezerwacji — brak opcji: tekst podziękowania, redirect URL, social share buttons.

### 6. **Brak limitu rezerwacji per widget**
Np. "Max 50 rezerwacji z tego widgetu" — kluczowe dla kampanii z limitem.

### 7. **Brak ustawień okna czasowego**
Np. "Rezerwacje min. 24h wcześniej", "Max 30 dni do przodu" — per widget, nie globalnie.

### 8. **Brak social proof**
Badge "🔥 12 osób rezerwowało dziś" — zwiększa konwersję.

### 9. **Brak tab Analytics w edytorze**
Konwersja, funnel drop-off per krok — właścicielka chce wiedzieć gdzie klienci rezygnują.

## Proponowane zmiany

### A. Naprawić "Dodaj własne pole" (Formularz)
- Modal z: nazwa pola, typ (text/select/checkbox/date), wymagane?, placeholder, opcje (dla select)
- Nowe pole dodaje się do listy z możliwością usunięcia

### B. Nowa zakładka "Zaawansowane" (ikona: Settings)
Zbierze:
- Upload logo (file input + preview)
- Wybór czcionki (Inter, Playfair Display, Lato, Poppins, Montserrat)
- Kolor tła widgetu
- Tekst potwierdzenia po rezerwacji
- URL przekierowania po rezerwacji (opcjonalnie)
- Social proof badge (toggle + tekst)
- Min. wyprzedzenie rezerwacji (godziny)
- Max. horyzont rezerwacji (dni)
- Limit łącznej liczby rezerwacji

### C. Nowa zakładka "Analityka" (ikona: BarChart3)
- Wykres konwersji (mock data w demo): 100 wyświetleń → 67 kliknięć → 42 formularze → 23 rezerwacje
- Funnel drop-off per krok (mini bar chart)
- Conversion rate badge
- Top źródła ruchu (mock)

### D. Ulepszony podgląd na żywo
- Dodać do preview: badge social proof, logo placeholder, font preview

### Pliki do zmiany

| Plik | Akcja |
|------|-------|
| `src/components/admin/widgets/WidgetEditor.tsx` | Dodać 2 nowe zakładki, naprawić "Dodaj pole", modal custom field |
| `src/components/admin/widgets/types.ts` | Rozszerzyć `BookingWidget` o nowe pola (thankYouText, redirectUrl, socialProof, bookingLimits) |

Bez nowych plików — wszystko w istniejących. Szacunek: ~200 linii nowego kodu.


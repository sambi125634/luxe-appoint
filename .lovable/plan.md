

## Plan: Realne dane w recepturach demo + True Profit w raporcie sprzedaży

### 1. Receptury — realne ceny i droższe usługi

**Problem**: Ceny zakupu produktów są nierealistyczne (np. waciki 0.05 zł/op., cleaner 0.03 zł/500ml). Usługi są tanie (manicure 120 zł, henna 80 zł) — nie pokazują potencjału Med-Spa.

**Nowe usługi demo** (droższe, zgodne z profilem Atelier Beauty Studio):

| Usługa | Cena | Czas |
|--------|------|------|
| Mezoterapia igłowa twarzy | 450 zł | 60 min |
| HIFU – lifting bez skalpela | 1200 zł | 90 min |
| Peeling chemiczny TCA | 350 zł | 45 min |
| Manicure hybrydowy premium | 180 zł | 75 min |
| Drenaż limfatyczny – pełny | 280 zł | 60 min |

**Nowe produkty demo** z realistycznymi cenami zakupu (za opakowanie):

| Produkt | Cena netto | Pojemność |
|---------|-----------|-----------|
| Koktajl meso NCTF 135HA 5ml | 185 zł | 5ml |
| Żel HIFU 250ml | 45 zł | 250ml |
| Peeling TCA 15% 30ml | 120 zł | 30ml |
| Baza hybrydowa 8ml | 28 zł | 8ml |
| Lakier hybrydowy 7ml | 35 zł | 7ml |
| Top coat no-wipe 8ml | 32 zł | 8ml |
| Krem drenujący 200ml | 68 zł | 200ml |
| Igły meso 32G (op. 10szt) | 42 zł | 10szt |
| Maseczka kojąca 50ml | 38 zł | 50ml |
| Waciki bezpyłowe (op. 500szt) | 25 zł | 500szt |
| Środek dezynfekcyjny 500ml | 32 zł | 500ml |

**Receptury** — ilości przeliczane na realne zużycie:
- Mezoterapia: koktajl NCTF (1 ampułka = 185 zł), igły (2szt = 8.40 zł), dezynfekcja, maseczka → koszt ~205 zł, marża ~54%
- HIFU: żel (50ml z 250ml = 9 zł), maseczka → koszt ~15 zł, marża ~99%
- Peeling TCA: peeling (5ml z 30ml = 20 zł), maseczka → koszt ~28 zł, marża ~92%
- Manicure: baza + lakier + top + waciki → koszt ~100 zł, marża ~44%
- Drenaż: krem drenujący (40ml z 200ml = 13.60 zł) → koszt ~16 zł, marża ~94%

**Kluczowa zmiana w kalkulacji**: Obecnie koszty są dzielone przez 100 (`quantity_value / 100`), co wymusza dziwne wartości. Receptury zapiszę z `quantity_value` już przeliczoną na koszt jednostkowy × ilość (tzn. quantity_value = zużyta ilość w jednostkach, a purchase_price_net = cena za 1 jednostkę).

### 2. Raport sprzedaży produktów — dodanie True Profit

**Plik**: `src/components/admin/products/ProductSalesReport.tsx`

Dodanie piątej karty statystyk **"True Profit"** obok istniejących (przychód, marża, % marży, sprzedane szt):

- Ikona: `TrendingUp` w kolorze primary
- Wartość: przychód − koszt produktów − szacunkowy koszt pracy (35 zł/h × szacowany czas)
- Label: "True Profit"
- Sub: "po odliczeniu kosztów materiałów i pracy"

Dodanie kolumny **True Profit** w tabeli sprzedaży — po kolumnie "Marża %", pokazującej zysk po odjęciu kosztu materiałów i szacowanego kosztu pracy.

### Pliki do edycji

| Plik | Co |
|------|----|
| `src/modules/inventory/ServiceRecipes.tsx` | Nowe DEMO_SERVICES, DEMO_PRODUCTS, INITIAL_DEMO_RECIPES z realnymi danymi Med-Spa |
| `src/components/admin/products/ProductSalesReport.tsx` | Dodanie karty True Profit + kolumna w tabeli |


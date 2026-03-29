

# Optymalna kolejność widgetów w Dashboard

## Obecna kolejność
1. Alerty (komunikacja, setup checklist)
2. Header + KPI karty (4x)
3. Weekly Brief
4. Dzisiejszy zespół (TodayStaffCard)
5. Prognoza przychodu (RevenuePredictionCard)
6. Retencja klientek (RetentionFlowWidget)
7. Dzisiejsze wizyty (lista) + sidebar (stany magazynowe, top usługi, top pracownicy)

## Problem
Dzisiejsze wizyty — **najważniejsza rzecz rano** — są dopiero na samym dole. Weekly Brief (strategiczny, nie pilny) jest wyżej niż lista wizyt. Retencja (ważna, ale nie pilna) jest też przed wizytami.

## Proponowana kolejność (priorytet właścicielki)

```text
1. Alerty (setup/komunikacja)     ← bez zmian, pilne
2. Header + KPI karty (4x)        ← bez zmian, szybki przegląd
3. DZISIEJSZE WIZYTY + sidebar    ← ↑↑↑ z dołu na górę
   (lista wizyt | top usługi + top pracownicy)
4. Prognoza przychodu              ← ↑ pieniądze = priorytet
5. Retencja klientek               ← bez zmian, zdrowie bazy
6. Dzisiejszy zespół               ← ↓ informacyjne, nie pilne
7. Weekly Brief                    ← ↓↓ strategiczne, raz w tygodniu
8. Stany magazynowe                ← ↓ na dół, rzadko pilne
```

**Logika**: Rano właścicielka chce wiedzieć: *ile wizyt, kto przychodzi, ile zarobię*. Dopiero potem patrzy na retencję i strategię.

## Zmiany techniczne

### Plik: `src/components/admin/DashboardHome.tsx`

Zmiana kolejności bloków w JSX (bez zmiany logiki):

```
1. CommunicationAlert + SetupChecklist
2. Header + QuickProductSale
3. KPI Cards (4x grid)
4. Bottom section (appointments list + top services/staff sidebar)
5. RevenuePredictionCard
6. RetentionFlowWidget
7. TodayStaffCard
8. WeeklyBriefWidget
9. StockAlertsCard (przeniesiony z sidebara na osobny wiersz)
```

StockAlertsCard zostaje wyciągnięty z prawej kolumny bottom section i umieszczony jako samodzielny widget na dole — rzadko wymaga natychmiastowej uwagi.


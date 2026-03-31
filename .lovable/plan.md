

## Plan: Usunięcie True Profit z sidebara + Przeniesienie Eksportu do Ustawień

### Zmiany

#### 1. Usunięcie True Profit z nawigacji
**Plik: `src/components/admin/AdminSidebar.tsx`**
- Usunąć `{ icon: TrendingUp, labelKey: "admin.trueProfit", tab: "analytics" }` z sekcji "Finanse"
- Usunąć `analytics` z `TAB_PERMISSION_MAP`
- Usunąć import `TrendingUp`

#### 2. Usunięcie Eksportu z nawigacji
**Plik: `src/components/admin/AdminSidebar.tsx`**
- Usunąć `{ icon: Download, labelKey: "admin.export", tab: "export" }` z sekcji "Finanse"
- Usunąć `export` z `TAB_PERMISSION_MAP` i typu `TabType`
- Usunąć import `Download`

#### 3. Przeniesienie Eksportu do Ustawień
**Plik: `src/components/admin/settings/types.ts`**
- Dodać `"export"` do `SettingsTabType`

**Plik: `src/components/admin/settings/SettingsModule.tsx`**
- Dodać tab `{ id: "export", label: "Eksport danych", icon: Download }` do listy tabów
- Dodać `TabsContent value="export"` renderujący `<ExportModule />`
- Import `Download` z lucide i `ExportModule`

#### 4. Aktualizacja DemoPage i AdminDashboard
**Plik: `src/pages/DemoPage.tsx`**
- Usunąć case `"analytics"` i `"export"` z `renderContent` i `getPageTitle`
- Usunąć importy `TrueProfitDashboard` i `ExportModule`

**Plik: `src/pages/AdminDashboard.tsx`**
- Usunąć case `"analytics"` i `"export"` z `renderContent` i `getPageTitle`
- Usunąć importy `TrueProfitDashboard` i `ExportModule`

### Efekt
- True Profit znika z sidebara (dane dostępne w Raportach)
- Eksport danych dostępny w Ustawienia → nowa zakładka "Eksport danych"
- Czystsza nawigacja w sekcji Finanse (zostaje tylko "Raporty")


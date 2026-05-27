## Cel

Zakładka **Zespół** ma stać się w pełni operacyjna w realnym koncie:
1. Uprawnienia faktycznie sterują tym, co pracownik widzi (nie są tylko kosmetyką).
2. Można przypisać usługi pracownikowi z **własną ceną i czasem** — siatka możliwości dla wszystkich kombinacji pracownik × usługa (lub wariant usługi).

---

## 1. Uprawnienia pracowników — audyt i dociągnięcie

Obecny stan: `StaffPermissionsTab` ma tabelę z 7 przełącznikami, ale tylko 2 z nich coś realnie robią w UI (`can_view_all_calendar` w `WeeklyCalendar`, gating w `AdminSidebar`). Reszta jest deklaratywna.

Co zrobimy:
- **Audyt każdego przełącznika** i podpięcie do realnych modułów przez `useStaffPermissions`:
  - `can_view_finances` → ukrywa moduły Księgowość, True Profit, Raporty finansowe.
  - `can_edit_services` → blokuje przyciski Edytuj/Usuń w `ServicesManagement`.
  - `can_manage_clients` → gating CRUD w `ClientsManagement`.
  - `can_view_all_calendar` → już działa (filtruje kalendarz do własnych wizyt).
  - `can_manage_staff` → ukrywa zakładkę Zespół całkowicie.
  - `can_view_reports` → ukrywa zakładkę Raporty/Analityka.
  - `can_manage_products` → ukrywa Magazyn/Produkty.
  - `can_manage_marketing` → ukrywa Marketing/Retencję/Widgety.
- **UX zakładki uprawnień**:
  - Dodanie krótkich opisów (tooltip „co dokładnie odblokowuje to uprawnienie") — by właściciel rozumiał konsekwencje.
  - Presety ról: kliknięcie roli (Manager / Specjalista / Recepcjonista / Asystent) automatycznie ustawia rozsądny zestaw przełączników; dalej można dopinać ręcznie.
  - Auto-zapis (debounce 600 ms) zamiast guzika „Zapisz wszystkie zmiany" — przyjemniej i bez ryzyka utraty zmian.

---

## 2. Siatka cen i czasów per pracownik

Obecny stan: `staff_services` to płaska tabela łącząca staff↔service (bez ceny/czasu). `service_variants` istnieje per usługa (np. „Krótkie / Średnie / Długie włosy"), ale nie ma overrideów per pracownik.

### Schemat — migracja

Rozszerzamy `staff_services` o nadpisania (oba pola nullable — `NULL` = używaj wartości z usługi/wariantu):

```
ALTER TABLE public.staff_services
  ADD COLUMN price_override   numeric(10,2),
  ADD COLUMN duration_override integer,
  ADD COLUMN variant_id       uuid REFERENCES service_variants(id) ON DELETE CASCADE;
```

`variant_id` pozwala definiować ceny per **wariant** usługi (jeśli usługa ma warianty). Unique zostaje, ale rozszerzamy klucz na `(staff_id, service_id, variant_id)` (z `variant_id` IS NULL traktowanym jako sentinel).

Logika cen przy bookowaniu:
1. Jeśli istnieje rekord `staff_services` z `price_override` → użyj go.
2. W przeciwnym razie `service_variants.price` (jeśli wybrany wariant) lub `services.price`.
Analogicznie `duration_override` → `variant.duration` → `service.duration`.

### UI — Macierz pracownik × usługa

W `StaffManagement.tsx`, w dialogu pracownika (sekcja „Usługi"):
- Zamiast prostych chipów ON/OFF — **tabela** ze wszystkimi usługami salonu, pogrupowana po kategorii (rozwijane sekcje, jak w `QuickWidgetCreateModal`).
- Każdy wiersz: checkbox (czy świadczy) | nazwa usługi/wariantu | input „Cena (pusty = domyślna 80 zł)" | input „Czas min (pusty = domyślne 60)".
- Jeśli usługa ma warianty — pokazujemy każdy wariant jako osobny pod-wiersz.
- Placeholdery podpowiadają wartość domyślną w jasnoszarym kolorze.

Dodatkowo, w `ServicesManagement.tsx` w edytorze usługi nowa zakładka **„Pracownicy & ceny"** pokazująca tę samą macierz z perspektywy usługi (kto ją robi i za ile) — właściciel ma dwie ścieżki dostępu do tej samej tablicy.

### Zapis

Po zatwierdzeniu — upsert do `staff_services` dla zaznaczonych, delete dla odznaczonych. Pola `*_override` zapisywane jako `null` gdy input pusty.

---

## 3. Pliki do zmiany

**Migracja DB:**
- nowa migracja `staff_services` (kolumny `price_override`, `duration_override`, `variant_id`, nowy unique).

**Backend/Booking:**
- `src/hooks/useAvailableSlots.ts` i komponenty bookingowe (`ServiceSelection`, `TimeSlotCard` itp.) — odczyt overrideów przy wyświetlaniu ceny/czasu.
- `src/hooks/useServices.ts` — opcjonalny join overrideów per staff.

**Uprawnienia (audyt + gating):**
- `src/components/admin/staff/StaffPermissionsTab.tsx` — opisy, presety ról, auto-zapis.
- `src/components/admin/AdminSidebar.tsx` — pełny gating zakładek.
- `src/components/admin/ServicesManagement.tsx`, `ClientsManagement.tsx`, moduły Księgowość / Raporty / Magazyn / Marketing — sprawdzanie `permissions.*` przed renderem akcji edycji/całych modułów.

**Macierz cen:**
- `src/components/admin/StaffManagement.tsx` — nowa sekcja „Usługi & ceny" w dialogu pracownika.
- `src/components/admin/ServicesManagement.tsx` — nowa zakładka „Pracownicy & ceny" w edytorze usługi.
- nowy współdzielony komponent `src/components/admin/staff/StaffServiceMatrix.tsx` (DRY — używany w obu miejscach).

---

## Pytanie zanim wystartuję

Chcesz, żeby **czas trwania per pracownik** też był edytowalny (mówiłeś, że „może bez sensu", ale ma „współistnieć z wariantami")? Trzy opcje:
- (A) Tylko cena per pracownik; czas tylko z wariantu usługi.
- (B) Cena + czas per pracownik (pełna elastyczność).
- (C) Cena per pracownik; czas tylko gdy pracownik świadczy konkretny wariant (czyli wybór wariantu = wybór czasu).

Domyślnie pójdę z **(B)** bo daje najwięcej władzy właścicielowi i nie wymusza tworzenia wariantów do drobnych różnic czasowych — daj znać jeśli wolisz inaczej.

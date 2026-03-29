

# Naprawa migającego sidebara w trybie demo

## Problem
`AdminSidebar` używa hooka `useStaffPermissions()` do filtrowania widocznych zakładek. Ten hook:

1. **Podczas ładowania** (query pending) zwraca domyślnie `isOwner: true` (linia 76) → **widać wszystkie opcje**
2. **Po załadowaniu** — w demo nie ma zalogowanego użytkownika, więc `getUser()` zwraca `null` → hook zwraca `DEFAULT_PERMISSIONS` z `isOwner: false` → **większość zakładek znika**

To wyjaśnia "miganie": początkowo sidebar jest pełny, a po chwili ścina się do kilku opcji.

## Rozwiązanie

### Zmiana w `AdminSidebar` — props `isDemo`

Dodać opcjonalny prop `isDemo?: boolean` do `AdminSidebarProps`. Gdy `isDemo === true`:
- Pominąć filtrowanie po uprawnieniach — pokazać **wszystkie sekcje**
- Nie wywoływać logiki permissions (lub zignorować wynik)

```typescript
// AdminSidebar.tsx
const visibleSections = isDemo
  ? allSections
  : allSections
      .map(section => ({
        ...section,
        items: isOwner
          ? section.items
          : section.items.filter(item => {
              const requiredPerm = TAB_PERMISSION_MAP[item.tab];
              if (!requiredPerm) return true;
              return permissions[requiredPerm];
            }),
      }))
      .filter(section => section.items.length > 0);
```

### Zmiana w `DemoPage.tsx`

Przekazać `isDemo` do sidebara:
```tsx
<AdminSidebar 
  activeTab={activeTab} 
  onTabChange={setActiveTab}
  onClose={() => setSidebarOpen(false)}
  isDemo
/>
```

### Zakres zmian
- `src/components/admin/AdminSidebar.tsx` — dodać prop `isDemo`, pominąć filtrowanie
- `src/pages/DemoPage.tsx` — przekazać `isDemo` do `AdminSidebar`


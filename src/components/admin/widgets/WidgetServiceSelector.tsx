import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useServices, useServiceCategories } from "@/hooks/useServices";

interface WidgetServiceSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  showAllServices: boolean;
  onShowAllChange: (v: boolean) => void;
  isDemo?: boolean;
  /** Compact = inside QuickWidgetCreateModal; default = inside WidgetEditor */
  variant?: "default" | "compact";
}

/**
 * Unified service picker shared by QuickWidgetCreateModal and WidgetEditor.
 * - Groups services by category (sorted by sort_order).
 * - Collapsible sections with per-category "select all".
 * - Search auto-expands matching categories.
 * - Quick-pick category chips.
 * - Sticky selection summary with "clear".
 */
export function WidgetServiceSelector({
  selectedIds,
  onChange,
  showAllServices,
  onShowAllChange,
  isDemo = false,
  variant = "default",
}: WidgetServiceSelectorProps) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [didInitExpand, setDidInitExpand] = useState(false);

  const { data: dbServices } = useServices();
  const { data: dbCategories } = useServiceCategories();

  const services = useMemo(() => {
    if (isDemo) return [] as Array<{ id: string; name: string; price: number; category_id: string | null }>;
    return (dbServices || []).map((s) => ({
      id: s.id,
      name: s.name,
      price: Number(s.price),
      category_id: s.category_id,
    }));
  }, [dbServices, isDemo]);

  const categories = useMemo(() => {
    if (isDemo) return [];
    return (dbCategories || []).map((c) => ({ id: c.id, name: c.name, icon: c.icon || "✨" }));
  }, [dbCategories, isDemo]);

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const buckets: Array<{
      id: string;
      name: string;
      icon: string;
      items: Array<{ id: string; name: string; price: number; category_id: string | null }>;
    }> = categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon, items: [] }));
    const uncategorised = {
      id: "__none__",
      name: "Bez kategorii",
      icon: "•",
      items: [] as typeof buckets[number]["items"],
    };

    for (const s of services) {
      if (q && !s.name.toLowerCase().includes(q)) continue;
      const bucket = buckets.find((b) => b.id === s.category_id);
      if (bucket) bucket.items.push(s);
      else uncategorised.items.push(s);
    }
    for (const b of buckets) b.items.sort((a, b2) => a.name.localeCompare(b2.name, "pl"));
    uncategorised.items.sort((a, b2) => a.name.localeCompare(b2.name, "pl"));
    return [...buckets, uncategorised].filter((b) => b.items.length > 0);
  }, [services, categories, search]);

  const totalShown = grouped.reduce((n, g) => n + g.items.length, 0);

  // On first render with pre-selected services, auto-expand the categories
  // that contain a selection so the user immediately sees what's active.
  useEffect(() => {
    if (didInitExpand) return;
    if (services.length === 0) return;
    if (selectedIds.length === 0) {
      setDidInitExpand(true);
      return;
    }
    const next: Record<string, boolean> = {};
    for (const g of grouped) {
      if (g.items.some((it) => selectedIds.includes(it.id))) next[g.id] = true;
    }
    setExpanded(next);
    setDidInitExpand(true);
  }, [services.length, grouped, selectedIds, didInitExpand]);

  // When search is active, expand matching categories.
  useEffect(() => {
    if (search.trim().length === 0) return;
    setExpanded((prev) => {
      const next = { ...prev };
      for (const g of grouped) next[g.id] = true;
      return next;
    });
  }, [search, grouped]);

  const toggleService = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  };

  const selectAllInCategory = (items: Array<{ id: string }>, select: boolean) => {
    const ids = items.map((i) => i.id);
    if (select) onChange(Array.from(new Set([...selectedIds, ...ids])));
    else onChange(selectedIds.filter((id) => !ids.includes(id)));
  };

  const allExpanded = grouped.length > 0 && grouped.every((g) => expanded[g.id]);

  const listMaxH = variant === "compact" ? "max-h-72" : "max-h-[480px]";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
        <div>
          <p className="text-sm font-medium">Pokaż wszystkie usługi</p>
          <p className="text-xs text-muted-foreground">Włącz, aby pokazać pełną ofertę bez filtra</p>
        </div>
        <Switch checked={showAllServices} onCheckedChange={onShowAllChange} />
      </div>

      {!showAllServices && (
        <>
          {services.length === 0 ? (
            <div className="text-sm text-muted-foreground p-6 border border-dashed border-border rounded-lg text-center">
              Najpierw dodaj usługi w zakładce „Usługi", aby je tutaj wybrać.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Label>Wybierz usługi do wyświetlenia</Label>
                <span className="text-xs text-muted-foreground">
                  {selectedIds.length > 0
                    ? `Wybrano: ${selectedIds.length} / ${services.length}`
                    : `${totalShown} dostępnych`}
                </span>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Szukaj usługi we wszystkich kategoriach…"
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Quick-pick category chips */}
              {grouped.length > 1 && (
                <div className="flex flex-wrap gap-1.5">
                  {grouped.map((g) => {
                    const allSel = g.items.every((it) => selectedIds.includes(it.id));
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => selectAllInCategory(g.items, !allSel)}
                        className={cn(
                          "text-xs px-2.5 py-1 rounded-full border transition-colors",
                          allSel
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-border hover:border-primary/50 text-foreground"
                        )}
                        title={allSel ? "Odznacz całą kategorię" : "Zaznacz całą kategorię"}
                      >
                        {g.icon} {g.name}{" "}
                        <span className="opacity-60">({g.items.length})</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Sticky summary */}
              {selectedIds.length > 0 && (
                <div className="flex items-center justify-between text-xs px-3 py-2 rounded-md bg-primary/5 border border-primary/20">
                  <span className="text-foreground">
                    Wybrano <b>{selectedIds.length}</b> usług
                  </span>
                  <button
                    type="button"
                    onClick={() => onChange([])}
                    className="text-primary hover:underline"
                  >
                    Wyczyść wybór
                  </button>
                </div>
              )}

              <div className={cn("border border-border rounded-lg overflow-y-auto divide-y divide-border", listMaxH)}>
                {grouped.length === 0 && (
                  <p className="text-sm text-muted-foreground p-4 text-center">Brak wyników wyszukiwania</p>
                )}
                {grouped.map((group) => {
                  const isOpen = !!expanded[group.id];
                  const allSelected = group.items.every((it) => selectedIds.includes(it.id));
                  const someSelected = !allSelected && group.items.some((it) => selectedIds.includes(it.id));
                  const selectedCount = group.items.filter((it) => selectedIds.includes(it.id)).length;
                  return (
                    <div key={group.id}>
                      <div className="w-full flex items-center gap-2 px-3 py-2 bg-muted/30 hover:bg-muted/50 transition-colors">
                        <button
                          type="button"
                          onClick={() => setExpanded((p) => ({ ...p, [group.id]: !p[group.id] }))}
                          className="flex items-center gap-2 flex-1 text-left min-w-0"
                        >
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 text-muted-foreground transition-transform shrink-0",
                              !isOpen && "-rotate-90"
                            )}
                          />
                          <span className="text-sm font-medium truncate">
                            {group.icon} {group.name}
                          </span>
                          <Badge variant="outline" className="text-[10px] h-5 px-1.5 shrink-0">
                            {group.items.length}
                          </Badge>
                          {(someSelected || allSelected) && (
                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 shrink-0">
                              {selectedCount} wybr.
                            </Badge>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => selectAllInCategory(group.items, !allSelected)}
                          className="text-[11px] text-primary hover:underline shrink-0"
                        >
                          {allSelected ? "Odznacz" : "Zaznacz wszystkie"}
                        </button>
                      </div>
                      {isOpen && (
                        <div className="divide-y divide-border">
                          {group.items.map((s) => {
                            const selected = selectedIds.includes(s.id);
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => toggleService(s.id)}
                                className={cn(
                                  "w-full flex items-center gap-3 pl-9 pr-3 py-2 text-left hover:bg-muted/50 transition-colors",
                                  selected && "bg-primary/5"
                                )}
                              >
                                <div
                                  className={cn(
                                    "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0",
                                    selected
                                      ? "bg-primary border-primary"
                                      : "border-muted-foreground/30"
                                  )}
                                >
                                  {selected && <Check className="w-3 h-3 text-primary-foreground" />}
                                </div>
                                <span className="flex-1 text-sm truncate">{s.name}</span>
                                <span className="text-xs text-muted-foreground shrink-0">{s.price} zł</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Łącznie usług w katalogu: {services.length}</span>
                <button
                  type="button"
                  onClick={() => {
                    const next: Record<string, boolean> = {};
                    for (const g of grouped) next[g.id] = !allExpanded;
                    setExpanded(next);
                  }}
                  className="text-primary hover:underline"
                >
                  {allExpanded ? "Zwiń wszystkie" : "Rozwiń wszystkie"}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "@/hooks/useSalonId";
import { useServices, useServiceCategories } from "@/hooks/useServices";
import { useStaffMembers } from "@/hooks/useStaffMembers";

interface StaffServiceRow {
  id: string;
  staff_id: string;
  service_id: string;
  variant_id: string | null;
  price_override: number | null;
  duration_override: number | null;
}

interface VariantRow {
  id: string;
  service_id: string;
  name: string;
  duration: number;
  price: number;
}

interface RowKey {
  serviceId: string;
  variantId: string | null;
}

interface RowState {
  assigned: boolean;
  priceOverride: string; // raw input
  durationOverride: string;
  defaultPrice: number;
  defaultDuration: number;
  label: string;
  isVariant: boolean;
}

type Mode = "byStaff" | "byService";

interface Props {
  mode: Mode;
  /** Required when mode="byStaff" */
  staffId?: string;
  /** Required when mode="byService" */
  serviceId?: string;
}

function keyOf(k: RowKey) {
  return `${k.serviceId}::${k.variantId ?? "null"}`;
}

export function StaffServiceMatrix({ mode, staffId, serviceId }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { salonId } = useSalonId();
  const { data: services } = useServices();
  const { data: categories } = useServiceCategories();
  const { data: staffMembers } = useStaffMembers();

  // Load variants for relevant services
  const serviceIdsForVariants = useMemo(() => {
    if (mode === "byStaff") return (services || []).map((s) => s.id);
    if (serviceId) return [serviceId];
    return [];
  }, [mode, services, serviceId]);

  const { data: variants } = useQuery({
    queryKey: ["service-variants-matrix", serviceIdsForVariants],
    queryFn: async () => {
      if (!serviceIdsForVariants.length) return [];
      const { data, error } = await supabase
        .from("service_variants" as never)
        .select("id, service_id, name, duration, price")
        .in("service_id", serviceIdsForVariants);
      if (error) throw error;
      return (data as unknown as VariantRow[]) || [];
    },
    enabled: serviceIdsForVariants.length > 0,
  });

  // Load existing staff_services rows
  const { data: existingRows, isLoading } = useQuery({
    queryKey: ["staff-services-matrix", mode, staffId, serviceId, salonId],
    queryFn: async () => {
      let query = supabase
        .from("staff_services" as never)
        .select("id, staff_id, service_id, variant_id, price_override, duration_override");
      if (mode === "byStaff" && staffId) query = query.eq("staff_id", staffId);
      if (mode === "byService" && serviceId) query = query.eq("service_id", serviceId);
      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown as StaffServiceRow[]) || [];
    },
    enabled:
      (mode === "byStaff" && !!staffId) || (mode === "byService" && !!serviceId),
  });

  // Build rows
  type GroupedRow = { headerLabel: string; rows: { key: RowKey; state: RowState }[] };
  const [state, setState] = useState<Record<string, RowState>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  // Initialize state when data arrives
  useEffect(() => {
    if (!services || !existingRows) return;
    const next: Record<string, RowState> = {};
    const initExpanded: Record<string, boolean> = {};

    const buildRow = (
      sId: string,
      vId: string | null,
      label: string,
      defPrice: number,
      defDuration: number,
      isVariant: boolean,
    ) => {
      const existing = existingRows.find(
        (r) => r.service_id === sId && (r.variant_id ?? null) === vId,
      );
      next[keyOf({ serviceId: sId, variantId: vId })] = {
        assigned: !!existing,
        priceOverride:
          existing?.price_override != null ? String(existing.price_override) : "",
        durationOverride:
          existing?.duration_override != null
            ? String(existing.duration_override)
            : "",
        defaultPrice: defPrice,
        defaultDuration: defDuration,
        label,
        isVariant,
      };
    };

    if (mode === "byStaff") {
      services.forEach((svc) => {
        const svcVariants = (variants || []).filter((v) => v.service_id === svc.id);
        if (svcVariants.length === 0) {
          buildRow(svc.id, null, svc.name, Number(svc.price) || 0, svc.duration, false);
        } else {
          svcVariants.forEach((v) =>
            buildRow(svc.id, v.id, `${svc.name} — ${v.name}`, Number(v.price) || 0, v.duration, true),
          );
        }
      });
    } else if (mode === "byService" && serviceId && staffMembers) {
      const svc = services.find((s) => s.id === serviceId);
      if (!svc) return;
      const svcVariants = (variants || []).filter((v) => v.service_id === serviceId);
      staffMembers.forEach((sm) => {
        if (svcVariants.length === 0) {
          buildRow(
            serviceId,
            null,
            sm.name,
            Number(svc.price) || 0,
            svc.duration,
            false,
          );
          // Re-key under staff_id for byService mode
          const oldKey = keyOf({ serviceId, variantId: null });
          const newKey = `${sm.id}::null`;
          next[newKey] = { ...next[oldKey] };
          delete next[oldKey];
        } else {
          svcVariants.forEach((v) => {
            const existing = existingRows.find(
              (r) => r.staff_id === sm.id && r.variant_id === v.id,
            );
            const key = `${sm.id}::${v.id}`;
            next[key] = {
              assigned: !!existing,
              priceOverride:
                existing?.price_override != null ? String(existing.price_override) : "",
              durationOverride:
                existing?.duration_override != null
                  ? String(existing.duration_override)
                  : "",
              defaultPrice: Number(v.price) || 0,
              defaultDuration: v.duration,
              label: `${sm.name} — ${v.name}`,
              isVariant: true,
            };
          });
        }
      });
    }

    setState(next);
    setExpanded(initExpanded);
  }, [services, variants, existingRows, mode, serviceId, staffMembers]);

  const grouped = useMemo<Record<string, GroupedRow>>(() => {
    const out: Record<string, GroupedRow> = {};

    if (mode === "byStaff" && services) {
      const catMap: Record<string, string> = {};
      (categories || []).forEach((c) => {
        catMap[c.id] = c.name;
      });
      services.forEach((svc) => {
        const catName = svc.category_id ? catMap[svc.category_id] || "Bez kategorii" : "Bez kategorii";
        if (!out[catName]) out[catName] = { headerLabel: catName, rows: [] };
        const svcVariants = (variants || []).filter((v) => v.service_id === svc.id);
        if (svcVariants.length === 0) {
          const k = { serviceId: svc.id, variantId: null as string | null };
          const s = state[keyOf(k)];
          if (s) out[catName].rows.push({ key: k, state: s });
        } else {
          svcVariants.forEach((v) => {
            const k = { serviceId: svc.id, variantId: v.id };
            const s = state[keyOf(k)];
            if (s) out[catName].rows.push({ key: k, state: s });
          });
        }
      });
    } else if (mode === "byService" && staffMembers && serviceId) {
      const svcVariants = (variants || []).filter((v) => v.service_id === serviceId);
      const groupKey = "Pracownicy";
      out[groupKey] = { headerLabel: groupKey, rows: [] };
      staffMembers.forEach((sm) => {
        if (svcVariants.length === 0) {
          const key = `${sm.id}::null`;
          const s = state[key];
          if (s) {
            out[groupKey].rows.push({
              key: { serviceId: sm.id, variantId: null },
              state: s,
            });
          }
        } else {
          svcVariants.forEach((v) => {
            const key = `${sm.id}::${v.id}`;
            const s = state[key];
            if (s) {
              out[groupKey].rows.push({
                key: { serviceId: sm.id, variantId: v.id },
                state: s,
              });
            }
          });
        }
      });
    }
    return out;
  }, [mode, services, variants, categories, staffMembers, serviceId, state]);

  const update = (rowKey: string, patch: Partial<RowState>) => {
    setState((prev) => ({ ...prev, [rowKey]: { ...prev[rowKey], ...patch } }));
  };

  const toggleGroup = (g: string) =>
    setExpanded((p) => ({ ...p, [g]: !p[g] }));

  const handleSave = async () => {
    if (mode === "byStaff" && !staffId) return;
    if (mode === "byService" && !serviceId) return;
    setSaving(true);
    try {
      // Compose rows to upsert + delete
      const desired: {
        staff_id: string;
        service_id: string;
        variant_id: string | null;
        price_override: number | null;
        duration_override: number | null;
      }[] = [];

      Object.entries(state).forEach(([key, s]) => {
        if (!s.assigned) return;
        const [a, b] = key.split("::");
        const variantId = b === "null" ? null : b;
        if (mode === "byStaff") {
          desired.push({
            staff_id: staffId!,
            service_id: a,
            variant_id: variantId,
            price_override:
              s.priceOverride.trim() === "" ? null : Number(s.priceOverride),
            duration_override:
              s.durationOverride.trim() === "" ? null : Number(s.durationOverride),
          });
        } else {
          // byService: a is staff_id
          desired.push({
            staff_id: a,
            service_id: serviceId!,
            variant_id: variantId,
            price_override:
              s.priceOverride.trim() === "" ? null : Number(s.priceOverride),
            duration_override:
              s.durationOverride.trim() === "" ? null : Number(s.durationOverride),
          });
        }
      });

      // Delete existing scope first, then insert fresh
      let delQuery = supabase.from("staff_services" as never).delete();
      if (mode === "byStaff") delQuery = delQuery.eq("staff_id", staffId!);
      else delQuery = delQuery.eq("service_id", serviceId!);
      const { error: delErr } = await delQuery;
      if (delErr) throw delErr;

      if (desired.length > 0) {
        const { error: insErr } = await supabase
          .from("staff_services" as never)
          .insert(desired as never);
        if (insErr) throw insErr;
      }

      queryClient.invalidateQueries({ queryKey: ["staff-services-matrix"] });
      queryClient.invalidateQueries({ queryKey: ["staff-services-map"] });
      queryClient.invalidateQueries({ queryKey: ["staff-services"] });
      toast({ title: "✓ Zapisano", description: "Ceny i czasy zaktualizowane" });
    } catch (err) {
      console.error(err);
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać zmian",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const assignedCount = Object.values(state).filter((s) => s.assigned).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {mode === "byStaff" ? "Usługi świadczone przez tego pracownika." : "Pracownicy świadczący tę usługę."}
          {" "}Pozostaw puste pole, aby użyć ceny/czasu domyślnego.
        </div>
        <Badge variant="secondary">{assignedCount} przypisanych</Badge>
      </div>

      <ScrollArea className="h-[420px] rounded-lg border border-border bg-card">
        <div className="p-2 space-y-1">
          {Object.entries(grouped).map(([gName, group]) => {
            const isOpen = expanded[gName] !== false; // default open
            const groupAssigned = group.rows.filter(
              (r) => state[mode === "byStaff" ? keyOf(r.key) : `${r.key.serviceId}::${r.key.variantId ?? "null"}`]?.assigned,
            ).length;
            return (
              <div key={gName} className="rounded-md">
                <button
                  type="button"
                  onClick={() => toggleGroup(gName)}
                  className="w-full flex items-center justify-between p-2 hover:bg-muted/50 rounded-md transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <span className="font-medium text-sm">{group.headerLabel}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {groupAssigned}/{group.rows.length}
                    </Badge>
                  </div>
                </button>
                {isOpen && (
                  <div className="ml-2 mr-1 mb-2 space-y-1">
                    {/* header */}
                    <div className="grid grid-cols-[24px_1fr_120px_120px] gap-2 px-2 py-1 text-[11px] text-muted-foreground font-medium">
                      <span></span>
                      <span>{mode === "byStaff" ? "Usługa" : "Pracownik"}</span>
                      <span className="text-right">Cena (zł)</span>
                      <span className="text-right">Czas (min)</span>
                    </div>
                    {group.rows.map(({ key, state: s }) => {
                      const rowKey = mode === "byStaff" ? keyOf(key) : `${key.serviceId}::${key.variantId ?? "null"}`;
                      return (
                        <div
                          key={rowKey}
                          className="grid grid-cols-[24px_1fr_120px_120px] gap-2 items-center px-2 py-1.5 rounded-md hover:bg-muted/30"
                        >
                          <Checkbox
                            checked={s.assigned}
                            onCheckedChange={(v) => update(rowKey, { assigned: !!v })}
                          />
                          <span className={s.isVariant ? "text-xs pl-2" : "text-sm"}>
                            {s.label}
                          </span>
                          <Input
                            type="number"
                            min={0}
                            step={1}
                            value={s.priceOverride}
                            onChange={(e) => update(rowKey, { priceOverride: e.target.value })}
                            placeholder={String(s.defaultPrice)}
                            disabled={!s.assigned}
                            className="h-8 text-right"
                          />
                          <Input
                            type="number"
                            min={0}
                            step={5}
                            value={s.durationOverride}
                            onChange={(e) => update(rowKey, { durationOverride: e.target.value })}
                            placeholder={String(s.defaultDuration)}
                            disabled={!s.assigned}
                            className="h-8 text-right"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="flex justify-end">
        <Button variant="luxury" onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Zapisz ceny i czasy
        </Button>
      </div>
    </div>
  );
}

export default StaffServiceMatrix;
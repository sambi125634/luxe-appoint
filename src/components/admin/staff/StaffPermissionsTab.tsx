import { useState, useMemo } from "react";
import { Save, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useStaffMembers } from "@/hooks/useStaffMembers";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface StaffPermissions {
  can_view_finances: boolean;
  can_edit_services: boolean;
  can_manage_clients: boolean;
  can_view_all_calendar: boolean;
  can_manage_staff: boolean;
  can_view_reports: boolean;
  can_manage_products: boolean;
}

const DEFAULT_PERMISSIONS: StaffPermissions = {
  can_view_finances: false,
  can_edit_services: false,
  can_manage_clients: true,
  can_view_all_calendar: false,
  can_manage_staff: false,
  can_view_reports: false,
  can_manage_products: false,
};

const ROLE_OPTIONS = [
  { value: "owner", label: "Właściciel", emoji: "🔴" },
  { value: "manager", label: "Manager", emoji: "🟠" },
  { value: "specialist", label: "Specjalista", emoji: "🟢" },
  { value: "receptionist", label: "Recepcjonista", emoji: "🔵" },
  { value: "assistant", label: "Asystent", emoji: "⚪" },
];

const PERMISSION_COLS: { key: keyof StaffPermissions; short: string }[] = [
  { key: "can_view_finances", short: "Finanse" },
  { key: "can_manage_clients", short: "Klientki" },
  { key: "can_view_all_calendar", short: "Kalendarz" },
  { key: "can_view_reports", short: "Raporty" },
  { key: "can_edit_services", short: "Usługi" },
  { key: "can_manage_products", short: "Produkty" },
  { key: "can_manage_staff", short: "Zespół" },
];

interface StaffPermissionsTabProps {
  isDemo?: boolean;
}

export function StaffPermissionsTab({ isDemo = false }: StaffPermissionsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: staffMembers, isLoading } = useStaffMembers();

  const [changes, setChanges] = useState<Record<string, { role?: string; permissions?: StaffPermissions }>>({});
  const [saving, setSaving] = useState(false);

  const staffList = useMemo(() => {
    if (!staffMembers) return [];
    return staffMembers.map(s => ({
      id: s.id,
      name: s.name,
      avatar_url: s.avatar_url,
      color: s.color || "#7c3aed",
      staff_role: (s as Record<string, unknown>).staff_role as string || "specialist",
      permissions: ((s as Record<string, unknown>).permissions as StaffPermissions) || DEFAULT_PERMISSIONS,
    }));
  }, [staffMembers]);

  const getEffective = (staffId: string, field: "role" | "permissions") => {
    const member = staffList.find(s => s.id === staffId);
    if (!member) return field === "role" ? "specialist" : DEFAULT_PERMISSIONS;
    const change = changes[staffId];
    if (field === "role") return change?.role ?? member.staff_role;
    return change?.permissions ?? member.permissions;
  };

  const updateRole = (staffId: string, role: string) => {
    setChanges(prev => ({
      ...prev,
      [staffId]: { ...prev[staffId], role },
    }));
  };

  const togglePerm = (staffId: string, key: keyof StaffPermissions) => {
    const current = getEffective(staffId, "permissions") as StaffPermissions;
    setChanges(prev => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        permissions: { ...current, [key]: !current[key] },
      },
    }));
  };

  const hasChanges = Object.keys(changes).length > 0;

  const saveAll = async () => {
    if (isDemo) {
      toast({ title: "Zapisano", description: "Demo — zmiany nie zostały zapisane" });
      setChanges({});
      return;
    }

    setSaving(true);
    try {
      for (const [staffId, change] of Object.entries(changes)) {
        const updateData: Record<string, unknown> = {};
        if (change.role) updateData.staff_role = change.role;
        if (change.permissions) updateData.permissions = change.permissions;
        if (Object.keys(updateData).length > 0) {
          const { error } = await supabase.from("staff_members").update(updateData as never).eq("id", staffId);
          if (error) throw error;
        }
      }
      queryClient.invalidateQueries({ queryKey: ["staff-members"] });
      setChanges({});
      toast({ title: "✓ Zapisano", description: "Uprawnienia zostały zaktualizowane" });
    } catch (err) {
      console.error(err);
      toast({ title: "Błąd", description: "Nie udało się zapisać zmian", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading && !isDemo) {
    return <Skeleton className="h-64 w-full" />;
  }

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase();

  return (
    <div className="space-y-4">
      {/* Info box */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
        <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <p className="text-sm text-muted-foreground">
          💡 Zmiany uprawnień działają natychmiast po zapisaniu. Pracownik zobaczy zmiany przy następnym zalogowaniu.
        </p>
      </div>

      {/* Table */}
      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 font-medium">Pracownik</th>
              <th className="text-left p-3 font-medium">Rola</th>
              {PERMISSION_COLS.map(col => (
                <th key={col.key} className="text-center p-3 font-medium whitespace-nowrap">{col.short}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staffList.map(member => {
              const role = getEffective(member.id, "role") as string;
              const perms = getEffective(member.id, "permissions") as StaffPermissions;
              const roleInfo = ROLE_OPTIONS.find(r => r.value === role);

              return (
                <tr key={member.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        {member.avatar_url && <AvatarImage src={member.avatar_url} />}
                        <AvatarFallback className="text-xs" style={{ backgroundColor: member.color, color: "white" }}>
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium whitespace-nowrap">{member.name}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <Select value={role} onValueChange={v => updateRole(member.id, v)}>
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map(r => (
                          <SelectItem key={r.value} value={r.value}>
                            <span className="flex items-center gap-1.5">
                              <span>{r.emoji}</span> {r.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  {PERMISSION_COLS.map(col => (
                    <td key={col.key} className="text-center p-3">
                      <Switch
                        checked={perms[col.key]}
                        onCheckedChange={() => togglePerm(member.id, col.key)}
                        className="mx-auto"
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
            {staffList.length === 0 && (
              <tr>
                <td colSpan={2 + PERMISSION_COLS.length} className="text-center p-8 text-muted-foreground">
                  Brak pracowników
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button variant="luxury" className="gap-2" onClick={saveAll} disabled={!hasChanges || saving}>
          <Save className="w-4 h-4" />
          {saving ? "Zapisywanie..." : "Zapisz wszystkie zmiany"}
        </Button>
      </div>
    </div>
  );
}

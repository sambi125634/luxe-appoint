import { useState } from "react";
import { UserPlus, Shield, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

type StaffRole = "owner" | "manager" | "specialist" | "receptionist" | "assistant";

interface StaffPermissions {
  can_view_finances: boolean;
  can_edit_services: boolean;
  can_manage_clients: boolean;
  can_view_all_calendar: boolean;
  can_manage_staff: boolean;
  can_view_reports: boolean;
  can_manage_products: boolean;
}

const ROLE_DEFINITIONS: { value: StaffRole; label: string; emoji: string; color: string; description: string; defaultPermissions: StaffPermissions }[] = [
  {
    value: "owner", label: "Właściciel", emoji: "🔴", color: "text-red-500",
    description: "Widzi wszystko, zarządza wszystkim",
    defaultPermissions: { can_view_finances: true, can_edit_services: true, can_manage_clients: true, can_view_all_calendar: true, can_manage_staff: true, can_view_reports: true, can_manage_products: true },
  },
  {
    value: "manager", label: "Manager", emoji: "🟠", color: "text-orange-500",
    description: "Widzi finanse, raporty, zarządza grafikiem. Nie może usuwać pracowników ani zmieniać pakietu.",
    defaultPermissions: { can_view_finances: true, can_edit_services: true, can_manage_clients: true, can_view_all_calendar: true, can_manage_staff: false, can_view_reports: true, can_manage_products: true },
  },
  {
    value: "specialist", label: "Specjalista", emoji: "🟢", color: "text-green-500",
    description: "Widzi tylko swój kalendarz i przypisane klientki. Może dodawać notatki i wykonywać wizyty.",
    defaultPermissions: { can_view_finances: false, can_edit_services: false, can_manage_clients: true, can_view_all_calendar: false, can_manage_staff: false, can_view_reports: false, can_manage_products: false },
  },
  {
    value: "receptionist", label: "Recepcjonista", emoji: "🔵", color: "text-blue-500",
    description: "Widzi pełny kalendarz, może rezerwować wizyty. Nie widzi finansów ani raportów.",
    defaultPermissions: { can_view_finances: false, can_edit_services: false, can_manage_clients: true, can_view_all_calendar: true, can_manage_staff: false, can_view_reports: false, can_manage_products: false },
  },
  {
    value: "assistant", label: "Asystent", emoji: "⚪", color: "text-muted-foreground",
    description: "Bardzo ograniczony dostęp — tylko swój grafik.",
    defaultPermissions: { can_view_finances: false, can_edit_services: false, can_manage_clients: false, can_view_all_calendar: false, can_manage_staff: false, can_view_reports: false, can_manage_products: false },
  },
];

const PERMISSION_LABELS: { key: keyof StaffPermissions; label: string }[] = [
  { key: "can_view_finances", label: "Podgląd finansów i raportów" },
  { key: "can_edit_services", label: "Edycja usług i cennika" },
  { key: "can_manage_clients", label: "Zarządzanie bazą klientek" },
  { key: "can_view_all_calendar", label: "Podgląd kalendarza innych pracowników" },
  { key: "can_manage_products", label: "Zarządzanie produktami i magazynem" },
  { key: "can_manage_staff", label: "Zarządzanie pracownikami" },
  { key: "can_view_reports", label: "Dostęp do modułu Retencja i Marketing" },
];

interface WorkingHoursRow {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isWorking: boolean;
}

const defaultWorkingHours: WorkingHoursRow[] = [
  { dayOfWeek: 0, startTime: "09:00", endTime: "17:00", isWorking: false },
  { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isWorking: true },
  { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isWorking: true },
  { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", isWorking: true },
  { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", isWorking: true },
  { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", isWorking: true },
  { dayOfWeek: 6, startTime: "10:00", endTime: "14:00", isWorking: false },
];

const DAY_NAMES = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];

interface StaffInviteTabProps {
  salonId: string | null;
  isDemo?: boolean;
  hasOwner?: boolean;
}

export function StaffInviteTab({ salonId, isDemo = false, hasOwner = false }: StaffInviteTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [staffRole, setStaffRole] = useState<StaffRole>("specialist");
  const [permissions, setPermissions] = useState<StaffPermissions>(ROLE_DEFINITIONS[2].defaultPermissions);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showHours, setShowHours] = useState(false);
  const [workingHours, setWorkingHours] = useState<WorkingHoursRow[]>(defaultWorkingHours);
  const [saving, setSaving] = useState(false);

  const handleRoleChange = (role: StaffRole) => {
    setStaffRole(role);
    const def = ROLE_DEFINITIONS.find(r => r.value === role);
    if (def) setPermissions({ ...def.defaultPermissions });
  };

  const togglePermission = (key: keyof StaffPermissions) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateHours = (dayOfWeek: number, field: keyof WorkingHoursRow, value: string | boolean) => {
    setWorkingHours(prev => prev.map(h => h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h));
  };

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast({ title: "Uzupełnij wymagane pola", description: "Imię, nazwisko i email są wymagane", variant: "destructive" });
      return;
    }

    if (isDemo) {
      toast({ title: "✓ Zaproszenie wysłane", description: `Demo — zaproszenie na ${email}` });
      return;
    }

    if (!salonId) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("staff_members")
        .insert({
          salon_id: salonId,
          name: `${firstName.trim()} ${lastName.trim()}`,
          role: position || "Specjalista",
          email: email.trim(),
          phone: phone || null,
          invitation_email: email.trim(),
          invitation_status: "invited",
          invitation_sent_at: new Date().toISOString(),
          staff_role: staffRole,
          permissions: permissions as unknown as Record<string, unknown>,
        } as never)
        .select("id")
        .single();

      if (error) throw error;

      // Save working hours
      if (data?.id) {
        const workingDays = workingHours.filter(h => h.isWorking);
        if (workingDays.length > 0) {
          await supabase.from("working_hours").insert(
            workingDays.map(h => ({
              staff_id: data.id,
              day_of_week: h.dayOfWeek,
              start_time: h.startTime,
              end_time: h.endTime,
              is_working: true,
            }))
          );
        }
      }

      queryClient.invalidateQueries({ queryKey: ["staff-members"] });
      toast({ title: "✓ Zaproszenie wysłane", description: `Zaproszenie wysłane na ${email}` });

      // Reset form
      setFirstName(""); setLastName(""); setEmail(""); setPhone(""); setPosition("");
      setStaffRole("specialist"); setPermissions(ROLE_DEFINITIONS[2].defaultPermissions);
      setWorkingHours(defaultWorkingHours); setShowPermissions(false); setShowHours(false);
    } catch (err) {
      console.error(err);
      toast({ title: "Błąd", description: "Nie udało się wysłać zaproszenia", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const currentRole = ROLE_DEFINITIONS.find(r => r.value === staffRole);

  return (
    <div className="glass-card p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <UserPlus className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-serif font-semibold">Zaproś pracownika</h3>
          <p className="text-sm text-muted-foreground">Wyślij zaproszenie email do nowego członka zespołu</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Sekcja 1: Dane podstawowe */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dane podstawowe</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Imię *</Label>
              <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Anna" />
            </div>
            <div>
              <Label>Nazwisko *</Label>
              <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Kowalska" />
            </div>
          </div>
          <div>
            <Label>Email służbowy *</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="anna@salon.pl" />
            <p className="text-xs text-muted-foreground mt-1">Na ten adres zostanie wysłane zaproszenie</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Telefon</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+48 123 456 789" />
            </div>
            <div>
              <Label>Stanowisko</Label>
              <Input value={position} onChange={e => setPosition(e.target.value)} placeholder="np. Kosmetolog, Fryzjer" />
            </div>
          </div>
        </div>

        {/* Sekcja 2: Rola */}
        <div className="space-y-4 border-t border-border pt-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4" /> Rola w systemie
          </h4>
          <Select value={staffRole} onValueChange={(v) => handleRoleChange(v as StaffRole)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_DEFINITIONS.map(role => (
                <SelectItem
                  key={role.value}
                  value={role.value}
                  disabled={role.value === "owner" && hasOwner}
                >
                  <span className="flex items-center gap-2">
                    <span>{role.emoji}</span>
                    <span>{role.label}</span>
                    {role.value === "owner" && hasOwner && <span className="text-xs text-muted-foreground">(już istnieje)</span>}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currentRole && (
            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
              {currentRole.emoji} <strong>{currentRole.label}</strong> — {currentRole.description}
            </p>
          )}
        </div>

        {/* Sekcja 3: Uprawnienia */}
        <div className="border-t border-border pt-4">
          <button
            type="button"
            className="flex items-center justify-between w-full text-left"
            onClick={() => setShowPermissions(!showPermissions)}
          >
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Uprawnienia szczegółowe</h4>
            {showPermissions ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          {showPermissions && (
            <div className="mt-3 space-y-3">
              <p className="text-xs text-muted-foreground italic">Uprawnienia ustawiają się automatycznie wg roli, ale możesz je ręcznie nadpisać.</p>
              {PERMISSION_LABELS.map(perm => (
                <div key={perm.key} className="flex items-center justify-between py-1">
                  <span className="text-sm">{perm.label}</span>
                  <Switch
                    checked={permissions[perm.key]}
                    onCheckedChange={() => togglePermission(perm.key)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sekcja 4: Godziny pracy */}
        <div className="border-t border-border pt-4">
          <button
            type="button"
            className="flex items-center justify-between w-full text-left"
            onClick={() => setShowHours(!showHours)}
          >
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4" /> Godziny pracy (opcjonalnie)
            </h4>
            {showHours ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          {showHours && (
            <div className="mt-3 space-y-2">
              {workingHours.map(h => (
                <div key={h.dayOfWeek} className="flex items-center gap-3">
                  <label className="w-28 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={h.isWorking}
                      onChange={e => updateHours(h.dayOfWeek, "isWorking", e.target.checked)}
                      className="rounded border-border"
                    />
                    <span className={cn("text-sm", h.isWorking ? "font-medium" : "text-muted-foreground")}>
                      {DAY_NAMES[h.dayOfWeek]}
                    </span>
                  </label>
                  {h.isWorking ? (
                    <div className="flex items-center gap-2">
                      <Input type="time" value={h.startTime} onChange={e => updateHours(h.dayOfWeek, "startTime", e.target.value)} className="w-28" />
                      <span className="text-muted-foreground">–</span>
                      <Input type="time" value={h.endTime} onChange={e => updateHours(h.dayOfWeek, "endTime", e.target.value)} className="w-28" />
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-xs">Wolne</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <Button variant="luxury" className="w-full gap-2" onClick={handleSubmit} disabled={saving}>
          <UserPlus className="w-4 h-4" />
          {saving ? "Wysyłanie..." : "Wyślij zaproszenie →"}
        </Button>
      </div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "@/hooks/useSalonId";
import { useSalonSettings } from "@/hooks/useSalonSettings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Shield, Wallet, ArrowRight, Info, Settings2, Eye } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatCompensation, type CompensationType } from "@/lib/compensation";
import { useState, useEffect } from "react";

interface TeamSettingsProps {
  isDemo?: boolean;
  onNavigateToModule?: (tabId: string) => void;
}

const DEMO_STAFF = [
  { id: "1", name: "Maria Kowalska", role: "Specjalistka", staff_role: "owner", is_active: true, avatar_url: null, email: "maria@demo.pl",
    compensation_type: "salary", base_salary: 5500, commission_rate: null, hourly_rate: null, flat_rate_per_service: null },
  { id: "2", name: "Kasia Nowak", role: "Stylistka", staff_role: "specialist", is_active: true, avatar_url: null, email: "kasia@demo.pl",
    compensation_type: "commission", commission_rate: 35, base_salary: null, hourly_rate: null, flat_rate_per_service: null },
  { id: "3", name: "Anna Wiśniewska", role: "Recepcjonistka", staff_role: "reception", is_active: true, avatar_url: null, email: "anna@demo.pl",
    compensation_type: "hourly", hourly_rate: 35, base_salary: null, commission_rate: null, flat_rate_per_service: null },
];

const ROLE_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  owner: { label: "Właścicielka", variant: "default" },
  specialist: { label: "Specjalistka", variant: "secondary" },
  reception: { label: "Recepcja", variant: "outline" },
  manager: { label: "Manager", variant: "default" },
};

export function TeamSettings({ isDemo, onNavigateToModule }: TeamSettingsProps) {
  const { salonId } = useSalonId();
  const { settings, isSaving, updateSettings } = useSalonSettings();
  const team = settings.team;

  // Local form state so changes feel instant
  const [form, setForm] = useState(team);
  useEffect(() => { setForm(team); }, [team]);

  const { data: staff, isLoading } = useQuery({
    queryKey: ["team-settings-staff", salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from("staff_members")
        .select("id, name, role, staff_role, is_active, avatar_url, email, invitation_status, compensation_type, commission_rate, hourly_rate, base_salary, flat_rate_per_service")
        .eq("salon_id", salonId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!salonId && !isDemo,
  });

  const list = isDemo ? DEMO_STAFF : (staff || []);
  const activeCount = list.filter((s) => s.is_active).length;

  // Distribution by compensation model
  const distribution = list.reduce(
    (acc: Record<string, number>, s: any) => {
      const t = (s.compensation_type as string) || "unset";
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    },
    {},
  );
  const unsetCount = distribution["unset"] || 0;

  const saveTeam = (patch: Partial<typeof team>) => {
    const next = { ...form, ...patch };
    setForm(next);
    if (!isDemo) {
      updateSettings("team", patch);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Zespół i Uprawnienia</h2>
        <p className="text-muted-foreground mt-1">
          Ustawienia salonowe dla zespołu: domyślny model wynagrodzenia, widoczność w widgecie rezerwacji
          oraz sposób przypisywania wizyt. Pełna edycja pracowników i ich indywidualnych stawek/prowizji
          odbywa się w module <strong>Zespół</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10"><Users className="w-5 h-5 text-primary" /></div>
              <div>
                <div className="text-2xl font-bold">{activeCount}</div>
                <div className="text-xs text-muted-foreground">Aktywnych członków</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10"><Shield className="w-5 h-5 text-primary" /></div>
              <div>
                <div className="text-2xl font-bold">{list.filter((s: any) => s.staff_role === "owner").length}</div>
                <div className="text-xs text-muted-foreground">Właściciele / Adminzi</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10"><Wallet className="w-5 h-5 text-primary" /></div>
              <div>
                <div className="text-2xl font-bold">
                  {list.length - unsetCount}/{list.length}
                </div>
                <div className="text-xs text-muted-foreground">Z ustalonym wynagrodzeniem</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {unsetCount > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {unsetCount === 1 ? "1 pracownik nie ma" : `${unsetCount} pracowników nie ma`} ustawionego modelu
            wynagrodzenia. Dla nich w module <strong>Księgowość → True Profit</strong> używamy
            wartości domyślnych ustawionych poniżej.
          </AlertDescription>
        </Alert>
      )}

      {/* === Section 1: Domyślny model wynagrodzenia === */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            <CardTitle>Domyślny model wynagrodzenia</CardTitle>
          </div>
          <CardDescription>
            Używamy go dla nowych pracowników oraz jako fallback w True Profit, gdy pracownik nie ma
            ustawionego własnego modelu.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Domyślny typ</Label>
              <Select
                value={form.defaultCompensationType}
                onValueChange={(v) => saveTeam({ defaultCompensationType: v as CompensationType })}
                disabled={isSaving}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Stawka godzinowa</SelectItem>
                  <SelectItem value="commission">Prowizja od usługi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Domyślna stawka godzinowa (zł)</Label>
              <Input
                type="number" min={0} step={1}
                value={form.defaultHourlyRate}
                onChange={(e) => setForm({ ...form, defaultHourlyRate: Number(e.target.value) })}
                onBlur={() => saveTeam({ defaultHourlyRate: form.defaultHourlyRate })}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label>Domyślna prowizja (%)</Label>
              <Input
                type="number" min={0} max={100} step={0.5}
                value={form.defaultCommissionRate}
                onChange={(e) => setForm({ ...form, defaultCommissionRate: Number(e.target.value) })}
                onBlur={() => saveTeam({ defaultCommissionRate: form.defaultCommissionRate })}
                disabled={isSaving}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === Section 2: Widoczność w widgecie === */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            <CardTitle>Widoczność zespołu w widgecie rezerwacji</CardTitle>
          </div>
          <CardDescription>
            Globalne ustawienie wyświetlania pracowników klientom przy rezerwacji online.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-4 p-3 rounded-lg border bg-muted/30">
            <div className="flex-1 min-w-0">
              <div className="font-medium">Pokazuj imiona i zdjęcia pracowników</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Klient widzi listę osób z avatarami i specjalizacjami.
              </div>
            </div>
            <Switch
              checked={form.showStaffInWidget}
              onCheckedChange={(v) => saveTeam({ showStaffInWidget: v })}
              disabled={isSaving}
            />
          </div>
          <div className="flex items-start justify-between gap-4 p-3 rounded-lg border bg-muted/30">
            <div className="flex-1 min-w-0">
              <div className="font-medium">Pozwól klientowi wybrać pracownika</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Gdy wyłączone — klient widzi tylko dostępne terminy, system sam przypisuje osobę.
              </div>
            </div>
            <Switch
              checked={form.allowStaffSelection}
              onCheckedChange={(v) => saveTeam({ allowStaffSelection: v })}
              disabled={isSaving || !form.showStaffInWidget}
            />
          </div>
        </CardContent>
      </Card>

      {/* === Section 3: Auto-przypisanie === */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <CardTitle>Auto-przypisanie wizyt</CardTitle>
          </div>
          <CardDescription>
            Reguła używana, gdy klient nie wybiera konkretnej osoby przy rezerwacji.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={form.autoAssignMode}
            onValueChange={(v) => saveTeam({ autoAssignMode: v as typeof form.autoAssignMode })}
            disabled={isSaving}
            className="space-y-2"
          >
            {[
              { val: "first_available", label: "Pierwszy wolny", desc: "Najwcześniejszy dostępny slot dowolnej osoby." },
              { val: "round_robin", label: "Rotacyjne (równy load)", desc: "Sprawiedliwy podział wizyt między pracowników." },
              { val: "by_specialization", label: "Wg specjalizacji", desc: "Tylko osoby z odpowiednim doświadczeniem w danej usłudze." },
            ].map((opt) => (
              <label
                key={opt.val}
                htmlFor={`auto-${opt.val}`}
                className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30 cursor-pointer hover:bg-muted/50 transition"
              >
                <RadioGroupItem value={opt.val} id={`auto-${opt.val}`} className="mt-1" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
                </div>
              </label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Członkowie zespołu</CardTitle>
              <CardDescription>Podgląd zespołu. Pełna edycja, zaproszenia i uprawnienia w module Zespół.</CardDescription>
            </div>
            <Button
              onClick={() => onNavigateToModule?.("staff")}
              className="gap-2"
              disabled={isDemo}
            >
              Otwórz pełny moduł Zespół <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : list.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">Brak pracowników. Dodaj pierwszego członka zespołu.</p>
              <Button onClick={() => onNavigateToModule?.("staff")}>Przejdź do modułu Zespół</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {list.map((s: any) => {
                const roleConfig = ROLE_LABELS[s.staff_role] || { label: s.role || "Pracownik", variant: "outline" as const };
                const comp = formatCompensation(s);
                return (
                  <div key={s.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={s.avatar_url || undefined} />
                        <AvatarFallback>{s.name?.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{s.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{s.email || "—"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant={roleConfig.variant}>{roleConfig.label}</Badge>
                      {comp.isConfigured ? (
                        <div className="text-sm font-medium tabular-nums text-right whitespace-nowrap">
                          {comp.short}
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onNavigateToModule?.("staff")}
                          disabled={isDemo}
                          className="h-7 text-xs"
                        >
                          Ustaw wynagrodzenie
                        </Button>
                      )}
                      {!s.is_active && <Badge variant="outline">Nieaktywny</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
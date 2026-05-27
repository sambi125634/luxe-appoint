import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "@/hooks/useSalonId";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Shield, Clock, ArrowRight, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TeamSettingsProps {
  isDemo?: boolean;
  onNavigateToModule?: (tabId: string) => void;
}

const DEMO_STAFF = [
  { id: "1", name: "Maria Kowalska", role: "Specjalistka", staff_role: "owner", hourly_rate: 80, is_active: true, avatar_url: null, email: "maria@demo.pl" },
  { id: "2", name: "Kasia Nowak", role: "Stylistka", staff_role: "specialist", hourly_rate: 55, is_active: true, avatar_url: null, email: "kasia@demo.pl" },
  { id: "3", name: "Anna Wiśniewska", role: "Recepcjonistka", staff_role: "reception", hourly_rate: 35, is_active: true, avatar_url: null, email: "anna@demo.pl" },
];

const ROLE_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  owner: { label: "Właścicielka", variant: "default" },
  specialist: { label: "Specjalistka", variant: "secondary" },
  reception: { label: "Recepcja", variant: "outline" },
  manager: { label: "Manager", variant: "default" },
};

export function TeamSettings({ isDemo, onNavigateToModule }: TeamSettingsProps) {
  const { salonId } = useSalonId();

  const { data: staff, isLoading } = useQuery({
    queryKey: ["team-settings-staff", salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from("staff_members")
        .select("id, name, role, staff_role, hourly_rate, is_active, avatar_url, email, invitation_status")
        .eq("salon_id", salonId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!salonId && !isDemo,
  });

  const list = isDemo ? DEMO_STAFF : (staff || []);
  const activeCount = list.filter((s) => s.is_active).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Zespół i Uprawnienia</h2>
        <p className="text-muted-foreground mt-1">
          Zarządzaj pracownikami, ich rolami i stawkami godzinowymi (wykorzystywanymi w module True Profit).
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
              <div className="p-3 rounded-lg bg-primary/10"><Clock className="w-5 h-5 text-primary" /></div>
              <div>
                <div className="text-2xl font-bold">
                  {list.length > 0
                    ? Math.round(list.reduce((acc: number, s: any) => acc + (Number(s.hourly_rate) || 35), 0) / list.length)
                    : 35}{" "}
                  zł/h
                </div>
                <div className="text-xs text-muted-foreground">Średnia stawka (True Profit)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Stawki godzinowe są wykorzystywane w module <strong>Księgowość → True Profit</strong> do obliczenia
          realnego kosztu pracy i marży na każdej usłudze. Domyślna stawka to <strong>35 zł/h</strong>.
        </AlertDescription>
      </Alert>

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
                      <div className="text-sm font-medium tabular-nums w-20 text-right">
                        {Number(s.hourly_rate) || 35} zł/h
                      </div>
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
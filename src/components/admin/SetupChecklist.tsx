import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SetupChecklistProps {
  salonId: string;
  onNavigate: (tab: string) => void;
}

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  tab: string;
}

export function SetupChecklist({ salonId, onNavigate }: SetupChecklistProps) {
  const { data: checklist = [], isLoading } = useQuery({
    queryKey: ["setup-checklist", salonId],
    queryFn: async () => {
      const [
        { data: salon },
        { count: servicesCount },
        { count: staffCount },
        { count: clientsCount },
        { count: appointmentsCount },
        { count: workingHoursCount },
      ] = await Promise.all([
        supabase.from("salons").select("name, address, phone").eq("id", salonId).single(),
        supabase.from("services").select("*", { count: "exact", head: true }).eq("salon_id", salonId),
        supabase.from("staff_members").select("*", { count: "exact", head: true }).eq("salon_id", salonId),
        supabase.from("clients").select("*", { count: "exact", head: true }).eq("salon_id", salonId),
        supabase.from("appointments").select("*", { count: "exact", head: true }).eq("salon_id", salonId),
        supabase.from("working_hours").select("*", { count: "exact", head: true }),
      ]);

      const hasSalonData = !!(salon?.name && salon?.address && salon?.phone);

      const items: ChecklistItem[] = [
        {
          id: "salon",
          label: "Dane salonu",
          description: "Nazwa, adres, telefon i branding",
          completed: hasSalonData,
          tab: "settings",
        },
        {
          id: "hours",
          label: "Godziny pracy",
          description: "Ustaw dostępność zespołu",
          completed: (workingHoursCount ?? 0) > 0,
          tab: "staff",
        },
        {
          id: "services",
          label: "Usługi",
          description: "Dodaj cennik i czas trwania zabiegów",
          completed: (servicesCount ?? 0) > 0,
          tab: "services",
        },
        {
          id: "staff",
          label: "Pracownicy",
          description: "Dodaj członków zespołu",
          completed: (staffCount ?? 0) > 0,
          tab: "staff",
        },
        {
          id: "client",
          label: "Pierwszy klient",
          description: "Dodaj klienta ręcznie lub poczekaj na rezerwację",
          completed: (clientsCount ?? 0) > 0,
          tab: "clients",
        },
        {
          id: "appointment",
          label: "Pierwsza wizyta",
          description: "Utwórz wizytę w kalendarzu",
          completed: (appointmentsCount ?? 0) > 0,
          tab: "calendar",
        },
        {
          id: "widget",
          label: "Widget rezerwacji",
          description: "Osadź widget na swojej stronie www",
          completed: false, // Will track via salon settings later
          tab: "widgets",
        },
      ];

      return items;
    },
    enabled: !!salonId,
  });

  if (isLoading) return null;

  const completedCount = checklist.filter((i) => i.completed).length;
  const totalCount = checklist.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Hide when everything is done
  if (completedCount === totalCount) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-serif">Konfiguracja salonu</CardTitle>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{totalCount} gotowe
          </span>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {checklist.map((item) => (
            <button
              key={item.id}
              onClick={() => !item.completed && onNavigate(item.tab)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                item.completed
                  ? "bg-primary/5 opacity-60"
                  : "hover:bg-muted cursor-pointer"
              )}
              disabled={item.completed}
            >
              {item.completed ? (
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", item.completed && "line-through")}>
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              {!item.completed && (
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

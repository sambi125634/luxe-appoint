import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

interface SetupChecklistProps {
  salonId: string;
  onNavigate: (tab: string) => void;
}

interface ChecklistItem {
  id: string;
  labelKey: string;
  descKey: string;
  completed: boolean;
  tab: string;
}

export function SetupChecklist({ salonId, onNavigate }: SetupChecklistProps) {
  const { t } = useTranslation();

  const { data: checklist = [], isLoading } = useQuery({
    queryKey: ["setup-checklist", salonId],
    queryFn: async () => {
      const [
        { data: salon },
        { count: servicesCount },
        { count: staffCount },
        { count: clientsCount },
        { count: appointmentsCount },
      ] = await Promise.all([
        supabase.from("salons").select("name, address, phone").eq("id", salonId).single(),
        supabase.from("services").select("*", { count: "exact", head: true }).eq("salon_id", salonId),
        supabase.from("staff_members").select("*", { count: "exact", head: true }).eq("salon_id", salonId),
        supabase.from("clients").select("*", { count: "exact", head: true }).eq("salon_id", salonId),
        supabase.from("appointments").select("*", { count: "exact", head: true }).eq("salon_id", salonId),
      ]);

      // Query working_hours through staff_members of this salon
      const { data: salonStaff } = await supabase.from("staff_members").select("id").eq("salon_id", salonId);
      const staffIds = (salonStaff ?? []).map(s => s.id);
      let workingHoursCount = 0;
      if (staffIds.length > 0) {
        const { count } = await supabase.from("working_hours").select("*", { count: "exact", head: true }).in("staff_id", staffIds);
        workingHoursCount = count ?? 0;
      }

      const hasSalonData = !!(salon?.name && salon?.address && salon?.phone);

      const items: ChecklistItem[] = [
        { id: "salon", labelKey: "setupChecklist.salonData", descKey: "setupChecklist.salonDataDesc", completed: hasSalonData, tab: "settings" },
        { id: "hours", labelKey: "setupChecklist.workingHours", descKey: "setupChecklist.workingHoursDesc", completed: (workingHoursCount ?? 0) > 0, tab: "staff" },
        { id: "services", labelKey: "setupChecklist.services", descKey: "setupChecklist.servicesDesc", completed: (servicesCount ?? 0) > 0, tab: "services" },
        { id: "staff", labelKey: "setupChecklist.staff", descKey: "setupChecklist.staffDesc", completed: (staffCount ?? 0) > 0, tab: "staff" },
        { id: "client", labelKey: "setupChecklist.firstClient", descKey: "setupChecklist.firstClientDesc", completed: (clientsCount ?? 0) > 0, tab: "clients" },
        { id: "appointment", labelKey: "setupChecklist.firstAppointment", descKey: "setupChecklist.firstAppointmentDesc", completed: (appointmentsCount ?? 0) > 0, tab: "calendar" },
        { id: "widget", labelKey: "setupChecklist.bookingWidget", descKey: "setupChecklist.bookingWidgetDesc", completed: false, tab: "widgets" },
      ];

      return items;
    },
    enabled: !!salonId,
  });

  if (isLoading) return null;

  const completedCount = checklist.filter((i) => i.completed).length;
  const totalCount = checklist.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (completedCount === totalCount) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-serif">{t('setupChecklist.title')}</CardTitle>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{totalCount} {t('setupChecklist.done')}
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
                item.completed ? "bg-primary/5 opacity-60" : "hover:bg-muted cursor-pointer"
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
                  {t(item.labelKey)}
                </p>
                <p className="text-xs text-muted-foreground">{t(item.descKey)}</p>
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

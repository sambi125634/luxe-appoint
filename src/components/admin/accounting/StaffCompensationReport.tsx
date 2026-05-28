import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "@/hooks/useSalonId";
import { useStaffMembers } from "@/hooks/useStaffMembers";
import { useSalonSettings } from "@/hooks/useSalonSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Banknote } from "lucide-react";
import { format, eachDayOfInterval, isWeekend, getDay } from "date-fns";

interface StaffCompensationReportProps {
  dateRange: { from: Date; to: Date };
  isDemo?: boolean;
}

type CompensationType = "commission" | "salary" | "hourly" | "salary_plus_commission" | "flat_per_service";

const COMP_LABELS: Record<CompensationType, string> = {
  commission: "Prowizja",
  salary: "Pensja",
  hourly: "Godzinowa",
  salary_plus_commission: "Pensja + premia",
  flat_per_service: "Stawka za zabieg",
};

interface StaffRow {
  id: string;
  name: string;
  compensationType: CompensationType;
  completedVisits: number;
  totalRevenue: number;
  calculatedPay: number;
  details: string;
}

const DEMO_ROWS: StaffRow[] = [
  { id: "1", name: "Maria Nowakowska", compensationType: "commission", completedVisits: 42, totalRevenue: 8400, calculatedPay: 2520, details: "30% × 8 400 zł" },
  { id: "2", name: "Karolina Wiśniewska", compensationType: "salary_plus_commission", completedVisits: 36, totalRevenue: 7200, calculatedPay: 4160, details: "3 500 zł + 10% nadwyżki (6 600 zł ponad próg 600 zł)" },
  { id: "3", name: "Joanna Lewandowska", compensationType: "hourly", completedVisits: 28, totalRevenue: 5600, calculatedPay: 3360, details: "40 zł/h × 84h" },
  { id: "4", name: "Anna Kowalczyk", compensationType: "flat_per_service", completedVisits: 38, totalRevenue: 7600, calculatedPay: 3800, details: "100 zł × 38 zabiegów" },
];

export function StaffCompensationReport({ dateRange, isDemo = false }: StaffCompensationReportProps) {
  const { salonId } = useSalonId();
  const { data: staffMembers } = useStaffMembers();
  const { settings } = useSalonSettings();

  const { data: completedAppointments } = useQuery({
    queryKey: ["compensation-appointments", salonId, dateRange.from.toISOString(), dateRange.to.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("staff_id, price, service_id")
        .eq("salon_id", salonId!)
        .eq("status", "completed")
        .gte("start_time", dateRange.from.toISOString())
        .lte("start_time", dateRange.to.toISOString());
      if (error) throw error;
      return data ?? [];
    },
    enabled: !isDemo && !!salonId,
  });

  const { data: workingHoursData } = useQuery({
    queryKey: ["compensation-working-hours", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("working_hours")
        .select("staff_id, day_of_week, start_time, end_time, is_working");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !isDemo && !!salonId,
  });

  const rows: StaffRow[] = useMemo(() => {
    if (isDemo) return DEMO_ROWS;
    if (!staffMembers || !completedAppointments) return [];

    return staffMembers.map((staff): StaffRow => {
      const compType = (staff.compensation_type as CompensationType) || settings.team.defaultCompensationType as CompensationType;
      const commRate = staff.commission_rate ?? settings.team.defaultCommissionRate;
      const baseSalary = Number(staff.base_salary) || 0;
      const hourlyRate = Number(staff.hourly_rate) || settings.team.defaultHourlyRate;
      const bonusThreshold = Number(staff.salary_bonus_threshold) || 0;
      const bonusRate = Number(staff.salary_bonus_rate) || 0;
      const flatRate = Number(staff.flat_rate_per_service) || 0;

      const staffAppts = completedAppointments.filter(a => a.staff_id === staff.id);
      const totalRevenue = staffAppts.reduce((sum, a) => sum + Number(a.price ?? 0), 0);
      const visitCount = staffAppts.length;

      let calculatedPay = 0;
      let details = "";

      switch (compType) {
        case "commission":
          calculatedPay = totalRevenue * commRate / 100;
          details = `${commRate}% × ${totalRevenue.toLocaleString()} zł`;
          break;
        case "salary":
          calculatedPay = baseSalary;
          details = `${baseSalary.toLocaleString()} zł/mies.`;
          break;
        case "hourly": {
          const staffWH = workingHoursData?.filter(w => w.staff_id === staff.id && w.is_working) ?? [];
          const daysInRange = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
          let totalHours = 0;
          for (const day of daysInRange) {
            const dow = getDay(day);
            const wh = staffWH.find(w => w.day_of_week === dow);
            if (wh) {
              const [sh, sm] = wh.start_time.split(":").map(Number);
              const [eh, em] = wh.end_time.split(":").map(Number);
              totalHours += (eh * 60 + em - sh * 60 - sm) / 60;
            }
          }
          calculatedPay = hourlyRate * totalHours;
          details = `${hourlyRate} zł/h × ${Math.round(totalHours)}h`;
          break;
        }
        case "salary_plus_commission": {
          const bonus = Math.max(0, (totalRevenue - bonusThreshold) * bonusRate / 100);
          calculatedPay = baseSalary + bonus;
          details = bonus > 0
            ? `${baseSalary.toLocaleString()} zł + ${bonusRate}% nadwyżki (${(totalRevenue - bonusThreshold).toLocaleString()} zł ponad próg)`
            : `${baseSalary.toLocaleString()} zł (próg ${bonusThreshold.toLocaleString()} zł nie osiągnięty)`;
          break;
        }
        case "flat_per_service":
          calculatedPay = flatRate * visitCount;
          details = `${flatRate} zł × ${visitCount} zabiegów`;
          break;
      }

      return {
        id: staff.id,
        name: staff.name,
        compensationType: compType,
        completedVisits: visitCount,
        totalRevenue,
        calculatedPay: Math.round(calculatedPay * 100) / 100,
        details,
      };
    });
  }, [isDemo, staffMembers, completedAppointments, workingHoursData, dateRange]);

  const totalPay = rows.reduce((s, r) => s + r.calculatedPay, 0);

  if (!isDemo && !staffMembers) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-serif flex items-center gap-2">
            <Banknote className="w-5 h-5 text-primary" />
            Rozliczenia pracowników — {format(dateRange.from, "dd.MM")} – {format(dateRange.to, "dd.MM.yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold font-serif text-primary">{totalPay.toLocaleString()} zł</div>
          <p className="text-sm text-muted-foreground">Łączne wynagrodzenia w wybranym okresie</p>
        </CardContent>
      </Card>

      {/* Staff rows */}
      <div className="space-y-3">
        {rows.map(row => (
          <Card key={row.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{row.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {COMP_LABELS[row.compensationType]}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-sm text-muted-foreground mt-2">
                    <div>
                      <span className="text-xs">Wykonane wizyty</span>
                      <p className="font-medium text-foreground">{row.completedVisits}</p>
                    </div>
                    <div>
                      <span className="text-xs">Przychód z usług</span>
                      <p className="font-medium text-foreground">{row.totalRevenue.toLocaleString()} zł</p>
                    </div>
                    <div>
                      <span className="text-xs">Wynagrodzenie</span>
                      <p className="font-medium text-primary text-lg">{row.calculatedPay.toLocaleString()} zł</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 italic">{row.details}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rows.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">Brak danych o pracownikach</p>
        </div>
      )}
    </div>
  );
}

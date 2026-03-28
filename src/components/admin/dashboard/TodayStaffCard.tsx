import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import { format, startOfDay, endOfDay } from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface TodayStaffCardProps {
  salonId?: string | null;
  isDemo?: boolean;
}

interface StaffStatus {
  id: string;
  name: string;
  role: string | null;
  avatar_url: string | null;
  color: string | null;
  status: "working" | "soon" | "off" | "day-off";
  startTime: string | null;
  endTime: string | null;
  appointmentCount: number;
  nextAppointment: { time: string; serviceName: string } | null;
}

const DEMO_STAFF: StaffStatus[] = [
  {
    id: "d1", name: "Anna Kowalska", role: "owner", avatar_url: null, color: "#7c3aed",
    status: "working", startTime: "09:00", endTime: "18:00",
    appointmentCount: 4, nextAppointment: { time: "10:00", serviceName: "Manicure hybrydowy" },
  },
  {
    id: "d2", name: "Oliwia Wrona", role: "specialist", avatar_url: null, color: "#ec4899",
    status: "working", startTime: "09:00", endTime: "17:00",
    appointmentCount: 2, nextAppointment: { time: "11:30", serviceName: "Masaż relaksacyjny" },
  },
  {
    id: "d3", name: "Karolina Wiśniewska", role: "specialist", avatar_url: null, color: "#f59e0b",
    status: "day-off", startTime: null, endTime: null,
    appointmentCount: 0, nextAppointment: null,
  },
];

const STATUS_CONFIG = {
  working: { dot: "bg-green-500", label: "W pracy" },
  soon: { dot: "bg-yellow-500", label: "Zaraz zaczyna" },
  off: { dot: "bg-muted-foreground/40", label: "Poza godzinami" },
  "day-off": { dot: "bg-red-500", label: "Wolne dziś" },
};

const STATUS_ORDER: Record<string, number> = { working: 0, soon: 1, off: 2, "day-off": 3 };

export function TodayStaffCard({ salonId, isDemo = false }: TodayStaffCardProps) {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  const todayStart = startOfDay(today).toISOString();
  const todayEnd = endOfDay(today).toISOString();
  const todayDateStr = format(today, "yyyy-MM-dd");

  const { data: staffMembers, isLoading: staffLoading } = useQuery({
    queryKey: ["today-staff-members", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_members")
        .select("id, name, role, avatar_url, color")
        .eq("salon_id", salonId!)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !isDemo && !!salonId,
  });

  const staffIds = staffMembers?.map((s) => s.id) ?? [];

  const { data: workingHours } = useQuery({
    queryKey: ["today-working-hours", staffIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("working_hours")
        .select("staff_id, start_time, end_time, is_working")
        .in("staff_id", staffIds)
        .eq("day_of_week", dayOfWeek);
      if (error) throw error;
      return data;
    },
    enabled: !isDemo && staffIds.length > 0,
  });

  const { data: timeOffs } = useQuery({
    queryKey: ["today-time-off", salonId, todayDateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("staff_id")
        .eq("salon_id", salonId!)
        .eq("status", "cancelled");
      // We don't have a time_off table query here — check if there's a dedicated table
      // For now, return empty; time_off is handled via working_hours is_working=false
      if (error) throw error;
      return [] as { staff_id: string }[];
    },
    enabled: false, // disabled — we use working_hours.is_working instead
  });

  const { data: todayAppointments } = useQuery({
    queryKey: ["today-staff-appointments", salonId, todayDateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("staff_id, start_time, services(name)")
        .eq("salon_id", salonId!)
        .gte("start_time", todayStart)
        .lte("start_time", todayEnd)
        .in("status", ["booked", "confirmed"])
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !isDemo && !!salonId,
  });

  const computeStatus = (): StaffStatus[] => {
    if (isDemo) return DEMO_STAFF;
    if (!staffMembers) return [];

    const now = today;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    return staffMembers.map((staff) => {
      const wh = workingHours?.find((w) => w.staff_id === staff.id);
      const staffAppts = (todayAppointments ?? []).filter((a) => a.staff_id === staff.id);
      const futureAppts = staffAppts.filter((a) => new Date(a.start_time) > now);
      const nextAppt = futureAppts[0];

      let status: StaffStatus["status"] = "off";
      let startTime: string | null = null;
      let endTime: string | null = null;

      if (!wh || !wh.is_working) {
        status = "day-off";
      } else {
        startTime = wh.start_time?.slice(0, 5) ?? null;
        endTime = wh.end_time?.slice(0, 5) ?? null;

        if (startTime && endTime) {
          const [sh, sm] = startTime.split(":").map(Number);
          const [eh, em] = endTime.split(":").map(Number);
          const startMin = sh * 60 + sm;
          const endMin = eh * 60 + em;

          if (nowMinutes >= startMin && nowMinutes < endMin) {
            status = "working";
          } else if (nowMinutes < startMin && startMin - nowMinutes <= 60) {
            status = "soon";
          } else {
            status = "off";
          }
        }
      }

      return {
        id: staff.id,
        name: staff.name,
        role: staff.role,
        avatar_url: staff.avatar_url,
        color: staff.color,
        status,
        startTime,
        endTime,
        appointmentCount: staffAppts.length,
        nextAppointment: nextAppt
          ? {
              time: format(new Date(nextAppt.start_time), "HH:mm"),
              serviceName: (nextAppt.services as { name: string } | null)?.name ?? "Usługa",
            }
          : null,
      };
    }).sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9));
  };

  const staffList = computeStatus();
  const isLoading = !isDemo && staffLoading;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Dziś w pracy — {format(today, "EEEE, d MMMM", { locale: pl })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : staffList.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Brak pracowników w zespole
          </p>
        ) : (
          <div className="space-y-2">
            {staffList.map((staff) => {
              const cfg = STATUS_CONFIG[staff.status];
              const initials = staff.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2);

              return (
                <div
                  key={staff.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-colors",
                    staff.status === "day-off" && "opacity-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={staff.avatar_url ?? undefined} />
                        <AvatarFallback
                          className="text-xs font-semibold text-white"
                          style={{ backgroundColor: staff.color ?? "#7c3aed" }}
                        >
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
                          cfg.dot
                        )}
                      />
                    </div>
                    <div>
                      <div className="font-medium text-sm flex items-center gap-2">
                        {staff.name}
                        {staff.role === "owner" && (
                          <span className="text-xs text-muted-foreground">(owner)</span>
                        )}
                      </div>
                      {staff.status === "day-off" ? (
                        <span className="text-xs text-muted-foreground">{cfg.label}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {staff.startTime} - {staff.endTime}
                        </span>
                      )}
                    </div>
                  </div>

                  {staff.status !== "day-off" && (
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {staff.appointmentCount} {staff.appointmentCount === 1 ? "wizyta" : staff.appointmentCount < 5 ? "wizyty" : "wizyt"}
                      </div>
                      {staff.nextAppointment && (
                        <div className="text-xs text-muted-foreground">
                          następna: {staff.nextAppointment.time} {staff.nextAppointment.serviceName}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

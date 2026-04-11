import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface AvailableSlotsParams {
  salonId: string | null;
  serviceId: string | null;
  date: Date | null;
  staffId?: string | null;
  durationMinutes: number;
}

export function useAvailableSlots({
  salonId,
  serviceId,
  date,
  staffId,
  durationMinutes,
}: AvailableSlotsParams) {
  return useQuery({
    queryKey: [
      "available-slots",
      salonId,
      serviceId,
      date ? format(date, "yyyy-MM-dd") : null,
      staffId,
    ],
    queryFn: async (): Promise<string[]> => {
      if (!salonId || !date || !durationMinutes) return [];

      const dayOfWeek = date.getDay(); // 0=Sun..6=Sat
      const dateStr = format(date, "yyyy-MM-dd");

      // 1. Get working hours for this day
      let workingQuery = supabase
        .from("working_hours")
        .select("start_time, end_time, is_working, staff_id")
        .eq("day_of_week", dayOfWeek)
        .eq("is_working", true);

      if (staffId) {
        workingQuery = workingQuery.eq("staff_id", staffId);
      }

      // Get staff for this salon
      const { data: salonStaff } = await supabase
        .from("staff_members")
        .select("id")
        .eq("salon_id", salonId)
        .eq("is_active", true);

      const staffIds = salonStaff?.map((s) => s.id) ?? [];
      if (!staffIds.length) return [];

      workingQuery = workingQuery.in("staff_id", staffIds);
      const { data: workingHours } = await workingQuery;

      if (!workingHours?.length) return [];

      // 2. Get existing appointments for this date
      const dayStart = `${dateStr}T00:00:00`;
      const dayEnd = `${dateStr}T23:59:59`;

      const { data: existingAppts } = await supabase
        .from("appointments")
        .select("start_time, end_time, staff_id")
        .eq("salon_id", salonId)
        .gte("start_time", dayStart)
        .lte("start_time", dayEnd)
        .neq("status", "cancelled");

      // 3. Build available slots
      const slotSet = new Set<string>();
      const now = new Date();

      for (const wh of workingHours) {
        if (staffId && wh.staff_id !== staffId) continue;

        const [startH, startM] = wh.start_time.split(":").map(Number);
        const [endH, endM] = wh.end_time.split(":").map(Number);
        const dayStartMin = startH * 60 + startM;
        const dayEndMin = endH * 60 + endM;

        const staffAppts = (existingAppts ?? []).filter(
          (a) => a.staff_id === wh.staff_id
        );

        for (let min = dayStartMin; min + durationMinutes <= dayEndMin; min += 30) {
          const slotHour = Math.floor(min / 60);
          const slotMin = min % 60;
          const slotTime = `${String(slotHour).padStart(2, "0")}:${String(slotMin).padStart(2, "0")}`;

          const slotStart = new Date(`${dateStr}T${slotTime}:00`);
          const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);

          // Skip past slots
          if (slotStart <= now) continue;

          // Check conflicts
          const hasConflict = staffAppts.some((a) => {
            const aStart = new Date(a.start_time);
            const aEnd = new Date(a.end_time);
            return slotStart < aEnd && slotEnd > aStart;
          });

          if (!hasConflict) {
            slotSet.add(slotTime);
          }
        }
      }

      return Array.from(slotSet).sort();
    },
    enabled: !!salonId && !!date && durationMinutes > 0,
    staleTime: 60_000,
  });
}

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Plus, Clock, CalendarDays, LayoutGrid, Columns3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AppointmentModal } from "./AppointmentModal";
import { useStaffMembers } from "@/hooks/useStaffMembers";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useSalonId } from "@/hooks/useSalonId";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DayColumnView } from "./calendar/DayColumnView";
import { MonthGridView } from "./calendar/MonthGridView";
import type { AppointmentBlockData } from "./calendar/AppointmentBlock";

interface Appointment {
  id: string;
  time: string;
  duration: number;
  client: string;
  service: string;
  staff: string;
  staffId: string;
  status: "confirmed" | "pending" | "cancelled";
}

interface MockAppointment extends Appointment {
  dayOffset: number;
}

// Enhanced mock data with many overlapping appointments to showcase the day column view
const mockAppointmentsData: MockAppointment[] = [
  // Poniedziałek — nakładające się wizyty o 09:00 i 10:00
  { id: "1", time: "09:00", duration: 60, client: "Anna Kowalska", service: "Peeling kawitacyjny", staff: "Maria N.", staffId: "1", status: "confirmed", dayOffset: 0 },
  { id: "2", time: "09:00", duration: 45, client: "Joanna Nowak", service: "Stylizacja brwi", staff: "Karolina W.", staffId: "2", status: "confirmed", dayOffset: 0 },
  { id: "3", time: "09:00", duration: 90, client: "Magdalena Wiśniewska", service: "Masaż relaksacyjny", staff: "Joanna L.", staffId: "3", status: "pending", dayOffset: 0 },
  { id: "4", time: "09:30", duration: 60, client: "Monika Wójcik", service: "Peeling chemiczny", staff: "Anna K.", staffId: "4", status: "confirmed", dayOffset: 0 },
  { id: "5", time: "10:30", duration: 45, client: "Ewa Mazur", service: "Manicure hybrydowy", staff: "Maria N.", staffId: "1", status: "confirmed", dayOffset: 0 },
  { id: "6", time: "11:00", duration: 60, client: "Katarzyna Dąbrowska", service: "Mezoterapia igłowa", staff: "Anna K.", staffId: "4", status: "confirmed", dayOffset: 0 },
  { id: "7", time: "10:00", duration: 90, client: "Beata Kamińska", service: "Masaż gorącymi kamieniami", staff: "Joanna L.", staffId: "3", status: "confirmed", dayOffset: 0 },
  { id: "8", time: "13:00", duration: 45, client: "Paulina Król", service: "Henna brwi i rzęs", staff: "Karolina W.", staffId: "2", status: "confirmed", dayOffset: 0 },
  { id: "9", time: "14:00", duration: 60, client: "Sylwia Pawlak", service: "Stylizacja rzęs", staff: "Maria N.", staffId: "1", status: "confirmed", dayOffset: 0 },
  // Wtorek
  { id: "10", time: "09:00", duration: 90, client: "Dorota Jasińska", service: "Masaż relaksacyjny", staff: "Joanna L.", staffId: "3", status: "confirmed", dayOffset: 1 },
  { id: "11", time: "09:00", duration: 60, client: "Agnieszka Lewandowska", service: "Depilacja laserowa", staff: "Maria N.", staffId: "1", status: "confirmed", dayOffset: 1 },
  { id: "12", time: "10:00", duration: 45, client: "Natalia Zielińska", service: "Manicure hybrydowy", staff: "Karolina W.", staffId: "2", status: "pending", dayOffset: 1 },
  { id: "13", time: "11:00", duration: 60, client: "Izabela Kowal", service: "Laminacja brwi", staff: "Anna K.", staffId: "4", status: "confirmed", dayOffset: 1 },
  { id: "14", time: "14:00", duration: 45, client: "Paulina Król", service: "Henna brwi i rzęs", staff: "Maria N.", staffId: "1", status: "confirmed", dayOffset: 1 },
  // Środa
  { id: "15", time: "10:00", duration: 45, client: "Agnieszka Lewandowska", service: "Depilacja laserowa", staff: "Maria N.", staffId: "1", status: "confirmed", dayOffset: 2 },
  { id: "16", time: "13:00", duration: 60, client: "Ewa Szymańska", service: "Oczyszczanie twarzy", staff: "Karolina W.", staffId: "2", status: "confirmed", dayOffset: 2 },
  // Czwartek
  { id: "17", time: "15:00", duration: 45, client: "Natalia Zielińska", service: "Manicure hybrydowy", staff: "Joanna L.", staffId: "3", status: "confirmed", dayOffset: 3 },
  { id: "18", time: "10:00", duration: 60, client: "Monika Wójcik", service: "Peeling chemiczny", staff: "Anna K.", staffId: "4", status: "confirmed", dayOffset: 3 },
  { id: "19", time: "12:00", duration: 45, client: "Izabela Kowal", service: "Laminacja brwi", staff: "Karolina W.", staffId: "2", status: "pending", dayOffset: 3 },
  // Piątek
  { id: "20", time: "09:00", duration: 90, client: "Beata Kamińska", service: "Masaż gorącymi kamieniami", staff: "Anna K.", staffId: "4", status: "confirmed", dayOffset: 4 },
  { id: "21", time: "16:00", duration: 45, client: "Sylwia Pawlak", service: "Stylizacja rzęs", staff: "Karolina W.", staffId: "2", status: "confirmed", dayOffset: 4 },
  { id: "22", time: "11:00", duration: 60, client: "Dorota Jasińska", service: "Peeling kawitacyjny", staff: "Maria N.", staffId: "1", status: "confirmed", dayOffset: 4 },
];

const mockStaff = [
  { id: "1", name: "Maria N.", color: "bg-primary" },
  { id: "2", name: "Karolina W.", color: "bg-secondary" },
  { id: "3", name: "Joanna L.", color: "bg-accent" },
  { id: "4", name: "Anna K.", color: "bg-chart-1" },
];

const hours = Array.from({ length: 12 }, (_, i) => `${(8 + i).toString().padStart(2, "0")}:00`);

type CalendarView = "day" | "week" | "month";

interface WeeklyCalendarProps {
  isDemo?: boolean;
  onNewAppointment?: () => void;
}

export function WeeklyCalendar({ isDemo = false, onNewAppointment }: WeeklyCalendarProps) {
  const { t, i18n } = useTranslation();
  const { data: dbStaff } = useStaffMembers();
  const { salonId } = useSalonId();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<CalendarView>("day");
  const [appointments, setAppointments] = useState<(Appointment & { dayOffset?: number })[]>(isDemo ? mockAppointmentsData : []);

  // --- week helpers ---
  const getWeekStart = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1);
    start.setHours(0, 0, 0, 0);
    return start;
  };
  const getWeekEnd = (date: Date) => {
    const end = getWeekStart(date);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  };

  const weekStartISO = getWeekStart(currentDate).toISOString();
  const weekEndISO = getWeekEnd(currentDate).toISOString();

  // Fetch appointments from DB in production
  const { data: dbAppointments } = useQuery({
    queryKey: ["calendar-appointments", salonId, weekStartISO],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("id, staff_id, start_time, end_time, status, price, notes, clients(first_name, last_name, phone), services(name, duration), staff_members(name)")
        .eq("salon_id", salonId!)
        .gte("start_time", weekStartISO)
        .lte("start_time", weekEndISO)
        .neq("status", "cancelled");
      if (error) throw error;
      return data;
    },
    enabled: !isDemo && !!salonId,
  });

  useEffect(() => {
    if (isDemo) return;
    if (!dbAppointments) return;
    const weekStart = getWeekStart(currentDate);
    const mapped = dbAppointments.map((apt) => {
      const start = new Date(apt.start_time);
      const client = apt.clients as { first_name: string; last_name: string; phone?: string } | null;
      const service = apt.services as { name: string; duration: number } | null;
      const staff = apt.staff_members as { name: string } | null;
      const end = new Date(apt.end_time);
      const dayOffset = Math.floor((start.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
      return {
        id: apt.id,
        time: `${start.getHours().toString().padStart(2, "0")}:${start.getMinutes().toString().padStart(2, "0")}`,
        duration: service?.duration || Math.round((end.getTime() - start.getTime()) / 60000),
        client: client ? `${client.first_name} ${client.last_name}` : "Klient",
        service: service?.name || "Usługa",
        staff: staff?.name || "—",
        staffId: apt.staff_id ?? "",
        status: (apt.status === "booked" ? "pending" : apt.status === "cancelled" ? "cancelled" : "confirmed") as "confirmed" | "pending" | "cancelled",
        dayOffset,
      };
    });
    setAppointments(mapped);
  }, [dbAppointments, isDemo, currentDate]);

  useEffect(() => {
    if (isDemo) setAppointments(mockAppointmentsData);
  }, [isDemo]);

  const [draggedAppointment, setDraggedAppointment] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string } | null>(null);

  const staffColors = ["bg-primary", "bg-secondary", "bg-accent", "bg-chart-1", "bg-chart-2", "bg-chart-3"];
  const staff = isDemo
    ? mockStaff
    : (dbStaff || []).map((s, i) => ({
        id: s.id,
        name: s.name.split(" ").map((n) => n[0] + ".").join(" ").replace(/\.\.$/, s.name.split(" ").pop()?.charAt(0) + ".") || s.name,
        color: staffColors[i % staffColors.length],
      }));

  const getWeekDays = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1);
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  };
  const weekDays = getWeekDays(currentDate);

  const navigateDay = (dir: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  };
  const navigateWeek = (dir: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + dir * 7);
    setCurrentDate(d);
  };
  const navigateMonth = (dir: number) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  };

  // --- drag & drop ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedAppointment(id);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  const handleDrop = (e: React.DragEvent, dayIndex: number, hour: string) => {
    e.preventDefault();
    if (draggedAppointment) {
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === draggedAppointment ? { ...apt, time: hour } : apt))
      );
      setDraggedAppointment(null);
    }
  };
  const handleDropOnStaff = (e: React.DragEvent, staffId: string, time: string) => {
    e.preventDefault();
    if (!draggedAppointment) return;
    const staffMember = staff.find((s) => s.id === staffId);
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === draggedAppointment
          ? { ...apt, staffId, staff: staffMember?.name || apt.staff, time }
          : apt
      )
    );
    setDraggedAppointment(null);
  };

  // --- slot/appointment click ---
  const getAppointmentsForSlot = (dayIndex: number, hour: string) => {
    return appointments.filter((apt) => {
      const timeMatch = apt.time === hour;
      if ("dayOffset" in apt && apt.dayOffset !== undefined) return timeMatch && apt.dayOffset === dayIndex;
      return timeMatch;
    });
  };

  const handleSlotClick = (dayIndex: number, hour: string) => {
    const date = weekDays[dayIndex];
    setSelectedSlot({ date, time: hour });
    setEditingAppointment(null);
    setIsModalOpen(true);
  };
  const handleDaySlotClick = (staffId: string, time: string) => {
    setSelectedSlot({ date: currentDate, time });
    setEditingAppointment(null);
    setIsModalOpen(true);
  };
  const handleAppointmentClick = (apt: Appointment | AppointmentBlockData, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAppointment(apt as Appointment);
    setSelectedSlot(null);
    setIsModalOpen(true);
  };

  // --- save ---
  const handleSaveAppointment = async (appointmentData: Record<string, unknown>) => {
    if (isDemo) {
      if (editingAppointment) {
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === editingAppointment.id
              ? {
                  ...apt,
                  ...appointmentData,
                  client: appointmentData.clientName as string,
                  service: appointmentData.serviceName as string,
                  staff: appointmentData.staffName as string,
                }
              : apt
          )
        );
      } else {
        setAppointments((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            time: appointmentData.time as string,
            duration: appointmentData.duration as number,
            client: appointmentData.clientName as string,
            service: appointmentData.serviceName as string,
            staff: appointmentData.staffName as string,
            staffId: appointmentData.staffId as string,
            status: appointmentData.status as "confirmed" | "pending" | "cancelled",
          },
        ]);
      }
      setIsModalOpen(false);
      return;
    }

    if (!appointmentData.serviceId) {
      toast({ title: "Brak usługi", description: "Dodaj najpierw usługi w zakładce Usługi", variant: "destructive" });
      setIsModalOpen(false);
      return;
    }
    if (!appointmentData.staffId) {
      toast({ title: "Brak pracownika", description: "Wybierz pracownika", variant: "destructive" });
      setIsModalOpen(false);
      return;
    }
    try {
      const dateStr = (appointmentData.date as string) || new Date().toISOString().split("T")[0];
      const startTime = new Date(`${dateStr}T${appointmentData.time}:00`);
      const endTime = new Date(startTime.getTime() + (appointmentData.duration as number) * 60 * 1000);
      if (editingAppointment && editingAppointment.id !== Date.now().toString()) {
        const { error } = await supabase
          .from("appointments")
          .update({
            staff_id: appointmentData.staffId as string,
            service_id: appointmentData.serviceId as string,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            notes: (appointmentData.notes as string) || null,
            status: appointmentData.status as "booked" | "cancelled" | "completed" | "confirmed" | "no_show",
          })
          .eq("id", editingAppointment.id);
        if (error) throw error;
      } else {
        let clientId: string | null = null;
        if (appointmentData.clientId && appointmentData.clientId !== "new") {
          clientId = appointmentData.clientId as string;
        } else if (appointmentData.clientName && salonId) {
          const nameParts = (appointmentData.clientName as string).trim().split(" ");
          const firstName = nameParts[0] || (appointmentData.clientName as string);
          const lastName = nameParts.slice(1).join(" ") || "-";
          const { data: newClient, error: clientError } = await supabase
            .from("clients")
            .insert({ salon_id: salonId, first_name: firstName, last_name: lastName, phone: (appointmentData.clientPhone as string) || "000000000", rodo_consent: true })
            .select("id")
            .single();
          if (!clientError && newClient) clientId = newClient.id;
        }
        const { data: newAppt, error } = await supabase
          .from("appointments")
          .insert({
            salon_id: salonId!,
            client_id: clientId,
            service_id: appointmentData.serviceId as string,
            staff_id: appointmentData.staffId as string,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            price: (appointmentData.price as number) || 0,
            notes: (appointmentData.notes as string) || null,
            status: "booked",
          })
          .select("id")
          .single();
        if (error) throw error;
        setAppointments((prev) => [
          ...prev,
          {
            id: newAppt.id,
            time: appointmentData.time as string,
            duration: appointmentData.duration as number,
            client: appointmentData.clientName as string,
            service: appointmentData.serviceName as string,
            staff: appointmentData.staffName as string,
            staffId: appointmentData.staffId as string,
            status: "confirmed",
          },
        ]);
      }
      queryClient.invalidateQueries({ queryKey: ["calendar-appointments"] });
      toast({ title: "Wizyta zapisana" });
    } catch (err) {
      console.error(err);
      toast({ title: "Błąd", description: "Nie udało się zapisać wizyty", variant: "destructive" });
    }
    setIsModalOpen(false);
  };

  const handleOpenNewAppointment = () => {
    setEditingAppointment(null);
    setSelectedSlot({ date: new Date(), time: "09:00" });
    setIsModalOpen(true);
  };

  const locale = i18n.language === "pl" ? "pl-PL" : "en-US";
  const formatDate = (date: Date) => date.toLocaleDateString(locale, { day: "numeric" });
  const formatDayName = (date: Date) => date.toLocaleDateString(locale, { weekday: "short" });
  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();

  // --- day view helpers ---
  const currentDayOffset = (() => {
    const ws = getWeekStart(currentDate);
    return Math.floor((currentDate.getTime() - ws.getTime()) / (1000 * 60 * 60 * 24));
  })();

  const dayAppointments: AppointmentBlockData[] = appointments
    .filter((a) => {
      if ("dayOffset" in a && a.dayOffset !== undefined) return a.dayOffset === currentDayOffset;
      return true;
    })
    .map((a) => ({ ...a }));

  // --- month view helpers ---
  const monthAppointments: (AppointmentBlockData & { _date: string })[] = appointments.map((a) => {
    const ws = getWeekStart(currentDate);
    const dayOffset = "dayOffset" in a && a.dayOffset !== undefined ? (a.dayOffset as number) : 0;
    const aptDate = new Date(ws);
    aptDate.setDate(aptDate.getDate() + dayOffset);
    const dateStr = `${aptDate.getFullYear()}-${String(aptDate.getMonth() + 1).padStart(2, "0")}-${String(aptDate.getDate()).padStart(2, "0")}`;
    return { ...a, _date: dateStr };
  });

  // Empty state
  if (!isDemo && staff.length === 0) {
    return (
      <div className="glass-card p-12 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <CalendarDays className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-serif text-xl font-semibold mb-2">Kalendarz jest pusty</h3>
          <p className="text-muted-foreground text-sm">
            Aby korzystać z kalendarza, najpierw dodaj pracowników i ustaw ich godziny pracy w sekcji Pracownicy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-serif font-semibold">{t("calendar.title")}</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => (calendarView === "day" ? navigateDay(-1) : calendarView === "week" ? navigateWeek(-1) : navigateMonth(-1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[200px] text-center">
              {calendarView === "day"
                ? currentDate.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" })
                : calendarView === "week"
                  ? `${weekDays[0].toLocaleDateString(locale, { day: "numeric", month: "long" })} - ${weekDays[6].toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })}`
                  : currentDate.toLocaleDateString(locale, { month: "long", year: "numeric" })}
            </span>
            <Button variant="ghost" size="icon" onClick={() => (calendarView === "day" ? navigateDay(1) : calendarView === "week" ? navigateWeek(1) : navigateMonth(1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center bg-muted rounded-lg p-0.5">
            <Button
              variant={calendarView === "day" ? "default" : "ghost"}
              size="sm"
              className="gap-1.5 h-8 text-xs"
              onClick={() => setCalendarView("day")}
            >
              <Columns3 className="w-3.5 h-3.5" />
              Dzień
            </Button>
            <Button
              variant={calendarView === "week" ? "default" : "ghost"}
              size="sm"
              className="gap-1.5 h-8 text-xs"
              onClick={() => setCalendarView("week")}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Tydzień
            </Button>
            <Button
              variant={calendarView === "month" ? "default" : "ghost"}
              size="sm"
              className="gap-1.5 h-8 text-xs"
              onClick={() => setCalendarView("month")}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Miesiąc
            </Button>
          </div>

          <Button variant="luxury" size="sm" className="gap-2" onClick={handleOpenNewAppointment}>
            <Plus className="w-4 h-4" />
            {t("calendar.newAppointment")}
          </Button>
        </div>
      </div>

      {/* ========= DAY VIEW ========= */}
      {calendarView === "day" && (
        <DayColumnView
          date={currentDate}
          staff={staff}
          appointments={dayAppointments}
          draggedId={draggedAppointment}
          onDragStart={handleDragStart}
          onDropOnStaff={handleDropOnStaff}
          onSlotClick={handleDaySlotClick}
          onAppointmentClick={handleAppointmentClick}
        />
      )}

      {/* ========= WEEK VIEW ========= */}
      {calendarView === "week" && (
        <>
          {/* Staff legend */}
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
            {staff.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded-full", s.color)} />
                <span className="text-sm text-muted-foreground">{s.name}</span>
              </div>
            ))}
          </div>

          <div className="overflow-auto">
            <div className="min-w-[800px]">
              {/* Days header */}
              <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-1 mb-2">
                <div />
                {weekDays.map((day, index) => (
                  <div
                    key={index}
                    className={cn(
                      "text-center py-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                      isToday(day) && "bg-primary/10"
                    )}
                    onClick={() => {
                      setCurrentDate(day);
                      setCalendarView("day");
                    }}
                  >
                    <p className="text-xs text-muted-foreground uppercase">{formatDayName(day)}</p>
                    <p className={cn("text-lg font-semibold", isToday(day) && "text-primary")}>{formatDate(day)}</p>
                  </div>
                ))}
              </div>

              {/* Time slots */}
              <div className="space-y-1">
                {hours.map((hour) => (
                  <div key={hour} className="grid grid-cols-[80px_repeat(7,1fr)] gap-1">
                    <div className="text-sm text-muted-foreground py-2 text-right pr-3">{hour}</div>
                    {weekDays.map((_, dayIndex) => {
                      const slotAppointments = getAppointmentsForSlot(dayIndex, hour);
                      return (
                        <div
                          key={dayIndex}
                          className="min-h-[60px] border border-border/50 rounded-lg p-1 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, dayIndex, hour)}
                          onClick={() => handleSlotClick(dayIndex, hour)}
                        >
                          {slotAppointments.map((apt) => {
                            const staffMember = staff.find((s) => s.id === apt.staffId);
                            return (
                              <div
                                key={apt.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, apt.id)}
                                onClick={(e) => handleAppointmentClick(apt, e)}
                                className={cn(
                                  "p-2 rounded-md text-xs cursor-pointer transition-all hover:scale-[1.02] mb-1",
                                  staffMember?.color || "bg-primary",
                                  "text-primary-foreground",
                                  draggedAppointment === apt.id && "opacity-50"
                                )}
                              >
                                <p className="font-medium truncate">{apt.client}</p>
                                <p className="opacity-80 truncate">{apt.service}</p>
                                <div className="flex items-center gap-1 mt-1 opacity-70">
                                  <Clock className="w-3 h-3" />
                                  <span>{apt.duration} {t("calendar.min")}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAppointment}
        isDemo={isDemo}
        appointment={
          editingAppointment
            ? {
                id: editingAppointment.id,
                clientId: "",
                clientName: editingAppointment.client,
                serviceId: "",
                serviceName: editingAppointment.service,
                staffId: editingAppointment.staffId,
                staffName: editingAppointment.staff,
                date: currentDate.toISOString().split("T")[0],
                time: editingAppointment.time,
                duration: editingAppointment.duration,
                notes: "",
                status: editingAppointment.status,
              }
            : null
        }
        selectedDate={selectedSlot?.date}
        selectedTime={selectedSlot?.time}
      />
    </div>
  );
}

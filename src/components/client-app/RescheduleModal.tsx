import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  format, parseISO, addDays, startOfMonth, endOfMonth, startOfWeek,
  endOfWeek, isSameMonth, isSameDay, isToday, isBefore, startOfDay,
  addMinutes, setHours, setMinutes,
} from "date-fns";
import { pl } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar, Clock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription,
} from "@/components/ui/drawer";
import { motion, AnimatePresence } from "framer-motion";

interface RescheduleModalProps {
  open: boolean;
  onClose: () => void;
  appointment: {
    id: string;
    start_time: string;
    end_time: string;
    service_id: string;
    staff_id: string;
    salon_id: string;
    payment_status?: string | null;
    services?: { name: string; duration: number; price: number } | null;
    staff_members?: { name: string } | null;
    salons?: { name: string; reschedule_notice_hours?: number } | null;
  };
}

const WEEKDAY_LABELS = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];
const SLOT_INTERVAL = 30; // minutes

type Step = "date" | "time" | "confirm";

export function RescheduleModal({ open, onClose, appointment }: RescheduleModalProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>("date");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const serviceDuration = (appointment.services as { duration: number } | null)?.duration ?? 60;

  // Fetch staff working hours
  const { data: workingHours } = useQuery({
    queryKey: ["reschedule-working-hours", appointment.staff_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("working_hours")
        .select("day_of_week, start_time, end_time, is_working")
        .eq("staff_id", appointment.staff_id);
      return data ?? [];
    },
    enabled: open,
  });

  // Fetch existing appointments for the staff on selected date
  const { data: existingAppointments, isLoading: loadingSlots } = useQuery({
    queryKey: ["reschedule-appointments", appointment.staff_id, selectedDate ? format(selectedDate, "yyyy-MM-dd") : null],
    queryFn: async () => {
      if (!selectedDate) return [];
      const dayStart = format(selectedDate, "yyyy-MM-dd'T'00:00:00");
      const dayEnd = format(selectedDate, "yyyy-MM-dd'T'23:59:59");
      const { data } = await supabase
        .from("appointments")
        .select("id, start_time, end_time, status")
        .eq("staff_id", appointment.staff_id)
        .gte("start_time", dayStart)
        .lte("start_time", dayEnd)
        .neq("status", "cancelled");
      return (data ?? []).filter((a) => a.id !== appointment.id);
    },
    enabled: open && !!selectedDate,
  });

  // Calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const start = startOfWeek(monthStart, { weekStartsOn: 1 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days: Date[] = [];
    let day = start;
    while (day <= end) { days.push(day); day = addDays(day, 1); }
    return days;
  }, [currentMonth]);

  // Working days set (0=Sun, 1=Mon, ..., 6=Sat → adjust to date-fns getDay())
  const workingDaysSet = useMemo(() => {
    if (!workingHours) return new Set<number>();
    return new Set(
      workingHours.filter((wh) => wh.is_working).map((wh) => wh.day_of_week)
    );
  }, [workingHours]);

  // Min bookable date (now + notice hours)
  const noticeHours = (appointment.salons as { reschedule_notice_hours?: number } | null)?.reschedule_notice_hours ?? 24;
  const minDate = addMinutes(new Date(), noticeHours * 60);

  const isDayAvailable = (day: Date): boolean => {
    if (isBefore(day, startOfDay(minDate))) return false;
    if (isSameDay(day, new Date()) && isBefore(day, minDate)) return false;
    // day_of_week in DB: 0=Monday ... 6=Sunday (ISO standard)
    const jsDay = day.getDay(); // 0=Sun, 1=Mon, ...
    const isoDay = jsDay === 0 ? 6 : jsDay - 1;
    return workingDaysSet.has(isoDay);
  };

  // Generate time slots for selected date
  const timeSlots = useMemo(() => {
    if (!selectedDate || !workingHours) return [];
    const jsDay = selectedDate.getDay();
    const isoDay = jsDay === 0 ? 6 : jsDay - 1;
    const wh = workingHours.find((w) => w.day_of_week === isoDay && w.is_working);
    if (!wh) return [];

    const [startH, startM] = wh.start_time.split(":").map(Number);
    const [endH, endM] = wh.end_time.split(":").map(Number);

    const slots: string[] = [];
    let slotTime = setMinutes(setHours(selectedDate, startH), startM);
    const dayEnd = setMinutes(setHours(selectedDate, endH), endM);

    while (addMinutes(slotTime, serviceDuration) <= dayEnd) {
      const slotStr = format(slotTime, "HH:mm");
      const slotEnd = addMinutes(slotTime, serviceDuration);

      // Check if slot doesn't overlap with existing appointments
      const hasConflict = existingAppointments?.some((apt) => {
        const aptStart = parseISO(apt.start_time);
        const aptEnd = parseISO(apt.end_time);
        return slotTime < aptEnd && slotEnd > aptStart;
      });

      // Check if slot is in the future (for today)
      const isInFuture = slotTime > new Date();

      if (!hasConflict && isInFuture) {
        slots.push(slotStr);
      }

      slotTime = addMinutes(slotTime, SLOT_INTERVAL);
    }

    return slots;
  }, [selectedDate, workingHours, existingAppointments, serviceDuration]);

  // Reschedule mutation
  const reschedule = useMutation({
    mutationFn: async () => {
      if (!selectedDate || !selectedTime) throw new Error("Brak daty/godziny");

      const [h, m] = selectedTime.split(":").map(Number);
      const newStart = setMinutes(setHours(selectedDate, h), m);
      const newEnd = addMinutes(newStart, serviceDuration);
      const newStartISO = newStart.toISOString();
      const newEndISO = newEnd.toISOString();

      // Check conflict via edge function
      const { data: conflictData } = await supabase.functions.invoke("check-appointment-conflict", {
        body: {
          staff_id: appointment.staff_id,
          start_time: newStartISO,
          end_time: newEndISO,
          exclude_appointment_id: appointment.id,
        },
      });

      if (conflictData?.hasConflict) {
        throw new Error("CONFLICT");
      }

      // Update appointment
      const { error } = await supabase
        .from("appointments")
        .update({
          start_time: newStartISO,
          end_time: newEndISO,
        })
        .eq("id", appointment.id);

      if (error) throw error;

      // Create notification
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("client_notifications").insert({
          user_id: user.id,
          salon_id: appointment.salon_id,
          type: "reschedule",
          title: "Termin zmieniony",
          description: `Twoja wizyta została przełożona na ${format(newStart, "d MMMM o HH:mm", { locale: pl })}`,
        });
      }

      return { newStart };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["client-bookings"] });
      toast.success(`Termin zmieniony ✓ Nowa wizyta: ${format(data.newStart, "d MMMM, HH:mm", { locale: pl })}`);
      handleClose();
    },
    onError: (err: Error) => {
      if (err.message === "CONFLICT") {
        toast.error("Ten termin właśnie został zajęty. Wybierz inny.");
        setStep("time");
        setSelectedTime(null);
      } else {
        toast.error("Nie udało się zmienić terminu. Spróbuj ponownie.");
      }
    },
  });

  const handleClose = () => {
    setStep("date");
    setSelectedDate(null);
    setSelectedTime(null);
    onClose();
  };

  const handleSelectDate = (day: Date) => {
    setSelectedDate(day);
    setSelectedTime(null);
    setStep("time");
  };

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    setStep("confirm");
  };

  const oldDate = parseISO(appointment.start_time);
  const hasPaidDeposit = appointment.payment_status === "paid";

  return (
    <Drawer open={open} onOpenChange={(o) => !o && handleClose()}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-lg">Zmień termin wizyty</DrawerTitle>
          <DrawerDescription>
            {(appointment.services as { name: string } | null)?.name ?? "Usługa"} • {(appointment.staff_members as { name: string } | null)?.name}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-6 overflow-y-auto max-h-[70vh]">
          <AnimatePresence mode="wait">
            {step === "date" && (
              <motion.div
                key="date"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Month nav */}
                <div className="flex items-center justify-between mb-3">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-bold capitalize">
                    {format(currentMonth, "LLLL yyyy", { locale: pl })}
                  </span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Weekday labels */}
                <div className="grid grid-cols-7 text-center mb-1">
                  {WEEKDAY_LABELS.map((l) => (
                    <span key={l} className="text-[11px] font-semibold text-muted-foreground py-1">{l}</span>
                  ))}
                </div>

                {/* Day grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day) => {
                    const inMonth = isSameMonth(day, currentMonth);
                    const available = isDayAvailable(day);
                    const today = isToday(day);

                    return (
                      <button
                        key={day.toISOString()}
                        disabled={!inMonth || !available}
                        onClick={() => handleSelectDate(day)}
                        className={`
                          h-10 rounded-lg text-sm transition-all
                          ${!inMonth ? "opacity-0 pointer-events-none" : ""}
                          ${available ? "hover:bg-primary/10 active:scale-95 text-foreground font-medium" : "text-muted-foreground/40 cursor-not-allowed"}
                          ${today ? "ring-1 ring-primary/40" : ""}
                        `}
                      >
                        {format(day, "d")}
                      </button>
                    );
                  })}
                </div>

                {/* Current appointment info */}
                <div className="mt-4 p-3 bg-muted/50 rounded-xl text-sm">
                  <p className="text-muted-foreground">Obecny termin:</p>
                  <p className="font-semibold text-foreground">
                    {format(oldDate, "EEEE, d MMMM • HH:mm", { locale: pl })}
                  </p>
                </div>
              </motion.div>
            )}

            {step === "time" && selectedDate && (
              <motion.div
                key="time"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Button variant="ghost" size="sm" onClick={() => setStep("date")} className="text-muted-foreground">
                    <ChevronLeft className="h-4 w-4 mr-1" />Wstecz
                  </Button>
                  <span className="text-sm font-bold capitalize">
                    {format(selectedDate, "EEEE, d MMMM", { locale: pl })}
                  </span>
                </div>

                {loadingSlots ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : timeSlots.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Brak wolnych terminów w tym dniu</p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => setStep("date")}>
                      Wybierz inny dzień
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => handleSelectTime(time)}
                        className="h-11 rounded-xl border border-border/60 text-sm font-medium text-foreground
                          hover:border-primary hover:bg-primary/5 active:scale-95 transition-all"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {step === "confirm" && selectedDate && selectedTime && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <Button variant="ghost" size="sm" onClick={() => setStep("time")} className="text-muted-foreground mb-2">
                  <ChevronLeft className="h-4 w-4 mr-1" />Wstecz
                </Button>

                {/* Comparison */}
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                  <div className="flex-1 text-center">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Stary termin</p>
                    <p className="text-sm font-semibold text-muted-foreground line-through">
                      {format(oldDate, "d MMM", { locale: pl })}
                    </p>
                    <p className="text-sm text-muted-foreground line-through">
                      {format(oldDate, "HH:mm")}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="flex-1 text-center">
                    <p className="text-[11px] text-primary uppercase tracking-wider font-semibold mb-1">Nowy termin</p>
                    <p className="text-sm font-bold text-foreground">
                      {format(selectedDate, "d MMM", { locale: pl })}
                    </p>
                    <p className="text-sm font-bold text-primary">
                      {selectedTime}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{(appointment.services as { name: string } | null)?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{serviceDuration} min</span>
                  </div>
                </div>

                {/* Deposit info */}
                {hasPaidDeposit && (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl text-sm">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-blue-700">Depozyt zostanie przeniesiony na nowy termin.</p>
                  </div>
                )}

                <Button
                  className="w-full h-12 text-base font-semibold"
                  onClick={() => reschedule.mutate()}
                  disabled={reschedule.isPending}
                >
                  {reschedule.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Zapisywanie...</>
                  ) : "Potwierdź zmianę terminu"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

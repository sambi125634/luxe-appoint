import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, addMinutes } from "date-fns";
import { pl } from "date-fns/locale";
import { RefreshCw, Calendar, Clock, Heart, Loader2, User } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";

interface RebookingSheetProps {
  open: boolean;
  onClose: () => void;
  booking: {
    id: string;
    salon_id: string;
    service_id: string;
    staff_id: string;
    client_id: string | null;
    start_time: string;
    services: { name: string; duration: number; price: number } | null;
    staff_members: { name: string; avatar_url: string | null; color: string | null } | null;
    salons: { name: string; theme_primary_color: string | null } | null;
  };
}

export function RebookingSheet({ open, onClose, booking }: RebookingSheetProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const service = booking.services;
  const staffMember = booking.staff_members;
  const salon = booking.salons;
  const primaryColor = salon?.theme_primary_color ?? "hsl(var(--primary))";

  // Check if this staff member is a favorite (3+ visits)
  const { data: staffPreference } = useQuery({
    queryKey: ["staff-preference", booking.client_id, booking.staff_id],
    queryFn: async () => {
      if (!booking.client_id || !booking.staff_id) return { isFavorite: false, visits: 0 };

      const { count } = await supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("client_id", booking.client_id)
        .eq("staff_id", booking.staff_id)
        .eq("status", "completed");

      return { isFavorite: (count ?? 0) >= 3, visits: count ?? 0 };
    },
    enabled: open && !!booking.client_id,
  });

  // Check staff still active
  const { data: staffActive } = useQuery({
    queryKey: ["staff-active-check", booking.staff_id, booking.salon_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("staff_members")
        .select("id, is_active")
        .eq("id", booking.staff_id)
        .eq("salon_id", booking.salon_id)
        .eq("is_active", true)
        .maybeSingle();
      return !!data;
    },
    enabled: open,
  });

  const preferStaff = staffActive ?? false;
  const staffIdForSlots = preferStaff ? booking.staff_id : null;

  // Next 14 days
  const days = useMemo(() => {
    const result: Date[] = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      result.push(addDays(today, i));
    }
    return result;
  }, []);

  const { data: slots, isLoading: slotsLoading } = useAvailableSlots({
    salonId: booking.salon_id,
    serviceId: booking.service_id,
    date: selectedDate,
    staffId: staffIdForSlots,
    durationMinutes: service?.duration ?? 60,
  });

  const rebookMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDate || !selectedSlot) throw new Error("Wybierz termin");

      const [h, m] = selectedSlot.split(":").map(Number);
      const startTime = new Date(selectedDate);
      startTime.setHours(h, m, 0, 0);
      const endTime = addMinutes(startTime, service?.duration ?? 60);

      // Check conflict first
      try {
        const { data: conflictResult } = await supabase.functions.invoke(
          "check-appointment-conflict",
          {
            body: {
              staffId: preferStaff ? booking.staff_id : booking.staff_id,
              startTime: startTime.toISOString(),
              endTime: endTime.toISOString(),
              salonId: booking.salon_id,
            },
          }
        );
        if (conflictResult?.hasConflict) {
          throw new Error("Ten termin właśnie został zajęty. Wybierz inny.");
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes("zajęty")) throw err;
        // If function fails, proceed with insert anyway
      }

      const { error } = await supabase.from("appointments").insert({
        salon_id: booking.salon_id,
        service_id: booking.service_id,
        staff_id: booking.staff_id,
        client_id: booking.client_id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: "booked",
        price: service?.price ?? null,
      });

      if (error) throw error;
      return { startTime };
    },
    onSuccess: ({ startTime }) => {
      queryClient.invalidateQueries({ queryKey: ["client-bookings"] });
      toast.success(
        `Wizyta zarezerwowana! Do zobaczenia ${format(startTime, "d MMMM", { locale: pl })} o ${format(startTime, "HH:mm")} 🌸`
      );
      onClose();
      navigate("/app/bookings");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Nie udało się zarezerwować wizyty");
    },
  });

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: primaryColor }}
            >
              {salon?.name?.charAt(0) ?? "S"}
            </div>
            <div>
              <DrawerTitle className="text-left">Ponowna rezerwacja</DrawerTitle>
              <p className="text-xs text-muted-foreground">{salon?.name}</p>
            </div>
          </div>
        </DrawerHeader>

        <div className="px-4 pb-6 overflow-y-auto">
          {/* Service info */}
          <div className="bg-muted/50 rounded-2xl p-4 mb-5">
            <p className="font-bold text-foreground mb-1">{service?.name ?? "Usługa"}</p>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {service?.duration} min
              </span>
              {service?.price != null && (
                <span className="font-semibold text-foreground">
                  {Number(service.price).toFixed(0)} zł
                </span>
              )}
            </div>

            {staffMember && (
              <div className="flex items-center gap-2 mt-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: staffMember.color ?? primaryColor }}
                >
                  {staffMember.avatar_url ? (
                    <img src={staffMember.avatar_url} alt={staffMember.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    staffMember.name.charAt(0)
                  )}
                </div>
                <span className="text-sm text-foreground">
                  {preferStaff ? `z ${staffMember.name}` : "dowolny specjalista"}
                </span>
                {staffPreference?.isFavorite && (
                  <Badge variant="secondary" className="text-[10px] gap-1">
                    <Heart className="h-3 w-3 fill-current" />
                    Twoja ulubiona 💜
                  </Badge>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-2">
              Ostatnio: {format(new Date(booking.start_time), "d MMMM yyyy", { locale: pl })}
            </p>
          </div>

          {/* Date picker - horizontal scroll */}
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Wybierz termin
          </h3>

          <ScrollArea className="w-full mb-4">
            <div className="flex gap-2 pb-2">
              {days.map((day) => {
                const isSelected = selectedDate?.toDateString() === day.toDateString();
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleSelectDate(day)}
                    className={`flex flex-col items-center px-3 py-2.5 rounded-xl shrink-0 transition-all border ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-border/40 bg-background text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <span className="text-[10px] uppercase tracking-wide">
                      {format(day, "EEE", { locale: pl })}
                    </span>
                    <span className="text-lg font-bold leading-tight">
                      {format(day, "d")}
                    </span>
                    <span className="text-[10px]">
                      {format(day, "MMM", { locale: pl })}
                    </span>
                  </button>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* Time slots */}
          {selectedDate && (
            <div className="mb-5">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Dostępne godziny
              </h3>

              {slotsLoading ? (
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-11 rounded-xl" />
                  ))}
                </div>
              ) : !slots?.length ? (
                <div className="text-center py-8 bg-muted/30 rounded-2xl">
                  <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Brak wolnych terminów w tym dniu</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`h-11 rounded-xl text-sm font-semibold transition-all border ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border/40 bg-background text-foreground hover:bg-muted/50"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Confirm button */}
          <Button
            className="w-full h-12 rounded-xl font-semibold text-base"
            disabled={!selectedDate || !selectedSlot || rebookMutation.isPending}
            onClick={() => rebookMutation.mutate()}
            style={{ backgroundColor: primaryColor }}
          >
            {rebookMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Potwierdź rezerwację
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

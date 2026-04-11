import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, isPast, parseISO, differenceInHours, differenceInDays, addHours } from "date-fns";
import { pl } from "date-fns/locale";
import { Calendar, Clock, MapPin, User, XCircle, AlertTriangle, CalendarDays, Star, CalendarClock } from "lucide-react";
import { BookingsCalendarView } from "./BookingsCalendarView";
import { ReviewModal } from "./ReviewModal";
import { RescheduleModal } from "./RescheduleModal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "./PullToRefreshIndicator";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const statusLabels: Record<string, string> = {
  booked: "Zarezerwowana",
  confirmed: "Potwierdzona",
  completed: "Zakończona",
  cancelled: "Anulowana",
  no_show: "Nieobecność",
};

const statusColors: Record<string, string> = {
  booked: "bg-blue-100 text-blue-700 border-blue-200",
  confirmed: "bg-green-100 text-green-700 border-green-200",
  completed: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  no_show: "bg-orange-100 text-orange-700 border-orange-200",
};

function getCountdown(startTime: string): string {
  const now = new Date();
  const start = parseISO(startTime);
  const hours = differenceInHours(start, now);
  const days = differenceInDays(start, now);

  if (hours < 1) return "Za chwilę!";
  if (hours < 24) return `Za ${hours}h`;
  if (days === 1) return "Jutro";
  if (days < 7) return `Za ${days} dni`;
  return `Za ${days} dni`;
}

export function MyBookings() {
  const queryClient = useQueryClient();
  const [reviewBooking, setReviewBooking] = useState<{ id: string; serviceName: string; salonName: string; salonId: string } | null>(null);
  const [rescheduleBooking, setRescheduleBooking] = useState<any>(null);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["client-bookings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.email) return [];

      const { data: clients } = await supabase
        .from("clients")
        .select("id, salon_id")
        .eq("email", profile.email);

      if (!clients?.length) return [];

      const clientIds = clients.map((c) => c.id);

      const { data, error } = await supabase
        .from("appointments")
        .select("*, services:service_id(name, duration, price), staff_members:staff_id(name, avatar_url, color), salons:salon_id(name, address, city, theme_primary_color)")
        .in("client_id", clientIds)
        .order("start_time", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data ?? [];
    },
  });

  const cancelBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" as const })
        .eq("id", bookingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-bookings"] });
      toast.success("Wizyta została anulowana");
    },
    onError: () => {
      toast.error("Nie udało się anulować wizyty");
    },
  });

  const { containerRef, pullDistance, refreshing, handlers } = usePullToRefresh({
    onRefresh: async () => {
      await queryClient.invalidateQueries({ queryKey: ["client-bookings"] });
    },
  });

  const upcoming = bookings?.filter(
    (b) => !isPast(parseISO(b.start_time)) && b.status !== "cancelled"
  ) ?? [];
  const past = bookings?.filter(
    (b) => isPast(parseISO(b.start_time)) || b.status === "cancelled"
  ) ?? [];

  // Sort upcoming by soonest first
  const sortedUpcoming = [...upcoming].sort((a, b) =>
    parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime()
  );

  const BookingCard = ({ booking, isUpcoming = false }: { booking: NonNullable<typeof bookings>[0]; isUpcoming?: boolean }) => {
    const service = booking.services as unknown as { name: string; duration: number; price: number } | null;
    const staffMember = booking.staff_members as unknown as { name: string; avatar_url: string | null; color: string | null } | null;
    const salon = booking.salons as unknown as { name: string; address: string | null; city: string | null; theme_primary_color: string | null } | null;

    const isFirst = isUpcoming && sortedUpcoming[0]?.id === booking.id;

    return (
      <Card className={`overflow-hidden border-border/40 active:scale-[0.98] transition-all duration-150 ${isFirst ? "ring-2 ring-primary/30 shadow-md" : ""}`}>
        {/* Color accent bar */}
        <div
          className="h-1.5"
          style={{ backgroundColor: salon?.theme_primary_color ?? "hsl(var(--primary))" }}
        />
        <CardContent className="p-4">
          {/* Header: Service name + status */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground truncate">
                {service?.name ?? "Usługa"}
              </h3>
              {salon && (
                <p className="text-xs text-muted-foreground mt-0.5">{salon.name}</p>
              )}
            </div>
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusColors[booking.status] ?? "bg-muted text-muted-foreground border-border"}`}>
              {statusLabels[booking.status] ?? booking.status}
            </span>
          </div>

          {/* Time & Staff row */}
          <div className="flex items-center gap-3 mb-2">
            {staffMember && (
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold overflow-hidden"
                  style={{ backgroundColor: staffMember.color ?? "hsl(var(--primary))" }}
                >
                  {staffMember.avatar_url ? (
                    <img src={staffMember.avatar_url} alt={staffMember.name} className="w-full h-full object-cover" />
                  ) : (
                    staffMember.name.charAt(0)
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{staffMember.name}</span>
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div className="space-y-1.5 text-sm">
            <p className="flex items-center gap-2 text-foreground font-medium">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              {format(parseISO(booking.start_time), "EEEE, d MMMM", { locale: pl })}
              {isUpcoming && (
                <span className="text-xs font-bold text-primary ml-auto">
                  {getCountdown(booking.start_time)}
                </span>
              )}
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {format(parseISO(booking.start_time), "HH:mm")} – {format(parseISO(booking.end_time), "HH:mm")}
              {service && <span className="text-xs">({service.duration} min)</span>}
            </p>
          </div>

          {/* Price + Actions */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
            {service?.price != null && (
              <span className="font-bold text-foreground">
                {Number(service.price).toFixed(0)} zł
              </span>
            )}
            <div className="flex items-center gap-1">
              {!isUpcoming && booking.status === "completed" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary hover:bg-primary/10 -mr-1"
                  onClick={() => setReviewBooking({
                    id: booking.id,
                    serviceName: service?.name ?? "Usługa",
                    salonName: salon?.name ?? "Salon",
                    salonId: booking.salon_id,
                  })}
                >
                  <Star className="h-4 w-4 mr-1" />
                  Oceń
                </Button>
              )}
              {isUpcoming && booking.status !== "cancelled" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 -mr-2">
                      <XCircle className="h-4 w-4 mr-1" />
                      Anuluj
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Anulować wizytę?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Czy na pewno chcesz anulować wizytę "{service?.name}" zaplanowaną na {format(parseISO(booking.start_time), "d MMMM o HH:mm", { locale: pl })}?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Nie, zostaw</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => cancelBooking.mutate(booking.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Tak, anuluj
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div
      ref={containerRef}
      className="h-[calc(100vh-4rem)] overflow-y-auto"
      {...handlers}
    >
      <PullToRefreshIndicator pullDistance={pullDistance} refreshing={refreshing} />

      <div className="px-4 pt-6 pb-24">
        <h1 className="text-2xl font-bold text-foreground mb-1">Moje wizyty</h1>
        <p className="text-sm text-muted-foreground mb-5">Zarządzaj swoimi rezerwacjami</p>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3 p-4">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <Tabs defaultValue="upcoming">
            <TabsList className="w-full mb-5 h-11 bg-muted/70 rounded-xl p-1">
              <TabsTrigger value="upcoming" className="flex-1 rounded-lg data-[state=active]:shadow-sm font-semibold">
                Nadchodzące ({upcoming.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="flex-1 rounded-lg data-[state=active]:shadow-sm font-semibold">
                Historia ({past.length})
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex-1 rounded-lg data-[state=active]:shadow-sm font-semibold">
                <CalendarDays className="h-4 w-4 mr-1" />
                Miesiąc
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-3">
              {!sortedUpcoming.length ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-9 w-9 text-primary/40" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">Brak nadchodzących wizyt</h3>
                  <p className="text-sm text-muted-foreground">
                    Zarezerwuj wizytę w jednym ze swoich salonów
                  </p>
                </div>
              ) : (
                sortedUpcoming.map((b) => <BookingCard key={b.id} booking={b} isUpcoming />)
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-3">
              {!past.length ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-9 w-9 text-muted-foreground/40" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">Brak historii wizyt</h3>
                </div>
              ) : (
                past.map((b) => <BookingCard key={b.id} booking={b} />)
              )}
            </TabsContent>

            <TabsContent value="calendar">
              <BookingsCalendarView
                bookings={bookings ?? []}
                renderBookingCard={(b: any) => {
                  const isUpcoming = !isPast(parseISO(b.start_time)) && b.status !== "cancelled";
                  return <BookingCard booking={b} isUpcoming={isUpcoming} />;
                }}
              />
            </TabsContent>
          </Tabs>
        )}

        {/* Review modal */}
        <ReviewModal
          open={!!reviewBooking}
          onClose={() => setReviewBooking(null)}
          bookingId={reviewBooking?.id ?? ""}
          serviceName={reviewBooking?.serviceName ?? ""}
          salonName={reviewBooking?.salonName ?? ""}
          salonId={reviewBooking?.salonId ?? ""}
        />
      </div>
    </div>
  );
}

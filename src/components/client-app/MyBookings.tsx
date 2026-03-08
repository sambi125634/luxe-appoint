import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, isPast, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { Calendar, Clock, MapPin, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const statusLabels: Record<string, string> = {
  booked: "Zarezerwowana",
  confirmed: "Potwierdzona",
  completed: "Zakończona",
  cancelled: "Anulowana",
  no_show: "Nieobecność",
};

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  booked: "default",
  confirmed: "default",
  completed: "secondary",
  cancelled: "destructive",
  no_show: "destructive",
};

export function MyBookings() {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["client-bookings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get client records linked to this user's email
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.email) return [];

      // Find client records by email across salons
      const { data: clients } = await supabase
        .from("clients")
        .select("id, salon_id")
        .eq("email", profile.email);

      if (!clients?.length) return [];

      const clientIds = clients.map((c) => c.id);

      const { data, error } = await supabase
        .from("appointments")
        .select("*, services:service_id(name, duration, price), staff_members:staff_id(name), salons:salon_id(name, address, city)")
        .in("client_id", clientIds)
        .order("start_time", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data ?? [];
    },
  });

  const upcoming = bookings?.filter(
    (b) => !isPast(parseISO(b.start_time)) && b.status !== "cancelled"
  ) ?? [];
  const past = bookings?.filter(
    (b) => isPast(parseISO(b.start_time)) || b.status === "cancelled"
  ) ?? [];

  const BookingCard = ({ booking }: { booking: (typeof bookings)[0] }) => {
    const service = booking.services as unknown as { name: string; duration: number; price: number } | null;
    const staff = booking.staff_members as unknown as { name: string } | null;
    const salon = booking.salons as unknown as { name: string; address: string | null; city: string | null } | null;

    return (
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-foreground">
              {service?.name ?? "Usługa"}
            </h3>
            <Badge variant={statusVariant[booking.status] ?? "outline"}>
              {statusLabels[booking.status] ?? booking.status}
            </Badge>
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              {format(parseISO(booking.start_time), "EEEE, d MMMM yyyy", { locale: pl })}
            </p>
            <p className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              {format(parseISO(booking.start_time), "HH:mm")} – {format(parseISO(booking.end_time), "HH:mm")}
              {service && <span>({service.duration} min)</span>}
            </p>
            {salon && (
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                {salon.name}
              </p>
            )}
            {staff && (
              <p className="text-xs">Specjalista: {staff.name}</p>
            )}
          </div>
          {service?.price && (
            <p className="mt-2 font-semibold text-foreground">
              {service.price.toFixed(2)} zł
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="text-2xl font-bold text-foreground mb-6">Moje wizyty</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : (
        <Tabs defaultValue="upcoming">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="upcoming" className="flex-1">
              Nadchodzące ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="flex-1">
              Historia ({past.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-3">
            {!upcoming.length ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Brak nadchodzących wizyt</h3>
                <p className="text-sm text-muted-foreground">
                  Zarezerwuj wizytę w jednym ze swoich salonów
                </p>
              </div>
            ) : (
              upcoming.map((b) => <BookingCard key={b.id} booking={b} />)
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-3">
            {!past.length ? (
              <div className="text-center py-12">
                <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Brak historii wizyt</h3>
              </div>
            ) : (
              past.map((b) => <BookingCard key={b.id} booking={b} />)
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

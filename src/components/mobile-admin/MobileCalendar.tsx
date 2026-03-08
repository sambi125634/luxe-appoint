import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Plus, Clock, Phone, MoreVertical,
  CheckCircle2, XCircle, AlertTriangle, User
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useSalonId } from "@/hooks/useSalonId";
import { useStaffMembers } from "@/hooks/useStaffMembers";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, subDays, startOfDay, endOfDay, isSameDay } from "date-fns";
import { pl } from "date-fns/locale";
import { toast } from "sonner";

export function MobileCalendar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { salonId } = useSalonId();
  const { data: staffMembers } = useStaffMembers();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  // Generate week around selected date
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfDay(selectedDate), i - 3));

  // Fetch appointments for selected date
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["mobile-calendar", salonId, selectedDate.toDateString()],
    queryFn: async () => {
      const dayStart = startOfDay(selectedDate).toISOString();
      const dayEnd = endOfDay(selectedDate).toISOString();

      const { data, error } = await supabase
        .from("appointments")
        .select("id, start_time, end_time, status, price, notes, clients(first_name, last_name, phone), services(name, duration), staff_members(id, name, color, avatar_url)")
        .eq("salon_id", salonId!)
        .gte("start_time", dayStart)
        .lte("start_time", dayEnd)
        .order("start_time");

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!salonId,
  });

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "booked" | "confirmed" | "cancelled" | "completed" | "no_show" }) => {
      const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobile-calendar"] });
      toast.success("Status zaktualizowany");
    },
    onError: () => toast.error("Nie udało się zmienić statusu"),
  });

  const filteredAppointments = selectedStaffId
    ? appointments.filter(a => (a.staff_members as { id: string } | null)?.id === selectedStaffId)
    : appointments;

  const now = new Date();

  // Group by hour for timeline
  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 - 20:00

  return (
    <div className="pb-20 max-w-lg mx-auto">
      {/* Header */}
      <div className="px-4 pt-2 pb-3 sticky top-0 z-20 bg-background/95 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-serif font-bold">Kalendarz</h1>
          <Button
            size="sm"
            className="gap-1.5 rounded-full"
            onClick={() => navigate("/m/calendar?new=true")}
          >
            <Plus className="w-4 h-4" /> Nowa
          </Button>
        </div>

        {/* Date selector - swipeable horizontal */}
        <div className="flex items-center gap-1 mb-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setSelectedDate(d => subDays(d, 7))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 flex gap-1 overflow-x-auto scrollbar-hide">
            {weekDays.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, now);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "flex-1 min-w-[44px] py-1.5 rounded-xl flex flex-col items-center gap-0.5 transition-all active:scale-95",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md"
                      : isToday
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <span className="text-[10px] uppercase font-medium">
                    {format(day, "EEE", { locale: pl })}
                  </span>
                  <span className={cn("text-lg font-bold", !isSelected && !isToday && "text-foreground")}>
                    {format(day, "d")}
                  </span>
                </button>
              );
            })}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setSelectedDate(d => addDays(d, 7))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Staff filter chips */}
        {staffMembers && staffMembers.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setSelectedStaffId(null)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all active:scale-95",
                !selectedStaffId ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              Wszyscy
            </button>
            {staffMembers.filter(s => s.is_active).map((staff) => (
              <button
                key={staff.id}
                onClick={() => setSelectedStaffId(staff.id === selectedStaffId ? null : staff.id)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all active:scale-95 flex items-center gap-1.5",
                  staff.id === selectedStaffId
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: staff.color || "hsl(var(--primary))" }}
                />
                {staff.name.split(" ")[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Month label */}
      <div className="px-4 mb-2">
        <p className="text-sm font-medium text-muted-foreground capitalize">
          {format(selectedDate, "EEEE, d MMMM yyyy", { locale: pl })}
        </p>
        <p className="text-xs text-muted-foreground">
          {filteredAppointments.filter(a => a.status !== "cancelled").length} wizyt
        </p>
      </div>

      {/* Timeline view */}
      <div className="px-4 space-y-0">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
              <Clock className="w-7 h-7 text-muted-foreground/50" />
            </div>
            <p className="font-medium text-muted-foreground">Brak wizyt</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Dzień jest wolny!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAppointments.map((appt) => {
              const client = appt.clients as { first_name: string; last_name: string; phone: string } | null;
              const service = appt.services as { name: string; duration: number } | null;
              const staff = appt.staff_members as { id: string; name: string; color: string | null } | null;
              const startTime = new Date(appt.start_time);
              const endTime = new Date(appt.end_time);
              const isPast = endTime < now;
              const isCurrent = startTime <= now && endTime > now;

              return (
                <Card
                  key={appt.id}
                  className={cn(
                    "overflow-hidden transition-all active:scale-[0.98]",
                    isCurrent && "ring-2 ring-primary shadow-lg",
                    isPast && "opacity-50",
                    appt.status === "cancelled" && "opacity-30"
                  )}
                >
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* Color bar */}
                      <div
                        className="w-1.5 shrink-0"
                        style={{ backgroundColor: staff?.color || "hsl(var(--primary))" }}
                      />
                      <div className="flex-1 p-3">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-bold">
                                {format(startTime, "HH:mm")} – {format(endTime, "HH:mm")}
                              </span>
                              {isCurrent && (
                                <Badge className="text-[9px] px-1.5 py-0 bg-primary/20 text-primary border-0">
                                  TERAZ
                                </Badge>
                              )}
                            </div>
                            <p className="font-semibold truncate">
                              {client?.first_name} {client?.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{service?.name}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                <User className="w-3 h-3 shrink-0" /> <span className="truncate">{staff?.name}</span>
                              </span>
                              {appt.price && (
                                <span className="text-xs font-bold">{appt.price} zł</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {client?.phone && (
                              <a href={`tel:${client.phone}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Phone className="w-3.5 h-3.5" />
                                </Button>
                              </a>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => statusMutation.mutate({ id: appt.id, status: "confirmed" })}>
                                  <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" /> Potwierdź
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => statusMutation.mutate({ id: appt.id, status: "completed" })}>
                                  <CheckCircle2 className="w-4 h-4 mr-2 text-blue-600" /> Zakończ
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => statusMutation.mutate({ id: appt.id, status: "no_show" })}>
                                  <AlertTriangle className="w-4 h-4 mr-2 text-amber-600" /> No-show
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => statusMutation.mutate({ id: appt.id, status: "cancelled" })}
                                  className="text-destructive"
                                >
                                  <XCircle className="w-4 h-4 mr-2" /> Anuluj
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

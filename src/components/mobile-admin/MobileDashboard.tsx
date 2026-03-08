import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar, DollarSign, TrendingUp, UserX, Users, Plus, ChevronRight,
  Clock, Phone, CheckCircle2, AlertCircle, Sparkles, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useSalonId } from "@/hooks/useSalonId";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from "date-fns";
import { pl } from "date-fns/locale";

export function MobileDashboard() {
  const navigate = useNavigate();
  const { salonId } = useSalonId();
  const { salonName } = useUserRole();
  const today = new Date();

  const todayStart = startOfDay(today).toISOString();
  const todayEnd = endOfDay(today).toISOString();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }).toISOString();
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 }).toISOString();
  const monthStart = startOfMonth(today).toISOString();
  const monthEnd = endOfMonth(today).toISOString();

  // Today's appointments
  const { data: todayAppointments = [], isLoading } = useQuery({
    queryKey: ["mobile-today-appts", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("id, start_time, end_time, status, price, clients(first_name, last_name, phone), services(name, duration), staff_members(name, avatar_url, color)")
        .eq("salon_id", salonId!)
        .gte("start_time", todayStart)
        .lte("start_time", todayEnd)
        .order("start_time");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!salonId,
  });

  // Weekly stats
  const { data: weeklyStats } = useQuery({
    queryKey: ["mobile-weekly-stats", salonId],
    queryFn: async () => {
      const { count: current } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("salon_id", salonId!)
        .gte("start_time", weekStart)
        .lte("start_time", weekEnd)
        .neq("status", "cancelled");

      const prev = subWeeks(new Date(weekStart), 1).toISOString();
      const prevEnd = subWeeks(new Date(weekEnd), 1).toISOString();
      const { count: previous } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("salon_id", salonId!)
        .gte("start_time", prev)
        .lte("start_time", prevEnd)
        .neq("status", "cancelled");

      return { current: current ?? 0, previous: previous ?? 0 };
    },
    enabled: !!salonId,
  });

  // Monthly no-shows
  const { data: noShows } = useQuery({
    queryKey: ["mobile-noshows", salonId],
    queryFn: async () => {
      const { count } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("salon_id", salonId!)
        .eq("status", "no_show")
        .gte("start_time", monthStart)
        .lte("start_time", monthEnd);
      return count ?? 0;
    },
    enabled: !!salonId,
  });

  const confirmedCount = todayAppointments.filter(a => a.status === "confirmed" || a.status === "completed").length;
  const pendingCount = todayAppointments.filter(a => a.status === "booked").length;
  const todayRevenue = todayAppointments
    .filter(a => a.status !== "cancelled")
    .reduce((s, a) => s + Number(a.price ?? 0), 0);

  // Find next upcoming appointment
  const now = new Date();
  const nextAppt = todayAppointments.find(a => new Date(a.start_time) > now && a.status !== "cancelled");

  const greeting = () => {
    const h = now.getHours();
    if (h < 12) return "Dzień dobry";
    if (h < 18) return "Cześć";
    return "Dobry wieczór";
  };

  return (
    <div className="pb-20 px-4 pt-2 space-y-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{format(today, "EEEE, d MMMM", { locale: pl })}</p>
          <h1 className="text-2xl font-serif font-bold">{greeting()} 👋</h1>
          {salonName && <p className="text-sm text-primary font-medium">{salonName}</p>}
        </div>
        <Button
          size="icon"
          className="rounded-full w-12 h-12 bg-primary shadow-lg"
          onClick={() => navigate("/m/calendar?new=true")}
        >
          <Plus className="w-5 h-5 text-primary-foreground" />
        </Button>
      </div>

      {/* Next appointment hero card */}
      {nextAppt && (
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Następna wizyta</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-serif font-bold text-lg truncate">
                  {(nextAppt.clients as { first_name: string; last_name: string } | null)?.first_name}{" "}
                  {(nextAppt.clients as { first_name: string; last_name: string } | null)?.last_name}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {(nextAppt.services as { name: string } | null)?.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm font-medium">{format(new Date(nextAppt.start_time), "HH:mm")}</span>
                  <span className="text-xs text-muted-foreground">
                    • {(nextAppt.staff_members as { name: string } | null)?.name}
                  </span>
                </div>
              </div>
              {(nextAppt.clients as { phone: string } | null)?.phone && (
                <a href={`tel:${(nextAppt.clients as { phone: string }).phone}`}>
                  <Button size="icon" variant="outline" className="rounded-full w-11 h-11 border-primary/30">
                    <Phone className="w-4 h-4 text-primary" />
                  </Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI strip - horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {[
          {
            label: "Dziś",
            value: isLoading ? "..." : todayAppointments.length.toString(),
            sub: `${confirmedCount} potw. • ${pendingCount} oczek.`,
            icon: Calendar,
            color: "text-primary",
          },
          {
            label: "Przychód",
            value: isLoading ? "..." : `${todayRevenue} zł`,
            sub: `z ${todayAppointments.filter(a => a.status !== "cancelled").length} wizyt`,
            icon: DollarSign,
            color: "text-emerald-600",
          },
          {
            label: "Ten tydzień",
            value: (weeklyStats?.current ?? 0).toString(),
            sub: (weeklyStats?.current ?? 0) >= (weeklyStats?.previous ?? 0)
              ? `+${(weeklyStats?.current ?? 0) - (weeklyStats?.previous ?? 0)} vs poprz.`
              : `${(weeklyStats?.current ?? 0) - (weeklyStats?.previous ?? 0)} vs poprz.`,
            icon: TrendingUp,
            color: "text-blue-600",
            trend: (weeklyStats?.current ?? 0) >= (weeklyStats?.previous ?? 0) ? "up" : "down",
          },
          {
            label: "No-shows",
            value: (noShows ?? 0).toString(),
            sub: "ten miesiąc",
            icon: UserX,
            color: (noShows ?? 0) > 0 ? "text-destructive" : "text-muted-foreground",
          },
        ].map((kpi, i) => (
          <Card key={i} className="min-w-[130px] flex-shrink-0 active:scale-[0.97] transition-transform">
            <CardContent className="p-3 overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-muted-foreground font-medium truncate">{kpi.label}</span>
                <kpi.icon className={cn("w-3.5 h-3.5 shrink-0", kpi.color)} />
              </div>
              <p className="text-xl font-bold font-serif truncate">{kpi.value}</p>
              <div className="flex items-center gap-1 mt-0.5 min-w-0">
                {kpi.trend === "up" && <ArrowUpRight className="w-3 h-3 text-emerald-500 shrink-0" />}
                {kpi.trend === "down" && <ArrowDownRight className="w-3 h-3 text-destructive shrink-0" />}
                <span className="text-[10px] text-muted-foreground truncate">{kpi.sub}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending actions */}
      {pendingCount > 0 && (
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800/50">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold">{pendingCount} wizyt{pendingCount === 1 ? "a" : pendingCount < 5 ? "y" : ""} do potwierdzenia</p>
                <p className="text-xs text-muted-foreground">Wymaga Twojej akcji</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </CardContent>
        </Card>
      )}

      {/* Today's schedule */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif font-bold text-lg">Harmonogram dnia</h2>
          <Button variant="ghost" size="sm" className="text-primary text-xs" onClick={() => navigate("/m/calendar")}>
            Cały kalendarz <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        ) : todayAppointments.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <Calendar className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="font-medium text-muted-foreground">Brak wizyt na dziś</p>
              <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={() => navigate("/m/calendar?new=true")}>
                <Plus className="w-3.5 h-3.5" /> Dodaj wizytę
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {todayAppointments.map((appt, idx) => {
              const client = appt.clients as { first_name: string; last_name: string; phone: string } | null;
              const service = appt.services as { name: string; duration: number } | null;
              const staff = appt.staff_members as { name: string; color: string | null; avatar_url: string | null } | null;
              const time = format(new Date(appt.start_time), "HH:mm");
              const endTime = format(new Date(appt.end_time), "HH:mm");
              const isPast = new Date(appt.end_time) < now;
              const isCurrent = new Date(appt.start_time) <= now && new Date(appt.end_time) > now;

              return (
                <Card
                  key={appt.id}
                  className={cn(
                    "overflow-hidden transition-all active:scale-[0.98]",
                    appt.status === "cancelled" && "opacity-40",
                    isCurrent && "ring-2 ring-primary shadow-lg",
                    isPast && !isCurrent && "opacity-60"
                  )}
                >
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* Time column */}
                      <div className={cn(
                        "w-16 flex flex-col items-center justify-center py-3 text-center",
                        isCurrent ? "bg-primary text-primary-foreground" : "bg-muted/50"
                      )}>
                        <span className="text-sm font-bold">{time}</span>
                        <span className="text-[10px] opacity-70">{endTime}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-3 flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {client?.first_name} {client?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{service?.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: staff?.color || "hsl(var(--primary))" }}
                            />
                            <span className="text-[11px] text-muted-foreground">{staff?.name}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-bold text-sm">{appt.price ? `${appt.price} zł` : ""}</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] px-1.5 py-0",
                              appt.status === "confirmed" && "border-emerald-300 text-emerald-700 bg-emerald-50",
                              appt.status === "booked" && "border-amber-300 text-amber-700 bg-amber-50",
                              appt.status === "completed" && "border-blue-300 text-blue-700 bg-blue-50",
                              appt.status === "cancelled" && "border-destructive/30 text-destructive",
                              appt.status === "no_show" && "border-destructive text-destructive"
                            )}
                          >
                            {appt.status === "confirmed" && "Potwierdzona"}
                            {appt.status === "booked" && "Oczekuje"}
                            {appt.status === "completed" && "Zakończona"}
                            {appt.status === "cancelled" && "Anulowana"}
                            {appt.status === "no_show" && "No-show"}
                          </Badge>
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

      {/* Quick actions grid */}
      <div>
        <h2 className="font-serif font-bold text-lg mb-3">Szybkie akcje</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Nowa wizyta", icon: Plus, path: "/m/calendar?new=true", color: "bg-primary/10 text-primary" },
            { label: "Szukaj klienta", icon: Users, path: "/m/clients", color: "bg-blue-500/10 text-blue-600" },
            { label: "Sprzedaż produktu", icon: DollarSign, path: "/m/more?tab=products", color: "bg-emerald-500/10 text-emerald-600" },
            { label: "Statystyki", icon: TrendingUp, path: "/m/more?tab=stats", color: "bg-purple-500/10 text-purple-600" },
          ].map((action) => (
            <Card
              key={action.label}
              className="active:scale-[0.96] transition-transform cursor-pointer"
              onClick={() => navigate(action.path)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", action.color)}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium truncate">{action.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

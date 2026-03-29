import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Calendar, Users, TrendingUp, AlertCircle, Clock, 
  DollarSign, UserX, Sparkles, ArrowUpRight, ArrowDownRight,
  Phone, CheckCircle2, XCircle, ShoppingBag, Package, Plus, Radio, AlertTriangle, Repeat, ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { QuickProductSale } from "./products/QuickProductSale";
import { RetentionFlowWidget } from "./dashboard/RetentionFlowWidget";
import { StockAlertsCard } from "./products/StockAlertsCard";
import { RevenuePredictionCard } from "./dashboard/RevenuePredictionCard";
import { WeeklyBriefWidget } from "./dashboard/WeeklyBriefWidget";
import { TodayStaffCard } from "./dashboard/TodayStaffCard";
import { SectionGuide } from "./SectionGuide";
import { SetupChecklist } from "./SetupChecklist";
import { useSalonId } from "@/hooks/useSalonId";
import { useStockAlerts } from "@/hooks/useStockAlerts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from "date-fns";
import { pl, enUS } from "date-fns/locale";

interface DashboardHomeProps {
  onNavigate?: (tab: string) => void;
  isDemo?: boolean;
}

// Mock data for demo mode
const demoTime = (h: number, m: number) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

const DEMO_APPOINTMENTS = [
  { id: "d1",  start_time: demoTime(8, 0),   end_time: demoTime(9, 0),   status: "confirmed" as const, price: 150, notes: null, clients: { first_name: "Anna",       last_name: "Kowalska",    phone: "+48 123 456 789" }, services: { name: "Manicure hybrydowy" },     staff_members: { name: "Maria Nowakowska" } },
  { id: "d2",  start_time: demoTime(8, 30),  end_time: demoTime(9, 30),  status: "confirmed" as const, price: 280, notes: null, clients: { first_name: "Beata",      last_name: "Mazur",       phone: "+48 501 234 567" }, services: { name: "Koloryzacja + tonowanie" }, staff_members: { name: "Joanna Lewandowska" } },
  { id: "d3",  start_time: demoTime(9, 0),   end_time: demoTime(10, 0),  status: "confirmed" as const, price: 120, notes: null, clients: { first_name: "Celina",     last_name: "Kaczmarek",   phone: "+48 502 345 678" }, services: { name: "Pedicure klasyczny" },      staff_members: { name: "Karolina Wiśniewska" } },
  { id: "d4",  start_time: demoTime(9, 30),  end_time: demoTime(10, 30), status: "booked" as const,     price: 350, notes: null, clients: { first_name: "Katarzyna",  last_name: "Nowak",       phone: "+48 987 654 321" }, services: { name: "Mezoterapia igłowa" },      staff_members: { name: "Joanna Lewandowska" } },
  { id: "d5",  start_time: demoTime(10, 0),  end_time: demoTime(11, 0),  status: "confirmed" as const, price: 200, notes: null, clients: { first_name: "Magdalena",  last_name: "Wiśniewska",  phone: "+48 555 123 456" }, services: { name: "Masaż relaksacyjny" },      staff_members: { name: "Aleksandra Dąbrowska" } },
  { id: "d6",  start_time: demoTime(10, 30), end_time: demoTime(11, 30), status: "confirmed" as const, price: 180, notes: null, clients: { first_name: "Dorota",     last_name: "Pawlak",      phone: "+48 503 456 789" }, services: { name: "Henna brwi i rzęs" },       staff_members: { name: "Maria Nowakowska" } },
  { id: "d7",  start_time: demoTime(11, 0),  end_time: demoTime(12, 0),  status: "confirmed" as const, price: 450, notes: null, clients: { first_name: "Ewa",        last_name: "Jabłońska",   phone: "+48 504 567 890" }, services: { name: "Botox — czoło + lwia zmarszczka" }, staff_members: { name: "Joanna Lewandowska" } },
  { id: "d8",  start_time: demoTime(12, 0),  end_time: demoTime(13, 0),  status: "confirmed" as const, price: 160, notes: null, clients: { first_name: "Grażyna",    last_name: "Tomczak",     phone: "+48 505 678 901" }, services: { name: "Manicure japoński" },       staff_members: { name: "Karolina Wiśniewska" } },
  { id: "d9",  start_time: demoTime(13, 0),  end_time: demoTime(14, 0),  status: "booked" as const,     price: 320, notes: null, clients: { first_name: "Izabela",    last_name: "Szymańska",   phone: "+48 506 789 012" }, services: { name: "Mikrodermabrazja" },        staff_members: { name: "Aleksandra Dąbrowska" } },
  { id: "d10", start_time: demoTime(13, 30), end_time: demoTime(14, 30), status: "confirmed" as const, price: 90,  notes: null, clients: { first_name: "Joanna",     last_name: "Zielińska",   phone: "+48 507 890 123" }, services: { name: "Regulacja brwi" },          staff_members: { name: "Maria Nowakowska" } },
  { id: "d11", start_time: demoTime(14, 0),  end_time: demoTime(15, 0),  status: "cancelled" as const,  price: 250, notes: null, clients: { first_name: "Karolina",   last_name: "Wójcik",      phone: "+48 508 901 234" }, services: { name: "Peeling chemiczny" },       staff_members: { name: "Joanna Lewandowska" } },
  { id: "d12", start_time: demoTime(15, 0),  end_time: demoTime(16, 0),  status: "confirmed" as const, price: 180, notes: null, clients: { first_name: "Laura",      last_name: "Kamińska",    phone: "+48 509 012 345" }, services: { name: "Przedłużanie rzęs 1:1" },  staff_members: { name: "Karolina Wiśniewska" } },
  { id: "d13", start_time: demoTime(15, 30), end_time: demoTime(16, 30), status: "confirmed" as const, price: 140, notes: null, clients: { first_name: "Monika",     last_name: "Olszewska",   phone: "+48 510 123 456" }, services: { name: "Depilacja woskiem — nogi" }, staff_members: { name: "Aleksandra Dąbrowska" } },
  { id: "d14", start_time: demoTime(16, 0),  end_time: demoTime(17, 0),  status: "confirmed" as const, price: 200, notes: null, clients: { first_name: "Natalia",    last_name: "Grabowska",   phone: "+48 511 234 567" }, services: { name: "Masaż twarzy kobido" },     staff_members: { name: "Maria Nowakowska" } },
];
const DEMO_TOP_SERVICES = [
  { name: "Manicure hybrydowy", count: 48, revenue: 5760 },
  { name: "Mezoterapia igłowa", count: 32, revenue: 11200 },
  { name: "Masaż relaksacyjny", count: 24, revenue: 4800 },
];
const DEMO_TOP_STAFF = [
  { name: "Maria Nowakowska", appointments: 56, revenue: 14200 },
  { name: "Karolina Wiśniewska", appointments: 42, revenue: 8400 },
  { name: "Joanna Lewandowska", appointments: 38, revenue: 7600 },
];

function CommunicationAlert({ salonId, onNavigate }: { salonId: string; onNavigate: (tab: string) => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    supabase.from("salons").select("communication_setup_completed").eq("id", salonId).single().then(({ data }) => {
      if (data && !(data as Record<string, unknown>).communication_setup_completed) setShow(true);
    });
  }, [salonId]);
  if (!show) return null;
  return (
    <Alert className="cursor-pointer border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20" onClick={() => onNavigate("settings")}>
      <Radio className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800 dark:text-amber-200">Skonfiguruj komunikację z klientkami</AlertTitle>
      <AlertDescription className="text-amber-700 dark:text-amber-300">
        Bez emaila i SMS klientki nie dostają przypomnień o wizytach → więcej no-show
      </AlertDescription>
    </Alert>
  );
}

export function DashboardHome({ onNavigate, isDemo = false }: DashboardHomeProps) {
  const { t, i18n } = useTranslation();
  const [quickSaleOpen, setQuickSaleOpen] = useState(false);
  const { salonId, isLoading: salonLoading } = useSalonId();
  const { alerts: stockAlerts, topSelling } = useStockAlerts(isDemo ? undefined : (salonId ?? undefined));
  const dateLocale = i18n.language === 'pl' ? pl : enUS;

  const today = new Date();
  const todayStart = startOfDay(today).toISOString();
  const todayEnd = endOfDay(today).toISOString();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }).toISOString();
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 }).toISOString();
  const monthStart = startOfMonth(today).toISOString();
  const monthEnd = endOfMonth(today).toISOString();

  // Salon slug for booking widget link
  const { data: salonSlug } = useQuery({
    queryKey: ["dashboard-salon-slug", salonId, isDemo],
    queryFn: async () => {
      if (isDemo) return "demo-salon";
      const { data } = await supabase
        .from("salons")
        .select("slug")
        .eq("id", salonId!)
        .single();
      return (data as any)?.slug as string | null;
    },
    enabled: isDemo || !!salonId,
  });

  // Today's appointments
  const { data: todayAppointments = [], isLoading: apptLoading } = useQuery({
    queryKey: ["dashboard-today-appointments", salonId, isDemo],
    queryFn: async () => {
      if (isDemo) return DEMO_APPOINTMENTS;
      const { data, error } = await supabase
        .from("appointments")
        .select("id, start_time, end_time, status, price, notes, clients(first_name, last_name, phone), services(name), staff_members(name)")
        .eq("salon_id", salonId!)
        .gte("start_time", todayStart)
        .lte("start_time", todayEnd)
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: isDemo || !!salonId,
  });

  // Today's revenue from transactions
  const { data: todayRevenue = 0 } = useQuery({
    queryKey: ["dashboard-today-revenue", salonId, isDemo],
    queryFn: async () => {
      if (isDemo) return 2450;
      const { data, error } = await supabase
        .from("transactions")
        .select("amount")
        .eq("salon_id", salonId!)
        .eq("type", "income")
        .gte("transaction_date", todayStart)
        .lte("transaction_date", todayEnd);
      if (error) throw error;
      return (data ?? []).reduce((s, t) => s + Number(t.amount), 0);
    },
    enabled: isDemo || !!salonId,
  });

  // Weekly occupancy
  const { data: weeklyStats } = useQuery({
    queryKey: ["dashboard-weekly-occupancy", salonId, isDemo],
    queryFn: async () => {
      if (isDemo) return { current: 34, previous: 28 };
      const { count: bookedThis } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("salon_id", salonId!)
        .gte("start_time", weekStart)
        .lte("start_time", weekEnd)
        .neq("status", "cancelled");
      
      const prevWeekStart = subWeeks(new Date(weekStart), 1).toISOString();
      const prevWeekEnd = subWeeks(new Date(weekEnd), 1).toISOString();
      const { count: bookedPrev } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("salon_id", salonId!)
        .gte("start_time", prevWeekStart)
        .lte("start_time", prevWeekEnd)
        .neq("status", "cancelled");

      return { current: bookedThis ?? 0, previous: bookedPrev ?? 0 };
    },
    enabled: isDemo || !!salonId,
  });

  // Monthly no-shows
  const { data: monthlyNoShows } = useQuery({
    queryKey: ["dashboard-monthly-noshows", salonId, isDemo],
    queryFn: async () => {
      if (isDemo) return { current: 2, previous: 4 };
      const { count: noShows } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("salon_id", salonId!)
        .eq("status", "no_show")
        .gte("start_time", monthStart)
        .lte("start_time", monthEnd);

      const prevMonthStart = startOfMonth(subMonths(today, 1)).toISOString();
      const prevMonthEnd = endOfMonth(subMonths(today, 1)).toISOString();
      const { count: prevNoShows } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("salon_id", salonId!)
        .eq("status", "no_show")
        .gte("start_time", prevMonthStart)
        .lte("start_time", prevMonthEnd);

      return { current: noShows ?? 0, previous: prevNoShows ?? 0 };
    },
    enabled: isDemo || !!salonId,
  });

  // Top services this month
  const { data: topServices = [] } = useQuery({
    queryKey: ["dashboard-top-services", salonId, isDemo],
    queryFn: async () => {
      if (isDemo) return DEMO_TOP_SERVICES;
      const { data, error } = await supabase
        .from("appointments")
        .select("service_id, price, services(name)")
        .eq("salon_id", salonId!)
        .gte("start_time", monthStart)
        .lte("start_time", monthEnd)
        .in("status", ["booked", "confirmed", "completed"]);
      if (error) throw error;

      const grouped: Record<string, { name: string; count: number; revenue: number }> = {};
      for (const a of data ?? []) {
        const name = (a.services as { name: string } | null)?.name ?? t('dashboardExtra.service');
        if (!grouped[a.service_id]) grouped[a.service_id] = { name, count: 0, revenue: 0 };
        grouped[a.service_id].count++;
        grouped[a.service_id].revenue += Number(a.price ?? 0);
      }
      return Object.values(grouped).sort((a, b) => b.count - a.count).slice(0, 3);
    },
    enabled: isDemo || !!salonId,
  });

  // Top staff this month
  const { data: topStaff = [] } = useQuery({
    queryKey: ["dashboard-top-staff", salonId, isDemo],
    queryFn: async () => {
      if (isDemo) return DEMO_TOP_STAFF;
      const { data, error } = await supabase
        .from("appointments")
        .select("staff_id, price, staff_members(name)")
        .eq("salon_id", salonId!)
        .gte("start_time", monthStart)
        .lte("start_time", monthEnd)
        .in("status", ["booked", "confirmed", "completed"]);
      if (error) throw error;

      const grouped: Record<string, { name: string; appointments: number; revenue: number }> = {};
      for (const a of data ?? []) {
        const name = (a.staff_members as { name: string } | null)?.name ?? t('dashboardExtra.employee');
        if (!grouped[a.staff_id]) grouped[a.staff_id] = { name, appointments: 0, revenue: 0 };
        grouped[a.staff_id].appointments++;
        grouped[a.staff_id].revenue += Number(a.price ?? 0);
      }
      return Object.values(grouped).sort((a, b) => b.appointments - a.appointments).slice(0, 3);
    },
    enabled: isDemo || !!salonId,
  });

  const confirmedCount = todayAppointments.filter((a) => a.status === "confirmed" || a.status === "completed").length;
  const pendingCount = todayAppointments.filter((a) => a.status === "booked").length;
  const estimatedRevenue = todayAppointments
    .filter((a) => a.status !== "cancelled")
    .reduce((s, a) => s + Number(a.price ?? 0), 0);

  const isEmpty = !isDemo && !apptLoading && todayAppointments.length === 0 && topServices.length === 0;

  const handleNavigate = (tab: string) => {
    onNavigate?.(tab);
  };

  return (
    <div className="space-y-6">
      <SectionGuide sectionKey="home" />

      {/* Communication setup alert */}
      {!isDemo && salonId && (
        <CommunicationAlert salonId={salonId} onNavigate={handleNavigate} />
      )}

      {/* Setup Checklist */}
      {!isDemo && salonId && <SetupChecklist salonId={salonId} onNavigate={handleNavigate} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold">{t('dashboard.welcome')} 👋</h2>
          <p className="text-muted-foreground">{t('dashboard.summary')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setQuickSaleOpen(true)}>
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">{t('products.quickSale')}</span>
          </Button>
          <Button size="sm" className="gap-2" onClick={() => {
            const slug = salonSlug || 'demo-salon';
            window.open(`${window.location.origin}/book/${slug}`, '_blank');
          }}>
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Otwórz kalendarz</span>
            <span className="sm:hidden">Kalendarz</span>
          </Button>
          <Badge variant="outline" className="gap-1">
            <Calendar className="w-3 h-3" />
            {format(today, "EEEE, d MMMM", { locale: dateLocale })}
          </Badge>
        </div>
      </div>

      <QuickProductSale open={quickSaleOpen} onOpenChange={setQuickSaleOpen} isDemo={isDemo} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.todayAppointments')}</CardTitle>
            <Calendar className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            {apptLoading ? <Skeleton className="h-9 w-16" /> : (
              <>
                <div className="text-3xl font-bold font-serif">{todayAppointments.length}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{confirmedCount} {t('dashboard.confirmed')}</span>
                  {pendingCount > 0 && (
                    <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/50">
                      {pendingCount} {t('dashboard.pending')}
                    </Badge>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.estimatedRevenue')}</CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">{estimatedRevenue || todayRevenue} zł</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('dashboard.fromVisits', { count: todayAppointments.filter(a => a.status !== "cancelled").length })}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.weeklyOccupancy')}</CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">{weeklyStats?.current ?? 0}</div>
            <div className="flex items-center gap-1 mt-1">
              {(weeklyStats?.current ?? 0) >= (weeklyStats?.previous ?? 0) ? (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  +{(weeklyStats?.current ?? 0) - (weeklyStats?.previous ?? 0)} {t('dashboard.vsPreviousWeek')}
                </span>
              ) : (
                <span className="text-xs text-red-600 flex items-center gap-1">
                  <ArrowDownRight className="w-3 h-3" />
                  {(weeklyStats?.current ?? 0) - (weeklyStats?.previous ?? 0)} {t('dashboard.vsPreviousWeek')}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.monthlyNoShows')}</CardTitle>
            <UserX className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">{monthlyNoShows?.current ?? 0}</div>
            <div className="flex items-center gap-1 mt-1">
              {(monthlyNoShows?.current ?? 0) <= (monthlyNoShows?.previous ?? 0) ? (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <ArrowDownRight className="w-3 h-3" />
                  {t('dashboardExtra.betterThanLastMonth')}
                </span>
              ) : (
                <span className="text-xs text-red-600 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  {t('dashboardExtra.worseThanLastMonth')}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's appointments + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's appointments list */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-serif">{t('dashboard.todayAppointments')}</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary" onClick={() => handleNavigate("calendar")}>
              {t('dashboard.viewAll')}
            </Button>
          </CardHeader>
          <CardContent>
            {apptLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
              </div>
            ) : todayAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground font-medium">{t('dashboardExtra.noAppointmentsToday')}</p>
                <p className="text-sm text-muted-foreground mt-1">{t('dashboardExtra.addAppointmentHint')}</p>
                <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={() => handleNavigate("calendar")}>
                  <Plus className="w-4 h-4" />
                  {t('dashboardExtra.openCalendar')}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.slice(0, 8).map((appointment) => {
                  const client = appointment.clients as { first_name: string; last_name: string; phone: string } | null;
                  const service = appointment.services as { name: string } | null;
                  const staff = appointment.staff_members as { name: string } | null;
                  const time = format(new Date(appointment.start_time), "HH:mm");

                  return (
                    <div
                      key={appointment.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border transition-colors",
                        appointment.status === "cancelled" && "bg-muted/50 opacity-60",
                        appointment.status === "booked" && "border-amber-200 bg-amber-50/30 dark:border-amber-900/50 dark:bg-amber-950/10",
                        (appointment.status === "confirmed" || appointment.status === "completed") && "border-border hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-center min-w-[50px]">
                          <div className="text-sm font-semibold">{time}</div>
                        </div>
                        <div className="h-10 w-px bg-border" />
                        <div>
                          <div className="font-medium">{client ? `${client.first_name} ${client.last_name}` : t('dashboardExtra.client')}</div>
                          <div className="text-sm text-muted-foreground">
                            {service?.name ?? t('dashboardExtra.service')} • {staff?.name ?? t('dashboardExtra.employee')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(appointment.status === "confirmed" || appointment.status === "completed") && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {t('dashboard.appointmentStatus.confirmed')}
                          </Badge>
                        )}
                        {appointment.status === "booked" && (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                            <Clock className="w-3 h-3 mr-1" />
                            {t('dashboard.appointmentStatus.pending')}
                          </Badge>
                        )}
                        {appointment.status === "cancelled" && (
                          <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200">
                            <XCircle className="w-3 h-3 mr-1" />
                            {t('dashboard.appointmentStatus.cancelled')}
                          </Badge>
                        )}
                        {client?.phone && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <a href={`tel:${client.phone}`}><Phone className="w-4 h-4" /></a>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column: top services + top staff */}
        <div className="space-y-6">
          {/* Top services */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {t('dashboard.topServices')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topServices.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">{t('dashboardExtra.noDataServices')}</p>
                  <Button variant="ghost" size="sm" className="mt-2" onClick={() => handleNavigate("services")}>
                    {t('dashboardExtra.addServices')}
                  </Button>
                </div>
              ) : (
                topServices.map((service, i) => (
                  <div key={service.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                          i === 0 && "bg-amber-100 text-amber-800",
                          i === 1 && "bg-gray-100 text-gray-800",
                          i === 2 && "bg-orange-100 text-orange-800"
                        )}>{i + 1}</span>
                        <span className="font-medium text-sm">{service.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{service.count} {t('dashboard.reservations')}</span>
                      <span>{service.revenue} zł</span>
                    </div>
                    <Progress value={topServices[0] ? (service.count / topServices[0].count) * 100 : 0} className="h-1.5" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Top staff */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                {t('dashboard.topStaff')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topStaff.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">{t('dashboardExtra.noDataStaff')}</p>
                  <Button variant="ghost" size="sm" className="mt-2" onClick={() => handleNavigate("staff")}>
                    {t('dashboardExtra.addStaff')}
                  </Button>
                </div>
              ) : (
                topStaff.map((staff, i) => (
                  <div key={staff.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                        i === 0 && "bg-gradient-to-r from-primary to-secondary text-primary-foreground",
                        i !== 0 && "bg-muted text-muted-foreground"
                      )}>
                        {staff.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{staff.name}</div>
                        <div className="text-xs text-muted-foreground">{staff.appointments} {t('dashboard.visits')}</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-primary">{staff.revenue} zł</div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Revenue Prediction */}
      <RevenuePredictionCard salonId={salonId ?? undefined} isDemo={isDemo} />

      {/* Retention Flow Widget */}
      <RetentionFlowWidget onNavigate={handleNavigate} isDemo={isDemo} />

      {/* Today's Staff Widget */}
      <TodayStaffCard salonId={salonId} isDemo={isDemo} />

      {/* Weekly Brief Widget */}
      <WeeklyBriefWidget isDemo={isDemo} />

      {/* Stock Alerts */}
      <StockAlertsCard alerts={stockAlerts} topSelling={topSelling} />
    </div>
  );
}

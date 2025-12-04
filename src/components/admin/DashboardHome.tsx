import { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  Calendar, Users, TrendingUp, AlertCircle, Clock, 
  DollarSign, UserX, Sparkles, ArrowUpRight, ArrowDownRight,
  Phone, CheckCircle2, XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Mock data - w przyszłości z bazy danych
const todayAppointments = [
  { id: "1", time: "09:00", client: "Anna Kowalska", service: "Manicure hybrydowy", staff: "Maria", status: "confirmed", phone: "+48 123 456 789" },
  { id: "2", time: "10:30", client: "Katarzyna Nowak", service: "Mezoterapia twarzy", staff: "Joanna", status: "pending", phone: "+48 987 654 321" },
  { id: "3", time: "12:00", client: "Magdalena Wiśniewska", service: "Depilacja laserowa", staff: "Maria", status: "confirmed", phone: "+48 555 123 456" },
  { id: "4", time: "14:00", client: "Ewa Dąbrowska", service: "Pedicure klasyczny", staff: "Anna", status: "pending", phone: "+48 111 222 333" },
  { id: "5", time: "15:30", client: "Zofia Lewandowska", service: "Makijaż permanentny", staff: "Joanna", status: "confirmed", phone: "+48 444 555 666" },
  { id: "6", time: "17:00", client: "Aleksandra Wójcik", service: "Lifting twarzy", staff: "Maria", status: "cancelled", phone: "+48 777 888 999" },
];

const weeklyStats = {
  totalSlots: 168,
  bookedSlots: 89,
  occupancyRate: 53,
  previousWeekRate: 48,
};

const monthlyStats = {
  noShows: 4,
  totalAppointments: 156,
  noShowRate: 2.6,
  previousMonthRate: 3.1,
};

const topServices = [
  { name: "Manicure hybrydowy", count: 45, revenue: 4500, trend: "up" },
  { name: "Mezoterapia twarzy", count: 28, revenue: 8400, trend: "up" },
  { name: "Depilacja laserowa", count: 22, revenue: 6600, trend: "down" },
];

const topStaff = [
  { name: "Maria Kowalczyk", appointments: 52, revenue: 7800 },
  { name: "Joanna Nowak", appointments: 48, revenue: 9600 },
  { name: "Anna Wiśniewska", appointments: 35, revenue: 5250 },
];

export function DashboardHome() {
  const { t, i18n } = useTranslation();
  
  const alerts = [
    { type: "warning", message: i18n.language === 'pl' ? "2 klientki nie potwierdziły wizyty" : "2 clients haven't confirmed", count: 2 },
    { type: "error", message: i18n.language === 'pl' ? "1 wizyta została anulowana" : "1 appointment cancelled", count: 1 },
    { type: "info", message: i18n.language === 'pl' ? "3 nowe rezerwacje z ostatniej godziny" : "3 new bookings in the last hour", count: 3 },
  ];

  const todayRevenue = todayAppointments
    .filter(a => a.status !== "cancelled")
    .reduce((sum) => sum + 150, 0);

  const confirmedCount = todayAppointments.filter(a => a.status === "confirmed").length;
  const pendingCount = todayAppointments.filter(a => a.status === "pending").length;
  const cancelledCount = todayAppointments.filter(a => a.status === "cancelled").length;

  return (
    <div className="space-y-6">
      {/* Nagłówek z datą */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold">{t('dashboard.welcome')} 👋</h2>
          <p className="text-muted-foreground">
            {t('dashboard.summary')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Calendar className="w-3 h-3" />
            {new Date().toLocaleDateString(i18n.language === 'pl' ? 'pl-PL' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Badge>
        </div>
      </div>

      {/* Alerty - co wymaga uwagi */}
      {alerts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              {t('dashboard.attentionRequired')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {alerts.map((alert, i) => (
                <Badge 
                  key={i}
                  variant="secondary"
                  className={cn(
                    "gap-1",
                    alert.type === "warning" && "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
                    alert.type === "error" && "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
                    alert.type === "info" && "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                  )}
                >
                  {alert.message}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Główne KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dzisiejsze wizyty */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('dashboard.todayAppointments')}
            </CardTitle>
            <Calendar className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">{todayAppointments.length}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {confirmedCount} {t('dashboard.confirmed')}
              </span>
              {pendingCount > 0 && (
                <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/50">
                  {pendingCount} {t('dashboard.pending')}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Przychód dzienny */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('dashboard.estimatedRevenue')}
            </CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">{todayRevenue} zł</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('dashboard.fromVisits', { count: todayAppointments.length - cancelledCount })}
            </p>
          </CardContent>
        </Card>

        {/* Obłożenie tygodnia */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('dashboard.weeklyOccupancy')}
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">{weeklyStats.occupancyRate}%</div>
            <div className="flex items-center gap-1 mt-1">
              {weeklyStats.occupancyRate > weeklyStats.previousWeekRate ? (
                <>
                  <ArrowUpRight className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">
                    +{weeklyStats.occupancyRate - weeklyStats.previousWeekRate}% {t('dashboard.vsPreviousWeek')}
                  </span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-3 h-3 text-red-600" />
                  <span className="text-xs text-red-600">
                    {weeklyStats.occupancyRate - weeklyStats.previousWeekRate}% {t('dashboard.vsPreviousWeek')}
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* No-shows */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('dashboard.monthlyNoShows')}
            </CardTitle>
            <UserX className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">{monthlyStats.noShows}</div>
            <div className="flex items-center gap-1 mt-1">
              {monthlyStats.noShowRate < monthlyStats.previousMonthRate ? (
                <>
                  <ArrowDownRight className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">
                    {monthlyStats.noShowRate}% ({t('dashboard.was')} {monthlyStats.previousMonthRate}%)
                  </span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-3 h-3 text-red-600" />
                  <span className="text-xs text-red-600">
                    {monthlyStats.noShowRate}% ({t('dashboard.was')} {monthlyStats.previousMonthRate}%)
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sekcja dolna - 3 kolumny */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dzisiejsze wizyty - lista */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-serif">{t('dashboard.todayAppointments')}</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary">
              {t('dashboard.viewAll')}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayAppointments.slice(0, 5).map((appointment) => (
                <div 
                  key={appointment.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-colors",
                    appointment.status === "cancelled" && "bg-muted/50 opacity-60",
                    appointment.status === "pending" && "border-amber-200 bg-amber-50/30 dark:border-amber-900/50 dark:bg-amber-950/10",
                    appointment.status === "confirmed" && "border-border hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center min-w-[50px]">
                      <div className="text-sm font-semibold">{appointment.time}</div>
                    </div>
                    <div className="h-10 w-px bg-border" />
                    <div>
                      <div className="font-medium">{appointment.client}</div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.service} • {appointment.staff}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {appointment.status === "confirmed" && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {t('dashboard.appointmentStatus.confirmed')}
                      </Badge>
                    )}
                    {appointment.status === "pending" && (
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
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* TOP usługi i personel */}
        <div className="space-y-6">
          {/* TOP 3 usługi */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {t('dashboard.topServices')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topServices.map((service, i) => (
                <div key={service.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                        i === 0 && "bg-amber-100 text-amber-800",
                        i === 1 && "bg-gray-100 text-gray-800",
                        i === 2 && "bg-orange-100 text-orange-800"
                      )}>
                        {i + 1}
                      </span>
                      <span className="font-medium text-sm">{service.name}</span>
                    </div>
                    {service.trend === "up" ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{service.count} {t('dashboard.reservations')}</span>
                    <span>{service.revenue} zł</span>
                  </div>
                  <Progress value={(service.count / topServices[0].count) * 100} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* TOP personel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                {t('dashboard.topStaff')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topStaff.map((staff, i) => (
                <div key={staff.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                      i === 0 && "bg-gradient-to-r from-primary to-secondary text-primary-foreground",
                      i === 1 && "bg-muted text-muted-foreground",
                      i === 2 && "bg-muted text-muted-foreground"
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
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

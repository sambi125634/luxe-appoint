import { useState } from "react";
import {
  TrendingUp, TrendingDown, Download, Calendar, Users,
  DollarSign, UserX, BarChart3, PieChart, Clock, Sparkles,
  ArrowUpRight, ArrowDownRight, Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart
} from "recharts";
import { cn } from "@/lib/utils";
import {
  exportAppointments, exportServices, exportStaff, exportNoShows, exportFullReport,
  type AppointmentExportData, type ServiceExportData, type StaffExportData, type NoShowExportData
} from "@/lib/csvExport";

// Mock data - będzie zastąpione danymi z bazy
const revenueData = {
  daily: [
    { name: "Pon", przychod: 1200, wizyty: 8 },
    { name: "Wt", przychod: 980, wizyty: 6 },
    { name: "Śr", przychod: 1450, wizyty: 10 },
    { name: "Czw", przychod: 1100, wizyty: 7 },
    { name: "Pt", przychod: 1680, wizyty: 12 },
    { name: "Sob", przychod: 2100, wizyty: 15 },
    { name: "Ndz", przychod: 0, wizyty: 0 },
  ],
  weekly: [
    { name: "Tydz 1", przychod: 7500, wizyty: 52 },
    { name: "Tydz 2", przychod: 8200, wizyty: 58 },
    { name: "Tydz 3", przychod: 7100, wizyty: 48 },
    { name: "Tydz 4", przychod: 9400, wizyty: 65 },
  ],
  monthly: [
    { name: "Sty", przychod: 28500, wizyty: 195 },
    { name: "Lut", przychod: 31200, wizyty: 212 },
    { name: "Mar", przychod: 29800, wizyty: 203 },
    { name: "Kwi", przychod: 34500, wizyty: 238 },
    { name: "Maj", przychod: 32100, wizyty: 221 },
    { name: "Cze", przychod: 35800, wizyty: 246 },
  ],
};

const topServicesData = [
  { name: "Manicure hybrydowy", count: 89, revenue: 8900, trend: 12, color: "hsl(var(--primary))" },
  { name: "Mezoterapia twarzy", count: 56, revenue: 16800, trend: 8, color: "hsl(var(--secondary))" },
  { name: "Depilacja laserowa", count: 48, revenue: 14400, trend: -3, color: "hsl(var(--accent))" },
  { name: "Pedicure klasyczny", count: 42, revenue: 4200, trend: 5, color: "hsl(var(--violet-light))" },
  { name: "Makijaż permanentny", count: 28, revenue: 11200, trend: 15, color: "hsl(var(--burgundy-light))" },
];

const topStaffData = [
  { name: "Maria Kowalczyk", appointments: 98, revenue: 14700, occupancy: 78, avatar: "MK" },
  { name: "Joanna Nowak", appointments: 85, revenue: 17000, occupancy: 72, avatar: "JN" },
  { name: "Anna Wiśniewska", appointments: 72, revenue: 10800, occupancy: 65, avatar: "AW" },
  { name: "Katarzyna Dąbrowska", appointments: 65, revenue: 9750, occupancy: 58, avatar: "KD" },
  { name: "Ewa Zielińska", appointments: 52, revenue: 7800, occupancy: 48, avatar: "EZ" },
];

const occupancyByDay = [
  { name: "Pon", value: 65 },
  { name: "Wt", value: 58 },
  { name: "Śr", value: 72 },
  { name: "Czw", value: 68 },
  { name: "Pt", value: 85 },
  { name: "Sob", value: 92 },
  { name: "Ndz", value: 0 },
];

const occupancyByHour = [
  { hour: "9:00", value: 45 },
  { hour: "10:00", value: 78 },
  { hour: "11:00", value: 85 },
  { hour: "12:00", value: 62 },
  { hour: "13:00", value: 48 },
  { hour: "14:00", value: 72 },
  { hour: "15:00", value: 88 },
  { hour: "16:00", value: 92 },
  { hour: "17:00", value: 75 },
  { hour: "18:00", value: 55 },
];

const noShowsData = [
  { name: "Sty", noShows: 5, rate: 2.5 },
  { name: "Lut", noShows: 3, rate: 1.4 },
  { name: "Mar", noShows: 7, rate: 3.4 },
  { name: "Kwi", noShows: 4, rate: 1.7 },
  { name: "Maj", noShows: 6, rate: 2.7 },
  { name: "Cze", noShows: 3, rate: 1.2 },
];

const noShowClients = [
  { name: "Monika Zawadzka", count: 3, lastDate: "2024-01-15", phone: "+48 555 111 222" },
  { name: "Agnieszka Krawczyk", count: 2, lastDate: "2024-01-10", phone: "+48 555 333 444" },
  { name: "Beata Sikora", count: 2, lastDate: "2024-01-08", phone: "+48 555 555 666" },
];

const serviceCategories = [
  { name: "Twarz", value: 35, color: "hsl(var(--primary))" },
  { name: "Ciało", value: 28, color: "hsl(var(--secondary))" },
  { name: "Paznokcie", value: 25, color: "hsl(var(--accent))" },
  { name: "Inne", value: 12, color: "hsl(var(--muted-foreground))" },
];

type TimePeriod = "daily" | "weekly" | "monthly";

export function StatsModule() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("weekly");

  const currentRevenue = revenueData[timePeriod];
  const totalRevenue = currentRevenue.reduce((sum, d) => sum + d.przychod, 0);
  const totalAppointments = currentRevenue.reduce((sum, d) => sum + d.wizyty, 0);
  const avgOccupancy = Math.round(occupancyByDay.reduce((sum, d) => sum + d.value, 0) / 6); // exclude Sunday

  // Export handlers
  const handleExportAppointments = () => {
    const data: AppointmentExportData[] = [
      { date: "2024-01-15", time: "09:00", client: "Anna Kowalska", service: "Manicure hybrydowy", staff: "Maria K.", status: "completed", revenue: 100 },
      { date: "2024-01-15", time: "10:30", client: "Katarzyna Nowak", service: "Mezoterapia twarzy", staff: "Joanna N.", status: "completed", revenue: 300 },
      // ... więcej danych z bazy
    ];
    exportAppointments(data);
  };

  const handleExportServices = () => {
    const data: ServiceExportData[] = topServicesData.map(s => ({
      name: s.name,
      bookings: s.count,
      revenue: s.revenue,
      avgPrice: Math.round(s.revenue / s.count)
    }));
    exportServices(data);
  };

  const handleExportStaff = () => {
    const data: StaffExportData[] = topStaffData.map(s => ({
      name: s.name,
      appointments: s.appointments,
      revenue: s.revenue,
      occupancy: s.occupancy,
      noShows: Math.round(s.appointments * 0.02)
    }));
    exportStaff(data);
  };

  const handleExportNoShows = () => {
    const data: NoShowExportData[] = noShowClients.map(c => ({
      date: c.lastDate,
      client: c.name,
      phone: c.phone,
      service: "Manicure hybrydowy",
      staff: "Maria K."
    }));
    exportNoShows(data);
  };

  const handleExportFull = () => {
    const appointments: AppointmentExportData[] = [];
    const services: ServiceExportData[] = topServicesData.map(s => ({
      name: s.name, bookings: s.count, revenue: s.revenue, avgPrice: Math.round(s.revenue / s.count)
    }));
    const staff: StaffExportData[] = topStaffData.map(s => ({
      name: s.name, appointments: s.appointments, revenue: s.revenue, occupancy: s.occupancy, noShows: 0
    }));
    exportFullReport(appointments, services, staff, { from: "2024-01-01", to: "2024-01-31" });
  };

  return (
    <div className="space-y-6">
      {/* Header with period selector and export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Statystyki
          </h2>
          <p className="text-muted-foreground">
            Analiza wyników Twojego salonu
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Dzienny</SelectItem>
              <SelectItem value="weekly">Tygodniowy</SelectItem>
              <SelectItem value="monthly">Miesięczny</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Eksportuj
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleExportFull}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Pełny raport
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportAppointments}>
                <Calendar className="w-4 h-4 mr-2" />
                Wizyty
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportServices}>
                <Sparkles className="w-4 h-4 mr-2" />
                Usługi
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportStaff}>
                <Users className="w-4 h-4 mr-2" />
                Personel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportNoShows}>
                <UserX className="w-4 h-4 mr-2" />
                No-shows
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Przychód ({timePeriod === "daily" ? "tydzień" : timePeriod === "weekly" ? "miesiąc" : "6 mies."})
            </CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">{totalRevenue.toLocaleString('pl-PL')} zł</div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3 text-green-600" />
              <span className="text-xs text-green-600">+12% vs poprzedni okres</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Wizyty
            </CardTitle>
            <Calendar className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">{totalAppointments}</div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3 text-green-600" />
              <span className="text-xs text-green-600">+8% vs poprzedni okres</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Śr. obłożenie
            </CardTitle>
            <PieChart className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">{avgOccupancy}%</div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3 text-green-600" />
              <span className="text-xs text-green-600">+5% vs poprzedni okres</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              No-show rate
            </CardTitle>
            <UserX className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">1.8%</div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowDownRight className="w-3 h-3 text-green-600" />
              <span className="text-xs text-green-600">-0.5% vs poprzedni okres</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart - takes 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-serif">Przychód w czasie</CardTitle>
            <CardDescription>
              Analiza przychodów i liczby wizyt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentRevenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number, name: string) => [
                      name === 'przychod' ? `${value.toLocaleString('pl-PL')} zł` : value,
                      name === 'przychod' ? 'Przychód' : 'Wizyty'
                    ]}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="przychod" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)"
                    name="Przychód"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="wizyty" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--secondary))' }}
                    name="Wizyty"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Service Categories Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-serif">Kategorie usług</CardTitle>
            <CardDescription>Podział przychodów wg kategorii</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={serviceCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {serviceCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Udział']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {serviceCategories.map((cat) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-sm">{cat.name}</span>
                  <span className="text-sm text-muted-foreground ml-auto">{cat.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed views */}
      <Tabs defaultValue="services" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="services">TOP Usługi</TabsTrigger>
          <TabsTrigger value="staff">TOP Personel</TabsTrigger>
          <TabsTrigger value="occupancy">Obłożenie</TabsTrigger>
          <TabsTrigger value="noshows">No-shows</TabsTrigger>
        </TabsList>

        {/* TOP Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-serif">TOP 5 Usługi</CardTitle>
                <CardDescription>Najczęściej rezerwowane usługi</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={handleExportServices}>
                <Download className="w-4 h-4 mr-2" />
                Eksportuj
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topServicesData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="name" type="category" width={150} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number, name: string) => [
                        name === 'count' ? value : `${value.toLocaleString('pl-PL')} zł`,
                        name === 'count' ? 'Rezerwacje' : 'Przychód'
                      ]}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Rezerwacje" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {topServicesData.map((service, i) => (
                  <div key={service.name} className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                        i === 0 && "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
                        i === 1 && "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
                        i === 2 && "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200",
                        i > 2 && "bg-muted text-muted-foreground"
                      )}>
                        {i + 1}
                      </span>
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {service.count} rezerwacji • {service.revenue.toLocaleString('pl-PL')} zł
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {service.trend > 0 ? (
                        <>
                          <ArrowUpRight className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600">+{service.trend}%</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-red-600">{service.trend}%</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TOP Staff Tab */}
        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-serif">TOP 5 Personel</CardTitle>
                <CardDescription>Ranking pracowników wg przychodu</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={handleExportStaff}>
                <Download className="w-4 h-4 mr-2" />
                Eksportuj
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topStaffData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 10 }} />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number, name: string) => [
                        name === 'revenue' ? `${value.toLocaleString('pl-PL')} zł` : `${value}%`,
                        name === 'revenue' ? 'Przychód' : 'Obłożenie'
                      ]}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Przychód" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {topStaffData.map((staff, i) => (
                  <div key={staff.name} className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                        i === 0 && "bg-gradient-to-r from-primary to-secondary text-primary-foreground",
                        i > 0 && "bg-muted text-muted-foreground"
                      )}>
                        {staff.avatar}
                      </div>
                      <div>
                        <div className="font-medium">{staff.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {staff.appointments} wizyt • {staff.revenue.toLocaleString('pl-PL')} zł
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-primary">{staff.occupancy}%</div>
                      <div className="text-xs text-muted-foreground">obłożenie</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Occupancy Tab */}
        <TabsContent value="occupancy" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-serif">Obłożenie wg dnia tygodnia</CardTitle>
                <CardDescription>Średnie wykorzystanie grafiku</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={occupancyByDay}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" domain={[0, 100]} />
                      <Tooltip 
                        formatter={(value: number) => [`${value}%`, 'Obłożenie']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-serif">Obłożenie wg godziny</CardTitle>
                <CardDescription>Najbardziej popularne godziny</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={occupancyByHour}>
                      <defs>
                        <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="hour" className="text-xs" />
                      <YAxis className="text-xs" domain={[0, 100]} />
                      <Tooltip 
                        formatter={(value: number) => [`${value}%`, 'Obłożenie']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="hsl(var(--secondary))" 
                        fillOpacity={1} 
                        fill="url(#colorOccupancy)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-medium">Hot hours:</span>
                    <Badge variant="secondary">15:00-17:00</Badge>
                    <span className="text-muted-foreground">najwyższe obłożenie</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* No-shows Tab */}
        <TabsContent value="noshows" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-serif">Trend No-shows</CardTitle>
                  <CardDescription>Niestawienia się na wizyty w czasie</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={handleExportNoShows}>
                  <Download className="w-4 h-4 mr-2" />
                  Eksportuj
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={noShowsData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          name === 'noShows' ? value : `${value}%`,
                          name === 'noShows' ? 'No-shows' : 'Procent'
                        ]}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="noShows" 
                        stroke="hsl(var(--destructive))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--destructive))' }}
                        name="No-shows"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="rate" 
                        stroke="hsl(var(--muted-foreground))" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Procent"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <UserX className="w-5 h-5 text-destructive" />
                  Klienci z no-shows
                </CardTitle>
                <CardDescription>Osoby wymagające uwagi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {noShowClients.map((client) => (
                    <div key={client.name} className="flex items-center justify-between p-3 rounded-xl border border-destructive/30 bg-destructive/5">
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {client.phone} • Ostatni: {client.lastDate}
                        </div>
                      </div>
                      <Badge variant="destructive">{client.count} no-shows</Badge>
                    </div>
                  ))}
                </div>

                {noShowClients.length > 0 && (
                  <div className="mt-4 p-3 rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      💡 Rozważ wprowadzenie polityki depozytów lub przypomnienia SMS dla tych klientów
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

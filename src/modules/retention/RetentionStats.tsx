import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BarChart3, Eye, MousePointer, CalendarCheck, DollarSign, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";

interface RetentionStatsProps {
  isDemo?: boolean;
  activeSequencesCount?: number;
  onTabChange?: (tab: string) => void;
}

const DEMO_KPI = {
  openRate: { value: 47, total: 47, sent: 100, benchmark: 32 },
  ctr: { value: 12, total: 12, sent: 100, benchmark: 8 },
  conversionRate: { value: 8, total: 8, sent: 100, benchmark: 5 },
  revenueRecovered: { value: 3750, trend: 18 },
};

const DEMO_SEQ_STATS = [
  { name: "🔮 Zanim odejdzie", sent: 15, openRate: 62, ctr: 18, conversion: 14, revenue: 1200 },
  { name: "🌸 45 dni", sent: 28, openRate: 51, ctr: 14, conversion: 9, revenue: 980 },
  { name: "📚 60 dni", sent: 22, openRate: 44, ctr: 11, conversion: 7, revenue: 750 },
  { name: "🎁 75 dni", sent: 18, openRate: 38, ctr: 15, conversion: 6, revenue: 520 },
  { name: "🚨 90 dni", sent: 17, openRate: 28, ctr: 5, conversion: 2, revenue: 300 },
];

const DEMO_HOURLY = Array.from({ length: 24 }, (_, h) => ({
  hour: `${h}:00`,
  opens: h >= 8 && h <= 20 ? Math.floor(Math.random() * 15 + (h >= 10 && h <= 14 ? 10 : 2)) : Math.floor(Math.random() * 3),
}));
const bestHour = DEMO_HOURLY.reduce((max, h) => h.opens > max.opens ? h : max, DEMO_HOURLY[0]);

const DEMO_MONTHLY = [
  { month: "Paź", sent: 12, opened: 5, conversions: 1 },
  { month: "Lis", sent: 28, opened: 14, conversions: 3 },
  { month: "Gru", sent: 35, opened: 18, conversions: 4 },
  { month: "Sty", sent: 42, opened: 22, conversions: 5 },
  { month: "Lut", sent: 55, opened: 28, conversions: 7 },
  { month: "Mar", sent: 68, opened: 35, conversions: 8 },
];

const DEMO_TOP_REACTIVATED = [
  { name: "Anna K.", initials: "AK", daysAway: 67, sequence: "60 dni", revenue: 250 },
  { name: "Maria N.", initials: "MN", daysAway: 48, sequence: "45 dni", revenue: 180 },
  { name: "Paulina Z.", initials: "PZ", daysAway: 46, sequence: "45 dni", revenue: 180 },
  { name: "Ewa S.", initials: "ES", daysAway: 72, sequence: "75 dni", revenue: 320 },
  { name: "Marta K.", initials: "MK", daysAway: 55, sequence: "60 dni", revenue: 250 },
];

export function RetentionStats({ isDemo = false, activeSequencesCount = 0, onTabChange }: RetentionStatsProps) {
  // Only show populated stats in true demo mode; real accounts get the empty state
  // until real tracking data is wired in.
  const hasData = isDemo;

  if (!hasData) {
    return (
      <div className="text-center py-16 bg-muted/30 rounded-2xl">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <BarChart3 className="w-10 h-10 text-primary" />
        </div>
        <h3 className="font-serif font-bold text-lg mb-2">Statystyki pojawią się tutaj</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Gdy system wyśle pierwsze wiadomości reaktywacyjne — zobaczysz tu otwarcia, kliknięcia i konwersje w czasie rzeczywistym.
        </p>
        <div className="mt-6 text-sm text-muted-foreground">
          Sekwencje aktywne: <span className="font-semibold text-primary ml-1">{activeSequencesCount} z 5</span>
        </div>
        <Button className="mt-4" onClick={() => onTabChange?.("sequences")}>
          Skonfiguruj sekwencje →
        </Button>
      </div>
    );
  }

  const kpi = DEMO_KPI;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <Badge variant="outline" className={cn("text-xs", kpi.openRate.value > kpi.openRate.benchmark ? "text-emerald-600" : "text-destructive")}>
                Branża: {kpi.openRate.benchmark}%
              </Badge>
            </div>
            <div className="text-3xl font-bold font-serif">{kpi.openRate.value}%</div>
            <p className="text-xs text-muted-foreground mt-1">Wskaźnik otwarć</p>
            <p className="text-xs text-muted-foreground">{kpi.openRate.total} otwartych z {kpi.openRate.sent}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <MousePointer className="w-5 h-5 text-purple-600" />
              <Badge variant="outline" className={cn("text-xs", kpi.ctr.value > kpi.ctr.benchmark ? "text-emerald-600" : "text-destructive")}>
                Branża: {kpi.ctr.benchmark}%
              </Badge>
            </div>
            <div className="text-3xl font-bold font-serif">{kpi.ctr.value}%</div>
            <p className="text-xs text-muted-foreground mt-1">Wskaźnik kliknięć (CTR)</p>
            <p className="text-xs text-muted-foreground">{kpi.ctr.total} kliknięć linku rezerwacji</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CalendarCheck className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold font-serif">{kpi.conversionRate.value}%</div>
            <p className="text-xs text-muted-foreground mt-1">Wskaźnik konwersji</p>
            <p className="text-xs text-muted-foreground">{kpi.conversionRate.total} rezerwacji z {kpi.conversionRate.sent} wysłanych</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-amber-600" />
              <Badge variant="outline" className="text-xs text-emerald-600">+{kpi.revenueRecovered.trend}%</Badge>
            </div>
            <div className="text-3xl font-bold font-serif">{kpi.revenueRecovered.value.toLocaleString("pl-PL")} zł</div>
            <p className="text-xs text-muted-foreground mt-1">Przychód odzyskany</p>
            <p className="text-xs text-muted-foreground">w ostatnich 30 dniach</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-sequence stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-serif">Skuteczność per sekwencja</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-6 gap-2 text-xs font-medium text-muted-foreground pb-2 border-b">
              <span>Sekwencja</span>
              <span className="text-center">Wysłanych</span>
              <span className="text-center">Otwarć %</span>
              <span className="text-center">Kliknięć %</span>
              <span className="text-center">Konwersja %</span>
              <span className="text-right">Przychód</span>
            </div>
            {DEMO_SEQ_STATS.map((s, i) => (
              <div key={i} className="grid grid-cols-6 gap-2 items-center text-sm">
                <span className="font-medium text-xs">{s.name}</span>
                <span className="text-center">{s.sent}</span>
                <div className="flex items-center gap-1.5">
                  <Progress value={s.openRate} className="h-1.5 flex-1" />
                  <span className="text-xs w-8 text-right">{s.openRate}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Progress value={s.ctr} className="h-1.5 flex-1" />
                  <span className="text-xs w-8 text-right">{s.ctr}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Progress value={s.conversion * 5} className="h-1.5 flex-1" />
                  <span className="text-xs w-8 text-right">{s.conversion}%</span>
                </div>
                <span className="text-right font-medium">{s.revenue} zł</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hourly opens chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-serif">Otwarcia wg godziny</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEMO_HOURLY}>
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
                <YAxis tick={{ fontSize: 10 }} width={30} />
                <Tooltip formatter={(v: number) => [`${v} otwarć`, "Otwarcia"]} />
                <Bar dataKey="opens" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 bg-primary/5 rounded-lg p-3 flex items-start gap-2 border border-primary/10">
            <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Twoje klientki najchętniej otwierają wiadomości o <strong className="text-foreground">{bestHour.hour}</strong>. System automatycznie dostosowuje czas wysyłki do tej godziny.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Monthly trend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-serif">Trend miesięczny</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DEMO_MONTHLY}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={30} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="sent" stroke="hsl(217 91% 60%)" name="Wysłane" strokeWidth={2} />
                <Line type="monotone" dataKey="opened" stroke="hsl(142 71% 45%)" name="Otwarte" strokeWidth={2} />
                <Line type="monotone" dataKey="conversions" stroke="hsl(var(--primary))" name="Konwersje" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top reactivated */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-serif">Top klientki reaktywowane</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {DEMO_TOP_REACTIVATED.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{c.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{c.name} — wróciła po {c.daysAway} dniach</p>
                  <p className="text-xs text-muted-foreground">Sekwencja: {c.sequence} · przychód: {c.revenue} zł</p>
                </div>
                <Badge className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                  +{c.revenue} zł
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

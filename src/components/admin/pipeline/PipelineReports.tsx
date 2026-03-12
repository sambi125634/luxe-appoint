import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Users,
  ArrowRight,
  BarChart3,
  PieChart,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { defaultPipelineStages } from "./types";

// Multipliers per time range for realistic scaling
const timeRangeMultipliers: Record<string, number> = {
  "7d": 0.15,
  "30d": 1,
  "90d": 2.8,
  "all": 4.2,
};

// Seeded pseudo-random for stable values per range
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateReportData(timeRange: string) {
  const mult = timeRangeMultipliers[timeRange] || 1;
  const seed = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365;

  // Base counts for 30d
  const baseTotal = 200;
  const total = Math.round(baseTotal * mult);

  const conversionRates = [78, 95, 85, 92, 88, 90, 91, 93, 94, 100];
  const noShowRates = [22, 0, 15, 0, 0, 0, 0, 0, 0, 0];
  
  // Slight variation per time range
  const rateVariation = (idx: number) => {
    const v = seededRandom(seed * 100 + idx) * 4 - 2; // -2 to +2
    return Math.round(v * 10) / 10;
  };

  // Funnel
  const funnelStages = ['Zarezerwowane', 'Wizyta 1 ✓', 'Wizyta 2 ✓', 'Wizyta 3 ✓', 'Wizyta 4 ✓', 'Wizyta 5 ✓', 'Ukończone'];
  const funnelCounts = [total];
  const funnelRates = [78, 81, 81, 82, 87, 100]; // pass-through rates
  for (let i = 0; i < funnelRates.length; i++) {
    const rate = Math.min(100, Math.max(50, funnelRates[i] + rateVariation(i)));
    funnelCounts.push(Math.round(funnelCounts[i] * rate / 100));
  }

  const avgValue = 850;
  const funnelData = funnelStages.map((stage, idx) => ({
    stage,
    count: funnelCounts[idx],
    percent: Math.round((funnelCounts[idx] / total) * 1000) / 10,
    value: funnelCounts[idx] * avgValue,
  }));

  // Conversion data
  const conversionPairs = [
    { from: 'reserved', to: 'visit-1-done' },
    { from: 'reserved', to: 'no-show' },
    { from: 'visit-1-done', to: 'between-1-2' },
    { from: 'between-1-2', to: 'visit-2-done' },
    { from: 'between-1-2', to: 'no-show' },
    { from: 'visit-2-done', to: 'between-2-3' },
    { from: 'between-2-3', to: 'visit-3-done' },
    { from: 'visit-3-done', to: 'between-3-4' },
    { from: 'between-3-4', to: 'visit-4-done' },
    { from: 'visit-4-done', to: 'between-4-5' },
    { from: 'between-4-5', to: 'visit-5-done' },
    { from: 'visit-5-done', to: 'completed' },
  ];

  const avgDaysBase = [3.2, 0, 0.5, 21.4, 0, 0.5, 24.1, 0.5, 22.8, 0.5, 21.2, 0.5];
  const ratesBase = [78, 22, 95, 85, 15, 92, 88, 90, 91, 93, 94, 100];

  const conversionData = conversionPairs.map((pair, idx) => {
    const rate = Math.min(100, Math.max(0, Math.round(ratesBase[idx] + rateVariation(idx + 20))));
    const count = Math.round(total * (rate / 100) * mult / mult); // scale count by mult but rate stays %
    return {
      from: pair.from,
      to: pair.to,
      rate,
      count: Math.round(funnelCounts[0] * ratesBase[idx] / 100 * (1 + rateVariation(idx + 50) / 100)),
      avgDays: avgDaysBase[idx] > 0 ? Math.round((avgDaysBase[idx] + rateVariation(idx + 30)) * 10) / 10 : 0,
    };
  });

  // Stage value data
  const stageValueData = defaultPipelineStages.map((stage, idx) => {
    const contactsCount = Math.max(0, Math.round((50 - idx * 4 + seededRandom(seed * 10 + idx) * 10) * mult));
    const av = 850 + Math.round(seededRandom(seed * 20 + idx) * 200);
    return {
      stageId: stage.id,
      stageName: stage.name,
      stageColor: stage.color,
      contactsCount,
      totalValue: contactsCount * av,
      avgValue: av,
    };
  });

  // Time metrics
  const timeMetrics = {
    avgTotalDays: Math.round((93.4 + rateVariation(100) * 3) * 10) / 10,
    avgDaysBetweenVisits: Math.round((22.3 + rateVariation(101)) * 10) / 10,
    fastestCompletion: Math.round(68 + rateVariation(102) * 5),
    slowestCompletion: Math.round(142 + rateVariation(103) * 10),
  };

  // KPI
  const completedValue = funnelCounts[funnelCounts.length - 1] * avgValue;
  const overallConversion = Math.round((funnelCounts[funnelCounts.length - 1] / total) * 1000) / 10;
  const noShowRate = Math.round((conversionData.filter(c => c.to === 'no-show').reduce((a, c) => a + c.rate, 0) / 2) * 10) / 10;
  const kpiDelta = {
    conversion: Math.round(rateVariation(200) * 10) / 10,
    value: Math.round(completedValue * 0.18 / 1000),
    noShow: Math.round(rateVariation(201) * 10) / 10,
  };

  return {
    funnelData,
    conversionData,
    stageValueData,
    timeMetrics,
    kpi: {
      overallConversion,
      completedValue,
      noShowRate,
      delta: kpiDelta,
    },
    total,
  };
}

export function PipelineReports() {
  const [timeRange, setTimeRange] = useState("30d");

  const data = useMemo(() => generateReportData(timeRange), [timeRange]);

  const getStageName = (stageId: string) => {
    return defaultPipelineStages.find(s => s.id === stageId)?.name || stageId;
  };

  const getStageColor = (stageId: string) => {
    return defaultPipelineStages.find(s => s.id === stageId)?.color || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-semibold">Raporty Pipeline</h2>
          <p className="text-sm text-muted-foreground">Analiza konwersji i efektywności lejka sprzedażowego</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Ostatnie 7 dni</SelectItem>
              <SelectItem value="30d">Ostatnie 30 dni</SelectItem>
              <SelectItem value="90d">Ostatnie 90 dni</SelectItem>
              <SelectItem value="all">Cały czas</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.kpi.overallConversion}%</p>
                <p className="text-xs text-muted-foreground">Konwersja całkowita</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-green-500">
              <TrendingUp className="w-3 h-3" />
              <span>{data.kpi.delta.conversion > 0 ? '+' : ''}{data.kpi.delta.conversion}% vs poprzedni okres</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.timeMetrics.avgTotalDays} <span className="text-sm font-normal">dni</span></p>
                <p className="text-xs text-muted-foreground">Śr. czas ukończenia</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <span>Min: {data.timeMetrics.fastestCompletion}d • Max: {data.timeMetrics.slowestCompletion}d</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(data.kpi.completedValue / 1000)}k <span className="text-sm font-normal">zł</span></p>
                <p className="text-xs text-muted-foreground">Wartość ukończonych</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-green-500">
              <TrendingUp className="w-3 h-3" />
              <span>+{data.kpi.delta.value}k vs poprzedni okres</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.kpi.noShowRate}%</p>
                <p className="text-xs text-muted-foreground">Wskaźnik no-show</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-red-500">
              <TrendingDown className="w-3 h-3" />
              <span>{data.kpi.delta.noShow}% vs poprzedni okres</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Reports */}
      <Tabs defaultValue="funnel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="funnel" className="gap-2">
            <PieChart className="w-4 h-4" />
            Lejek
          </TabsTrigger>
          <TabsTrigger value="conversions" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Konwersje
          </TabsTrigger>
          <TabsTrigger value="time" className="gap-2">
            <Clock className="w-4 h-4" />
            Czas przejścia
          </TabsTrigger>
          <TabsTrigger value="value" className="gap-2">
            <DollarSign className="w-4 h-4" />
            Wartość
          </TabsTrigger>
        </TabsList>

        {/* Funnel Tab */}
        <TabsContent value="funnel">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Lejek sprzedażowy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.funnelData.map((item, idx) => (
                  <div key={item.stage} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.stage}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">{item.count} kontaktów</span>
                        <span className="font-semibold">{item.value.toLocaleString()} zł</span>
                        <Badge variant={item.percent >= 50 ? "default" : "secondary"}>
                          {item.percent}%
                        </Badge>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress
                        value={item.percent}
                        className="h-8"
                      />
                      <div
                        className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-medium text-primary-foreground"
                        style={{ width: `${Math.max(item.percent, 15)}%` }}
                      >
                        {item.count} osób
                      </div>
                    </div>
                    {idx < data.funnelData.length - 1 && (
                      <div className="flex items-center justify-center py-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <ArrowRight className="w-3 h-3" />
                          <span>
                            {data.funnelData[idx + 1].count > 0
                              ? Math.round((data.funnelData[idx + 1].count / item.count) * 100)
                              : 0}% przechodzi dalej
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversions Tab */}
        <TabsContent value="conversions">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Konwersja między etapami</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.conversionData.filter(c => c.to !== 'no-show').map((conversion) => (
                  <div
                    key={`${conversion.from}-${conversion.to}`}
                    className="glass-card p-3 flex items-center gap-3"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Badge variant="outline" className="text-xs truncate max-w-[100px]">
                        {getStageName(conversion.from)}
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <Badge className={cn(getStageColor(conversion.to), "text-white text-xs truncate max-w-[100px]")}>
                        {getStageName(conversion.to)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-right">
                        <p className="font-semibold text-green-500">{conversion.rate}%</p>
                        <p className="text-xs text-muted-foreground">konwersja</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{conversion.count}</p>
                        <p className="text-xs text-muted-foreground">przeszło</p>
                      </div>
                      <div className="text-right min-w-[60px]">
                        <p className="font-medium">{conversion.avgDays > 0 ? `${conversion.avgDays}d` : '-'}</p>
                        <p className="text-xs text-muted-foreground">śr. czas</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* No-show breakdown */}
              <div className="mt-6 pt-4 border-t border-border">
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  Utracone kontakty (no-show)
                </h4>
                <div className="space-y-2">
                  {data.conversionData.filter(c => c.to === 'no-show').map((conversion) => (
                    <div
                      key={`${conversion.from}-noshow`}
                      className="flex items-center justify-between p-2 bg-red-500/5 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getStageName(conversion.from)}
                        </Badge>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <Badge variant="destructive" className="text-xs">No-show</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-red-500 font-medium">{conversion.rate}%</span>
                        <span className="text-muted-foreground">({conversion.count} osób)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Tab */}
        <TabsContent value="time">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Średni czas przejścia między wizytami</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {/* Timeline visualization */}
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">Średni cykl życia klienta</span>
                    <Badge>{data.timeMetrics.avgTotalDays} dni</Badge>
                  </div>

                  <div className="relative">
                    <div className="absolute top-4 left-0 right-0 h-1 bg-muted rounded" />
                    <div className="flex justify-between relative">
                      {['Rezerwacja', 'Wizyta 1', 'Wizyta 2', 'Wizyta 3', 'Wizyta 4', 'Wizyta 5'].map((label, idx) => (
                        <div key={label} className="flex flex-col items-center">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium z-10",
                            idx === 0 ? "bg-blue-500 text-white" :
                            idx === 5 ? "bg-green-500 text-white" :
                            "bg-primary text-primary-foreground"
                          )}>
                            {idx === 0 ? 'R' : idx}
                          </div>
                          <span className="text-xs text-muted-foreground mt-2">{label}</span>
                          {idx > 0 && (
                            <span className="text-xs font-medium mt-1">
                              ~{Math.round(data.timeMetrics.avgDaysBetweenVisits)}d
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Detailed time breakdown */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="glass-card p-4">
                    <h4 className="font-medium text-sm mb-3">Czas do pierwszej wizyty</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Średni</span>
                        <span className="font-medium">{data.conversionData[0]?.avgDays || 3.2} dni</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Mediana</span>
                        <span className="font-medium">2 dni</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Najszybciej</span>
                        <span className="font-medium text-green-500">Ten sam dzień</span>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-4">
                    <h4 className="font-medium text-sm mb-3">Czas między wizytami</h4>
                    <div className="space-y-2">
                      {data.conversionData
                        .filter(c => c.avgDays > 1 && c.to !== 'no-show')
                        .slice(0, 4)
                        .map((c, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{getStageName(c.from)} → {getStageName(c.to)}</span>
                            <span className="font-medium">{c.avgDays} dni</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    Rekomendacja
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Średni czas między wizytą 2 a 3 jest najdłuższy w pipeline.
                    Rozważ dodatkowy follow-up w tym okresie, aby zwiększyć retencję.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Value Tab */}
        <TabsContent value="value">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Wartość na każdym etapie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.stageValueData.filter(s => s.contactsCount > 0).map((stage) => (
                  <div
                    key={stage.stageId}
                    className="glass-card p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full", stage.stageColor)} />
                        <span className="font-medium text-sm">{stage.stageName}</span>
                      </div>
                      <Badge variant="outline">{stage.contactsCount} kontaktów</Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Wartość całkowita</p>
                        <p className="font-semibold text-primary">{stage.totalValue.toLocaleString()} zł</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Średnia wartość</p>
                        <p className="font-medium">{stage.avgValue.toLocaleString()} zł</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">% całości pipeline</p>
                        <p className="font-medium">
                          {Math.round((stage.totalValue / Math.max(1, data.stageValueData.reduce((acc, s) => acc + s.totalValue, 0))) * 100)}%
                        </p>
                      </div>
                    </div>

                    <Progress
                      value={(stage.totalValue / Math.max(1, Math.max(...data.stageValueData.map(s => s.totalValue)))) * 100}
                      className="h-1.5 mt-2"
                    />
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-6 pt-4 border-t border-border">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {data.stageValueData.reduce((acc, s) => acc + s.totalValue, 0).toLocaleString()} zł
                    </p>
                    <p className="text-xs text-muted-foreground">Całkowita wartość pipeline</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {data.stageValueData.length > 0
                        ? Math.round(data.stageValueData.reduce((acc, s) => acc + s.avgValue, 0) / data.stageValueData.length).toLocaleString()
                        : 0} zł
                    </p>
                    <p className="text-xs text-muted-foreground">Średnia wartość pakietu</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-500">
                      {data.kpi.completedValue.toLocaleString()} zł
                    </p>
                    <p className="text-xs text-muted-foreground">Wartość ukończonych</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

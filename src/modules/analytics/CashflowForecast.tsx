import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, Lightbulb, Target } from 'lucide-react';
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';
import { ProfitSummary } from './types';
import { cn } from '@/lib/utils';

function useCountUp(target: number, duration: number = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
}

const AnimatedValue = ({ value }: { value: number }) => {
  const count = useCountUp(value, 1200);
  return <>{count.toLocaleString('pl-PL')} zł</>;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-card border border-border rounded-xl shadow-xl p-3 min-w-[160px]">
      <p className="text-xs font-semibold text-muted-foreground mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground text-xs">{entry.name}</span>
          </div>
          <span className="font-bold tabular-nums">
            {Number(entry.value).toLocaleString('pl-PL')} zł
          </span>
        </div>
      ))}
      {payload.length >= 2 && (
        <div className="mt-2 pt-2 border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Różnica</span>
            <span className={cn(
              "font-bold tabular-nums",
              (payload[1]?.value - payload[0]?.value) >= 0 ? "text-green-600" : "text-red-500"
            )}>
              {(payload[1]?.value - payload[0]?.value) >= 0 ? "+" : ""}
              {(payload[1]?.value - payload[0]?.value)?.toLocaleString('pl-PL')} zł
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

interface Props {
  monthlySummary: ProfitSummary;
  onNavigate?: (tab: string) => void;
}

export function CashflowForecast({ monthlySummary, onNavigate }: Props) {
  const [reactivationSlider, setReactivationSlider] = useState([0]);
  const [newClientsSlider, setNewClientsSlider] = useState([0]);
  const [forecastPeriod, setForecastPeriod] = useState<'30' | '60' | '90'>('90');

  const avgVisitValue = monthlySummary.revenue > 0
    ? monthlySummary.revenue / Math.max(1, monthlySummary.revenue / 165)
    : 165;

  const dailyRevenue = monthlySummary.revenue / 30;

  const weeklyForecast = useMemo(() => {
    const weeks = forecastPeriod === '30' ? 4 : forecastPeriod === '60' ? 8 : 12;
    const seasonality = [1.0, 0.95, 1.05, 1.1, 0.9, 1.0, 0.85, 1.15, 1.05, 0.95, 1.0, 1.1];
    const reactivationBoost = (reactivationSlider[0] * avgVisitValue) / 30;
    const newClientsBoost = (newClientsSlider[0] * avgVisitValue) / 30;

    return Array.from({ length: weeks }, (_, i) => {
      const monthIdx = Math.floor(i / 4);
      const seasonal = seasonality[monthIdx % seasonality.length];
      const trendDecay = 1 - (i * 0.008);
      const base = dailyRevenue * 7 * seasonal;
      const predicted = base * trendDecay + (reactivationBoost + newClientsBoost) * 7;
      const historical = base * 0.95;
      const scheduled = i < 2 ? base * 1.05 : base * seasonal;
      const profit = predicted * (monthlySummary.trueMargin / 100);

      return {
        week: `Tydz. ${i + 1}`,
        predicted: Math.round(predicted),
        historical: Math.round(historical),
        scheduled: Math.round(scheduled),
        profit: Math.round(profit),
      };
    });
  }, [dailyRevenue, reactivationSlider, newClientsSlider, forecastPeriod, avgVisitValue, monthlySummary.trueMargin]);

  const cumulativeData = useMemo(() => {
    let cumPredicted = 0, cumHistorical = 0;
    return weeklyForecast.map(w => {
      cumPredicted += w.predicted;
      cumHistorical += w.historical;
      return { ...w, cumPredicted, cumHistorical, gap: cumPredicted - cumHistorical };
    });
  }, [weeklyForecast]);

  const lastPoint = cumulativeData[cumulativeData.length - 1];
  const hasGap = lastPoint?.gap < -500;
  const hasPositiveGap = lastPoint?.gap > 500;
  const totalExtra = (reactivationSlider[0] + newClientsSlider[0]) * avgVisitValue;

  const scenarios = useMemo(() => {
    const base = monthlySummary.trueProfit * 3;
    return {
      pessimistic: { label: "Pesymistyczny", value: Math.round(base * 0.85), desc: "Bez zmian + sezonowy spadek -15%", color: "text-destructive" },
      base: { label: "Bazowy", value: Math.round(base), desc: "Utrzymanie obecnego tempa", color: "text-muted-foreground" },
      optimistic: { label: "Optymistyczny", value: Math.round(base + totalExtra * 3), desc: `+${reactivationSlider[0]} reaktywacji +${newClientsSlider[0]} nowych/mies.`, color: "text-primary" },
    };
  }, [monthlySummary.trueProfit, totalExtra, reactivationSlider, newClientsSlider]);

  const hasSimulation = reactivationSlider[0] > 0 || newClientsSlider[0] > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Prognoza cashflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Alert luki */}
          {hasGap && (
            <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">⚠️ Prognoza poniżej historycznego avg</p>
                <p className="text-muted-foreground mt-1">
                  Przy obecnym tempie w ciągu {forecastPeriod} dni zarobisz <strong>{Math.abs(lastPoint.gap).toLocaleString('pl-PL')} zł mniej</strong> niż w analogicznym poprzednim okresie.
                </p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={() => onNavigate?.('retention')}>Aktywuj retencję →</Button>
                  <Button size="sm" variant="ghost">Zaplanuj promocję →</Button>
                </div>
              </div>
            </div>
          )}

          {hasPositiveGap && (
            <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-sm">
              <TrendingUp className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">📈 Salon rośnie powyżej trendu</p>
                <p className="text-muted-foreground mt-1">
                  Prognoza jest <strong>{lastPoint.gap.toLocaleString('pl-PL')} zł wyżej</strong> niż historyczna średnia. Dobry moment na zatrudnienie lub inwestycję w sprzęt.
                </p>
              </div>
            </div>
          )}

          {/* Scenariusze z animowanymi licznikami */}
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
              Scenariusze na {forecastPeriod === '30' ? 'miesiąc' : forecastPeriod === '60' ? '2 miesiące' : '3 miesiące'}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {Object.values(scenarios).map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className={cn("text-lg font-bold", s.color)}>
                    <AnimatedValue value={s.value} />
                  </p>
                  <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Suwaki symulacji */}
          <div className="space-y-4 bg-muted/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Target className="w-4 h-4 text-primary" />
              Symuluj scenariusz
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Reaktywowane klientki/mies.</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{reactivationSlider[0]}</Badge>
                  {reactivationSlider[0] > 0 && (
                    <span className="text-xs text-emerald-600">+{Math.round(reactivationSlider[0] * avgVisitValue).toLocaleString('pl-PL')} zł/mies.</span>
                  )}
                </div>
              </div>
              <Slider
                value={reactivationSlider}
                onValueChange={setReactivationSlider}
                max={50}
                step={1}
                className="w-full [&>span:first-child]:bg-primary/20 [&>span:first-child>span]:bg-primary [&>span[role=slider]]:bg-primary [&>span[role=slider]]:border-primary [&>span[role=slider]]:shadow-md"
              />
              <p className="text-[10px] text-muted-foreground">Użyj sekwencji retencji AI → statystycznie 34% reaktywowanych wraca</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Nowe klientki/mies.</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{newClientsSlider[0]}</Badge>
                  {newClientsSlider[0] > 0 && (
                    <span className="text-xs text-emerald-600">+{Math.round(newClientsSlider[0] * avgVisitValue).toLocaleString('pl-PL')} zł/mies.</span>
                  )}
                </div>
              </div>
              <Slider
                value={newClientsSlider}
                onValueChange={setNewClientsSlider}
                max={30}
                step={1}
                className="w-full [&>span:first-child]:bg-green-500/20 [&>span:first-child>span]:bg-green-500 [&>span[role=slider]]:bg-green-500 [&>span[role=slider]]:border-green-500 [&>span[role=slider]]:shadow-md"
              />
              <p className="text-[10px] text-muted-foreground">Przez polecenia (CAC = 0 zł) lub kampanie reklamowe</p>
            </div>

            {hasSimulation && (
              <div className="bg-primary/10 rounded-md p-3 text-center">
                <p className="text-xs text-muted-foreground">Łączny efekt symulacji:</p>
                <p className="text-lg font-bold text-primary">
                  +{Math.round(totalExtra * 3).toLocaleString('pl-PL')} zł <span className="text-sm font-normal text-muted-foreground">w ciągu 3 miesięcy</span>
                </p>
              </div>
            )}
          </div>

          {/* Wykres */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Prognoza tygodniowa (przychód)</p>
              <div className="flex gap-1">
                {(['30', '60', '90'] as const).map(p => (
                  <button key={p} onClick={() => setForecastPeriod(p)} className={cn("text-xs px-2 py-1 rounded-md transition-colors", forecastPeriod === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
                    {p} dni
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <svg width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                  <linearGradient id="gradientPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="70%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradientSimulated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="70%" stopColor="#10b981" stopOpacity={0.05} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </svg>

              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={weeklyForecast} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="0" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
                    <XAxis
                      dataKey="week"
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      interval={1}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
                      width={35}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    {monthlySummary.trueProfit > 0 && (
                      <ReferenceLine
                        y={monthlySummary.trueProfit * (30 / 7) * 1.1}
                        stroke="#f59e0b"
                        strokeDasharray="6 3"
                        strokeWidth={1.5}
                        label={{ value: 'Cel +10%', position: 'right', fontSize: 10, fill: '#f59e0b' }}
                      />
                    )}
                    <Area
                      type="monotone"
                      dataKey="historical"
                      name="Historyczna średnia"
                      stroke="#9ca3af"
                      strokeWidth={1.5}
                      strokeDasharray="6 3"
                      fill="none"
                      dot={false}
                      activeDot={{ r: 4, fill: '#9ca3af', stroke: 'white', strokeWidth: 2 }}
                      isAnimationActive={true}
                      animationDuration={1200}
                      animationEasing="ease-out"
                    />
                    <Area
                      type="monotone"
                      dataKey="predicted"
                      name="Prognoza"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2.5}
                      fill="url(#gradientPredicted)"
                      dot={false}
                      activeDot={{ r: 5, fill: 'hsl(var(--primary))', stroke: 'white', strokeWidth: 2.5 }}
                      isAnimationActive={true}
                      animationDuration={1500}
                      animationEasing="ease-out"
                      animationBegin={200}
                    />
                    {hasSimulation && (
                      <Area
                        type="monotone"
                        dataKey="scheduled"
                        name="Z symulacją"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fill="url(#gradientSimulated)"
                        dot={false}
                        activeDot={{ r: 5, fill: '#10b981', stroke: 'white', strokeWidth: 2.5 }}
                        isAnimationActive={true}
                        animationDuration={1800}
                        animationEasing="ease-out"
                        animationBegin={400}
                      />
                    )}
                    <Bar
                      dataKey="profit"
                      name="Zysk netto"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.12}
                      radius={[3, 3, 0, 0]}
                      isAnimationActive={true}
                      animationDuration={1000}
                      animationEasing="ease-out"
                      barSize={18}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Legenda */}
              <div className="flex items-center justify-center gap-5 mt-3 flex-wrap">
                {[
                  { color: "#9ca3af", label: "Historyczna średnia", dashed: true, show: true, isBar: false },
                  { color: "hsl(var(--primary))", label: "Prognoza", dashed: false, show: true, isBar: false },
                  { color: "#10b981", label: "Z symulacją", dashed: false, show: hasSimulation, isBar: false },
                  { color: "hsl(var(--primary))", label: "Zysk netto (słupki)", dashed: false, show: true, isBar: true },
                ]
                  .filter(l => l.show)
                  .map((l, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      {l.isBar ? (
                        <div className="w-4 h-3 rounded-sm opacity-20" style={{ backgroundColor: l.color }} />
                      ) : (
                        <div
                          className="h-0.5 w-5"
                          style={{
                            borderTop: l.dashed ? `2px dashed ${l.color}` : `2px solid ${l.color}`,
                          }}
                        />
                      )}
                      <span className="text-xs text-muted-foreground">{l.label}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Rekomendacje AI */}
          {monthlySummary.trueProfit > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Co zrobić żeby poprawić prognozę?
              </p>
              {[
                ...(monthlySummary.trueMargin < 30 ? [{
                  icon: "📦",
                  text: `Obniż koszty materiałowe — Twoja marża jest poniżej branżowego avg (34%). Sprawdź receptury zabiegów.`,
                  action: "Przejdź do receptur →",
                  tab: "products",
                }] : []),
                {
                  icon: "🔄",
                  text: `Reaktywuj ${Math.round(monthlySummary.revenue / avgVisitValue * 0.15)} nieaktywnych klientek — to potencjał ${Math.round(monthlySummary.revenue / avgVisitValue * 0.15 * avgVisitValue).toLocaleString('pl-PL')} zł.`,
                  action: "Aktywuj retencję →",
                  tab: "retention",
                },
                ...(monthlySummary.revenue / 30 < 300 ? [{
                  icon: "📅",
                  text: `Wypełnij wolne okienka — każda wolna godzina to ~${Math.round(avgVisitValue * 0.9)} zł strat.`,
                  action: "Otwórz kalendarz →",
                  tab: "calendar",
                }] : []),
              ].map((rec, i) => (
                <div key={i} className="flex gap-3 items-start p-3 rounded-lg bg-muted/30">
                  <span className="text-lg">{rec.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{rec.text}</p>
                    <button onClick={() => onNavigate?.(rec.tab)} className="text-xs text-primary font-medium mt-1 hover:underline">
                      {rec.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

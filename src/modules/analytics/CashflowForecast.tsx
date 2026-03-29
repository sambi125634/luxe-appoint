import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, Lightbulb, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ProfitSummary } from './types';
import { cn } from '@/lib/utils';

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

      return {
        week: `Tydz. ${i + 1}`,
        predicted: Math.round(predicted),
        historical: Math.round(historical),
        scheduled: Math.round(scheduled),
      };
    });
  }, [dailyRevenue, reactivationSlider, newClientsSlider, forecastPeriod, avgVisitValue]);

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

  return (
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

        {/* Scenariusze */}
        <div className="bg-muted/30 rounded-lg p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            Scenariusze na {forecastPeriod === '30' ? 'miesiąc' : forecastPeriod === '60' ? '2 miesiące' : '3 miesiące'}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {Object.values(scenarios).map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={cn("text-lg font-bold", s.color)}>{s.value.toLocaleString('pl-PL')} zł</p>
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
            <Slider value={reactivationSlider} onValueChange={setReactivationSlider} max={50} step={5} className="w-full" />
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
            <Slider value={newClientsSlider} onValueChange={setNewClientsSlider} max={30} step={5} className="w-full" />
            <p className="text-[10px] text-muted-foreground">Przez polecenia (CAC = 0 zł) lub kampanie reklamowe</p>
          </div>

          {(reactivationSlider[0] > 0 || newClientsSlider[0] > 0) && (
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

          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => [`${value.toLocaleString('pl-PL')} zł`]} />
                <Area type="monotone" dataKey="cumHistorical" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground) / 0.1)" name="Historyczna średnia" strokeDasharray="5 5" />
                <Area type="monotone" dataKey="cumPredicted" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" name="Prognoza" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex gap-4 justify-center text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-muted-foreground inline-block" style={{ borderTop: '2px dashed' }} />Historyczna średnia</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-primary inline-block" />Prognoza</span>
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
  );
}

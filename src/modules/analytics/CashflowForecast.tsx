import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ProfitSummary } from './types';

interface Props {
  monthlySummary: ProfitSummary;
}

export function CashflowForecast({ monthlySummary }: Props) {
  const [reactivationSlider, setReactivationSlider] = useState([0]);
  const avgVisitValue = monthlySummary.revenue > 0 ? monthlySummary.trueProfit / Math.max(1, monthlySummary.revenue / 150) : 80;

  const forecastData = useMemo(() => {
    const dailyAvg = monthlySummary.trueProfit / 30;
    const seasonality = [1.0, 0.95, 1.05, 1.1, 0.9, 1.0, 0.85, 1.15, 1.05, 0.95, 1.0, 1.1];
    const reactivatedExtra = (reactivationSlider[0] * avgVisitValue) / 90;

    return Array.from({ length: 90 }, (_, i) => {
      const weekIdx = Math.floor(i / 7);
      const decay = i < 30 ? 1 : i < 60 ? 0.92 : 0.85;
      const seasonal = seasonality[weekIdx % seasonality.length];
      const scheduled = dailyAvg * seasonal * (i < 14 ? 1.1 : 1);
      const predicted = dailyAvg * decay * seasonal + reactivatedExtra;
      const historical = dailyAvg * seasonal * 0.95;

      return {
        day: i + 1,
        label: i % 7 === 0 ? `Tydzień ${Math.floor(i / 7) + 1}` : '',
        scheduled: Math.round(scheduled),
        predicted: Math.round(predicted),
        historical: Math.round(historical),
      };
    });
  }, [monthlySummary.trueProfit, reactivationSlider, avgVisitValue]);

  // Cumulative for display
  const cumulativeData = useMemo(() => {
    let cumScheduled = 0;
    let cumPredicted = 0;
    let cumHistorical = 0;
    return forecastData
      .filter((_, i) => i % 7 === 0)
      .map((d) => {
        // Sum 7 days
        const week = forecastData.slice(d.day - 1, d.day + 6);
        cumScheduled += week.reduce((s, w) => s + w.scheduled, 0);
        cumPredicted += week.reduce((s, w) => s + w.predicted, 0);
        cumHistorical += week.reduce((s, w) => s + w.historical, 0);
        return {
          label: d.label,
          scheduled: cumScheduled,
          predicted: cumPredicted,
          historical: cumHistorical,
        };
      });
  }, [forecastData]);

  // Revenue gap detection
  const hasGap = cumulativeData.length >= 8 &&
    cumulativeData[7]?.predicted < cumulativeData[7]?.historical * 0.9;

  const gapAmount = hasGap && cumulativeData[7]
    ? Math.round(cumulativeData[7].historical - cumulativeData[7].predicted)
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Prognoza cashflow 90 dni
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasGap && (
          <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <span>
              Za ~8 tygodni prognozuję lukę <strong>{gapAmount} zł</strong>.
              Przesuń suwak reaktywacji żeby zobaczyć wpływ kampanii.
            </span>
          </div>
        )}

        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cumulativeData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(0)} zł`]}
                labelStyle={{ fontSize: 12 }}
              />
              <Area type="monotone" dataKey="historical" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground) / 0.1)" name="Historyczny avg" />
              <Area type="monotone" dataKey="predicted" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" name="Prognoza" />
              <Area type="monotone" dataKey="scheduled" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary) / 0.15)" name="Zaplanowane" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Co jeśli reaktywuję klientki?</span>
            <Badge variant="outline">{reactivationSlider[0]} klientek</Badge>
          </div>
          <Slider
            value={reactivationSlider}
            onValueChange={setReactivationSlider}
            max={50}
            step={5}
            className="w-full"
          />
          {reactivationSlider[0] > 0 && (
            <p className="text-xs text-muted-foreground">
              +{(reactivationSlider[0] * avgVisitValue).toFixed(0)} zł szacowanego dodatkowego zysku w 90 dni
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

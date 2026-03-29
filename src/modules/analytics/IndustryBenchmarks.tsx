import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, TrendingDown, Minus, ChevronRight, Info } from 'lucide-react';
import { ProfitSummary, INDUSTRY_BENCHMARKS, SALON_SEGMENTS } from './types';
import { cn } from '@/lib/utils';

interface Props {
  summary: ProfitSummary;
  onNavigate?: (tab: string) => void;
}

export function IndustryBenchmarks({ summary, onNavigate }: Props) {
  const [selectedSegment, setSelectedSegment] = useState('beauty_mix');

  const segment = SALON_SEGMENTS[selectedSegment];
  const bench = INDUSTRY_BENCHMARKS;

  const yourMaterialPct = summary.revenue > 0 ? (summary.materialCosts / summary.revenue) * 100 : 0;
  const yourStaffPct = summary.revenue > 0 ? (summary.staffCosts / summary.revenue) * 100 : 0;
  const avgRevenuePerVisit = summary.revenue > 0
    ? summary.revenue / Math.max(1, summary.revenue / bench.avgRevenuePerVisit)
    : 0;

  const TrendIcon = ({ yours, avg, higherIsBetter }: { yours: number; avg: number; higherIsBetter: boolean }) => {
    const isGood = higherIsBetter ? yours >= avg : yours <= avg;
    const isBad = higherIsBetter ? yours < avg * 0.85 : yours > avg * 1.15;
    if (isGood) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (isBad) return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-amber-500" />;
  };

  const recommendations = [
    ...(summary.trueMargin < bench.trueMargin ? [{
      priority: "high" as const,
      icon: "💰",
      title: "Marża poniżej branżowej średniej",
      detail: `Twoja marża: ${summary.trueMargin.toFixed(0)}% vs branża: ${bench.trueMargin}% vs top 25%: ${bench.trueMarginTop25}%.`,
      actions: [{ label: "Sprawdź receptury zabiegów →", tab: "products" }, { label: "Przejrzyj koszty materiałów →", tab: "products" }],
    }] : []),
    ...(yourMaterialPct > bench.materialCostPct * 1.2 ? [{
      priority: "medium" as const,
      icon: "📦",
      title: "Koszty materiałów wyższe niż branżowe",
      detail: `Twoje: ${yourMaterialPct.toFixed(0)}% vs branża: ${bench.materialCostPct}%. Rozważ negocjację cen z dostawcami lub zmianę receptur.`,
      actions: [{ label: "Zarządzaj dostawcami →", tab: "products" }],
    }] : []),
    ...(summary.trueMargin >= bench.trueMarginTop25 ? [{
      priority: "positive" as const,
      icon: "🏆",
      title: "Jesteś w top 25% salonów w Polsce!",
      detail: `Marża ${summary.trueMargin.toFixed(0)}% to wynik lepszy niż 75% podobnych salonów.`,
      actions: [{ label: "Sprawdź gdzie jeszcze rosnąć →", tab: "analytics" }],
    }] : []),
  ];

  const metrics = [
    { label: "True Margin", yours: summary.trueMargin, avg: bench.trueMargin, top25: bench.trueMarginTop25, bottom25: bench.trueMarginBottom25, unit: "%", higherIsBetter: true, desc: "Zysk netto po odjęciu WSZYSTKICH kosztów" },
    { label: "Koszty materiałów", yours: yourMaterialPct, avg: bench.materialCostPct, top25: bench.materialCostTop25, bottom25: bench.materialCostBottom25, unit: "% przychodu", higherIsBetter: false, desc: "Udział kosztów produktów w przychodzie" },
    { label: "Koszty pracowników", yours: yourStaffPct, avg: bench.staffCostPct, top25: bench.staffCostTop25, bottom25: bench.staffCostBottom25, unit: "% przychodu", higherIsBetter: false, desc: "Udział wynagrodzeń w przychodzie" },
    { label: "Śr. wartość wizyty", yours: avgRevenuePerVisit, avg: bench.avgRevenuePerVisit, top25: bench.avgRevenuePerVisitTop25, bottom25: bench.avgRevenuePerVisit * 0.6, unit: "zł", higherIsBetter: true, desc: "Średni przychód na jedną wizytę" },
  ];

  const getPercentPosition = (value: number, min: number, max: number) => {
    return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Benchmarki branżowe
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">

        {/* Wybór segmentu */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Porównaj z salonami podobnymi do Twojego:</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(SALON_SEGMENTS).map(([key, seg]) => (
              <button
                key={key}
                onClick={() => setSelectedSegment(key)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full border transition-all",
                  selectedSegment === key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:border-primary/50 text-muted-foreground"
                )}
              >
                {seg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Główny wynik */}
        <div className={cn("rounded-lg p-4 text-center", summary.trueMargin >= bench.trueMarginTop25 ? "bg-emerald-500/10 border border-emerald-500/20" : summary.trueMargin >= bench.trueMargin ? "bg-primary/10 border border-primary/20" : "bg-amber-500/10 border border-amber-500/20")}>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Twoja pozycja w segmencie „{segment.label}"
          </p>

          {/* Percentyl visual */}
          <div className="relative h-3 bg-muted rounded-full mb-3 mx-4">
            <div className="absolute top-0 h-3 w-0.5 bg-muted-foreground/60 z-10" style={{ left: `${getPercentPosition(segment.trueMargin, 0, 70)}%` }} />
            <span className="absolute -top-4 text-[9px] text-muted-foreground" style={{ left: `${getPercentPosition(segment.trueMargin, 0, 70)}%`, transform: 'translateX(-50%)' }}>avg</span>
            <div className="absolute top-0 h-3 w-2 bg-primary rounded-full z-20" style={{ left: `${getPercentPosition(summary.trueMargin, 0, 70)}%`, transform: 'translateX(-50%)' }} />
          </div>

          <p className="text-3xl font-bold">{summary.trueMargin.toFixed(0)}%</p>
          <p className="text-sm text-muted-foreground">
            Twoja True Margin vs <strong>{segment.trueMargin}%</strong> (avg segmentu)
          </p>

          {summary.trueMargin >= bench.trueMarginTop25 && (
            <Badge className="mt-2 bg-emerald-500/20 text-emerald-700 border-emerald-500/30">🏆 Top 25% salonów w Polsce</Badge>
          )}
          {summary.trueMargin < bench.trueMarginBottom25 && (
            <Badge variant="destructive" className="mt-2">⚠️ Poniżej dolnych 25%</Badge>
          )}
        </div>

        {/* Tabela metryk */}
        <div className="space-y-4">
          {metrics.map(metric => {
            const isGood = metric.higherIsBetter ? metric.yours >= metric.avg : metric.yours <= metric.avg;
            const scaleMin = Math.min(metric.bottom25, metric.yours) * 0.5;
            const scaleMax = Math.max(metric.top25, metric.yours) * 1.3;

            return (
              <div key={metric.label} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{metric.label}</p>
                    <p className="text-[10px] text-muted-foreground">{metric.desc}</p>
                  </div>
                  <TrendIcon yours={metric.yours} avg={metric.avg} higherIsBetter={metric.higherIsBetter} />
                </div>

                <div className="space-y-1">
                  <div className="relative h-2.5 bg-muted rounded-full">
                    <div className="absolute top-0 h-2.5 rounded-full bg-muted-foreground/20" style={{ left: `${getPercentPosition(metric.bottom25, scaleMin, scaleMax)}%`, width: `${getPercentPosition(metric.top25, scaleMin, scaleMax) - getPercentPosition(metric.bottom25, scaleMin, scaleMax)}%` }} />
                    <div className="absolute top-0 h-2.5 w-0.5 bg-muted-foreground/60" style={{ left: `${getPercentPosition(metric.avg, scaleMin, scaleMax)}%` }} />
                    <div className={cn("absolute top-0 h-2.5 w-2.5 rounded-full border-2 border-background", isGood ? "bg-emerald-500" : "bg-amber-500")} style={{ left: `${getPercentPosition(metric.yours, scaleMin, scaleMax)}%`, transform: 'translateX(-50%)' }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Dolne 25%: {metric.bottom25.toFixed(0)}{metric.unit.includes('%') ? '%' : ' zł'}</span>
                    <span className={cn("font-medium", isGood ? "text-emerald-600" : "text-amber-600")}>
                      Ty: {metric.yours.toFixed(0)}{metric.unit.includes('%') ? '%' : ' zł'}
                    </span>
                    <span>Top 25%: {metric.top25.toFixed(0)}{metric.unit.includes('%') ? '%' : ' zł'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rekomendacje */}
        {recommendations.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">💡 Co zrobić żeby poprawić wyniki?</p>
            {recommendations.map((rec, i) => (
              <div key={i} className={cn("p-3 rounded-lg border", rec.priority === "high" ? "bg-destructive/5 border-destructive/20" : rec.priority === "positive" ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20")}>
                <p className="text-sm font-medium">{rec.icon} {rec.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{rec.detail}</p>
                <div className="flex gap-3 mt-2">
                  {rec.actions.map((action, j) => (
                    <button key={j} onClick={() => onNavigate?.(action.tab)} className="text-xs flex items-center gap-1 text-primary font-medium hover:underline">
                      {action.label}
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="flex gap-2 text-[10px] text-muted-foreground bg-muted/30 rounded-lg p-3">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>Benchmarki oparte na danych branżowych salonów beauty w Polsce (2024). Aktualizowane kwartalnie. Im więcej danych wprowadzisz do systemu (receptury, stawki pracowników) — tym dokładniejsze będą Twoje wskaźniki.</span>
        </div>

      </CardContent>
    </Card>
  );
}

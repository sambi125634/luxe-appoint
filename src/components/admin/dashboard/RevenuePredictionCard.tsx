import { useTranslation } from "react-i18next";
import { TrendingUp, TrendingDown, Minus, Sparkles, RefreshCw, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useRevenuePrediction, type RevenuePredictionResult } from "@/hooks/useRevenuePrediction";
import { useQueryClient } from "@tanstack/react-query";

interface RevenuePredictionCardProps {
  salonId?: string | null;
  isDemo?: boolean;
}

const DEMO_DATA: RevenuePredictionResult = {
  predictions: { today: 2350, thisWeek: 14800, thisMonth: 58500, confirmedBookings: 8200 },
  trends: { monthOverMonth: 12, direction: "up" },
  confidence: "high",
  insights: [
    "Wtorki i czwartki generują 40% tygodniowego przychodu — rozważ dodatkowy personel",
    "Mezoterapia igłowa ma najwyższą marżę (68%) — warto promować w social media",
  ],
  bestDays: ["Wtorek", "Czwartek", "Piątek"],
  dataPoints: 342,
};

const DEMO_WEEKLY_BARS = [
  { day: "Pn", value: 2100 }, { day: "Wt", value: 3400 }, { day: "Śr", value: 2800 },
  { day: "Cz", value: 3200 }, { day: "Pt", value: 3800 }, { day: "Sb", value: 2900 }, { day: "Nd", value: 600 },
];

export function RevenuePredictionCard({ salonId, isDemo = false }: RevenuePredictionCardProps) {
  const { t } = useTranslation();
  const { data: liveData, isLoading, isRefetching } = useRevenuePrediction(isDemo ? null : (salonId ?? null));
  const queryClient = useQueryClient();
  const data = isDemo ? DEMO_DATA : liveData;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["revenue-prediction", salonId] });
  };

  if (!isDemo && isLoading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <Skeleton className="h-5 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-6 text-center text-muted-foreground">
          <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{t('revenuePrediction.noData')}</p>
          <p className="text-xs">{t('revenuePrediction.needMore')}</p>
        </CardContent>
      </Card>
    );
  }

  const { predictions, trends, confidence, insights, bestDays } = data;
  const TrendIcon = trends.direction === "up" ? TrendingUp : trends.direction === "down" ? TrendingDown : Minus;
  const trendColor = trends.direction === "up" ? "text-emerald-500" : trends.direction === "down" ? "text-rose-500" : "text-muted-foreground";

  const confidenceBadge = {
    low: { label: t('revenuePrediction.confidenceLow'), className: "bg-rose-500/10 text-rose-600" },
    medium: { label: t('revenuePrediction.confidenceMedium'), className: "bg-amber-500/10 text-amber-600" },
    high: { label: t('revenuePrediction.confidenceHigh'), className: "bg-emerald-500/10 text-emerald-600" }
  };

  const maxBar = Math.max(...DEMO_WEEKLY_BARS.map(b => b.value));

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">{t('revenuePrediction.title')}</CardTitle>
            <Badge variant="outline" className={cn("text-xs", confidenceBadge[confidence].className)}>
              {confidenceBadge[confidence].label}
            </Badge>
          </div>
          {!isDemo && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefresh} disabled={isRefetching}>
              <RefreshCw className={cn("w-4 h-4", isRefetching && "animate-spin")} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-background/60 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">{t('revenuePrediction.today')}</p>
            <p className="text-xl font-bold text-primary">{predictions.today.toLocaleString()} zł</p>
          </div>
          <div className="bg-background/60 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">{t('revenuePrediction.thisWeek')}</p>
            <p className="text-xl font-bold">{predictions.thisWeek.toLocaleString()} zł</p>
          </div>
          <div className="bg-background/60 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">{t('revenuePrediction.thisMonth')}</p>
            <p className="text-xl font-bold">{predictions.thisMonth.toLocaleString()} zł</p>
          </div>
        </div>

        {isDemo && (
          <div className="bg-background/40 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-2">{t('revenuePrediction.last7Days')}</p>
            <div className="flex items-end gap-1.5" style={{ height: 80 }}>
              {DEMO_WEEKLY_BARS.map((bar, i) => {
                const barHeight = Math.max(4, (bar.value / maxBar) * 52);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full bg-card border border-border rounded-md px-1.5 py-0.5 shadow-md opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                      <span className="text-[10px] font-semibold">{bar.value.toLocaleString('pl-PL')} zł</span>
                    </div>
                    <div
                      className="w-full rounded-t bg-primary/70 group-hover:bg-primary group-active:bg-primary transition-colors cursor-pointer"
                      style={{ height: barHeight }}
                    />
                    <span className="text-[10px] text-muted-foreground mt-1">{bar.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <TrendIcon className={cn("w-4 h-4", trendColor)} />
            <span className={trendColor}>
              {trends.monthOverMonth > 0 ? "+" : ""}{trends.monthOverMonth}% {t('revenuePrediction.vsPreviousMonth')}
            </span>
          </div>
          {predictions.confirmedBookings > 0 && (
            <span className="text-xs text-muted-foreground">
              {t('revenuePrediction.confirmed')}: {predictions.confirmedBookings.toLocaleString()} zł
            </span>
          )}
        </div>

        {insights.length > 0 && (
          <div className="pt-2 border-t space-y-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lightbulb className="w-3 h-3" />
              <span>{t('revenuePrediction.aiInsights')}</span>
            </div>
            <ul className="text-xs space-y-1">
              {insights.slice(0, 2).map((insight, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {bestDays.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">{t('revenuePrediction.bestDays')}</span>
            {bestDays.map(day => (
              <Badge key={day} variant="secondary" className="text-xs">{day}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

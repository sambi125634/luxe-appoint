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
  predictions: {
    today: 2350,
    thisWeek: 14800,
    thisMonth: 58500,
    confirmedBookings: 8200,
  },
  trends: {
    monthOverMonth: 12,
    direction: "up",
  },
  confidence: "high",
  insights: [
    "Wtorki i czwartki generują 40% tygodniowego przychodu — rozważ dodatkowy personel",
    "Mezoterapia igłowa ma najwyższą marżę (68%) — warto promować w social media",
  ],
  bestDays: ["Wtorek", "Czwartek", "Piątek"],
  dataPoints: 342,
};

const DEMO_WEEKLY_BARS = [
  { day: "Pn", value: 2100 },
  { day: "Wt", value: 3400 },
  { day: "Śr", value: 2800 },
  { day: "Cz", value: 3200 },
  { day: "Pt", value: 3800 },
  { day: "Sb", value: 2900 },
  { day: "Nd", value: 600 },
];

export function RevenuePredictionCard({ salonId, isDemo = false }: RevenuePredictionCardProps) {
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
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
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
          <p className="text-sm">Brak danych do analizy</p>
          <p className="text-xs">Potrzebujemy więcej transakcji</p>
        </CardContent>
      </Card>
    );
  }

  const { predictions, trends, confidence, insights, bestDays } = data;

  const TrendIcon = trends.direction === "up" 
    ? TrendingUp 
    : trends.direction === "down" 
    ? TrendingDown 
    : Minus;

  const trendColor = trends.direction === "up" 
    ? "text-emerald-500" 
    : trends.direction === "down" 
    ? "text-rose-500" 
    : "text-muted-foreground";

  const confidenceBadge = {
    low: { label: "Niska pewność", className: "bg-rose-500/10 text-rose-600" },
    medium: { label: "Średnia pewność", className: "bg-amber-500/10 text-amber-600" },
    high: { label: "Wysoka pewność", className: "bg-emerald-500/10 text-emerald-600" }
  };

  const maxBar = Math.max(...DEMO_WEEKLY_BARS.map(b => b.value));

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">🔮 Prognozy AI</CardTitle>
            <Badge variant="outline" className={cn("text-xs", confidenceBadge[confidence].className)}>
              {confidenceBadge[confidence].label}
            </Badge>
          </div>
          {!isDemo && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleRefresh}
              disabled={isRefetching}
            >
              <RefreshCw className={cn("w-4 h-4", isRefetching && "animate-spin")} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Prediction cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-background/60 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Dziś</p>
            <p className="text-xl font-bold text-primary">{predictions.today.toLocaleString()} zł</p>
          </div>
          <div className="bg-background/60 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Ten tydzień</p>
            <p className="text-xl font-bold">{predictions.thisWeek.toLocaleString()} zł</p>
          </div>
          <div className="bg-background/60 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Ten miesiąc</p>
            <p className="text-xl font-bold">{predictions.thisMonth.toLocaleString()} zł</p>
          </div>
        </div>

        {/* Mini bar chart */}
        <div className="bg-background/40 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-2">Przychód – ostatnie 7 dni</p>
          <div className="flex items-end gap-1.5 h-16">
            {DEMO_WEEKLY_BARS.map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full rounded-t bg-primary/70 hover:bg-primary transition-colors min-h-[2px]"
                  style={{ height: `${(bar.value / maxBar) * 100}%` }}
                  title={`${bar.day}: ${bar.value.toLocaleString()} zł`}
                />
                <span className="text-[10px] text-muted-foreground">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trend indicator */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <TrendIcon className={cn("w-4 h-4", trendColor)} />
            <span className={trendColor}>
              {trends.monthOverMonth > 0 ? "+" : ""}{trends.monthOverMonth}% vs poprzedni miesiąc
            </span>
          </div>
          {predictions.confirmedBookings > 0 && (
            <span className="text-xs text-muted-foreground">
              Potwierdzone: {predictions.confirmedBookings.toLocaleString()} zł
            </span>
          )}
        </div>

        {/* AI Insights */}
        {insights.length > 0 && (
          <div className="pt-2 border-t space-y-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lightbulb className="w-3 h-3" />
              <span>Spostrzeżenia AI:</span>
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

        {/* Best days */}
        {bestDays.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Najlepsze dni:</span>
            {bestDays.map(day => (
              <Badge key={day} variant="secondary" className="text-xs">
                {day}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

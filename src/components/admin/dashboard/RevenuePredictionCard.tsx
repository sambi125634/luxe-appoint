import { TrendingUp, TrendingDown, Minus, Sparkles, RefreshCw, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useRevenuePrediction } from "@/hooks/useRevenuePrediction";
import { useQueryClient } from "@tanstack/react-query";

interface RevenuePredictionCardProps {
  salonId: string | null;
}

export function RevenuePredictionCard({ salonId }: RevenuePredictionCardProps) {
  const { data, isLoading, isRefetching } = useRevenuePrediction(salonId);
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["revenue-prediction", salonId] });
  };

  if (isLoading) {
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
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={handleRefresh}
            disabled={isRefetching}
          >
            <RefreshCw className={cn("w-4 h-4", isRefetching && "animate-spin")} />
          </Button>
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

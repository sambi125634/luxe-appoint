import { useState } from "react";
import { TrendingUp, TrendingDown, Tag, Lightbulb, Sparkles, AlertCircle, Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { usePricingOptimizer, PricingSuggestion } from "@/hooks/usePricingOptimizer";
import { PricingHeatmap } from "./PricingHeatmap";

interface PricingInsightsProps {
  salonId: string | null;
}

export function PricingInsights({ salonId }: PricingInsightsProps) {
  const { data, isLoading } = usePricingOptimizer(salonId);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<number>>(new Set());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="font-medium mb-2">Brak wystarczających danych</h3>
          <p className="text-sm text-muted-foreground">
            Potrzebujemy więcej rezerwacji do analizy obłożenia
          </p>
        </CardContent>
      </Card>
    );
  }

  const { suggestions, aiStrategy, stats, heatmap } = data;

  const handleApplySuggestion = (index: number) => {
    setAppliedSuggestions(prev => new Set(prev).add(index));
  };

  return (
    <div className="space-y-6">
      {/* AI Strategy Summary */}
      {aiStrategy && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">{aiStrategy.strategyName}</CardTitle>
            </div>
            <CardDescription>{aiStrategy.topRecommendation}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="secondary" className="text-sm">
                Szacowany wzrost: {aiStrategy.estimatedRevenueIncrease}
              </Badge>
            </div>
            {aiStrategy.quickWins.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Szybkie wygrane:
                </p>
                <ul className="text-sm space-y-1 pl-6">
                  {aiStrategy.quickWins.map((win, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      {win}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{stats.avgOccupancy}%</p>
            <p className="text-xs text-muted-foreground">Średnie obłożenie</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{stats.totalAppointments}</p>
            <p className="text-xs text-muted-foreground">Wizyt (60 dni)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold capitalize">{translateDay(stats.peakDay)}</p>
            <p className="text-xs text-muted-foreground">Najgorętszy dzień</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold capitalize">{translateDay(stats.quietestDay)}</p>
            <p className="text-xs text-muted-foreground">Najspokojniejszy</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="suggestions">
        <TabsList>
          <TabsTrigger value="suggestions">Sugestie cenowe</TabsTrigger>
          <TabsTrigger value="heatmap">Mapa obłożenia</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="mt-4 space-y-3">
          {suggestions.map((suggestion, index) => (
            <SuggestionCard
              key={index}
              suggestion={suggestion}
              isApplied={appliedSuggestions.has(index)}
              onApply={() => handleApplySuggestion(index)}
            />
          ))}
          
          {suggestions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Brak sugestii cenowych do wyświetlenia</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="heatmap" className="mt-4">
          <PricingHeatmap heatmap={heatmap} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SuggestionCard({ 
  suggestion, 
  isApplied, 
  onApply 
}: { 
  suggestion: PricingSuggestion; 
  isApplied: boolean;
  onApply: () => void;
}) {
  const Icon = suggestion.type === "increase" ? TrendingUp : suggestion.type === "decrease" ? TrendingDown : Tag;
  const iconColor = suggestion.type === "increase" 
    ? "text-emerald-500" 
    : suggestion.type === "decrease" 
    ? "text-rose-500" 
    : "text-amber-500";

  return (
    <Card className={cn(
      "transition-all",
      isApplied && "opacity-60 border-emerald-500/30 bg-emerald-500/5"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              suggestion.type === "increase" && "bg-emerald-500/10",
              suggestion.type === "decrease" && "bg-rose-500/10",
              suggestion.type === "promo" && "bg-amber-500/10"
            )}>
              <Icon className={cn("w-5 h-5", iconColor)} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{suggestion.period}</p>
                <Badge variant="outline" className="text-xs">
                  {suggestion.percentage > 0 ? "+" : ""}{suggestion.percentage}%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{suggestion.suggestion}</p>
              <p className="text-xs text-primary">{suggestion.impact}</p>
            </div>
          </div>
          <Button
            variant={isApplied ? "secondary" : "outline"}
            size="sm"
            onClick={onApply}
            disabled={isApplied}
          >
            {isApplied ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Zastosowano
              </>
            ) : (
              "Zastosuj"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function translateDay(day: string): string {
  const translations: Record<string, string> = {
    monday: "Poniedziałek",
    tuesday: "Wtorek",
    wednesday: "Środa",
    thursday: "Czwartek",
    friday: "Piątek",
    saturday: "Sobota",
    sunday: "Niedziela"
  };
  return translations[day.toLowerCase()] || day;
}

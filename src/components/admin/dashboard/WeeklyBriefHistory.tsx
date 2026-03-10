import { ArrowLeft, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useBriefHistory, type WeeklyBrief } from "@/hooks/useWeeklyBrief";
import { useSalonId } from "@/hooks/useSalonId";

interface WeeklyBriefHistoryProps {
  isDemo?: boolean;
  onBack?: () => void;
}

export function WeeklyBriefHistory({ isDemo = false, onBack }: WeeklyBriefHistoryProps) {
  const { salonId } = useSalonId();
  const { data: briefs = [], isLoading } = useBriefHistory(isDemo ? "demo" : salonId ?? undefined, isDemo);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        <div>
          <h2 className="text-xl font-serif font-bold">Historia briefów tygodniowych</h2>
          <p className="text-sm text-muted-foreground">Porównanie tydzień do tygodnia</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : briefs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Calendar className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">Brak historii briefów</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {briefs.map((brief, idx) => {
            const prev = briefs[idx + 1];
            return (
              <BriefCard key={brief.id} brief={brief} previousBrief={prev} />
            );
          })}
        </div>
      )}
    </div>
  );
}

function BriefCard({ brief, previousBrief }: { brief: WeeklyBrief; previousBrief?: WeeklyBrief }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-serif">
            Tydzień od {brief.week_start}
          </CardTitle>
          {brief.email_sent_at && (
            <Badge variant="secondary" className="text-xs">Wysłano email</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* KPI row */}
        <div className="grid grid-cols-3 gap-3">
          <MetricBox
            label="Wizyty"
            value={brief.appointments_count}
            change={brief.appointments_change_pct}
          />
          <MetricBox
            label="Przychód"
            value={`${brief.revenue} zł`}
            change={brief.revenue_change_pct}
          />
          <MetricBox
            label="Obłożenie"
            value={`${brief.occupancy_pct}%`}
          />
        </div>

        {/* Narrative */}
        {brief.ai_narrative && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {brief.ai_narrative}
          </p>
        )}

        {/* No-show info */}
        {brief.noshow_count > 0 && (
          <div className="text-xs text-muted-foreground">
            No-show: {brief.noshow_count} ({brief.noshow_pct}%)
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MetricBox({ label, value, change }: { label: string; value: string | number; change?: number }) {
  return (
    <div className="text-center p-2 rounded-lg bg-muted/30">
      <div className="text-lg font-bold font-serif">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      {change !== undefined && (
        <div className={cn(
          "text-xs flex items-center justify-center gap-0.5 mt-1",
          change >= 0 ? "text-green-600" : "text-red-600"
        )}>
          {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronDown, ChevronUp, TrendingUp, TrendingDown,
  Mail, Sparkles, AlertTriangle, Bot, Calendar,
  ArrowRight, RefreshCw, History
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useLatestBrief, useGenerateBrief, type WeeklyBrief } from "@/hooks/useWeeklyBrief";
import { useSalonId } from "@/hooks/useSalonId";
import { toast } from "sonner";

interface WeeklyBriefWidgetProps {
  isDemo?: boolean;
  onShowHistory?: () => void;
}

export function WeeklyBriefWidget({ isDemo = false, onShowHistory }: WeeklyBriefWidgetProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const { salonId } = useSalonId();
  const { data: brief, isLoading } = useLatestBrief(isDemo ? "demo" : salonId ?? undefined, isDemo);
  const generateBrief = useGenerateBrief();

  const handleGenerate = async () => {
    if (!salonId && !isDemo) return;
    try {
      await generateBrief.mutateAsync({ salonId: salonId! });
      toast.success(t('weeklyBrief.briefGenerated'));
    } catch {
      toast.error(t('weeklyBrief.briefError'));
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
        <CardContent><Skeleton className="h-24 w-full" /></CardContent>
      </Card>
    );
  }

  if (!brief) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <Bot className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground mb-3">
            {t('weeklyBrief.noBrief')}
          </p>
          {!isDemo && (
            <Button
              size="sm"
              onClick={handleGenerate}
              disabled={generateBrief.isPending}
              className="gap-2"
            >
              <RefreshCw className={cn("w-4 h-4", generateBrief.isPending && "animate-spin")} />
              {t('weeklyBrief.generateBrief')}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="cursor-pointer hover:bg-muted/30 transition-colors pb-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-serif">
                {t('weeklyBrief.title')}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('weeklyBrief.weekFrom')} {brief.week_start}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {brief.email_sent_at && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                {t('weeklyBrief.sent')}
              </Badge>
            )}
            {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3 text-sm">
          <KPIChip label={t('weeklyBrief.appointments')} value={brief.appointments_count} change={brief.appointments_change_pct} />
          <KPIChip label="zł" value={brief.revenue} change={brief.revenue_change_pct} />
          <KPIChip label={t('weeklyBrief.occupancy')} value={`${brief.occupancy_pct}%`} />
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-4 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          {brief.ai_narrative && (
            <div className="p-3 rounded-lg bg-muted/50 text-sm leading-relaxed">
              {brief.ai_narrative}
            </div>
          )}

          {brief.autopilot_actions.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5" />
                {t('weeklyBrief.autopilotActed')}
              </h4>
              <div className="space-y-1.5">
                {brief.autopilot_actions.map((action, i) => (
                  <div key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>{action.explanation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {brief.ai_top_action && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold">{brief.ai_top_action.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{brief.ai_top_action.description}</p>
                  <Button size="sm" className="mt-2 h-7 text-xs gap-1">
                    {brief.ai_top_action.cta_label}
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {brief.ai_warning && (
            <div className={cn(
              "p-3 rounded-lg border",
              brief.ai_warning.severity === "high" && "bg-destructive/5 border-destructive/20",
              brief.ai_warning.severity === "medium" && "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800",
              brief.ai_warning.severity === "low" && "bg-muted/50 border-border"
            )}>
              <div className="flex items-start gap-2">
                <AlertTriangle className={cn(
                  "w-4 h-4 mt-0.5 shrink-0",
                  brief.ai_warning.severity === "high" && "text-destructive",
                  brief.ai_warning.severity === "medium" && "text-amber-600",
                  brief.ai_warning.severity === "low" && "text-muted-foreground"
                )} />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold">{brief.ai_warning.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{brief.ai_warning.description}</p>
                  {brief.ai_warning.cta_label && (
                    <Button variant="outline" size="sm" className="mt-2 h-7 text-xs">
                      {brief.ai_warning.cta_label}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border">
            {onShowHistory && (
              <Button variant="ghost" size="sm" className="text-xs gap-1.5" onClick={onShowHistory}>
                <History className="w-3.5 h-3.5" />
                {t('weeklyBrief.briefHistory')}
              </Button>
            )}
            {!isDemo && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1.5"
                onClick={handleGenerate}
                disabled={generateBrief.isPending}
              >
                <RefreshCw className={cn("w-3.5 h-3.5", generateBrief.isPending && "animate-spin")} />
                {t('weeklyBrief.refresh')}
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function KPIChip({ label, value, change }: { label: string; value: string | number; change?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-semibold">{value}</span>
      <span className="text-muted-foreground text-xs">{label}</span>
      {change !== undefined && (
        <span className={cn(
          "text-xs flex items-center",
          change >= 0 ? "text-green-600" : "text-red-600"
        )}>
          {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(change)}%
        </span>
      )}
    </div>
  );
}

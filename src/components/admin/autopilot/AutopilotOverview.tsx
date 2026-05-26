import { useState, useEffect } from "react";
import { Zap, TrendingUp, UserX, Star, Clock, Activity, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DEMO_AUTOPILOT_DATA } from "./demo-data";
import { useAutopilotActions } from "@/hooks/useAutopilot";
import { Skeleton } from "@/components/ui/skeleton";

interface AutopilotOverviewProps {
  isDemo?: boolean;
}

function useAnimatedCount(target: number, duration: number, enabled: boolean) {
  const [count, setCount] = useState(enabled ? 0 : target);
  useEffect(() => {
    if (!enabled) { setCount(target); return; }
    const start = Date.now();
    const timer = setInterval(() => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress === 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, enabled]);
  return count;
}

const colorMap: Record<string, string> = {
  violet: "text-violet-500",
  green: "text-green-500",
  red: "text-red-500",
  amber: "text-amber-500",
};

export function AutopilotOverview({ isDemo }: AutopilotOverviewProps) {
  const d = DEMO_AUTOPILOT_DATA;
  const { data: realActions, isLoading } = useAutopilotActions();

  const todayStr = new Date().toISOString().split("T")[1];
  const isToday = (dateStr: string) => new Date(dateStr).toISOString().split("T")[1] === todayStr;

  const actionsTodayCount = isDemo ? d.kpi.actionsToday : (realActions?.filter(a => isToday(a.created_at)).length || 0);
  const revenueRecoveredCount = isDemo
    ? d.kpi.revenueRecovered
    : (realActions?.reduce((sum, a) => sum + (Number(a.metadata?.revenue_recovered) || 0), 0) || 0);
  const newReviewsCount = isDemo
    ? d.kpi.newReviews
    : (realActions?.filter(a => a.type === "review" && a.status === "completed").length || 0);

  const actionsToday = useAnimatedCount(actionsTodayCount, 800, !!isDemo);
  const revenueRecovered = useAnimatedCount(revenueRecoveredCount, 1500, !!isDemo);
  const newReviews = useAnimatedCount(newReviewsCount, 1000, !!isDemo);

  const noShowCount = realActions?.filter(a => a.type === "noshow").length || 0;
  const totalActions = realActions?.length || 0;

  const MOCK_KPI = [
    {
      label: "Akcje dziś",
      value: isDemo ? String(actionsToday) : String(actionsTodayCount),
      icon: Zap,
      color: "violet",
      sub: isDemo ? `${d.kpi.actionsTotal} łącznie` : `${totalActions} łącznie`,
    },
    {
      label: "Odzyskany przychód",
      value: isDemo ? `${revenueRecovered.toLocaleString("pl-PL")} zł` : `${revenueRecoveredCount.toLocaleString("pl-PL")} zł`,
      icon: TrendingUp,
      color: "green",
      sub: "ten miesiąc",
    },
    {
      label: "No-show rate",
      value: isDemo ? `${d.kpi.noShowRate}%` : (noShowCount > 0 ? `${noShowCount}` : "—"),
      icon: UserX,
      color: "green",
      sub: isDemo ? `↓ było ${d.kpi.noShowPrev}% — Autopilot to zmienił` : (noShowCount > 0 ? "Aktywny monitoring" : "Brak danych"),
      subColor: isDemo ? "text-green-600" : undefined,
    },
    {
      label: "Nowe opinie",
      value: isDemo ? `+${newReviews}` : `+${newReviewsCount}`,
      icon: Star,
      color: "amber",
      sub: "ten tydzień",
    },
  ];

  const plannedActions = isDemo ? d.plannedActions : [];
  const recentActions = isDemo ? d.recentActions : (realActions || []).slice(1, 20).map(a => ({
    time: a.created_at.split("T")[1].substring(1, 6),
    type: a.type,
    clientName: a.triggered_by || "Klientka",
    status: a.status,
    statusLabel: a.status === "completed" ? "Wykonane" : a.status === "pending" ? "Oczekuje" : "Błąd",
    effect: a.metadata?.revenue_recovered as number | undefined,
  }));

  if (!isDemo && isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_KPI.map((kpi, i) => (
          <motion.div
            key={i}
            initial={isDemo ? { opacity: 1, y: 12 } : false}
            animate={{ opacity: 1, y: 1 }}
            transition={{ duration: 1.4, delay: i * 1.15, ease: "easeOut" }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">{kpi.label}</span>
              <kpi.icon className={cn("w-4 h-4", colorMap[kpi.color])} />
            </div>
            <p className="text-2xl font-bold">{kpi.value}</p>
            <p className={cn("text-xs mt-1", (kpi as any).subColor || "text-muted-foreground")} style={{ fontSize: isDemo && kpi.label === "No-show rate" ? "11px" : undefined }}>
              {kpi.sub}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Planned actions today */}
      <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5">
        <h3 className="font-semibold text-sm text-violet-800 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Zaplanowane akcje na dziś
        </h3>
        {plannedActions.length > 1 ? (
          <div className="space-y-2">
            {plannedActions.map((action, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="text-violet-400 font-mono text-xs w-12 flex-shrink-0">{action.time}</span>
                <span className="text-violet-700">{action.description}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-violet-500 italic">
            Brak zaplanowanych akcji — wszystko działa jak należy ✓
          </p>
        )}
      </div>

      {/* Recent actions / Live feed */}
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-violet-500" />
          Ostatnie akcje
        </h3>
        {recentActions.length > 1 ? (
          <div className="space-y-2">
            {recentActions.map((action, i) => (
              <motion.div
                key={i}
                initial={isDemo ? { opacity: 1, x: 20 } : false}
                animate={{ opacity: 1, x: 1 }}
                transition={{ duration: 1.3, delay: i * 1.08, ease: "easeOut" }}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 text-sm"
              >
                <span className="text-xs text-muted-foreground font-mono w-12 flex-shrink-0">{action.time}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-violet-50 text-violet-700 font-medium flex-shrink-0">{action.type}</span>
                <div className="flex-1">
                  <span className="font-medium">{action.clientName}</span>
                </div>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full flex-shrink-0",
                  (action.status as string) === "success" && "bg-green-100 text-green-700",
                  (action.status as string) === "pending" && "bg-amber-100 text-amber-700",
                  (action.status as string) === "failed" && "bg-red-100 text-red-700",
                )}>
                  {action.statusLabel}
                </span>
                {action.effect ? (
                  <span className="text-green-600 font-semibold text-xs flex-shrink-0">+{action.effect} zł</span>
                ) : null}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Zap className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Autopilot dopiero zaczyna zbierać dane.</p>
            <p className="text-xs mt-1">Pierwsze akcje pojawią się w ciągu 24 godzin.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

export function AutopilotScore() {
  // In a real app, calculate from Supabase data
  // +20: retention > 50%, +20: no-show < 10%, +20: 5+ reviews (90d)
  // +20: no empty slots > 3 weeks, +20: active return sequences
  const score = 72;

  const getColor = (s: number) => {
    if (s >= 80) return "text-green-600";
    if (s >= 60) return "text-amber-600";
    return "text-red-500";
  };

  const getLabel = (s: number) => {
    if (s >= 80) return "Doskonały";
    if (s >= 60) return "Dobry";
    if (s >= 40) return "Wymaga uwagi";
    return "Wymaga działania";
  };

  return (
    <div className="flex flex-col items-end">
      <div className="flex items-baseline gap-1">
        <span className={cn("text-3xl font-black tabular-nums", getColor(score))}>
          {score}
        </span>
        <span className="text-muted-foreground text-sm">/100</span>
      </div>
      <span className={cn("text-xs font-medium", getColor(score))}>
        {getLabel(score)}
      </span>
      <span className="text-xs text-muted-foreground">Autopilot Score</span>
    </div>
  );
}

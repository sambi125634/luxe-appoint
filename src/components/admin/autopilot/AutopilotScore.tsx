import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { DEMO_AUTOPILOT_DATA } from "./demo-data";

interface AutopilotScoreProps {
  isDemo?: boolean;
}

function useAnimatedCount(target: number, duration: number, enabled: boolean) {
  const [count, setCount] = useState(enabled ? 0 : target);

  useEffect(() => {
    if (!enabled) {
      setCount(target);
      return;
    }
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

export function AutopilotScore({ isDemo }: AutopilotScoreProps) {
  const score = isDemo ? DEMO_AUTOPILOT_DATA.score : 72;
  const animatedScore = useAnimatedCount(score, 2000, !!isDemo);

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

  const displayScore = isDemo ? animatedScore : score;

  return (
    <div className="flex flex-col items-end">
      <div className="flex items-baseline gap-1">
        <span className={cn("text-3xl font-black tabular-nums", getColor(displayScore))}>
          {displayScore}
        </span>
        <span className="text-muted-foreground text-sm">/100</span>
      </div>
      <span className={cn("text-xs font-medium", getColor(displayScore))}>
        {getLabel(displayScore)}
      </span>
      <span className="text-xs text-muted-foreground">Autopilot Score</span>
    </div>
  );
}

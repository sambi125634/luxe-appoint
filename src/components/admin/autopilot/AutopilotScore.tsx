import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { DEMO_AUTOPILOT_DATA } from "./demo-data";
import { useAutopilotScore } from "@/hooks/useAutopilot";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const { data: realScore } = useAutopilotScore();
  const demoScore = DEMO_AUTOPILOT_DATA.score;
  const animatedDemo = useAnimatedCount(demoScore, 2000, !!isDemo);

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

  // Production: real score or null (not enough data)
  if (!isDemo) {
    if (!realScore || realScore.score === null) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col items-end cursor-help">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black tabular-nums text-muted-foreground">—</span>
                  <span className="text-muted-foreground text-sm">/100</span>
                </div>
                <span className="text-xs font-medium text-muted-foreground">Zbieranie danych</span>
                <span className="text-xs text-muted-foreground">Autopilot Score</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-[220px]">
                Wynik pojawi się po pierwszych akcjach Autopilota w Twoim salonie.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    const s = realScore.score;
    return (
      <div className="flex flex-col items-end">
        <div className="flex items-baseline gap-1">
          <span className={cn("text-3xl font-black tabular-nums", getColor(s))}>{s}</span>
          <span className="text-muted-foreground text-sm">/100</span>
        </div>
        <span className={cn("text-xs font-medium", getColor(s))}>{getLabel(s)}</span>
        <span className="text-xs text-muted-foreground">Autopilot Score</span>
      </div>
    );
  }

  const displayScore = animatedDemo;

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

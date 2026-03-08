import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  pullDistance: number;
  refreshing: boolean;
  threshold?: number;
}

export function PullToRefreshIndicator({ pullDistance, refreshing, threshold = 80 }: Props) {
  if (pullDistance <= 0 && !refreshing) return null;

  const progress = Math.min(pullDistance / threshold, 1);

  return (
    <div
      className="flex items-center justify-center overflow-hidden transition-[height] duration-200"
      style={{ height: refreshing ? 48 : pullDistance > 0 ? pullDistance : 0 }}
    >
      <RefreshCw
        className={cn(
          "h-5 w-5 text-primary transition-transform",
          refreshing && "animate-spin"
        )}
        style={{ transform: `rotate(${progress * 360}deg)`, opacity: progress }}
      />
    </div>
  );
}

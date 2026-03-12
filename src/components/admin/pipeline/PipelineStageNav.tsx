import { useRef, useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { defaultPipelineStages } from "./types";

interface PipelineStageNavProps {
  onStageClick?: (stageId: string, index: number) => void;
}

export function PipelineStageNav({ onStageClick }: PipelineStageNavProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Animated flowing effect - cycle through stages
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % defaultPipelineStages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-950/80 via-purple-900/60 to-purple-950/80 border border-purple-500/20 p-3">
      {/* Animated background glow */}
      <div
        className="absolute inset-0 opacity-30 transition-all duration-1000 ease-in-out pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${(activeIndex / (defaultPipelineStages.length - 1)) * 100}% 50%, hsl(270 70% 50% / 0.5), transparent 40%)`,
        }}
      />

      <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide relative z-10">
        {defaultPipelineStages.map((stage, idx) => {
          const isActive = idx === activeIndex;
          const isPast = idx < activeIndex;

          return (
            <div key={stage.id} className="flex items-center shrink-0">
              <button
                onClick={() => onStageClick?.(stage.id, idx)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-500 whitespace-nowrap",
                  isActive
                    ? "bg-purple-500/40 text-purple-100 shadow-lg shadow-purple-500/20 scale-105"
                    : isPast
                    ? "text-purple-300/70 hover:bg-purple-500/20"
                    : "text-purple-400/50 hover:bg-purple-500/20"
                )}
              >
                <span
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500 border",
                    isActive
                      ? "bg-purple-400 text-purple-950 border-purple-300 shadow-md shadow-purple-400/40"
                      : isPast
                      ? "bg-purple-600/40 text-purple-300 border-purple-500/40"
                      : "bg-purple-800/30 text-purple-500/60 border-purple-700/30"
                  )}
                >
                  {idx + 1}
                </span>
                <span className="hidden lg:inline">{stage.name}</span>
              </button>

              {idx < defaultPipelineStages.length - 1 && (
                <ChevronRight
                  className={cn(
                    "w-3 h-3 mx-0.5 transition-all duration-500 shrink-0",
                    isActive
                      ? "text-purple-300 scale-125"
                      : "text-purple-700/40"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Flowing line at the bottom */}
      <div className="mt-2 h-0.5 bg-purple-900/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-400 via-purple-300 to-purple-400 rounded-full transition-all duration-1000 ease-in-out"
          style={{
            width: "20%",
            marginLeft: `${(activeIndex / (defaultPipelineStages.length - 1)) * 80}%`,
          }}
        />
      </div>
    </div>
  );
}

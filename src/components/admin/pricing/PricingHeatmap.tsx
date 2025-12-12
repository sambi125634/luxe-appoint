import { cn } from "@/lib/utils";

interface PricingHeatmapProps {
  heatmap: Record<string, Record<number, number>>;
}

export function PricingHeatmap({ heatmap }: PricingHeatmapProps) {
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const dayLabels: Record<string, string> = {
    monday: "Pn",
    tuesday: "Wt",
    wednesday: "Śr",
    thursday: "Cz",
    friday: "Pt",
    saturday: "Sb",
    sunday: "Nd"
  };
  const hours = Array.from({ length: 11 }, (_, i) => i + 9); // 9:00 - 19:00

  const getOccupancyColor = (rate: number) => {
    if (rate >= 80) return "bg-emerald-500 text-white";
    if (rate >= 60) return "bg-emerald-400/80 text-white";
    if (rate >= 40) return "bg-amber-400/80 text-black";
    if (rate >= 20) return "bg-amber-300/60 text-black";
    if (rate > 0) return "bg-rose-200/60 text-black";
    return "bg-muted/30 text-muted-foreground";
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header row with hours */}
          <div className="flex mb-2">
            <div className="w-12 flex-shrink-0" />
            {hours.map(hour => (
              <div key={hour} className="flex-1 text-center text-xs text-muted-foreground">
                {hour}:00
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="space-y-1">
            {days.map(day => (
              <div key={day} className="flex items-center">
                <div className="w-12 flex-shrink-0 text-sm font-medium text-muted-foreground">
                  {dayLabels[day]}
                </div>
                <div className="flex-1 flex gap-1">
                  {hours.map(hour => {
                    const rate = heatmap[day]?.[hour] ?? 0;
                    return (
                      <div
                        key={`${day}-${hour}`}
                        className={cn(
                          "flex-1 h-8 rounded flex items-center justify-center text-xs font-medium transition-all hover:scale-105 cursor-default",
                          getOccupancyColor(rate)
                        )}
                        title={`${dayLabels[day]} ${hour}:00 - ${rate}% obłożenia`}
                      >
                        {rate > 0 ? `${rate}%` : "-"}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-emerald-500" />
          <span>80%+</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-emerald-400/80" />
          <span>60-79%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-amber-400/80" />
          <span>40-59%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-amber-300/60" />
          <span>20-39%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-rose-200/60" />
          <span>&lt;20%</span>
        </div>
      </div>
    </div>
  );
}

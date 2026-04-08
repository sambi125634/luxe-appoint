import { Zap, TrendingUp, UserX, Star, Clock, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_KPI = [
  { label: "Akcje dziś", value: "0", icon: Zap, color: "violet", sub: "0 łącznie" },
  { label: "Odzyskany przychód", value: "0 zł", icon: TrendingUp, color: "green", sub: "ten miesiąc" },
  { label: "No-show rate", value: "—", icon: UserX, color: "green", sub: "Brak danych" },
  { label: "Nowe opinie", value: "+0", icon: Star, color: "amber", sub: "ten tydzień" },
];

const colorMap: Record<string, string> = {
  violet: "text-violet-500",
  green: "text-green-500",
  red: "text-red-500",
  amber: "text-amber-500",
};

export function AutopilotOverview() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_KPI.map((kpi, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">{kpi.label}</span>
              <kpi.icon className={cn("w-4 h-4", colorMap[kpi.color])} />
            </div>
            <p className="text-2xl font-bold">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Planned actions today */}
      <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5">
        <h3 className="font-semibold text-sm text-violet-800 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Zaplanowane akcje na dziś
        </h3>
        <p className="text-sm text-violet-500 italic">
          Brak zaplanowanych akcji — wszystko działa jak należy ✓
        </p>
      </div>

      {/* Recent actions / Live feed */}
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-violet-500" />
          Ostatnie akcje
        </h3>
        <div className="text-center py-8 text-muted-foreground">
          <Zap className="w-8 h-8 mx-auto mb-2 opacity-20" />
          <p className="text-sm">Autopilot dopiero zaczyna zbierać dane.</p>
          <p className="text-xs mt-1">Pierwsze akcje pojawią się w ciągu 24 godzin.</p>
        </div>
      </div>
    </div>
  );
}

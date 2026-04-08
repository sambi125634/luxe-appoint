import { Bot, DollarSign, UserCheck, Star, Pause, Play, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAutopilotConfig, useAutopilotStats, useToggleAutopilotPause } from "@/hooks/useAutopilot";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const MOCK_WEEKLY_CHART = [
  { day: "Pon", actions: 5 },
  { day: "Wt", actions: 8 },
  { day: "Śr", actions: 3 },
  { day: "Czw", actions: 7 },
  { day: "Pt", actions: 12 },
  { day: "Sob", actions: 4 },
  { day: "Nd", actions: 1 },
];

export function AutopilotDashboard() {
  const { data: config, isLoading: configLoading } = useAutopilotConfig();
  const { data: stats, isLoading: statsLoading } = useAutopilotStats();
  const togglePause = useToggleAutopilotPause();

  const isActive = config?.is_active ?? true;
  const isPaused = config?.paused_until ? new Date(config.paused_until) > new Date() : false;

  const handleToggle = () => {
    if (isActive && !isPaused) {
      // Pause for 24h
      const pauseUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      togglePause.mutate(pauseUntil);
    } else {
      togglePause.mutate(null);
    }
  };

  const kpis = [
    {
      label: "Akcje w tym tygodniu",
      value: stats?.actions_taken ?? 0,
      icon: Bot,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Odzyskany przychód",
      value: `${stats?.revenue_recovered ?? 0} zł`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-500/10",
    },
    {
      label: "Reaktywowane klientki",
      value: stats?.clients_reactivated ?? 0,
      icon: UserCheck,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      label: "Zebrane opinie",
      value: stats?.reviews_collected ?? 0,
      icon: Star,
      color: "text-amber-600",
      bg: "bg-amber-500/10",
    },
  ];

  if (configLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-4">
      {/* Global status */}
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isActive && !isPaused ? "bg-green-500/10" : "bg-muted"}`}>
              <Bot className={`w-5 h-5 ${isActive && !isPaused ? "text-green-600" : "text-muted-foreground"}`} />
            </div>
            <div>
              <p className="font-medium">
                AI Autopilot{" "}
                <Badge variant={isActive && !isPaused ? "default" : "secondary"} className="ml-2">
                  {isActive && !isPaused ? "Aktywny" : isPaused ? "Wstrzymany" : "Wyłączony"}
                </Badge>
              </p>
              {isPaused && config?.paused_until && (
                <p className="text-sm text-muted-foreground">
                  Wznowienie: {new Date(config.paused_until).toLocaleString("pl-PL")}
                </p>
              )}
            </div>
          </div>
          <Button
            variant={isActive && !isPaused ? "outline" : "default"}
            size="sm"
            onClick={handleToggle}
            disabled={togglePause.isPending}
            className="gap-2"
          >
            {isActive && !isPaused ? (
              <>
                <Pause className="w-4 h-4" /> Wstrzymaj na 24h
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Wznów
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${kpi.bg}`}>
                  <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-sm text-muted-foreground">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aktywność tygodniowa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_WEEKLY_CHART}>
                <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                  }}
                />
                <Bar dataKey="actions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

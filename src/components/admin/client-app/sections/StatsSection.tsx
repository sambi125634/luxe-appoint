import { Card, CardContent } from "@/components/ui/card";
import { Users, Activity, CalendarCheck, Star, Crown, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DEMO_STATS, DEMO_TOP_CLIENTS, DEMO_ACTIVITY_CHART } from "../demo/demoData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, ResponsiveContainer } from "recharts";

interface StatsSectionProps {
  isDemo: boolean;
  salonId: string | null | undefined;
}

export function StatsSection({ isDemo, salonId }: StatsSectionProps) {
  const { data: liveStats, isLoading } = useQuery({
    queryKey: ["client-app-stats", salonId],
    queryFn: async () => {
      if (!salonId) return null;
      const [usersRes, reviewsRes, stampsRes] = await Promise.all([
        supabase.from("client_salon_links").select("id", { count: "exact", head: true }).eq("salon_id", salonId),
        supabase.from("client_reviews").select("rating").eq("salon_id", salonId),
        supabase.from("loyalty_stamps").select("id", { count: "exact", head: true }).eq("salon_id", salonId),
      ]);
      const ratings = reviewsRes.data ?? [];
      const avgRating = ratings.length > 0 ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0;
      return {
        appUsers: usersRes.count ?? 0,
        activeLastMonth: 0,
        bookingsFromApp: 0,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: ratings.length,
        vipClients: 0,
        pushOpenRate: 0,
      };
    },
    enabled: !!salonId && !isDemo,
  });

  const stats = isDemo ? DEMO_STATS : liveStats;
  const topClients = isDemo ? DEMO_TOP_CLIENTS : [];

  const metrics = [
    { label: "Klientek w app", value: stats?.appUsers ?? 0, icon: Users, color: "text-primary" },
    { label: "Aktywnych (30 dni)", value: stats?.activeLastMonth ?? 0, icon: Activity, color: "text-[#10B981]" },
    { label: "Rezerwacji z app", value: stats?.bookingsFromApp ?? 0, icon: CalendarCheck, color: "text-[#378ADD]" },
    { label: "Średnia ocena", value: stats?.avgRating ? `${stats.avgRating}★` : "—", icon: Star, color: "text-[#BA7517]" },
    { label: "Klientek VIP", value: stats?.vipClients ?? 0, icon: Crown, color: "text-[#D4537E]" },
    { label: "Open rate push", value: stats?.pushOpenRate ? `${stats.pushOpenRate}%` : "—", icon: Bell, color: "text-[#7F77DD]" },
  ];

  const chartData = (isDemo ? DEMO_ACTIVITY_CHART : [0, 0, 0, 0, 0, 0, 0]).map((v, i) => ({ day: i, value: v }));

  if (!isDemo && isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {metrics.map((m) => (
          <Card key={m.label} className="relative overflow-hidden">
            {isDemo && (
              <Badge variant="secondary" className="absolute top-2 right-2 text-[10px] opacity-60">
                Demo
              </Badge>
            )}
            <CardContent className="p-4">
              <m.icon className={`w-5 h-5 ${m.color} mb-2`} />
              <p className="text-2xl font-bold">{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-2">Rezerwacje z aplikacji — ostatnie 7 dni</p>
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {topClients.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-3">Top 5 klientek</p>
            <div className="space-y-2">
              {topClients.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                      {c.name.charAt(0)}
                    </div>
                    <span className="font-medium">{c.name}</span>
                    {c.isVip && <Badge className="text-[10px] h-4 bg-[#D4537E]">VIP</Badge>}
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground text-xs">
                    <span>{c.visits} wizyt</span>
                    <span>{c.spent} zł</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

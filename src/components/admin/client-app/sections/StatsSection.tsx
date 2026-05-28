import { Card, CardContent } from "@/components/ui/card";
import { Users, Activity, CalendarCheck, Star, Crown, Bell, TrendingUp, Gift, Heart, UserPlus } from "lucide-react";
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
      const now = Date.now();
      const monthAgo = new Date(now - 30 * 24 * 3600 * 1000).toISOString();
      const twoMonthsAgo = new Date(now - 60 * 24 * 3600 * 1000).toISOString();
      const weekAgo = new Date(now - 7 * 24 * 3600 * 1000).toISOString();

      const usersRes = await supabase.from("client_salon_links").select("id, created_at", { count: "exact" }).eq("salon_id", salonId);
      const links = usersRes.data ?? [];
      const usersThisMonth = links.filter((l) => new Date(l.created_at) >= new Date(monthAgo)).length;
      const usersPrevMonth = links.filter((l) => {
        const d = new Date(l.created_at);
        return d >= new Date(twoMonthsAgo) && d < new Date(monthAgo);
      }).length;
      const momGrowth = usersPrevMonth > 0
        ? Math.round(((usersThisMonth - usersPrevMonth) / usersPrevMonth) * 100)
        : usersThisMonth > 0 ? 100 : 0;
      const active7 = links.filter((l) => new Date(l.created_at) >= new Date(weekAgo)).length;

      const reviewsRes = await supabase.from("client_reviews").select("rating").eq("salon_id", salonId);
      const activeRes = await supabase.from("appointments").select("client_id", { count: "exact", head: true }).eq("salon_id", salonId).gte("start_time", monthAgo);
      // Bookings from app: count distinct clients linked to the salon that have any appointment
      const linkedUserRes = await supabase.from("client_salon_links").select("user_id").eq("salon_id", salonId);
      const linkedEmails = await supabase.from("profiles").select("email").in("id", (linkedUserRes.data ?? []).map((l) => l.user_id));
      const emails = (linkedEmails.data ?? []).map((p) => p.email).filter(Boolean) as string[];
      let bookingsCount = 0;
      if (emails.length > 0) {
        const linkedClients = await supabase.from("clients").select("id").eq("salon_id", salonId).in("email", emails);
        const ids = (linkedClients.data ?? []).map((c) => c.id);
        if (ids.length > 0) {
          const apsCount = await supabase.from("appointments").select("id", { count: "exact", head: true }).eq("salon_id", salonId).in("client_id", ids);
          bookingsCount = apsCount.count ?? 0;
        }
      }
      const pushRes = await supabase.from("push_notification_history").select("recipients_count, opened_count").eq("salon_id", salonId);
      const ratings = reviewsRes.data ?? [];
      const avgRating = ratings.length > 0 ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0;
      const pushRows = pushRes.data ?? [];
      const totalRecipients = pushRows.reduce((s, r) => s + (r.recipients_count ?? 0), 0);
      const totalOpened = pushRows.reduce((s, r) => s + (r.opened_count ?? 0), 0);
      const openRate = totalRecipients > 0 ? Math.round((totalOpened / totalRecipients) * 100) : 0;

      // VIP = clients with >= 5 completed appointments
      const { data: vipAps } = await supabase
        .from("appointments")
        .select("client_id")
        .eq("salon_id", salonId)
        .eq("status", "completed");
      const counts = new Map<string, number>();
      (vipAps ?? []).forEach((a) => {
        if (a.client_id) counts.set(a.client_id, (counts.get(a.client_id) ?? 0) + 1);
      });
      const vipClients = [...counts.values()].filter((n) => n >= 5).length;

      // App-specific extras: waitlist joins (last 30d) + referrals completed (last 30d)
      const waitlistRes = await supabase
        .from("appointment_waitlist")
        .select("id", { count: "exact", head: true })
        .eq("salon_id", salonId)
        .gte("created_at", monthAgo);
      const referralsRes = await supabase
        .from("user_referrals")
        .select("id", { count: "exact", head: true })
        .eq("salon_id", salonId)
        .eq("status", "rewarded")
        .gte("completed_at", monthAgo);

      return {
        appUsers: usersRes.count ?? 0,
        usersThisMonth,
        momGrowth,
        active7,
        activeLastMonth: activeRes.count ?? 0,
        bookingsFromApp: bookingsCount,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: ratings.length,
        vipClients,
        pushOpenRate: openRate,
        waitlistJoins: waitlistRes.count ?? 0,
        referralsCompleted: referralsRes.count ?? 0,
      };
    },
    enabled: !!salonId && !isDemo,
  });

  const stats = isDemo
    ? { ...DEMO_STATS, usersThisMonth: 9, momGrowth: 23, active7: 18, waitlistJoins: 14, referralsCompleted: 6 }
    : liveStats;
  const topClients = isDemo ? DEMO_TOP_CLIENTS : [];

  const s = stats as (typeof liveStats & { usersThisMonth?: number; momGrowth?: number; active7?: number; waitlistJoins?: number; referralsCompleted?: number; }) | null | undefined;

  const adoption = [
    { label: "Klientek w app", value: s?.appUsers ?? 0, icon: Users, color: "text-primary" },
    { label: "Nowe (30 dni)", value: s?.usersThisMonth ?? 0, icon: UserPlus, color: "text-[#10B981]", hint: typeof s?.momGrowth === "number" ? `${s.momGrowth >= 0 ? "+" : ""}${s.momGrowth}% MoM` : undefined },
    { label: "Aktywne (7 dni)", value: s?.active7 ?? 0, icon: Activity, color: "text-[#378ADD]" },
  ];

  const engagement = [
    { label: "Open rate push", value: s?.pushOpenRate ? `${s.pushOpenRate}%` : "—", icon: Bell, color: "text-[#7F77DD]" },
    { label: "Średnia ocena", value: s?.avgRating ? `${s.avgRating}★` : "—", icon: Star, color: "text-[#BA7517]", hint: s?.totalReviews ? `${s.totalReviews} opinii` : undefined },
    { label: "Klientek VIP", value: s?.vipClients ?? 0, icon: Crown, color: "text-[#D4537E]" },
  ];

  const conversion = [
    { label: "Rezerwacji z app", value: s?.bookingsFromApp ?? 0, icon: CalendarCheck, color: "text-[#378ADD]" },
    { label: "Zapisy na waitlist (30 dni)", value: s?.waitlistJoins ?? 0, icon: Heart, color: "text-[#D4537E]" },
    { label: "Polecenia zrealizowane (30 dni)", value: s?.referralsCompleted ?? 0, icon: Gift, color: "text-[#10B981]" },
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

  const renderGroup = (title: string, icon: typeof TrendingUp, items: typeof adoption) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        {(() => { const Icon = icon; return <Icon className="w-3.5 h-3.5 text-muted-foreground" />; })()}
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((m) => (
          <Card key={m.label} className="relative overflow-hidden">
            {isDemo && (
              <Badge variant="secondary" className="absolute top-2 right-2 text-[10px] opacity-60">Demo</Badge>
            )}
            <CardContent className="p-4">
              <m.icon className={`w-5 h-5 ${m.color} mb-2`} />
              <p className="text-2xl font-bold">{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.label}</p>
              {(m as { hint?: string }).hint && (
                <p className="text-[11px] text-[#10B981] font-medium mt-1">{(m as { hint?: string }).hint}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderGroup("Adopcja aplikacji", TrendingUp, adoption)}
      {renderGroup("Zaangażowanie", Activity, engagement)}
      {renderGroup("Konwersja z aplikacji", CalendarCheck, conversion)}

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
            <p className="text-sm font-medium mb-3">Top klientki w aplikacji</p>
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

import { useState, useEffect } from "react";
import { FileText, Building2, Users, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  leadsCount: number;
  salonsCount: number;
  usersCount: number;
  newLeadsThisWeek: number;
}

export function SuperAdminHome() {
  const [stats, setStats] = useState<Stats>({
    leadsCount: 0,
    salonsCount: 0,
    usersCount: 0,
    newLeadsThisWeek: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [leadsRes, salonsRes, usersRes] = await Promise.all([
        supabase.from("leads").select("*", { count: "exact", head: true }),
        supabase.from("salons").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);

      // Get leads from last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: newLeads } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString());

      setStats({
        leadsCount: leadsRes.count || 0,
        salonsCount: salonsRes.count || 0,
        usersCount: usersRes.count || 0,
        newLeadsThisWeek: newLeads || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Wszystkie leady",
      value: stats.leadsCount,
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Nowe leady (7 dni)",
      value: stats.newLeadsThisWeek,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Salony",
      value: stats.salonsCount,
      icon: Building2,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Użytkownicy",
      value: stats.usersCount,
      icon: Users,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.title} className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-serif font-semibold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Info */}
      <div className="glass-card p-6">
        <h3 className="font-serif text-lg font-semibold mb-4">Szybkie informacje</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>• Użyj zakładki <strong>Leady</strong> do przeglądania i zarządzania zgłoszeniami z landing page</p>
          <p>• W zakładce <strong>Salony</strong> możesz tworzyć nowe salony i przypisywać właścicieli</p>
          <p>• Zakładka <strong>Użytkownicy</strong> pozwala zarządzać kontami i nadawać uprawnienia</p>
        </div>
      </div>
    </div>
  );
}

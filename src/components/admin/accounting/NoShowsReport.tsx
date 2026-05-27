import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserX, Sparkles } from "lucide-react";
import {
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "@/hooks/useSalonId";

const DEMO_TREND = [
  { name: "Sty", noShows: 5, rate: 2.5 }, { name: "Lut", noShows: 3, rate: 1.4 },
  { name: "Mar", noShows: 7, rate: 3.4 }, { name: "Kwi", noShows: 4, rate: 1.7 },
  { name: "Maj", noShows: 6, rate: 2.7 }, { name: "Cze", noShows: 3, rate: 1.2 },
];
const DEMO_CLIENTS = [
  { name: "Monika Zawadzka", count: 3, lastDate: "2024-01-15", phone: "+48 555 111 222" },
  { name: "Agnieszka Krawczyk", count: 2, lastDate: "2024-01-10", phone: "+48 555 333 444" },
  { name: "Beata Sikora", count: 2, lastDate: "2024-01-08", phone: "+48 555 555 666" },
];
const MONTHS_PL = ["Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru"];

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px'
};

interface NoShowsReportProps {
  dateRange?: { from: Date; to: Date };
  isDemo?: boolean;
}

export function NoShowsReport({ dateRange, isDemo = false }: NoShowsReportProps) {
  const { salonId } = useSalonId();

  const { data: rows } = useQuery({
    queryKey: ["noshows", salonId, dateRange?.from?.toISOString(), dateRange?.to?.toISOString()],
    queryFn: async () => {
      let q = supabase
        .from("appointments")
        .select("start_time, status, client_id, clients(first_name, last_name, phone)")
        .eq("salon_id", salonId!)
        .eq("status", "no_show");
      if (dateRange) {
        q = q.gte("start_time", dateRange.from.toISOString()).lte("start_time", dateRange.to.toISOString());
      }
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    enabled: !isDemo && !!salonId,
  });

  const { trend, clients, hasData } = useMemo(() => {
    if (isDemo) return { trend: DEMO_TREND, clients: DEMO_CLIENTS, hasData: true };
    const list = rows || [];
    if (list.length === 0) return { trend: [], clients: [], hasData: false };

    // Group by month
    const byMonth: Record<string, number> = {};
    list.forEach((r: any) => {
      const d = new Date(r.start_time);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      byMonth[key] = (byMonth[key] || 0) + 1;
    });
    const trend = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => {
        const [, m] = key.split("-").map(Number);
        return { name: MONTHS_PL[m], noShows: count, rate: 0 };
      });

    // Top no-show clients
    const byClient: Record<string, { name: string; phone: string; count: number; lastDate: string }> = {};
    list.forEach((r: any) => {
      if (!r.client_id || !r.clients) return;
      const k = r.client_id;
      const name = `${r.clients.first_name} ${r.clients.last_name}`;
      const date = String(r.start_time).slice(0, 10);
      if (!byClient[k]) byClient[k] = { name, phone: r.clients.phone || "", count: 0, lastDate: date };
      byClient[k].count++;
      if (date > byClient[k].lastDate) byClient[k].lastDate = date;
    });
    const clients = Object.values(byClient).sort((a, b) => b.count - a.count).slice(0, 5);
    return { trend, clients, hasData: true };
  }, [isDemo, rows]);

  if (!isDemo && !hasData) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-4 border border-dashed rounded-lg">
        <div className="p-3 rounded-full bg-green-100 mb-4">
          <Sparkles className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="font-semibold text-base mb-1">Zero no-shows — gratulacje!</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          W wybranym okresie żaden klient nie odwołał wizyty bez uprzedzenia. Statystyki pojawią się tu automatycznie, gdy oznaczysz wizytę jako „no-show".
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-serif">Trend No-shows</CardTitle>
          <CardDescription>Niestawienia się na wizyty w czasie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === 'noShows' ? value : `${value}%`,
                    name === 'noShows' ? 'No-shows' : 'Procent'
                  ]}
                  contentStyle={tooltipStyle}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="noShows"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--destructive))' }}
                  name="No-shows"
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Procent"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-serif flex items-center gap-2">
            <UserX className="w-5 h-5 text-destructive" />
            Klienci z no-shows
          </CardTitle>
          <CardDescription>Osoby wymagające uwagi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {clients.map((client) => (
              <div key={client.name} className="flex items-center justify-between p-3 rounded-xl border border-destructive/30 bg-destructive/5">
                <div>
                  <div className="font-medium">{client.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {client.phone} • Ostatni: {client.lastDate}
                  </div>
                </div>
                <Badge variant="destructive">{client.count} no-shows</Badge>
              </div>
            ))}
          </div>

          {clients.length > 0 && (
            <div className="mt-4 p-3 rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                💡 Rozważ wprowadzenie polityki depozytów lub przypomnienia SMS dla tych klientów
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

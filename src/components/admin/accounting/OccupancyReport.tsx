import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, PieChart as PieChartIcon } from "lucide-react";
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "@/hooks/useSalonId";

const DEMO_BY_DAY = [
  { name: "Pon", value: 65 }, { name: "Wt", value: 58 }, { name: "Śr", value: 72 },
  { name: "Czw", value: 68 }, { name: "Pt", value: 85 }, { name: "Sob", value: 92 },
  { name: "Ndz", value: 0 },
];
const DEMO_BY_HOUR = [
  { hour: "9:00", value: 45 }, { hour: "10:00", value: 78 }, { hour: "11:00", value: 85 },
  { hour: "12:00", value: 62 }, { hour: "13:00", value: 48 }, { hour: "14:00", value: 72 },
  { hour: "15:00", value: 88 }, { hour: "16:00", value: 92 }, { hour: "17:00", value: 75 },
  { hour: "18:00", value: 55 },
];

const DAY_LABELS = ["Ndz", "Pon", "Wt", "Śr", "Czw", "Pt", "Sob"];

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px'
};

interface OccupancyReportProps {
  dateRange?: { from: Date; to: Date };
  isDemo?: boolean;
}

export function OccupancyReport({ dateRange, isDemo = false }: OccupancyReportProps) {
  const { salonId } = useSalonId();

  const { data: appts } = useQuery({
    queryKey: ["occupancy-appts", salonId, dateRange?.from?.toISOString(), dateRange?.to?.toISOString()],
    queryFn: async () => {
      let q = supabase
        .from("appointments")
        .select("start_time, status")
        .eq("salon_id", salonId!)
        .in("status", ["booked", "completed", "confirmed"]);
      if (dateRange) {
        q = q.gte("start_time", dateRange.from.toISOString()).lte("start_time", dateRange.to.toISOString());
      }
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    enabled: !isDemo && !!salonId,
  });

  const { byDay, byHour, hotHour, hasData } = useMemo(() => {
    if (isDemo) return { byDay: DEMO_BY_DAY, byHour: DEMO_BY_HOUR, hotHour: "15:00-17:00", hasData: true };
    const list = appts || [];
    if (list.length === 0) return { byDay: [], byHour: [], hotHour: null as string | null, hasData: false };

    // Count per weekday (max within period for normalization)
    const dayCounts = new Array(7).fill(0);
    const hourCounts: Record<number, number> = {};
    for (const a of list) {
      const d = new Date(a.start_time);
      dayCounts[d.getDay()]++;
      const h = d.getHours();
      hourCounts[h] = (hourCounts[h] || 0) + 1;
    }
    const maxDay = Math.max(...dayCounts, 1);
    const byDay = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Ndz"].map((name, i) => {
      const idx = i === 6 ? 0 : i + 1; // map Mon→1..Sun→0
      return { name, value: Math.round((dayCounts[idx] / maxDay) * 100) };
    });
    const hours = Object.keys(hourCounts).map(Number).sort((a, b) => a - b);
    const maxHour = Math.max(...Object.values(hourCounts), 1);
    const byHour = hours.map(h => ({ hour: `${h}:00`, value: Math.round((hourCounts[h] / maxHour) * 100) }));
    const top = hours.slice().sort((a, b) => hourCounts[b] - hourCounts[a])[0];
    return { byDay, byHour, hotHour: top != null ? `${top}:00-${top + 1}:00` : null, hasData: true };
  }, [isDemo, appts]);

  if (!isDemo && !hasData) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-4 border border-dashed rounded-lg">
        <div className="p-3 rounded-full bg-muted mb-4">
          <PieChartIcon className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-base mb-1">Brak danych o obłożeniu</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Wykresy obłożenia pojawią się po zarejestrowaniu pierwszych wizyt w wybranym okresie.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-serif">Obłożenie wg dnia tygodnia</CardTitle>
          <CardDescription>Średnie wykorzystanie grafiku</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" domain={[0, 100]} />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, 'Obłożenie']}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-serif">Obłożenie wg godziny</CardTitle>
          <CardDescription>Najbardziej popularne godziny</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={byHour}>
                <defs>
                  <linearGradient id="colorOccupancyReport" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="hour" className="text-xs" />
                <YAxis className="text-xs" domain={[0, 100]} />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, 'Obłożenie']}
                  contentStyle={tooltipStyle}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--secondary))"
                  fillOpacity={1}
                  fill="url(#colorOccupancyReport)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {hotHour && (
            <div className="mt-4 p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium">Hot hours:</span>
                <Badge variant="secondary">{hotHour}</Badge>
                <span className="text-muted-foreground">najwyższe obłożenie</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

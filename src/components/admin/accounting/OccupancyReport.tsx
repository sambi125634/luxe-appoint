import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const occupancyByDay = [
  { name: "Pon", value: 65 },
  { name: "Wt", value: 58 },
  { name: "Śr", value: 72 },
  { name: "Czw", value: 68 },
  { name: "Pt", value: 85 },
  { name: "Sob", value: 92 },
  { name: "Ndz", value: 0 },
];

const occupancyByHour = [
  { hour: "9:00", value: 45 },
  { hour: "10:00", value: 78 },
  { hour: "11:00", value: 85 },
  { hour: "12:00", value: 62 },
  { hour: "13:00", value: 48 },
  { hour: "14:00", value: 72 },
  { hour: "15:00", value: 88 },
  { hour: "16:00", value: 92 },
  { hour: "17:00", value: 75 },
  { hour: "18:00", value: 55 },
];

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px'
};

export function OccupancyReport() {
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
              <BarChart data={occupancyByDay}>
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
              <AreaChart data={occupancyByHour}>
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

          <div className="mt-4 p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-medium">Hot hours:</span>
              <Badge variant="secondary">15:00-17:00</Badge>
              <span className="text-muted-foreground">najwyższe obłożenie</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

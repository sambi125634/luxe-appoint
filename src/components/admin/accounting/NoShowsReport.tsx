import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserX } from "lucide-react";
import {
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const noShowsData = [
  { name: "Sty", noShows: 5, rate: 2.5 },
  { name: "Lut", noShows: 3, rate: 1.4 },
  { name: "Mar", noShows: 7, rate: 3.4 },
  { name: "Kwi", noShows: 4, rate: 1.7 },
  { name: "Maj", noShows: 6, rate: 2.7 },
  { name: "Cze", noShows: 3, rate: 1.2 },
];

const noShowClients = [
  { name: "Monika Zawadzka", count: 3, lastDate: "2024-01-15", phone: "+48 555 111 222" },
  { name: "Agnieszka Krawczyk", count: 2, lastDate: "2024-01-10", phone: "+48 555 333 444" },
  { name: "Beata Sikora", count: 2, lastDate: "2024-01-08", phone: "+48 555 555 666" },
];

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px'
};

export function NoShowsReport() {
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
              <LineChart data={noShowsData}>
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
            {noShowClients.map((client) => (
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

          {noShowClients.length > 0 && (
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

import { Star, TrendingUp } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { DEMO_APP_VS_PHONE_CHART, DEMO_TOP_APP_SERVICES } from "../demo/templatesData";
import { toast } from "sonner";

const STATS = [
  { label: "Klientki z aplikacją", value: "134 / 187", sub: "72% bazy", trend: "+8 ten miesiąc" },
  { label: "Aktywne w tym miesiącu", value: "89", sub: "66% z tych co pobrały", trend: "↑" },
  { label: "Rezerwacje przez aplikację", value: "67%", sub: "reszta: telefon", trend: "" },
  { label: "Średnia ocena aplikacji", value: "4.8", sub: "23 oceny", trend: "★" },
];

export function StatystykiTab() {
  const maxBookings = Math.max(...DEMO_TOP_APP_SERVICES.map((s) => s.bookings));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">📊 Jak klientki używają Twojej aplikacji</h2>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold mt-1 flex items-center gap-1.5">
              {s.value}
              {s.label.includes("ocena") && <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
            {s.trend && <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {s.trend}</p>}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="border rounded-2xl p-4 bg-card">
        <h3 className="text-sm font-semibold mb-3">Rezerwacje: aplikacja vs telefon (ostatnie 6 miesięcy)</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={DEMO_APP_VS_PHONE_CHART}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="app" name="Przez aplikację" stroke="hsl(var(--primary))" strokeWidth={2} />
              <Line type="monotone" dataKey="phone" name="Przez telefon" stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top services */}
      <div className="border rounded-2xl p-4 bg-card">
        <h3 className="text-sm font-semibold mb-3">Top 5 usług rezerwowanych przez aplikację</h3>
        <div className="space-y-2">
          {DEMO_TOP_APP_SERVICES.map((s, i) => (
            <div key={s.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span><span className="text-muted-foreground mr-1">{i + 1}.</span>{s.name}</span>
                <span className="font-semibold">{s.bookings} rez.</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(s.bookings / maxBookings) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Funnel */}
      <div className="border rounded-2xl p-4 bg-card">
        <h3 className="text-sm font-semibold mb-3">Lejek adopcji aplikacji</h3>
        <div className="space-y-2">
          {[
            { label: "Klientek w bazie", value: 187, pct: 100 },
            { label: "Otrzymały zaproszenie", value: 156, pct: 83 },
            { label: "Dołączyły do aplikacji", value: 134, pct: 86 },
            { label: "Aktywne w tym miesiącu", value: 89, pct: 66 },
          ].map((f) => (
            <div key={f.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{f.label}</span>
                <span className="font-medium">{f.value} <span className="text-muted-foreground text-xs">({f.pct}%)</span></span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all" style={{ width: `${f.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between flex-wrap gap-2">
          <span className="text-sm">💡 Wyślij zaproszenie do 31 klientek które jeszcze nie dołączyły</span>
          <button onClick={() => toast.success("✓ Zaproszenia wysłane")} className="text-sm px-3 py-1.5 rounded-lg border border-primary text-primary font-medium hover:bg-primary/5">Wyślij zaproszenie</button>
        </div>
      </div>
    </div>
  );
}
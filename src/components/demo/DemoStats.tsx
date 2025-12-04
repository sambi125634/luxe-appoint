import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, Clock } from "lucide-react";

const mockStats = [
  {
    label: "Wizyty w tym miesiącu",
    value: "127",
    change: "+12%",
    trend: "up",
    icon: Calendar,
  },
  {
    label: "Przychód",
    value: "24 350 zł",
    change: "+8%",
    trend: "up",
    icon: DollarSign,
  },
  {
    label: "Nowe klientki",
    value: "34",
    change: "+23%",
    trend: "up",
    icon: Users,
  },
  {
    label: "Średni czas wizyty",
    value: "1h 15min",
    change: "-5%",
    trend: "down",
    icon: Clock,
  },
];

const mockChartData = [
  { day: "Pon", value: 12 },
  { day: "Wt", value: 19 },
  { day: "Śr", value: 15 },
  { day: "Czw", value: 22 },
  { day: "Pt", value: 28 },
  { day: "Sob", value: 31 },
  { day: "Nd", value: 8 },
];

const maxValue = Math.max(...mockChartData.map(d => d.value));

export function DemoStats() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockStats.map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-serif font-semibold">{stat.value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              {stat.trend === "up" ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={stat.trend === "up" ? "text-green-500 text-sm" : "text-red-500 text-sm"}>
                {stat.change}
              </span>
              <span className="text-muted-foreground text-sm">vs poprzedni miesiąc</span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="glass-card p-6">
        <h3 className="font-serif text-lg font-semibold mb-6">Wizyty w tym tygodniu</h3>
        <div className="h-48 flex items-end justify-between gap-2">
          {mockChartData.map((data) => (
            <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-gradient-to-t from-primary to-secondary rounded-t-lg transition-all duration-500"
                style={{ height: `${(data.value / maxValue) * 100}%` }}
              />
              <span className="text-xs text-muted-foreground">{data.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-serif text-lg font-semibold mb-4">TOP 3 Usługi</h3>
          <div className="space-y-4">
            {[
              { name: "Mezoterapia igłowa", count: 45, revenue: "9 000 zł" },
              { name: "Makijaż permanentny brwi", count: 32, revenue: "12 800 zł" },
              { name: "Depilacja laserowa - nogi", count: 28, revenue: "5 600 zł" },
            ].map((service, index) => (
              <div key={service.name} className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-serif font-semibold text-primary">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-muted-foreground">{service.count} wizyt</p>
                </div>
                <span className="font-semibold text-primary">{service.revenue}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-serif text-lg font-semibold mb-4">TOP 3 Pracownicy</h3>
          <div className="space-y-4">
            {[
              { name: "Anna Kowalska", role: "Kosmetolog", count: 52, revenue: "15 600 zł" },
              { name: "Maria Wiśniewska", role: "Stylistka", count: 41, revenue: "8 200 zł" },
              { name: "Karolina Nowak", role: "Masażystka", count: 34, revenue: "6 800 zł" },
            ].map((staff, index) => (
              <div key={staff.name} className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center font-serif font-semibold text-secondary">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{staff.name}</p>
                  <p className="text-sm text-muted-foreground">{staff.role} • {staff.count} wizyt</p>
                </div>
                <span className="font-semibold text-secondary">{staff.revenue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

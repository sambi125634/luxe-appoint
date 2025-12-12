import { TrendingUp, Calendar, Users, DollarSign, AlertCircle } from "lucide-react";

const DashboardMockup = () => {
  return (
    <div className="p-4 h-full bg-background">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { icon: Calendar, label: "Dziś", value: "12", color: "text-violet-deep" },
          { icon: DollarSign, label: "Przychód", value: "2,450 zł", color: "text-emerald-500" },
          { icon: Users, label: "Klientki", value: "847", color: "text-burgundy" },
          { icon: TrendingUp, label: "Wzrost", value: "+18%", color: "text-gold" },
        ].map((item, i) => (
          <div 
            key={i} 
            className="glass-card p-3 rounded-xl animate-fade-in"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <item.icon className={`w-5 h-5 ${item.color} mb-1`} />
            <div className="text-xs text-muted-foreground">{item.label}</div>
            <div className="text-lg font-bold text-foreground">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Today's Appointments */}
      <div className="glass-card rounded-xl p-3 mb-3">
        <h3 className="text-sm font-semibold text-foreground mb-2">Dzisiejsze wizyty</h3>
        <div className="space-y-2">
          {[
            { time: "09:00", name: "Anna K.", service: "Manicure", color: "bg-violet-deep/20 border-violet-deep" },
            { time: "10:30", name: "Maria W.", service: "Pedicure", color: "bg-burgundy/20 border-burgundy" },
            { time: "12:00", name: "Ewa S.", service: "Makijaż", color: "bg-gold/20 border-gold" },
          ].map((apt, i) => (
            <div 
              key={i} 
              className={`flex items-center gap-3 p-2 rounded-lg border-l-2 ${apt.color} animate-fade-in`}
              style={{ animationDelay: `${(i + 4) * 100}ms` }}
            >
              <span className="text-xs font-mono text-muted-foreground w-10">{apt.time}</span>
              <span className="text-sm font-medium text-foreground flex-1">{apt.name}</span>
              <span className="text-xs text-muted-foreground">{apt.service}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Alert */}
      <div 
        className="glass-card rounded-xl p-3 border-l-2 border-amber-500 bg-amber-500/10 animate-fade-in"
        style={{ animationDelay: '700ms' }}
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span className="text-xs text-foreground">3 wizyty oczekują na potwierdzenie</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardMockup;

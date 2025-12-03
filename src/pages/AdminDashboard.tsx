import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Calendar, Users, Scissors, Settings, BarChart3, 
  LogOut, Menu, X, Plus, Clock, TrendingUp, Sparkles,
  ChevronRight, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Calendar, label: "Kalendarz", href: "#kalendarz", active: true },
  { icon: Users, label: "Personel", href: "#personel" },
  { icon: Scissors, label: "Usługi", href: "#uslugi" },
  { icon: BarChart3, label: "Statystyki", href: "#statystyki" },
  { icon: Settings, label: "Ustawienia", href: "#ustawienia" },
];

const todayAppointments = [
  { id: 1, time: "09:00", client: "Anna Kowalska", service: "Peeling kawitacyjny", staff: "Maria N.", status: "confirmed" },
  { id: 2, time: "10:30", client: "Joanna Nowak", service: "Stylizacja brwi", staff: "Karolina W.", status: "confirmed" },
  { id: 3, time: "12:00", client: "Magdalena Wiśniewska", service: "Masaż relaksacyjny", staff: "Joanna L.", status: "pending" },
  { id: 4, time: "14:00", client: "Katarzyna Dąbrowska", service: "Mezoterapia igłowa", staff: "Anna K.", status: "confirmed" },
  { id: 5, time: "16:00", client: "Agnieszka Lewandowska", service: "Depilacja laserowa", staff: "Maria N.", status: "confirmed" },
];

const stats = [
  { label: "Dziś", value: "12", sublabel: "wizyt", icon: Calendar, trend: "+3" },
  { label: "Ten tydzień", value: "58", sublabel: "wizyt", icon: TrendingUp, trend: "+12%" },
  { label: "Nowi klienci", value: "8", sublabel: "w tym miesiącu", icon: Users, trend: "+5" },
  { label: "Przychód", value: "12 450", sublabel: "zł dziś", icon: BarChart3, trend: "+18%" },
];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform duration-300 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-serif font-semibold">Beauty Calendar</p>
                <p className="text-xs text-muted-foreground">Panel salonu</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                      item.active 
                        ? "bg-primary text-primary-foreground shadow-soft" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center font-serif text-primary-foreground">
                LS
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">Luxury Beauty Spa</p>
                <p className="text-xs text-muted-foreground truncate">admin@luxuryspa.pl</p>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
              <LogOut className="w-4 h-4" />
              Wyloguj się
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div>
              <h1 className="font-serif text-xl font-semibold">Witaj ponownie!</h1>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full" />
            </Button>
            <Link to="/book/demo-salon">
              <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                <ChevronRight className="w-4 h-4" />
                Zobacz widget
              </Button>
            </Link>
            <Button variant="luxury" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nowa wizyta</span>
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <div 
                key={stat.label}
                className="glass-card p-5 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full">
                    {stat.trend}
                  </span>
                </div>
                <p className="text-2xl font-serif font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.sublabel}</p>
              </div>
            ))}
          </div>

          {/* Today's appointments */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-semibold">Dzisiejsze wizyty</h2>
              <Button variant="ghost" size="sm" className="text-primary">
                Zobacz wszystkie
              </Button>
            </div>

            <div className="space-y-3">
              {todayAppointments.map((appointment, index) => (
                <div
                  key={appointment.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3 min-w-[100px]">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{appointment.time}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{appointment.client}</p>
                    <p className="text-sm text-muted-foreground truncate">{appointment.service}</p>
                  </div>
                  <div className="hidden md:block text-sm text-muted-foreground">
                    {appointment.staff}
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    appointment.status === 'confirmed' 
                      ? "bg-primary/10 text-primary" 
                      : "bg-accent/20 text-accent-foreground"
                  )}>
                    {appointment.status === 'confirmed' ? 'Potwierdzona' : 'Oczekuje'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

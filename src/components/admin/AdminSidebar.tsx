import { Link } from "react-router-dom";
import { 
  Calendar, Users, Scissors, Settings, BarChart3, 
  LogOut, Sparkles, CalendarOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TabType = "calendar" | "staff" | "services" | "time-off" | "stats" | "settings";

const navItems: { icon: typeof Calendar; label: string; tab: TabType }[] = [
  { icon: Calendar, label: "Kalendarz", tab: "calendar" },
  { icon: Users, label: "Personel", tab: "staff" },
  { icon: Scissors, label: "Usługi", tab: "services" },
  { icon: CalendarOff, label: "Urlopy", tab: "time-off" },
  { icon: BarChart3, label: "Statystyki", tab: "stats" },
  { icon: Settings, label: "Ustawienia", tab: "settings" },
];

interface AdminSidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onClose?: () => void;
}

export function AdminSidebar({ activeTab, onTabChange, onClose }: AdminSidebarProps) {
  return (
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
              <button
                onClick={() => {
                  onTabChange(item.tab);
                  onClose?.();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  activeTab === item.tab
                    ? "bg-primary text-primary-foreground shadow-soft" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
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
  );
}

export type { TabType };

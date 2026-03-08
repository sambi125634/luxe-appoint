import { useLocation, useNavigate } from "react-router-dom";
import { Home, Calendar, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { path: "/app", icon: Home, label: "Salony" },
  { path: "/app/bookings", icon: Calendar, label: "Wizyty" },
  { path: "/app/favorites", icon: Heart, label: "Ulubione" },
  { path: "/app/profile", icon: User, label: "Profil" },
];

export function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/app") return location.pathname === "/app";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <tab.icon className={cn("h-5 w-5", active && "fill-primary/20")} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

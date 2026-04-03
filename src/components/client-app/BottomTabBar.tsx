import { useLocation, useNavigate } from "react-router-dom";
import { Home, Calendar, Gift, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClientNotifications } from "@/hooks/useClientLoyalty";

const tabs = [
  { path: "/app", icon: Home, label: "Salony" },
  { path: "/app/bookings", icon: Calendar, label: "Wizyty" },
  { path: "/app/for-you", icon: Gift, label: "Dla Ciebie" },
  { path: "/app/activity", icon: Bell, label: "Aktywność", hasBadge: true },
  { path: "/app/profile", icon: User, label: "Profil" },
];

export function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: notifications = [] } = useClientNotifications();
  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  const isActive = (path: string) => {
    if (path === "/app") return location.pathname === "/app";
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/98 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-1">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all active:scale-95",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <tab.icon
                  className={cn("h-5 w-5 transition-all", active && "scale-110")}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                {tab.hasBadge && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center px-0.5 animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] transition-all", active ? "font-bold" : "font-medium")}>
                {tab.label}
              </span>
              {active && <span className="absolute bottom-1 w-6 h-0.5 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

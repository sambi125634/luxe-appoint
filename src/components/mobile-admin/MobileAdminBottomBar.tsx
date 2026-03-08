import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Calendar, Users, Bell, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSalonId } from "@/hooks/useSalonId";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const tabs = [
  { path: "/m", icon: LayoutDashboard, label: "Panel" },
  { path: "/m/calendar", icon: Calendar, label: "Kalendarz" },
  { path: "/m/clients", icon: Users, label: "Klienci" },
  { path: "/m/notifications", icon: Bell, label: "Alerty", hasBadge: true },
  { path: "/m/more", icon: Menu, label: "Więcej" },
];

export function MobileAdminBottomBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { salonId } = useSalonId();

  // Dynamic badge: count of pending (booked) appointments
  const { data: pendingCount = 0 } = useQuery({
    queryKey: ["mobile-pending-badge", salonId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("salon_id", salonId!)
        .eq("status", "booked")
        .gte("start_time", new Date().toISOString());
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!salonId,
    refetchInterval: 60000,
  });

  const isActive = (path: string) => {
    if (path === "/m") return location.pathname === "/m";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/98 backdrop-blur-xl" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
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
                <tab.icon className={cn("h-5 w-5 transition-all", active && "scale-110")} strokeWidth={active ? 2.5 : 1.8} />
                {tab.hasBadge && pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center px-0.5 animate-pulse">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] transition-all", active ? "font-bold" : "font-medium")}>{tab.label}</span>
              {active && <span className="absolute bottom-1 w-6 h-0.5 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

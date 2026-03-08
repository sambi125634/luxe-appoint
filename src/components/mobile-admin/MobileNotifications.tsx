import { useState } from "react";
import {
  Bell, Calendar, UserX, AlertCircle, CheckCircle2,
  Package, DollarSign, Clock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSalonId } from "@/hooks/useSalonId";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, endOfDay, addDays } from "date-fns";
import { pl } from "date-fns/locale";

interface NotificationItem {
  id: string;
  type: "pending" | "noshow" | "stock" | "revenue" | "reminder";
  title: string;
  description: string;
  time: string;
  icon: typeof Bell;
  color: string;
  action?: string;
}

export function MobileNotifications() {
  const { salonId } = useSalonId();
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // Fetch pending appointments (needs confirmation)
  const { data: pendingAppts = [] } = useQuery({
    queryKey: ["mobile-notifications-pending", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("id, start_time, clients(first_name, last_name), services(name)")
        .eq("salon_id", salonId!)
        .eq("status", "booked")
        .gte("start_time", new Date().toISOString())
        .order("start_time")
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!salonId,
  });

  // Fetch today's no-shows
  const { data: noShows = [] } = useQuery({
    queryKey: ["mobile-notifications-noshows", salonId],
    queryFn: async () => {
      const todayStart = startOfDay(new Date()).toISOString();
      const todayEnd = endOfDay(new Date()).toISOString();
      const { data, error } = await supabase
        .from("appointments")
        .select("id, start_time, clients(first_name, last_name)")
        .eq("salon_id", salonId!)
        .eq("status", "no_show")
        .gte("start_time", todayStart)
        .lte("start_time", todayEnd);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!salonId,
  });

  // Low stock products
  const { data: lowStock = [] } = useQuery({
    queryKey: ["mobile-notifications-stock", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, current_stock, min_stock")
        .eq("salon_id", salonId!)
        .eq("is_active", true);
      if (error) throw error;
      return (data ?? []).filter(p => p.current_stock <= p.min_stock);
    },
    enabled: !!salonId,
  });

  // Build notification list
  const notifications: NotificationItem[] = [
    ...pendingAppts.map((a) => {
      const client = a.clients as { first_name: string; last_name: string } | null;
      return {
        id: `pending-${a.id}`,
        type: "pending" as const,
        title: "Wizyta do potwierdzenia",
        description: `${client?.first_name} ${client?.last_name} — ${format(new Date(a.start_time), "d MMM HH:mm", { locale: pl })}`,
        time: format(new Date(a.start_time), "HH:mm"),
        icon: Calendar,
        color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
      };
    }),
    ...noShows.map((a) => {
      const client = a.clients as { first_name: string; last_name: string } | null;
      return {
        id: `noshow-${a.id}`,
        type: "noshow" as const,
        title: "No-show",
        description: `${client?.first_name} ${client?.last_name} nie przyszła na wizytę`,
        time: format(new Date(a.start_time), "HH:mm"),
        icon: UserX,
        color: "text-destructive bg-destructive/10",
      };
    }),
    ...lowStock.map((p) => ({
      id: `stock-${p.id}`,
      type: "stock" as const,
      title: "Niski stan magazynowy",
      description: `${p.name}: ${p.current_stock}/${p.min_stock} szt.`,
      time: "",
      icon: Package,
      color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
    })),
  ];

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  return (
    <div className="pb-20 max-w-lg mx-auto">
      {/* Header */}
      <div className="px-4 pt-2 pb-3 sticky top-0 z-20 bg-background/95 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-serif font-bold">Powiadomienia</h1>
          {unreadCount > 0 && (
            <Badge className="bg-destructive text-destructive-foreground">{unreadCount}</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-primary p-0 h-auto"
            onClick={() => setReadIds(new Set(notifications.map(n => n.id)))}
          >
            Oznacz wszystko jako przeczytane
          </Button>
        )}
      </div>

      {/* Notifications list */}
      <div className="px-4 space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
              <Bell className="w-7 h-7 text-muted-foreground/50" />
            </div>
            <p className="font-medium text-muted-foreground">Wszystko ogarnięte!</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Brak nowych powiadomień</p>
          </div>
        ) : (
          notifications.map((n) => {
            const isRead = readIds.has(n.id);
            return (
              <Card
                key={n.id}
                className={cn(
                  "transition-all active:scale-[0.98]",
                  !isRead && "border-primary/20 bg-primary/5"
                )}
                onClick={() => setReadIds(prev => new Set([...prev, n.id]))}
              >
                <CardContent className="p-3 flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", n.color)}>
                    <n.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn("text-sm font-semibold", !isRead && "text-primary")}>
                        {n.title}
                      </p>
                      {!isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

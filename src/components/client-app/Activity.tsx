import { Bell, Calendar, Gift, Star, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientNotifications, useMarkNotificationRead } from "@/hooks/useClientLoyalty";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns";
import { pl } from "date-fns/locale";
import { motion } from "framer-motion";
import { useMemo } from "react";

const iconMap: Record<string, { icon: typeof Clock; bg: string; color: string; pulse?: boolean }> = {
  reminder: { icon: Clock, bg: "bg-blue-500/10", color: "text-blue-600" },
  confirmation: { icon: CheckCircle2, bg: "bg-green-500/10", color: "text-green-600" },
  coupon: { icon: Gift, bg: "bg-amber-500/10", color: "text-amber-600" },
  loyalty: { icon: Star, bg: "bg-purple-500/10", color: "text-purple-600" },
  review: { icon: Star, bg: "bg-pink-500/10", color: "text-pink-600" },
  booking: { icon: Calendar, bg: "bg-primary/10", color: "text-primary" },
  waitlist: { icon: Bell, bg: "bg-amber-500/10", color: "text-amber-600", pulse: true },
  reward: { icon: Gift, bg: "bg-green-500/10", color: "text-green-600" },
  rhythm_reminder: { icon: Sparkles, bg: "bg-purple-500/10", color: "text-purple-600", pulse: true },
  payment: { icon: CheckCircle2, bg: "bg-green-500/10", color: "text-green-600" },
  info: { icon: Bell, bg: "bg-muted", color: "text-muted-foreground" },
};

function groupByDay(notifications: any[]) {
  const groups: { label: string; items: any[] }[] = [];
  const map = new Map<string, any[]>();

  for (const n of notifications) {
    const date = new Date(n.created_at);
    let label: string;
    if (isToday(date)) label = "Dziś";
    else if (isYesterday(date)) label = "Wczoraj";
    else label = format(date, "d MMMM", { locale: pl });

    if (!map.has(label)) {
      map.set(label, []);
      groups.push({ label, items: map.get(label)! });
    }
    map.get(label)!.push(n);
  }
  return groups;
}

export function Activity() {
  const { data: notifications = [], isLoading } = useClientNotifications();
  const markRead = useMarkNotificationRead();
  const queryClient = useQueryClient();

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;
  const grouped = useMemo(() => groupByDay(notifications), [notifications]);

  const handleTap = async (notification: any) => {
    if (!notification.is_read) {
      await markRead(notification.id);
      queryClient.invalidateQueries({ queryKey: ["client-notifications"] });
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 pt-6 pb-24 space-y-3">
        <Skeleton className="h-8 w-40" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-0.5">Aktywność</h1>
          <p className="text-sm text-muted-foreground">Powiadomienia i aktualizacje</p>
        </div>
        {unreadCount > 0 && (
          <Badge className="bg-primary text-primary-foreground">{unreadCount} nowe</Badge>
        )}
      </motion.div>

      {notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-5">
            <Bell className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Brak powiadomień</h3>
          <p className="text-sm text-muted-foreground max-w-[280px]">
            Tu pojawią się przypomnienia o wizytach, kupony i inne aktualizacje.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-5">
          {grouped.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                {group.label}
              </p>
              <div className="space-y-2">
                {group.items.map((item: any, idx: number) => {
                  const config = iconMap[item.type] || iconMap.info;
                  const Icon = config.icon;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card
                        onClick={() => handleTap(item)}
                        className={`border-border/40 rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all ${
                          !item.is_read ? "bg-primary/[0.03] border-primary/20" : ""
                        }`}
                      >
                        <CardContent className="flex items-start gap-3 p-4">
                          <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0 mt-0.5 ${config.pulse ? "animate-pulse" : ""}`}>
                            <Icon className={`h-5 w-5 ${config.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                              {!item.is_read && (
                                <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                            <p className="text-[11px] text-muted-foreground/60 mt-1">
                              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: pl })}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { Bell, Calendar, Gift, Star, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientNotifications, useMarkNotificationRead } from "@/hooks/useClientLoyalty";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";

const iconMap: Record<string, { icon: typeof Clock; bg: string; color: string }> = {
  reminder: { icon: Clock, bg: "bg-blue-500/10", color: "text-blue-600" },
  confirmation: { icon: CheckCircle2, bg: "bg-green-500/10", color: "text-green-600" },
  coupon: { icon: Gift, bg: "bg-amber-500/10", color: "text-amber-600" },
  loyalty: { icon: Star, bg: "bg-purple-500/10", color: "text-purple-600" },
  review: { icon: Star, bg: "bg-pink-500/10", color: "text-pink-600" },
  info: { icon: Bell, bg: "bg-muted", color: "text-muted-foreground" },
};

export function Activity() {
  const { data: notifications = [], isLoading } = useClientNotifications();
  const markRead = useMarkNotificationRead();
  const queryClient = useQueryClient();

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-0.5">Aktywność</h1>
          <p className="text-sm text-muted-foreground">Powiadomienia i aktualizacje</p>
        </div>
        {unreadCount > 0 && (
          <Badge className="bg-primary text-primary-foreground">{unreadCount} nowe</Badge>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-5">
            <Bell className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Brak powiadomień</h3>
          <p className="text-sm text-muted-foreground max-w-[280px]">
            Tu pojawią się przypomnienia o wizytach, kupony i inne aktualizacje.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((item: any) => {
            const config = iconMap[item.type] || iconMap.info;
            const Icon = config.icon;
            return (
              <Card
                key={item.id}
                onClick={() => handleTap(item)}
                className={`border-border/40 rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all ${
                  !item.is_read ? "bg-primary/[0.03] border-primary/20" : ""
                }`}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
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
            );
          })}
        </div>
      )}
    </div>
  );
}

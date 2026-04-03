import { Bell, Calendar, Gift, Star, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ActivityItem = {
  id: string;
  type: "reminder" | "confirmation" | "coupon" | "loyalty" | "review";
  title: string;
  description: string;
  time: string;
  read: boolean;
};

const iconMap = {
  reminder: { icon: Clock, bg: "bg-blue-50", color: "text-blue-600" },
  confirmation: { icon: CheckCircle2, bg: "bg-green-50", color: "text-green-600" },
  coupon: { icon: Gift, bg: "bg-amber-50", color: "text-amber-600" },
  loyalty: { icon: Star, bg: "bg-purple-50", color: "text-purple-600" },
  review: { icon: Star, bg: "bg-pink-50", color: "text-pink-600" },
};

// Demo data
const activities: ActivityItem[] = [
  {
    id: "1", type: "reminder", title: "Jutro wizyta",
    description: "Manicure hybrydowy • Glamour Studio • 10:00",
    time: "2 godz. temu", read: false,
  },
  {
    id: "2", type: "coupon", title: "Nowy kupon!",
    description: "-20% na koloryzację w Beauty Point",
    time: "wczoraj", read: false,
  },
  {
    id: "3", type: "confirmation", title: "Wizyta potwierdzona",
    description: "Stylizacja brwi • 12.04 o 14:30",
    time: "2 dni temu", read: true,
  },
  {
    id: "4", type: "loyalty", title: "Zdobyłaś 50 pkt!",
    description: "Za ostatnią wizytę w Glamour Studio",
    time: "3 dni temu", read: true,
  },
  {
    id: "5", type: "review", title: "Oceń wizytę",
    description: "Jak oceniasz ostatni zabieg w Beauty Point?",
    time: "5 dni temu", read: true,
  },
];

export function Activity() {
  const unreadCount = activities.filter((a) => !a.read).length;

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

      {activities.length === 0 ? (
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
          {activities.map((item) => {
            const { icon: Icon, bg, color } = iconMap[item.type];
            return (
              <Card
                key={item.id}
                className={`border-border/40 rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all ${
                  !item.read ? "bg-primary/[0.03] border-primary/20" : ""
                }`}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-semibold text-foreground ${!item.read ? "" : ""}`}>
                        {item.title}
                      </h3>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                    <p className="text-[11px] text-muted-foreground/60 mt-1">{item.time}</p>
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

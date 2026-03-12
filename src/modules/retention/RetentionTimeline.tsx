import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Mail, MessageSquare, Phone, CheckCircle2, Send, MousePointer, CalendarCheck, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RetentionTimelineItem } from "./types";
import { formatDistanceToNow } from "date-fns";
import { pl, enUS } from "date-fns/locale";

interface RetentionTimelineProps {
  items: RetentionTimelineItem[];
}

const CHANNEL_ICONS = { sms: Phone, email: Mail, whatsapp: MessageSquare };

export function RetentionTimeline({ items }: RetentionTimelineProps) {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'pl' ? pl : enUS;

  const ACTION_CONFIG = {
    sent: { icon: Send, label: t('retention.actions.sent'), color: "text-blue-600" },
    opened: { icon: CheckCircle2, label: t('retention.actions.opened'), color: "text-green-600" },
    clicked: { icon: MousePointer, label: t('retention.actions.clicked'), color: "text-amber-600" },
    booked: { icon: CalendarCheck, label: t('retention.actions.booked'), color: "text-primary" },
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          {t('retention.autopilotActed')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{t('retention.recentActions')}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => {
            const ChannelIcon = CHANNEL_ICONS[item.channel];
            const actionCfg = ACTION_CONFIG[item.action];
            const ActionIcon = actionCfg.icon;
            const timeAgo = formatDistanceToNow(new Date(item.timestamp), { addSuffix: true, locale: dateLocale });

            return (
              <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                <div className={cn("mt-0.5 p-1.5 rounded-lg", item.action === "booked" ? "bg-primary/10" : "bg-muted")}>
                  <ActionIcon className={cn("w-4 h-4", actionCfg.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{actionCfg.label}</span>
                    <span className="text-sm text-muted-foreground">{t('retention.reactivationTo')}</span>
                    <span className="text-sm font-semibold">{item.client_name}</span>
                    <Badge variant="outline" className="text-xs gap-1">
                      <ChannelIcon className="w-3 h-3" />
                      {item.channel.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{timeAgo}</span>
                    <span className="text-xs text-muted-foreground">• {item.days_inactive} {t('retention.daysInactive')}</span>
                    {item.revenue && (
                      <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                        +{item.revenue} zł 🎉
                      </Badge>
                    )}
                  </div>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="flex items-center gap-1 mt-1.5 text-xs text-primary/70 hover:text-primary transition-colors">
                          <Info className="w-3 h-3" />
                          {t('retention.whyThisAction')}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p className="text-xs">{item.ai_explanation}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

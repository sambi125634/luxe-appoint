import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Eye, CalendarCheck, DollarSign, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RetentionKPIData } from "./types";

interface RetentionKPIProps {
  data: RetentionKPIData;
}

export function RetentionKPI({ data }: RetentionKPIProps) {
  const { t } = useTranslation();
  const cards = [
    { label: t('retention.messagesSent'), value: data.messages_sent, icon: Send, suffix: "", color: "text-blue-600" },
    { label: t('retention.openRate'), value: data.open_rate, icon: Eye, suffix: "%", color: "text-green-600" },
    { label: t('retention.bookingsFromRetention'), value: data.bookings_from_retention, icon: CalendarCheck, suffix: "", color: "text-primary" },
    { label: t('retention.revenueRecovered'), value: data.revenue_recovered, icon: DollarSign, suffix: " zł", color: "text-amber-600" },
    { label: t('retention.clientsInCampaign'), value: data.clients_in_campaign, icon: Users, suffix: "", color: "text-red-600" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card) => (
        <Card key={card.label} className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <card.icon className={cn("w-5 h-5", card.color)} />
            </div>
            <div className="text-2xl font-bold font-serif">
              {card.value.toLocaleString("pl-PL")}{card.suffix}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

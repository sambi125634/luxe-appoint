import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import type { RetentionRadarClient } from "./types";

interface RetentionHealthBoardProps {
  clients: RetentionRadarClient[];
  compact?: boolean;
  onClientClick?: (client: RetentionRadarClient) => void;
}

type ZoneKey = "active" | "attention" | "risk" | "lost";

interface ZoneConfig {
  key: ZoneKey;
  color: string;
  bgGradient: string;
  borderPulse: boolean;
  avatarBg: string;
  progressColor: string;
}

function classifyClients(clients: RetentionRadarClient[]): Record<ZoneKey, RetentionRadarClient[]> {
  const result: Record<ZoneKey, RetentionRadarClient[]> = { active: [], attention: [], risk: [], lost: [] };
  for (const c of clients) {
    if (c.risk_zone === "green") result.active.push(c);
    else if (c.risk_zone === "yellow") result.attention.push(c);
    else if (c.risk_zone === "orange") result.risk.push(c);
    else result.lost.push(c);
  }
  return result;
}

function getEngagement(client: RetentionRadarClient): number {
  const hash = client.id.charCodeAt(0) + client.id.charCodeAt(1);
  if (client.risk_zone === "green") return 70 + (hash % 30);
  if (client.risk_zone === "yellow") return 40 + (hash % 30);
  if (client.risk_zone === "orange") return 15 + (hash % 25);
  return 5 + (hash % 10);
}

const DEMO_TOOLTIPS: Record<string, { visits: string; spent: string; services: string }> = {
  "Anna Kowalska": { visits: "12 wizyt (ostatnie 6 mies.)", spent: "Łącznie: 4 280 zł", services: "Manicure, Mezoterapia" },
  "Katarzyna Nowak": { visits: "8 wizyt (ostatnie 6 mies.)", spent: "Łącznie: 2 840 zł", services: "Strzyżenie, Koloryzacja" },
  "Magdalena Wiśniewska": { visits: "15 wizyt (ostatnie 6 mies.)", spent: "Łącznie: 5 100 zł", services: "Masaż, Peeling" },
  "default": { visits: "5 wizyt (ostatnie 6 mies.)", spent: "Łącznie: 1 650 zł", services: "Manicure, Pedicure" },
};

function ClientCard({ client, zone, onClientClick, daysAgoLabel }: { client: RetentionRadarClient; zone: ZoneConfig & { label: string; emoji: string }; onClientClick?: (c: RetentionRadarClient) => void; daysAgoLabel: string }) {
  const engagement = getEngagement(client);
  const fullName = `${client.first_name} ${client.last_name}`;
  const tooltip = DEMO_TOOLTIPS[fullName] || DEMO_TOOLTIPS["default"];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-3 rounded-lg border bg-card hover:shadow-md transition-all cursor-pointer",
              zone.borderPulse && "animate-pulse border-current/30"
            )}
            style={zone.borderPulse ? { borderColor: zone.key === "risk" ? "hsl(25 95% 53% / 0.3)" : "hsl(0 84% 60% / 0.3)" } : undefined}
            onClick={() => onClientClick?.(client)}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className={cn("text-xs font-semibold", zone.avatarBg)}>
                  {client.avatar_initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{fullName}</p>
                <p className="text-xs text-muted-foreground">{client.days_inactive} {daysAgoLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", zone.progressColor)} style={{ width: `${engagement}%` }} />
              </div>
              <span className="text-[10px] text-muted-foreground w-7 text-right">{engagement}%</span>
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          <div className="space-y-1 text-xs">
            <p className="font-semibold">{fullName}</p>
            <p>{tooltip.visits}</p>
            <p>{tooltip.spent}</p>
            <p className="text-muted-foreground">{tooltip.services}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function CircularProgress({ value, size = 56 }: { value: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeLinecap="round"
        strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central" className="fill-foreground text-xs font-bold" transform={`rotate(90, ${size / 2}, ${size / 2})`}>
        {value}%
      </text>
    </svg>
  );
}

export function RetentionHealthBoard({ clients, compact = false, onClientClick }: RetentionHealthBoardProps) {
  const { t } = useTranslation();
  const classified = classifyClients(clients);
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<ZoneKey>("active");
  const retentionRate = 73;
  const totalClients = clients.length;

  const ZONES: (ZoneConfig & { label: string; emoji: string })[] = [
    { key: "active", label: t('retention.zones.active'), emoji: "💚", color: "text-emerald-600", bgGradient: "from-emerald-500/20 to-emerald-500/5", borderPulse: false, avatarBg: "bg-emerald-100 text-emerald-700", progressColor: "bg-emerald-500" },
    { key: "attention", label: t('retention.zones.attention'), emoji: "🟡", color: "text-amber-600", bgGradient: "from-amber-500/20 to-amber-500/5", borderPulse: false, avatarBg: "bg-amber-100 text-amber-700", progressColor: "bg-amber-500" },
    { key: "risk", label: t('retention.zones.risk'), emoji: "🟠", color: "text-orange-600", bgGradient: "from-orange-500/20 to-orange-500/5", borderPulse: true, avatarBg: "bg-orange-100 text-orange-700", progressColor: "bg-orange-500" },
    { key: "lost", label: t('retention.zones.lost'), emoji: "🔴", color: "text-rose-600", bgGradient: "from-rose-500/20 to-rose-500/5", borderPulse: true, avatarBg: "bg-rose-100 text-rose-700", progressColor: "bg-rose-500" },
  ];

  const renderZoneColumn = (zone: typeof ZONES[number]) => {
    const zoneClients = classified[zone.key];
    return (
      <div key={zone.key} className="flex flex-col gap-2">
        <div className={cn("h-1.5 rounded-full bg-gradient-to-r", zone.bgGradient)} />
        <div className="flex items-center justify-between px-1">
          <span className={cn("text-sm font-semibold", zone.color)}>{zone.emoji} {zone.label}</span>
          <Badge variant="secondary" className="text-xs h-5">{zoneClients.length}</Badge>
        </div>
        <div className="space-y-2 min-h-[100px]">
          {zoneClients.map(c => (
            <ClientCard key={c.id} client={c} zone={zone} onClientClick={onClientClick} daysAgoLabel={t('retention.daysAgo')} />
          ))}
          {zoneClients.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-6 border border-dashed rounded-lg">
              {t('retention.noClients')}
            </div>
          )}
        </div>
        {zone.key === "lost" && zoneClients.length > 0 && (
          <Button variant="outline" size="sm" className="w-full gap-1.5 mt-1 opacity-50 cursor-not-allowed" disabled>
            <Mail className="w-3.5 h-3.5" />
            {t('retention.sendWinback')}
          </Button>
        )}
      </div>
    );
  };

  if (compact) {
    const counts = ZONES.map(z => ({ ...z, count: classified[z.key].length }));
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">📊 {t('retention.clientRetention')}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
              <TrendingUp className="w-4 h-4" />
              {retentionRate}% <span className="text-xs text-muted-foreground">{t('retention.vsPreviousMonth')}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {counts.map(z => (
              <div key={z.key} className="text-center">
                <div className={cn("h-1 rounded-full bg-gradient-to-r mb-2", z.bgGradient)} />
                <p className="text-lg font-bold">{z.count}</p>
                <p className="text-xs text-muted-foreground">{z.emoji} {z.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <CircularProgress value={retentionRate} />
            <div>
              <CardTitle className="text-lg">{t('retention.clientRetention')}</CardTitle>
              <div className="flex items-center gap-1.5 mt-0.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-emerald-600 font-medium">{t('retention.vsPreviousMonth')}</span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">{totalClients} {t('retention.clientsTotal')}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isMobile ? (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ZoneKey)}>
            <TabsList className="w-full grid grid-cols-4">
              {ZONES.map(z => (
                <TabsTrigger key={z.key} value={z.key} className="text-xs gap-1">{z.emoji} {classified[z.key].length}</TabsTrigger>
              ))}
            </TabsList>
            {ZONES.map(z => (
              <TabsContent key={z.key} value={z.key} className="mt-3">{renderZoneColumn(z)}</TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="grid grid-cols-4 gap-4">{ZONES.map(z => renderZoneColumn(z))}</div>
        )}
      </CardContent>
    </Card>
  );
}

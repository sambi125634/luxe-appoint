import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { type RetentionRadarClient, type RiskZone, RISK_ZONE_CONFIG } from "./types";

interface RetentionRadarProps {
  clients: RetentionRadarClient[];
  onClientClick?: (client: RetentionRadarClient) => void;
  compact?: boolean;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h % 10000) / 10000;
}

const ZONE_ORDER: RiskZone[] = ["green", "yellow", "orange", "red"];

const ZONE_FILLS: Record<RiskZone, string> = {
  green: "rgba(34,197,94,0.08)", yellow: "rgba(234,179,8,0.06)",
  orange: "rgba(249,115,22,0.06)", red: "rgba(239,68,68,0.05)",
};

export function RetentionRadar({ clients, onClientClick, compact = false }: RetentionRadarProps) {
  const { t } = useTranslation();
  const canvasSize = compact ? 264 : 384;
  const maxRadius = canvasSize / 2 - 24;

  const ZONE_LABELS: Record<RiskZone, string> = {
    green: t('retention.zones.active'), yellow: t('retention.zones.attention'),
    orange: t('retention.zones.risk'), red: t('retention.zones.lost'),
  };

  const grouped = ZONE_ORDER.map((zone) => ({ zone, clients: clients.filter((c) => c.risk_zone === zone) }));
  const ringBands = ZONE_ORDER.map((_, i) => ({ rMin: (i / 4) * maxRadius, rMax: ((i + 1) / 4) * maxRadius }));
  const ringSizes = ZONE_ORDER.map((_, i) => ((i + 1) / 4) * maxRadius * 2);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          {t('retention.radarTitle')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {clients.length} {t('retention.monitored')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative mx-auto overflow-hidden" style={{ width: canvasSize, height: canvasSize }}>
          {[...ZONE_ORDER].reverse().map((zone, revIdx) => {
            const i = 3 - revIdx;
            const size = ringSizes[i];
            return (
              <motion.div
                key={zone}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: revIdx * 0.08, duration: 0.4, ease: "easeOut" }}
                className={cn(
                  "absolute rounded-full border border-dashed",
                  zone === "green" && "border-green-500/40",
                  zone === "yellow" && "border-yellow-500/40",
                  zone === "orange" && "border-orange-500/40",
                  zone === "red" && "border-red-500/40",
                )}
                style={{
                  width: size, height: size, left: "50%", top: "50%",
                  transform: "translate(-50%, -50%)", backgroundColor: ZONE_FILLS[zone],
                }}
              />
            );
          })}

          {ZONE_ORDER.map((zone, i) => {
            const r = ringBands[i].rMax;
            return (
              <div key={`label-${zone}`} className="absolute text-[9px] font-medium tracking-wide pointer-events-none"
                style={{ left: "50%", top: `calc(50% - ${r}px + 2px)`, transform: "translateX(-50%)", color: RISK_ZONE_CONFIG[zone].color, opacity: 0.7 }}>
                {ZONE_LABELS[zone]}
              </div>
            );
          })}

          <motion.div
            animate={{ opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute rounded-full pointer-events-none"
            style={{ width: ringSizes[3] + 8, height: ringSizes[3] + 8, left: "50%", top: "50%", transform: "translate(-50%, -50%)", boxShadow: "0 0 20px 4px rgba(239,68,68,0.2)" }}
          />

          <TooltipProvider delayDuration={200}>
            {grouped.map(({ zone, clients: zoneClients }, zoneIdx) =>
              zoneClients.map((client, localIdx) => {
                const config = RISK_ZONE_CONFIG[zone];
                const { rMin, rMax } = ringBands[zoneIdx];
                const count = zoneClients.length;
                const baseAngle = count > 0 ? (localIdx / count) * 2 * Math.PI : 0;
                const jitter = (hashStr(client.id) - 0.5) * 0.4;
                const angle = baseAngle + jitter + zoneIdx * 0.7;
                const bubbleSize = compact ? 28 : 34;
                const half = bubbleSize / 2;
                const tRadius = count > 1 ? localIdx / (count - 1) : 0.5;
                const rJitter = (hashStr(client.id + "r") - 0.5) * (rMax - rMin) * 0.3;
                const r = Math.max(rMin + half, Math.min(rMax - half, rMin + tRadius * (rMax - rMin) + rJitter));
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;
                const isRed = zone === "red";

                return (
                  <Tooltip key={client.id}>
                    <TooltipTrigger asChild>
                      <motion.button
                        onClick={() => onClientClick?.(client)}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={isRed ? { opacity: 1, scale: [1, 1.12, 1], transition: { opacity: { duration: 0.3, delay: localIdx * 0.03 }, scale: { duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: localIdx * 0.15 } } } : { opacity: 1, scale: 1, transition: { duration: 0.4, delay: 0.2 + localIdx * 0.04, ease: "easeOut" } }}
                        whileHover={{ scale: 1.3, zIndex: 10 }}
                        className={cn("absolute rounded-full flex items-center justify-center text-[10px] font-bold cursor-pointer border-2 border-background shadow-sm", config.bgClass, config.textClass)}
                        style={{ width: bubbleSize, height: bubbleSize, left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: "translate(-50%, -50%)" }}
                      >
                        {client.avatar_initials}
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="space-y-1">
                        <p className="font-semibold">{client.first_name} {client.last_name}</p>
                        <p className="text-xs">{t('retention.inactive')}: <strong>{client.days_inactive} {t('retention.daysAgo')}</strong></p>
                        {client.last_service && <p className="text-xs">{t('retention.lastTreatment')}: {client.last_service}</p>}
                        {client.last_sequence_sent && <p className="text-xs">{t('retention.sentSequence')} {client.last_sequence_sent}</p>}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })
            )}
          </TooltipProvider>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.4 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 flex items-center justify-center rounded-full bg-background border border-border shadow-sm"
            style={{ width: compact ? 36 : 44, height: compact ? 36 : 44 }}
          >
            <Sparkles className="w-5 h-5 text-primary" />
          </motion.div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {ZONE_ORDER.map((zone) => {
            const count = clients.filter((c) => c.risk_zone === zone).length;
            return (
              <Badge key={zone} variant="outline" className={cn("gap-1", RISK_ZONE_CONFIG[zone].textClass)}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: RISK_ZONE_CONFIG[zone].color }} />
                {ZONE_LABELS[zone]}: {count}
              </Badge>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

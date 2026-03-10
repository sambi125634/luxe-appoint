import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { type RetentionRadarClient, type RiskZone, RISK_ZONE_CONFIG } from "./types";

interface RetentionRadarProps {
  clients: RetentionRadarClient[];
  onClientClick?: (client: RetentionRadarClient) => void;
  compact?: boolean;
}

export function RetentionRadar({ clients, onClientClick, compact = false }: RetentionRadarProps) {
  const zones: RiskZone[] = ["green", "yellow", "orange", "red"];
  const grouped = zones.map((zone) => ({
    zone,
    ...RISK_ZONE_CONFIG[zone],
    clients: clients.filter((c) => c.risk_zone === zone),
  }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          📡 Radar Retencji
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {clients.length} klientek monitorowanych
        </p>
      </CardHeader>
      <CardContent>
        {/* Zone rings */}
        <div className={cn("relative mx-auto", compact ? "w-64 h-64" : "w-80 h-80 md:w-96 md:h-96")}>
          {/* Concentric rings */}
          {zones.map((zone, i) => {
            const size = compact
              ? [240, 180, 120, 60][i]
              : [360, 270, 180, 90][i];
            return (
              <div
                key={zone}
                className={cn(
                  "absolute rounded-full border-2 border-dashed opacity-30",
                  zone === "green" && "border-green-500",
                  zone === "yellow" && "border-yellow-500",
                  zone === "orange" && "border-orange-500",
                  zone === "red" && "border-red-500",
                )}
                style={{
                  width: size,
                  height: size,
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
            );
          })}

          {/* Client bubbles */}
          <TooltipProvider delayDuration={200}>
            {clients.map((client, idx) => {
              const config = RISK_ZONE_CONFIG[client.risk_zone];
              const zoneIndex = zones.indexOf(client.risk_zone);
              // Position in the ring area
              const maxRadius = compact ? 110 : 170;
              const ringMin = zoneIndex * (maxRadius / 4);
              const ringMax = (zoneIndex + 1) * (maxRadius / 4);
              const r = ringMin + (ringMax - ringMin) * 0.5 + (idx % 3 - 1) * 8;
              const angle = (idx * 137.5 * Math.PI) / 180; // golden angle
              const x = Math.cos(angle) * r;
              const y = Math.sin(angle) * r;

              return (
                <Tooltip key={client.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onClientClick?.(client)}
                      className={cn(
                        "absolute rounded-full flex items-center justify-center text-[10px] font-bold transition-all hover:scale-125 hover:z-10 cursor-pointer border-2 border-background shadow-sm",
                        config.bgClass, config.textClass,
                        compact ? "w-7 h-7" : "w-9 h-9"
                      )}
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      {client.avatar_initials}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-semibold">{client.first_name} {client.last_name}</p>
                      <p className="text-xs">Nieaktywna: <strong>{client.days_inactive} dni</strong></p>
                      {client.last_service && (
                        <p className="text-xs">Ostatni zabieg: {client.last_service}</p>
                      )}
                      {client.last_sequence_sent && (
                        <p className="text-xs">Wysłano: sekwencja {client.last_sequence_sent}</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>

          {/* Center label */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-0">
            <div className="text-2xl font-bold font-serif">{clients.filter(c => c.risk_zone === "red").length}</div>
            <div className="text-xs text-muted-foreground">utraconych</div>
          </div>
        </div>

        {/* Zone legend */}
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {grouped.map(({ zone, label, clients: zClients }) => (
            <Badge key={zone} variant="outline" className={cn("gap-1", RISK_ZONE_CONFIG[zone].textClass)}>
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: RISK_ZONE_CONFIG[zone].color }}
              />
              {label}: {zClients.length}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

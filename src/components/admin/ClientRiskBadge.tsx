import { AlertTriangle, ShieldCheck, ShieldAlert, Info, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useClientRiskScore } from "@/hooks/useClientRiskScore";

interface ClientRiskBadgeProps {
  clientId: string;
  salonId?: string;
  showTooltip?: boolean;
  size?: "sm" | "md";
  compact?: boolean;
}

export function ClientRiskBadge({ clientId, salonId, showTooltip = true, size = "sm", compact = false }: ClientRiskBadgeProps) {
  const { data: riskData, isLoading } = useClientRiskScore(clientId, salonId || undefined);

  if (isLoading) {
    return <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />;
  }

  if (!riskData) return null;

  const { riskLevel, riskScore, mainReason, recommendations } = riskData;

  const config = {
    low: {
      icon: ShieldCheck,
      label: "Niskie ryzyko",
      className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
      iconClass: "text-emerald-500"
    },
    medium: {
      icon: Info,
      label: "Średnie ryzyko",
      className: "bg-amber-500/10 text-amber-600 border-amber-500/30",
      iconClass: "text-amber-500"
    },
    high: {
      icon: ShieldAlert,
      label: "Wysokie ryzyko",
      className: "bg-rose-500/10 text-rose-600 border-rose-500/30",
      iconClass: "text-rose-500"
    }
  };

  const { icon: Icon, label, className, iconClass } = config[riskLevel];

  const effectiveSize = compact ? "sm" : size;

  const badge = (
    <Badge 
      variant="outline" 
      className={cn(
        "gap-1 font-normal",
        className,
        effectiveSize === "sm" ? "text-xs px-1.5 py-0" : "text-sm px-2 py-0.5"
      )}
    >
      <Icon className={cn("w-3 h-3", iconClass)} />
      {effectiveSize === "md" && !compact && <span>{riskScore}</span>}
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {badge}
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon className={cn("w-4 h-4", iconClass)} />
            <span className="font-medium">{label} ({riskScore}/100)</span>
          </div>
          {mainReason && (
            <p className="text-xs text-muted-foreground">{mainReason}</p>
          )}
          {recommendations.length > 0 && (
            <div className="text-xs space-y-1 pt-1 border-t">
              <span className="font-medium">Zalecenia:</span>
              <ul className="list-disc pl-3 space-y-0.5">
                {recommendations.slice(0, 2).map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  UserCheck,
  Star,
  Bell,
  UserX,
  TrendingUp,
  Share2,
  FileText,
  X,
  Play,
} from "lucide-react";
import {
  type AutopilotAction,
  type AutopilotActionType,
  getActionStatusColor,
  getActionStatusLabel,
  getActionTypeLabel,
  MOCK_AUTOPILOT_STATS,
} from "@/lib/autopilot-engine";

interface AutopilotActionLogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: AutopilotAction[];
  isDemo?: boolean;
  onDismiss?: (id: string) => void;
  onExecute?: (id: string) => void;
}

const typeIcons: Record<AutopilotActionType, React.ReactNode> = {
  retention: <UserCheck className="w-4 h-4" />,
  review: <Star className="w-4 h-4" />,
  reminder: <Bell className="w-4 h-4" />,
  noshow: <UserX className="w-4 h-4" />,
  revenue_suggestion: <TrendingUp className="w-4 h-4" />,
  pixel_sync: <Share2 className="w-4 h-4" />,
  brief: <FileText className="w-4 h-4" />,
};

export function AutopilotActionLog({
  open,
  onOpenChange,
  actions,
  isDemo,
  onDismiss,
  onExecute,
}: AutopilotActionLogProps) {
  const stats = MOCK_AUTOPILOT_STATS;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 pb-3 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Bot className="w-5 h-5 text-primary" />
            Autopilot — Log akcji
          </SheetTitle>
        </SheetHeader>

        {/* Weekly stats summary */}
        <div className="grid grid-cols-4 gap-2 p-4 bg-muted/30 border-b border-border">
          <div className="text-center">
            <div className="text-lg font-bold">{stats.actions_taken}</div>
            <div className="text-[10px] text-muted-foreground leading-tight">Akcji w tym tyg.</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-600">{stats.revenue_recovered} zł</div>
            <div className="text-[10px] text-muted-foreground leading-tight">Odzyskano</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{stats.clients_reactivated}</div>
            <div className="text-[10px] text-muted-foreground leading-tight">Reaktywacje</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{stats.reviews_collected}</div>
            <div className="text-[10px] text-muted-foreground leading-tight">Opinie</div>
          </div>
        </div>

        {/* Actions list */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {actions.length === 0 && (
              <div className="text-center text-muted-foreground py-8 text-sm">
                Brak akcji do wyświetlenia
              </div>
            )}

            {actions.map((action) => (
              <div
                key={action.id}
                className="border border-border rounded-lg p-3 space-y-2 bg-card"
              >
                {/* Header: type + status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-primary">
                      {typeIcons[action.type as AutopilotActionType] || <Bot className="w-4 h-4" />}
                    </span>
                    <span className="font-medium text-sm">
                      {getActionTypeLabel(action.type as AutopilotActionType)}
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-1.5 py-0 ${getActionStatusColor(action.status as AutopilotAction["status"])}`}
                  >
                    {getActionStatusLabel(action.status as AutopilotAction["status"])}
                  </Badge>
                </div>

                {/* AI explanation — the heart of "Explain AI Decisions" */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {action.ai_explanation}
                </p>

                {/* Trigger info */}
                <p className="text-[11px] text-muted-foreground/70 italic">
                  Trigger: {action.triggered_by}
                </p>

                {/* CTA buttons */}
                <div className="flex items-center gap-2 pt-1">
                  {action.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        className="h-7 text-xs gap-1"
                        onClick={() => onExecute?.(action.id)}
                      >
                        <Play className="w-3 h-3" />
                        {action.cta_label || "Wykonaj"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs gap-1 text-muted-foreground"
                        onClick={() => onDismiss?.(action.id)}
                      >
                        <X className="w-3 h-3" />
                        Odrzuć
                      </Button>
                    </>
                  )}
                  {action.status === "sent" && action.cta_label && (
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      {action.cta_label}
                    </Button>
                  )}
                </div>

                {/* Timestamp */}
                <div className="text-[10px] text-muted-foreground/50">
                  {new Date(action.scheduled_at).toLocaleString("pl-PL", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {isDemo && (
          <div className="p-3 border-t border-border bg-muted/30 text-center">
            <p className="text-xs text-muted-foreground">
              🤖 To demo — w prawdziwym salonie akcje wykonują się automatycznie
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

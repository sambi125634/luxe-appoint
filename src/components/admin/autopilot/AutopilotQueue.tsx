import { Loader2, Play, X, Clock, Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAutopilotActions, useExecuteAction, useDismissAction } from "@/hooks/useAutopilot";

const TYPE_LABELS: Record<string, string> = {
  retention: "Reaktywacja",
  reminder: "Przypomnienie",
  review: "Opinia",
  noshow: "No-show",
  revenue_suggestion: "Sugestia",
  pixel_sync: "Pixel sync",
  brief: "Raport",
};

export function AutopilotQueue() {
  const { data: allActions, isLoading } = useAutopilotActions();
  const executeAction = useExecuteAction();
  const dismissAction = useDismissAction();

  const pending = (allActions ?? []).filter((a) => a.status === "pending");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (pending.length === 0) {
    return (
      <div className="text-center py-16 mt-4">
        <Bot className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground font-medium">Brak zaplanowanych akcji</p>
        <p className="text-sm text-muted-foreground mt-1">
          Autopilot zaplanuje nowe akcje na podstawie aktywności Twojego salonu
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-4">
      <p className="text-sm text-muted-foreground">
        {pending.length} {pending.length === 1 ? "akcja oczekuje" : "akcji oczekuje"} na wykonanie
      </p>

      {pending.map((action) => (
        <Card key={action.id} className="hover:shadow-md transition-shadow">
          <CardContent className="py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {TYPE_LABELS[action.type] ?? action.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(action.scheduled_at).toLocaleString("pl-PL", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm">{action.ai_explanation}</p>
                {action.cta_label && (
                  <p className="text-xs text-primary mt-1">CTA: {action.cta_label}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => executeAction.mutate(action.id)}
                  disabled={executeAction.isPending}
                  className="gap-1"
                >
                  <Play className="w-3 h-3" />
                  Wykonaj
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissAction.mutate(action.id)}
                  disabled={dismissAction.isPending}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

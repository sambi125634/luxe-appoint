import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { type RetentionSequence } from "./types";

interface SequenceConfigProps {
  sequences: RetentionSequence[];
  onToggle?: (sequenceKey: string, active: boolean) => void;
  onTemplateChange?: (sequenceKey: string, template: string) => void;
  readOnly?: boolean;
}

export function SequenceConfig({ sequences, onToggle, onTemplateChange, readOnly = false }: SequenceConfigProps) {
  const { t } = useTranslation();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const SEQUENCE_ICONS: Record<string, string> = {
    proactive: "🔮", "45day": "🌸", "60day": "📚", "75day": "🎁", "90day": "🚨",
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-primary" />
          {t('retention.sequenceConfig')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('retention.sequenceConfigDesc')}
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {sequences.map((seq) => {
          const seqKey = seq.sequence_key as string;
          const label = t(`retention.sequences.${seqKey}.label`, seqKey);
          const description = t(`retention.sequences.${seqKey}.description`, '');
          const icon = SEQUENCE_ICONS[seqKey] || "📋";
          const isExpanded = expandedKey === seqKey;

          return (
            <Collapsible
              key={seqKey}
              open={isExpanded}
              onOpenChange={() => setExpandedKey(isExpanded ? null : seqKey)}
            >
              <div className={cn(
                "rounded-xl border transition-colors",
                seq.is_active ? "border-primary/20 bg-primary/5" : "border-border"
              )}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xl">{icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{label}</span>
                        {seq.trigger_days > 0 && (
                          <Badge variant="outline" className="text-xs">{seq.trigger_days} {t('retention.days')}</Badge>
                        )}
                        {seq.include_incentive && (
                          <Badge className="text-xs bg-amber-100 text-amber-800">+ incentive</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={seq.is_active}
                      onCheckedChange={(checked) => onToggle?.(seqKey, checked)}
                      disabled={readOnly}
                    />
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        {t('retention.messageTemplate')}
                      </label>
                      <Textarea
                        value={seq.message_template}
                        onChange={(e) => onTemplateChange?.(seqKey, e.target.value)}
                        rows={3}
                        readOnly={readOnly}
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('retention.availableVars')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{t('retention.tone')}: <strong className="text-foreground">{seq.tone}</strong></span>
                      {seq.countdown_hours && (
                        <span>{t('retention.countdown')}: <strong className="text-foreground">{seq.countdown_hours}h</strong></span>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </CardContent>
    </Card>
  );
}

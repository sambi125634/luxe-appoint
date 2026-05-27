import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Route, Sparkles, Save } from "lucide-react";
import {
  STAGE_DEFINITIONS,
  usePipelineSequences,
  useUpsertPipelineSequence,
  type SequenceVariant,
  type SequenceStage,
  type SequenceChannel,
  type PipelineSequence,
} from "@/hooks/usePipelineSequences";

function StageRow({ variant, stage, label, description, defaultDelay, defaultBody, existing }: {
  variant: SequenceVariant;
  stage: SequenceStage;
  label: string;
  description: string;
  defaultDelay: number;
  defaultBody: string;
  existing?: PipelineSequence;
}) {
  const upsert = useUpsertPipelineSequence();
  const [isActive, setIsActive] = useState(existing?.is_active ?? false);
  const [delay, setDelay] = useState(existing?.delay_hours ?? defaultDelay);
  const [channel, setChannel] = useState<SequenceChannel>(existing?.channel ?? "sms");
  const [body, setBody] = useState(existing?.body ?? defaultBody);

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">{label}</Badge>
            {variant === "ads" && <Badge className="bg-violet-600 text-[10px]">Ads</Badge>}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <Switch checked={isActive} onCheckedChange={setIsActive} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Opóźnienie (godz., minus = przed)</Label>
          <Input type="number" value={delay} onChange={(e) => setDelay(Number(e.target.value))} />
        </div>
        <div>
          <Label className="text-xs">Kanał</Label>
          <Select value={channel} onValueChange={(v) => setChannel(v as SequenceChannel)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="push">Push</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label className="text-xs">Treść (merge tags: {"{first_name} {salon} {time} {booking_link}"})</Label>
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} />
      </div>
      <div className="flex justify-end">
        <Button
          size="sm"
          className="gap-1"
          disabled={upsert.isPending}
          onClick={() => upsert.mutate({
            id: existing?.id,
            variant,
            stage,
            delay_hours: delay,
            channel,
            body,
            is_active: isActive,
            tag_filter: variant === "ads" ? "ads" : null,
          })}
        >
          <Save className="w-3.5 h-3.5" /> Zapisz
        </Button>
      </div>
    </div>
  );
}

function VariantPanel({ variant }: { variant: SequenceVariant }) {
  const { data: sequences = [], isLoading } = usePipelineSequences(variant);
  const byStage = new Map(sequences.map((s) => [s.stage, s]));

  if (isLoading) return <div className="text-sm text-muted-foreground">Ładowanie…</div>;

  return (
    <div className="space-y-3">
      {STAGE_DEFINITIONS.map((def) => (
        <StageRow
          key={def.stage}
          variant={variant}
          stage={def.stage}
          label={def.label}
          description={def.description}
          defaultDelay={def.defaultDelay}
          defaultBody={def.defaultBody}
          existing={byStage.get(def.stage)}
        />
      ))}
    </div>
  );
}

export function ClientJourneySequenceEditor() {
  const [adsEnabled, setAdsEnabled] = useState(false);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
              <Route className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <CardTitle className="text-base">Ścieżka Klientki 1 → 5</CardTitle>
              <p className="text-xs text-muted-foreground">Sekwencja wiadomości na każdym etapie pipeline'u</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            <Label htmlFor="ads-variant" className="text-xs">Wariant dla tagu „ads"</Label>
            <Switch id="ads-variant" checked={adsEnabled} onCheckedChange={setAdsEnabled} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {adsEnabled ? (
          <Tabs defaultValue="default">
            <TabsList>
              <TabsTrigger value="default">Standard</TabsTrigger>
              <TabsTrigger value="ads">Reklamy (tag: ads)</TabsTrigger>
            </TabsList>
            <TabsContent value="default" className="mt-4"><VariantPanel variant="default" /></TabsContent>
            <TabsContent value="ads" className="mt-4"><VariantPanel variant="ads" /></TabsContent>
          </Tabs>
        ) : (
          <VariantPanel variant="default" />
        )}
      </CardContent>
    </Card>
  );
}

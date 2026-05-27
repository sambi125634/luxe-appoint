import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Star, Users, Send, ExternalLink, Info } from "lucide-react";
import {
  useReferralConfig,
  useUpdateReferralConfig,
  type ReferralProgramConfig,
} from "@/hooks/useReferralConfig";

interface ReferralSettingsProps {
  isDemo?: boolean;
}

export function ReferralSettings({ isDemo }: ReferralSettingsProps) {
  const { data: config, isLoading } = useReferralConfig(isDemo);
  const updateConfig = useUpdateReferralConfig(isDemo);
  const [draft, setDraft] = useState<Partial<ReferralProgramConfig>>({});

  useEffect(() => {
    if (config) setDraft(config);
  }, [config]);

  const value: ReferralProgramConfig | null = config ? ({ ...config, ...draft } as ReferralProgramConfig) : null;
  const setField = <K extends keyof ReferralProgramConfig>(key: K, v: ReferralProgramConfig[K]) =>
    setDraft((d) => ({ ...d, [key]: v }));

  const isDirty =
    !!config &&
    (Object.keys(draft) as Array<keyof ReferralProgramConfig>).some((k) => draft[k] !== config[k]);

  const handleSave = () => {
    if (!config) return;
    const patch: Partial<ReferralProgramConfig> = {};
    (Object.keys(draft) as Array<keyof ReferralProgramConfig>).forEach((k) => {
      if (draft[k] !== config[k]) (patch as Record<string, unknown>)[k] = draft[k];
    });
    if (Object.keys(patch).length === 0) return;
    updateConfig.mutate(patch);
  };

  if (isLoading || !value) {
    return <div className="p-8 text-center text-muted-foreground text-sm">Wczytywanie konfiguracji…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Program poleceń */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" />
            Program poleceń
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Aktywny program poleceń</p>
              <p className="text-xs text-muted-foreground">Klientki automatycznie otrzymują linki polecające</p>
            </div>
            <Switch checked={value.is_active} onCheckedChange={(v) => setField("is_active", v)} />
          </div>

          <div>
            <Label className="text-xs">Aktywuj link po X wizytach</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input type="number" value={value.activate_after_visits} onChange={e => setField("activate_after_visits", Math.min(20, Math.max(1, Number(e.target.value) || 1)))} className="w-20" min={1} max={20} />
              <span className="text-sm text-muted-foreground">wizytach klientki</span>
              <div className="flex gap-1 ml-2">
                {[3, 5, 10].map((preset) => (
                  <Button
                    key={preset}
                    size="sm"
                    variant={value.activate_after_visits === preset ? "default" : "outline"}
                    className="h-7 px-2 text-xs"
                    onClick={() => setField("activate_after_visits", preset)}
                  >
                    {preset}
                  </Button>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Po tylu zakończonych wizytach system automatycznie wygeneruje link polecający i wyśle go klientce.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Kanał wysyłki linku</Label>
              <Select value={value.referral_message_channel} onValueChange={(v) => setField("referral_message_channel", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">📱 SMS</SelectItem>
                  <SelectItem value="email">📧 Email</SelectItem>
                  <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Ważność kodu (dni)</Label>
              <Input
                type="number"
                value={value.code_validity_days}
                onChange={(e) => setField("code_validity_days", Math.max(1, Number(e.target.value) || 1))}
                className="mt-1"
                min={1}
                max={365}
              />
            </div>
            <div>
              <Label className="text-xs">Przypomnienie po X dniach</Label>
              <Input
                type="number"
                value={value.reminder_after_days}
                onChange={(e) => setField("reminder_after_days", Math.max(0, Number(e.target.value) || 0))}
                className="mt-1"
                min={0}
                max={90}
              />
              <p className="text-[11px] text-muted-foreground mt-1">0 = brak przypomnienia</p>
            </div>
            <div>
              <Label className="text-xs">Limit poleceń na klientkę</Label>
              <Input
                type="number"
                value={value.max_referrals_per_client ?? ""}
                placeholder="bez limitu"
                onChange={(e) => {
                  const v = e.target.value;
                  setField("max_referrals_per_client", v === "" ? null : Math.max(1, Number(v) || 1));
                }}
                className="mt-1"
                min={1}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Linki do opinii */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            Linki do opinii
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs">Link do opinii Google</Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="https://search.google.com/local/writereview?placeid=..."
                value={value.google_review_url ?? ""}
                onChange={e => setField("google_review_url", e.target.value)}
                className="flex-1"
              />
              {value.google_review_url && (
                <Button variant="outline" size="sm" onClick={() => window.open(value.google_review_url!, "_blank")}>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>

          <div>
            <Label className="text-xs">Link do opinii Facebook (opcjonalnie)</Label>
            <Input
              placeholder="https://facebook.com/twojsalon/reviews"
              value={value.facebook_review_url ?? ""}
              onChange={e => setField("facebook_review_url", e.target.value)}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Automatyczne prośby o opinię */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="w-4 h-4" />
            Automatyczne prośby o opinię
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Automatycznie wysyłaj prośby</p>
              <p className="text-xs text-muted-foreground">System wyśle prośbę o opinię po każdej wizycie klientki z NPS 9-10</p>
            </div>
            <Switch checked={value.auto_send_review_request} onCheckedChange={(v) => setField("auto_send_review_request", v)} />
          </div>

          {value.auto_send_review_request && (
            <>
              <div>
                <Label className="text-xs">Opóźnienie wysyłki</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input type="number" value={value.review_request_delay_hours} onChange={e => setField("review_request_delay_hours", Math.min(72, Math.max(1, Number(e.target.value) || 1)))} className="w-20" min={1} max={72} />
                  <span className="text-sm text-muted-foreground">godzin po wizycie</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Zalecamy 2-4 godziny — klientka pamięta wizytę ale nie jest już „w biegu".
                </p>
              </div>

              <div>
                <Label className="text-xs">Kanał wysyłki</Label>
                <Select value={value.review_request_channel} onValueChange={(v) => setField("review_request_channel", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">📱 SMS</SelectItem>
                    <SelectItem value="email">📧 Email</SelectItem>
                    <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>
              Prośby są wysyłane wyłącznie do klientek z NPS 9-10 — tych które naprawdę lubią Twój salon.
              Dzięki temu unikasz negatywnych opinii.
            </span>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={!isDirty || updateConfig.isPending} className="w-full gap-2">
        <Settings className="w-4 h-4" />
        {updateConfig.isPending ? "Zapisywanie…" : isDirty ? "Zapisz ustawienia" : "Brak zmian"}
      </Button>
    </div>
  );
}
